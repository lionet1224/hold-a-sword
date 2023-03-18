import { setGlobalApp } from './core/app';
import { Command } from './core/command';
import { GameDataManager } from './core/gameDataManager';
import { GameRoot } from './core/root';
import StateManager from './core/stateManager';

export default class Application {
  constructor() {
    setGlobalApp(this);
    this.stateMgr = new StateManager(this);
    this.root = new GameRoot(this);
    this.gameDataMgr = new GameDataManager(this);
    this.command = new Command(this);
  }

  boot() {
    this.stateMgr.to('preload');
  }
}
