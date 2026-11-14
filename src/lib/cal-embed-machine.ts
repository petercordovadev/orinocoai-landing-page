/**
 * Explicit state machine for the Cal.com embed.
 *
 * `error` and `unavailable` are terminal by design: the reliable recovery path
 * is the direct link to the calendar, not a second iframe bootstrap.
 */

export type CalEmbedState =
  | 'facade'
  | 'loading'
  | 'ready'
  | 'error'
  | 'unavailable';

export type CalEmbedEvent =
  | { type: 'LOAD' }
  | { type: 'CONFIG_MISSING' }
  | { type: 'IFRAME_READY' }
  | { type: 'TIMEOUT' };

export const initialCalEmbedState: CalEmbedState = 'facade';

type Transitions = Record<
  CalEmbedState,
  Partial<Record<CalEmbedEvent['type'], CalEmbedState>>
>;

const transitions: Transitions = {
  facade: {
    LOAD: 'loading',
    CONFIG_MISSING: 'unavailable',
  },
  loading: {
    IFRAME_READY: 'ready',
    TIMEOUT: 'error',
  },
  ready: {},
  error: {},
  unavailable: {},
};

export function calEmbedReducer(
  state: CalEmbedState,
  event: CalEmbedEvent,
): CalEmbedState {
  return transitions[state][event.type] ?? state;
}

export function isCalEmbedBusy(state: CalEmbedState): boolean {
  return state === 'loading';
}
