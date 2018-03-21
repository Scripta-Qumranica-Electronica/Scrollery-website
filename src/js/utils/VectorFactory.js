/*
 * I think this may be misnamed, it seems that it
 * processes well-known text and not geoJSON.
 */
export function geoJsonPolygonToSvg(geoJSON, boundingRect) {
  let svg
  if (geoJSON.substring(0, 9) === 'POLYGON((') {
    svg = ''
    const polygons = geoJSON.split("\),\(")
    polygons.forEach(polygon => {
      svg += 'M'
      polygon = polygon.replace(/POLYGON/g, "")
      polygon = polygon.replace(/\(/g, "")
      polygon = polygon.replace(/\)/g, "")
      var points = polygon.split(",")

      /* When a boundingBox is passed, then we translate every point
       * based on the x and y position of that bounding box.  Otherwise,
       * we just add each point to the string unaltered. */
      if (boundingRect) {
        points.forEach(point => {
          if (svg.slice(-1) !== 'M'){
            svg += 'L'
          }
          svg += `${point.split(' ')[0] - boundingRect.x} ${point.split(' ')[1] - boundingRect.y}`
        })
      } else {
        points.forEach(point => {
          if (svg.slice(-1) !== 'M'){
            svg += 'L'
          }
          svg += `${point.split(' ')[0]} ${point.split(' ')[1]}`
        })
      }
    })
  }
  return svg
}

/*
 * I think this may be misnamed, it seems that it
 * processes well-known text and not geoJSON.
 */
export function geoJsonPointToSvg(geoJSON) {
    return geoJSON.substring(0, 6) === 'POINT(' 
        ? {
            x: parseFloat(geoJSON.split(' ')[0].replace('POINT(', '')),
            y: parseFloat(geoJSON.split(' ')[1])
        }
        : undefined
}

/*
 * I think this may be misnamed, it seems that it
 * processes well-known text and not geoJSON.
 */
export function geoJsonParseRect(geoJSON) {
    let svg
    if (geoJSON.substring(0, 9) === 'POLYGON((') {
        const rect = geoJSON.replace('POLYGON((', '')
        const coords = rect.split(',')
        const x = parseInt(coords[0].split(' ')[0])
        const y = parseInt(coords[0].split(' ')[1])
        const width = parseInt(coords[2].split(' ')[0]) - x
        const height = parseInt(coords[2].split(' ')[1]) - y
        svg = { x, y, width, height }
    }
    return svg
}

/*
 * Receive an svg path and convert it to a
 * WKT Polygon.
 */
export function svgPolygonToWKT(svg) {
	let wkt = 'POLYGON('
	const polygons = svg.split("M")
	polygons.forEach(poly => {
		if (poly) {
			if (wkt === 'POLYGON(') {
				wkt += '('
			} else {
				wkt += '),('
			}
			const lines = poly.replace(/L /g, '')
			const points = lines.split(' ')
			for (let i = 0, length = points.length - 3; i <= length; i += 2) {
				wkt += points[i] + ' ' + points[i+1]
				if (i !== length) {
				    wkt += ','
				}
			}
		}
	})
	wkt += '))'
	return wkt
}

// This function expects the transform matrix to be in a 2D array:
// [[a,c,tx],[b,d,ty]]
export function dbMatrixToSVG(matrix) {
    return matrix.length === 2 &&
    matrix[0].length === 3 &&
    matrix[1].length === 3
    ?
        [
            matrix[0][0],
            matrix[1][0],
            matrix[0][1],
            matrix[1][1],
            matrix[0][2],
            matrix[1][2]
        ] 
    :
        undefined
}

// This function converts the 6 element SVG transform matrix 
// to a JSON string for the 2D as stored in the database
export function svgMatrixToDB(matrix) {
    return Array.isArray(matrix) && matrix.length === 6
    ?
        `{"matrix": [[${matrix[0]},${matrix[2]},${matrix[4]}],[${matrix[1]},${matrix[3]},${matrix[5]}]]}`
    :
        undefined
}

export function matrix6To16(matrix) {
    return Array.isArray(matrix) && matrix.length === 6
    ?
        [
            matrix[0],
            matrix[1],
            0,
            0,
            matrix[2],
            matrix[3],
            0,
            0,
            0,
            0,
            1,
            0,
            matrix[4],
            matrix[5],
            0,
            1
        ]
    :
        undefined
}

export function matrix16To6(matrix) {
    return Array.isArray(matrix) && matrix.length === 16
    ?
        [
            matrix[0],
            matrix[1],
            matrix[4],
            matrix[5],
            matrix[12],
            matrix[13]
        ]
    :
        undefined
}

export function clipCanvas(canvas, svgClipPath, divisor) {
  divisor = divisor ? divisor : 1
  let ctx = canvas.getContext('2d')
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.globalCompositeOperation='source-over'
  ctx.fillStyle = 'purple'
  const polygons = svgClipPath.split('M').slice(1)
  ctx.beginPath()
  polygons.forEach(poly => {
    const points = poly.split('L')
    for (let i = 0, length = points.length; i < length; i++) {
      if (i === 0) {
        ctx.moveTo(points[i].split(' ')[0] / divisor, points[i].split(' ')[1] / divisor)
      } else {
        ctx.lineTo(points[i].split(' ')[0] / divisor, points[i].split(' ')[1] / divisor)
      }
    }
    ctx.closePath()
  })
  ctx.fill()
}
