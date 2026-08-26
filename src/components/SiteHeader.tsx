import { useEffect, useReducer, useRef, useState } from 'react';

import { contactHref, site } from '../content/site';
import {
  initialMobileNavigationState,
  mobileNavigationReducer,
} from './mobileNavigation';

const horizontalLogoSource = `${import.meta.env.BASE_URL}brand/cumulative-labs-horizontal.svg`;
const symbolLogoSource = `${import.meta.env.BASE_URL}brand/cumulative-labs-symbol.svg`;

export function SiteHeader() {
  const [scrolled, setScrolled] = useState(false);
  const [menu, dispatch] = useReducer(mobileNavigationReducer, initialMobileNavigationState);
  const menuButtonRef = useRef<HTMLButtonElement>(null);
  const mobileDialogRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const updateHeader = () => setScrolled(window.scrollY > 24);
    updateHeader();
    window.addEventListener('scroll', updateHeader, { passive: true });
    return () => window.removeEventListener('scroll', updateHeader);
  }, []);

  useEffect(() => {
    if (!menu.open) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    const firstFocusable = mobileDialogRef.current?.querySelector<HTMLElement>(
      'a[href], button:not([disabled])',
    );
    firstFocusable?.focus();

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault();
        dispatch({ type: 'escape' });
        return;
      }

      if (event.key !== 'Tab' || !mobileDialogRef.current) return;
      const focusable = Array.from(
        mobileDialogRef.current.querySelectorAll<HTMLElement>('a[href], button:not([disabled])'),
      );
      if (focusable.length === 0) return;

      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener('keydown', handleKeyDown);
      menuButtonRef.current?.focus();
    };
  }, [menu.open]);

  return (
    <>
      <a className="skip-link" href="#main-content">
        Skip to content
      </a>
      <header className={`site-header ${scrolled ? 'site-header--scrolled' : ''}`}>
        <div className="site-header__inner shell shell--wide">
          <a className="site-header__brand" href="#top" aria-label="Cumulative Labs home">
            <img
              src={horizontalLogoSource}
              alt="Cumulative Labs"
              width="1450"
              height="360"
              draggable="false"
            />
          </a>

          <nav className="desktop-navigation" aria-label="Primary navigation">
            {site.navigation.map((item) =>
              item.label === 'Contact' ? (
                <a className="navigation-contact" href={contactHref} key={item.label}>
                  {item.label}
                </a>
              ) : (
                <a href={item.href} key={item.label}>
                  {item.label}
                </a>
              ),
            )}
          </nav>

          <button
            ref={menuButtonRef}
            className="mobile-menu-button"
            type="button"
            aria-expanded={menu.open}
            aria-controls="mobile-navigation"
            aria-label={menu.open ? 'Close navigation menu' : 'Open navigation menu'}
            onClick={() => dispatch({ type: 'toggle' })}
          >
            <span />
            <span />
          </button>
        </div>
      </header>

      <div
        className={`mobile-navigation-shell ${menu.open ? 'mobile-navigation-shell--open' : ''}`}
        aria-hidden={!menu.open}
      >
        <div
          id="mobile-navigation"
          ref={mobileDialogRef}
          className="mobile-navigation"
          role="dialog"
          aria-modal="true"
          aria-label="Site navigation"
        >
          <div className="mobile-navigation__topline">
            <img src={symbolLogoSource} alt="" aria-hidden="true" />
            <button
              className="mobile-navigation__close"
              type="button"
              onClick={() => dispatch({ type: 'close' })}
              aria-label="Close navigation menu"
            >
              <span />
              <span />
            </button>
          </div>
          <nav aria-label="Mobile navigation">
            {site.navigation.map((item, index) => (
              <a
                key={item.label}
                href={item.label === 'Contact' ? contactHref : item.href}
                onClick={() => dispatch({ type: 'navigate' })}
              >
                <span>{String(index + 1).padStart(2, '0')}</span>
                {item.label}
              </a>
            ))}
          </nav>
          <p>{site.tagline}</p>
        </div>
      </div>
    </>
  );
}
