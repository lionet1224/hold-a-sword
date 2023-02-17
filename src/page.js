// 控制页面

const isConsole = location.host === 'console.lionet.cloud';

function initialize(){
  if(!isConsole){
    return; 
  }
}

initialize();