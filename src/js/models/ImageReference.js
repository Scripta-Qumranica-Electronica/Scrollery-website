import Image from './Image.js'
import axios from 'axios'

/**
 * 
 * An image reference is comprised of a group of images.
 * 
 * @class
 */ 
class ImageReference {

    constructor(set, sessionID, institution, lvl1, lvl2, side) {
        this.sessionID = sessionID
        this.set = set
        this.institution = institution 
        this.lvl1 = lvl1 
        this.lvl2 = lvl2
        this.side = side
        this._items = {}
        this._itemList = []
        this.itemIDKey = 'sqe_image_id'
        this.artefacts = []
    }

    getItemAtIndex(idx) {
        return this._items[this._itemList[idx]]
    }

    getItemWithID(id) {
        return this._items[id]
    }

    getItems() {
        return this._items
    }

    /**
     * @public
     * @instance
     * 
     * @param   {Object}    item    An object with the necessary data to make
     *                              an Image object.  I assume the keys will
     *                              have names corresponding to the database fields.
     * 
     * @param   {Number}    id      The sqe_image_id of the image
     * 
     */
    addItem(item, id) {
        const entry = new Image(
            item.url, 
            item.filename, 
            item.width, 
            item.height, 
            item.dpi, 
            item.type, 
            item.start, 
            item.end, 
            item.is_master,
            item.suffix,
            item.edition_side
        )
        this.set(this._items, id, entry)
        this._itemList.push(id)
    }

    removeItem(id) {
        delete this._items[id]
        const index = this._itemList.indexOf(id)
        if (index > -1) {
            array.splice(index, 1);
        }
    }

    populateItems(imageCatalogID) {
        let payload = {
            transaction: 'imagesOfInstFragments',
            id: imageCatalogID,
            SESSION_ID: this.sessionID,
        }
    
        return new Promise((resolve, reject) => {
            try {
                axios.post('resources/cgi-bin/scrollery-cgi.pl', payload)
                .then(res => {
                    if (res.status === 200 && res.data.results) {
        
                        // We can store hashes for the returned data
                        // in the future, so we can avoid unnecessary
                        // data transmission.
                        this._hash = res.data.hash
            
                        res.data.results.forEach(item => {
                            if (!this._items[item[this.itemIDKey]] || this._items[item[this.itemIDKey]] !== item) {
                                this.addItem(item, item[this.itemIDKey])
                            }
                        })
                        resolve(res.data.results)
                    }
                })
            } catch (err) {
                reject(err);
            }
        })
    }
}

export default ImageReference