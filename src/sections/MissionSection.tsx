import { GradientText } from '../components/GradientText';
import { SectionLabel } from '../components/SectionLabel';
import { VisualField } from '../components/VisualField';
import { site } from '../content/site';

export function MissionSection() {
  return (
    <section id="mission" className="mission-section section" data-visual-phase="explore">
      <VisualField phase="explore" compact className="mission-section__field" />
      <div className="shell shell--wide mission-section__layout">
        <div className="mission-section__copy" data-reveal>
          <SectionLabel>{site.mission.label}</SectionLabel>
          <h2 className="display-heading">
            <span>{site.mission.headline[0]}</span>
            <GradientText>{site.mission.headline[1]}</GradientText>
          </h2>
          <p className="body-large">{site.mission.body}</p>

          <div className="mission-section__contrast" data-visual-phase="challenge">
            {site.whyCumulative.contrasts.map((contrast, index) => (
              <article key={contrast.title} className={`mission-contrast mission-contrast--${contrast.tone}`}>
                <span className="mission-contrast__index">0{index + 1}</span>
                <div>
                  <h3>{contrast.title}</h3>
                  <p>{contrast.body}</p>
                </div>
              </article>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
