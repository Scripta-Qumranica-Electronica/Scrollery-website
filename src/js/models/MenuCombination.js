import MenuObject from './MenuObject.js'

/**
 * A combination is complete material object.
 * 
 * A combination is comprised of a number of images and columns.
 * 
 * @class
 */
class MenuCombination extends List {

  /**
   * @param {object}          attributes the image attributes
   * @param {array.<MenuImage>=[]} [images]    an array of images
   */
  constructor(attributes, images = []) {
    super(attributes, images)
  }

  static getModel() {
    return MenuImage
  }

  populate() {
    this.$post('resources/cgi-bin/scrollery-cgi.pl', {
        transaction: 'getImgOfComb',
        combID: this.scroll_id,
        user: this.user_id,
        version_id: this.version_id,
        })
        .then(res => {
          if (res.status === 200 && res.data) {
            res.data.results.forEach(image => {
                image.$post = this.$post
                images.push(new MenuImage(image))
            });
          }
        })
        .catch(console.error)
  }
}

export default MenuCombination