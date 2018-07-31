const { spawnSync } = require('child_process')
const branch = require('git-branch')

branch('./')
  .then(name => {
    if (name !== 'master') {
      process.exit(0)
    } else {
      let cmd = spawnSync('karma', ['start', '--config karma.conf.js', '--browsers=Chrome', '--single-run'], { encoding : 'utf8', cwd: './', stdio: [null, process.stdout, process.stderr] })
      if (cmd.status !== 0) {
          console.log('✗ Unit tests failed.')
          process.exit(1)
      } else {
        process.exit(0)
      }
        
    }
  })
  .catch(console.error)