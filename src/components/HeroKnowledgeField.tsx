import { useEffect, useId, useRef, type CSSProperties } from 'react';
import { createKnowledgeScene, mapPointer, type Pointer, type SceneLayout } from '../visuals/knowledgeScene';
import { drawKnowledgeScene } from '../visuals/drawKnowledgeScene';
import { NEXUS_ART, nexusPlaneStyle } from '../visuals/nexusGeometry';
const scene = createKnowledgeScene();
type Connection = EventTarget & { saveData?: boolean };

/** The hero has its own capability gate: compact layout must never disable a mouse. */
export function HeroKnowledgeField() {
  const coreGradientId = `nexus-core-${useId().replaceAll(':', '')}`;
  const rootRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const root = rootRef.current; const canvas = canvasRef.current;
    if (!root || !canvas) return;
    const context = canvas.getContext('2d', { alpha: true, desynchronized: true });
    if (!context) return; // Keep the server-rendered, decorative SVG composition.
    const host = root.closest('section');
    const anchor = host?.querySelector<HTMLElement>('.hero-section__mark');
    if (!host || !anchor) return;
    const motion = matchMedia('(prefers-reduced-motion: reduce)');
    const fine = matchMedia('(any-hover: hover) and (any-pointer: fine)');
    const connection = (navigator as Navigator & { connection?: Connection }).connection;
    let reducedMotion = motion.matches; let finePointer = fine.matches;
    let saveData = Boolean(connection?.saveData);
    let width = 1; let height = 1;
    let bounds = root.getBoundingClientRect();
    let layout: SceneLayout = { cx: 0, cy: 0, scale: 1, flatten: 1 };
    let pointer: Pointer = { x: -1000, y: -1000, strength: 0 };
    let target = 0; let pending: { x: number; y: number } | null = null;
    let boundsDirty = true; let visible = false; let disposed = false;
    let timer = 0; let raf = 0; let last = 0; let elapsed = 0;
    let expensiveFrames = 0; let constrained = false;
    const staticOnly = () => reducedMotion || saveData || (navigator.hardwareConcurrency || 4) <= 2;
    const interactive = () => finePointer && !staticOnly();
    const active = () => !disposed && visible && !document.hidden && !staticOnly();
    const stop = () => {
      clearTimeout(timer); cancelAnimationFrame(raf); timer = 0; raf = 0; last = 0;
    };
    const resetPointer = () => {
      pending = null; target = 0; pointer.strength = 0;
      root.dataset.pointerActive = 'false';
    };
    const mode = () => {
      root.dataset.renderMode = reducedMotion ? 'reduced-motion' : staticOnly() ? 'static-budget' : !visible || document.hidden ? 'paused' : target ? 'interactive' : 'autonomous';
      root.dataset.pointerInteraction = interactive() ? 'enabled' : 'disabled';
    };
    const render = () => {
      drawKnowledgeScene(context, scene, layout, width, height, elapsed, pointer, staticOnly());
      root.dataset.ready = 'true';
    };
    const frame = (now: number) => {
      raf = 0;
      if (!active()) return;
      const delta = last ? Math.min(0.15, (now - last) / 1000) : 0;
      last = now; elapsed += delta;
      if (pending && interactive()) {
        if (boundsDirty) { bounds = root.getBoundingClientRect(); boundsDirty = false; }
        const p = mapPointer(pending, bounds, width, height);
        pointer.x = p.x; pointer.y = p.y;
        target = p.x >= 0 && p.y >= 0 && p.x <= width && p.y <= height ? 1 : 0;
        pending = null;
        root.dataset.pointerActive = String(Boolean(target));
        root.dataset.pointerX = p.x.toFixed(1); root.dataset.pointerY = p.y.toFixed(1);
        mode();
      }
      pointer.strength += (target - pointer.strength) * (1 - Math.exp(-delta * 12));
      const started = performance.now(); render();
      if (performance.now() - started > 8) expensiveFrames += 1;
      else expensiveFrames = Math.max(0, expensiveFrames - 1);
      if (expensiveFrames > 8) { constrained = true; root.dataset.quality = 'economy'; }
      schedule();
    };
    const schedule = () => {
      if (!active() || timer || raf) return;
      const fps = constrained ? 12 : target || pointer.strength > 0.01 ? 60 : finePointer ? 24 : 12;
      timer = window.setTimeout(() => { timer = 0; raf = requestAnimationFrame(frame); }, Math.max(0, 1000 / fps - 12));
    };
    const resize = () => {
      bounds = root.getBoundingClientRect(); boundsDirty = false;
      width = Math.max(1, bounds.width); height = Math.max(1, bounds.height);
      const box = anchor.getBoundingClientRect();
      const mobile = window.matchMedia('(max-width: 780px)').matches;
      const art = mobile ? NEXUS_ART.mobile : NEXUS_ART.desktop;
      layout = {
        cx: box.left - bounds.left + box.width / 2,
        cy: box.top - bounds.top + box.height / 2,
        scale: width / (art.width * art.unitScale),
        flatten: 1,
      };
      const dpr = Math.min(devicePixelRatio || 1, mobile ? 1.4 : 1.5);
      canvas.width = Math.round(width * dpr); canvas.height = Math.round(height * dpr);
      context.setTransform(canvas.width / width, 0, 0, canvas.height / height, 0, 0);
      resetPointer(); mode(); if (!document.hidden) render(); schedule();
    };
    const onPointer = (event: PointerEvent) => {
      if (!interactive() || event.pointerType === 'touch') return;
      pending = { x: event.clientX, y: event.clientY };
      clearTimeout(timer); timer = 0;
      if (!raf && active()) raf = requestAnimationFrame(frame);
    };
    const onLeave = () => { pending = null; target = 0; root.dataset.pointerActive = 'false'; mode(); schedule(); };
    const onScroll = () => { boundsDirty = true; onLeave(); };
    const onPolicy = () => {
      reducedMotion = motion.matches; finePointer = fine.matches; saveData = Boolean(connection?.saveData);
      stop(); resetPointer(); mode(); if (!document.hidden) render(); schedule();
    };
    const onVisibility = () => { stop(); resetPointer(); mode(); if (!document.hidden) { render(); schedule(); } };
    const visibilityObserver = new IntersectionObserver(([entry]) => {
      visible = entry?.isIntersecting ?? false;
      if (!visible) { stop(); resetPointer(); } else schedule();
      mode();
    }, { threshold: 0 });
    const resizeObserver = new ResizeObserver(resize);
    resizeObserver.observe(root); resizeObserver.observe(anchor); resizeObserver.observe(host); visibilityObserver.observe(root);
    host.addEventListener('pointermove', onPointer, { passive: true, capture: true });
    host.addEventListener('pointerleave', onLeave);
    host.addEventListener('pointercancel', onLeave);
    window.addEventListener('scroll', onScroll, { passive: true, capture: true });
    window.addEventListener('blur', onLeave);
    document.addEventListener('visibilitychange', onVisibility);
    motion.addEventListener('change', onPolicy); fine.addEventListener('change', onPolicy);
    connection?.addEventListener('change', onPolicy);
    resize();
    return () => {
      disposed = true; stop(); visibilityObserver.disconnect(); resizeObserver.disconnect();
      host.removeEventListener('pointermove', onPointer, true);
      host.removeEventListener('pointerleave', onLeave); host.removeEventListener('pointercancel', onLeave);
      window.removeEventListener('scroll', onScroll, true); window.removeEventListener('blur', onLeave);
      document.removeEventListener('visibilitychange', onVisibility);
      motion.removeEventListener('change', onPolicy); fine.removeEventListener('change', onPolicy);
      connection?.removeEventListener('change', onPolicy);
      delete root.dataset.ready;
    };
  }, []);
  return (
    <div ref={rootRef} className="hero-knowledge" style={nexusPlaneStyle as CSSProperties} data-visual-layer="knowledge" data-conceptual="true" aria-hidden="true">
      <picture className="hero-knowledge__plate">
        <source media="(max-width: 780px)" srcSet="/visuals/hero-nexus-anchored-mobile.svg" />
        <img src="/visuals/hero-nexus-anchored-desktop.svg" alt="" decoding="async" fetchPriority="high" />
      </picture>
      <svg className="hero-knowledge__fallback" viewBox="-150 -150 300 300" focusable="false">
        <defs>
          <linearGradient id={coreGradientId} x1="0" y1="0" x2="1" y2="0">
            <stop stopColor="#ff8a32" /><stop offset="0.42" stopColor="#ff3a94" /><stop offset="1" stopColor="#9a4df1" />
          </linearGradient>
        </defs>
        <circle cx="0" cy="0" r="68" fill="#030711" fillOpacity="0.9" />
        {[76, 85.5, 95, 104.5, 114, 123.5].map((radius, i) => (
          <circle key={radius} cx="0" cy="0" r={radius} fill="none" stroke={`url(#${coreGradientId})`} strokeWidth={i < 2 ? 1.1 : 0.55} opacity={i === 0 ? 0.88 : i === 1 ? 0.45 : 0.1 + (5 - i) * 0.022} />
        ))}
      </svg>
      <canvas ref={canvasRef} className="hero-knowledge__canvas" />
    </div>
  );
}
