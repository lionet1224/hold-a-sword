import createLogger from '../core/log';
import { State } from '../core/state';

export class HomeState extends State {
  name = '首页';

  onEnter() {
    this.logger.log('onEnter');

    this.logger.chat(
      '系统',
      null,
      '欢迎来到执剑的世界，你可以在此',
      {
        msg: '打怪',
        color: 'red',
      },
      '升级，也可以',
      {
        msg: '打怪',
        color: 'red',
      },
      '升级....，哈哈哈哈哈，当然我们就是一个这样一个肤浅的游戏。',
      '欢迎来到执剑的',
      {
        msg: '世界',
        color: 'blue',
      },
      '，你可以在此打怪升级，也可以打怪升级....，哈哈哈哈哈，当然我们就是一个这样一个肤浅的游戏。',
    );
  }
}
