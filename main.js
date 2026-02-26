import { H } from './src/core/h';

/* typehints:start */
assert(false, '检测typehints是否工作');
/* typehints:end */

let h = null;

function bootApp() {
  h = new H();
  window.h = h;
}

window.addEventListener('load', bootApp);
