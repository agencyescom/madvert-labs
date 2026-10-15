"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import type { ClientState } from "@/onboarding/server/views";
import { computeProgress, missingItems, type ProgressInput } from "@/onboarding/progress";
import { ASSET_CATEGORY_BY_KEY } from "@/onboarding/template/assets";
import type { AnswerValue } from "@/onboarding/types";

export type PortalMode = { kind: "client"; token: string } | { kind: "delegate"; token: string; task: { id: string; taskKey: string; taskLabel: string; message?: string; name: string; status: string } };

type SaveState = "idle" | "saving" | "saved" | "error" | "offline";
type Answers = Record<string, Record<string, AnswerValue>>;

interface PortalCtx {
  state: ClientState;
  mode: PortalMode;
  answers: Answers;
  setAnswer: (section: string, key: string, value: AnswerValue) => void;
  saveState: SaveState;
  flush: () => Promise<void>;
  call: <T = Record<string, unknown>>(action: string, payload?: unknown) => Promise<T & { ok?: boolean; error?: string }>;
  upload: (form: FormData, onProgress?: (p: number) => void) => Promise<{ ok?: boolean; error?: string }>;
  progress: ReturnType<typeof computeProgress>;
  missing: ReturnType<typeof missingItems>;
  authHeader: Record<string, string>;
}

const Ctx = createContext<PortalCtx | null>(null);
export const usePortal = () => {
  const c = useContext(Ctx);
  if (!c) throw new Error("usePortal outside provider");
  return c;
};

export function progressInputFrom(state: ClientState, answers: Answers): ProgressInput {
  const assetCounts: Record<string, number> = {};
  for (const a of state.assets) {
    const s = ASSET_CATEGORY_BY_KEY[a.category]?.section ?? "other";
    assetCounts[s] = (assetCounts[s] ?? 0) + 1;
  }
  const o = state.offer;
  const answered = Object.values(o.values).filter((v) => (Array.isArray(v) ? v.length : v !== "" && v != null)).length;
  return {
    template: state.template,
    answers,
    access: Object.fromEntries(Object.entries(state.access).map(([k, v]) => [k, { status: v.status, details: v.details }])),
    assetCounts,
    socialProfiles: state.social.length,
    offerStatus: o.status as ProgressInput["offerStatus"],
    offerAnswered: answered + o.bonuses.length + o.guarantees.length + o.objections.length + o.competitors.length,
    kickoffBooked: state.booking?.status === "booked",
  };
}

export function PortalProvider({ initial, mode, children }: { initial: ClientState; mode: PortalMode; children: ReactNode }) {
  const [state, setState] = useState(initial);
  const [answers, setAnswers] = useState<Answers>(initial.answers);
  const [saveState, setSaveState] = useState<SaveState>("idle");
  const dirty = useRef<Record<string, Record<string, AnswerValue>>>({});
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const draftKey = `mv-onb-draft:${initial.onboarding.id}`;
  const authHeader = useMemo<Record<string, string>>(() => (mode.kind === "client" ? { "x-onboarding-token": mode.token } : { "x-delegate-token": mode.token }) as Record<string, string>, [mode]);

  const call = useCallback(
    async <T,>(action: string, payload?: unknown) => {
      const res = await fetch(`/api/onboarding/portal/${action}`, {
        method: "POST",
        headers: { "Content-Type": "application/json", ...authHeader },
        body: JSON.stringify(payload ?? {}),
      });
      const data = (await res.json().catch(() => ({ error: "Network error" }))) as T & { ok?: boolean; error?: string; state?: ClientState };
      if (data.state) setState(data.state);
      if (!res.ok && !data.error) (data as { error?: string }).error = "Something went wrong";
      return data;
    },
    [authHeader],
  );

  const upload = useCallback(
    (form: FormData, onProgress?: (p: number) => void) =>
      new Promise<{ ok?: boolean; error?: string }>((resolve) => {
        const xhr = new XMLHttpRequest();
        xhr.open("POST", "/api/onboarding/portal/assets");
        Object.entries(authHeader).forEach(([k, v]) => xhr.setRequestHeader(k, v));
        xhr.upload.onprogress = (e) => e.lengthComputable && onProgress?.(Math.round((e.loaded / e.total) * 100));
        xhr.onload = () => {
          let data: { ok?: boolean; error?: string; state?: ClientState } = {};
          try {
            data = JSON.parse(xhr.responseText);
          } catch {
            data = { error: "Upload failed" };
          }
          if (data.state) setState(data.state);
          resolve(xhr.status < 300 ? data : { error: data.error ?? "Upload failed" });
        };
        xhr.onerror = () => resolve({ error: "Network error. Check your connection and try again." });
        xhr.send(form);
      }),
    [authHeader],
  );

  const flushRef = useRef<() => Promise<void>>(async () => {});
  const flush = useCallback(async () => {
    if (timer.current) clearTimeout(timer.current);
    const batch = dirty.current;
    dirty.current = {};
    const keys = Object.keys(batch);
    if (!keys.length) return;
    setSaveState("saving");
    let failed = false;
    for (const sectionKey of keys) {
      const isOffer = sectionKey.startsWith("offer.");
      const res = await call(isOffer ? "offer" : "answers", isOffer ? { sectionKey, values: batch[sectionKey] } : { sectionKey, values: batch[sectionKey] }).catch(() => ({ error: "offline" }));
      if (res.error) {
        failed = true;
        dirty.current[sectionKey] = { ...batch[sectionKey], ...(dirty.current[sectionKey] ?? {}) };
      }
    }
    try {
      if (Object.keys(dirty.current).length) localStorage.setItem(draftKey, JSON.stringify(dirty.current));
      else localStorage.removeItem(draftKey);
    } catch {}
    if (failed) {
      setSaveState(typeof navigator !== "undefined" && !navigator.onLine ? "offline" : "error");
      timer.current = setTimeout(() => void flushRef.current(), 5000);
    } else setSaveState("saved");
  }, [call, draftKey]);
  useEffect(() => {
    flushRef.current = flush;
  }, [flush]);

  const setAnswer = useCallback(
    (section: string, key: string, value: AnswerValue) => {
      setAnswers((a) => ({ ...a, [section]: { ...(a[section] ?? {}), [key]: value } }));
      if (section.startsWith("offer.")) {
        setState((s) => ({ ...s, offer: { ...s.offer, values: { ...s.offer.values, [key]: value } } }));
      }
      dirty.current[section] = { ...(dirty.current[section] ?? {}), [key]: value };
      try {
        localStorage.setItem(draftKey, JSON.stringify(dirty.current));
      } catch {}
      setSaveState("saving");
      if (timer.current) clearTimeout(timer.current);
      timer.current = setTimeout(() => void flush(), 800);
    },
    [flush, draftKey],
  );

  // Recover unsaved answers from this device (e.g. the tab closed while offline).
  useEffect(() => {
    try {
      const raw = localStorage.getItem(draftKey);
      if (!raw) return;
      const draft = JSON.parse(raw) as Answers;
      // Unsaved answers live in this browser's storage only, so they are restored after mount.
      // eslint-disable-next-line react-hooks/set-state-in-effect
      for (const [s, vals] of Object.entries(draft)) for (const [k, v] of Object.entries(vals)) setAnswer(s, k, v);
    } catch {}
    const onOnline = () => void flush();
    const onHide = () => document.visibilityState === "hidden" && void flush();
    window.addEventListener("online", onOnline);
    document.addEventListener("visibilitychange", onHide);
    return () => {
      window.removeEventListener("online", onOnline);
      document.removeEventListener("visibilitychange", onHide);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Offer answers live in state.offer.values; business/asset answers in `answers`.
  const merged = useMemo(() => ({ ...state.answers, ...answers }), [state.answers, answers]);
  const input = useMemo(() => progressInputFrom(state, merged), [state, merged]);
  const progress = useMemo(() => computeProgress(input), [input]);
  const missing = useMemo(() => missingItems(input), [input]);

  return (
    <Ctx.Provider value={{ state, mode, answers: merged, setAnswer, saveState, flush, call, upload, progress, missing, authHeader }}>{children}</Ctx.Provider>
  );
}
