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
        const object = {map, cols: []}
        try {
            stream = this._sortSignStream(stream, mainKey, nextKey)
            let columnNode = 0
            let column, line
            let lineNode = 0
            for (let i = 0, n = stream.length; i < n; i++) {
                let entry = stream[i]
                if (entry.col_name != column) {
                    if (object.cols.length > 0) {
                        columnNode++
                    }
                    column = entry.col_name
                    object.cols.push({col: column, lines: []})
                    lineNode = 0
                    line = entry.line_name
                    object.cols[columnNode].lines.push({line: line, lineId: entry.line_id, signs: []})
                } else if (entry.line_name !== line) {
                    if (object.cols.length > 0) {
                        lineNode++
                    }
                    line = entry.line_name
                    object.cols[columnNode].lines.push({line: line, lineId: entry.line_id, signs: []})
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
                }, map)
                map.set(entry[mainKey], sign)
                object.cols[columnNode].lines[lineNode].signs.push(sign)
            }
        } catch (err) {
            throw err;
        }

        return object;
    }

    // Pass in here an array of JS objects, each of which has an id (provide the key of this id in "mainID") and a
    // reference to the id of the object that follows it (the key of which must be provided in "nextID").  The
    // function returns a sorted list following the link order.
    _sortSignStream(stream, mainKey, nextKey) {
        let sortedLinkedList = []
        let listMap = new Map()
        let currentId = null
        let count = stream.length

        for (let i = count - 1; i > -1; i--) {
            if (stream[i][nextKey] === null) {
                currentId = stream[i][mainKey]
                sortedLinkedList.push(stream[i])
            } else {
                listMap.set(stream[i][nextKey], i)
            }
        }

        // for (let i = 1; i < count; i++) {
        //     sortedLinkedList.splice(0,0,stream[listMap.get(currentId)])
        //     currentId = stream[listMap.get(currentId)][mainKey]
        // }

        while (sortedLinkedList.length < stream.length) {
            if (listMap.get(currentId) === undefined) {
                throw new Error('This sign stream is broken')
            }
            sortedLinkedList.splice(0, 0, stream[listMap.get(currentId)])
            currentId = stream[listMap.get(currentId)][mainKey]
        }
        
        return sortedLinkedList
    }
}

export default SignStreamProcessor
