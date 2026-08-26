import { SectionLabel } from '../components/SectionLabel';
import { site } from '../content/site';

export function ProvingGroundSection() {
  return (
    <section className="proving-section section" data-visual-phase="preserve">
      <div className="shell proving-section__grid">
        <div className="proving-section__copy" data-reveal>
          <SectionLabel>{site.provingGround.label}</SectionLabel>
          <h2>{site.provingGround.headline}</h2>
          <p className="body-large">{site.provingGround.body}</p>
          <p className="proving-section__support">{site.provingGround.support}</p>
        </div>

        <div className="proving-visual" aria-hidden="true" data-reveal>
          <svg viewBox="0 0 640 520" preserveAspectRatio="xMidYMid meet">
            <defs>
              <linearGradient id="trajectory-gradient" x1="0" y1="1" x2="1" y2="0">
                <stop offset="0" stopColor="#FF7A00" />
                <stop offset="0.52" stopColor="#FF2D8D" />
                <stop offset="1" stopColor="#8A2BE2" />
              </linearGradient>
              <radialGradient id="decision-glow">
                <stop offset="0" stopColor="#FF2D8D" stopOpacity="0.6" />
                <stop offset="1" stopColor="#FF2D8D" stopOpacity="0" />
              </radialGradient>
            </defs>
            <circle className="proving-visual__glow" cx="500" cy="165" r="130" fill="url(#decision-glow)" />
            <path className="proving-visual__gridline" d="M60 80v360M160 80v360M260 80v360M360 80v360M460 80v360M560 80v360" />
            <path className="proving-visual__gridline" d="M60 120h500M60 200h500M60 280h500M60 360h500M60 440h500" />
            <path className="trajectory trajectory--muted" d="M60 403C170 342 176 172 279 242s133 150 281 82" />
            <path className="trajectory trajectory--muted" d="M60 335c90-18 160 89 246 28s122-178 254-205" />
            <path className="trajectory trajectory--muted" d="M60 256c82 65 159-2 242-52s150 34 258-8" />
            <path className="trajectory trajectory--primary" d="M60 390c98-40 160-127 246-106s128-28 194-119" stroke="url(#trajectory-gradient)" />
            <path className="trajectory trajectory--primary trajectory--dash" d="M306 284c73-8 134-42 194-119" stroke="url(#trajectory-gradient)" />
            <circle className="trajectory-node" cx="60" cy="390" r="7" />
            <circle className="trajectory-node" cx="184" cy="318" r="7" />
            <circle className="trajectory-node" cx="306" cy="284" r="7" />
            <circle className="trajectory-node trajectory-node--decision" cx="500" cy="165" r="12" />
            <circle className="trajectory-ring" cx="500" cy="165" r="35" />
            <circle className="trajectory-ring trajectory-ring--outer" cx="500" cy="165" r="67" />
          </svg>
          <span className="proving-visual__label proving-visual__label--evidence">Changing evidence</span>
          <span className="proving-visual__label proving-visual__label--decision">Decision</span>
          <span className="proving-visual__label proving-visual__label--outcome">Measurable outcome</span>
        </div>
      </div>
    </section>
  );
}
