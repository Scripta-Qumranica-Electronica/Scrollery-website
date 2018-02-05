const webpackConfig = require('./webpack.test.js')

module.exports = config => config.set({

  files: [
    { pattern: 'tests/**/*.js', watched: true, served: true, included: true }    
  ],
  
  //executes the tests whenever one of watched files changes 
  autoWatch: true,
  //if true, Karma will run tests and then exit browser 
  singleRun: false,
  //if true, Karma fails on running empty test-suites 
  failOnEmptyTestSuite: false,
  //reduce the kind of information passed to the bash 
  logLevel: config.LOG_DEBUG, //config.LOG_DISABLE, config.LOG_ERROR, config.LOG_INFO, config.LOG_DEBUG 
                                    
  //list of frameworks you want to use, only jasmine is installed automatically 
  frameworks: ['jasmine'],
  //list of browsers to launch and capture 
  browsers: ['Chrome'/*,'PhantomJS','Firefox','Edge','ChromeCanary','Opera','IE','Safari'*/],
  //list of reporters to use 
  reporters: ['mocha','kjhtml'/*,'dots','progress','spec'*/],
  
  //address that the server will listen on, '0.0.0.0' is default 
  listenAddress: '0.0.0.0',
  //hostname to be used when capturing browsers, 'localhost' is default 
  hostname: 'localhost',
  //the port where the web server will be listening, 9876 is default 
  port: 9876,

  //when a browser crashes, karma will try to relaunch, 2 is default 
  retryLimit: 0,
  //how long does Karma wait for a browser to reconnect, 2000 is default 
  browserDisconnectTimeout: 5000,
  //how long will Karma wait for a message from a browser before disconnecting from it, 10000 is default 
  browserNoActivityTimeout: 10000,
  //timeout for capturing a browser, 60000 is default 
  captureTimeout: 60000,

  client: {
      //capture all console output and pipe it to the terminal, true is default 
      captureConsole:false,
      //if true, Karma clears the context window upon the completion of running the tests, true is default 
      clearContext:false,
      //run the tests on the same window as the client, without using iframe or a new window, false is default 
      runInParent: false,
      //true: runs the tests inside an iFrame; false: runs the tests in a new window, true is default 
      useIframe:true,
      jasmine:{
          //tells jasmine to run specs in semi random order, false is default 
          random: false
      }
  },

  /*karma-webpack config*/
  preprocessors: {
    //use webpack to support require() in test-suits .js files 
    //use babel-loader from webpack to compile es2015 features in .js files 
    //add webpack as preprocessor 
    './tests/**/*.js': ['webpack']
  },

  webpack: webpackConfig,

  webpackMiddleware: {
    //turn off webpack bash output when run the tests 
    noInfo: true,
    stats: 'errors-only'
  },

  /*karma-mocha-reporter config*/
  mochaReporter: {
      output: 'noFailures'  //full, autowatch, minimal 
  }
})
