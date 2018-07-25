import 'es5-shim'
import 'es6-shim'
import Vue from 'vue'

Vue.config.productionTip = false

try {
  // require all test files (files that ends with -test.js)
  const testsContext = require.context('./unit', true, /-test\.js$/)
  testsContext.keys().forEach(testsContext)

  // require all src files except main.js for coverage.
  // you can also change this to match only the subset of files that
  // you want coverage for.
  const srcContext = require.context('../src/js', true, /^\.\/(?!main(\.js)?$)/)
  srcContext.keys().forEach(srcContext)
} catch (e) {
  // This dummy suite only runs if Webpack encounters a hard error attempting
  // to build the test context. If it does, then this catches it and gives
  // something intelligible.
  /* istanbul ignore next */
  describe('test compilation', () => {
    it('should not throw an error', () => {
      expect(e).to.equal(null)
    })
  })
}
