/* typehints:start */
import Application from '../application';
import { State } from './state';
/* typehints:end */

import { CourseState } from '../states/course';
import { HomeState } from '../states/home';
import { PreloadState } from '../states/preload';
import createLogger from './log';

const logger = createLogger();

export default class StateManager {
  /** @type {State} */
  currentState = null;

  constructor(app) {
    /** @type {Application} */
    this.app = app;

    this.states = {
      course: CourseState,
      home: HomeState,
      preload: PreloadState,
    };
  }

  to(name) {
    if (this.currentState) {
      this.currentState.onLeave();
    }

    const FindState = this.states[name];
    if (!FindState) {
      logger.error('没有找到对应的页面', {
        color: 'red',
      });
      return;
    }

    this.currentState = new FindState(this.app);
    this.currentState.onEnterBefore();
    this.currentState.onEnter();
  }
}
