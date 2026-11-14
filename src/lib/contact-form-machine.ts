/**
 * Explicit state machine for the contact form.
 *
 * The component owns the DOM and the network request; this module owns the
 * allowed transitions. Keeping it pure makes the behavior testable and gives
 * agents a single place to understand what the form can do.
 */

export type ContactFormState =
  | 'idle'
  | 'invalid'
  | 'submitting'
  | 'success'
  | 'error'
  | 'unconfigured';

export type ContactFormEvent =
  | { type: 'INVALID' }
  | { type: 'ENDPOINT_MISSING' }
  | { type: 'SEND' }
  | { type: 'SUCCESS' }
  | { type: 'FAILURE' }
  | { type: 'FIELD_FIXED' }
  | { type: 'SPAM' }
  | { type: 'RESET' };

export const initialContactFormState: ContactFormState = 'idle';

type Transitions = Record<
  ContactFormState,
  Partial<Record<ContactFormEvent['type'], ContactFormState>>
>;

const transitions: Transitions = {
  idle: {
    INVALID: 'invalid',
    ENDPOINT_MISSING: 'unconfigured',
    SEND: 'submitting',
    SPAM: 'success',
    RESET: 'idle',
  },
  invalid: {
    INVALID: 'invalid',
    ENDPOINT_MISSING: 'unconfigured',
    SEND: 'submitting',
    FIELD_FIXED: 'idle',
    SPAM: 'success',
    RESET: 'idle',
  },
  submitting: {
    SUCCESS: 'success',
    FAILURE: 'error',
    RESET: 'idle',
  },
  success: {
    INVALID: 'invalid',
    ENDPOINT_MISSING: 'unconfigured',
    SEND: 'submitting',
    SPAM: 'success',
    RESET: 'idle',
  },
  error: {
    INVALID: 'invalid',
    ENDPOINT_MISSING: 'unconfigured',
    SEND: 'submitting',
    SPAM: 'success',
    RESET: 'idle',
  },
  unconfigured: {
    INVALID: 'invalid',
    ENDPOINT_MISSING: 'unconfigured',
    SEND: 'submitting',
    SPAM: 'success',
    RESET: 'idle',
  },
};

export function contactFormReducer(
  state: ContactFormState,
  event: ContactFormEvent,
): ContactFormState {
  return transitions[state][event.type] ?? state;
}

export function isContactFormBusy(state: ContactFormState): boolean {
  return state === 'submitting';
}
