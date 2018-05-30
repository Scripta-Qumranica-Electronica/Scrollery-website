import axios from 'axios'

/* istanbul ignore next */

/**
 *
 * @param {Column} column
 * @param {array} transactions
 * @param {object} replies
 */
const onSuccess = (column, transactions, replies) => {
  const persistedMap = {
    additions: {},
    deletions: {},
    updates: {},
  }
  for (let id in replies) {
    const transaction = transactions[id]
    replies[id].forEach((singleAction, i) => {
      for (let signUuid in singleAction) {
        // the value is the keyword 'deleted', then the corresponding
        // sign has been removed.
        if (singleAction[signUuid] === 'deleted') {
          persistedMap.deletions[signUuid] = true

          // if the value is a number, it's the sign's id after being persisted.
        } else if (typeof singleAction[signUuid] === 'number') {
          let signRequested = transaction.signs[i]
          persistedMap.additions[signUuid] = {
            next_sign_id: signRequested.next_sign_id || -1,
            id: singleAction[signUuid],
          }
        }
        // need case for updates...
      }
    })
  }

  column.persisted(persistedMap)
}

/* istanbul ignore next */
export default {
  /**
   * Persist any changes to the column model
   *
   * @todo Debounce requests to every 500ms or so, and not concurrent.
   *
   * @param {Column} column               The column model to persist
   * @param {string} SESSION_ID           The user's current session ID
   * @param {number} scroll_version_id    The current scroll_version_id
   */
  onChange(column, SESSION_ID, scroll_version_id) {
    const { additions, deletions, updates } = column.getChanges()
    const transactions = []

    // Gather all deletions into a single transaction
    const deletedKeys = Object.keys(deletions)
    if (deletedKeys.length) {
      transactions.push({
        transaction: 'removeSigns',
        scroll_version_id,
        sign_id: deletedKeys,
      })
    }

    // Gather all additions into requests
    if (Object.keys(additions).length) {
      const signStream = column.flattenToSignStream()

      let signs = []
      for (let key in additions) {
        let sign = additions[key]

        // we need to grab the next and subsequent sign, if any.
        let prev = signStream[signStream.map[sign.getUUID()] - 1]
        let next = signStream[signStream.map[sign.getUUID()] + 1]

        signs.push({
          sign: sign.sign,
          uuid: sign.getUUID(),
          previous_sign_id: prev ? prev.getID() || prev.getUUID() : '',
          next_sign_id: next ? next.getID() || next.getUUID() : '',
        })
      }

      transactions.push({
        transaction: 'addSigns',
        scroll_version_id,
        signs,
      })
    }

    // Make the request if there are transactions to send.
    if (transactions.length) {
      const requests = transactions.reduce((requests, transaction, i) => {
        requests[`${i + 1}`] = transaction
        return requests
      }, {})
      axios
        .post('resources/cgi-bin/scrollery-cgi.pl', {
          SESSION_ID,
          requests,
        })
        .then(res => {
          if (res.status === 200 && res.data) {
            onSuccess(column, requests, res.data.replies)
          }
        })
        .catch(res => {
          res
        })
    }

    return
  },
}
