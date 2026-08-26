import { LineIcon } from '../components/LineIcon';
import { SectionLabel } from '../components/SectionLabel';
import { site } from '../content/site';

export function PrinciplesSection() {
  return (
    <section id="principles" className="principles-section section" data-visual-phase="compound">
      <div className="shell shell--wide">
        <div className="section-heading section-heading--center" data-reveal>
          <SectionLabel>{site.principles.label}</SectionLabel>
          <h2>{site.principles.headline}</h2>
        </div>

        <div className="principles-grid">
          {site.principles.items.map((principle, index) => (
            <article className="principle-card" key={principle.title} data-reveal tabIndex={0}>
              <span className="principle-card__number">0{index + 1}</span>
              <div className="principle-card__icon">
                <LineIcon name={principle.icon} />
              </div>
              <h3>{principle.title}</h3>
              <p>{principle.body}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
