type VisualPhase = 'scatter' | 'explore' | 'challenge' | 'verify' | 'preserve' | 'compound';

type VisualFieldProps = {
  phase: VisualPhase;
  className?: string;
  compact?: boolean;
};

const particles = [
  [7, 22, 0.52],
  [14, 64, 0.3],
  [22, 40, 0.68],
  [31, 78, 0.42],
  [42, 17, 0.38],
  [51, 58, 0.62],
  [61, 31, 0.44],
  [68, 72, 0.7],
  [78, 45, 0.36],
  [87, 19, 0.56],
  [92, 64, 0.4],
] as const;

export function VisualField({ phase, className = '', compact = false }: VisualFieldProps) {
  return (
    <div
      className={`visual-field visual-field--${phase} ${compact ? 'visual-field--compact' : ''} ${className}`.trim()}
      data-visual-layer={phase}
      aria-hidden="true"
    >
      <div className="visual-field__bloom" />
      <svg className="visual-field__waves" viewBox="0 0 1200 420" preserveAspectRatio="none" focusable="false">
        <defs>
          <linearGradient id={`wave-${phase}`} x1="0" y1="0" x2="1" y2="0">
            <stop offset="0" stopColor="#FF7A00" />
            <stop offset="0.52" stopColor="#FF2D8D" />
            <stop offset="1" stopColor="#8A2BE2" />
          </linearGradient>
          <filter id={`soft-${phase}`} x="-20%" y="-50%" width="140%" height="200%">
            <feGaussianBlur stdDeviation="5" />
          </filter>
        </defs>
        <path
          className="visual-field__wave visual-field__wave--glow"
          d="M-40 304C120 218 245 386 420 292S710 177 862 260s254 107 400-4"
          stroke={`url(#wave-${phase})`}
          filter={`url(#soft-${phase})`}
        />
        <path
          className="visual-field__wave visual-field__wave--primary"
          d="M-40 304C120 218 245 386 420 292S710 177 862 260s254 107 400-4"
          stroke={`url(#wave-${phase})`}
        />
        <path
          className="visual-field__wave visual-field__wave--secondary"
          d="M-20 346C130 260 262 400 425 326S700 214 870 294s266 86 376 16"
          stroke={`url(#wave-${phase})`}
        />
        <path
          className="visual-field__wave visual-field__wave--tertiary"
          d="M-10 265C142 186 288 345 452 250s302-120 462-38 225 88 337 16"
          stroke={`url(#wave-${phase})`}
        />
      </svg>
      <div className="visual-field__rings">
        <span />
        <span />
        <span />
      </div>
      <div className="visual-field__particles">
        {particles.map(([left, top, opacity], index) => (
          <span
            key={`${left}-${top}`}
            style={{
              left: `${left}%`,
              top: `${top}%`,
              opacity,
              animationDelay: `${index * -0.43}s`,
            }}
          />
        ))}
      </div>
    </div>
  );
}
