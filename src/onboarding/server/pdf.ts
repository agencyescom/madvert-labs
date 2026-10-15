import "server-only";
import { promises as fs } from "node:fs";
import path from "node:path";
import { PDFDocument, StandardFonts, rgb, type PDFFont, type PDFPage } from "pdf-lib";
import { accessStatusOf, assetSectionDone, computeProgress, missingItems } from "../progress";
import { ACCESS_BY_KEY } from "../template/access";
import { ASSET_SECTION_BY_KEY } from "../template/assets";
import { SERVICES } from "../template/services";
import type { AnswerValue } from "../types";
import { offerSummary, riskFlags } from "./insights";
import { progressInput, type OnboardingContext } from "./repo";

/**
 * CLIENT ONBOARDING SUMMARY PDF for the Madvert team.
 * Built only from answers, statuses and labels. Credentials, secrets, tokens and file URLs are never included.
 */

const NAVY = rgb(10 / 255, 15 / 255, 28 / 255);
const INK = rgb(0.1, 0.13, 0.2);
const MUTED = rgb(0.36, 0.42, 0.52);
const BLUE = rgb(0, 0.42, 0.78);
const LINE = rgb(0.86, 0.91, 0.94);
const W = 595.28;
const H = 841.89;
const M = 48;

const WIN_EXTRA = "–—‘’‚“”„•…€™†‡ˆ‰Š‹ŒŽšœžŸ";
function clean(s: string) {
  return s
    .replace(/→/g, "->")
    .replace(/[ -ÿ]/g, (c) => c)
    .replace(/[^\x09\x0A\x0D\x20-\x7E -ÿ]/g, (c) => (WIN_EXTRA.includes(c) ? c : "?"));
}
const str = (v: AnswerValue | undefined) => (Array.isArray(v) ? v.join(", ") : v == null ? "" : String(v)).trim();

class Writer {
  page!: PDFPage;
  y = 0;
  n = 0;
  constructor(
    private doc: PDFDocument,
    private font: PDFFont,
    private bold: PDFFont,
    private company: string,
  ) {
    this.newPage();
  }
  newPage() {
    this.page = this.doc.addPage([W, H]);
    this.n++;
    this.y = H - M;
    this.page.drawText(clean(`Madvert Labs · ${this.company} · Confidential · Page ${this.n}`), { x: M, y: 24, size: 8, font: this.font, color: MUTED });
  }
  ensure(h: number) {
    if (this.y - h < 48) this.newPage();
  }
  wrap(text: string, size: number, width: number, font = this.font) {
    const out: string[] = [];
    for (const para of clean(text).split(/\n+/)) {
      let line = "";
      for (const word of para.split(/\s+/)) {
        const t = line ? `${line} ${word}` : word;
        if (font.widthOfTextAtSize(t, size) > width && line) {
          out.push(line);
          line = word;
        } else line = t;
      }
      if (line) out.push(line);
    }
    return out;
  }
  heading(t: string) {
    this.ensure(46);
    this.y -= 14;
    this.page.drawRectangle({ x: M, y: this.y - 4, width: 3, height: 16, color: rgb(0, 0.71, 1) });
    this.page.drawText(clean(t.toUpperCase()), { x: M + 10, y: this.y, size: 11, font: this.bold, color: NAVY });
    this.y -= 12;
    this.page.drawLine({ start: { x: M, y: this.y }, end: { x: W - M, y: this.y }, thickness: 0.6, color: LINE });
    this.y -= 14;
  }
  row(label: string, value: string, tag?: string) {
    const lw = 150;
    const lines = this.wrap(value || "—", 9.5, W - 2 * M - lw - 6);
    const labelLines = this.wrap(label, 8.5, lw - 10, this.bold);
    const h = Math.max(lines.length * 12.5, labelLines.length * 11) + (tag ? 11 : 0) + 6;
    this.ensure(h);
    labelLines.forEach((l, i) => this.page.drawText(l, { x: M, y: this.y - i * 11, size: 8.5, font: this.bold, color: MUTED }));
    let yy = this.y;
    if (tag) {
      this.page.drawText(clean(tag), { x: M + lw, y: yy, size: 6.5, font: this.bold, color: tag.startsWith("MADVERT") ? rgb(0.49, 0.23, 0.93) : BLUE });
      yy -= 11;
    }
    lines.forEach((l, i) => this.page.drawText(l, { x: M + lw, y: yy - i * 12.5, size: 9.5, font: this.font, color: INK }));
    this.y -= h;
  }
  para(t: string, size = 9.5, color = INK) {
    for (const l of this.wrap(t, size, W - 2 * M)) {
      this.ensure(14);
      this.page.drawText(l, { x: M, y: this.y, size, font: this.font, color });
      this.y -= size + 3.5;
    }
  }
}

export async function onboardingPdf(ctx: OnboardingContext) {
  const doc = await PDFDocument.create();
  doc.setTitle(`Madvert Onboarding Summary · ${ctx.onboarding.companyName}`);
  doc.setAuthor("Madvert Labs");
  doc.setCreator("Madvert Operations");
  const font = await doc.embedFont(StandardFonts.Helvetica);
  const bold = await doc.embedFont(StandardFonts.HelveticaBold);
  const w = new Writer(doc, font, bold, ctx.onboarding.companyName);
  const input = progressInput(ctx);
  const p = computeProgress(input);
  const o = ctx.onboarding;
  const a = (k: string) => ctx.answers[k] ?? {};
  const company = a("business.company");
  const model = a("business.model");
  const cust = a("business.customers");
  const growth = a("business.growth");

  // Cover band
  const page = w.page;
  page.drawRectangle({ x: 0, y: H - 190, width: W, height: 190, color: NAVY });
  for (let i = 0; i < 60; i++) {
    const t = i / 59;
    page.drawRectangle({ x: (W / 60) * i, y: H - 194, width: W / 60 + 0.5, height: 4, color: rgb(0, 0.71 + 0.19 * t, 1) });
  }
  try {
    const icon = await doc.embedPng(await fs.readFile(path.join(process.cwd(), "public/brand/app-icon-512.png")));
    page.drawImage(icon, { x: M, y: H - 110, width: 56, height: 56 });
  } catch {
    /* icon optional */
  }
  page.drawText("MADVERT LABS", { x: M + 72, y: H - 70, size: 9, font: bold, color: rgb(0.25, 0.83, 1) });
  page.drawText("CLIENT ONBOARDING SUMMARY", { x: M + 72, y: H - 92, size: 18, font: bold, color: rgb(1, 1, 1) });
  page.drawText(clean(o.companyName), { x: M, y: H - 140, size: 14, font: bold, color: rgb(1, 1, 1) });
  page.drawText(
    clean(`Onboarding ${p.overall}% complete · Generated ${new Date().toISOString().slice(0, 16).replace("T", " ")} UTC · Internal use only`),
    { x: M, y: H - 162, size: 9, font, color: rgb(0.66, 0.71, 0.79) },
  );
  w.y = H - 220;

  w.heading("Business overview");
  w.row("Legal name", str(company.legal_name));
  w.row("Trading name", str(company.trading_name));
  w.row("Website", str(company.website));
  w.row("Industry", str(company.industry));
  w.row("Established", str(company.year_established));
  w.row("Team size", str(company.team_size));
  w.row("Locations / countries", [str(company.locations), str(company.countries)].filter(Boolean).join(" · "));
  w.row("Primary contact", [str(company.contact_name), str(company.contact_role), str(company.contact_email), str(company.contact_phone), str(company.timezone)].filter(Boolean).join(" · "));
  w.row("Sells", str(model.sells));
  w.row("Main offers", str(model.main_offers));
  w.row("Average sale / LTV", [str(model.avg_sale), str(model.ltv) && `LTV ${str(model.ltv)}`].filter(Boolean).join(" · "));
  w.row("Revenue / marketing spend", [str(model.revenue_range), str(model.marketing_spend)].filter(Boolean).join(" · "));
  w.row("Capacity", str(model.capacity));

  w.heading("Goals");
  w.row("Success looks like", str(growth.success));
  w.row("Primary goals", [str(growth.primary_goal), str(growth.goal_other)].filter(Boolean).join(" · "));
  w.row("Biggest bottleneck", str(growth.bottleneck));
  w.row("Before starting", str(growth.anything_else));

  w.heading("Audience");
  w.row("Market", str(cust.market));
  w.row("Ideal customer", str(cust.ideal_customer));
  w.row("Locations", str(cust.customer_locations));
  w.row("Problems", str(cust.customer_problems));
  w.row("Why they buy", str(cust.why_buy));
  w.row("Objections", str(cust.objections));
  w.row("Sales cycle", str(cust.sales_cycle));

  w.heading("Services");
  w.row("Engagement", ctx.engagement.services.map((s) => SERVICES[s]?.label ?? s).join(", "));
  w.row("Flags", [ctx.engagement.ecommerce && "E-commerce", ctx.engagement.localBusiness && "Local business"].filter(Boolean).join(", ") || "—");
  w.row("Account manager / strategist", [o.accountManager.name, o.strategist].filter(Boolean).join(" · "));

  w.heading("Access status");
  for (const item of ctx.template.access) {
    const st = accessStatusOf(input, item.key);
    const det = ctx.access[item.key]?.details ?? {};
    const extra = [str(det.platform), str(det.registrar), str(det.crm), str(det.has_portfolio) && `Portfolio: ${str(det.has_portfolio)}`, str(det.has_number) && `Number: ${str(det.has_number)}`].filter(Boolean).join(" · ");
    w.row(`${ACCESS_BY_KEY[item.key]?.label ?? item.key}${item.required ? "" : " (optional)"}`, `${st.replace("_", " ").toUpperCase()}${extra ? ` · ${extra}` : ""}`);
  }
  if (ctx.social.length) w.row("Social profiles", ctx.social.map((s) => `${s.platform}: ${s.url || s.username} (${s.accessStatus.replace("_", " ")})`).join("\n"));
  if (ctx.secrets.length) w.row("Secure credentials", `${ctx.secrets.length} stored in the encrypted vault (values not included in this document).`);

  w.heading("Asset status");
  for (const s of ctx.template.assets) {
    const count = input.assetCounts[s.key] ?? 0;
    w.row(`${ASSET_SECTION_BY_KEY[s.key]?.title}${s.required ? "" : " (optional)"}`, `${assetSectionDone(input, s.key) ? "COMPLETE" : "PENDING"} · ${count} item(s)`);
  }
  const proof = a("assets.social_proof");
  if (proof.permission) w.row("Public use of proof", str(proof.permission));

  w.heading("Offer summary");
  w.para("Labels: CLIENT-PROVIDED FACT = the client's own answer. MADVERT STRATEGY IDEA = a suggestion to validate, not a fact.", 8, MUTED);
  w.y -= 4;
  const status = ctx.workshop?.status ?? (o.offerMode === "kickoff" ? "skipped" : "not_started");
  w.row("Workshop status", status === "skipped" ? "To be completed during kickoff" : status.replace("_", " "));
  for (const s of offerSummary(ctx)) {
    w.ensure(30);
    w.y -= 4;
    w.para(s.title.toUpperCase(), 8.5, BLUE);
    for (const i of s.items) w.row(i.label, i.value, i.source);
  }

  w.heading("Competitors");
  if (!ctx.competitors.length) w.para("None listed.", 9.5, MUTED);
  for (const c of ctx.competitors) w.row(c.name, [c.website, c.strengths && `Does well: ${c.strengths}`, c.weaknesses && `Customers may dislike: ${c.weaknesses}`, c.difference && `How we differ: ${c.difference}`].filter(Boolean).join("\n"));

  w.heading("Risks");
  const flags = riskFlags(ctx);
  if (!flags.length) w.para("No risk flags.", 9.5, MUTED);
  for (const f of flags) w.row(f.level.toUpperCase(), f.label);

  w.heading("Missing items");
  const missing = missingItems(input);
  if (!missing.length) w.para("Nothing missing.", 9.5, MUTED);
  for (const m of missing) w.row(m.label, `${m.state}${m.required ? "" : " (optional)"}`);

  w.heading("Kickoff details");
  if (ctx.booking?.status === "booked") {
    w.row("Date / time", ctx.booking.startsAt ? new Date(ctx.booking.startsAt).toUTCString() : "Booked (time to be confirmed)");
    w.row("Timezone", ctx.booking.timezone ?? "—");
    w.row("Strategist", ctx.booking.strategist ?? o.strategist ?? "—");
    w.row("Meeting link", ctx.booking.meetingUrl ? "Available in the calendar invite" : "—");
  } else w.para("Kickoff not booked yet.", 9.5, MUTED);

  return doc.save();
}

export const pdfFileName = (company: string) => `Madvert-Onboarding-${company.replace(/[^A-Za-z0-9]+/g, "-").replace(/^-|-$/g, "") || "Client"}.pdf`;
