import { clamp, displace, ease, linkOpacity, mapPoint, randomUnit, STORY_DURATION, stratumPoint, type KnowledgeScene, type Pointer, type SceneLayout } from './knowledgeScene';
function colorAt(x: number, y: number) {
  if (x < -190) return '#eea267';
  if (y < -90 && x > 60) return '#a88bfa';
  return y > 50 ? '#aa72eb' : '#f482b5';
}
export function drawKnowledgeScene(context: CanvasRenderingContext2D, scene: KnowledgeScene, layout: SceneLayout, width: number, height: number, time: number, pointer: Pointer, staticOnly: boolean) {
  context.clearRect(0, 0, width, height);
  const narrativeTime = staticOnly ? STORY_DURATION : time;
  const points = scene.nodes.map(node => {
    const drift = node.kind === 'signal' && !staticOnly ? 1 : 0;
    const base = mapPoint({ x: node.x + Math.sin(time * 0.23 + node.seed) * 3 * drift, y: node.y + Math.cos(time * 0.19 + node.seed) * 2 * drift }, layout);
    return displace(base, pointer, node.depth);
  });
  const gradient = context.createLinearGradient(layout.cx - 270 * layout.scale, layout.cy - 170 * layout.scale, layout.cx + 250 * layout.scale, layout.cy + 180 * layout.scale);
  gradient.addColorStop(0, '#f4a76b'); gradient.addColorStop(0.46, '#ed72ad'); gradient.addColorStop(1, '#9b76e8');
  context.lineCap = 'round'; context.lineJoin = 'round';
  // Translucent material between layers gives depth without blur passes.
  for (let layer = 0; layer < 4; layer += 1) {
    const outer = scene.strata[layer + 1]; const inner = scene.strata[layer];
    context.beginPath();
    outer.forEach((p, i) => { const q = mapPoint(p, layout); if (i === 0) context.moveTo(q.x, q.y); else context.lineTo(q.x, q.y); });
    [...inner].reverse().forEach(p => { const q = mapPoint(p, layout); context.lineTo(q.x, q.y); });
    context.closePath(); context.fillStyle = gradient; context.globalAlpha = 0.023 + layer * 0.004; context.fill();
  }
  scene.strata.forEach((stratum, layer) => {
    context.beginPath();
    stratum.forEach((point, index) => {
      const q = displace(mapPoint(point, layout), pointer, 0.1 + layer * 0.05);
      if (index === 0) context.moveTo(q.x, q.y); else context.lineTo(q.x, q.y);
    });
    context.strokeStyle = gradient; context.globalAlpha = layer === 2 ? 0.68 : 0.2 + layer * 0.065;
    context.lineWidth = layer === 2 ? 1.1 : 0.65; context.stroke();
  });
  // Deliberate bridges bind the archive to the immutable official nested-C core.
  [0.75, 1, 1.27].forEach((angle, index) => {
    const p = mapPoint(stratumPoint(0, angle * Math.PI), layout);
    const q = mapPoint({ x: Math.cos(angle * Math.PI) * 89, y: Math.sin(angle * Math.PI) * 89 }, layout);
    context.beginPath(); context.moveTo(p.x, p.y); context.lineTo(q.x - 12 * layout.scale, q.y); context.lineTo(q.x, q.y);
    context.strokeStyle = gradient; context.globalAlpha = 0.23 + index * 0.045; context.lineWidth = 0.7; context.stroke();
    context.beginPath(); context.arc(q.x, q.y, 1.8, 0, Math.PI * 2); context.fillStyle = '#dfa6ca'; context.fill();
  });
  for (const link of scene.links) {
    const a = points[link.a]; const b = points[link.b];
    const influence = Math.max(a.influence, b.influence);
    context.beginPath(); context.moveTo(a.x, a.y); context.lineTo(b.x, b.y);
    context.strokeStyle = link.kind === 'future' ? '#a191e9' : gradient;
    context.globalAlpha = clamp(linkOpacity(link, narrativeTime) + influence * 0.36);
    context.lineWidth = link.kind === 'retained' ? 0.55 : 0.8;
    if (link.kind === 'rejected') context.setLineDash([2, 5]);
    context.stroke(); context.setLineDash([]);
  }
  scene.nodes.forEach((node, index) => {
    const p = points[index];
    const arrival = node.arrival ? ease((narrativeTime - node.arrival) / 4) : 1;
    const ambient = staticOnly ? 1 : 0.87 + Math.sin(time * 0.32 + node.seed) * 0.13;
    const opacity = node.kind === 'signal' ? 0.18 + randomUnit(node.seed) * 0.24 : node.kind === 'retained' ? 0.58 : 0.7;
    const alpha = clamp(opacity * ambient * (0.2 + arrival * 0.8) + p.influence * 0.55);
    const radius = (node.kind === 'signal' ? 0.65 + randomUnit(node.seed + 7) : node.kind === 'retained' ? 1.35 : 1.7) * Math.max(0.78, layout.scale);
    context.fillStyle = colorAt(node.x, node.y);
    if (node.kind !== 'signal' && (index % 7 === 0 || p.influence > 0.05)) {
      context.globalAlpha = alpha * 0.1; context.beginPath(); context.arc(p.x, p.y, radius * 4, 0, Math.PI * 2); context.fill();
    }
    context.globalAlpha = alpha;
    if (node.kind === 'evidence') {
      context.strokeStyle = '#efb78f'; context.lineWidth = 0.75; context.strokeRect(p.x - 2, p.y - 2, 4, 4);
    } else {
      context.beginPath(); context.arc(p.x, p.y, radius + p.influence * 0.6, 0, Math.PI * 2); context.fill();
    }
  });
  if (!staticOnly) scene.routes.forEach((route, index) => {
    // A supported packet travels once, then stays in the retained structure.
    const progress = clamp((time - 3 - index * 6) / 8);
    if (progress <= 0 || progress >= 1) return;
    const step = progress * (route.length - 1); const segment = Math.min(route.length - 2, Math.floor(step)); const t = step - segment;
    const a = route[segment]; const b = route[segment + 1];
    const p = displace(mapPoint({ x: a.x + (b.x - a.x) * t, y: a.y + (b.y - a.y) * t }, layout), pointer, 0.65);
    context.globalAlpha = Math.sin(progress * Math.PI) * 0.85; context.fillStyle = '#fce0c8';
    context.beginPath(); context.arc(p.x, p.y, 2, 0, Math.PI * 2); context.fill();
  });
  context.globalAlpha = 1;
}
