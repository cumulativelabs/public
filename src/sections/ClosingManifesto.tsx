import { BrandSymbol } from '../components/BrandSymbol';
import { GradientText } from '../components/GradientText';
import { VisualField } from '../components/VisualField';
import { contactHref, site } from '../content/site';

export function ClosingManifesto() {
  return (
    <section className="closing-section section" data-visual-phase="compound">
      <VisualField phase="compound" className="closing-section__field" />
      <div className="shell closing-section__grid">
        <div className="closing-section__copy" data-reveal>
          <h2>
            <span>{site.closing.headline[0]}</span>
            <span>{site.closing.headline[1]}</span>
            <GradientText>{site.closing.headline[2]}</GradientText>
          </h2>
          <a className="button button--primary" href={contactHref}>
            {site.closing.actionLabel}
            <span aria-hidden="true">↗</span>
          </a>
        </div>
        <div className="closing-section__mark" aria-hidden="true" data-reveal>
          <span className="closing-section__orbit closing-section__orbit--one" />
          <span className="closing-section__orbit closing-section__orbit--two" />
          <span className="closing-section__orbit closing-section__orbit--three" />
          <BrandSymbol />
        </div>
      </div>
    </section>
  );
}
