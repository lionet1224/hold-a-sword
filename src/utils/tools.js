// 获取正确的数据类型
export function getType(obj) {
  return Object.prototype.toString.call(obj).slice(8, -1);
}

// 文本前部填充
export function padStart(str, length, padStr) {
  if (str.length >= length) {
    return str;
  }

  const padLength = length - str.length;
  const padCount = Math.ceil(padLength / padStr.length);
  return `${padStr.repeat(padCount).slice(0, padLength)} ${str}`;
}

// 文本后部填充
export function padEnd(str, length, padStr) {
  if (str.length >= length) {
    return str;
  }

  const padLength = length - str.length;
  const padCount = Math.ceil(padLength / padStr.length);
  return `${str} ${padStr.repeat(padCount).slice(0, padLength)}`;
}

// 文本两端填充
export function padBoth(str, length, padStr) {
  if (str.length >= length) {
    return str;
  }

  const padLength = length - str.length;
  const padCount = Math.ceil(padLength / padStr.length);
  const padLeft = padStr.repeat(padCount).slice(0, padLength / 2);
  const padRight = padStr.repeat(padCount).slice(0, padLength - padLeft.length);
  return `${padLeft} ${str} ${padRight}`;
}
