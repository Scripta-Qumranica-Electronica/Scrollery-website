/**
 *
 * @param {*} path  A vector path of some sort (SVG, WKT, or GeoJSON)
 *
 * This function does not test validity (maybe it should at some point),
 * it simply looks superficially at the variable and decides what type
 * of path has been submitted.
 */
export function pathIdentifier(path) {
  let pathType = undefined
  if (typeof path === 'string') {
    switch (path.substring(0, 1)) {
    case 'M':
      pathType = 'SVG'
      break
    case 'P':
      pathType = 'WKT'
      break
    case '{':
      pathType = testObjectForPath(JSON.parse(path))
        ? 'GeoJSON String'
        : new Error('Improperly formatted Javascript object')
      break
    }
  } else {
    pathType = testObjectForPath(path)
      ? 'GeoJSON'
      : new Error('Improperly formatted Javascript object')
  }

  return pathType
}

function testObjectForPath(object) {
  return object.type && object.type === 'Polygon' ? true : false
}
