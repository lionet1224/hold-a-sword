import StateManager from './core/stateManager';
import { HomeState } from './states/home';

export default class Application {
  constructor() {
    /** @type {StateManager} */
    this.stateManager = null;
  }

  boot() {
    this.stateManager = new StateManager();
    this.stateManager.initialize();

    this.stateManager.to(HomeState);
  }

  test() {
    console.log(123);
  }
}
