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
      // Check for column start
      if (corpus.signs.signIs('COLUMN_START', currentSign_id, scroll_version_id))
        epidocString += '<column>'

      // Check for line start
      if (corpus.signs.signIs('LINE_START', currentSign_id, scroll_version_id))
        epidocString += '<line>'

      // Add Character
      epidocString += corpus.signChars.get(
        corpus.signs.getSignChar(currentSign_id, scroll_version_id),
        scroll_version_id
      ).char

      // Check for line end
      if (corpus.signs.signIs('LINE_END', currentSign_id, scroll_version_id)) {
        epidocString += '</line>'
      }

      // Check for column end, and finish
      if (corpus.signs.signIs('COLUMN_END', currentSign_id, scroll_version_id)) {
        epidocString += '</column>'
        done = true
      }
    } while ((currentSign_id = corpus.signs.getNextSign(currentSign_id)) && !done)

    // Add better check that we have <column></column>,
    // and if not add </column>, or return error for broken string.
    if (epidocString) resolve(epidocString)
    else reject('No stream found')
  })
}
