import { padBoth } from '../utils/tools';
import createLogger from './log';

export class State {
  name = 'DEFAULT';

  onEnterBefore() {
    this.logger = createLogger();
    this.logger.log(padBoth(this.name, 20, '='), {
      color: '#888',
    });
  }

  onEnter() {

  }

  onLeave() {

  }
}
