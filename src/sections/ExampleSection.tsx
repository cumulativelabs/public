import { SectionLabel } from '../components/SectionLabel';
import { site } from '../content/site';

export function ExampleSection() {
  return (
    <section id="example" className="example-section section" data-visual-phase="preserve">
      <div className="shell shell--wide">
        <div className="section-heading">
          <SectionLabel>{site.example.label}</SectionLabel>
          <h2>{site.example.headline}</h2>
        </div>
        <figure className="example-figure" aria-labelledby="example-caption">
          <p className="example-label">Illustrative example · Hypothetical scenario</p>
          <p className="example-scenario">{site.example.scenario}</p>
          <ol className="example-path">
            {site.example.stages.map((stage, index) => (
              <li key={stage.title}>
                <span className="example-number" aria-hidden="true">0{index + 1}</span>
                <h3>{stage.title}</h3>
                <p>{stage.body}</p>
              </li>
            ))}
          </ol>
          <figcaption id="example-caption">{site.example.caption}</figcaption>
        </figure>
      </div>
    </section>
  );
}
