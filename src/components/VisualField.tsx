import { useEffect, useId, useMemo, useRef } from 'react';

type VisualPhase = 'scatter' | 'explore' | 'challenge' | 'verify' | 'preserve' | 'compound';

type VisualFieldProps = {
  phase: VisualPhase;
  className?: string;
  compact?: boolean;
};

type FieldSettings = {
  threadCount: number;
  desktopParticles: number;
  mobileParticles: number;
  focalX: number;
  focalY: number;
  bandY: number;
  coherence: number;
  interactive: boolean;
};

type SignalThread = {
  d: string;
  tier: 'primary' | 'medium' | 'fine';
  dotted: boolean;
  mobileHidden: boolean;
  opacity: number;
  width: number;
  delay: number;
};

type CanvasParticle = {
  baseX: number;
  baseY: number;
  x: number;
  y: number;
  velocityX: number;
  velocityY: number;
  driftX: number;
  driftY: number;
  speed: number;
  phase: number;
  size: number;
  alpha: number;
  depth: number;
  colorIndex: number;
};

type ParticleMotion = {
  maxMovement: number;
  maxResidual: number;
};

type CachedBounds = {
  left: number;
  top: number;
  width: number;
  height: number;
};

const FIELD_SETTINGS: Record<VisualPhase, FieldSettings> = {
  scatter: {
    threadCount: 26,
    desktopParticles: 230,
    mobileParticles: 88,
    focalX: 0.76,
    focalY: 0.39,
    bandY: 0.73,
    coherence: 0.48,
    interactive: true,
  },
  explore: {
    threadCount: 20,
    desktopParticles: 138,
    mobileParticles: 56,
    focalX: 0.76,
    focalY: 0.48,
    bandY: 0.58,
    coherence: 0.66,
    interactive: false,
  },
  challenge: {
    threadCount: 18,
    desktopParticles: 118,
    mobileParticles: 48,
    focalX: 0.69,
    focalY: 0.52,
    bandY: 0.62,
    coherence: 0.58,
    interactive: false,
  },
  verify: {
    threadCount: 18,
    desktopParticles: 112,
    mobileParticles: 46,
    focalX: 0.63,
    focalY: 0.5,
    bandY: 0.64,
    coherence: 0.76,
    interactive: false,
  },
  preserve: {
    threadCount: 21,
    desktopParticles: 142,
    mobileParticles: 58,
    focalX: 0.7,
    focalY: 0.48,
    bandY: 0.65,
    coherence: 0.84,
    interactive: false,
  },
  compound: {
    threadCount: 24,
    desktopParticles: 205,
    mobileParticles: 76,
    focalX: 0.74,
    focalY: 0.46,
    bandY: 0.69,
    coherence: 0.94,
    interactive: true,
  },
};

const PARTICLE_COLORS = [
  'rgb(255 122 0)',
  'rgb(255 45 141)',
  'rgb(138 43 226)',
  'rgb(248 126 196)',
] as const;

const POINTER_RADIUS = 166;
const POINTER_RADIUS_SQUARED = POINTER_RADIUS * POINTER_RADIUS;
const POINTER_MAX_DISPLACEMENT = 32;
const POINTER_SPRING = 0.024;
const POINTER_DAMPING = 0.88;
const MAX_CANVAS_PIXEL_RATIO = 1.3;
const INTERACTIVE_PARTICLE_SCALE = 0.7;
const STATIC_PARTICLE_SCALE = 0.56;
const MAX_INTERACTIVE_PARTICLES = 170;
const MAX_STATIC_PARTICLES = 86;
const SETTLED_STRENGTH = 0.004;
const SETTLED_MOVEMENT = 0.035;
const SETTLED_RESIDUAL = 0.18;

function deterministicUnit(seed: number) {
  const value = Math.sin(seed * 12.9898 + 78.233) * 43758.5453;
  return value - Math.floor(value);
}

function seededRandom(seed: number) {
  let state = seed >>> 0;
  return () => {
    state += 0x6d2b79f5;
    let value = state;
    value = Math.imul(value ^ (value >>> 15), value | 1);
    value ^= value + Math.imul(value ^ (value >>> 7), value | 61);
    return ((value ^ (value >>> 14)) >>> 0) / 4294967296;
  };
}

function makeThreadPath(index: number, count: number, phase: VisualPhase, compact: boolean) {
  const settings = FIELD_SETTINGS[phase];
  const center = (count - 1) / 2;
  const normalized = center === 0 ? 0 : (index - center) / center;
  const compactScale = compact ? 0.72 : 1;
  const spread = (phase === 'compound' ? 73 : phase === 'scatter' ? 108 : 88) * compactScale;
  const offset = normalized * spread;
  const irregularity = (1 - settings.coherence) * 48;
  const seed = index + phase.length * 11;
  const base = phase === 'explore' ? 230 : phase === 'compound' ? 272 : 282;
  const firstLift = 48 + deterministicUnit(seed + 1) * 42;
  const secondDrop = 46 + deterministicUnit(seed + 2) * 50;
  const finalLift = 32 + deterministicUnit(seed + 3) * 42;
  const startY = base + offset * 1.12 + (deterministicUnit(seed + 4) - 0.5) * irregularity;
  const crestY = base - firstLift + offset * 0.92 + (deterministicUnit(seed + 5) - 0.5) * irregularity;
  const troughY = base + secondDrop + offset * 0.72 + (deterministicUnit(seed + 6) - 0.5) * irregularity;
  const focusY = base - 18 + offset * (0.18 + (1 - settings.coherence) * 0.15);
  const releaseY = base + finalLift + offset * 0.62 + (deterministicUnit(seed + 7) - 0.5) * irregularity * 0.7;
  const endY = base - 8 + offset * 0.96 + (deterministicUnit(seed + 8) - 0.5) * irregularity * 0.65;

  return [
    `M-90 ${startY.toFixed(1)}`,
    `C70 ${(startY - firstLift * 0.5).toFixed(1)} 205 ${(crestY + 25).toFixed(1)} 350 ${crestY.toFixed(1)}`,
    `S585 ${(troughY + 10).toFixed(1)} 720 ${troughY.toFixed(1)}`,
    `S865 ${(focusY - 10).toFixed(1)} 930 ${focusY.toFixed(1)}`,
    `S1070 ${(releaseY + 5).toFixed(1)} 1140 ${releaseY.toFixed(1)}`,
    `S1245 ${(endY - 4).toFixed(1)} 1290 ${endY.toFixed(1)}`,
  ].join(' ');
}

function createThreads(phase: VisualPhase, compact: boolean): SignalThread[] {
  const settings = FIELD_SETTINGS[phase];
  const count = compact ? Math.max(14, settings.threadCount - 4) : settings.threadCount;
  const center = (count - 1) / 2;

  return Array.from({ length: count }, (_, index) => {
    const distance = Math.abs(index - center);
    const tier = distance <= 1.8 ? 'primary' : distance <= 6 ? 'medium' : 'fine';
    const dotted = index % 4 === 0 || (tier === 'fine' && index % 3 === 0);
    const opacity =
      tier === 'primary'
        ? 0.82 + deterministicUnit(index + 40) * 0.15
        : tier === 'medium'
          ? 0.34 + deterministicUnit(index + 60) * 0.24
          : 0.12 + deterministicUnit(index + 80) * 0.17;
    const width = tier === 'primary' ? 1.65 : tier === 'medium' ? 0.92 : 0.54;

    return {
      d: makeThreadPath(index, count, phase, compact),
      tier,
      dotted,
      mobileHidden: count > 14 && index % 2 === 1,
      opacity,
      width,
      delay: -index * 0.37,
    };
  });
}

function createFallbackParticles(settings: FieldSettings, phase: VisualPhase, compact: boolean) {
  const count = compact ? 34 : settings.interactive ? 68 : 46;
  const phaseSeed = phase.length * 97;

  return Array.from({ length: count }, (_, index) => {
    const zone = deterministicUnit(phaseSeed + index * 7);
    let left = deterministicUnit(phaseSeed + index * 13 + 1) * 100;
    let top = deterministicUnit(phaseSeed + index * 17 + 2) * 100;

    if (zone > 0.72) {
      const angle = deterministicUnit(phaseSeed + index * 19 + 3) * Math.PI * 2;
      const radius = Math.pow(deterministicUnit(phaseSeed + index * 23 + 4), 1.8) * 24;
      left = settings.focalX * 100 + Math.cos(angle) * radius;
      top = settings.focalY * 100 + Math.sin(angle) * radius * 0.72;
    } else if (zone > 0.43) {
      const wave = settings.bandY * 100 + Math.sin(left * 0.075 + index * 0.46) * 7.5;
      top = wave + (deterministicUnit(phaseSeed + index * 29 + 5) - 0.5) * 21;
    }

    const focalDistance = Math.hypot(left / 100 - settings.focalX, top / 100 - settings.focalY);
    const focusBoost = Math.max(0, 1 - focalDistance / 0.46);
    const size = 0.8 + deterministicUnit(phaseSeed + index * 31 + 6) * 1.8 + focusBoost * 0.8;
    const opacity = 0.12 + deterministicUnit(phaseSeed + index * 37 + 7) * 0.38 + focusBoost * 0.18;

    return {
      left: Math.max(1, Math.min(99, left)),
      top: Math.max(2, Math.min(98, top)),
      size,
      opacity: Math.min(0.78, opacity),
      delay: -deterministicUnit(phaseSeed + index * 41 + 8) * 8,
      color: index % 5 === 0 ? 'amber' : index % 3 === 0 ? 'purple' : 'pink',
    };
  });
}

function createCanvasParticles(
  width: number,
  height: number,
  count: number,
  settings: FieldSettings,
  phase: VisualPhase,
): CanvasParticle[] {
  const random = seededRandom(phase.length * 1009 + Math.round(width) * 17 + Math.round(height));
  const particles: CanvasParticle[] = [];
  const minimumDimension = Math.min(width, height);

  for (let index = 0; index < count; index += 1) {
    const zone = random();
    let baseX = random() * width;
    let baseY = random() * height;

    if (zone >= 0.46 && zone < 0.82) {
      const normalizedX = baseX / width;
      const wave =
        settings.bandY +
        Math.sin(normalizedX * 7.4 + index * 0.19) * (phase === 'scatter' ? 0.075 : 0.052) +
        Math.sin(normalizedX * 15.6 + index * 0.11) * 0.025;
      baseY = height * (wave + (random() - 0.5) * (phase === 'scatter' ? 0.22 : 0.15));
    } else if (zone >= 0.82) {
      const angle = random() * Math.PI * 2;
      const radius = Math.pow(random(), 1.85) * minimumDimension * (phase === 'scatter' ? 0.31 : 0.25);
      baseX = settings.focalX * width + Math.cos(angle) * radius;
      baseY = settings.focalY * height + Math.sin(angle) * radius * 0.74;
    } else if (random() > 0.58) {
      const blend = 0.12 + random() * 0.32;
      baseX += (settings.focalX * width - baseX) * blend;
      baseY += (settings.focalY * height - baseY) * blend * 0.72;
    }

    baseX = Math.max(0, Math.min(width, baseX));
    baseY = Math.max(0, Math.min(height, baseY));

    const focalDistance = Math.hypot(baseX / width - settings.focalX, baseY / height - settings.focalY);
    const focusBoost = Math.pow(Math.max(0, 1 - focalDistance / 0.48), 1.65);
    const depth = 0.42 + random() * 0.58;
    const size = 0.55 + random() * 1.55 + focusBoost * 0.9;
    const alpha = Math.min(0.88, 0.09 + random() * 0.42 + focusBoost * 0.31);

    particles.push({
      baseX,
      baseY,
      x: baseX,
      y: baseY,
      velocityX: 0,
      velocityY: 0,
      driftX: 1.5 + random() * 7 * depth,
      driftY: 1.5 + random() * 6 * depth,
      speed: 0.22 + random() * 0.42,
      phase: random() * Math.PI * 2,
      size,
      alpha,
      depth,
      colorIndex: Math.floor(random() * PARTICLE_COLORS.length),
    });
  }

  return particles;
}

function drawParticles(
  context: CanvasRenderingContext2D,
  particles: CanvasParticle[],
  logicalWidth: number,
  logicalHeight: number,
  timestamp: number,
  pointerX: number,
  pointerY: number,
  pointerStrength: number,
  staticOnly: boolean,
  driftEnabled: boolean,
  delta: number,
): ParticleMotion {
  context.clearRect(0, 0, logicalWidth, logicalHeight);
  context.save();
  context.globalCompositeOperation = 'lighter';

  const time = timestamp * 0.001;
  const damping = staticOnly ? 1 : Math.pow(POINTER_DAMPING, delta);
  let maxMovement = 0;
  let maxResidual = 0;

  for (const particle of particles) {
    const idleX =
      staticOnly || !driftEnabled
        ? particle.baseX
        : particle.baseX + Math.sin(time * particle.speed + particle.phase) * particle.driftX;
    const idleY =
      staticOnly || !driftEnabled
        ? particle.baseY
        : particle.baseY + Math.cos(time * particle.speed * 0.82 + particle.phase) * particle.driftY;
    let targetX = idleX;
    let targetY = idleY;
    let influence = 0;

    if (!staticOnly && pointerStrength > 0.005) {
      const deltaX = pointerX - particle.x;
      const deltaY = pointerY - particle.y;
      const distanceSquared = deltaX * deltaX + deltaY * deltaY;

      if (distanceSquared < POINTER_RADIUS_SQUARED && distanceSquared > 0.000001) {
        const distance = Math.sqrt(distanceSquared);
        const normalized = 1 - distance / POINTER_RADIUS;
        influence = normalized * normalized * pointerStrength;
        const displacement = POINTER_MAX_DISPLACEMENT * particle.depth * influence;
        targetX += (deltaX / distance) * displacement;
        targetY += (deltaY / distance) * displacement;
      }
    }

    if (staticOnly) {
      particle.x = targetX;
      particle.y = targetY;
      particle.velocityX = 0;
      particle.velocityY = 0;
    } else {
      particle.velocityX += (targetX - particle.x) * POINTER_SPRING * delta;
      particle.velocityY += (targetY - particle.y) * POINTER_SPRING * delta;
      particle.velocityX *= damping;
      particle.velocityY *= damping;
      particle.x += particle.velocityX * delta;
      particle.y += particle.velocityY * delta;

      const movement = Math.abs(particle.velocityX) + Math.abs(particle.velocityY);
      const residual = Math.abs(targetX - particle.x) + Math.abs(targetY - particle.y);
      if (movement > maxMovement) maxMovement = movement;
      if (residual > maxResidual) maxResidual = residual;
    }

    const color = PARTICLE_COLORS[particle.colorIndex] ?? PARTICLE_COLORS[1];
    const twinkle = staticOnly || !driftEnabled ? 1 : 0.8 + Math.sin(time * (0.8 + particle.speed) + particle.phase) * 0.2;
    const alpha = Math.min(1, particle.alpha * twinkle + influence * 0.4);
    const radius = particle.size * (1 + influence * 0.3);
    const shouldGlow = influence > 0.08 || (particle.depth > 0.86 && particle.alpha > 0.52);

    context.fillStyle = color;

    if (shouldGlow) {
      context.globalAlpha = Math.min(0.22, alpha * (0.13 + influence * 0.14));
      context.beginPath();
      context.arc(particle.x, particle.y, radius * (2.35 + influence * 0.65), 0, Math.PI * 2);
      context.fill();
    }

    context.globalAlpha = alpha;
    context.beginPath();
    context.arc(particle.x, particle.y, radius, 0, Math.PI * 2);
    context.fill();
  }

  context.restore();
  return { maxMovement, maxResidual };
}

export function VisualField({ phase, className = '', compact = false }: VisualFieldProps) {
  const rootRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const id = useId().replaceAll(':', '');
  const settings = FIELD_SETTINGS[phase];
  const threads = useMemo(() => createThreads(phase, compact), [compact, phase]);
  const fallbackParticles = useMemo(
    () => createFallbackParticles(settings, phase, compact),
    [compact, phase, settings],
  );
  const gradientId = `signal-gradient-${phase}-${id}`;
  const glowId = `signal-glow-${phase}-${id}`;

  useEffect(() => {
    const root = rootRef.current;
    const canvas = canvasRef.current;
    if (!root || !canvas) return;

    const context = canvas.getContext('2d', { alpha: true, desynchronized: true });
    if (!context) return;

    const host = root.closest<HTMLElement>('section') ?? root;
    const reducedMotionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    const finePointerQuery = window.matchMedia('(hover: hover) and (pointer: fine)');
    let reducedMotion = reducedMotionQuery.matches;
    let finePointer = finePointerQuery.matches;
    let width = 1;
    let height = 1;
    let particles: CanvasParticle[] = [];
    let animationFrame = 0;
    let lastTimestamp = 0;
    let isVisible = true;
    let pointerX = 0;
    let pointerY = 0;
    let pointerStrength = 0;
    let pointerTargetStrength = 0;
    let pointerActive = false;
    let pointerUpdatePending = false;
    let pendingClientX = 0;
    let pendingClientY = 0;
    let boundsDirty = true;
    let bounds: CachedBounds = { left: 0, top: 0, width: 1, height: 1 };

    const isInteractive = () => settings.interactive && finePointer && !reducedMotion && !compact;

    const refreshBounds = () => {
      const nextBounds = root.getBoundingClientRect();
      bounds = {
        left: nextBounds.left,
        top: nextBounds.top,
        width: Math.max(1, nextBounds.width),
        height: Math.max(1, nextBounds.height),
      };
      boundsDirty = false;
    };

    const renderStatic = () => {
      drawParticles(context, particles, width, height, 0, 0, 0, 0, true, false, 1);
    };

    const applyPendingPointer = () => {
      if (!pointerUpdatePending || !isInteractive()) return;
      pointerUpdatePending = false;
      if (boundsDirty) refreshBounds();

      const nextX = pendingClientX - bounds.left;
      const nextY = pendingClientY - bounds.top;

      if (nextX < 0 || nextX > bounds.width || nextY < 0 || nextY > bounds.height) {
        pointerTargetStrength = 0;
        if (pointerActive) {
          pointerActive = false;
          root.classList.remove('visual-field--pointer-active');
        }
        return;
      }

      pointerX = nextX;
      pointerY = nextY;
      pointerTargetStrength = 1;
      root.style.setProperty('--signal-pointer-x', `${nextX.toFixed(1)}px`);
      root.style.setProperty('--signal-pointer-y', `${nextY.toFixed(1)}px`);
      if (!pointerActive) {
        pointerActive = true;
        root.classList.add('visual-field--pointer-active');
      }
    };

    const frame = (timestamp: number) => {
      animationFrame = 0;
      if (!isVisible || reducedMotion || !isInteractive()) return;

      applyPendingPointer();
      const delta = lastTimestamp === 0 ? 1 : Math.min(2, (timestamp - lastTimestamp) / 16.667);
      lastTimestamp = timestamp;
      pointerStrength += (pointerTargetStrength - pointerStrength) * Math.min(1, 0.14 * delta);

      const motion = drawParticles(
        context,
        particles,
        width,
        height,
        timestamp,
        pointerX,
        pointerY,
        pointerStrength,
        false,
        pointerTargetStrength > 0,
        delta,
      );

      const settled =
        pointerTargetStrength === 0 &&
        pointerStrength < SETTLED_STRENGTH &&
        motion.maxMovement < SETTLED_MOVEMENT &&
        motion.maxResidual < SETTLED_RESIDUAL;

      if (settled) {
        pointerStrength = 0;
        renderStatic();
        return;
      }

      animationFrame = window.requestAnimationFrame(frame);
    };

    const start = () => {
      if (animationFrame !== 0 || !isVisible || reducedMotion || !isInteractive()) return;
      lastTimestamp = 0;
      animationFrame = window.requestAnimationFrame(frame);
    };

    const stop = () => {
      if (animationFrame === 0) return;
      window.cancelAnimationFrame(animationFrame);
      animationFrame = 0;
    };

    const resize = () => {
      refreshBounds();
      width = Math.max(1, Math.round(bounds.width));
      height = Math.max(1, Math.round(bounds.height));
      const pixelRatio = Math.min(window.devicePixelRatio || 1, MAX_CANVAS_PIXEL_RATIO);
      canvas.width = Math.max(1, Math.round(width * pixelRatio));
      canvas.height = Math.max(1, Math.round(height * pixelRatio));
      context.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);

      const baseCount = width <= 720 ? settings.mobileParticles : settings.desktopParticles;
      const qualityScale = isInteractive() ? INTERACTIVE_PARTICLE_SCALE : STATIC_PARTICLE_SCALE;
      const cap = isInteractive() ? MAX_INTERACTIVE_PARTICLES : MAX_STATIC_PARTICLES;
      const compactScale = compact ? 0.78 : 1;
      const count = Math.max(28, Math.min(cap, Math.round(baseCount * qualityScale * compactScale)));
      particles = createCanvasParticles(width, height, count, settings, phase);
      root.dataset.canvasParticles = String(count);
      root.dataset.renderMode = isInteractive() ? 'pointer-on-demand' : 'static';
      renderStatic();
      if (pointerTargetStrength > 0) start();
    };

    const handlePointerMove = (event: PointerEvent) => {
      if (!isInteractive() || event.pointerType === 'touch') return;
      pendingClientX = event.clientX;
      pendingClientY = event.clientY;
      pointerUpdatePending = true;
      start();
    };

    const handlePointerLeave = () => {
      pointerUpdatePending = false;
      pointerTargetStrength = 0;
      if (pointerActive) {
        pointerActive = false;
        root.classList.remove('visual-field--pointer-active');
      }
      start();
    };

    const handleReducedMotion = (event: MediaQueryListEvent) => {
      reducedMotion = event.matches;
      root.dataset.reducedMotion = reducedMotion ? 'true' : 'false';
      pointerUpdatePending = false;
      pointerTargetStrength = 0;
      pointerStrength = 0;
      pointerActive = false;
      root.classList.remove('visual-field--pointer-active');
      stop();
      renderStatic();
    };

    const handleFinePointer = (event: MediaQueryListEvent) => {
      finePointer = event.matches;
      root.dataset.renderMode = isInteractive() ? 'pointer-on-demand' : 'static';
      if (!finePointer) handlePointerLeave();
      resize();
    };

    const markBoundsDirty = () => {
      boundsDirty = true;
    };

    const visibilityObserver = new IntersectionObserver(
      ([entry]) => {
        isVisible = entry?.isIntersecting ?? true;
        if (!isVisible) stop();
        else if (pointerTargetStrength > 0 || pointerStrength > SETTLED_STRENGTH) start();
      },
      { rootMargin: '80px 0px', threshold: 0.01 },
    );

    const resizeObserver = new ResizeObserver(resize);
    visibilityObserver.observe(root);
    resizeObserver.observe(root);
    host.addEventListener('pointermove', handlePointerMove, { passive: true });
    host.addEventListener('pointerleave', handlePointerLeave);
    window.addEventListener('scroll', markBoundsDirty, { passive: true });
    reducedMotionQuery.addEventListener('change', handleReducedMotion);
    finePointerQuery.addEventListener('change', handleFinePointer);
    root.dataset.reducedMotion = reducedMotion ? 'true' : 'false';
    resize();

    return () => {
      stop();
      visibilityObserver.disconnect();
      resizeObserver.disconnect();
      host.removeEventListener('pointermove', handlePointerMove);
      host.removeEventListener('pointerleave', handlePointerLeave);
      window.removeEventListener('scroll', markBoundsDirty);
      reducedMotionQuery.removeEventListener('change', handleReducedMotion);
      finePointerQuery.removeEventListener('change', handleFinePointer);
    };
  }, [compact, phase, settings]);

  return (
    <div
      ref={rootRef}
      className={`visual-field visual-field--${phase} ${compact ? 'visual-field--compact' : ''} ${className}`.trim()}
      data-visual-layer={phase}
      data-pointer-interaction={settings.interactive && !compact ? 'enabled' : 'disabled'}
      data-render-strategy="on-demand"
      aria-hidden="true"
    >
      <div className="visual-field__bloom" />
      <div className="visual-field__fallback-particles">
        {fallbackParticles.map((particle, index) => (
          <span
            key={`${phase}-${index}`}
            className={`visual-field__fallback-particle visual-field__fallback-particle--${particle.color}`}
            style={{
              left: `${particle.left}%`,
              top: `${particle.top}%`,
              width: `${particle.size}px`,
              height: `${particle.size}px`,
              opacity: particle.opacity,
              animationDelay: `${particle.delay}s`,
            }}
          />
        ))}
      </div>
      <canvas ref={canvasRef} className="visual-field__particle-canvas" />
      <svg
        className="visual-field__waves visual-field__waves--threaded"
        viewBox="0 0 1200 420"
        preserveAspectRatio="none"
        focusable="false"
      >
        <defs>
          <linearGradient id={gradientId} x1="0" y1="0" x2="1" y2="0">
            <stop offset="0" stopColor="#FF7A00" />
            <stop offset="0.52" stopColor="#FF2D8D" />
            <stop offset="1" stopColor="#8A2BE2" />
          </linearGradient>
          <filter id={glowId} x="-20%" y="-60%" width="140%" height="220%">
            <feGaussianBlur stdDeviation="4.8" />
          </filter>
        </defs>
        <g className="visual-field__thread-glows">
          {threads
            .filter((thread) => thread.tier === 'primary')
            .map((thread, index) => (
              <path
                key={`glow-${index}`}
                className="visual-field__thread visual-field__thread--glow"
                d={thread.d}
                stroke={`url(#${gradientId})`}
                filter={`url(#${glowId})`}
                data-mobile-hidden={thread.mobileHidden ? 'true' : 'false'}
              />
            ))}
        </g>
        <g className="visual-field__threads">
          {threads.map((thread, index) => (
            <path
              key={`thread-${index}`}
              className={`visual-field__thread visual-field__thread--${thread.tier} ${thread.dotted ? 'visual-field__thread--dotted' : ''}`.trim()}
              d={thread.d}
              stroke={`url(#${gradientId})`}
              vectorEffect="non-scaling-stroke"
              data-mobile-hidden={thread.mobileHidden ? 'true' : 'false'}
              style={{
                opacity: thread.opacity,
                strokeWidth: thread.width,
                animationDelay: `${thread.delay}s`,
              }}
            />
          ))}
        </g>
      </svg>
      <div className="visual-field__rings">
        <span />
        <span />
        <span />
      </div>
      <div className="visual-field__pointer-light" />
    </div>
  );
}
