const common = require('./webpack.common.js')

// Not needed for karma tests
delete common.entry
delete common.output

// source maps for pleasant debugging
common.devtool = 'eval-source-map'

module.exports = common