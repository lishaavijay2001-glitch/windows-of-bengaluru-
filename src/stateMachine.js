// Interaction state machine.
//
//   BOOT → INTRO → AWAIT_HAND ──(move hand)──► OPENING → EXPLORING ──(swipe)──► RIDING → EXPLORING (next stop)
//                                                   ▲          │ grip (fist held) / C            ▲
//                                       open palm   │          ▼                                 │
//                                       / click     └────── CLOSED ──(swipe)──► RIDING → CLOSED ┘
//   last stop ──(swipe)──► FINALE (outside view of the bus) ──(look again)──► RIDING → first stop
//
// Gestures are only honoured in the states where they mean something.

export const S = {
  BOOT: 'BOOT',
  INTRO: 'INTRO',
  AWAIT_HAND: 'AWAIT_HAND',
  OPENING: 'OPENING',
  EXPLORING: 'EXPLORING',
  CLOSING: 'CLOSING',
  CLOSED: 'CLOSED',
  RIDING: 'RIDING',
  FINALE: 'FINALE',
};

const ALLOWED = {
  BOOT: ['INTRO'],
  INTRO: ['AWAIT_HAND'],
  AWAIT_HAND: ['OPENING'],
  OPENING: ['EXPLORING'],
  EXPLORING: ['CLOSING', 'RIDING', 'FINALE'],
  CLOSING: ['CLOSED'],
  CLOSED: ['OPENING', 'RIDING', 'FINALE'],
  RIDING: ['CLOSED', 'EXPLORING'],
  FINALE: ['RIDING'],
};

export class StateMachine {
  constructor(handlers = {}) {
    this.state = S.BOOT;
    this.since = performance.now();
    this.handlers = handlers;
  }
  is(...states) { return states.includes(this.state); }
  elapsed() { return performance.now() - this.since; }
  go(next) {
    if (!ALLOWED[this.state].includes(next)) {
      console.warn(`[state] ignored ${this.state} → ${next}`);
      return false;
    }
    const prev = this.state;
    this.state = next;
    this.since = performance.now();
    this.handlers[next]?.(prev);
    return true;
  }
}
