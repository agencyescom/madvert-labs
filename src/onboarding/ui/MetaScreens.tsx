"use client";

import type { ReactNode } from "react";

/**
 * Screen replicas of Meta Business Suite → Business settings, one per partner-access step.
 * Drawn in Meta's current layout (left settings menu, Partners page, Add menu, partner ID dialog,
 * asset picker, permissions), with the control to click highlighted and an animated cursor.
 * They are recreations for guidance, so they never go stale with a client's data; admins can
 * replace any step with a real screenshot in Operations → Guides.
 */

const BLUE = "#0866ff";

function Cursor({ x, y }: { x: string; y: string }) {
  return (
    <svg className="fb-cursor" style={{ left: x, top: y }} viewBox="0 0 24 24" aria-hidden="true">
      <path d="M4 2l15 9.5-6.6 1.3 3.9 7.4-3 1.6-3.9-7.5L4 19z" fill="#fff" stroke="#1c2b33" strokeWidth="1.4" strokeLinejoin="round" />
    </svg>
  );
}

function Frame({ children, title = "Business settings" }: { children: ReactNode; title?: string }) {
  return (
    <div className="ob-fb" role="img" aria-label={`Meta Business Suite: ${title}`}>
      <div className="flex h-9 items-center gap-2 border-b border-[#dadde1] bg-white px-3">
        <svg viewBox="0 0 40 24" width="26" height="16" aria-hidden="true">
          <path d="M20 12C23 7.4 26 3.6 30 3.6c4.4 0 6.9 4.9 6.9 9.7 0 4.1-2 7.1-5.4 7.1-4 0-7-4.1-11.5-8.4C16 7.5 13 3.6 9.6 3.6 5.6 3.6 3.1 8.4 3.1 13c0 4.2 2 7.4 5.4 7.4 4 0 7.5-4 11.5-8.4Z" fill="none" stroke={BLUE} strokeWidth="3.3" />
        </svg>
        <span className="font-semibold">Meta</span>
        <span className="text-[#65676b]">Business Suite</span>
        <span className="ml-auto flex items-center gap-1.5 rounded-md bg-[#f0f2f5] px-2 py-1 font-semibold">
          <span className="grid h-4 w-4 place-items-center rounded bg-[#1c2b33] text-[8px] text-white">Y</span>
          Your Business ▾
        </span>
      </div>
      {children}
    </div>
  );
}

const RAIL = ["Home", "Notifications", "Ads", "Content", "Inbox", "Insights"];

function Rail({ active }: { active?: string }) {
  return (
    <div className="hidden w-[46px] flex-none flex-col items-center gap-2 border-r border-[#dadde1] bg-white py-3 sm:flex">
      {[...RAIL, "Settings"].map((r) => (
        <span key={r} className={`grid h-7 w-7 place-items-center rounded-md ${r === active ? "fb-hl bg-[#ebf5ff]" : ""}`} title={r}>
          {r === "Settings" ? (
            <svg viewBox="0 0 20 20" width="15" height="15" aria-hidden="true">
              <circle cx="10" cy="10" r="2.6" fill="none" stroke={r === active ? BLUE : "#65676b"} strokeWidth="1.8" />
              <path d="M10 2.5v2.2M10 15.3v2.2M2.5 10h2.2M15.3 10h2.2M4.7 4.7l1.6 1.6M13.7 13.7l1.6 1.6M4.7 15.3l1.6-1.6M13.7 6.3l1.6-1.6" stroke={r === active ? BLUE : "#65676b"} strokeWidth="1.8" strokeLinecap="round" />
            </svg>
          ) : (
            <span className="h-3.5 w-3.5 rounded-[4px] bg-[#bcc0c4]" />
          )}
        </span>
      ))}
    </div>
  );
}

const MENU: [string, string[]][] = [
  ["Users", ["People", "Partners", "System users"]],
  ["Accounts", ["Pages", "Ad accounts", "Instagram accounts", "WhatsApp accounts"]],
  ["Data sources", ["Datasets", "Catalogs"]],
];

function SettingsMenu({ active }: { active?: string }) {
  return (
    <div className="w-[150px] flex-none border-r border-[#dadde1] bg-white p-2 sm:w-[170px]">
      <p className="px-2 pb-2 pt-1 text-[12.5px] font-bold">Business settings</p>
      {MENU.map(([group, items]) => (
        <div key={group} className="mb-1.5">
          <p className="px-2 py-1 font-semibold text-[#1c2b33]">{group}</p>
          {items.map((i) => (
            <p key={i} className={`rounded-md px-2 py-1 pl-4 ${i === active ? "fb-hl bg-[#ebf5ff] font-semibold text-[#0866ff]" : "text-[#65676b]"}`}>
              {i}
            </p>
          ))}
        </div>
      ))}
    </div>
  );
}

function Btn({ children, hl, primary = true }: { children: ReactNode; hl?: boolean; primary?: boolean }) {
  return (
    <span className={`inline-flex h-7 items-center rounded-md px-3 font-semibold ${primary ? "bg-[#0866ff] text-white" : "bg-[#e4e6eb] text-[#1c2b33]"} ${hl ? "fb-hl" : ""}`}>
      {children}
    </span>
  );
}

function Toggle({ on }: { on?: boolean }) {
  return (
    <span className={`relative inline-block h-[16px] w-[28px] rounded-full ${on ? "bg-[#0866ff]" : "bg-[#bcc0c4]"}`}>
      <span className={`absolute top-[2px] h-3 w-3 rounded-full bg-white ${on ? "left-[14px]" : "left-[2px]"}`} />
    </span>
  );
}

function Check({ on }: { on?: boolean }) {
  return (
    <span className={`grid h-3.5 w-3.5 flex-none place-items-center rounded-[3px] border ${on ? "border-[#0866ff] bg-[#0866ff]" : "border-[#bcc0c4] bg-white"}`}>
      {on ? (
        <svg viewBox="0 0 10 10" width="8" height="8" aria-hidden="true">
          <path d="m2 5 2 2 4-4" stroke="#fff" strokeWidth="1.6" fill="none" />
        </svg>
      ) : null}
    </span>
  );
}

function Dialog({ title, children, footer }: { title: string; children: ReactNode; footer: ReactNode }) {
  return (
    <div className="absolute inset-0 grid place-items-center bg-[rgb(255_255_255/0.6)] p-3 backdrop-blur-[1px]">
      <div className="w-full max-w-[420px] rounded-lg bg-white shadow-[0_12px_32px_rgb(0_0_0/0.22)]">
        <div className="flex items-center justify-between border-b border-[#dadde1] px-3.5 py-2.5">
          <span className="text-[13px] font-bold">{title}</span>
          <span className="text-[#65676b]">✕</span>
        </div>
        <div className="p-3.5">{children}</div>
        <div className="flex justify-end gap-2 border-t border-[#dadde1] px-3.5 py-2.5">{footer}</div>
      </div>
    </div>
  );
}

function PartnersPage({ addOpen }: { addOpen?: boolean }) {
  return (
    <div className="relative flex-1 p-3.5">
      <div className="flex items-center justify-between">
        <p className="text-[14px] font-bold">Partners</p>
        <span className="relative">
          <Btn hl={addOpen}>+ Add ▾</Btn>
          {addOpen ? (
            <span className="absolute right-0 top-9 z-10 w-[230px] rounded-lg bg-white p-1.5 shadow-[0_8px_24px_rgb(0_0_0/0.2)]">
              <span className="fb-hl block rounded-md bg-[#ebf5ff] px-2.5 py-2 font-semibold text-[#1c2b33]">Give a partner access to your assets</span>
              <span className="block rounded-md px-2.5 py-2 text-[#65676b]">Ask a partner to share their assets</span>
            </span>
          ) : null}
        </span>
      </div>
      <input className="mt-3 w-full rounded-md border border-[#ccd0d5] bg-white px-2.5 py-1.5 text-[11px]" placeholder="Search by business name or ID" readOnly tabIndex={-1} />
      <div className="mt-6 grid place-items-center gap-2 py-6 text-center text-[#65676b]">
        <span className="grid h-10 w-10 place-items-center rounded-full bg-[#e4e6eb]">
          <span className="h-4 w-4 rounded-full bg-[#bcc0c4]" />
        </span>
        <span className="font-semibold text-[#1c2b33]">No partners yet</span>
        <span>Partners you give access to will appear here.</span>
      </div>
    </div>
  );
}

export function MetaScreen({ id, partnerId }: { id: string; partnerId?: string }) {
  const pid = partnerId || "977388997110589";
  switch (id) {
    case "meta:1":
      return (
        <Frame title="Home">
          <div className="relative flex min-h-[230px]">
            <Rail active="Settings" />
            <div className="flex-1 p-3.5">
              <p className="text-[14px] font-bold">Home</p>
              <div className="mt-3 grid grid-cols-3 gap-2">
                {["Facebook Page", "Instagram", "Ad account"].map((t) => (
                  <div key={t} className="rounded-lg bg-white p-2.5">
                    <span className="block h-6 w-6 rounded-full bg-[#e4e6eb]" />
                    <span className="mt-2 block font-semibold">{t}</span>
                    <span className="block text-[#65676b]">Connected</span>
                  </div>
                ))}
              </div>
              <div className="mt-2 h-16 rounded-lg bg-white" />
            </div>
            <Cursor x="34px" y="196px" />
          </div>
        </Frame>
      );
    case "meta:2":
      return (
        <Frame>
          <div className="relative flex min-h-[260px]">
            <Rail active="Settings" />
            <SettingsMenu active="Partners" />
            <PartnersPage />
            <Cursor x="150px" y="74px" />
          </div>
        </Frame>
      );
    case "meta:3":
      return (
        <Frame>
          <div className="relative flex min-h-[260px]">
            <Rail active="Settings" />
            <SettingsMenu active="Partners" />
            <PartnersPage addOpen />
            <Cursor x="78%" y="96px" />
          </div>
        </Frame>
      );
    case "meta:4":
      return (
        <Frame>
          <div className="relative flex min-h-[260px]">
            <Rail active="Settings" />
            <SettingsMenu active="Partners" />
            <PartnersPage />
            <Dialog title="Give a partner access to your business assets" footer={<><Btn primary={false}>Cancel</Btn><Btn hl>Next</Btn></>}>
              <p className="text-[#65676b]">Enter the business portfolio ID of the partner you want to share assets with.</p>
              <p className="mt-3 font-semibold">Partner business ID</p>
              <div className="fb-hl mt-1 rounded-md border border-[#0866ff] bg-white px-2.5 py-1.5 font-mono text-[12px] tracking-wide">{pid}</div>
            </Dialog>
            <Cursor x="86%" y="78%" />
          </div>
        </Frame>
      );
    case "meta:5":
      return (
        <Frame>
          <div className="relative flex min-h-[290px]">
            <Rail active="Settings" />
            <SettingsMenu active="Partners" />
            <PartnersPage />
            <div className="absolute inset-0 grid place-items-center bg-[rgb(255_255_255/0.6)] p-3">
              <div className="w-full max-w-[460px] rounded-lg bg-white shadow-[0_12px_32px_rgb(0_0_0/0.22)]">
                <div className="border-b border-[#dadde1] px-3.5 py-2.5 text-[13px] font-bold">Select assets · Madvert Labs</div>
                <div className="flex">
                  <div className="w-[38%] border-r border-[#dadde1] p-2">
                    {["Pages", "Ad accounts", "Instagram accounts", "Datasets", "Catalogs"].map((t, n) => (
                      <p key={t} className={`rounded-md px-2 py-1.5 ${n === 1 ? "bg-[#ebf5ff] font-semibold text-[#0866ff]" : "text-[#65676b]"}`}>
                        {t}
                      </p>
                    ))}
                  </div>
                  <div className="flex-1 p-2.5">
                    {[
                      ["Your Business · Main", true],
                      ["Your Business · Retargeting", true],
                      ["Old account (closed)", false],
                    ].map(([t, on]) => (
                      <p key={String(t)} className={`flex items-center gap-2 rounded-md px-1.5 py-1.5 ${on ? "fb-hl" : ""}`}>
                        <Check on={Boolean(on)} /> {t}
                      </p>
                    ))}
                  </div>
                </div>
                <div className="flex justify-end gap-2 border-t border-[#dadde1] px-3.5 py-2.5">
                  <Btn primary={false}>Back</Btn>
                  <Btn>Next</Btn>
                </div>
              </div>
            </div>
            <Cursor x="62%" y="44%" />
          </div>
        </Frame>
      );
    case "meta:6":
      return (
        <Frame>
          <div className="relative flex min-h-[300px]">
            <Rail active="Settings" />
            <SettingsMenu active="Partners" />
            <PartnersPage />
            <Dialog title="Set access · Ad accounts" footer={<><Btn primary={false}>Back</Btn><Btn hl>Assign assets</Btn></>}>
              <p className="flex items-center justify-between rounded-md bg-[#f0f2f5] px-2.5 py-2 font-semibold">
                Full control <Toggle on />
              </p>
              <p className="mt-2 text-[#65676b]">Or partial access:</p>
              {["Manage campaigns", "View performance", "Manage creative hub mockups"].map((t) => (
                <p key={t} className="flex items-center justify-between px-2.5 py-1.5">
                  {t} <Toggle on />
                </p>
              ))}
            </Dialog>
            <Cursor x="88%" y="86%" />
          </div>
        </Frame>
      );
    case "meta_create:1":
      return (
        <Frame title="Create a business portfolio">
          <div className="relative grid min-h-[230px] place-items-center p-4 text-center">
            <div className="max-w-[300px]">
              <p className="text-[15px] font-bold">Create a business portfolio</p>
              <p className="mt-1.5 text-[#65676b]">Manage your Pages, ad accounts and Instagram in one place, under your business.</p>
              <div className="mt-4">
                <Btn hl>Create an account</Btn>
              </div>
            </div>
            <Cursor x="58%" y="72%" />
          </div>
        </Frame>
      );
    case "meta_create:2":
      return (
        <Frame title="Business details">
          <div className="relative grid min-h-[250px] place-items-center p-4">
            <div className="w-full max-w-[340px] rounded-lg bg-white p-4 shadow-[0_6px_18px_rgb(0_0_0/0.12)]">
              <p className="text-[14px] font-bold">Create a business portfolio</p>
              {[
                ["Business portfolio name", "Your Business"],
                ["Your name", "Your Name"],
                ["Business email", "you@yourbusiness.com"],
              ].map(([l, v], n) => (
                <div key={l} className="mt-2.5">
                  <p className="font-semibold">{l}</p>
                  <div className={`mt-1 rounded-md border px-2.5 py-1.5 ${n === 0 ? "fb-hl border-[#0866ff]" : "border-[#ccd0d5]"}`}>{v}</div>
                </div>
              ))}
              <div className="mt-3 flex justify-end">
                <Btn>Submit</Btn>
              </div>
            </div>
          </div>
        </Frame>
      );
    case "meta_create:3":
      return (
        <Frame>
          <div className="relative flex min-h-[240px]">
            <Rail active="Settings" />
            <SettingsMenu active="Pages" />
            <div className="flex-1 p-3.5">
              <div className="flex items-center justify-between">
                <p className="text-[14px] font-bold">Pages</p>
                <Btn hl>+ Add ▾</Btn>
              </div>
              <div className="mt-3 rounded-lg bg-white p-2.5 text-[#65676b]">Add your Facebook Page, then connect Instagram under Instagram accounts.</div>
            </div>
            <Cursor x="84%" y="62px" />
          </div>
        </Frame>
      );
    default:
      return null;
  }
}

export const hasMetaScreen = (id: string) => /^meta(_create)?:\d+$/.test(id);
