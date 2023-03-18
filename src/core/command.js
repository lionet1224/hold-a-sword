/* typehints:start */
import Application from '../application';
/* typehints:end */

import createLogger from './log';

const logger = createLogger();

export class Command {
  constructor(app) {
    /** @type {Application} */
    this.app = app;

    // 指令队列
    this.taskList = [];
  }

  /**
   * 执行指令
   */
  carryOut(number, ...args) {
    const command = {
      number,
      value: args,
    };

    // 执行指令
    const task = this.taskList[command.number - 1];
    if (!task) {
      logger.error('没有找到对应的指令', {
        fontSize: 20,
        color: 'red',
      });
      return;
    }

    task.cb(...command.value);
    this.taskList = [];
  }

  /**
   * 添加指令
   */
  push(...args) {
    // 验证args格式
    // 判断每一个参数是否为 { command, cb } 格式的对象
    args.forEach((arg) => {
      if (typeof arg !== 'object') {
        throw new Error('参数必须为对象');
      }
      if (!arg.command) {
        throw new Error('参数必须包含command属性');
      }
      if (!arg.cb) {
        throw new Error('参数必须包含cb属性');
      }
    });

    logger.command(...args.map((item, index) => {
      item.msg = `(${index + 1}): ${item.command}`;
      return item;
    }));

    this.taskList = args;
  }
}
