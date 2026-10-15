"use client";

import { useRef, useState } from "react";
import { ALLOWED_EXT, MAX_FILE_BYTES, type AssetSection } from "@/onboarding/template/assets";
import { Btn, Icon, fmtBytes } from "./kit";
import type { ClientState } from "@/onboarding/server/views";
import { usePortal } from "./store";

type Item = { id: string; name: string; progress: number; error?: string };
let seq = 0;

const kindOf = (mime?: string | null, name = "") =>
  mime?.startsWith("image/") ? "image" : mime?.startsWith("video/") ? "video" : /\.pdf$/i.test(name) ? "PDF" : /\.zip$/i.test(name) ? "ZIP" : (name.split(".").pop() ?? "FILE").toUpperCase().slice(0, 4);

export function Uploader({ section, single = false }: { section: AssetSection; single?: boolean }) {
  const { state, call, upload, authHeader } = usePortal();
  const [over, setOver] = useState(false);
  const [queue, setQueue] = useState<Item[]>([]);
  const [category, setCategory] = useState(section.categories[0].key);
  const [link, setLink] = useState("");
  const [linkErr, setLinkErr] = useState("");
  const [showLink, setShowLink] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);
  const camRef = useRef<HTMLInputElement>(null);
  const replaceRef = useRef<{ id: string } | null>(null);
  const files = state.assets.filter((a) => section.categories.some((c) => c.key === a.category));
  const mode = state.upload.mode;

  const sendOne = async (file: File, cat: string) => {
    const id = `${file.name}-${file.size}-${++seq}`;
    const setItem = (patch: Partial<Item>) => setQueue((q) => q.map((x) => (x.id === id ? { ...x, ...patch } : x)));
    setQueue((q) => [...q, { id, name: file.name, progress: 0 }]);
    if (file.size > MAX_FILE_BYTES) return setItem({ error: "Too large. Paste a cloud folder link instead." });
    if (!ALLOWED_EXT.test(file.name)) return setItem({ error: "File type not supported. Zip it or paste a link." });
    let res: { ok?: boolean; error?: string };
    if (mode === "vercel-blob") {
      try {
        const { upload: blobUpload } = await import("@vercel/blob/client");
        const folder = section.categories.find((c) => c.key === cat)?.folder ?? "07 Raw Assets";
        const safe = file.name.replace(/[^\w.\- ]+/g, "").replace(/\s+/g, "-") || "file";
        const blob = await blobUpload(`${state.upload.prefix}${folder}/${safe}`, file, {
          access: "private",
          handleUploadUrl: "/api/onboarding/portal/upload-token",
          clientPayload: JSON.stringify({ category: cat }),
          headers: authHeader,
          multipart: file.size > 20 * 1024 * 1024,
          onUploadProgress: (p) => setItem({ progress: Math.round(p.percentage) }),
        });
        res = await call("assets", { kind: "blob", category: cat, pathname: blob.pathname, name: file.name });
      } catch (e) {
        res = { error: e instanceof Error ? e.message : "Upload failed" };
      }
    } else {
      const form = new FormData();
      form.append("file", file);
      form.append("category", cat);
      res = await upload(form, (p) => setItem({ progress: p }));
    }
    if (res.error) setItem({ error: res.error });
    else setQueue((q) => q.filter((x) => x.id !== id));
    return res;
  };

  const handle = async (list: FileList | File[] | null) => {
    if (!list) return;
    const arr = Array.from(list);
    const rep = replaceRef.current;
    replaceRef.current = null;
    if (rep && arr[0]) {
      const old = files.find((f) => f.id === rep.id);
      const r = await sendOne(arr[0], old?.category ?? category);
      if (r && !r.error) await call("asset-delete", { id: rep.id });
      return;
    }
    for (const f of arr) await sendOne(f, category);
  };

  const addLink = async () => {
    setLinkErr("");
    const r = await call("assets", { kind: "link", category, url: link.trim() });
    if (r.error) setLinkErr(r.error);
    else {
      setLink("");
      setShowLink(false);
    }
  };

  const linkForm = () => (
      <div className="grid gap-2">
        <div className="flex flex-col gap-2 sm:flex-row">
          <input
            className="ob-input flex-1"
            inputMode="url"
            placeholder="Paste a Google Drive, Dropbox, OneDrive or folder link"
            value={link}
            onChange={(e) => setLink(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && link && addLink()}
            aria-label="Cloud link"
          />
          <Btn size="sm" icon="link" disabled={!link} onClick={addLink}>
            Add link
          </Btn>
        </div>
        {linkErr ? <p className="text-[13px] text-[var(--ob-danger)]">{linkErr}</p> : null}
      </div>
  );

  const fileList = () => {
    if (!files.length && !queue.length) return null;
    return (
      <ul className="grid gap-2.5">
        {queue.map((q) => (
          <li key={q.id} className="ob-file">
            <span className="ob-thumb">{q.error ? <Icon name="info" /> : `${q.progress}%`}</span>
            <span className="min-w-0 flex-1">
              <span className="block truncate text-[14px] font-medium">{q.name}</span>
              {q.error ? (
                <span className="block text-[12.5px] text-[var(--ob-danger)]">{q.error}</span>
              ) : (
                <span className="mt-2 block h-1.5 overflow-hidden rounded-full bg-[var(--ob-line)]">
                  <span className="block h-full rounded-full" style={{ width: `${q.progress}%`, background: "var(--ob-grad)" }} />
                </span>
              )}
            </span>
            {q.error ? (
              <button type="button" className="ob-icon-btn" aria-label="Dismiss" onClick={() => setQueue((x) => x.filter((i) => i.id !== q.id))}>
                <Icon name="x" />
              </button>
            ) : null}
          </li>
        ))}
        {files.map((f) => (
          <FileRow key={f.id} f={f} categories={section.categories} onReplace={() => ((replaceRef.current = { id: f.id }), fileRef.current?.click())} />
        ))}
      </ul>
    );
  };

  if (mode === "unconfigured")
    return (
      <div className="grid gap-3">
        <p className="ob-callout">
          <strong>Configuration required.</strong> Direct uploads are not enabled yet. Please paste a Google Drive, Dropbox, OneDrive or folder link instead.
        </p>
        {linkForm()}
        {fileList()}
      </div>
    );

  return (
    <div className="grid gap-4">
      {section.categories.length > 1 && !single ? (
        <label className="flex flex-wrap items-center gap-3 text-[14px] font-medium">
          These files are:
          <select className="ob-select !min-h-[40px] !w-auto !py-1.5" value={category} onChange={(e) => setCategory(e.target.value)}>
            {section.categories.map((c) => (
              <option key={c.key} value={c.key}>
                {c.label}
              </option>
            ))}
          </select>
        </label>
      ) : null}
      <div
        className="ob-drop"
        data-over={over}
        onDragOver={(e) => {
          e.preventDefault();
          setOver(true);
        }}
        onDragLeave={() => setOver(false)}
        onDrop={(e) => {
          e.preventDefault();
          setOver(false);
          void handle(e.dataTransfer.files);
        }}
      >
        <span className="cloud">
          <Icon name="upload" size={24} />
        </span>
        <p className="text-[15.5px] font-semibold">Drag and drop files here</p>
        <p className="text-[13px] text-[var(--ob-ink-3)]">Multiple files welcome · images, video, PDF, ZIP, fonts, documents · up to {Math.round(MAX_FILE_BYTES / 1024 / 1024)} MB each</p>
        <div className="mt-2 flex flex-wrap justify-center gap-2">
          <Btn size="sm" icon="upload" onClick={() => fileRef.current?.click()}>
            Upload Files
          </Btn>
          <Btn size="sm" variant="ghost" icon="camera" className="sm:hidden" onClick={() => camRef.current?.click()}>
            Camera
          </Btn>
          <Btn size="sm" variant="ghost" icon="link" onClick={() => setShowLink((s) => !s)}>
            Paste Drive / Dropbox / Folder Link
          </Btn>
        </div>
        <input ref={fileRef} type="file" multiple={!single} accept={section.accept} hidden onChange={(e) => (handle(e.target.files), (e.target.value = ""))} />
        <input ref={camRef} type="file" accept="image/*,video/*" capture="environment" hidden onChange={(e) => (handle(e.target.files), (e.target.value = ""))} />
      </div>
      {showLink ? linkForm() : null}
      {fileList()}
    </div>
  );
}

function FileRow({ f, categories, onReplace }: { f: ClientState["assets"][number]; categories: AssetSection["categories"]; onReplace: () => void }) {
    const { call } = usePortal();
    const [note, setNote] = useState(f.note);
    const k = kindOf(f.mimeType, f.name);
    return (
      <li className="ob-file flex-wrap sm:flex-nowrap">
        <span className="ob-thumb">
          {f.kind === "link" ? (
            <Icon name="link" />
          ) : k === "image" && f.previewUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={f.previewUrl} alt="" loading="lazy" />
          ) : k === "video" ? (
            <Icon name="play" />
          ) : (
            k
          )}
        </span>
        <span className="min-w-0 flex-1">
          {f.kind === "link" ? (
            <a href={f.url ?? "#"} target="_blank" rel="noopener noreferrer" className="block truncate text-[14px] font-medium text-[var(--ob-blue)]">
              {f.url}
            </a>
          ) : f.previewUrl ? (
            <a href={f.previewUrl} target="_blank" rel="noopener noreferrer" className="block truncate text-[14px] font-medium hover:text-[var(--ob-blue)]">
              {f.name}
            </a>
          ) : (
            <span className="block truncate text-[14px] font-medium">{f.name}</span>
          )}
          <span className="block text-[12px] text-[var(--ob-ink-3)]">
            {f.kind === "link" ? (f.linkProvider === "google_drive" ? "Google Drive" : f.linkProvider === "dropbox" ? "Dropbox" : f.linkProvider === "onedrive" ? "OneDrive" : "Link") : `${k === "image" ? "Image" : k === "video" ? "Video" : k} · ${fmtBytes(f.size)}`}
          </span>
          <input
            className="mt-1.5 w-full rounded-lg border border-transparent bg-transparent px-0 py-0.5 text-[12.5px] text-[var(--ob-ink-2)] outline-none focus:border-[var(--ob-line-2)] focus:px-2"
            placeholder="Add note…"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            onBlur={() => note !== f.note && call("asset-update", { id: f.id, note })}
            aria-label={`Note for ${f.name}`}
          />
        </span>
        {categories.length > 1 ? (
          <select className="ob-select !min-h-[36px] !w-auto !rounded-lg !py-1 !pl-3 !text-[13px]" value={f.category} onChange={(e) => call("asset-update", { id: f.id, category: e.target.value })} aria-label="Category">
            {categories.map((c) => (
              <option key={c.key} value={c.key}>
                {c.label}
              </option>
            ))}
          </select>
        ) : null}
        {f.kind === "file" ? (
          <button type="button" className="ob-icon-btn" aria-label={`Replace ${f.name}`} title="Replace" onClick={onReplace}>
            <Icon name="refresh" />
          </button>
        ) : null}
        <button type="button" className="ob-icon-btn hover:!text-[var(--ob-danger)]" aria-label={`Delete ${f.name}`} title="Delete" onClick={() => call("asset-delete", { id: f.id })}>
          <Icon name="trash" />
        </button>
      </li>
    );
  }

