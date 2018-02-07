import {
  geoJsonPolygonToSvg,
  geoJsonPointToSvg,
  geoJsonParseRect,
  svgPolygonToGeoJson,
  clipCanvas
} from '~/utils/VectorFactory.js'

describe("geoJsonPolygonToSvg", () => {

})


describe('geoJsonPointToSvg', () => {

})

describe('geoJsonParseRect', () => {

  it('should return undefined when unrecognized input passed', () => {
    expect(geoJsonParseRect('INCORRECT')).to.equal(undefined)
  })

  it('should parse a POLYGON string', () => {

    // setup initial state
    const x = 1, y = 2, width = 3, height = 4
    const polygon = `POLYGON((${x} ${y}, ,${width} ${height})`

    // apply change
    const svg = geoJsonParseRect(polygon)

    // assert expected value
    expect(svg.x).to.equal(x)
    expect(svg.y).to.equal(y)
    expect(svg.width).to.equal(width - x)
    expect(svg.height).to.equal(height - y)
  })

})

describe('svgPolygonToGeoJson', () => {

})

describe('clipCanvas', () => {
  
})