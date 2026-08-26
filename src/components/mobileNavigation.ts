export type MobileNavigationState = {
  open: boolean;
};

export type MobileNavigationAction =
  | { type: 'open' }
  | { type: 'close' }
  | { type: 'toggle' }
  | { type: 'escape' }
  | { type: 'navigate' };

export const initialMobileNavigationState: MobileNavigationState = { open: false };

export function mobileNavigationReducer(
  state: MobileNavigationState,
  action: MobileNavigationAction,
): MobileNavigationState {
  switch (action.type) {
    case 'open':
      return { open: true };
    case 'toggle':
      return { open: !state.open };
    case 'close':
    case 'escape':
    case 'navigate':
      return { open: false };
    default:
      return state;
  }
}
