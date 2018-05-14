import axios from 'axios'

export default {
  onChange(column, SESSION_ID, scroll_version_id) {
    const { additions, deletions, updates } = column.getChanges()
    const transactions = []

    if (Object.keys(deletions).length) {
      transactions.push({
        transaction: 'removeSigns',
        scroll_version_id,
        sign_id: Object.keys(deletions),
      })
    }

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

    if (transactions.length) {
      axios
        .post('resources/cgi-bin/scrollery-cgi.pl', {
          SESSION_ID,
          requests: transactions.reduce((requests, transaction, i) => {
            requests[`${i + 1}`] = transaction
            return requests
          }, {}),
        })
        .then(res => {
          res
        })
        .catch(res => {
          res
        })
    }

    return
  },
}
