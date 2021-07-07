import { trace } from '~/utils/Potrace.js'

describe('Potrace.trace', () => {
  it('should return an SVG path for a canvas', done => {
    let testCanvas = document.createElement('canvas')
    testCanvas.width = 100
    testCanvas.height = 100
    const path =
      'M1 15.5 L 1 30 1.518 30 L 2.036 30 11.848 25.076 L 21.659 20.153 23.242 22.826 L 24.826 25.5 27.328 27.844 L 29.83 30.189 31.92 29.525 L 34.011 28.862 37.005 26.342 L 40 23.822 40 21.396 L 40 18.971 36.75 16.989 L 33.5 15.007 31.2 15.004 L 28.901 15 25.921 16.541 L 22.941 18.082 21.971 17.482 L 21 16.882 21 12.896 L 21 8.909 23.25 6.705 L 25.5 4.5 28 2.802 L 30.5 1.105 15.75 1.052 L 1 1 1 15.5 '
    let testCTX = testCanvas.getContext('2d')
    testCTX.fillStyle = 'purple'
    testCTX.beginPath()
    testCTX.moveTo(1, 1)
    testCTX.lineTo(1, 30)
    testCTX.lineTo(30, 15)
    testCTX.quadraticCurveTo(50, 20, 30, 30)
    testCTX.quadraticCurveTo(10, 10, 30, 1)
    testCTX.lineTo(1, 1)
    testCTX.closePath()
    testCTX.fill()

    trace(testCanvas, 1)
      .then(resolve => {
        expect(resolve).to.equal(path)
        done()
      })
      .catch(done)
  })

  it('should return an SVG path for a canvas with a circle', done => {
    let testCanvas = document.createElement('canvas')
    testCanvas.width = 100
    testCanvas.height = 100
    const path =
      'M53.5 15.905 L 51.5 16.792 48.5 19.962 L 45.5 23.131 45.5 30.049 L 45.5 36.967 49.267 40.733 L 53.033 44.5 60 44.5 L 66.967 44.5 70.733 40.733 L 74.5 36.967 74.5 30 L 74.5 23.033 70.801 19.334 L 67.102 15.635 61.301 15.327 L 55.5 15.019 53.5 15.905 '
    let testCTX = testCanvas.getContext('2d')
    testCTX.fillStyle = 'purple'
    testCTX.beginPath()
    testCTX.arc(60, 30, 15, 0, 2 * Math.PI)
    testCTX.closePath()
    testCTX.fill()

    trace(testCanvas, 1)
      .then(resolve => {
        expect(resolve).to.equal(path)
        done()
      })
      .catch(done)
  })

  it('should return an error for a blank canvas', done => {
    let testCanvas = document.createElement('canvas')
    const error = Error('Canvas is blank!')
    trace(testCanvas, 1)
      .then(resolve => {
        expect(resolve.message).to.equal(error.message)
        done()
      })
      .catch(done)
  })
})
