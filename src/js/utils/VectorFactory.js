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
            points.forEach(point => {
                if (svg.slice(-1) !== 'M'){
                    svg += 'L'
                }
                svg += `${point.split(' ')[0] - boundingRect.x} ${point.split(' ')[1] - boundingRect.y}`
            })
        })
    }
    return svg
}

export function geoJsonPointToSvg(geoJSON) {
    return geoJSON.substring(0, 6) === 'POINT(' 
        ? {
            x: parseFloat(geoJSON.split(' ')[0].replace('POINT(', '')),
            y: parseFloat(geoJSON.split(' ')[1])
        }
        : undefined
}

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

// This function expects the transform matrix to be in a 2D array:
// [[a,c,tx],[b,d,ty]]
export function dbMatrixToSVG(matrix) {
    return [
        matrix[0][0],
        matrix[1][0],
        matrix[0][1],
        matrix[1][1],
        matrix[0][2],
        matrix[1][2]
    ]
}

// This function converts the 16 element SVG transform matrix 
// to a JSON string for the 2D as stored in the database
export function svgMatrixToDB(matrix) {
    return `{\\"matrix\\": [[${matrix[0]},${matrix[2]},${matrix[4]}],[${matrix[1]},${matrix[3]},${matrix[5]}]]}`
}

export function matrix6To16(matrix) {
    return [
        matrix[0],
        matrix[1],
        0,
        0,
        matrix[2],
        matrix[3],
        0,
        0,
        matrix[4],
        matrix[5],
        1,
        0,
        0,
        0,
        0,
        1
    ]
}

export function matrix16To6(matrix) {
    return [
        matrix[0],
        matrix[1],
        matrix[4],
        matrix[5],
        matrix[8],
        matrix[9]
    ]
}

// The following functions might be written later.
// export function svgPolygonToGeoJson(svg) {
//     let geoJson
//     return geoJson
// }

// export function clipCanvas(canvas) {
//     return canvas
// }