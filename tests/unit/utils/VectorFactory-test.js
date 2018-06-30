import {
  wktPolygonToSvg,
  wktPointToSvg,
  wktParseRect,
  svgPolygonToWKT,
  svgPolygonToGeoJSON,
  svgPolygonToClipper,
  clipperToSVGPolygon,
  geoJSONPolygonToWKT,
  dbMatrixToSVG,
  svgMatrixToDB,
  matrix6To16,
  matrix16To6,
  clipCanvas,
} from '~/utils/VectorFactory.js'
import * as polygons from '../../.utils/testing-data/polygons.js'

describe('VectorFactory.wktPolygonToSvg', () => {
  it('should return undefined when unrecognized input passed', () => {
    expect(wktPolygonToSvg('INCORRECT')).to.equal(undefined)
  })

  it('should convert a simple terminated WKT Polygon to a valid svg path String', () => {
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
    const wktPolygon = `POLYGON((${point1.x} ${point1.y},${point2.x} ${point2.y},${point3.x} ${point3.y},${point1.x} ${point1.y}))`
    const boundingRect = {
      x: point1.x - point1.x,
      y: point1.y - point1.y,
      width: point2.x - point1.x,
      height: point3.y - point1.y,
    }
    //define expected result
    const expectedSvgPolygon = `M${point1.x} ${point1.y}L${point2.x} ${point2.y}L${point3.x} ${
      point3.y
    }L${point1.x} ${point1.y}`

    // assert expected value
    expect(wktPolygonToSvg(wktPolygon, boundingRect)).to.equal(expectedSvgPolygon)
  })

  it('should convert a simple unterminated WKT Polygon to a valid svg path String', () => {
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
    const wktPolygon = `POLYGON((${point1.x} ${point1.y},${point2.x} ${point2.y},${point3.x} ${point3.y}))`
    const boundingRect = {
      x: point1.x - point1.x,
      y: point1.y - point1.y,
      width: point2.x - point1.x,
      height: point3.y - point1.y,
    }
    //define expected result
    const expectedSvgPolygon = `M${point1.x} ${point1.y}L${point2.x} ${point2.y}L${point3.x} ${
      point3.y
    }L${point1.x} ${point1.y}`

    // assert expected value
    expect(wktPolygonToSvg(wktPolygon, boundingRect)).to.equal(expectedSvgPolygon)
  })

  it('should convert a complex WKT Polygon to a valid svg path String', () => {
    expect(wktPolygonToSvg(polygons.wkt_terminated)).to.equal(polygons.svg_terminated)
  })

  it('should convert a complex unterminated WKT Polygon to a valid svg path String', () => {
    expect(wktPolygonToSvg(polygons.wkt_unterminated)).to.equal(polygons.svg_terminated)
  })
})

describe('VectorFactory.wktPointToSvg', () => {
  it('should return undefined when unrecognized input passed', () => {
    expect(wktPointToSvg('INCORRECT')).to.equal(undefined)
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
    expect(wktPointToSvg(geoJsonPoint)).to.deep.equal(pointObject)
  })
})

describe('VectorFactory.wktParseRect', () => {
  it('should return undefined when unrecognized input passed', () => {
    expect(wktParseRect('INCORRECT')).to.equal(undefined)
  })

  it('should convert a POLYGON string to a JSON rect', () => {
    // setup initial state (_s = start, _e = end)
    const xs = 1,
      ys = 2,
      xe = 3,
      ye = 4
    const polygon = `POLYGON((${xs} ${ys}, ,${xe} ${ye}))`

    //define expected result
    const expectedResult = {
      x: xs,
      y: ys,
      width: xe - xs,
      height: ye - ys,
    }

    // assert expected value
    expect(wktParseRect(polygon)).to.deep.equal(expectedResult)
  })
})

describe('VectorFactory.svgPolygonToWKT', () => {
  it('should return undefined when unrecognized input passed', () => {
    expect(svgPolygonToWKT('INCORRECT')).to.equal(undefined)
  })

  it('should convert a simple SVG path to a WKT string', () => {
    // Setup the input and result
    let svg = 'M'
    let wkt = 'POLYGON(('
    for (let i = 0; i < 20; i++) {
      svg += `${i} ${i * 10}`
      wkt += `${i} ${i * 10}`
      if (i % 2 === 0) {
        svg += ' L '
      } else {
        svg += ' '
      }
      wkt += ','
      if (i === 19) {
        wkt += '0 0'
      }
    }
    wkt += '),('
    svg += 'M'
    for (let i = 0; i < 20; i++) {
      svg += `${i} ${i * 10}`
      wkt += `${i} ${i * 10}`
      if (i % 2 === 0) {
        svg += ' L '
      } else {
        svg += ' '
      }
      wkt += ','
      if (i === 19) {
        wkt += '0 0'
      }
    }
    wkt += '))'
    // assert expected value
    expect(svgPolygonToWKT(svg)).to.equal(wkt)
  })

  it('should convert a complex terminated SVG path to a valid WKT polygon String', () => {
    expect(svgPolygonToWKT(polygons.svg_terminated)).to.equal(polygons.wkt_terminated)
  })

  it('should convert a complex unterminated SVG path to a valid WKT polygon String', () => {
    expect(svgPolygonToWKT(polygons.svg_unterminated)).to.equal(polygons.wkt_terminated)
  })
})

describe('VectorFactory.svgPolygonToGeoJSON', () => {
  it('should return undefined when unrecognized input passed', () => {
    expect(svgPolygonToGeoJSON('INCORRECT')).to.equal(undefined)
  })

  it('should convert a simple SVG path to a GeoJSON representation', () => {
    // Setup the input and result
    const svg = 'M0 0 10 0 10 10 0 10M1 1 1 3 3 3 3 1'
    const geoJSON = 
    {
      type:'Polygon',
      coordinates:
      [
        [
          [0,0],
          [10,0],
          [10,10],
          [0,10],
          [0,0]
        ],
        [
          [1,1],
          [1,3],
          [3,3],
          [3,1],
          [1,1]
        ]
      ]
    }
    // assert expected value
    expect(JSON.stringify(svgPolygonToGeoJSON(svg)))
    .to.equal(JSON.stringify(geoJSON))
  })

  it('should convert a complex terminated SVG path to a valid GeoJSON representation', () => {
    expect(svgPolygonToGeoJSON(polygons.svg_terminated)).to.deep.equal(polygons.geoJSON)
  })

  it('should convert a complex unterminated SVG path to a valid GeoJSON representation', () => {
    expect(svgPolygonToGeoJSON(polygons.svg_unterminated)).to.deep.equal(polygons.geoJSON)
  })
})

describe('VectorFactory.svgPolygonToClipper', () => {
  it('should return undefined when unrecognized input passed', () => {
    expect(svgPolygonToClipper('INCORRECT')).to.equal(undefined)
  })

  it('should convert a simple SVG path to a Clipper representation', () => {
    // Setup the input and result
    const svg = 'M0 0 10 0 10 10 0 10M1 1 1 3 3 3 3 1'
    const clipper = 
    [
      [
        {"X": 0, "Y": 0},
        {"X": 10, "Y": 0},
        {"X": 10, "Y": 10},
        {"X": 0, "Y": 10},
        {"X": 0, "Y": 0}
      ],
      [
        {"X": 1, "Y": 1},
        {"X": 1, "Y": 3},
        {"X": 3, "Y": 3},
        {"X": 3, "Y": 1},
        {"X": 1, "Y": 1}
      ]
    ]
    // assert expected value
    expect(svgPolygonToClipper(svg))
    .to.deep.equal(clipper)
  })

  it('should convert a complex terminated SVG path to a valid Clipper representation', () => {
    expect(svgPolygonToClipper(polygons.svg_terminated)).to.deep.equal(polygons.clipper)
  })

  it('should convert a complex unterminated SVG path to a valid Clipper representation', () => {
    expect(svgPolygonToClipper(polygons.svg_unterminated)).to.deep.equal(polygons.clipper)
  })
})

describe('VectorFactory.clipperToSVGPolygon', () => {
  it('should return undefined when unrecognized input passed', () => {
    expect(clipperToSVGPolygon('INCORRECT')).to.equal(undefined)
  })

  it('should convert a simple Clipper representation to a SVG path', () => {
    // Setup the input and result
    const svg = 'M0 0L10 0L10 10L0 10L0 0M1 1L1 3L3 3L3 1L1 1'
    const clipper = 
    [
      [
        {"X": 0, "Y": 0},
        {"X": 10, "Y": 0},
        {"X": 10, "Y": 10},
        {"X": 0, "Y": 10},
        {"X": 0, "Y": 0}
      ],
      [
        {"X": 1, "Y": 1},
        {"X": 1, "Y": 3},
        {"X": 3, "Y": 3},
        {"X": 3, "Y": 1},
        {"X": 1, "Y": 1}
      ]
    ]
    // assert expected value
    expect(clipperToSVGPolygon(clipper))
    .to.equal(svg)
  })

  it('should convert a simple unterminated Clipper representation to a SVG path', () => {
    // Setup the input and result
    const svg = 'M0 0L10 0L10 10L0 10L0 0M1 1L1 3L3 3L3 1L1 1'
    const clipper = 
    [
      [
        {"X": 0, "Y": 0},
        {"X": 10, "Y": 0},
        {"X": 10, "Y": 10},
        {"X": 0, "Y": 10}
      ],
      [
        {"X": 1, "Y": 1},
        {"X": 1, "Y": 3},
        {"X": 3, "Y": 3},
        {"X": 3, "Y": 1}
      ]
    ]
    // assert expected value
    expect(clipperToSVGPolygon(clipper))
    .to.equal(svg)
  })

  it('should convert a complex valid Clipper representation to a terminated SVG path', () => {
    expect(clipperToSVGPolygon(polygons.clipper)).to.equal(polygons.svg_terminated)
  })
})

describe('VectorFactory.geoJSONPolygonToWKT', () => {
  it('should return undefined when unrecognized input passed', () => {
    expect(geoJSONPolygonToWKT('INCORRECT')).to.equal(undefined)
  })

  it('should convert a GeoJSON representation to a WKT representation', () => {
    // Setup the input and result
    const geoJSON = {
      type: "Polygon",
      coordinates: [
        [
          [0,0],
          [0,1],
          [1,1],
          [1,0],
          [0,0]
        ]
      ]
    }
    const wkt = 'POLYGON((0 0,0 1,1 1,1 0,0 0))'
    // assert expected value
    expect(geoJSONPolygonToWKT(geoJSON)).to.equal(wkt)
    expect(geoJSONPolygonToWKT(JSON.stringify(geoJSON))).to.equal(wkt)
  })

  it('should convert a simple unterminated GeoJSON representation to a WKT representation', () => {
    // Setup the input and result
    const geoJSON = {
      type: "Polygon",
      coordinates: [
        [
          [0,0],
          [0,1],
          [1,1],
          [1,0]
        ]
      ]
    }
    const wkt = 'POLYGON((0 0,0 1,1 1,1 0,0 0))'
    // assert expected value
    expect(geoJSONPolygonToWKT(geoJSON)).to.equal(wkt)
    expect(geoJSONPolygonToWKT(JSON.stringify(geoJSON))).to.equal(wkt)
  })

  it('should convert a complex valid GeoJSON representation to a valid WKT representation', () => {
    expect(geoJSONPolygonToWKT(polygons.geoJSON)).to.equal(polygons.wkt_terminated)
    expect(geoJSONPolygonToWKT(JSON.stringify(polygons.geoJSON))).to.equal(polygons.wkt_terminated)
  })
})

describe('VectorFactory.dbMatrixToSVG', () => {
  it('should return undefined for incorrectly formatted input', () => {
    expect(dbMatrixToSVG('INCORRECT')).to.equal(undefined)
  })

  it('should convert 2D DB matrix to 1D SVG matrix', () => {
    // setup initial input
    const dbMatrix = [[1, 3, 5], [2, 4, 6]]

    //define expected result
    const svgMatrix = [1, 2, 3, 4, 5, 6]

    // assert expected value
    expect(dbMatrixToSVG(dbMatrix)).to.deep.equal(svgMatrix)
  })

  it('should convert string representation of a 2D DB matrix to 1D SVG matrix', () => {
    // setup initial input
    const dbMatrix = {matrix: [[1, 3, 5], [2, 4, 6]]}

    //define expected result
    const svgMatrix = [1, 2, 3, 4, 5, 6]

    // assert expected value
    expect(dbMatrixToSVG(JSON.stringify(dbMatrix))).to.deep.equal(svgMatrix)
  })
})

describe('VectorFactory.svgMatrixToDB', () => {
  it('should return undefined for incorrectly formatted input', () => {
    expect(svgMatrixToDB('INCORRECT')).to.equal(undefined)
    expect(svgMatrixToDB([0, 1, 2, 3, 4, 5, 6, 7])).to.equal(undefined)
  })

  it('should convert 6 element SVG matrix to a JSON string for the DB matrix', () => {
    // setup initial input
    const svgMatrix = [1, 2, 3, 4, 5, 6]

    //define expected result
    const dbMatrix = '{"matrix": [[1,3,5],[2,4,6]]}'

    // assert expected value
    expect(svgMatrixToDB(svgMatrix)).to.equal(dbMatrix)
  })
})

describe('VectorFactory.matrix6To16', () => {
  it('should return undefined for incorrectly formatted input', () => {
    expect(matrix6To16('INCORRECT')).to.equal(undefined)
    expect(matrix6To16([0, 1, 2, 3, 4, 5, 6, 7])).to.equal(undefined)
  })

  it('should convert 16 element SVG matrix to a JSON string for the DB matrix', () => {
    // setup initial input
    const matrix6 = [1, 2, 5, 6, 13, 14]

    //define expected result
    const matrix16 = [1, 2, 0, 0, 5, 6, 0, 0, 0, 0, 1, 0, 13, 14, 0, 1]

    // assert expected value
    expect(matrix6To16(matrix6)).to.deep.equal(matrix16)
  })
})

describe('VectorFactory.matrix16To6', () => {
  it('should return undefined for incorrectly formatted input', () => {
    expect(matrix16To6('INCORRECT')).to.equal(undefined)
    expect(matrix16To6([0, 1, 2, 3, 4, 5, 6, 7])).to.equal(undefined)
  })

  it('should convert 16 element SVG matrix to a JSON string for the DB matrix', () => {
    // setup initial input
    const matrix16 = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16]

    //define expected result
    const matrix6 = [1, 2, 5, 6, 13, 14]

    // assert expected value
    expect(matrix16To6(matrix16)).to.deep.equal(matrix6)
  })
})

describe('clipCanvas', () => {
  it('should draw an SVG path on the canvas', () => {
    let testCanvas = document.createElement('canvas')
    let comparisonCanvas = document.createElement('canvas')
    testCanvas.width = 10
    comparisonCanvas.width = 10
    testCanvas.height = 10
    comparisonCanvas.height = 10
    const path = 'M1 1 L 1 3 1 3 L 3 3 3 3 L 3 1 3 1 L 1 1'
    let comparisonCTX = comparisonCanvas.getContext('2d')
    comparisonCTX.beginPath()
    comparisonCTX.moveTo(1, 1)
    comparisonCTX.lineTo(1, 3)
    comparisonCTX.lineTo(3, 3)
    comparisonCTX.lineTo(3, 1)
    comparisonCTX.lineTo(1, 1)
    comparisonCTX.closePath()
    comparisonCTX.fillStyle = 'purple'
    comparisonCTX.fill()
    clipCanvas(testCanvas, path, 1)
    expect(testCanvas).to.deep.equal(comparisonCanvas)
    clipCanvas(testCanvas, path)
    expect(testCanvas).to.deep.equal(comparisonCanvas)
  })

  it('should draw an SVG path on the canvas with a default divisor', () => {
    let testCanvas = document.createElement('canvas')
    let comparisonCanvas = document.createElement('canvas')
    testCanvas.width = 10
    comparisonCanvas.width = 10
    testCanvas.height = 10
    comparisonCanvas.height = 10
    const path = 'M1 1 L 1 3 1 3 L 3 3 3 3 L 3 1 3 1 L 1 1'
    let comparisonCTX = comparisonCanvas.getContext('2d')
    comparisonCTX.beginPath()
    comparisonCTX.moveTo(1, 1)
    comparisonCTX.lineTo(1, 3)
    comparisonCTX.lineTo(3, 3)
    comparisonCTX.lineTo(3, 1)
    comparisonCTX.lineTo(1, 1)
    comparisonCTX.closePath()
    comparisonCTX.fillStyle = 'purple'
    comparisonCTX.fill()
    clipCanvas(testCanvas, path, 1)
    expect(testCanvas).to.deep.equal(comparisonCanvas)
    clipCanvas(testCanvas, path)
    expect(testCanvas).to.deep.equal(comparisonCanvas)
  })
})
