// 封装console.log，可以在控制台打印出任意样式的文字
// 通过 Log(['test', '#000; font-size: 20px'], ' 1111 ') 的方式调用
export function Log(...args) {
  let str = '';
  args.forEach((item) => {
    if (Array.isArray(item)) {
      str += `%c${item[0]}`;
    } else {
      str += item;
    }
  });
  const arr = args.map((item) => {
    if (Array.isArray(item)) {
      return item[1];
    }
    return '';
  });
  console.log(str, ...arr);
}
