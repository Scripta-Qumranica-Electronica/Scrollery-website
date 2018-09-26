const { spawnSync } = require('child_process')
const os = require('os')
const versions = require('../sqe-manifest.json')
/**
 * See: https://stackoverflow.com/questions/13696148/node-js-create-folder-or-use-existing
 */
const mkdirSync = (dirPath) => {
  try {
    fs.mkdirSync(dirPath)
  } catch (err) {
    if (err.code !== 'EEXIST') throw err
  }
}

let yarn = ''
if (os.platform() === 'win32') {
  yarn = 'yarn.cmd'
} else {
  yarn = 'yarn'
}

console.log('Installing npm dependencies with yarn...')
cmd = spawnSync(yarn, ['--pure-lockfile'], { encoding : 'utf8', cwd: './', stdio: [null, process.stdout, process.stderr] })
if (cmd.status !== 0) {
    console.log('✗ Installation of npm dependencies failed.')
    console.log('✗ You are missing either node/npm or yarn.')
    process.exit(1)
}

const commandExists = require('command-exists').sync
const fs = require('fs')
const rimraf = require('rimraf')
const mariadb = require('mariadb')
const chalk = require('chalk')

console.log(chalk.green('✓ All necessary npm dependencies have been installed.'))

console.log(chalk.blue('Checking for Docker dependency...'))
if (commandExists('docker')) {
  console.log(chalk.green('✓ Docker is installed.'))
} else {
  console.log(chalk.red('✗ You are missing Docker.'))
  process.exit(1)
}
console.log(chalk.green('✓ All necessary dependencies are installed.'))

console.log(chalk.blue(`Loading SQE_DB_API, version ${versions.dependencies.SQE_DB_API}...`))
console.log(chalk.blue('Checking for perl-libs repository.'))
if (fs.existsSync("./resources/perl-libs/.git")) {
  console.log(chalk.blue('Fetching changes.'))
  cmd = spawnSync('git', ['fetch', '--all', '--tags', '--prune'], { encoding : 'utf8', cwd: './resources/perl-libs', stdio: [null, process.stdout, process.stderr] })
  if (cmd.status !== 0) {
      console.log(chalk.red('✗ Failed to fetch SQE_DB_API.'))
      process.exit(1)
  }
} else {
  console.log(chalk.blue('Cloning repository.'))
  cmd = spawnSync('git', ['clone', 'https://github.com/Scripta-Qumranica-Electronica/SQE_DB_API.git', 'resources/perl-libs'], { encoding : 'utf8', cwd: './', stdio: [null, process.stdout, process.stderr] })
  if (cmd.status !== 0) {
    console.log(chalk.red('✗ Failed to clone SQE_DB_API.'))
    process.exit(1)
  }
}

console.log(chalk.blue('Checking for desired version.'))
if (versions.dependencies['SQE_DB_API']) {
  console.log(chalk.blue(`Checking out tag ${versions.dependencies.SQE_DB_API}.`))
  cmd = spawnSync('git', ['checkout', versions.dependencies.SQE_DB_API], { encoding : 'utf8', cwd: './resources/perl-libs', stdio: [null, process.stdout, process.stderr] })
} else {
  console.log(chalk.blue(`Checking out latest master version.`))
  cmd = spawnSync('git', ['checkout', 'master'], { encoding : 'utf8', cwd: './resources/perl-libs', stdio: [null, process.stdout, process.stderr] })
  cmd = spawnSync('git', ['pull', 'origin', 'master'], { encoding : 'utf8', cwd: './resources/perl-libs', stdio: [null, process.stdout, process.stderr] })
}
console.log(chalk.green('✓ SQE_DB_API has been installed.'))

console.log(chalk.blue(`Loading Database Docker version ${versions.dependencies["Data-files"]}.`))
console.log(chalk.blue('Checking for Database repository.'))
mkdirSync('./resources/data-backup')
if (fs.existsSync("./resources/data-files/.git")) {
  console.log(chalk.blue('Fetching changes.'))
  cmd = spawnSync('git', ['checkout', 'master'], { encoding : 'utf8', cwd: './resources/data-files', stdio: [null, process.stdout, process.stderr] })
  if (cmd.status !== 0) {
      console.log(chalk.red('✗ Failed to checkout Database-files.'))
      process.exit(1)
  }
  cmd = spawnSync('git', ['fetch', '--tags'], { encoding : 'utf8', cwd: './resources/data-files', stdio: [null, process.stdout, process.stderr] })
  if (cmd.status !== 0) {
      console.log(chalk.red('✗ Failed to fetch tags.'))
      process.exit(1)
  }
  cmd = spawnSync('git', ['pull', 'origin', 'master'], { encoding : 'utf8', cwd: './resources/data-files', stdio: [null, process.stdout, process.stderr] })
  if (cmd.status !== 0) {
      console.log(chalk.red('✗ Failed to pull master for Database-files.'))
      process.exit(1)
  }
} else {
  console.log(chalk.blue('Cloning Data-files repository.'))
  cmd = spawnSync('git', ['clone', 'https://github.com/Scripta-Qumranica-Electronica/Data-files.git', './resources/data-files'], { encoding : 'utf8', cwd: './', stdio: [null, process.stdout, process.stderr] })
  if (cmd.status !== 0) {
      console.log(chalk.red('✗ Failed to checkout Database-files.'))
      process.exit(1)
  }
  cmd = spawnSync('git', ['fetch', '--all', '--tags', '--prune'], { encoding : 'utf8', cwd: './resources/data-files', stdio: [null, process.stdout, process.stderr] })
  if (cmd.status !== 0) {
      console.log(chalk.red('✗ Failed to fetch changes to Database-files.'))
      process.exit(1)
  }
}
console.log(chalk.green('✓ Fetched Data-files from github.'))

console.log(chalk.blue('Resetting the data-backup folder.'))
if (fs.existsSync("./resources/data-backup")) {
  rimraf.sync('./resources/data-backup/*')
} else {
  mkdirSync("./resources/data-backup")
}
mkdirSync("./resources/data-backup/tables")
mkdirSync("./resources/data-backup/geom_tables")


if (versions.dependencies["Data-files"]) {
  console.log(chalk.blue(`Checking out tag ${versions.dependencies["Data-files"]}.`))
  cmd = spawnSync('git', ['checkout', `tags/${versions.dependencies["Data-files"]}`], { encoding : 'utf8', cwd: './resources/data-files', stdio: [null, process.stdout, process.stderr] })
  if (cmd.status !== 0) {
      console.log(chalk.red(`✗ Failed to checkout tag ${versions.dependencies["Data-files"]}.`))
      process.exit(1)
  }
} else {
  console.log(chalk.blue('Checking out latest master.'))
  cmd = spawnSync('git', ['checkout', 'master'], { encoding : 'utf8', cwd: './resources/data-files', stdio: [null, process.stdout, process.stderr] })
  if (cmd.status !== 0) {
      console.log(chalk.red('✗ Failed to checkout maser branch of Database-files.'))
      process.exit(1)
  }
  cmd = spawnSync('git', ['pull', 'origin', 'master'], { encoding : 'utf8', cwd: './resources/data-files', stdio: [null, process.stdout, process.stderr] })
  if (cmd.status !== 0) {
      console.log(chalk.red('✗ Failed to pull latest master of Database-files.'))
      process.exit(1)
  }
}

console.log(chalk.green('✓ Successfully checked out the proper Data-files branch/tag.'))

console.log(chalk.blue('Installing websocket dependencies with yarn...'))
cmd = spawnSync(yarn, ['--pure-lockfile'], { encoding : 'utf8', cwd: './resources/socket', stdio: [null, process.stdout, process.stderr] })
if (cmd.status !== 0) {
    console.log('✗ Installation of websocket dependencies failed.')
    console.log('✗ You may be missing either node/npm or yarn.')
    process.exit(1)
}

console.log(chalk.green('✓ All necessary node dependencies have been installed.'))

console.log(chalk.blue('Building the Docker containers with docker-compose.'))
cmd = spawnSync('docker-compose', ['up', '--no-start'], { encoding : 'utf8', cwd: './', stdio: [null, process.stdout, process.stderr] })
if (cmd.status !== 0) {
    console.log(chalk.red('✗ Failed to create the composed Docker.'))
    process.exit(1)
}

cmd = spawnSync('docker-compose', ['start'], { encoding : 'utf8', cwd: './', stdio: [null, process.stdout, process.stderr] })
if (cmd.status !== 0) {
    console.log(chalk.red('✗ Failed to start the composed Docker.'))
    process.exit(1)
}

cmd = spawnSync('docker', ['container', 'list'], { encoding : 'utf8', cwd: './', stdio: 'pipe' })
while (cmd.stdout.indexOf('SQE_CGI') === -1) {
  console.log(chalk.yellow('✗ Waiting for the Web CGI Docker to start'))
  cmd = spawnSync('docker', ['container', 'list'], { encoding : 'utf8', cwd: './', stdio: 'pipe' })
}

cmd = spawnSync('docker', ['container', 'list'], { encoding : 'utf8', cwd: './', stdio: 'pipe' })
while (cmd.stdout.indexOf('SQE_Database') === -1) {
  console.log(chalk.yellow('✗ Waiting for the SQE_Database Docker to start'))
  cmd = spawnSync('docker', ['container', 'list'], { encoding : 'utf8', cwd: './', stdio: 'pipe' })
}

console.log(chalk.green('✓ Docker-compose is functional.'))

console.log(chalk.blue('Connecting to DB.  This may take a moment.'))
const pool = mariadb.createPool({
  host: 'localhost',
  port: 3307,
  user:'root', 
  password: 'none',
  connectionLimit: 5
})

const loadDB = (repeatCount) => {
  if (repeatCount < 11) {
    pool.getConnection()
    .then(conn => {
      console.log(chalk.green('✓ Connected to Database.'))
      conn.query("SHOW DATABASES")
        .then((rows) => {
          if (rows.length > 1) {
            console.log(chalk.green('✓ Database ready for data insertion.'))
  
            console.log(chalk.blue('Loading data...'))
            cmd = spawnSync('docker', ['exec', '-i', 'SQE_Database', '/tmp/import-database.sh'], { encoding : 'utf8', cwd: './', stdio: [null, process.stdout, process.stderr] })
            if (cmd.status !== 0) {
                console.log(chalk.red('✗ Failed to load data to the SQE_Database Docker.'))
                process.exit(1)
            }
            console.log(chalk.green('✓ The SQE database Docker has been installed and all data has been loaded.'))
            console.log(chalk.green('✓ The system is now fully installed: type `yarn start` to run it.'))
            process.exit(0)
          } else {
            console.log(chalk.red('✗ Database could not be made ready for data insertion.'))
          }
          conn.end()
        })
        .catch(err => {
          console.log(chalk.yellow(err))
          console.log(chalk.yellow(`Please wait while we try for ${repeatCount} times out of 10`))
          loadDB(repeatCount + 1)
          conn.end()
        })
    }).catch(err => {
      console.log(chalk.yellow(err))
      console.log(chalk.yellow(`Please wait while we try for ${repeatCount} times out of 10`))
      loadDB(repeatCount + 1)
    })
  } else {
    console.log(chalk.red(`Tried ${repeatCount} times, but couldn't connect to Docker database.`))
    console.log(chalk.red(`The bootstrap has failed at the last step.`))
    process.exit(1)
  }
  
}

loadDB(1)