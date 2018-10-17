/**
 *
 * This function receives a col_id, grabs the first sign
 * and then follows the sign stream to the end of the column.
 * It builds an Epidoc compatible string from the sign stream,
 * and returns that as a promise.
 */
export function parseColumnToEpiDoc(corpus, scroll_version_id, col_id) {
  return new Promise((resolve, reject) => {
    let epidocString = ''
    let currentSign_id = corpus.cols.get(col_id, scroll_version_id).col_sign_id
    let done = false
    do {
      epidocString += corpus.signChars.get(
        corpus.signs.getSignChar(currentSign_id, scroll_version_id),
        scroll_version_id
      ).char
      if (corpus.signs.getSign(currentSign_id).isType('COLUMN_END')) done = true
    } while ((currentSign_id = corpus.signs.getNextSign(currentSign_id)) && !done)
    if (epidocString) resolve(epidocString)
    else reject('No stream found')
  })
}
