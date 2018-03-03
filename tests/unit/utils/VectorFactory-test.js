import {
  geoJsonPolygonToSvg,
  geoJsonPointToSvg,
  geoJsonParseRect,
  // svgPolygonToGeoJson,
  // clipCanvas,
  dbMatrixToSVG,
  svgMatrixToDB,
  matrix6To16,
  matrix16To6,
} from '~/utils/VectorFactory.js'

describe("VectorFactory.geoJsonPolygonToSvg", () => {
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


describe('VectorFactory.geoJsonPointToSvg', () => {
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

describe('VectorFactory.geoJsonParseRect', () => {

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

describe('VectorFactory.dbMatrixToSVG', () => {
  it('should return undefined for incorrectly formatted input', () => {
    expect(dbMatrixToSVG('INCORRECT')).to.equal(undefined)
  })

  it('should convert 2D DB matrix to 1D SVG matrix', () => {
    // setup initial input
    const dbMatrix = [
      [1,3,5],
      [2,4,6],
    ]

    //define expected result
    const svgMatrix = [1,2,3,4,5,6]

    // assert expected value
    expect(dbMatrixToSVG(dbMatrix)).to.deep.equal(svgMatrix)
  })
})

describe('VectorFactory.svgMatrixToDB', () => {
  it('should return undefined for incorrectly formatted input', () => {
    expect(svgMatrixToDB('INCORRECT')).to.equal(undefined)
    expect(svgMatrixToDB([0,1,2,3,4,5,6,7])).to.equal(undefined)
  })

  it('should convert 16 element SVG matrix to a JSON string for the DB matrix', () => {
    // setup initial input
    const svgMatrix = [1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16]

    //define expected result
    const dbMatrix = '{\\"matrix\\": [[1,3,13],[2,4,14]]}'

    // assert expected value
    expect(svgMatrixToDB(svgMatrix)).to.equal(dbMatrix)
  })
})

describe('VectorFactory.matrix6To16', () => {
  it('should return undefined for incorrectly formatted input', () => {
    expect(matrix6To16('INCORRECT')).to.equal(undefined)
    expect(matrix6To16([0,1,2,3,4,5,6,7])).to.equal(undefined)
  })

  it('should convert 16 element SVG matrix to a JSON string for the DB matrix', () => {
    // setup initial input
    const  matrix6 = [1,2,5,6,13,14]

    //define expected result
    const matrix16 = [1,2,0,0,5,6,0,0,0,0,1,0,13,14,0,1]

    // assert expected value
    expect(matrix6To16(matrix6)).to.deep.equal(matrix16)
  })
})

describe('VectorFactory.matrix16To6', () => {
  it('should return undefined for incorrectly formatted input', () => {
    expect(matrix16To6('INCORRECT')).to.equal(undefined)
    expect(matrix16To6([0,1,2,3,4,5,6,7])).to.equal(undefined)
  })

  it('should convert 16 element SVG matrix to a JSON string for the DB matrix', () => {
    // setup initial input
    const matrix16 = [1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16]

    //define expected result
    const matrix6 = [1,2,5,6,13,14]

    // assert expected value
    expect(matrix16To6(matrix16)).to.deep.equal(matrix6)
  })
})

// describe('svgPolygonToGeoJson', () => {

// })

// describe('clipCanvas', () => {
  
// })