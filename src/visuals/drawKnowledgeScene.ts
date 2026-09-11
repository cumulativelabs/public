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
  const spread = (n - 0.5) * 480;
  const jitter = (randomUnit(index + 210) - 0.5) * 55;
  return {
    x0: 76 - randomUnit(index + 232) * 16,
    y0: (randomUnit(index + 254) - 0.5) * 42,
    c1x: 160 + randomUnit(index + 276) * 45,
    c1y: spread * 0.10 + (randomUnit(index + 298) - 0.5) * 26,
    c2x: 310 + randomUnit(index + 320) * 75,
    c2y: spread * 1.02 + (randomUnit(index + 342) - 0.5) * 96,
    x1: 500 + randomUnit(index + 364) * 95,
    y1: spread + jitter,
  };
}

function drawStream(context: CanvasRenderingContext2D, curve: Curve, layout: SceneLayout, pointer: Pointer, color: string, alpha: number, width: number, depth: number) {
  context.beginPath();
  const influence = traceCurve(context, curve, layout, pointer, depth);
  context.strokeStyle = color;
  context.globalAlpha = clamp(alpha + influence * 0.18);
  context.lineWidth = width + influence * 0.45;
  context.stroke();
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
  const glow = context.createRadialGradient(x, y, 18 * s, x, y, 118 * s);
  glow.addColorStop(0, 'rgba(255,72,145,0.20)'); glow.addColorStop(0.38, 'rgba(222,55,155,0.10)'); glow.addColorStop(0.72, 'rgba(123,56,212,0.055)'); glow.addColorStop(1, 'rgba(80,40,160,0)');
  context.globalAlpha = 1; context.fillStyle = glow; context.beginPath(); context.arc(x, y, 118 * s, 0, Math.PI * 2); context.fill();

  context.fillStyle = 'rgba(4,8,18,0.88)'; context.beginPath(); context.arc(x, y, 72 * s, 0, Math.PI * 2); context.fill();
  const ring = context.createLinearGradient(x - 76 * s, y, x + 76 * s, y);
  ring.addColorStop(0, '#ff8a37'); ring.addColorStop(0.5, '#f23792'); ring.addColorStop(1, '#8e45ed');
  for (let i = 0; i < 3; i += 1) {
    const radius = (79 + i * 11) * s;
    context.strokeStyle = ring; context.lineWidth = (i === 0 ? 1.2 : 0.65) * s;
    context.globalAlpha = i === 0 ? 0.72 : 0.18;
    context.beginPath(); context.arc(x, y, radius, 0, Math.PI * 2); context.stroke();
  }
  if (!staticOnly && pointer.strength > 0.02) {
    const d = Math.hypot(pointer.x - x, pointer.y - y);
    const propagation = ease(1 - d / 440) * pointer.strength;
    if (propagation > 0.01) {
      const radius = (94 + ((time * 24) % 42)) * s;
      context.strokeStyle = '#f06cb7'; context.lineWidth = 0.8;
      context.globalAlpha = propagation * (1 - ((time * 24) % 42) / 42) * 0.28;
      context.beginPath(); context.arc(x, y, radius, 0, Math.PI * 2); context.stroke();
    }
  }
}

function drawSignalDust(context: CanvasRenderingContext2D, layout: SceneLayout, time: number, staticOnly: boolean) {
  for (let i = 0; i < 92; i += 1) {
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
  drawSignalDust(context, layout, time, staticOnly);

  const inbound = Array.from({ length: 38 }, (_, i) => makeInbound(i, 38));
  const outbound = Array.from({ length: 40 }, (_, i) => makeOutbound(i, 40));
  inbound.forEach((curve, i) => {
    const tier = i % 7 === 0 ? 1 : i % 3 === 0 ? 0.65 : 0.34;
    drawStream(context, curve, layout, pointer, i % 4 === 0 ? '#ff8a3e' : '#e8618f', 0.12 + tier * 0.24, 0.45 + tier * 0.62, 0.72);
    if (i % 5 === 0) drawPulse(context, curve, layout, time, i * 0.13, '#ffd2b4');
  });

  const structure = ease((narrative - 4) / 10);
  outbound.forEach((curve, i) => {
    const tier = i % 6 === 0 ? 1 : i % 4 === 0 ? 0.62 : 0.3;
    drawStream(context, curve, layout, pointer, i % 5 === 0 ? '#e653ad' : '#9362ed', (0.10 + tier * 0.25) * (0.30 + structure * 0.70), 0.42 + tier * 0.64, 0.66);
    if (i % 4 === 0) drawPulse(context, curve, layout, time, i * 0.09 + 0.35, '#d9c3ff');
  });

  // Fine cross-links become more coherent only after structure has formed.
  for (let i = 0; i < 22; i += 1) {
    const from = bezierPoint(outbound[i % outbound.length], 0.42 + randomUnit(i + 920) * 0.35);
    const to = bezierPoint(outbound[(i + 5) % outbound.length], 0.48 + randomUnit(i + 970) * 0.28);
    const a = displace(localPoint(from, layout), pointer, 0.52); const b = displace(localPoint(to, layout), pointer, 0.52);
    context.strokeStyle = '#b279ee'; context.globalAlpha = structure * (0.035 + randomUnit(i + 1000) * 0.075); context.lineWidth = 0.45;
    context.beginPath(); context.moveTo(a.x, a.y); context.lineTo(b.x, b.y); context.stroke();
  }

  // Fine vertical energy filaments make the convergence read as a dense nexus instead of a flat graph.
  for (let i = 0; i < 34; i += 1) {
    const x = (randomUnit(i + 1200) - 0.5) * 330;
    const proximity = 1 - Math.min(1, Math.abs(x) / 175);
    const height = 28 + randomUnit(i + 1240) * 150 * (0.25 + proximity * 0.75);
    const centerY = (randomUnit(i + 1280) - 0.5) * 54;
    const top = localPoint({ x, y: centerY - height }, layout);
    const bottom = localPoint({ x, y: centerY + height }, layout);
    const response = displace(top, pointer, 0.42);
    context.strokeStyle = x < 0 ? '#f07d63' : '#a264ec';
    context.globalAlpha = 0.025 + proximity * 0.11;
    context.lineWidth = i % 7 === 0 ? 0.9 : 0.45;
    context.beginPath(); context.moveTo(response.x, response.y); context.lineTo(bottom.x, bottom.y); context.stroke();
    if (i % 3 === 0) {
      const dotY = top.y + (bottom.y - top.y) * randomUnit(i + 1320);
      context.fillStyle = x < 0 ? '#ffad77' : '#c08af7'; context.globalAlpha = 0.15 + proximity * 0.28;
      context.beginPath(); context.arc(top.x, dotY, 0.8 + proximity, 0, Math.PI * 2); context.fill();
    }
  }

  drawEvidenceClusters(context, layout, time, staticOnly);
  drawCore(context, layout, time, pointer, staticOnly);
  context.restore();
}
