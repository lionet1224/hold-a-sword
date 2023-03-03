/* typehints:start */
import Application from '../application';
import { State } from './state';
/* typehints:end */

export default class StateManager {
  /** @type {State} */
  currentState = null;

  constructor(app) {
    /** @type {Application} */
    this.app = app;
  }

  to(State) {
    if (this.currentState) {
      this.currentState.onLeave();
    }

    this.currentState = new State(this.app);
    this.currentState.onEnterBefore();
    this.currentState.onEnter();
  }
}
