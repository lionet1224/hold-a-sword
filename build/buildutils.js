const fs = require('fs');
const execSync = require('child_process').execSync;
const trim = require('trim')
const pkg = require('../package.json')

module.exports = {
  getRevision(useLast = false){
    const commitHash = execSync('git rev-parse --short ' + (useLast ? 'HEAD^1' : 'HEAD')).toString(
      'ascii'
    )
    return commitHash.replace(/^\s+|\s+$/g, '');
  },
  getVersion(){
    return trim(pkg.version)
  }
}