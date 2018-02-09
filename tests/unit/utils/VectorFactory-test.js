import {
  geoJsonPolygonToSvg,
  geoJsonPointToSvg,
  geoJsonParseRect,
  svgPolygonToGeoJson,
  clipCanvas
} from '~/utils/VectorFactory.js'

describe("geoJsonPolygonToSvg", () => {
  it('should return undefined when unrecognized input passed', () => {
    expect(geoJsonPolygonToSvg('INCORRECT')).to.equal(undefined)
  })

  it('should convert a GeoJSON Polygon to a valid svg path String', () => {
    // setup initial state
    const point1 = {
      x: 1,
      y: 1,
    }
    const point2 = {
      x: 5,
      y: 1,
    }
    const point3 = {
      x: 1,
      y: 5,
    }
    const geoJsonPolygon = `POLYGON((${point1.x} ${point1.y},${point2.x} ${point2.y},${point3.x} ${point3.y},${point1.x} ${point1.y}))`
    const boundingRect = {
        x: point1.x - point1.x,
        y: point1.y - point1.y,
        width: point2.x - point1.x,
        height: point3.y - point1.y,
    }
    //define expected result
    const expectedSvgPolygon = `M${point1.x} ${point1.y}L${point2.x} ${point2.y}L${point3.x} ${point3.y}L${point1.x} ${point1.y}`

    // assert expected value
    expect(geoJsonPolygonToSvg(geoJsonPolygon, boundingRect)).to.equal(expectedSvgPolygon)
  })
})


describe('geoJsonPointToSvg', () => {
  it('should return undefined when unrecognized input passed', () => {
    expect(geoJsonPointToSvg('INCORRECT')).to.equal(undefined)
  })

  it('should should convert a GeoJSON point to a point object', () => {
    // setup initial state
    const geoJsonPoint = 'POINT(10 20)'

    //define expected result
    const pointObject = {
      x: 10,
      y: 20,
    }

    // assert expected value
    expect(geoJsonPointToSvg(geoJsonPoint)).to.deep.equal(pointObject)
  })
})

describe('geoJsonParseRect', () => {

  it('should return undefined when unrecognized input passed', () => {
    expect(geoJsonParseRect('INCORRECT')).to.equal(undefined)
  })

  it('should convert a POLYGON string to a JSON rect', () => {

    // setup initial state (_s = start, _e = end)
    const xs = 1, ys = 2, xe = 3, ye = 4
    const polygon = `POLYGON((${xs} ${ys}, ,${xe} ${ye}))`

    //define expected result
    const expectedResult = {
      x: xs,
      y: ys,
      width: (xe - xs),
      height: (ye - ys),
    }

    // assert expected value
    expect(geoJsonParseRect(polygon)).to.deep.equal(expectedResult)
  })

})

// describe('svgPolygonToGeoJson', () => {

// })

// describe('clipCanvas', () => {
  
// })