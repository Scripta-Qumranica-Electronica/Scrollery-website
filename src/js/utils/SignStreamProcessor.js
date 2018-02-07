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
      });
    }
    _colToTree(stream, prevKey, mainKey, nextKey){
        stream = this._sortSignStream(stream, mainKey, nextKey)
        var object = {cols: []}
        var columnNode = 0
        var column, line
        var lineNode = 0
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
            } else if (entry.line_name != line) {
                if (object.cols.length > 0) {
                    lineNode++
                }
                line = entry.line_name
                object.cols[columnNode].lines.push({line: line, lineId: entry.line_id, signs: []})
            }
            object.cols[columnNode].lines[lineNode].signs.push({
                id: entry[mainKey],
                is_variant: entry.is_variant,
                break_type: entry.break_type,
                sign: entry.sign == '' ? '·' : entry.sign,
                is_reconstructed: entry.is_reconstructed,
                readability: entry.readability,
                is_retraced: entry.is_retraced,
                prev_sign: entry[prevKey],
                next_sign: entry[nextKey],
            })
        }
        return object
    }

    // Pass in here an array of JS objects, each of which has an id (provide the key of this id in "mainID") and a
    // reference to the id of the object that follows it (the key of which must be provided in "nextID").  The
    // function returns a sorted list followin the link order.
    _sortSignStream(stream, mainKey, nextKey) {
        let sortedLinkedList = [stream[0]]
        let count = stream.length - 1
        for (let i = 0; i < count; i++) {
            if (sortedLinkedList[i][nextKey] == stream[i+1][mainKey]){
                sortedLinkedList.push(stream[i+1])
            } else {
                var found =  false
                for (let n = 0, sll = sortedLinkedList.length; n < sll; n++) {
                    if (sortedLinkedList[n][mainKey] == stream[i+1][nextKey]) {
                        sortedLinkedList.splice(n, 0, stream[i+1])
                        found = true
                        break
                    }
                }
                if (!found) {
                    sortedLinkedList.push(stream[i+1])
                }
            }
        }
        return sortedLinkedList
    }
}



