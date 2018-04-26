const webpackConfig = require('./webpack.test.js')


module.exports = config => config.set({
  browsers: ['Chrome', 'ChromeHeadless', 'ChromeHeadlessNoSandbox', 'Firefox'],
  customLaunchers: {
    ChromeHeadlessNoSandbox: {
      base: 'ChromeHeadless',
      flags: ['--no-sandbox'] // needful to run in Travis
    }
  },
  frameworks: ['mocha', 'sinon-chai'],
  reporters: ['spec', 'coverage'],
  files: [
    'tests/index.js'
  ],
  preprocessors: {
    'tests/index.js': ['webpack', 'sourcemap']
  },
  webpack: webpackConfig,
  webpackMiddleware: {
    noInfo: true
  },
  coverageReporter: {
    dir: './coverage',
    reporters: [
      { type: 'lcov', subdir: '.' },
      { type: 'text-summary' }
    ]
  }
})
