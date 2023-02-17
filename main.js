import './src/page'
import { Log } from './src/utils';

let i = 0;

function show(){
  i++

  Log([i, 'color: red; font-size: 30px'], ' 1111 ')
}

setInterval(show, 500);
