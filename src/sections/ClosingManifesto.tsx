import { BrandSymbol } from '../components/BrandSymbol';
import { GradientText } from '../components/GradientText';
import { contactHref, site } from '../content/site';

export function ClosingManifesto() {
  return (
    <footer id="contact" className="closing-section section" data-visual-phase="compound">
      <div className="shell shell--wide closing-section__master-grid">
        <div className="closing-section__copy" data-reveal>
          <h2>
            <span>{site.closing.headline[0]}{' '}</span>
            <span>{site.closing.headline[1]}{' '}</span>
            <GradientText>{site.closing.headline[2]}</GradientText>
          </h2>
          <p className="closing-section__body">{site.closing.body}</p>
          <a className="button button--secondary" href={contactHref}>
            {site.closing.actionLabel}
            <span aria-hidden="true">→</span>
          </a>
        </div>

        <div className="closing-section__mark" aria-hidden="true" data-reveal>
          <span className="closing-section__orbit closing-section__orbit--one" />
          <span className="closing-section__orbit closing-section__orbit--two" />
          <span className="closing-section__orbit closing-section__orbit--three" />
          <BrandSymbol />
        </div>

        <div className="closing-section__brand" data-reveal>
          <p className="closing-section__company">{site.companyName}</p>
          <p className="closing-section__tagline">{site.tagline}</p>
          <span className="closing-section__divider" aria-hidden="true" />
          <a href={contactHref}>{site.contact.email}</a>
        </div>
      </div>

      <div className="shell shell--wide closing-section__bottom">
        <p>{site.footer.copyright}</p>
        <p>{site.footer.signature}</p>
      </div>
    </footer>
  );
}
