import "server-only";
import { createSign } from "node:crypto";

/**
 * Google Drive adapter: creates the client workspace folder tree in a shared parent folder.
 *
 * Configuration (all required to enable it):
 *   GOOGLE_SERVICE_ACCOUNT_EMAIL        service account email
 *   GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY  PEM private key (\n escaped is fine)
 *   GOOGLE_DRIVE_PARENT_FOLDER_ID       folder (ideally in a Shared Drive) shared with the service account as Content manager
 *
 * Without it the portal keeps the same structure internally and shows "Configuration Required" in Operations.
 */

export function driveConfigured() {
  return Boolean(process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL && process.env.GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY && process.env.GOOGLE_DRIVE_PARENT_FOLDER_ID);
}

async function accessToken() {
  const email = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL!;
  const key = process.env.GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY!.replace(/\\n/g, "\n");
  const now = Math.floor(Date.now() / 1000);
  const enc = (o: object) => Buffer.from(JSON.stringify(o)).toString("base64url");
  const unsigned = `${enc({ alg: "RS256", typ: "JWT" })}.${enc({
    iss: email,
    scope: "https://www.googleapis.com/auth/drive.file",
    aud: "https://oauth2.googleapis.com/token",
    iat: now,
    exp: now + 3600,
  })}`;
  const sig = createSign("RSA-SHA256").update(unsigned).sign(key).toString("base64url");
  const res = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({ grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer", assertion: `${unsigned}.${sig}` }),
    cache: "no-store",
  });
  if (!res.ok) throw new Error(`Google token exchange failed (${res.status})`);
  return ((await res.json()) as { access_token: string }).access_token;
}

async function createFolder(token: string, name: string, parent: string) {
  const res = await fetch("https://www.googleapis.com/drive/v3/files?supportsAllDrives=true&fields=id,webViewLink", {
    method: "POST",
    headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
    body: JSON.stringify({ name, mimeType: "application/vnd.google-apps.folder", parents: [parent] }),
    cache: "no-store",
  });
  if (!res.ok) throw new Error(`Drive folder create failed (${res.status})`);
  return (await res.json()) as { id: string; webViewLink: string };
}

export async function createDriveWorkspace(clientName: string, folders: readonly string[]) {
  const token = await accessToken();
  const root = await createFolder(token, clientName, process.env.GOOGLE_DRIVE_PARENT_FOLDER_ID!);
  const children: { name: string; id: string; url: string }[] = [];
  for (const f of folders) {
    const c = await createFolder(token, f, root.id);
    children.push({ name: f, id: c.id, url: c.webViewLink });
  }
  return { root: { id: root.id, url: root.webViewLink }, children };
}
