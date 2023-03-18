import app from './app';

// 暴露给玩家使用的入口
export class H {
  command(number, ...args) {
    app().command.carryOut(number, ...args);
    return this;
  }

  cmd(number) {
    return this.command(number);
  }
}
