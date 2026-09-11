/** Shared native artwork coordinates and live scene units. No viewport-cover positioning. */
export const NEXUS_PORT_RADIUS = 76;
export const NEXUS_DESKTOP_SPAN = 390;
export const NEXUS_MOBILE_LIMIT = 0.88;
export const NEXUS_MOBILE_DENOMINATOR = 500;
export const NEXUS_ART = {
  desktop: { width: 1440, height: 835, cx: 1077, cy: 430, inlet: 1001, outlet: 1153, unitScale: 1 },
  mobile: { width: 430, height: 820, cx: 292, cy: 704, inlet: 235, outlet: 349, unitScale: 76 / 57 },
} as const;
export function nexusScale(markWidth: number, viewportWidth: number) {
  return viewportWidth <= 780 ? Math.min(NEXUS_MOBILE_LIMIT, viewportWidth / NEXUS_MOBILE_DENOMINATOR) : markWidth / NEXUS_DESKTOP_SPAN;
}
export function artPointInScene(x: number, y: number, mobile: boolean) {
  const art = mobile ? NEXUS_ART.mobile : NEXUS_ART.desktop;
  return { x: (x - art.cx) * art.unitScale, y: (y - art.cy) * art.unitScale };
}
const d = NEXUS_ART.desktop;
const m = NEXUS_ART.mobile;
const mobileLength = (value: number) => `min(${value * m.unitScale * NEXUS_MOBILE_LIMIT}px, ${value * m.unitScale / NEXUS_MOBILE_DENOMINATOR * 100}vw)`;
export const nexusPlaneStyle = {
  '--nexus-desktop-width': `${d.width / NEXUS_DESKTOP_SPAN * 100}%`,
  '--nexus-desktop-height': `${d.height / NEXUS_DESKTOP_SPAN * 100}%`,
  '--nexus-desktop-x': `${-d.cx / d.width * 100}%`, '--nexus-desktop-y': `${-d.cy / d.height * 100}%`,
  '--nexus-mobile-width': mobileLength(m.width), '--nexus-mobile-height': mobileLength(m.height),
  '--nexus-mobile-x': `${-m.cx / m.width * 100}%`, '--nexus-mobile-y': `${-m.cy / m.height * 100}%`,
  '--nexus-fallback-desktop-width': `${300 / d.width * 100}%`,
  '--nexus-fallback-mobile-width': `${300 / (m.unitScale * m.width) * 100}%`,
};
