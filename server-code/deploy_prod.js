const { execSync, spawnSync } = require('child_process')
const versions = require('../sqe-manifest.json')

// Maybe switch to use chalk for colored output.
const RED='\033[0;31m'
const GREEN='\033[0;32m'
const YELLOW = '\033[0;33m'
const NC='\033[0m'

console.log('Bootstrapping project...')
console.log(YELLOW, 'This destroys and rebuilds the local Docker database.', NC)
let cmd = spawnSync('npm', ['run', 'bootstrap'], { encoding : 'utf8', cwd: './', stdio: [null, process.stdout, process.stderr] })
if (cmd.status !== 0) {
    console.log(RED, '✗ Couldn\'t build production site.', NC)
    process.exit(1)
}
console.log(GREEN, '✓ Production website buil.', NC)

console.log('Building production site...')
cmd = spawnSync('npm', ['run', 'prod'], { encoding : 'utf8', cwd: './', stdio: [null, process.stdout, process.stderr] })
if (cmd.status !== 0) {
    console.log(RED, '✗ Couldn\'t build production site.', NC)
    process.exit(1)
}
console.log(GREEN, '✓ Production website built.', NC)

console.log('Copying website to /var/www/html/stable/Scrollery')
console.log('Making sure folders exist')
cmd = spawnSync('mkdir', ['-p', '/var/www/html/Stable/Scrollery'], { encoding : 'utf8', cwd: './', stdio: [null, process.stdout, process.stderr] })
if (cmd.status !== 0) {
    console.log(RED, '✗ Couldn\'t build production site.', NC)
    process.exit(1)
}
console.log(GREEN, '✓ Production website buil.', NC)

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

console.log('Building Perl dependencies...')
cmd = spawnSync('carton', ['install'], { encoding : 'utf8', cwd: './resources/cgi-bin/', stdio: [null, process.stdout, process.stderr] })
if(cmd.status !== 0) {
    console.log(YELLOW, '✗ Failed to install perl dependencies, trying with sudo.', NC)
    console.log('Please enter your password.')
    cmd = spawnSync('sudo', ['carton', 'install'], { encoding : 'utf8', cwd: './resources/cgi-bin/', stdio: [null, process.stdout, process.stderr] })
    if(cmd.status !== 0) {
        console.log(RED, '✗ Cannot install Perl dependencies, there is probably something wrong with your MariaDB libs.', NC)
        process.exit(1)
    }
}
console.log(GREEN, '✓ All Perl dependencies are installed.', NC)

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
