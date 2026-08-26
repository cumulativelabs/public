type BrandSymbolProps = {
  className?: string;
  decorative?: boolean;
};

export function BrandSymbol({ className = '', decorative = true }: BrandSymbolProps) {
  return (
    <img
      className={`brand-symbol ${className}`.trim()}
      src="/brand/cumulative-labs-symbol.svg"
      alt={decorative ? '' : 'Cumulative Labs'}
      aria-hidden={decorative || undefined}
      draggable="false"
    />
  );
}
