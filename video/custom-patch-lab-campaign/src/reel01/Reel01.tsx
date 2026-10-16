import React from 'react';
import {AbsoluteFill, Audio, Sequence, spring, staticFile, useCurrentFrame, useVideoConfig} from 'remotion';
import {FONT_BODY, FONT_CONDENSED} from '../shared/brand';
import {FilmGrain} from '../shared/components/FilmGrain';
import {Footage} from '../shared/components/Footage';
import {LogoBadge} from '../shared/components/LogoBadge';
import {MotionBlur} from '../shared/components/MotionBlur';
import {easeIn, easeInOut, easeOut, mix, prog} from '../shared/motion';
import edl from './edl.json';
import {BrandPill, CalloutPill, CameraHUD, PatchOrbit, TextRing, patchAt} from './Overlays';

/* ------------------------------------------------------------------ timing
 * 540 frames @ 30 fps. Hyperframes (edl.hyperframes): 3 orange impact ·
 * 96 navy thread frame · 240 texture freeze · 299 ivory flash → stitched
 * reveal · 436 HITS outline. scripts/sound-design-reel01.py reads the same
 * edl so every hit lands on the same frame.                                  */
export const NAVY = '#0B1A33';
export const IVORY = '#F7F0E3';
export const ORANGE = '#F26A21';
export const GOLD = '#F5B941';
const NEEDLE = edl.needle; // needle tip in video 1, measured from the footage
const [H1, H2, H3, H4, H5] = edl.hyperframes;
const REVEAL = 300;
const PAYOFF = 420;

const shot = (id: string) => {
  const s = edl.shots.find((x) => x.id === id);
  if (!s) throw new Error(`Shot ${id} missing from edl.json`);
  return s;
};
const seg = (id: string) => `segments/reel01/${id}.mp4`;
const Shot: React.FC<{id: string; children: React.ReactNode}> = ({id, children}) => (
  <Sequence from={shot(id).from} durationInFrames={shot(id).frames} name={id}>
    {children}
  </Sequence>
);

export type Reel01Props = {captions: boolean};

export const Reel01: React.FC<Reel01Props> = ({captions}) => {
  const f = useCurrentFrame();

  // deterministic micro-shake on impacts (decays over 6 frames)
  const shakeAt = (at: number, amp: number) => (f >= at && f < at + 6 ? amp * (1 - (f - at) / 6) * Math.sin((f - at) * 2.6) : 0);
  const shake = shakeAt(H1, 9) + shakeAt(H3 + 3, 6) + shakeAt(H4, 7) + shakeAt(H5, 6);
  const snap = (cut: number, from: number) => (f >= cut ? mix(from, 1, prog(f, cut, 7, easeOut)) : from);
  const whipD = prog(f, 176, 8, easeInOut); // d → e lateral whip
  const reveal = prog(f, REVEAL, 14, easeOut);

  return (
    <AbsoluteFill style={{background: NAVY}}>
      <MotionBlur id="r1-whip" x={Math.sin(Math.PI * whipD) * 60} y={0} />

      <AbsoluteFill style={{transform: `translate(${shake}px, ${shake * 0.6}px)`}}>
        {/* ============ 01 HOOK 0–2 s */}
        <Shot id="a">
          <Footage src={seg('a')} origin={NEEDLE} scale={1.04} drift={[1, 1.12]} shadeTop={1} />
        </Shot>

        {/* ============ 02 THREAD MAGIC 2–6 s */}
        <Shot id="b">
          <Footage src={seg('b')} origin={NEEDLE} scale={snap(60, 2.1) * 1.55} drift={[1, 1.08]} shadeTop={0.6} />
        </Shot>
        <Shot id="c">
          <Footage src={seg('c')} origin={NEEDLE} scale={1.06} drift={[1, 1.06]} shadeTop={1} shadeBottom={0.5} />
        </Shot>
        <Shot id="d">
          <Footage
            src={seg('d')}
            origin={{x: NEEDLE.x, y: NEEDLE.y + 150}}
            scale={2.1}
            drift={[1, 1.06]}
            fx={{transform: `translateX(${-whipD * 1080}px)`}}
            fxFilter={whipD > 0.01 ? 'url(#r1-whip)' : undefined}
          />
        </Shot>

        {/* ============ 03 HYPNOTIC 6–10 s */}
        <Shot id="e">
          <Footage
            src={seg('e')}
            origin={NEEDLE}
            scale={1.75}
            drift={[1, 1.1]}
            shadeBottom={0.7}
            fx={{transform: `translateX(${(1 - whipD) * 1080}px)`}}
            fxFilter={whipD < 0.99 ? 'url(#r1-whip)' : undefined}
          />
        </Shot>
        <Shot id="f">
          <Footage src={seg('f')} origin={{x: 330, y: 1240}} scale={snap(220, 3.0) * 2.3} drift={[1, 1.05]} />
        </Shot>
        <Shot id="g">
          <Footage src={seg('g')} origin={{x: 420, y: 980}} scale={3.4} drift={[1, 1]} />
        </Shot>
        <Shot id="h">
          <Footage src={seg('h')} origin={NEEDLE} scale={snap(243, 3.4) * 2.5} drift={[1, 1.22]} />
        </Shot>

        {/* ============ 04 REVEAL 10–14 s · 05 PAYOFF 14–18 s (video 2 runs continuously) */}
        <Sequence from={shot('i').from} name="Video 2">
          <AbsoluteFill style={{clipPath: reveal < 1 ? `circle(${mix(0, 1500, reveal)}px at ${NEEDLE.x}px ${NEEDLE.y}px)` : undefined}}>
            <Video2Plate />
          </AbsoluteFill>
        </Sequence>
      </AbsoluteFill>

      {/* stitched ring riding the edge of the reveal mask */}
      {f >= REVEAL && reveal < 1 && <StitchRing cx={NEEDLE.x} cy={NEEDLE.y} r={mix(0, 1500, reveal)} opacity={1 - reveal ** 3} />}

      {/* ============ graphics layer */}
      <Sequence from={0} durationInFrames={60} name="01 type">
        {captions && (
          <>
            <LetterStagger text="WAIT FOR THE" at={2} top={232} size={128} color={IVORY} exitAt={52} />
            <LetterStagger text="FINAL STITCH..." at={10} top={364} size={150} color={ORANGE} exitAt={53} />
            <StitchDash at={20} y={540} width={420} exitAt={52} />
          </>
        )}
        <NeedleReticle at={18} exitAt={54} label="NEEDLE 01" />
      </Sequence>

      <Sequence from={60} durationInFrames={120} name="02 graphics">
        <CalloutPill at={6} exitAt={34} x={NEEDLE.x + 60} y={NEEDLE.y + 230} label="SATIN FILL" dx={-200} dy={330} />
        <Sequence from={36} durationInFrames={44}>
          <NeedleReticle at={4} exitAt={40} label="STITCH" counter />
          <EmbroideryGuide at={6} cx={540} cy={1070} r={470} exitAt={40} />
        </Sequence>
        {captions && <TrackedLine text="PRECISION IN EVERY THREAD" at={40} top={250} exitAt={112} />}
        <CalloutPill at={84} exitAt={114} x={470} y={960} label="STITCH DETAIL ×2" dx={60} dy={330} />
      </Sequence>

      <Sequence from={180} durationInFrames={REVEAL - 180} name="03 graphics">
        {captions && (
          <>
            <SplitWord text="THREAD" at={2} top={252} align="left" exitAt={36} />
            <SplitWord text="BY" at={40} top={252} align="center" exitAt={58} />
            <SplitWord text="THREAD." at={64} top={252} align="right" exitAt={112} accent />
          </>
        )}
        <ThreadTrail at={4} dur={34} d="M -60 1460 C 240 1380, 520 1530, 780 1410 S 1080 1330, 1160 1360" />
        <ThreadTrail at={64} dur={40} d="M 1140 520 C 880 600, 760 480, 600 640 S 520 860, 565 770" color={GOLD} />
        <EmbroideryGuide at={70} cx={NEEDLE.x} cy={NEEDLE.y} r={170} exitAt={112} ticks />
      </Sequence>

      <CameraHUD />
      <Sequence from={0} name="04 tracked">
        <PatchOrbit at={346} exitAt={430} />
        <TrackedCallout at={372} exitAt={396} label="SATIN-STITCH SUNSET" ax={0.25} ay={-0.62} />
        <TrackedCallout at={398} exitAt={426} label="MERROWED BORDER" ax={-0.45} ay={-0.9} />
        {captions && <TextRing at={444} text="PATCH CULTURE • CUSTOM PATCH LAB • PATCH CULTURE • CUSTOM PATCH LAB •" pad={34} />}
      </Sequence>

      <Sequence from={PAYOFF} name="05 payoff">
        <Payoff captions={captions} />
      </Sequence>

      {/* ============ HYPERFRAMES */}
      <HyperOrange at={H1} />
      <HyperNavyThread at={H2} />
      <HyperFreezeMarker at={H3} />
      <HyperIvory at={H4} />
      {captions && <HyperHits at={H5} />}

      <FilmGrain opacity={0.055} />
      <Audio src={staticFile('audio/reel01-mix.wav')} />
    </AbsoluteFill>
  );
};

/** Video 2 (i → j → k are one continuous take): subtle push, a light sweep over the patch, then a slow pull-back for the end card. */
const Video2Plate: React.FC = () => {
  const lf = useCurrentFrame(); // 0 = REVEAL
  const g = lf + REVEAL;
  const push = mix(1, 1.05, prog(g, REVEAL, 120, easeInOut));
  const pull = mix(1, 0.93, prog(g, 470, 60, easeInOut));
  const sweep = prog(g, 338, 26, easeInOut);
  const shade = prog(g, PAYOFF - 6, 20);
  return (
    <AbsoluteFill style={{transform: `scale(${push * pull})`, transformOrigin: '520px 1000px'}}>
      <Sequence from={0} durationInFrames={shot('i').frames}>
        <Footage src={seg('i')} drift={[1, 1]} />
      </Sequence>
      <Sequence from={shot('j').from - REVEAL} durationInFrames={shot('j').frames}>
        <Footage src={seg('j')} drift={[1, 1]} />
      </Sequence>
      <Sequence from={shot('k').from - REVEAL}>
        <Footage src={seg('k')} drift={[1, 1]} />
      </Sequence>
      {/* elegant light sweep across the finished patch */}
      {sweep > 0 && sweep < 1 && (
        <AbsoluteFill
          style={{
            background: `linear-gradient(115deg, transparent ${mix(-30, 100, sweep)}%, rgba(255,240,215,0.32) ${mix(-15, 115, sweep)}%, transparent ${mix(0, 130, sweep)}%)`,
            mixBlendMode: 'soft-light',
          }}
        />
      )}
      {/* navy frame for the payoff type + brand row */}
      <AbsoluteFill
        style={{
          opacity: shade,
          background: `linear-gradient(180deg, ${NAVY} 0%, rgba(11,26,51,0.86) 17%, rgba(11,26,51,0) 31%, rgba(11,26,51,0) 66%, rgba(11,26,51,0.9) 77%, ${NAVY} 88%)`,
        }}
      />
    </AbsoluteFill>
  );
};

/* ================================================================== type */

/** Masked per-letter rise with a 1-frame stagger and a tiny scale settle. */
export const LetterStagger: React.FC<{text: string; at: number; top: number; size: number; color: string; exitAt?: number}> = ({
  text,
  at,
  top,
  size,
  color,
  exitAt,
}) => {
  const f = useCurrentFrame();
  const q = exitAt === undefined ? 0 : prog(f, exitAt, 7, easeIn);
  return (
    <div
      style={{
        position: 'absolute',
        top,
        left: 0,
        right: 0,
        display: 'flex',
        justifyContent: 'center',
        fontFamily: FONT_CONDENSED,
        fontWeight: 700,
        fontSize: size,
        lineHeight: 1,
        color,
        letterSpacing: '0.01em',
        filter: 'drop-shadow(0 8px 24px rgba(0,0,0,0.6))',
        transform: `translateY(${-q * 60}px)`,
        opacity: 1 - q,
      }}
    >
      {text.split('').map((ch, i) => {
        const p = prog(f, at + i, 8, easeOut);
        return (
          <span key={i} style={{display: 'inline-block', overflow: 'hidden', padding: '0.04em 0 0.1em'}}>
            <span
              style={{
                display: 'inline-block',
                whiteSpace: 'pre',
                transform: `translateY(${(1 - p) * 110}%) scale(${mix(1.25, 1, p)})`,
              }}
            >
              {ch}
            </span>
          </span>
        );
      })}
    </div>
  );
};

/** Small tracked micro-typography line with a centre-out reveal and a thin rule under it. */
const TrackedLine: React.FC<{text: string; at: number; top: number; exitAt?: number}> = ({text, at, top, exitAt}) => {
  const f = useCurrentFrame();
  const p = prog(f, at, 16, easeOut);
  const q = exitAt === undefined ? 0 : prog(f, exitAt, 6, easeIn);
  return (
    <div style={{position: 'absolute', top, left: 0, right: 0, textAlign: 'center', opacity: 1 - q}}>
      <div
        style={{
          fontFamily: FONT_BODY,
          fontWeight: 700,
          fontSize: 40,
          letterSpacing: `${mix(0.7, 0.3, p)}em`,
          color: IVORY,
          clipPath: `inset(0 ${(1 - p) * 50}% 0 ${(1 - p) * 50}%)`,
          filter: 'drop-shadow(0 3px 10px rgba(0,0,0,0.8))',
        }}
      >
        {text}
      </div>
      <div style={{margin: '14px auto 0', width: 520 * p, height: 3, background: ORANGE}} />
    </div>
  );
};

/** One oversized word that slams in on a cut, split-word rhythm across three cuts. */
const SplitWord: React.FC<{text: string; at: number; top: number; align: 'left' | 'center' | 'right'; exitAt: number; accent?: boolean}> = ({
  text,
  at,
  top,
  align,
  exitAt,
  accent,
}) => {
  const f = useCurrentFrame();
  const {fps} = useVideoConfig();
  if (f < at || f > exitAt + 6) return null;
  const s = spring({frame: f - at, fps, config: {damping: 14, stiffness: 260, mass: 0.6}});
  const q = prog(f, exitAt, 6, easeIn);
  const dx = align === 'left' ? -1 : align === 'right' ? 1 : 0;
  return (
    <div
      style={{
        position: 'absolute',
        top,
        left: 90,
        right: 90,
        textAlign: align,
        fontFamily: FONT_CONDENSED,
        fontWeight: 700,
        fontSize: 210,
        lineHeight: 1,
        letterSpacing: `${mix(0.2, 0.0, s)}em`,
        color: accent ? ORANGE : IVORY,
                transform: `translateX(${dx * (1 - s) * 220 + dx * q * 400}px) scale(${mix(1.3, 1, s)})`,
        opacity: Math.min(1, s * 2) * (1 - q),
        filter: 'drop-shadow(0 10px 28px rgba(0,0,0,0.6))',
      }}
    >
      {text}
    </div>
  );
};

/** Callout whose anchor rides the tracked patch (ax, ay in patch radii); the pill sits above the patch. */
const TrackedCallout: React.FC<{at: number; exitAt: number; label: string; ax: number; ay: number}> = ({at, exitAt, label, ax, ay}) => {
  const f = useCurrentFrame();
  const {x, y, r} = patchAt(f);
  const px = x + ax * r;
  const py = y + ay * r;
  const top = Math.max(250, y - r - 120);
  return <CalloutPill at={at} exitAt={exitAt} x={px} y={py} label={label} dx={540 - px} dy={top - py} />;
};

/* ============================================================ illustrations */

/** Short stitched orange dash under a headline, sewing itself left → right. */
const StitchDash: React.FC<{at: number; y: number; width: number; exitAt?: number}> = ({at, y, width, exitAt}) => {
  const f = useCurrentFrame();
  const p = prog(f, at, 14, easeOut);
  const q = exitAt === undefined ? 0 : prog(f, exitAt, 6, easeIn);
  return (
    <svg width={1080} height={1920} style={{position: 'absolute', inset: 0, opacity: 1 - q}}>
      <line x1={540 - width / 2} x2={540 - width / 2 + width * p} y1={y} y2={y} stroke={ORANGE} strokeWidth={6} strokeDasharray="22 12" strokeLinecap="round" />
    </svg>
  );
};

/** Needle-position tracking reticle locked to the measured needle tip, with an optional running stitch counter. */
const NeedleReticle: React.FC<{at: number; exitAt: number; label: string; counter?: boolean}> = ({at, exitAt, label, counter}) => {
  const f = useCurrentFrame();
  const p = prog(f, at, 10, easeOut);
  const q = prog(f, exitAt, 6, easeIn);
  const r = mix(120, 62, p);
  const {x, y} = NEEDLE;
  const n = counter ? String(1184 + Math.max(0, f - at) * 14).padStart(5, '0') : '';
  return (
    <svg width={1080} height={1920} style={{position: 'absolute', inset: 0, opacity: p * (1 - q)}}>
      <g stroke={IVORY} strokeWidth={4.5} fill="none" style={{filter: 'drop-shadow(0 0 6px rgba(0,0,0,0.7))'}}>
        <circle cx={x} cy={y} r={r} strokeDasharray="10 8" transform={`rotate(${f * 4} ${x} ${y})`} />
        {[0, 90, 180, 270].map((a) => (
          <line
            key={a}
            x1={x + Math.cos((a * Math.PI) / 180) * (r + 8)}
            y1={y + Math.sin((a * Math.PI) / 180) * (r + 8)}
            x2={x + Math.cos((a * Math.PI) / 180) * (r + 26)}
            y2={y + Math.sin((a * Math.PI) / 180) * (r + 26)}
          />
        ))}
        <line x1={x + r + 26} y1={y} x2={x + r + 140} y2={y - 76} />
      </g>
      <circle cx={x} cy={y} r={8} fill={ORANGE} />
      <text x={x + r + 150} y={y - 66} fill={IVORY} style={{fontFamily: FONT_BODY, fontWeight: 800, fontSize: 34, letterSpacing: '0.22em', filter: 'drop-shadow(0 2px 6px rgba(0,0,0,0.9))'}}>
        {label}
      </text>
      {counter && (
        <text x={x + r + 150} y={y - 22} fill={GOLD} style={{fontFamily: FONT_BODY, fontWeight: 800, fontSize: 34, letterSpacing: '0.12em', fontVariantNumeric: 'tabular-nums', filter: 'drop-shadow(0 2px 6px rgba(0,0,0,0.9))'}}>
          #{n}
        </text>
      )}
    </svg>
  );
};

/** Circular embroidery guide: dashed ring drawing around the hoop/needle, optional measurement ticks. */
const EmbroideryGuide: React.FC<{at: number; cx: number; cy: number; r: number; exitAt: number; ticks?: boolean}> = ({at, cx, cy, r, exitAt, ticks}) => {
  const f = useCurrentFrame();
  const p = prog(f, at, 22, easeInOut);
  const q = prog(f, exitAt, 6, easeIn);
  const circ = 2 * Math.PI * r;
  return (
    <svg width={1080} height={1920} style={{position: 'absolute', inset: 0, opacity: 0.9 * (1 - q)}}>
      <mask id={`eg-${at}-${r}`}>
        <circle cx={cx} cy={cy} r={r} fill="none" stroke="#fff" strokeWidth={14} strokeDasharray={circ} strokeDashoffset={circ * (1 - p)} transform={`rotate(-90 ${cx} ${cy})`} />
      </mask>
      <circle cx={cx} cy={cy} r={r} fill="none" stroke={IVORY} strokeWidth={4.5} strokeDasharray="18 12" mask={`url(#eg-${at}-${r})`} style={{filter: 'drop-shadow(0 0 4px rgba(0,0,0,0.7))'}} />
      {ticks &&
        Array.from({length: 24}, (_, i) => {
          const ang = (i / 24) * Math.PI * 2 - Math.PI / 2;
          if (i / 24 > p) return null;
          const l = i % 6 === 0 ? 22 : 10;
          return (
            <line
              key={i}
              x1={cx + Math.cos(ang) * (r + 8)}
              y1={cy + Math.sin(ang) * (r + 8)}
              x2={cx + Math.cos(ang) * (r + 8 + l)}
              y2={cy + Math.sin(ang) * (r + 8 + l)}
              stroke={i % 6 === 0 ? ORANGE : IVORY}
              strokeWidth={2.5}
            />
          );
        })}
    </svg>
  );
};

/** A thread trail sewing itself along a path, needle-head dot leading. */
const ThreadTrail: React.FC<{at: number; dur: number; d: string; color?: string}> = ({at, dur, d, color = ORANGE}) => {
  const f = useCurrentFrame();
  const p = prog(f, at, dur, easeInOut);
  const fade = 1 - prog(f, at + dur + 6, 10);
  if (p <= 0 || fade <= 0) return null;
  const len = 1600;
  return (
    <svg width={1080} height={1920} style={{position: 'absolute', inset: 0, overflow: 'visible', opacity: fade}}>
      <mask id={`tt-${at}`}>
        <path d={d} fill="none" stroke="#fff" strokeWidth={18} strokeDasharray={len} strokeDashoffset={len * (1 - p)} />
      </mask>
      <path d={d} fill="none" stroke={color} strokeWidth={5} strokeDasharray="16 10" strokeLinecap="round" mask={`url(#tt-${at})`} style={{filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.5))'}} />
    </svg>
  );
};

/** Satin-stitched ring on the edge of the circular reveal. */
const StitchRing: React.FC<{cx: number; cy: number; r: number; opacity: number}> = ({cx, cy, r, opacity}) => (
  <svg width={1080} height={1920} style={{position: 'absolute', inset: 0, opacity}}>
    <circle cx={cx} cy={cy} r={r} fill="none" stroke={NAVY} strokeWidth={22} />
    <circle cx={cx} cy={cy} r={r} fill="none" stroke={ORANGE} strokeWidth={6} strokeDasharray="18 10" />
    <circle cx={cx} cy={cy} r={r + 14} fill="none" stroke={IVORY} strokeWidth={2} opacity={0.7} />
  </svg>
);

/* ================================================================ hyperframes */

/** H1 — orange macro-texture flash (2 frames) on the first needle hit. */
const HyperOrange: React.FC<{at: number}> = ({at}) => {
  const f = useCurrentFrame();
  if (f < at || f > at + 1) return null;
  return (
    <AbsoluteFill
      style={{
        background: `radial-gradient(circle at ${NEEDLE.x}px ${NEEDLE.y}px, rgba(255,214,140,0.95), ${ORANGE} 45%, #B8410E 100%)`,
        mixBlendMode: 'hard-light',
        opacity: f === at ? 0.78 : 0.45,
      }}
    />
  );
};

/** H2 — 2-frame navy graphic: white thread-line illustration of the patch outline + needle. */
const HyperNavyThread: React.FC<{at: number}> = ({at}) => {
  const f = useCurrentFrame();
  if (f < at || f > at + 1) return null;
  const k = f - at;
  return (
    <AbsoluteFill style={{background: NAVY}}>
      <svg width={1080} height={1920}>
        <circle cx={540} cy={1000} r={360 + k * 20} fill="none" stroke={IVORY} strokeWidth={5} strokeDasharray="20 12" />
        {/* stylised peak + sun inside the outline, single line */}
        <path d={`M 250 ${1110 - k * 6} L 430 920 L 500 990 L 610 830 L 830 1110`} fill="none" stroke={IVORY} strokeWidth={5} strokeLinejoin="round" />
        <circle cx={640} cy={900} r={90} fill="none" stroke={ORANGE} strokeWidth={6} />
        <line x1={565} y1={180} x2={565} y2={770 + k * 30} stroke={IVORY} strokeWidth={6} strokeLinecap="round" />
        <circle cx={565} cy={770 + k * 30} r={9} fill={ORANGE} />
      </svg>
    </AbsoluteFill>
  );
};

/** H3 — 3-frame texture freeze: posterised crop with a technical marker. */
const HyperFreezeMarker: React.FC<{at: number}> = ({at}) => {
  const f = useCurrentFrame();
  if (f < at || f > at + 2) return null;
  return (
    <AbsoluteFill>
      <AbsoluteFill style={{background: NAVY, mixBlendMode: 'color', opacity: 0.35}} />
      <svg width={1080} height={1920} style={{position: 'absolute', inset: 0}}>
        <rect x={300} y={720} width={480} height={480} fill="none" stroke={IVORY} strokeWidth={3} />
        {[
          [300, 720],
          [780, 720],
          [300, 1200],
          [780, 1200],
        ].map(([x, y], i) => (
          <circle key={i} cx={x} cy={y} r={7} fill={ORANGE} />
        ))}
        <line x1={300} y1={1240} x2={780} y2={1240} stroke={IVORY} strokeWidth={3} />
        <text x={540} y={1290} textAnchor="middle" fill={IVORY} style={{fontFamily: FONT_BODY, fontWeight: 800, fontSize: 30, letterSpacing: '0.3em'}}>
          ×{(3.4).toFixed(1)} MACRO
        </text>
      </svg>
    </AbsoluteFill>
  );
};

/** H4 — controlled 2-frame ivory flash right on the thread cut, before the stitched reveal. */
const HyperIvory: React.FC<{at: number}> = ({at}) => {
  const f = useCurrentFrame();
  if (f < at || f > at + 1) return null;
  return <AbsoluteFill style={{background: IVORY, opacity: f === at ? 0.92 : 0.5}} />;
};

/** H5 — oversized outlined "HITS" crossing the frame for 3 frames on the brand headline impact. */
const HyperHits: React.FC<{at: number}> = ({at}) => {
  const f = useCurrentFrame();
  if (f < at || f > at + 2) return null;
  const k = f - at;
  return (
    <AbsoluteFill style={{justifyContent: 'center', alignItems: 'center', pointerEvents: 'none'}}>
      <div
        style={{
          fontFamily: FONT_CONDENSED,
          fontWeight: 700,
          fontSize: 760,
          lineHeight: 1,
          color: 'transparent',
          WebkitTextStroke: `6px ${ORANGE}`,
          transform: `translateX(${(k - 1) * 90}px) scale(${1.15 - k * 0.07})`,
          opacity: 0.85 - k * 0.2,
        }}
      >
        HITS
      </div>
    </AbsoluteFill>
  );
};

/* ================================================================== payoff */

/** 14–18 s. Local frame 0 = PAYOFF. Headline → HITS impact → logo → tagline → URL → hold. */
const Payoff: React.FC<{captions: boolean}> = ({captions}) => {
  const lf = useCurrentFrame();
  const {fps} = useVideoConfig();
  const at = (g: number) => g - PAYOFF;
  const l1 = prog(lf, at(426), 10, easeOut);
  const s2 = spring({frame: lf - at(H5), fps, config: {damping: 13, stiffness: 210, mass: 0.75}});
  const logoMask = prog(lf, at(468), 14, easeOut);
  const tag = prog(lf, at(480), 12, easeOut);
  const url = prog(lf, at(488), 12, easeOut);
  const underline = prog(lf, at(H5 + 6), 16, easeInOut);
  return (
    <AbsoluteFill>
      {captions && (
        <>
          <div style={{position: 'absolute', top: 214, left: 0, right: 0, display: 'flex', justifyContent: 'center', overflow: 'hidden', padding: '0.04em 0 0.1em'}}>
            <div
              style={{
                fontFamily: FONT_CONDENSED,
                fontWeight: 700,
                fontSize: 150,
                lineHeight: 1,
                color: IVORY,
                letterSpacing: '0.02em',
                transform: `translateY(${(1 - l1) * 110}%)`,
              }}
            >
              EVERY STITCH
            </div>
          </div>
          <div
            style={{
              position: 'absolute',
              top: 362,
              left: 0,
              right: 0,
              textAlign: 'center',
              fontFamily: FONT_CONDENSED,
              fontWeight: 700,
              fontSize: 132,
              lineHeight: 1,
              color: ORANGE,
              letterSpacing: `${mix(0.32, 0.01, s2)}em`,
              transform: `scale(${mix(1.6, 1, s2)})`,
              opacity: lf >= at(H5) ? Math.min(1, s2 * 2) : 0,
              filter: 'drop-shadow(0 10px 26px rgba(0,0,0,0.55))',
            }}
          >
            HITS DIFFERENT.
          </div>
          <svg width={1080} height={1920} style={{position: 'absolute', inset: 0}}>
            <path d="M 300 520 C 430 548, 650 500, 780 526" fill="none" stroke={GOLD} strokeWidth={5} strokeDasharray="16 10" strokeLinecap="round" style={{clipPath: `inset(0 ${(1 - underline) * 100}% 0 0)`}} />
          </svg>
        </>
      )}
      {/* brand row in a gold-rimmed glass pill: original logo (mask reveal + soft glow), tagline, URL chip */}
      <BrandPill at={at(464)}>
        <div style={{position: 'absolute', top: 22, left: 26, width: 150, height: 150, clipPath: `circle(${logoMask * 75}% at 50% 50%)`}}>
          <div style={{position: 'absolute', inset: -24, borderRadius: '50%', background: 'radial-gradient(closest-side, rgba(245,185,65,0.4), rgba(245,185,65,0))', opacity: logoMask}} />
          {/* LogoBadge centres itself on x=540; shift it back into this 150 px box */}
          <div style={{position: 'absolute', top: 0, left: -465, width: 1080, height: 150, transform: `scale(${mix(0.86, 1, logoMask)})`, transformOrigin: '540px 75px'}}>
            <LogoBadge at={at(468)} size={150} top={0} />
          </div>
        </div>
        <div style={{position: 'absolute', top: 30, left: 204, right: 24}}>
          <div style={{overflow: 'hidden'}}>
            <div style={{fontFamily: FONT_CONDENSED, fontWeight: 700, fontSize: 64, lineHeight: 1.05, color: IVORY, transform: `translateY(${(1 - tag) * 105}%)`}}>
              Your Design. <span style={{color: ORANGE}}>Our Craft.</span>
            </div>
          </div>
          <div
            style={{
              display: 'inline-block',
              marginTop: 14,
              padding: '10px 22px',
              borderRadius: 999,
              background: ORANGE,
              fontFamily: FONT_BODY,
              fontWeight: 800,
              fontSize: 32,
              letterSpacing: `${mix(0.16, 0.03, url)}em`,
              color: NAVY,
              clipPath: `inset(0 ${(1 - url) * 100}% 0 0 round 999px)`,
            }}
          >
            quote.custompatchlab.com →
          </div>
        </div>
      </BrandPill>
    </AbsoluteFill>
  );
};

