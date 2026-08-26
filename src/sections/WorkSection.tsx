import { SectionLabel } from '../components/SectionLabel';
import { StatusBadge } from '../components/StatusBadge';
import { site } from '../content/site';

function RingsVisual() {
  return (
    <div className="system-visual system-visual--rings" aria-hidden="true">
      <span className="system-orbit system-orbit--one" />
      <span className="system-orbit system-orbit--two" />
      <span className="system-orbit system-orbit--three" />
      <span className="system-orbit system-orbit--four" />
      <span className="system-orbit__core" />
      <span className="system-orbit__node system-orbit__node--one" />
      <span className="system-orbit__node system-orbit__node--two" />
      <span className="system-orbit__node system-orbit__node--three" />
    </div>
  );
}

function NetworkVisual() {
  return (
    <svg className="system-visual system-visual--network" viewBox="0 0 520 220" aria-hidden="true">
      <defs>
        <linearGradient id="network-gradient" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#FF7A00" />
          <stop offset="0.5" stopColor="#FF2D8D" />
          <stop offset="1" stopColor="#8A2BE2" />
        </linearGradient>
      </defs>
      <path d="M18 168 72 136l52 17 55-79 47 56 62-87 58 72 70-29 84 43" />
      <path d="M18 186 94 166l59 12 73-35 52 17 68-24 72 19 82-11" />
      <path d="M72 136 94 166M124 153l29 25M179 74l47 69M226 130l52 30M288 43l58 93M346 115l72 40M416 86l2 69" />
      {[
        [18, 168],
        [72, 136],
        [94, 166],
        [124, 153],
        [153, 178],
        [179, 74],
        [226, 130],
        [226, 143],
        [278, 160],
        [288, 43],
        [346, 115],
        [346, 136],
        [416, 86],
        [418, 155],
        [500, 129],
        [500, 144],
      ].map(([x, y]) => (
        <circle key={`${x}-${y}`} cx={x} cy={y} r="4" />
      ))}
    </svg>
  );
}

export function WorkSection() {
  return (
    <section id="work" className="work-section section" data-visual-phase="preserve">
      <div className="shell shell--wide">
        <div className="work-section__intro" data-reveal>
          <SectionLabel>{site.work.label}</SectionLabel>
          <h2 className="display-heading display-heading--compact">
            <span>{site.work.headline[0]}</span>
            <span>{site.work.headline[1]}</span>
          </h2>
          <p>{site.work.intro}</p>
        </div>

        <div className="systems-grid">
          {site.work.systems.map((system) => (
            <article className="system-card" key={system.title} data-reveal tabIndex={0}>
              <div className="system-card__header">
                <div>
                  <p>{system.descriptor}</p>
                  <h3>{system.title}</h3>
                </div>
                <StatusBadge>{system.status}</StatusBadge>
              </div>
              {system.visual === 'rings' ? <RingsVisual /> : <NetworkVisual />}
              <div className="system-card__copy">
                <p>{system.body}</p>
                {'detail' in system ? <p className="system-card__detail">{system.detail}</p> : null}
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
