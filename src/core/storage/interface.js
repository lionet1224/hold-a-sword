export class StorageInterface {
  /**
   * 初始化类
   * @returns
   */
  initialize() {
    abstract;
    return Promise.reject();
  }

  /**
   * 写入数据
   * @param {string} key
   * @param {string} value
   * @returns
   */
  writeFileAsync(key, value) {
    abstract;
    return Promise.reject();
  }

  /**
   * 读取数据
   * @param {string} key
   * @returns
   */
  readFileAsync(key) {
    abstract;
    return Promise.reject();
  }

  /**
   * 删除数据
   * @param {string}} key
   * @returns
   */
  deleteFileAsync(key) {
    abstract;
    return Promise.reject();
  }
}
