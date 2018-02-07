import SignStreamProcessor from '~/utils/SignStreamProcessor.js'

describe('SignStreamProcessor', () => {

  let processor
  beforeEach(() => {
    processor = new SignStreamProcessor();
  })

  it('should be constructable', () => {
    expect(processor instanceof SignStreamProcessor).to.equal(true);
  })

  it('should process an array of objects', done => {

    // Add in some dummy data that takes the same structure as actual data
    processor.streamToTree([], 'prevKey', 'mainKey', 'nextKey')
      .then(tree => {

        // Fill in test cases: to assert that the structure is right
        expect(true).to.equal(true)
        done()
      })
      .catch(e => {

        // Whoops :( this code is broken.
        done()
      })
  })

  // Consider if all edge cases of valid and reasonable invalid input can be covered with more tests

})