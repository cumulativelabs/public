import { LineIcon } from '../components/LineIcon';
import { SectionLabel } from '../components/SectionLabel';
import { site } from '../content/site';

export function ApproachSection() {
  return (
    <section id="approach" className="approach-section section" data-visual-phase="verify">
      <div className="shell shell--wide">
        <div className="section-heading section-heading--center" data-reveal>
          <SectionLabel>{site.approach.label}</SectionLabel>
          <h2>{site.approach.headline}</h2>
        </div>

        <ol className="approach-path">
          {site.approach.stages.map((stage, index) => (
            <li key={stage.title} className="approach-stage" data-reveal tabIndex={0}>
              <span className="approach-stage__number">{stage.number}</span>
              <div className="approach-stage__icon">
                <LineIcon name={stage.icon} />
              </div>
              <h3>{stage.title}</h3>
              <p>{stage.body}</p>
              {index < site.approach.stages.length - 1 ? (
                <span className="approach-stage__connector" aria-hidden="true">
                  <i />
                </span>
              ) : null}
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
