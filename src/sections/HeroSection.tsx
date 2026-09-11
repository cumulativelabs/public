import { BrandSymbol } from '../components/BrandSymbol';
import { GradientText } from '../components/GradientText';
import { HeroKnowledgeField } from '../components/HeroKnowledgeField';
import { site } from '../content/site';

export function HeroSection() {
  return (
    <section id="top" className="hero-section" data-visual-phase="scatter">
      <div className="shell shell--wide hero-section__inner">
        <div className="hero-section__copy" data-reveal>
          <p className="hero-section__eyebrow">{site.hero.eyebrow}</p>
          <h1>
            <span>{site.hero.headline[0]}{' '}</span>
            <span>{site.hero.headline[1]}{' '}</span>
            <GradientText>{site.hero.headline[2]}</GradientText>
          </h1>
          <p className="hero-section__body">{site.hero.body}</p>
          <p className="hero-section__support">{site.hero.support}</p>
          <div className="hero-section__actions">
            <a className="button button--primary" href={site.hero.primaryAction.href}>
              {site.hero.primaryAction.label}
              <span aria-hidden="true">↗</span>
            </a>
            <a className="button button--secondary" href={site.hero.secondaryAction.href}>
              {site.hero.secondaryAction.label}
            </a>
          </div>
        </div>

        <div className="hero-section__mark" aria-hidden="true" data-reveal>
          <HeroKnowledgeField />
          <BrandSymbol />
        </div>
      </div>

      <a className="scroll-indicator" href="#work">
        <span>Scroll to explore</span>
        <i aria-hidden="true" />
      </a>
    </section>
  );
}
