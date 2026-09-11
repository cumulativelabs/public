import { clamp, displace, ease, randomUnit, STORY_DURATION, type KnowledgeScene, type Pointer, type SceneLayout } from './knowledgeScene';

type Curve = { x0: number; y0: number; c1x: number; c1y: number; c2x: number; c2y: number; x1: number; y1: number };

const bezierPoint = (curve: Curve, t: number) => {
  const m = 1 - t;
  return {
    x: m * m * m * curve.x0 + 3 * m * m * t * curve.c1x + 3 * m * t * t * curve.c2x + t * t * t * curve.x1,
    y: m * m * m * curve.y0 + 3 * m * m * t * curve.c1y + 3 * m * t * t * curve.c2y + t * t * t * curve.y1,
  };
};

function localPoint(point: { x: number; y: number }, layout: SceneLayout) {
  return { x: layout.cx + point.x * layout.scale, y: layout.cy + point.y * layout.scale * layout.flatten };
}

function traceCurve(context: CanvasRenderingContext2D, curve: Curve, layout: SceneLayout, pointer: Pointer, depth: number) {
  const start = displace(localPoint({ x: curve.x0, y: curve.y0 }, layout), pointer, depth);
  const c1 = displace(localPoint({ x: curve.c1x, y: curve.c1y }, layout), pointer, depth * 0.8);
  const c2 = displace(localPoint({ x: curve.c2x, y: curve.c2y }, layout), pointer, depth * 0.5);
  const end = displace(localPoint({ x: curve.x1, y: curve.y1 }, layout), pointer, depth * 0.18);
  context.moveTo(start.x, start.y);
  context.bezierCurveTo(c1.x, c1.y, c2.x, c2.y, end.x, end.y);
  return Math.max(start.influence, c1.influence, c2.influence, end.influence);
}

function makeInbound(index: number, count: number): Curve {
  const n = count === 1 ? 0 : index / (count - 1);
  const spread = (n - 0.5) * 470;
  const jitter = (randomUnit(index + 10) - 0.5) * 62;
  return {
    x0: -470 - randomUnit(index + 22) * 80,
    y0: spread + jitter,
    c1x: -315 + randomUnit(index + 44) * 70,
    c1y: spread * 1.04 + (randomUnit(index + 66) - 0.5) * 105,
    c2x: -145 + randomUnit(index + 88) * 40,
    c2y: spread * 0.12 + (randomUnit(index + 110) - 0.5) * 28,
    x1: -76 + randomUnit(index + 132) * 18,
    y1: (randomUnit(index + 154) - 0.5) * 48,
  };
}

function makeOutbound(index: number, count: number): Curve {
  const n = count === 1 ? 0 : index / (count - 1);
  // Retained knowledge leaves the core as a disciplined beam, not a second fan.
  const lane = (n - 0.5) * 92;
  const micro = (randomUnit(index + 210) - 0.5) * 18;
  return {
    x0: 73 - randomUnit(index + 232) * 9,
    y0: (randomUnit(index + 254) - 0.5) * 18,
    c1x: 165 + randomUnit(index + 276) * 34,
    c1y: lane * 0.08 + (randomUnit(index + 298) - 0.5) * 10,
    c2x: 330 + randomUnit(index + 320) * 58,
    c2y: lane * 0.46 + (randomUnit(index + 342) - 0.5) * 18,
    x1: 520 + randomUnit(index + 364) * 96,
    y1: lane + micro,
  };
}

function drawStream(context: CanvasRenderingContext2D, curve: Curve, layout: SceneLayout, pointer: Pointer, color: string, alpha: number, width: number, depth: number, luminous = false) {
  context.beginPath();
  const influence = traceCurve(context, curve, layout, pointer, depth);
  const boosted = clamp(alpha + influence * 0.2);
  if (luminous) {
    context.strokeStyle = color;
    context.globalAlpha = boosted * 0.07;
    context.lineWidth = width * 9 + influence * 2;
    context.stroke();
    context.beginPath(); traceCurve(context, curve, layout, pointer, depth);
    context.globalAlpha = boosted * 0.16;
    context.lineWidth = width * 4.1 + influence;
    context.stroke();
    context.beginPath(); traceCurve(context, curve, layout, pointer, depth);
  }
  context.strokeStyle = color;
  context.globalAlpha = boosted;
  context.lineWidth = width + influence * 0.48;
  context.stroke();
}

function drawBeam(context: CanvasRenderingContext2D, layout: SceneLayout, pointer: Pointer) {
  const x0 = layout.cx + 66 * layout.scale;
  const x1 = layout.cx + 610 * layout.scale;
  const y = layout.cy;
  const gradient = context.createLinearGradient(x0, y, x1, y);
  gradient.addColorStop(0, '#ff4db5'); gradient.addColorStop(0.32, '#cf5dff'); gradient.addColorStop(1, '#8c4df4');
  const core = displace({ x: x0, y }, pointer, 0.12);
  for (const [w, a] of [[34, 0.025], [18, 0.055], [8, 0.12], [3.2, 0.34], [1.25, 0.96]] as const) {
    context.strokeStyle = gradient; context.globalAlpha = a; context.lineWidth = w * layout.scale;
    context.beginPath(); context.moveTo(core.x, core.y); context.lineTo(x1, y); context.stroke();
  }
  for (let lane = -3; lane <= 3; lane += 1) {
    const offset = lane * 4.1 * layout.scale;
    context.strokeStyle = lane === 0 ? '#f8c8ff' : '#ca71ff';
    context.globalAlpha = lane === 0 ? 0.8 : 0.22;
    context.lineWidth = lane === 0 ? 0.85 : 0.55;
    context.beginPath(); context.moveTo(core.x, core.y + offset * 0.12); context.lineTo(x1, y + offset); context.stroke();
  }
}

function drawMicroNodes(context: CanvasRenderingContext2D, curves: Curve[], layout: SceneLayout, side: 'in' | 'out', time: number, staticOnly: boolean) {
  const count = side === 'in' ? 148 : 88;
  for (let i = 0; i < count; i += 1) {
    const curve = curves[i % curves.length];
    const baseT = 0.12 + randomUnit(i + (side === 'in' ? 1600 : 1900)) * 0.78;
    const t = staticOnly ? baseT : (baseT + time * (side === 'in' ? 0.008 : 0.011) * (0.4 + randomUnit(i + 1700))) % 0.92;
    const p = localPoint(bezierPoint(curve, t), layout);
    const hot = i % 11 === 0;
    const color = side === 'in' ? (hot ? '#ffd2a6' : '#ff7b4b') : (hot ? '#efd6ff' : '#b76cff');
    context.fillStyle = color;
    context.globalAlpha = hot ? 0.74 : 0.18 + randomUnit(i + 1800) * 0.34;
    const r = (hot ? 1.8 : 0.65 + randomUnit(i + 1850) * 0.95) * layout.scale;
    if (hot) {
      context.beginPath(); context.arc(p.x, p.y, r * 5, 0, Math.PI * 2); context.globalAlpha *= 0.08; context.fill();
      context.globalAlpha = 0.8;
    }
    context.beginPath(); context.arc(p.x, p.y, r, 0, Math.PI * 2); context.fill();
    if (i % 17 === 0) {
      context.globalAlpha *= 0.55; context.strokeStyle = color; context.lineWidth = 0.55;
      const box = r * 4.4; context.strokeRect(p.x - box / 2, p.y - box / 2, box, box);
    }
  }
}

function drawPulse(context: CanvasRenderingContext2D, curve: Curve, layout: SceneLayout, time: number, offset: number, color: string) {
  const progress = ((time * 0.055 + offset) % 1 + 1) % 1;
  const p = localPoint(bezierPoint(curve, progress), layout);
  const r = 1.3 + ease(1 - Math.abs(progress - 0.5) * 2) * 1.2;
  context.fillStyle = color;
  context.globalAlpha = 0.18 + ease(1 - Math.abs(progress - 0.5) * 2) * 0.62;
  context.beginPath(); context.arc(p.x, p.y, r, 0, Math.PI * 2); context.fill();
  context.globalAlpha *= 0.18;
  context.beginPath(); context.arc(p.x, p.y, r * 5.5, 0, Math.PI * 2); context.fill();
}

function drawCore(context: CanvasRenderingContext2D, layout: SceneLayout, time: number, pointer: Pointer, staticOnly: boolean) {
  const x = layout.cx; const y = layout.cy; const s = layout.scale;
  const outer = context.createRadialGradient(x, y, 10 * s, x, y, 150 * s);
  outer.addColorStop(0, 'rgba(255,92,165,0.26)'); outer.addColorStop(0.25, 'rgba(246,53,146,0.14)'); outer.addColorStop(0.52, 'rgba(161,55,218,0.09)'); outer.addColorStop(1, 'rgba(70,24,124,0)');
  context.globalAlpha = 1; context.fillStyle = outer; context.beginPath(); context.arc(x, y, 150 * s, 0, Math.PI * 2); context.fill();
  context.fillStyle = 'rgba(3,7,17,0.94)'; context.beginPath(); context.arc(x, y, 68 * s, 0, Math.PI * 2); context.fill();
  const ring = context.createLinearGradient(x - 105 * s, y - 30 * s, x + 105 * s, y + 30 * s);
  ring.addColorStop(0, '#ff8a32'); ring.addColorStop(0.42, '#ff3a94'); ring.addColorStop(1, '#9a4df1');
  for (let i = 0; i < 6; i += 1) {
    const radius = (76 + i * 9.5) * s;
    context.strokeStyle = ring; context.lineWidth = (i < 2 ? 1.1 : 0.55) * s;
    context.globalAlpha = i === 0 ? 0.88 : i === 1 ? 0.45 : 0.10 + (5 - i) * 0.022;
    context.beginPath(); context.arc(x, y, radius, 0, Math.PI * 2); context.stroke();
  }
  for (let i = 0; i < 24; i += 1) {
    const a = i / 24 * Math.PI * 2;
    const r0 = (106 + (i % 3) * 3) * s;
    const r1 = r0 + (i % 4 === 0 ? 16 : 8) * s;
    context.strokeStyle = i < 12 ? '#ff7f57' : '#a75dec'; context.globalAlpha = i % 4 === 0 ? 0.18 : 0.07; context.lineWidth = 0.55;
    context.beginPath(); context.moveTo(x + Math.cos(a) * r0, y + Math.sin(a) * r0); context.lineTo(x + Math.cos(a) * r1, y + Math.sin(a) * r1); context.stroke();
  }
  if (!staticOnly && pointer.strength > 0.02) {
    const d = Math.hypot(pointer.x - x, pointer.y - y);
    const propagation = ease(1 - d / 440) * pointer.strength;
    if (propagation > 0.01) {
      const phase = ((time * 22) % 48) / 48;
      context.strokeStyle = '#f58ac5'; context.lineWidth = 0.8;
      context.globalAlpha = propagation * (1 - phase) * 0.32;
      context.beginPath(); context.arc(x, y, (96 + phase * 48) * s, 0, Math.PI * 2); context.stroke();
    }
  }
}

function drawRetainedLattice(context: CanvasRenderingContext2D, layout: SceneLayout, time: number, staticOnly: boolean) {
  const fade = staticOnly ? 1 : ease((time - 5) / 8);
  for (let i = 0; i < 32; i += 1) {
    const x = 125 + randomUnit(i + 2200) * 430;
    const y = (randomUnit(i + 2240) - 0.5) * 250;
    const p = localPoint({ x, y }, layout);
    const h = (18 + randomUnit(i + 2280) * 112) * layout.scale;
    context.strokeStyle = i % 5 === 0 ? '#df55d4' : '#8556d8';
    context.globalAlpha = fade * (i % 5 === 0 ? 0.12 : 0.035);
    context.lineWidth = i % 5 === 0 ? 0.75 : 0.4;
    context.beginPath(); context.moveTo(p.x, p.y - h); context.lineTo(p.x, p.y + h); context.stroke();
    if (i % 3 === 0) {
      context.fillStyle = i % 2 ? '#c27df4' : '#f067c6'; context.globalAlpha = fade * 0.45;
      const yy = p.y + (randomUnit(i + 2320) - 0.5) * h * 1.4;
      context.strokeRect(p.x - 2, yy - 2, 4, 4);
    }
  }
}

function drawAtmosphere(context: CanvasRenderingContext2D, layout: SceneLayout) {
  const x = layout.cx; const y = layout.cy; const s = layout.scale;
  const intake = context.createRadialGradient(x - 105 * s, y, 8 * s, x - 105 * s, y, 285 * s);
  intake.addColorStop(0, 'rgba(255,112,56,0.19)'); intake.addColorStop(0.2, 'rgba(255,72,76,0.085)'); intake.addColorStop(0.62, 'rgba(211,44,103,0.028)'); intake.addColorStop(1, 'rgba(0,0,0,0)');
  context.fillStyle = intake; context.globalAlpha = 1; context.fillRect(x - 440 * s, y - 330 * s, 500 * s, 660 * s);
  const exhaust = context.createRadialGradient(x + 135 * s, y, 5 * s, x + 135 * s, y, 245 * s);
  exhaust.addColorStop(0, 'rgba(224,80,255,0.16)'); exhaust.addColorStop(0.24, 'rgba(170,66,236,0.07)'); exhaust.addColorStop(1, 'rgba(0,0,0,0)');
  context.fillStyle = exhaust; context.fillRect(x + 55 * s, y - 260 * s, 510 * s, 520 * s);
  const flare = context.createRadialGradient(x - 82 * s, y, 1, x - 82 * s, y, 54 * s);
  flare.addColorStop(0, 'rgba(255,240,213,0.62)'); flare.addColorStop(0.12, 'rgba(255,150,74,0.26)'); flare.addColorStop(1, 'rgba(255,75,90,0)');
  context.fillStyle = flare; context.fillRect(x - 145 * s, y - 70 * s, 130 * s, 140 * s);
}

function drawSignalDust(context: CanvasRenderingContext2D, layout: SceneLayout, time: number, staticOnly: boolean) {
  for (let i = 0; i < 156; i += 1) {
    const side = i % 2 === 0 ? -1 : 1;
    const x = side * (105 + randomUnit(i + 510) * 455);
    const y = (randomUnit(i + 640) - 0.5) * 500;
    const inward = 1 - Math.min(1, Math.abs(x) / 560);
    const drift = staticOnly ? 0 : Math.sin(time * 0.22 + i * 1.7) * (1.5 + inward * 2.5);
    const p = localPoint({ x, y: y + drift }, layout);
    context.fillStyle = side < 0 ? '#ff9250' : '#a769ef';
    context.globalAlpha = 0.08 + randomUnit(i + 720) * 0.28 + inward * 0.12;
    const r = 0.5 + randomUnit(i + 830) * 1.35;
    context.beginPath(); context.arc(p.x, p.y, r * layout.scale, 0, Math.PI * 2); context.fill();
  }
}

function drawPowerField(context: CanvasRenderingContext2D, layout: SceneLayout, time: number, staticOnly: boolean) {
  const x = layout.cx; const y = layout.cy; const s = layout.scale;
  // Tight output rails: dense enough to feel powerful, narrow enough to read as retained structure.
  for (let i = 0; i < 34; i += 1) {
    const lane = (i - 16.5) / 16.5;
    const y0 = y + lane * 12 * s;
    const y1 = y + lane * (22 + Math.abs(lane) * 18) * s;
    const x1 = x + (155 + (i % 5) * 18) * s;
    context.strokeStyle = i % 6 === 0 ? '#f0b0ff' : i % 2 === 0 ? '#d057ef' : '#8258e8';
    context.globalAlpha = i % 6 === 0 ? 0.34 : 0.08 + (1 - Math.abs(lane)) * 0.12;
    context.lineWidth = i % 6 === 0 ? 0.95 : 0.45;
    context.beginPath(); context.moveTo(x + 72 * s, y0); context.quadraticCurveTo(x + 105 * s, y + lane * 8 * s, x1, y1); context.stroke();
  }
  // Instrument-like retained nodes and vertical supports close to the core, where mobile can actually show them.
  for (let i = 0; i < 26; i += 1) {
    const px = x + (92 + randomUnit(i + 2700) * 175) * s;
    const py = y + (randomUnit(i + 2740) - 0.5) * 178 * s;
    const length = (20 + randomUnit(i + 2780) * 70) * s;
    context.strokeStyle = i % 4 === 0 ? '#e65bd6' : '#885add';
    context.globalAlpha = i % 4 === 0 ? 0.17 : 0.055;
    context.lineWidth = 0.5;
    context.beginPath(); context.moveTo(px, py - length * 0.5); context.lineTo(px, py + length * 0.5); context.stroke();
    const pulse = staticOnly ? 0.55 : 0.35 + 0.2 * Math.sin(time * 0.8 + i);
    context.strokeStyle = i % 3 === 0 ? '#f69cea' : '#c686f4'; context.globalAlpha = pulse;
    const box = (i % 5 === 0 ? 5.4 : 3.1) * s;
    context.strokeRect(px - box / 2, py - box / 2, box, box);
  }
  // Tiny radial fragments around the nexus imply processing without becoming a literal HUD.
  for (let i = 0; i < 56; i += 1) {
    const a = randomUnit(i + 2840) * Math.PI * 2;
    const radius = (112 + randomUnit(i + 2880) * 72) * s;
    const px = x + Math.cos(a) * radius;
    const py = y + Math.sin(a) * radius * 0.72;
    context.fillStyle = a > Math.PI * 0.5 && a < Math.PI * 1.5 ? '#ff7855' : '#c16df4';
    context.globalAlpha = 0.08 + randomUnit(i + 2920) * 0.26;
    const r = (0.45 + randomUnit(i + 2960) * 1.15) * s;
    context.beginPath(); context.arc(px, py, r, 0, Math.PI * 2); context.fill();
  }
}

function drawEvidenceClusters(context: CanvasRenderingContext2D, layout: SceneLayout, time: number, staticOnly: boolean) {
  const groups = [
    { x: -335, y: -145, phase: 0 },
    { x: -365, y: 92, phase: 5 },
    { x: 330, y: -132, phase: 11 },
    { x: 382, y: 118, phase: 16 },
  ];
  groups.forEach((g, gi) => {
    const strength = staticOnly ? 1 : ease((time - g.phase) / 3);
    if (strength <= 0) return;
    const retained = gi >= 2;
    for (let n = 0; n < 5; n += 1) {
      const a = localPoint({ x: g.x + (randomUnit(gi * 20 + n + 1) - 0.5) * 82, y: g.y + (randomUnit(gi * 20 + n + 50) - 0.5) * 74 }, layout);
      const b = localPoint({ x: g.x + (randomUnit(gi * 20 + n + 2) - 0.5) * 82, y: g.y + (randomUnit(gi * 20 + n + 51) - 0.5) * 74 }, layout);
      context.strokeStyle = retained ? '#9d6ceb' : '#f18a61';
      context.globalAlpha = strength * (retained ? 0.22 : 0.16);
      context.lineWidth = 0.55; context.beginPath(); context.moveTo(a.x, a.y); context.lineTo(b.x, b.y); context.stroke();
      context.fillStyle = retained ? '#b78af4' : '#f1a16f'; context.globalAlpha = strength * 0.55;
      context.strokeRect(a.x - 1.7, a.y - 1.7, 3.4, 3.4);
    }
  });
  // An unsupported path briefly appears and then resolves away.
  if (!staticOnly) {
    const challenge = ease((time - 6) / 2) * (1 - ease((time - 10) / 4));
    if (challenge > 0) {
      const a = localPoint({ x: -355, y: -205 }, layout); const b = localPoint({ x: -220, y: -92 }, layout);
      context.setLineDash([2, 7]); context.strokeStyle = '#ef895f'; context.globalAlpha = challenge * 0.34; context.lineWidth = 0.7;
      context.beginPath(); context.moveTo(a.x, a.y); context.lineTo(b.x, b.y); context.stroke(); context.setLineDash([]);
    }
  }
}

export function drawKnowledgeScene(context: CanvasRenderingContext2D, scene: KnowledgeScene, layout: SceneLayout, width: number, height: number, time: number, pointer: Pointer, staticOnly: boolean) {
  context.clearRect(0, 0, width, height);
  const narrative = staticOnly ? STORY_DURATION : time;
  context.save(); context.globalCompositeOperation = 'lighter'; context.lineCap = 'round'; context.lineJoin = 'round';
  drawAtmosphere(context, layout);
  drawSignalDust(context, layout, time, staticOnly);

  const inbound = Array.from({ length: 86 }, (_, i) => makeInbound(i, 86));
  const outbound = Array.from({ length: 62 }, (_, i) => makeOutbound(i, 62));
  inbound.forEach((curve, i) => {
    const tier = i % 11 === 0 ? 1 : i % 5 === 0 ? 0.72 : i % 2 === 0 ? 0.42 : 0.26;
    const hot = i % 6 === 0;
    drawStream(context, curve, layout, pointer, hot ? '#ff9b51' : i % 3 === 0 ? '#ff654e' : '#dc4f83', 0.11 + tier * 0.34, 0.38 + tier * 0.82, 0.76, hot);
    if (i % 7 === 0) drawPulse(context, curve, layout, time, i * 0.11, '#ffd2b4');
  });
  drawMicroNodes(context, inbound, layout, 'in', time, staticOnly);

  const structure = ease((narrative - 3) / 8);
  outbound.forEach((curve, i) => {
    const tier = i % 10 === 0 ? 1 : i % 4 === 0 ? 0.7 : 0.36;
    const hot = i % 7 === 0;
    drawStream(context, curve, layout, pointer, hot ? '#e8a2ff' : i % 3 === 0 ? '#da55d8' : '#8b5bf0', (0.10 + tier * 0.33) * (0.45 + structure * 0.55), 0.3 + tier * 0.72, 0.62, hot);
    if (i % 6 === 0) drawPulse(context, curve, layout, time, i * 0.08 + 0.33, '#eedaff');
  });
  drawBeam(context, layout, pointer);
  drawPowerField(context, layout, time, staticOnly);
  drawMicroNodes(context, outbound, layout, 'out', time, staticOnly);
  drawRetainedLattice(context, layout, time, staticOnly);

  // Sparse cross-links appear only after output structure exists, preserving a disciplined beam.
  for (let i = 0; i < 18; i += 1) {
    const from = bezierPoint(outbound[i % outbound.length], 0.48 + randomUnit(i + 920) * 0.28);
    const to = bezierPoint(outbound[(i + 7) % outbound.length], 0.52 + randomUnit(i + 970) * 0.24);
    const a = displace(localPoint(from, layout), pointer, 0.48); const b = displace(localPoint(to, layout), pointer, 0.48);
    context.strokeStyle = '#ba77f0'; context.globalAlpha = structure * (0.025 + randomUnit(i + 1000) * 0.055); context.lineWidth = 0.42;
    context.beginPath(); context.moveTo(a.x, a.y); context.lineTo(b.x, b.y); context.stroke();
  }

  // Vertical nexus filaments add dimensional depth around the core while staying subordinate to the flow.
  for (let i = 0; i < 42; i += 1) {
    const x = (randomUnit(i + 1200) - 0.5) * 360;
    const proximity = 1 - Math.min(1, Math.abs(x) / 190);
    const filament = 28 + randomUnit(i + 1240) * 168 * (0.25 + proximity * 0.75);
    const centerY = (randomUnit(i + 1280) - 0.5) * 58;
    const top = localPoint({ x, y: centerY - filament }, layout);
    const bottom = localPoint({ x, y: centerY + filament }, layout);
    const response = displace(top, pointer, 0.38);
    context.strokeStyle = x < 0 ? '#ef704f' : '#ad55eb'; context.globalAlpha = 0.018 + proximity * 0.11;
    context.lineWidth = i % 8 === 0 ? 0.9 : 0.42;
    context.beginPath(); context.moveTo(response.x, response.y); context.lineTo(bottom.x, bottom.y); context.stroke();
    if (i % 3 === 0) {
      const dotY = top.y + (bottom.y - top.y) * randomUnit(i + 1320);
      context.fillStyle = x < 0 ? '#ffae79' : '#cf8aff'; context.globalAlpha = 0.13 + proximity * 0.34;
      context.beginPath(); context.arc(top.x, dotY, 0.75 + proximity * 0.8, 0, Math.PI * 2); context.fill();
    }
  }

  drawEvidenceClusters(context, layout, time, staticOnly);
  drawCore(context, layout, time, pointer, staticOnly);
  context.restore();
}
