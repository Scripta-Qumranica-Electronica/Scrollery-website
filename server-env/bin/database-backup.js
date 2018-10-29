const { spawnSync } = require('child_process')
const fs = require('fs')
const fse = require('fs-extra')
const compressing = require('compressing')
const md5File = require('md5-file')
const mariadb = require('mariadb')
const chalk = require('chalk')
const md5sums = require('./tables/md5sums.json')

// Default settings
const schemaBackupPath = 'resources/data-files/schema/'
const schemaTempBackupPath = 'resources/data-backup/'
const schemaBackupName = 'SQE-Schema-current.sql'
const tableBackupPath = 'resources/data-files/tables/'
const tableTempBackupPath = 'resources/data-backup/tables/'
const tableBlackList = ['user', 'user_sessions', 'sqe_session', 'single_action', 'main_action']
let allFiles = []
let filesMD5 = {}

/**
 * We simply run mysqldump from in the Docker Container.
 * The output is dumped to stdout, and written from there
 * into the proper backup file.  It is important to use the
 * `--routines` flag in order to backup stored procudures
 * and funcions.
 */
console.log(chalk.blue('Attempting to backup the schema from SQE_Database Docker...'))
let cmd = spawnSync('docker', ['exec', '-i', 'SQE_Database', '/usr/bin/mysqldump', '--no-data', '--skip-dump-date', '--routines', '-u', 'root', '-pnone', 'SQE_DEV'], { encoding : 'utf8', cwd: './', stdio: 'pipe' })
if (cmd.status !== 0) {
  console.log(chalk.red('✗ Failed to backup the schema from SQE_Database Docker.'))
  process.exit(1)
} else {
  console.log('saving to ' + schemaTempBackupPath + schemaBackupName)
  fs.writeFile(schemaTempBackupPath + schemaBackupName, cmd.stdout, (err) => {
    if(err) {
        return console.log(chalk.red(err))
    }
    console.log(chalk.green(`✓ The database schema has been saved to ${schemaTempBackupPath + schemaBackupName}`))
    md5File(schemaBackupPath + schemaBackupName, (err1, hash1) => {
      if (err1) throw err1
      md5File(schemaTempBackupPath + schemaBackupName, (err2, hash2) => {
        if (err2) throw err2
        console.log(chalk.yellow(`+ Old database schema has a md5sum: ${hash1}`))
        console.log(chalk.yellow(`+ New database schema has a md5sum: ${hash2}`))
        if (hash1 !== hash2) {
          fse.copy(schemaTempBackupPath + schemaBackupName, schemaBackupPath + schemaBackupName)
            .then(() => {
              console.log(chalk.green(`✓ The database schema has been copied to ${schemaBackupPath + schemaBackupName}`))
            })
            .catch(err => console.error(chalk.red(err)))
        } else {
          console.log(chalk.green(`✓ No change to database schema, leaving it as-is.`))
        }
      })
    })
    
  })
}

/**
 * After backing up the schema, we use a custom function to backup
 * all tables to separate files.  Each file should be a simple CSV.
 */

const getTables = (pool, repeatCount) => {
  let ownedTables = []
  let defaultTables = []
  return new Promise((resolve, reject) => {
    if (repeatCount < 11) {
      pool.getConnection()
      .then(conn => {
        conn.query(`SELECT table_name AS Tables_in_SQE_DEV
                    FROM information_schema.tables    
                    WHERE table_type = 'BASE TABLE' AND table_schema='SQE_DEV'  
                    ORDER BY table_name ASC`)
          .then((rows) => {
            if (rows.length > 1) {
              // Get all the tables into sorted lists
              for (let i = 0, row; (row = rows[i]); i++) {
                if (row['Tables_in_SQE_DEV'] && row['Tables_in_SQE_DEV'].indexOf('owner') > -1) {
                  ownedTables.push(row['Tables_in_SQE_DEV'])
                } else if (row['Tables_in_SQE_DEV']) {
                  defaultTables.push(row['Tables_in_SQE_DEV'])
                }
              }
              // Remove "owned" tables from defaultTables
              for (let i = 0, ownedTable; (ownedTable = ownedTables[i]); i++) {
                defaultTables.splice(defaultTables.indexOf(ownedTable.replace('_owner', '')), 1)
              }
              for (let i = 0, blackListTable; (blackListTable = tableBlackList[i]); i++) {
                if (defaultTables[defaultTables.indexOf(blackListTable)]) defaultTables.splice(defaultTables.indexOf(blackListTable), 1)
                if (ownedTables[ownedTables.indexOf(blackListTable)]) ownedTables.splice(ownedTables.indexOf(blackListTable), 1)
              }
              resolve([defaultTables, ownedTables])
            } else {
              console.log(chalk.red('✗ Database could not be queried.'))
              reject('Connected to Database, but no tables found.')
            }
          })
          .catch(err => {
            console.log(chalk.yellow(`+ ${err}`))
            console.log(chalk.yellow(`+ Please wait while we try for ${repeatCount} times out of 10`))
            conn.end()
              .then(() => {
                resolve(getTables(pool, repeatCount + 1))
              })
              .catch(err => {
                console.log(chalk.yellow(`+ ${err}`))
                resolve(getTables(pool, repeatCount + 1))
              })
          })
      }).catch(err => {
        console.log(chalk.yellow(`+ ${err}`))
        console.log(chalk.yellow(`+ Please wait while we try for ${repeatCount} times out of 10`))
        resolve(getTables(pool, repeatCount + 1))
      })
    } else {
      console.log(chalk.red(`Tried ${repeatCount} times, but couldn't connect to Docker database.`))
      console.log(chalk.red(`The backup has failed while trying to save individual tables.`))
      reject('Database connection error.')
    }
  })
}

const saveDefaultTable = (pool, table, repeatCount) => {
  return new Promise((resolve, reject) => {
    if (repeatCount < 11) {
      pool.getConnection()
      .then(conn => {
        conn.query(`DESCRIBE ${table}`)
          .then((rows) => {
            if (rows.length > 0) {
              let fields = []
              for (let i = 0, row; (row = rows[i]); i++) {
                if (row['Field']) {
                  fields.push({[row['Field']]: row['Type']})
                }
              }
              let backupQuery = 'SELECT'
              for (let z = 0, column; (column = fields[z]); z++) {
                if (Object.values(column)[0] === 'polygon' || Object.values(column)[0] === 'multipolygon') {
                  backupQuery += ` ST_ASTEXT(\`${Object.keys(column)[0]}\`)`
                } else {
                  backupQuery += ` \`${Object.keys(column)[0]}\``
                }
                z < fields.length -1 && (backupQuery += ',')
              }
              backupQuery += ` FROM \`${table}\``
              conn.query(backupQuery)
                .then(rows => {
                  const file = fs.createWriteStream(tableTempBackupPath + table + '.sql')
                  file.on('error', function(err) { reject(err)})
                  file.write(fields.map((col) => {
                    return col[Object.keys(col)[0]] === 'polygon' || col[Object.keys(col)[0]] === 'multipolygon' ? 
                      '@' + Object.keys(col)[0] :
                      Object.keys(col)[0]
                  }).join(',') + '\n')
                  rows.forEach((row) => { 
                    file.write(Object.values(row).join(',') + '\n') 
                  })
                  file.end()
                  allFiles.push(table + '.sql')
                  console.log(chalk.green(`✓ The database table ${table} has been saved to ${tableTempBackupPath + table + '.sql'}`))
                  conn.end()
                    .then(() => {
                      resolve('Table saved.')
                    })
                    .catch(err => {
                      console.log(chalk.yellow(`+ ${err}`))
                      resolve('Table saved.')
                    })
                  
                })
            } else {
              console.log(chalk.red('✗ Database could not be queried.'))
              conn.end()
                .then(() => {
                  reject('Connected to Database, but no tables found.')
                })
                .catch(err => {
                  console.log(chalk.yellow(`+ ${err}`))
                  reject('Connected to Database, but no tables found.')
                })
            }
          })
          .catch(err => {
            console.log(chalk.yellow(`+ ${err}`))
            console.log(chalk.yellow(`+ Please wait while we retry for ${repeatCount} times out of 10 to get ${table}.`))
            conn.end()
              .then(() => {
                resolve(saveDefaultTable(pool, table, repeatCount + 1))
              })
              .catch(err => {
                console.log(chalk.yellow(`+ ${err}`))
                resolve(saveDefaultTable(pool, table, repeatCount + 1))
              })
          })
      }).catch(err => {
        console.log(chalk.yellow(`+ ${err}`))
        console.log(chalk.yellow(`+ Please wait while we retry for ${repeatCount} times out of 10`))
        resolve(saveDefaultTable(pool, table, repeatCount + 1))
      })
    } else {
      console.log(chalk.red(`Tried ${repeatCount} times, but couldn't connect to Docker database.`))
      console.log(chalk.red(`The backup has failed while trying to save individual tables.`))
      reject('Database connection error.')
    }
  })
}

const saveOwnerTable = (pool, table, repeatCount) => {
  return new Promise((resolve, reject) => {
    if (repeatCount < 11) {
      pool.getConnection()
      .then(conn => {
        // Backup owner table
        conn.query(`DESCRIBE ${table}`)
          .then((rows) => {
            if (rows.length > 0) {
              let fields = []
              for (let i = 0, row; (row = rows[i]); i++) {
                if (row['Field']) {
                  fields.push({[row['Field']]: row['Type']})
                }
              }
              let backupQuery = 'SELECT'
              for (let z = 0, column; (column = fields[z]); z++) {
                if (Object.values(column)[0] === 'polygon' || Object.values(column)[0] === 'multipolygon') {
                  backupQuery += ` ST_ASTEXT(\`${Object.keys(column)[0]}\`)`
                } else {
                  backupQuery += ` \`${Object.keys(column)[0]}\``
                }
                z < fields.length -1 && (backupQuery += ',')
              }
              backupQuery += ` FROM \`${table}\` 
              JOIN \`scroll_version\` USING(\`scroll_version_id\`)
              WHERE \`scroll_version\`.\`user_id\` = 1`
              conn.query(backupQuery)
                .then(rows => {
                  const file = fs.createWriteStream(tableTempBackupPath + table + '.sql')
                  file.on('error', function(err) { reject(err)})
                  file.write(fields.map((col) => {
                    return col[Object.keys(col)[0]] === 'polygon' || col[Object.keys(col)[0]] === 'multipolygon' ? 
                      '@' + Object.keys(col)[0] :
                      Object.keys(col)[0]
                  }).join(',') + '\n')
                  rows.forEach((row) => { 
                    file.write(Object.values(row).join(',') + '\n') 
                  })
                  file.end()
                  allFiles.push(table + '.sql')
                  console.log(chalk.green(`✓ The database table ${table} has been saved to ${tableTempBackupPath + table + '.sql'}`))
                  return('Table saved.')
                })
            } else {
              console.log(chalk.red('✗ Database could not be queried.'))
              reject('Connected to Database, but no tables found.')
            }
          })
          .then(() => {
            // Backup owned table
            const ownedTable = table.replace('_owner', '')
            conn.query(`DESCRIBE ${ownedTable}`)
            .then((rows) => {
              if (rows.length > 0) {
                let fields = []
                for (let i = 0, row; (row = rows[i]); i++) {
                  if (row['Field']) {
                    fields.push({[row['Field']]: row['Type']})
                  }
                }
                let backupQuery = 'SELECT'
                for (let z = 0, column; (column = fields[z]); z++) {
                  if (Object.values(column)[0] === 'polygon' || Object.values(column)[0] === 'multipolygon') {
                    backupQuery += ` ST_ASTEXT(\`${Object.keys(column)[0]}\`)`
                  } else {
                    backupQuery += ` \`${Object.keys(column)[0]}\``
                  }
                  z < fields.length -1 && (backupQuery += ',')
                }
                backupQuery += ` FROM \`${ownedTable}\`
                JOIN \`${table}\` USING(\`${ownedTable}_id\`)
                JOIN \`scroll_version\` USING(\`scroll_version_id\`)
                WHERE \`scroll_version\`.\`user_id\` = 1`
                conn.query(backupQuery)
                  .then(rows => {
                    const file = fs.createWriteStream(tableTempBackupPath + ownedTable + '.sql')
                    file.on('error', function(err) { reject(err)})
                    file.write(fields.map((col) => {
                      return col[Object.keys(col)[0]] === 'polygon' || col[Object.keys(col)[0]] === 'multipolygon' ? 
                        '@' + Object.keys(col)[0] :
                        Object.keys(col)[0]
                    }).join(',') + '\n')
                    rows.forEach((row) => { 
                      file.write(Object.values(row).join(',') + '\n') 
                    })
                    file.end()
                    allFiles.push(ownedTable + '.sql')
                    console.log(chalk.green(`✓ The database table ${ownedTable} has been saved to ${tableTempBackupPath + ownedTable + '.sql'}`))
                    conn.end()
                      .then(() => {
                        resolve('Table saved.')
                      })
                      .catch(err => {
                        console.log(chalk.yellow(`+ ${err}`))
                        resolve('Table saved.')
                      })
                  })
              } else {
                console.log(chalk.red('✗ Database could not be queried.'))
                conn.end()
                  .then(() => {
                    reject('Connected to Database, but no tables found.')
                  })
                  .catch(err => {
                    console.log(chalk.yellow(`+ ${err}`))
                    reject('Connected to Database, but no tables found.')
                  })
              }
            })
          })
          .catch(err => {
            console.log(chalk.yellow(`+ ${err}`))
            console.log(chalk.yellow(`+ Please wait while we retry for ${repeatCount} times out of 10`))
            conn.end()
              .then(() => {
                resolve(saveOwnerTable(pool, table, repeatCount + 1))
              })
              .catch(err => {
                console.log(chalk.yellow(`+ ${err}`))
                resolve(saveOwnerTable(pool, table, repeatCount + 1))
              })
          })
      }).catch(err => {
        console.log(chalk.yellow(`+ ${err}`))
        console.log(chalk.yellow(`+ Please wait while we retry for ${repeatCount} times out of 10 to get ${table}.`))
        resolve(saveOwnerTable(pool, table, repeatCount + 1))
      })
    } else {
      console.log(chalk.red(`Tried ${repeatCount} times, but couldn't connect to Docker database.`))
      console.log(chalk.red(`The backup has failed while trying to save individual tables.`))
      reject('Database connection error.')
    }
  })
}

/**
 * After creating the text file backup we need to compress the files.
 * We should then compare them with the existing backups, and only
 * copy over the files that have changed into data-files.  Perhaps we
 * can use some special compression function that limits the file size
 * to 100mb (the GitHub limit).
 */

const gzipFiles = () => {
  console.log(chalk.green('Done with backup.'))
  let count = 0
  let writing = 0
  allFiles.forEach(file => {
    md5File(tableTempBackupPath + file, (err, hash) => {
      if (err) throw err

      filesMD5[file] = hash
      if (!md5sums[file] || md5sums[file] !== hash) {
        writing += 1
        console.log(chalk.yellow(`+ The file ${file} has been updated, copying now...`))
        compressing.gzip.compressFile(tableTempBackupPath + file, tableBackupPath + file + '.gz')
        .then(() => {
          count += 1
          writing -= 1
          console.log(chalk.green(`✓ The file ${file} has been compressed and copied.`))
          // console.log(chalk.red(`Count ${count}, allFiles ${allFiles.length}, writing ${writing}`))
          if (count === allFiles.length && writing === 0) finishBackup()
        })
        .catch(err => console.log(chalk.red(err)))
      } else {
        count += 1
        console.log(chalk.green(`✓ No changes to ${file}.`))
        // console.log(chalk.red(`Count ${count}, allFiles ${allFiles.length}, writing ${writing}`))
        if (count === allFiles.length && writing === 0) finishBackup()
      } 
    })
  })
  
 }

const finishBackup = () => {
  fs.writeFile(tableBackupPath + 'md5sums.json', JSON.stringify(filesMD5), (err) => {
    if(err) {
        return console.log(chalk.red(err))
    }
    console.log(chalk.green(`✓ The table md5sums have been saved to ${schemaBackupPath + schemaBackupName}`))
    console.log(chalk.green(`✓ Database backup completed successfully.  
You should now commit the changes in the data-files repository folder.`))
    p.end()
      .then(() => process.exit(0))
      .catch(err => {
        console.error(chalk.red(err))
        process.exit(1)
      })
    
  })
}

console.log(chalk.blue('Attempting to backup the default data from SQE_Database Docker...'))
console.log(chalk.blue('Connecting to DB.  This may take a moment.'))
const p = mariadb.createPool({
  host: 'localhost',
  port: 3307,
  user:'root', 
  password: 'none',
  database: 'SQE_DEV',
  connectionLimit: 80
})

console.log(chalk.green('✓ Connected to DB.'))
getTables(p, 1)
  .then(([defaultTables, ownedTables]) => {
    console.log(chalk.green('✓ Got Database tables.'))
    numberOfTables = defaultTables.length + ownedTables.length - 1
    completed = 0
    for (let i = 0, table; (table = defaultTables[i]); i++) {
      saveDefaultTable(p, table, 1)
        .then(res => {
          if (completed === numberOfTables) gzipFiles()
          completed += 1
        })
        .catch(err => console.log(err))
    }
    for (let i = 0, table; (table = ownedTables[i]); i++) {
      saveOwnerTable(p, table, 1)
        .then(res => {
          if (completed === numberOfTables) gzipFiles()
          completed += 1
        })
        .catch(err => console.log(err))
    }
  })
  .catch((err) => {
    console.log(chalk.red(err))
    process.exit(1)
  })