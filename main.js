import Application from './src/app';
import createLogger from './src/core/log';

const logger = createLogger('main');
logger.section(
  {
    msg: '执剑',
    color: '#000',
    fontSize: '26px',
    padding: '10px 0 5px 0',
  },
  '这是一个摸鱼游戏，也是一段传奇故事。',
  [
    {
      type: 'defaultStyle',
      padding: '5px 0 10px 0',
    },
    '作者: lionet, ',
    'version: ',
    {
      msg: G_BUILD_VERSION,
      color: '#ff0000',
    },
    ', ',
    'build: ',
    {
      msg: new Date(G_BUILD_TIME).getTime(),
      color: '#ff0ff0',
    },
    ', ',
    'commit: ',
    {
      msg: G_BUILD_COMMIT_HASH,
      color: '#0fa0f0',
    },
  ],
);

/* typehints:start */
assert(false, '检测typehints是否工作');
/* typehints:end */

let app = null;

function bootApp() {
  app = new Application();
  app.boot();
}

window.addEventListener('load', bootApp);
