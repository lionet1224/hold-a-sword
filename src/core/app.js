/* typehints:start */
import Application from '../application';
/* typehints:end */

let globalApp = null;

export const setGlobalApp = (app) => {
  globalApp = app;
};

/**
 * 使其他地方能够使用主程序函数
 * 主要为了不让玩家能够直接访问到主程序
 * @returns {Application}
 */
export default () => globalApp;
