/* typehints:start */
import Application from '../application';
import gameData from '../config/gameData';
/* typehints:end */

export class GameRoot {
  constructor(app) {
    /** @type {Application} */
    this.app = app;
  }

  initialize() {
    // 游戏数据
    /** @type {gameData} */
    this.gameData = gameData;
  }

  set $gameData(data) {
    this.gameData = data;
    this.app.gameDataMgr.saveGameData();
  }
}
