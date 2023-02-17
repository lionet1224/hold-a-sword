const lzString = require('lz-string')

module.exports = source => {
  // 压缩文件
  const compressed = lzString.compressToEncodedURIComponent(source);
  const sourcecode = `module.exports = (function(){
    // 这里的require('global-compression')是webpack中定义的别名，也同样是lzString，使用解密
    return JSON.parse(require("global-compression").decompressX64("${compressed}"))
  })()`
  return sourcecode;
}