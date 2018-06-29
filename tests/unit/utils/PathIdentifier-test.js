import { pathIdentifier } from '~/utils/PathIdentifier.js'

describe('PathIdentifier.pathIdentifier', () => {
  const svg = 'M0 0 0 1 1 1 1 0 0 0'
  const wkt = 'POLYGON((0 0,0 1,1 1,1 0,0 0))'
  const geoJSON = '{"type":"Polygon","coordinates":[[[0,0],[0,1],[1,1],[1,0],[0,0]]]}'

  it('should identify an SVG path', () => {
    expect(pathIdentifier(svg)).to.equal('SVG')
  })

  it('should identify a WKT path', () => {
    expect(pathIdentifier(wkt)).to.equal('WKT')
  })

  it('should identify a GeoJSON string path', () => {
    expect(pathIdentifier(geoJSON)).to.equal('GeoJSON String')
  })

  it('should identify a GeoJSON path', () => {
    expect(pathIdentifier(JSON.parse(geoJSON))).to.equal('GeoJSON')
  })

  it('should reject an invalid GeoJSON path', () => {
    expect(pathIdentifier({"tpye": "Junk"}) instanceof Error).to.equal(true)
    expect(pathIdentifier({"type": "Junk"}) instanceof Error).to.equal(true)
  })

  it('should reject an invalid GeoJSON path string', () => {
    expect(pathIdentifier(JSON.stringify({"tpye": "Junk"})) instanceof Error).to.equal(true)
    expect(pathIdentifier(JSON.stringify({"type": "Junk"})) instanceof Error).to.equal(true)
  })
})