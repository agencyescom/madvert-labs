/**
 * Google Calendar booking for the strategy call.
 *
 * Auth model: the calendar owner authorises once through /api/calendar/oauth/start (protected by
 * CALENDAR_SETUP_SECRET). The resulting refresh token is stored as GOOGLE_REFRESH_TOKEN. Visitors never
 * see calendar contents: only free/busy is read, and only computed free slots are returned.
 *
 * The calendar owner and settings are environment driven so a dedicated Madvert calendar can replace
 * or sit alongside the founder's calendar later without code changes.
 */

const TOKEN_URL = "https://oauth2.googleapis.com/token";
const API = "https://www.googleapis.com/calendar/v3";
export const CALENDAR_SCOPES = ["https://www.googleapis.com/auth/calendar.events", "https://www.googleapis.com/auth/calendar.freebusy"];

export type BusinessHours = Record<string, [string, string][]>; // "1": [["09:00","17:00"]]

export type CalendarConfig = {
  calendarId: string;
  ownerName: string;
  timezone: string;
  meetingMinutes: number;
  bufferBefore: number;
  bufferAfter: number;
  minNoticeHours: number;
  windowDays: number;
  hours: BusinessHours;
  slotStepMinutes: number;
};

function int(v: string | undefined, d: number) {
  const n = Number.parseInt(v ?? "", 10);
  return Number.isFinite(n) && n >= 0 ? n : d;
}

/** Returns the config, or the list of missing settings. Availability is never assumed. */
export function calendarConfig(): { ok: true; config: CalendarConfig } | { ok: false; missing: string[] } {
  const missing: string[] = [];
  for (const k of ["GOOGLE_CLIENT_ID", "GOOGLE_CLIENT_SECRET", "GOOGLE_REFRESH_TOKEN", "GOOGLE_CALENDAR_ID", "CALENDAR_TIMEZONE", "CALENDAR_BUSINESS_HOURS"]) {
    if (!process.env[k]) missing.push(k);
  }
  let hours: BusinessHours = {};
  if (process.env.CALENDAR_BUSINESS_HOURS) {
    try {
      hours = JSON.parse(process.env.CALENDAR_BUSINESS_HOURS) as BusinessHours;
    } catch {
      missing.push("CALENDAR_BUSINESS_HOURS (invalid JSON)");
    }
  }
  if (missing.length) return { ok: false, missing };
  const meeting = int(process.env.CALENDAR_MEETING_MINUTES, 30);
  return {
    ok: true,
    config: {
      calendarId: process.env.GOOGLE_CALENDAR_ID!,
      ownerName: process.env.CALENDAR_OWNER_NAME ?? "Madvert Labs",
      timezone: process.env.CALENDAR_TIMEZONE!,
      meetingMinutes: meeting,
      bufferBefore: int(process.env.CALENDAR_BUFFER_BEFORE_MINUTES, 15),
      bufferAfter: int(process.env.CALENDAR_BUFFER_AFTER_MINUTES, 15),
      minNoticeHours: int(process.env.CALENDAR_MIN_NOTICE_HOURS, 12),
      windowDays: Math.min(int(process.env.CALENDAR_BOOKING_WINDOW_DAYS, 21), 60),
      hours,
      slotStepMinutes: int(process.env.CALENDAR_SLOT_STEP_MINUTES, meeting),
    },
  };
}

/* ───────── OAuth ───────── */

export function oauthRedirectUri(origin: string) {
  return `${(process.env.NEXT_PUBLIC_SITE_URL ?? origin).replace(/\/$/, "")}/api/calendar/oauth/callback`;
}

export function authUrl(origin: string, state: string) {
  const p = new URLSearchParams({
    client_id: process.env.GOOGLE_CLIENT_ID ?? "",
    redirect_uri: oauthRedirectUri(origin),
    response_type: "code",
    access_type: "offline",
    prompt: "consent",
    include_granted_scopes: "true",
    scope: CALENDAR_SCOPES.join(" "),
    state,
    login_hint: process.env.GOOGLE_CALENDAR_ID ?? "",
  });
  return `https://accounts.google.com/o/oauth2/v2/auth?${p}`;
}

export async function exchangeCode(code: string, origin: string) {
  const res = await fetch(TOKEN_URL, {
    method: "POST",
    body: new URLSearchParams({
      code,
      client_id: process.env.GOOGLE_CLIENT_ID ?? "",
      client_secret: process.env.GOOGLE_CLIENT_SECRET ?? "",
      redirect_uri: oauthRedirectUri(origin),
      grant_type: "authorization_code",
    }),
    cache: "no-store",
  });
  if (!res.ok) throw new Error(`Token exchange failed (${res.status})`);
  return (await res.json()) as { refresh_token?: string; access_token: string; scope: string };
}

let cached: { token: string; exp: number } | null = null;

async function accessToken() {
  if (cached && cached.exp > Date.now() + 60_000) return cached.token;
  const res = await fetch(TOKEN_URL, {
    method: "POST",
    body: new URLSearchParams({
      client_id: process.env.GOOGLE_CLIENT_ID ?? "",
      client_secret: process.env.GOOGLE_CLIENT_SECRET ?? "",
      refresh_token: process.env.GOOGLE_REFRESH_TOKEN ?? "",
      grant_type: "refresh_token",
    }),
    cache: "no-store",
  });
  if (!res.ok) throw new Error(`Google token refresh failed (${res.status})`);
  const data = (await res.json()) as { access_token: string; expires_in: number };
  cached = { token: data.access_token, exp: Date.now() + data.expires_in * 1000 };
  return data.access_token;
}

async function gapi<T>(path: string, init: RequestInit = {}): Promise<T> {
  const token = await accessToken();
  const res = await fetch(`${API}${path}`, {
    ...init,
    headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json", ...(init.headers ?? {}) },
    cache: "no-store",
  });
  if (!res.ok) throw new Error(`Google Calendar ${path} failed (${res.status}): ${await res.text().catch(() => "")}`);
  return (await res.json()) as T;
}

/* ───────── Time zone helpers (no dependencies) ───────── */

function tzOffsetMs(date: Date, timeZone: string) {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone,
    hourCycle: "h23",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  }).formatToParts(date);
  const get = (t: string) => Number(parts.find((p) => p.type === t)?.value);
  const asUtc = Date.UTC(get("year"), get("month") - 1, get("day"), get("hour"), get("minute"), get("second"));
  return asUtc - date.getTime();
}

/** Wall clock time in a zone → UTC instant. Handles DST by re-checking the offset. */
export function zonedToUtc(ymd: string, hm: string, timeZone: string) {
  const [y, m, d] = ymd.split("-").map(Number);
  const [h, min] = hm.split(":").map(Number);
  const guess = Date.UTC(y, m - 1, d, h, min);
  let ts = guess - tzOffsetMs(new Date(guess), timeZone);
  const second = guess - tzOffsetMs(new Date(ts), timeZone);
  if (second !== ts) ts = second;
  return new Date(ts);
}

function ymdIn(date: Date, timeZone: string) {
  return new Intl.DateTimeFormat("en-CA", { timeZone, year: "numeric", month: "2-digit", day: "2-digit" }).format(date);
}

function weekdayIn(ymd: string) {
  const [y, m, d] = ymd.split("-").map(Number);
  return new Date(Date.UTC(y, m - 1, d)).getUTCDay();
}

function addDays(ymd: string, n: number) {
  const [y, m, d] = ymd.split("-").map(Number);
  const dt = new Date(Date.UTC(y, m - 1, d + n));
  return dt.toISOString().slice(0, 10);
}

/* ───────── Availability ───────── */

type Busy = { start: string; end: string }[];

async function freeBusy(calendarId: string, timeMin: Date, timeMax: Date): Promise<Busy> {
  const data = await gapi<{ calendars: Record<string, { busy: Busy; errors?: unknown[] }> }>("/freeBusy", {
    method: "POST",
    body: JSON.stringify({ timeMin: timeMin.toISOString(), timeMax: timeMax.toISOString(), items: [{ id: calendarId }] }),
  });
  const cal = data.calendars[calendarId];
  if (!cal || cal.errors?.length) throw new Error("Calendar not accessible with the stored authorisation");
  return cal.busy;
}

export type Slot = { start: string; end: string };

function overlaps(aStart: number, aEnd: number, busy: { s: number; e: number }[]) {
  return busy.some((b) => aStart < b.e && aEnd > b.s);
}

/** Real free slots only: business hours minus busy time (with buffers) minus minimum notice. */
export async function availableSlots(cfg: CalendarConfig, now = new Date()): Promise<Slot[]> {
  const earliest = now.getTime() + cfg.minNoticeHours * 3600_000;
  const startDay = ymdIn(now, cfg.timezone);
  const endDay = addDays(startDay, cfg.windowDays);
  const busy = (await freeBusy(cfg.calendarId, now, zonedToUtc(endDay, "23:59", cfg.timezone))).map((b) => ({
    s: Date.parse(b.start),
    e: Date.parse(b.end),
  }));
  const len = cfg.meetingMinutes * 60_000;
  const step = Math.max(cfg.slotStepMinutes, 15) * 60_000;
  const before = cfg.bufferBefore * 60_000;
  const after = cfg.bufferAfter * 60_000;
  const slots: Slot[] = [];
  for (let i = 0; i <= cfg.windowDays; i++) {
    const day = addDays(startDay, i);
    const ranges = cfg.hours[String(weekdayIn(day))] ?? [];
    for (const [from, to] of ranges) {
      const rStart = zonedToUtc(day, from, cfg.timezone).getTime();
      const rEnd = zonedToUtc(day, to, cfg.timezone).getTime();
      for (let t = rStart; t + len <= rEnd; t += step) {
        if (t < earliest) continue;
        if (overlaps(t - before, t + len + after, busy)) continue;
        slots.push({ start: new Date(t).toISOString(), end: new Date(t + len).toISOString() });
      }
    }
  }
  return slots;
}

export async function isSlotFree(cfg: CalendarConfig, startIso: string) {
  const s = Date.parse(startIso);
  const slots = await availableSlots(cfg);
  return slots.some((x) => Date.parse(x.start) === s);
}

export async function createBooking(
  cfg: CalendarConfig,
  input: { start: string; attendee: { name: string; email: string }; description: string; requestId: string },
) {
  const start = new Date(input.start);
  const end = new Date(start.getTime() + cfg.meetingMinutes * 60_000);
  const event = await gapi<{ id: string; htmlLink: string; hangoutLink?: string }>(
    `/calendars/${encodeURIComponent(cfg.calendarId)}/events?sendUpdates=all&conferenceDataVersion=1`,
    {
      method: "POST",
      body: JSON.stringify({
        summary: "Madvert Labs Business Strategy Call",
        description: input.description,
        start: { dateTime: start.toISOString(), timeZone: cfg.timezone },
        end: { dateTime: end.toISOString(), timeZone: cfg.timezone },
        attendees: [{ email: input.attendee.email, displayName: input.attendee.name }],
        guestsCanSeeOtherGuests: false,
        reminders: { useDefault: true },
        conferenceData: { createRequest: { requestId: input.requestId, conferenceSolutionKey: { type: "hangoutsMeet" } } },
      }),
    },
  );
  return { id: event.id, start: start.toISOString(), end: end.toISOString(), htmlLink: event.htmlLink, meetLink: event.hangoutLink };
}
