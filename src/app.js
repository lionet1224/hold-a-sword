import StateManager from './core/stateManager';

export default class Application {
  constructor() {
    this.stateManager = new StateManager();
  }

  boot() {
  }
}
