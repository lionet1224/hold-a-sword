// 获取正确的数据类型
export function getType(obj) {
  return Object.prototype.toString.call(obj).slice(8, -1);
}
