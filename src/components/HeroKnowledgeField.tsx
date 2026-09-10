import { useEffect, useRef } from 'react';
import { createKnowledgeScene, mapPointer, type Pointer, type SceneLayout } from '../visuals/knowledgeScene';
import { drawKnowledgeScene } from '../visuals/drawKnowledgeScene';
const scene = createKnowledgeScene();
type Connection = EventTarget & { saveData?: boolean };

/** The hero has its own capability gate: compact layout must never disable a mouse. */
export function HeroKnowledgeField() {
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
      width = Math.max(1, Math.round(bounds.width)); height = Math.max(1, Math.round(bounds.height));
      const box = anchor.getBoundingClientRect(); const mobile = width <= 780;
      layout = { cx: box.left - bounds.left + box.width / 2, cy: box.top - bounds.top + box.height / 2, scale: mobile ? Math.min(0.72, width / 650) : Math.min(1.15, box.width / 390), flatten: mobile ? 0.58 : 1 };
      const dpr = Math.min(devicePixelRatio || 1, mobile ? 1.4 : 1.5);
      canvas.width = Math.round(width * dpr); canvas.height = Math.round(height * dpr);
      context.setTransform(dpr, 0, 0, dpr, 0, 0);
      resetPointer(); mode(); render(); schedule();
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
      stop(); resetPointer(); mode(); render(); schedule();
    };
    const onVisibility = () => { stop(); resetPointer(); mode(); if (!document.hidden) schedule(); };
    const visibilityObserver = new IntersectionObserver(([entry]) => {
      visible = entry?.isIntersecting ?? false;
      if (!visible) { stop(); resetPointer(); } else schedule();
      mode();
    }, { threshold: 0 });
    const resizeObserver = new ResizeObserver(resize);
    resizeObserver.observe(root); resizeObserver.observe(anchor); visibilityObserver.observe(root);
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
    <div ref={rootRef} className="hero-knowledge" data-visual-layer="knowledge" data-conceptual="true" aria-hidden="true">
      <svg className="hero-knowledge__fallback" viewBox="-470 -310 900 620" focusable="false">
        <g fill="none" stroke="#c47eb1" strokeWidth="0.8" opacity="0.55">
          {scene.strata.map((path, i) => <polyline key={i} points={path.filter((_, n) => n % 3 === 0).map(p => `${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(' ')} />)}
          {scene.routes.map((path, i) => <polyline key={`r${i}`} points={path.map(p => `${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(' ')} />)}
        </g>
        <g fill="#e29bbb" opacity="0.6">
          {scene.nodes.filter((_, i) => i % 4 === 0).map((p, i) => <circle key={i} cx={p.x} cy={p.y} r="1.7" />)}
        </g>
      </svg>
      <canvas ref={canvasRef} className="hero-knowledge__canvas" />
    </div>
  );
}
