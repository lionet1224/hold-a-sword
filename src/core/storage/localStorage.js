import { StorageInterface } from './interface';

const LOCAL_STORAGE_UNAVALIABLE = 'local-storage-unavaliable';
const LOCAL_STORAGE_NO_WRITE_PERMISSION = 'local-storage-no-write-permission';

export class LocalStorage extends StorageInterface {
  initialize() {
    return new Promise((resolve, reject) => {
      if (!window.localStorage) {
        // eslint-disable-next-line no-alert
        alert('浏览器不支持localStorage技术！请更新你的浏览器。');
        reject(LOCAL_STORAGE_UNAVALIABLE);
      }

      try {
        window.localStorage.setItem('storage_availability_test', '1');
        window.localStorage.removeItem('storage_availability_test');
      } catch (err) {
        // eslint-disable-next-line no-alert
        alert('使用localStroage中出错：', err);
        reject(LOCAL_STORAGE_NO_WRITE_PERMISSION);
        return;
      }

      setTimeout(resolve, 0);
    });
  }

  writeFileAsync(key, contents) {
    window.localStorage.setItem(key, contents);
    return Promise.resolve();
  }

  readFileAsync(key) {
    return new Promise((resolve, reject) => {
      const contents = window.localStorage.getItem(key);

      resolve(contents);
    });
  }

  deleteFileAsync(key) {
    return new Promise((resolve) => {
      window.localStorage.removeItem(key);
      resolve();
    });
  }
}
