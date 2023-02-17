/* eslint-env browser */
// 控制页面

const isConsole = window.location.host === 'console.lionet.cloud';

function initialize() {
  if (!isConsole) {
    return '1';
  }

  const a = 1;

  return a;
}

initialize();
