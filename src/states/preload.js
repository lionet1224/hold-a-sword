import config from '../config';
import { State } from '../core/state';

export class PreloadState extends State {
  name = '初始化';

  onEnter() {
    const currentTime = new Date().getTime();
    // 初始化所有需要初始化的类
    this.logger.log('正在初始化游戏中...', { fontSize: '10px', color: '#666' });

    return new Promise((resolve) => resolve())
      .then(() => this.app.gameDataMgr.initialize())
      .then(() => {
        this.logger.log('游戏初始化完成', { fontSize: '10px', color: '#666' });
        this.logger.log(`耗时: ${new Date().getTime() - currentTime}ms`, { fontSize: '10px', color: '#666' });

        let state = config.defaultState || 'home';

        if (this.app.root.gameData.needCourse) {
          state = 'course';
        }

        this.app.stateMgr.to(state);
      }, (err) => {
        this.logger.error('--- 初始化游戏失败 ---');
        this.logger.error(err);
        this.logger.error('---------------------');
      });
  }
}
