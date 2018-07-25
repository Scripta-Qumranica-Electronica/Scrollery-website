// import Image from '~/models/Image.js'

// describe('Image', () => {

//     let image
//     let url = 'http://'
//     let filename = '12345'
//     let suffix = 'default.jpg'
//     let image_catalog_id = 012342

//     beforeEach(() => {
//         image = new Image({
//             url: url,
//             filename: filename,
//             suffix: suffix,
//         })
//     })

//     describe('instantiating', () => {
//         it('should accept attributes', () => {
//             image = new Image({
//                 url: url,
//                 filename: filename,
//                 suffix: suffix,
//             })
//           expect(image.url).to.equal(url)
//           expect(image.filename).to.equal(filename)
//           expect(image.suffix).to.equal(suffix)
//         })
//     })

//     describe('functions', () => {
//         it('should format a url', () => {
//             image = new Image({
//                 url: url,
//                 filename: filename,
//                 suffix: suffix,
//             })
//           expect(image.getAddress()).to.equal(`${url}${filename}/`)
//         })
//     })
// })
