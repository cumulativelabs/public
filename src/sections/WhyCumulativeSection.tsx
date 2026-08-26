import { SectionLabel } from '../components/SectionLabel';
import { site } from '../content/site';

export function WhyCumulativeSection() {
  return (
    <section className="why-section section" data-visual-phase="challenge">
      <div className="shell">
        <div className="section-heading section-heading--split" data-reveal>
          <SectionLabel>{site.whyCumulative.label}</SectionLabel>
          <h2>{site.whyCumulative.headline}</h2>
        </div>

        <div className="why-section__grid">
          {site.whyCumulative.contrasts.map((item, index) => (
            <article
              key={item.title}
              className={`why-card why-card--${item.tone}`}
              data-reveal
              tabIndex={0}
            >
              <div className="why-card__index">0{index + 1}</div>
              <div className="why-card__visual" aria-hidden="true">
                {item.tone === 'fragmented' ? (
                  <>
                    <span className="fragment fragment--one" />
                    <span className="fragment fragment--two" />
                    <span className="fragment fragment--three" />
                    <span className="fragment fragment--four" />
                    <span className="fragment fragment--five" />
                  </>
                ) : (
                  <>
                    <span className="retained-ring retained-ring--one" />
                    <span className="retained-ring retained-ring--two" />
                    <span className="retained-ring retained-ring--three" />
                    <span className="retained-path" />
                  </>
                )}
              </div>
              <h3>{item.title}</h3>
              <p>{item.body}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
