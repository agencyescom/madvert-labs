import "server-only";
import { promises as fs } from "node:fs";
import path from "node:path";
import postgres from "postgres";

/**
 * Onboarding data store.
 *
 * Each model is its own collection. With DATABASE_URL set, every collection is a Postgres table
 * (`onb_<collection>`: id, onboarding_id, data jsonb, timestamps), created on first use; see
 * `schema.sql` for the reference DDL. Without it (local development only), records are kept in
 * a JSON file under ONBOARDING_DATA_DIR (default ./.data). The file driver refuses to run on Vercel
 * because the filesystem there is not persistent.
 */

export const COLLECTIONS = [
  "clients",
  "engagements",
  "onboardings",
  "sections",
  "answers",
  "access_connections",
  "secrets",
  "assets",
  "cloud_folders",
  "social_profiles",
  "proof_assets",
  "offer_workshops",
  "offer_bonuses",
  "offer_guarantees",
  "objections",
  "competitors",
  "tasks",
  "delegated_tasks",
  "kickoff_bookings",
  "internal_notes",
  "guides",
  "events",
  "audit_logs",
  "settings",
  "template_overrides",
  "custom_questions",
  "team_users",
  "offer_shares",
] as const;
export type Collection = (typeof COLLECTIONS)[number];

type Doc = { id: string; onboardingId?: string } & Record<string, unknown>;
type Filter = Record<string, string | number | boolean | null>;

export interface Store {
  driver: "postgres" | "file";
  get<T>(col: Collection, id: string): Promise<T | null>;
  find<T>(col: Collection, filter?: Filter): Promise<T[]>;
  put<T extends { id: string }>(col: Collection, doc: T): Promise<T>;
  remove(col: Collection, id: string): Promise<void>;
}

/* ───────── Postgres ───────── */

function pgStore(url: string): Store {
  const sql = postgres(url, {
    max: Number(process.env.DATABASE_POOL_MAX ?? 5),
    idle_timeout: 20,
    ssl: /sslmode=disable|localhost|127\.0\.0\.1/.test(url) ? false : "require",
    onnotice: () => {},
  });
  let ready: Promise<void> | null = null;
  const ensure = () =>
    (ready ??= (async () => {
      for (const c of COLLECTIONS) {
        await sql.unsafe(
          `create table if not exists onb_${c} (id text primary key, onboarding_id text, data jsonb not null, created_at timestamptz not null default now(), updated_at timestamptz not null default now())`,
        );
        await sql.unsafe(`create index if not exists onb_${c}_onboarding_idx on onb_${c} (onboarding_id)`);
        await sql.unsafe(`create index if not exists onb_${c}_data_idx on onb_${c} using gin (data jsonb_path_ops)`);
      }
    })().catch((e) => {
      ready = null;
      throw e;
    }));
  const t = (c: Collection) => {
    if (!COLLECTIONS.includes(c)) throw new Error(`Unknown collection ${c}`);
    return `onb_${c}`;
  };
  return {
    driver: "postgres",
    async get<T>(col: Collection, id: string) {
      await ensure();
      const rows = await sql.unsafe(`select data from ${t(col)} where id = $1`, [id]);
      return (rows[0]?.data as T) ?? null;
    },
    async find<T>(col: Collection, filter: Filter = {}) {
      await ensure();
      const { onboardingId, ...rest } = filter;
      const where: string[] = [];
      const params: (string | number | boolean | null)[] = [];
      if (onboardingId !== undefined) {
        params.push(onboardingId as string);
        where.push(`onboarding_id = $${params.length}`);
      }
      if (Object.keys(rest).length) {
        params.push(JSON.stringify(rest));
        where.push(`data @> $${params.length}::text::jsonb`);
      }
      const rows = await sql.unsafe(`select data from ${t(col)} ${where.length ? `where ${where.join(" and ")}` : ""} order by created_at asc`, params);
      return rows.map((r) => r.data as T);
    },
    async put<T extends { id: string }>(col: Collection, doc: T) {
      await ensure();
      const d = doc as unknown as Doc;
      await sql.unsafe(
        `insert into ${t(col)} (id, onboarding_id, data) values ($1, $2, $3::text::jsonb)
         on conflict (id) do update set data = excluded.data, onboarding_id = excluded.onboarding_id, updated_at = now()`,
        [d.id, (d.onboardingId as string) ?? null, JSON.stringify(doc)],
      );
      return doc;
    },
    async remove(col: Collection, id: string) {
      await ensure();
      await sql.unsafe(`delete from ${t(col)} where id = $1`, [id]);
    },
  };
}

/* ───────── JSON file (local development) ───────── */

function fileStore(dir: string): Store {
  const file = path.join(dir, "onboarding-db.json");
  let cache: Record<string, Record<string, Doc>> | null = null;
  let cachedMtime = 0;
  let chain: Promise<unknown> = Promise.resolve();
  // Pages and route handlers can be separate bundles with separate module state, so the cache is
  // only trusted while the file on disk is unchanged.
  const load = async () => {
    const mtime = await fs.stat(file).then((st) => st.mtimeMs).catch(() => 0);
    if (cache && mtime === cachedMtime) return cache;
    try {
      cache = JSON.parse(await fs.readFile(file, "utf8"));
    } catch {
      cache = {};
    }
    cachedMtime = mtime;
    return cache!;
  };
  const save = async () => {
    await fs.mkdir(dir, { recursive: true });
    const tmp = `${file}.${process.pid}.${Math.random().toString(36).slice(2)}.tmp`;
    await fs.writeFile(tmp, JSON.stringify(cache), { mode: 0o600 });
    await fs.rename(tmp, file);
    cachedMtime = await fs.stat(file).then((st) => st.mtimeMs).catch(() => 0);
  };
  const serial = <T>(fn: () => Promise<T>) => {
    const p = chain.then(fn, fn);
    chain = p.catch(() => {});
    return p;
  };
  const clone = <T>(v: T): T => (v === null || v === undefined ? v : JSON.parse(JSON.stringify(v)));
  return {
    driver: "file",
    get: async <T>(col: Collection, id: string) => clone(((await load())[col]?.[id] as T) ?? null),
    find: async <T>(col: Collection, filter: Filter = {}) => {
      const all = Object.values((await load())[col] ?? {});
      return clone(all.filter((d) => Object.entries(filter).every(([k, v]) => d[k] === v)) as T[]);
    },
    put: <T extends { id: string }>(col: Collection, doc: T) =>
      serial(async () => {
        const db = await load();
        (db[col] ??= {})[doc.id] = clone(doc) as unknown as Doc;
        await save();
        return doc;
      }),
    remove: (col: Collection, id: string) =>
      serial(async () => {
        const db = await load();
        if (db[col]) delete db[col][id];
        await save();
      }),
  };
}

let store: Store | null = null;

export class ConfigurationError extends Error {}

export function db(): Store {
  if (store) return store;
  const url = process.env.DATABASE_URL;
  if (url) return (store = pgStore(url));
  if (process.env.VERCEL) {
    throw new ConfigurationError("DATABASE_URL is required in production. Add a Postgres database (e.g. Neon or Vercel Postgres) and redeploy.");
  }
  return (store = fileStore(path.resolve(/* turbopackIgnore: true */ process.cwd(), process.env.ONBOARDING_DATA_DIR ?? ".data")));
}

export function dbDriver(): "postgres" | "file" | "unconfigured" {
  if (process.env.DATABASE_URL) return "postgres";
  return process.env.VERCEL ? "unconfigured" : "file";
}
