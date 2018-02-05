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
        const x = coords[0].split(' ')[0]
        const y = coords[0].split(' ')[1]
        const width = coords[2].split(' ')[0] - x
        const height = coords[2].split(' ')[1] - y
        svg = {
            x: x,
            y: y,
            width: width,
            height: height,
        }
    }
    return svg
}

export function svgPolygonToGeoJson(svg) {
    let geoJson
    return geoJson
}

export function clipCanvas(canvas) {
    return canvas
}