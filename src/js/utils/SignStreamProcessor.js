import Sign from '~/models/Sign.js'

class SignStreamProcessor {

    // This takes in an unsorted sign stream from the database, which must 
    // include the column and line data for each entry, and returns a
    // JSON object with a tree structure in a properly sorted order.
    // "prevKey", "mainKey", and "nextKey" should each be a String with the
    // name of the key for column of each respective ID.
    streamToTree(stream, prevKey, mainKey, nextKey) {
      return new Promise((resolve, reject) => {
          try { 
            const response = this._colToTree(stream, prevKey, mainKey, nextKey)
            resolve(response)
          } catch (err) {
              reject(err);
          }
      })
    }

    _colToTree(stream, prevKey, mainKey, nextKey) {
        const map = new Map()
        const cols = []
        try {
            stream = this._sortSignStream(stream, mainKey, nextKey)
            let columnNode = 0
            let column, line
            let lineNode = 0
            for (let i = 0, n = stream.length; i < n; i++) {
                let entry = stream[i]
                if (entry.col_name != column) {
                    if (cols.length > 0) {
                        columnNode++
                    }
                    column = entry.col_name
                    cols.push({col: column, lines: []})
                    lineNode = 0
                    line = entry.line_name
                    cols[columnNode].lines.push({
                        line: line,
                        lineId: entry.line_id,
                        signs: []
                    })
                } else if (entry.line_name !== line) {
                    if (cols.length > 0) {
                        lineNode++
                    }
                    line = entry.line_name
                    cols[columnNode].lines.push({line: line, lineId: entry.line_id, signs: []})
                }
                // We have to "cast" numeric variables with an unsigned bit shift below
                // since we cannot (yet) guarantee that the Perl cgi script will
                // encode them as strings or as numbers.  
                // TODO: alter the Perl cgi to be more consistent in its typing of these numeric variables?
                let sign = new Sign({
                    id: entry[mainKey],
                    is_variant: entry.is_variant >>> 0,
                    break_type: entry.break_type,
                    sign: entry.sign == '' ? '·' : entry.sign,
                    is_reconstructed: entry.is_reconstructed >>> 0,
                    readability: entry.readability,
                    is_retraced: entry.is_retraced >>> 0,
                    prev_sign: entry[prevKey],
                    next_sign: entry[nextKey],

                    // position in stream info
                    // > col
                    col_name: entry.col_name,
                    col_id: entry.col_id,

                    // > line
                    line_name: entry.line_name,
                    lineId: entry.line_id
                }, map)
                map.set(entry[mainKey], sign)
                cols[columnNode].lines[lineNode].signs.push(sign)
            }
        } catch (err) {
            throw err;
        }

        return {cols, map};
    }

    // Pass in here an array of JS objects, each of which has an id (provide the key of this id in "mainID") and a
    // reference to the id of the object that follows it (the key of which must be provided in "nextID").  The
    // function returns a sorted list following the link order.

    /**
     * 
     * @todo This is O(n*2); consider using a BST or some other algorithm that could be O(n) or O(log(n))
     * 
     * @param {array.<object>} array   The array of bare sign object
     * @param {string} mainKey         The main key (???)
     * @param {string} nextKey         The next key(??)
     * 
     * @returns {array.object}         The array of signs, sort
     */
    _sortSignStream(array, mainKey, nextKey) {
        let sortedLinkedList = []
        let listMap = new Map()
        let currentId = null
        let count = array.length

        for (let i = count - 1; i > -1; i--) {
            if (array[i][nextKey] === null) {
                currentId = array[i][mainKey]
                sortedLinkedList.push(array[i])
            } else {
                listMap.set(array[i][nextKey], i)
            }
        }

        while (sortedLinkedList.length < array.length) {
            if (listMap.has(currentId) === undefined) {
                throw new Error('This sign array is broken')
            }
            let item = listMap.get(currentId)
            sortedLinkedList.splice(0, 0, array[item])
            currentId = array[item][mainKey]
        }
        
        return sortedLinkedList
    }
}

export default SignStreamProcessor
