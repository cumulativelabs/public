import { SectionLabel } from '../components/SectionLabel';
import { StatusBadge } from '../components/StatusBadge';
import { site } from '../content/site';

export function WorkSection() {
  return (
    <section id="work" className="work-section section" data-visual-phase="preserve">
      <div className="shell shell--wide work-section__master-grid">
        <div className="work-section__intro">
          <SectionLabel>{site.work.label}</SectionLabel>
          <h2><span>{site.work.headline[0]} </span><span>{site.work.headline[1]}</span></h2>
          <p>{site.work.intro}</p>
        </div>
        {site.work.systems.map((system, index) => (
          <article id={index === 1 ? 'league-vector' : undefined}
            className={`system-card ${index === 1 ? 'system-card--league' : 'system-card--research'}`}
            key={system.title}>
            <div className="system-card__header">
              <p>{system.descriptor}</p>
              <StatusBadge>{system.status}</StatusBadge>
            </div>
            <h3>{system.title}</h3>
            <div className="system-card__copy">
              <p>{system.body}</p>
              <p className="system-card__detail">{system.detail}</p>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
