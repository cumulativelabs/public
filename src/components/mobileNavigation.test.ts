import {
  initialMobileNavigationState,
  mobileNavigationReducer,
} from './mobileNavigation';

describe('mobileNavigationReducer', () => {
  it('opens and closes the menu', () => {
    const opened = mobileNavigationReducer(initialMobileNavigationState, { type: 'open' });
    expect(opened.open).toBe(true);
    expect(mobileNavigationReducer(opened, { type: 'close' }).open).toBe(false);
  });

  it('toggles the menu', () => {
    const opened = mobileNavigationReducer(initialMobileNavigationState, { type: 'toggle' });
    expect(opened.open).toBe(true);
    expect(mobileNavigationReducer(opened, { type: 'toggle' }).open).toBe(false);
  });

  it('closes when Escape is handled', () => {
    expect(mobileNavigationReducer({ open: true }, { type: 'escape' }).open).toBe(false);
  });

  it('closes after navigation', () => {
    expect(mobileNavigationReducer({ open: true }, { type: 'navigate' }).open).toBe(false);
  });
});
