import { setGlobalApp } from './core/app';
import { GameDataManager } from './core/gameDataManager';
import { GameRoot } from './core/root';
import StateManager from './core/stateManager';
import { PreloadState } from './states/preload';

export default class Application {
  constructor() {
    setGlobalApp(this);
    this.stateMgr = new StateManager(this);
    this.root = new GameRoot(this);
    this.gameDataMgr = new GameDataManager(this);
  }

  boot() {
    this.stateMgr.to(PreloadState);
  }
}
