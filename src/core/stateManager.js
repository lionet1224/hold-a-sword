/* typehints:start */
import { State } from './state';
/* typehints:end */

export default class StateManager {
  initialize() {
    /** @type {State} */
    this.currentState = null;
  }

  to(State) {
    if (this.currentState) {
      this.currentState.onLeave();
    }

    this.currentState = new State();
    this.currentState.onEnterBefore();
    this.currentState.onEnter();
  }
}
