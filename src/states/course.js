import { State } from '../core/state';

export class CourseState extends State {
  name = '初始教程';

  onEnter() {
    this.logger.chat(
      '系统',
      null,
      '欢迎来到执剑！',
      '\n请问你是否需要开始初始教程？',
    );
    this.app.command.push(
      { command: '是', cb: () => this.toHome() },
      { command: '否', cb: () => this.startCourse() },
    );
    this.logger.chat(
      '系統',
      null,
      '你可以在控制台中输入 ',
      {
        msg: '[h / window.h]',
        color: '#00f',
      },
      {
        msg: '.[command / cmd](指令数字)',
        color: '#f00',
      },
      ' 执行指令。',
      {
        msg: '\n示例: h.cmd(1) - 执行第一条指令',
        color: '#999',
        fontSize: 20,
      },
    );
  }

  toHome() {
    this.app.stateMgr.to('home');
  }

  startCourse() {
    this.logger.chat(
      '系统',
      null,
      '那么现在开始初始教程吧！',
    );
  }
}
