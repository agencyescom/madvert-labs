import { getAttribution } from "@/lib/attribution";

export type SubmitResult = { ok: boolean; error?: string; fields?: Record<string, string[]>; [k: string]: unknown };

export async function postJson(url: string, body: Record<string, unknown>): Promise<SubmitResult> {
  try {
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...body, attribution: getAttribution() }),
    });
    const data = (await res.json().catch(() => ({}))) as SubmitResult;
    if (!res.ok) return { ok: false, error: data.error ?? "Something went wrong. Please try again.", fields: data.fields, code: data.code };
    return { ...data, ok: true };
  } catch {
    return { ok: false, error: "Network error. Please check your connection and try again." };
  }
}

export async function postMultipart(url: string, body: Record<string, unknown>, file?: File | null): Promise<SubmitResult> {
  const fd = new FormData();
  fd.set("payload", JSON.stringify({ ...body, attribution: getAttribution() }));
  if (file) fd.set("file", file);
  try {
    const res = await fetch(url, { method: "POST", body: fd });
    const data = (await res.json().catch(() => ({}))) as SubmitResult;
    if (!res.ok) return { ok: false, error: data.error ?? "Something went wrong. Please try again.", fields: data.fields };
    return { ...data, ok: true };
  } catch {
    return { ok: false, error: "Network error. Please check your connection and try again." };
  }
}
