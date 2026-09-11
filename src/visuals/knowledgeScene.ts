/** Deterministic decorative storytelling, never live research data. */
export type Point = { x: number; y: number };
export type Pointer = Point & { strength: number };
export type Node = Point & { kind: 'retained' | 'signal' | 'evidence' | 'future'; depth: number; seed: number; arrival: number };
export type Link = { a: number; b: number; kind: 'retained' | 'candidate' | 'rejected' | 'future'; arrival: number };
export type KnowledgeScene = { nodes: Node[]; links: Link[]; strata: Point[][]; routes: Point[][] };
export type SceneLayout = { cx: number; cy: number; scale: number; flatten: number; intakeExtension?: number };
export const STORY_DURATION = 28;
export const POINTER_RADIUS = 155;
export const MAX_DISPLACEMENT = 21;
export const clamp = (value: number, min = 0, max = 1) => Math.max(min, Math.min(max, value));
export const ease = (value: number) => { const t = clamp(value); return t * t * (3 - 2 * t); };
export function randomUnit(seed: number) {
  const value = Math.sin(seed * 127.1 + 311.7) * 43758.5453;
  return value - Math.floor(value);
}
export function stratumPoint(layer: number, angle: number): Point {
  const r = 172 + layer * 12;
  const z = layer * 18 - 36;
  return { x: Math.cos(angle) * r + z * 0.72, y: Math.sin(angle) * r * 0.78 - Math.cos(angle) * r * 0.16 - z * 0.56 };
}
export function createKnowledgeScene(): KnowledgeScene {
  const nodes: Node[] = []; const links: Link[] = []; const strata: Point[][] = []; const routes: Point[][] = [];
  const add = (p: Point, kind: Node['kind'], depth: number, arrival = 0) => {
    nodes.push({ ...p, kind, depth, seed: nodes.length + 31, arrival });
    return nodes.length - 1;
  };
  // Five offset laminae: an open, dimensional archive rather than a closed globe.
  for (let layer = 0; layer < 5; layer += 1) {
    const path: Point[] = [];
    for (let step = 0; step <= 60; step += 1) path.push(stratumPoint(layer, 0.24 * Math.PI + step / 60 * 1.52 * Math.PI));
    strata.push(path);
    for (let j = 0; j < 12; j += 1) {
      const a = add(stratumPoint(layer, 0.24 * Math.PI + j / 11 * 1.52 * Math.PI), 'retained', 0.12 + layer * 0.07, j % 4 === 1 ? 5 + layer * 3 : 0);
      if (j > 0) links.push({ a: a - 1, b: a, kind: 'retained', arrival: j % 4 === 1 ? 5 + layer * 3 : 0 });
      if (layer > 0 && j % 3 === 1) {
        links.push({ a: a - 12, b: a, kind: 'retained', arrival: 0 });
        if (j < 10) links.push({ a: a - 11, b: a, kind: 'retained', arrival: 0 });
      }
    }
  }
  // Small evidence families, not an all-to-all graph. Some connections do not survive.
  for (let family = 0; family < 3; family += 1) {
    const start = { x: -340 - family * 22, y: -103 + family * 138 };
    const p = [start, { x: start.x + 45, y: start.y - 32 }, { x: start.x + 83, y: start.y + 7 }, { x: start.x + 125, y: start.y - 27 }, stratumPoint(1, Math.PI * (1.17 - family * 0.22))];
    const ids = p.map(point => add(point, 'evidence', 0.85, family * 6));
    for (let j = 1; j < ids.length; j += 1) links.push({ a: ids[j - 1], b: ids[j], kind: 'candidate', arrival: family * 6 });
    const rejected = add({ x: start.x + 71, y: start.y + 66 }, 'signal', 1, family * 6);
    links.push({ a: ids[0], b: rejected, kind: 'rejected', arrival: family * 6 }, { a: rejected, b: ids[2], kind: 'rejected', arrival: family * 6 });
    routes.push(p);
  }
  // Retained structure becomes the point of departure for new work.
  for (let branch = 0; branch < 3; branch += 1) {
    const from = stratumPoint(branch + 1, Math.PI * 1.76);
    const chain = [from, { x: from.x + 47, y: from.y - 30 + branch * 19 }, { x: from.x + 98, y: from.y - 61 + branch * 18 }, { x: from.x + 157, y: from.y - 43 + branch * 32 }];
    const ids = chain.map(p => add(p, 'future', 0.55, 17 + branch * 3));
    ids.slice(1).forEach((id, j) => links.push({ a: ids[j], b: id, kind: 'future', arrival: 17 + branch * 3 + j }));
  }
  for (let i = 0; i < 43; i += 1) {
    const x = (randomUnit(i + 80) - 0.57) * 950;
    const y = (randomUnit(i + 210) - 0.5) * 520;
    if (Math.hypot(x, y) > 150) add({ x, y }, 'signal', 0.5 + randomUnit(i + 45) * 0.5);
  }
  return { nodes, links, strata, routes };
}
export function mapPoint(point: Point, layout: SceneLayout): Point {
  return { x: layout.cx + point.x * layout.scale, y: layout.cy + point.y * layout.scale * layout.flatten };
}
/** Viewport coordinates to CSS-pixel canvas coordinates, never backing-store pixels. */
export function mapPointer(client: Point, bounds: { left: number; top: number; width: number; height: number }, width: number, height: number): Point {
  return { x: (client.x - bounds.left) * width / Math.max(1, bounds.width), y: (client.y - bounds.top) * height / Math.max(1, bounds.height) };
}
export function displace(point: Point, pointer: Pointer, depth: number): Point & { influence: number } {
  const dx = pointer.x - point.x; const dy = pointer.y - point.y;
  const distance = Math.hypot(dx, dy);
  const influence = ease(1 - distance / POINTER_RADIUS) * pointer.strength;
  const amount = MAX_DISPLACEMENT * depth * influence / Math.max(24, distance);
  return { x: point.x + dx * amount - dy * amount * 0.12, y: point.y + dy * amount + dx * amount * 0.12, influence };
}
export function linkOpacity(link: Link, time: number) {
  if (link.kind === 'retained') return link.arrival === 0 ? 0.33 : 0.12 + 0.38 * ease((time - link.arrival) / 4);
  if (link.kind === 'rejected') return 0.42 * ease((time - link.arrival) / 2) * (1 - ease((time - link.arrival - 3) / 4));
  if (link.kind === 'future') return 0.43 * ease((time - link.arrival) / 5);
  return 0.14 + 0.36 * ease((time - link.arrival) / 5);
}
