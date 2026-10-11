// Generates assets/images/studio-06-boring-ad.png: the deliberately dull "before" ad
// (same office chair as studio-07, presented the way most ads look).
import { createCanvas, GlobalFonts, loadImage } from "@napi-rs/canvas";
import { join } from "node:path";
const A = join(import.meta.dir, "../assets");
GlobalFonts.registerFromPath(join(A, "fonts-generic/LiberationSans-Bold.ttf"), "Generic");
GlobalFonts.registerFromPath(join(A, "fonts-generic/LiberationSans-Regular.ttf"), "Generic");
const W = 1536, H = 1024;
const c = createCanvas(W, H), x: any = c.getContext("2d");
x.fillStyle = "#E4E4E4"; x.fillRect(0, 0, W, H);
const im = await loadImage(join(A, "images/studio-07-premium-ad.png"));
// small flat product shot, desaturated, in a bordered box
x.fillStyle = "#fff"; x.fillRect(820, 210, 600, 600);
x.strokeStyle = "#9a9a9a"; x.lineWidth = 4; x.strokeRect(820, 210, 600, 600);
x.filter = "grayscale(0.85) brightness(1.6) contrast(0.7)";
x.drawImage(im, 640, 40, 840, 940, 860, 240, 520, 560);
x.filter = "none";
x.fillStyle = "#C8102E"; x.font = "bold 92px Generic"; x.fillText("OFFICE CHAIRS", 90, 190);
x.fillStyle = "#222"; x.font = "44px Generic";
["- Comfortable", "- Many colours", "- Good quality", "- Fast delivery"].forEach((s, i) => x.fillText(s, 100, 320 + i * 78));
x.fillStyle = "#FFE600"; x.fillRect(90, 650, 700, 110);
x.fillStyle = "#111"; x.font = "bold 54px Generic"; x.fillText("BEST PRICES IN TOWN!!!", 108, 725);
x.fillStyle = "#0033CC"; x.font = "bold 50px Generic"; x.fillText("CALL NOW: 555-0199", 100, 880);
// clip-art starburst
x.save(); x.translate(1360, 220); x.beginPath();
for (let i = 0; i < 32; i++) { const r = i % 2 ? 95 : 130, a = (i / 32) * Math.PI * 2; x.lineTo(Math.cos(a) * r, Math.sin(a) * r); }
x.closePath(); x.fillStyle = "#FF2A2A"; x.fill();
x.rotate(-0.2); x.fillStyle = "#fff"; x.font = "bold 44px Generic"; x.textAlign = "center"; x.fillText("SALE", 0, -6); x.font = "bold 34px Generic"; x.fillText("20% OFF", 0, 34);
x.restore();
x.fillStyle = "#777"; x.font = "26px Generic"; x.fillText("*terms and conditions apply. visit our store for details.", 100, 970);
await Bun.write(join(A, "images/studio-06-boring-ad.png"), await c.encode("png"));
console.log("ok");
