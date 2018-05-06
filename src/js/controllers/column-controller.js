import axios from 'axios'

export default {
  onChange(column, SESSION_ID, scroll_version_id) {
    const { additions, deletions, updates } = column.getChanges()
    const transactions = []

    if (deletions.length) {
      transactions.push({
        transaction: 'removeSigns',
        scroll_version_id,
        sign_id: deletions.reduce((acc, sign) => {
          acc.push(sign.getID())
          return acc
        }, []),
      })
    }

    axios
      .post('resources/cgi-bin/scrollery-cgi.pl', {
        SESSION_ID,
        scroll_version_id,
        requests: {
          0: transactions[0],
        },
      })
      .then(res => {
        res
      })
      .catch(res => {
        res
      })

    return
  },
}
