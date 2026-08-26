type BrandSymbolProps = {
  className?: string;
  decorative?: boolean;
};

const brandSymbolSource = `${import.meta.env.BASE_URL}brand/cumulative-labs-symbol.svg`;

export function BrandSymbol({ className = '', decorative = true }: BrandSymbolProps) {
  return (
    <img
      className={`brand-symbol ${className}`.trim()}
      src={brandSymbolSource}
      alt={decorative ? '' : 'Cumulative Labs'}
      aria-hidden={decorative || undefined}
      draggable="false"
    />
  );
}
