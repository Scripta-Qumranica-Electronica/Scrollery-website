import axios from 'axios'
import debounce from 'lodash/debounce'
import PersistanceService from './persistance-service.js'

/* istanbul ignore next */
export default class ColumnPersistanceService extends PersistanceService {
  constructor(column, scroll_version_id, session_id) {
    super()

    this.scroll_version_id = scroll_version_id
    this.session_id = session_id

    this.column = column

    this.column.on(['change', 'addition', 'delete'], this.onChange.bind(this))
  }

  /**
   * Actually make the request to persist any tracked changes
   *
   * @protected
   * @instance
   *
   * @param {object} onDeckChanges The changes to persist
   */
  _makeRequest(onDeckChanges) {
    const transactions = this._gatherTransactions(onDeckChanges)

    // Make the request if there are transactions to send.
    if (transactions.length) {
      const requests = transactions.reduce((requests, transaction, i) => {
        requests[`${i + 1}`] = transaction
        return requests
      }, {})
      return axios
        .post('resources/cgi-bin/scrollery-cgi.pl', {
          SESSION_ID: this.session_id,
          requests,
        })
        .then(res => {
          if (res.status === 200 && res.data) {
            this.onSuccess(requests, res.data.replies)
          }
        })
        .catch(res => {
          res
        })
    } else {
      // there are no things to save ... return a promise that
      // resolves immediately to adhere to the interface
      return new Promise(r => r())
    }
  }

  /**
   * @private
   * @instance
   */
  _onSuccess(transactions, replies) {
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

    this.column.persisted(persistedMap)
  }

  /**
   * @private
   * @instance
   */
  _gatherTransactions({ additions, deletions, updates }) {
    const transactions = []

    // Gather all deletions into a single transaction
    const deletedKeys = Object.keys(deletions)
    if (deletedKeys.length) {
      transactions.push({
        transaction: 'removeSigns',
        scroll_version_id: this.scroll_version_id,

        // turn `scroll_id` into an array of ids
        sign_id: deletedKeys.map(key => deletions[key].getID()),
      })
    }

    // Gather all additions into requests
    if (Object.keys(additions).length) {
      const signStream = this.column.flattenToSignStream()

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
        scroll_version_id: this.scroll_version_id,
        signs,
      })
    }

    // TODO: updates

    // finish
    return transactions
  }

  /**
   * Persist any changes to the column model
   *
   * @todo Debounce requests to every 500ms or so, and not concurrent.
   *
   * @param {Column} column               The column model to persist
   */
  onChange() {
    this.queuePersist(this.column.getChanges())
  }
}
