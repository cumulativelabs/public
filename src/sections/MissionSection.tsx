import { GradientText } from '../components/GradientText';
import { SectionLabel } from '../components/SectionLabel';
import { VisualField } from '../components/VisualField';
import { site } from '../content/site';

export function MissionSection() {
  return (
    <section id="mission" className="mission-section section" data-visual-phase="explore">
      <div className="shell mission-section__grid">
        <div className="mission-section__copy" data-reveal>
          <SectionLabel>{site.mission.label}</SectionLabel>
          <h2 className="display-heading">
            <span>{site.mission.headline[0]}</span>
            <GradientText>{site.mission.headline[1]}</GradientText>
          </h2>
          <p className="body-large">{site.mission.body}</p>
        </div>
        <div className="mission-section__visual" data-reveal>
          <VisualField phase="explore" compact />
          <div className="mission-section__signal" aria-hidden="true">
            <span />
            <span />
            <span />
            <span />
          </div>
        </div>
      </div>
    </section>
  );
}
