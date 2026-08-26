import { contactHref, site } from '../content/site';

export function SiteFooter() {
  return (
    <footer id="contact" className="site-footer">
      <div className="shell shell--wide site-footer__main">
        <div className="site-footer__brand">
          <img src="/brand/cumulative-labs-horizontal.svg" alt="Cumulative Labs" />
          <p>{site.tagline}</p>
        </div>
        <div className="site-footer__contact">
          <p>Contact</p>
          <a href={contactHref}>{site.contact.email}</a>
        </div>
      </div>
      <div className="shell shell--wide site-footer__bottom">
        <p>{site.footer.copyright}</p>
        <p className="site-footer__signature">{site.footer.signature}</p>
      </div>
    </footer>
  );
}
