/* typehints:start */
import Application from '../application';
/* typehints:end */

import { padBoth } from '../utils/tools';
import createLogger from './log';

export class State {
  name = 'DEFAULT';

  constructor(app) {
    /** @type {Application} */
    this.app = app;
  }

  onEnterBefore() {
    this.logger = createLogger();
    this.logger.log(padBoth(this.name, 30, '='), {
      color: '#888',
    });
  }

  onEnter() {

  }

  onLeave() {

  }
}
