import { BrandSymbol } from '../components/BrandSymbol';
import { GradientText } from '../components/GradientText';
import { VisualField } from '../components/VisualField';
import { site } from '../content/site';

export function HeroSection() {
  return (
    <section id="top" className="hero-section" data-visual-phase="scatter">
      <VisualField phase="scatter" className="hero-section__field" />
      <div className="hero-section__horizon" aria-hidden="true" />
      <div className="shell shell--wide hero-section__inner">
        <div className="hero-section__copy" data-reveal>
          <p className="hero-section__eyebrow">{site.hero.eyebrow}</p>
          <h1>
            <span>{site.hero.headline[0]}</span>
            <span>{site.hero.headline[1]}</span>
            <GradientText>{site.hero.headline[2]}</GradientText>
          </h1>
          <p className="hero-section__body">{site.hero.body}</p>
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
          <div className="hero-section__mark-orbit hero-section__mark-orbit--outer" />
          <div className="hero-section__mark-orbit hero-section__mark-orbit--inner" />
          <BrandSymbol />
        </div>
      </div>

      <a className="scroll-indicator" href="#mission">
        <span>Scroll to explore</span>
        <i aria-hidden="true" />
      </a>
    </section>
  );
}
