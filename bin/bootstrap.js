const { execSync, spawnSync } = require('child_process')
const versions = require('../sqe-manifest.json')

// Maybe switch to use chalk for colored output.
const RED='\033[0;31m'
const GREEN='\033[0;32m'
const YELLOW = '\033[0;33m'
const NC='\033[0m'

console.log('Checking for dependencies...')
let cmd = spawnSync('sh', ['check-deps.sh'], { encoding : 'utf8', cwd: './bin/', stdio: [null, process.stdout, process.stderr] })
if (cmd.status !== 0) {
    console.log(RED, '✗ You are missing at least one necessary dependency.', NC)
    process.exit(1)
}
console.log(GREEN, '✓ All necessary dependencies are installed.', NC)

console.log('Installing npm dependencies...')
cmd = spawnSync('yarn', ['--pure-lockfile'], { encoding : 'utf8', cwd: './', stdio: [null, process.stdout, process.stderr] })
if (cmd.status !== 0) {
    console.log(RED, '✗ Installation of npm dependencies failed.', NC)
    process.exit(1)
}
console.log(GREEN, '✓ All necessary npm dependencies have been installed.', NC)

console.log('Setting up the Docker network...')
cmd = spawnSync('docker', ['network', 'list'], { encoding : 'utf8', cwd: './', stdio: 'pipe' })
if (cmd.output[1].indexOf(' SQE ') === -1) {
  cmd = spawnSync('docker', ['network', 'create', '--driver', 'bridge', 'SQE'], { encoding : 'utf8', cwd: './', stdio: [null, process.stdout, process.stderr] })
  if(cmd.status !== 0) {
    console.log(RED, '✗ Cannot setup the Docker network', NC)
    process.exit(1)
  }
}
console.log(GREEN, '✓ The Docker network is setup.', NC)

console.log('Building Web CGI Docker...')
cmd = spawnSync('sh', ['bin/init-web-docker.sh'], { encoding : 'utf8', cwd: './', stdio: [null, process.stdout, process.stderr] })
if(cmd.status !== 0) {
  console.log(RED, '✗ Cannot install Web CGI Docker', NC)
  process.exit(1)
}
console.log(GREEN, '✓ Web CGI Docker is installed.', NC)

console.log('Loading SQE_DB_API, version', versions.dependencies['SQE_DB_API'], '...')
cmd = spawnSync('sh', ['load-perl-libs.sh', '-v', versions.dependencies['SQE_DB_API']], { encoding : 'utf8', cwd: './bin/', stdio: [null, process.stdout, process.stderr] })
if (cmd.status !== 0) {
    console.log(RED, '✗ Failed to install SQE_DB_API.', NC)
    process.exit(1)
}
console.log(GREEN, '✓ SQE_DB_API has been installed.', NC)

console.log('Loading Database Docker, version', versions.dependencies['Data-files'], '...')
cmd = spawnSync('sh', ['init-docker.sh', '-v', versions.dependencies['Data-files']], { encoding : 'utf8', cwd: './bin/', stdio: [null, process.stdout, process.stderr] })
if (cmd.status !== 0) {
    console.log(RED, '✗ Failed to install database.', NC)
    process.exit(1)
} else {
    console.log(GREEN, '✓ System fully installed.  Type `npm start` to begin serving it.', NC)
}
