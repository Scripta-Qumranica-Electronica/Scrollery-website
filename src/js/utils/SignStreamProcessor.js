export default class SignStreamProcessor {
    // This takes in an unsorted sign stream from the database, which must 
    // include the column and line data for each entry, and returns a
    // JSON object with a tree structure in a properly sorted order.
    // "prevKey", "mainKey", and "nextKey" should each be a String with the
    // name of the key for column of each respective ID.
    constructor(){
    }

    streamToTree(stream, prevKey, mainKey, nextKey) {
      return new Promise(resolve=> {
        resolve(this._colToTree(stream, prevKey, mainKey, nextKey))
      })
    }

    _colToTree(stream, prevKey, mainKey, nextKey){
        const parsed = this._sortSignStream(stream, mainKey, nextKey)
        if (parsed.error === '') {
            stream = parsed.list
            let object = {cols: []}
            let columnNode = 0
            let column, line
            let lineNode = 0
            for (let i = 0; i < stream.length; i++) {
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
                /*  We have to "cast" numeric variables with an unsigned bit shift below
                    since we cannot (yet) guarantee that the Perl cgi script will
                    encode them as strings or as numbers.  Can we alter the Perl cgi 
                    to be more consistent in its typing of these numeric variables? */
                object.cols[columnNode].lines[lineNode].signs.push({
                    id: entry[mainKey],
                    is_variant: entry.is_variant >>> 0,
                    break_type: entry.break_type,
                    sign: entry.sign == '' ? '·' : entry.sign,
                    is_reconstructed: entry.is_reconstructed >>> 0,
                    readability: entry.readability,
                    is_retraced: entry.is_retraced >>> 0,
                    prev_sign: entry[prevKey],
                    next_sign: entry[nextKey],
                })
            }
            return object
        } else {
            return parsed.error
        }
    }

    // Pass in here an array of JS objects, each of which has an id (provide the key of this id in "mainID") and a
    // reference to the id of the object that follows it (the key of which must be provided in "nextID").  The
    // function returns a sorted list following the link order.
    _sortSignStream(stream, mainKey, nextKey) {
        let sortedLinkedList = []
        let listMap = new Map()
        let currentId = null
        let count = stream.length
        let error = ''

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
                error = 'This sign stream is broken'
                break
            }
            sortedLinkedList.splice(0,0,stream[listMap.get(currentId)])
            currentId = stream[listMap.get(currentId)][mainKey]
        }
        
        return {error: error, list : sortedLinkedList}
    }
}



