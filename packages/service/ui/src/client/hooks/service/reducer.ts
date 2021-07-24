import type { ServicesState, ServicesStateActions } from './types';

import { actions } from './actions';

export function serviceStateReducer(
  state: ServicesState,
  action: ServicesStateActions,
): ServicesState {
  const { type, payload, serviceName } = action;

  console.log('action', action);

  if (type in actions) {
    return {
      ...actions[type](state, payload, serviceName),
      lastUpdate: Date.now(),
    };
  }

  return state;
}
