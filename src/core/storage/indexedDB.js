import { StorageInterface } from './interface';

const INDEXED_DB_UNAVALIABLE = 'indexed-db-unavaliable';
const INDEXED_DB_NO_WRITE_PERMISSION = 'indexed-db-no-write-permission';
const INDEXED_DB_NAME = 'hold-a-sword_storage';
const INDEXED_DB_TABLE = 'game_data';
const INDEXED_DB_VERSION = 1;

export class IndexedDB extends StorageInterface {
  database = null;

  initialize() {
    return new Promise((resolve, reject) => {
      if (!window.indexedDB) {
        // eslint-disable-next-line no-alert
        alert('浏览器不支持indexedDB技术！请更新你的浏览器。');
        reject(INDEXED_DB_UNAVALIABLE);
      }

      const dbLoader = window.indexedDB.open(
        INDEXED_DB_NAME,
        INDEXED_DB_VERSION,
      );
      dbLoader.addEventListener('success', (ev) => {
        this.database = dbLoader.result;
        resolve();
      });
      dbLoader.addEventListener('error', (ev) => {
        // eslint-disable-next-line no-alert
        alert('使用indexedDB中出错：', ev);
        reject(INDEXED_DB_NO_WRITE_PERMISSION);
      });
      dbLoader.addEventListener('upgradeneeded', (ev) => {
        const db = ev.target.result;
        if (!db.objectStoreNames.contains(INDEXED_DB_TABLE)) {
          db.createObjectStore(INDEXED_DB_TABLE, {
            keyPath: 'key',
          });
        }
      });
    });
  }

  getTable(name = INDEXED_DB_TABLE) {
    return this.database.transaction([name], 'readwrite').objectStore(name);
  }

  writeFileAsync(key, contents) {
    return new Promise((resolve, reject) => {
      const handler = this.getTable().put({ key, contents });
      handler.onsuccess = () => resolve();
      handler.onerror = (ev) => reject(ev);
    });
  }

  readFileAsync(key) {
    return new Promise((resolve, reject) => {
      const handler = this.getTable().get(key);
      handler.onsuccess = () => {
        const data = handler.result ? handler.result.contents : null;
        resolve(data);
      };
      handler.onerror = (ev) => reject(ev);
    });
  }

  deleteFileAsync(key) {
    return new Promise((resolve) => {
      this.getTable().delete(key);
      resolve();
    });
  }
}
