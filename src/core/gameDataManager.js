/* typehints:start */
import Application from '../application';
/* typehints:end */

import config from '../config';
import gameData from '../config/gameData';
import { IndexedDB } from './storage/indexedDB';
import { LocalStorage } from './storage/localStorage';

export class GameDataManager {
  constructor(app) {
    /** @type {Application} */
    this.app = app;

    this.storage = config.storageType === 'indexedDB'
      ? new IndexedDB()
      : new LocalStorage();

    // TODO: 暂不实现多存档功能
    this.dbName = 'haw';
  }

  initialize() {
    return this.storage.initialize()
      .then(() => new Promise(async (resolve) => {
        const data = await this.storage.readFileAsync(this.dbName);

        this.app.root.$gameData = {
          ...this.getDefaultData(),
          ...(data || {}),
        };

        resolve(data);
      }));
  }

  saveGameData() {
    return this.storage.writeFileAsync(this.dbName, this.app.root.gameData);
  }

  getDefaultData() {
    return gameData;
  }
}
