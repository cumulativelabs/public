import type { ReactNode } from 'react';

type IconName =
  | 'compass'
  | 'challenge'
  | 'verify'
  | 'preserve'
  | 'improve'
  | 'evidence'
  | 'layers'
  | 'measure'
  | 'cycle'
  | 'integrity';

type LineIconProps = {
  name: IconName;
};

export function LineIcon({ name }: LineIconProps) {
  const common = {
    fill: 'none',
    stroke: 'currentColor',
    strokeWidth: 1.65,
    strokeLinecap: 'round' as const,
    strokeLinejoin: 'round' as const,
  };

  const art = {
    compass: (
      <>
        <circle cx="24" cy="24" r="15" {...common} />
        <path d="m29.5 18.5-3.3 7.7-7.7 3.3 3.3-7.7 7.7-3.3Z" {...common} />
        <circle cx="24" cy="24" r="1.5" {...common} />
      </>
    ),
    challenge: (
      <>
        <path d="M12 15.5 24 9l12 6.5v16L24 39l-12-7.5v-16Z" {...common} />
        <path d="m17 25 4 4 10-11" {...common} />
        <path d="M24 9v6.5M12 15.5l5.5 3.2M36 15.5l-5.5 3.2" {...common} />
      </>
    ),
    verify: (
      <>
        <circle cx="24" cy="24" r="15" {...common} />
        <path d="m17.5 24 4.3 4.3L31 19" {...common} />
        <path d="M24 5v4M24 39v4M5 24h4M39 24h4" {...common} />
      </>
    ),
    preserve: (
      <>
        <rect x="13" y="20" width="22" height="18" rx="3" {...common} />
        <path d="M18 20v-4a6 6 0 0 1 12 0v4" {...common} />
        <path d="M24 27v5" {...common} />
        <circle cx="24" cy="26" r="1.5" {...common} />
      </>
    ),
    improve: (
      <>
        <path d="M12 34 21 25l6 5 10-14" {...common} />
        <path d="M29 16h8v8" {...common} />
        <path d="M11 39h27" {...common} />
      </>
    ),
    evidence: (
      <>
        <circle cx="21" cy="21" r="10" {...common} />
        <path d="m28.5 28.5 8 8" {...common} />
        <path d="M16 21h10M21 16v10" {...common} />
        <circle cx="35.5" cy="12.5" r="2.5" {...common} />
      </>
    ),
    layers: (
      <>
        <path d="m24 10 14 7-14 7-14-7 14-7Z" {...common} />
        <path d="m12 24 12 6 12-6M12 31l12 6 12-6" {...common} />
      </>
    ),
    measure: (
      <>
        <path d="M11 37V25M19 37V20M27 37V15M35 37V10" {...common} />
        <path d="m11 18 7-6 7 3 11-9" {...common} />
        <path d="M30 6h6v6" {...common} />
      </>
    ),
    cycle: (
      <>
        <path d="M14 24a10 10 0 0 1 18-6" {...common} />
        <path d="m30 12 3 6-6 1" {...common} />
        <path d="M34 24a10 10 0 0 1-18 6" {...common} />
        <path d="m18 36-3-6 6-1" {...common} />
      </>
    ),
    integrity: (
      <>
        <path d="M24 8 36 13v10c0 8-5 14-12 17-7-3-12-9-12-17V13l12-5Z" {...common} />
        <path d="m18 24 4 4 8-9" {...common} />
      </>
    ),
  } satisfies Record<IconName, ReactNode>;

  return (
    <svg className="line-icon" viewBox="0 0 48 48" aria-hidden="true" focusable="false">
      {art[name]}
    </svg>
  );
}
