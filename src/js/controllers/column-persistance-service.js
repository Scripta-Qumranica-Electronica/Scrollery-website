import axios from 'axios'
import PersistanceService from './persistance-service.js'

/* istanbul ignore next */
export default class ColumnPersistanceService extends PersistanceService {
  constructor(column, scroll_version_id, session_id) {
    super()

    this.scroll_version_id = scroll_version_id
    this.session_id = session_id

    this.column = column
  }

  engage() {
    this.__handler = this.onChange.bind(this)
    this.column.on(['change', 'addition', 'delete',], this.__handler)
  }

  disengage() {
    if (this.__handler) {
      this.column.off(['change', 'addition', 'delete',], this.__handler)
      delete this.__handler
    }
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
            this._onSuccess(requests, res.data.replies, onDeckChanges)
          }
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
  _onSuccess(transactions, replies, persistedChangeSet) {
    // Deletions come back keyed to their ID rather than their UUID on the client side.
    // Create a map that enables looking up of ID > UUID.
    const deletedIdToUuidMap = Object.keys(persistedChangeSet.deletions).reduce((map, uuid) => {
      map[persistedChangeSet.deletions[uuid].getID()] = uuid
      return map
    }, {})

    const persistedMap = {
      additions: {},
      deletions: {},
      updates: {},
    }
    for (const id in replies) {
      const transaction = transactions[id]
      replies[id].forEach((singleAction, i) => {
        for (const signIdenfifier in singleAction) {
          // the value is the keyword 'deleted', then the corresponding
          // sign has been removed.
          // In the case of deletions, the signIdentifier is it's ID.
          // Convert from the ID to the UUID in the persisted map to inform
          // the model of which models have been deleted.
          if (singleAction[signIdenfifier] === 'deleted') {
            persistedMap.deletions[deletedIdToUuidMap[signIdenfifier]] = true

            // if the value is a number, it's the sign's id after being persisted.
          } else if (typeof singleAction[signIdenfifier] === 'number') {
            const signRequested = transaction.signs[i]
            persistedMap.additions[signIdenfifier] = {
              next_sign_id: ~~signRequested.next_sign_id || -1,
              sign_id: ~~singleAction[signIdenfifier],
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
  _gatherTransactions({ additions, deletions, }) {
    const transactions = []

    // create a new object so that the additions
    // aren't modified by reference
    additions = { ...additions, }

    // Gather all deletions into a single transaction
    const deletedKeys = Object.keys(deletions)
    if (deletedKeys.length) {
      transactions.push({
        transaction: 'removeSigns',
        scroll_version_id: this.scroll_version_id,

        // turn `sign_id` into an array of ids for deletion
        sign_id: deletedKeys.map(key => deletions[key].getID()),
      })
    }

    // Gather all additions into a single transaction
    if (Object.keys(additions).length) {
      const signStream = this.column.flattenToSignStream()

      // the additions are an object keys by UUID, which provide no
      // guarantee of set order ... additionally, there are potentially
      // multiple runs of sequential signs to gath. Essentially, we have
      // to contend with multiple linked lists that are not ordered in any way
      const signRuns = []

      // a recursive function to create a run
      const getPreviousFromAdditions = (uuid, run) => {
        const prev = signStream[signStream.map[uuid] - 1]

        // there's a previous sign
        if (prev) {
          // check to see if it's also an addition
          const prevUuid = prev.getUUID()
          if (additions[prevUuid]) {
            // remove it from the additions once handled
            delete additions[prevUuid]

            // if so, we add it in to the run and ...
            run.unshift({
              sign: prev.toString(),
              uuid: prevUuid,
            })
            // .. recurse backwards
            return getPreviousFromAdditions(prevUuid, run)

            // otherwise, if the run has items in it, we can
            // se the prev_sign_id to the item.
          } else if (run.length) {
            run[0].previous_sign_id = prev.getID()
          }
        }

        // break out of recursion
        return run
      }

      const getNextFromAdditions = (uuid, run) => {
        const next = signStream[signStream.map[uuid] + 1]

        // there's a next sign
        if (next) {
          // check to see if it's also an addition
          const nextUuid = next.getUUID()
          if (additions[nextUuid]) {
            // remove it from the additions once handled
            delete additions[nextUuid]

            // if so, we push it onto to the run and ...
            run.push({
              sign: next.toString(),
              uuid: nextUuid,
            })
            // .. recurse forwards
            return getNextFromAdditions(nextUuid, run)

            // otherwise, if the run has items in it, we can
            // set the next_sign_id to the next item.
          } else if (run.length) {
            run[run.length - 1].next_sign_id = next.getID()
          }
        }

        // break out of recursion
        return run
      }

      // for loop calculates the keys in the additions object on every
      // pass through the loop. The
      for (
        let uuids = Object.keys(additions), uuid;
        uuids.length > 0;
        uuids = Object.keys(additions)
      ) {
        const sign = additions[(uuid = uuids.pop())]

        // delete the addition from the additions
        // since it's now been handles
        delete additions[uuid]

        // add in the sign from the current iteration to the end
        // of the run
        let run = [
          {
            sign: sign.toString(),
            uuid: sign.getUUID(),
          },
        ]

        // create the run going backwards
        run = getPreviousFromAdditions(uuid, run)

        // add any signs that follow
        run = getNextFromAdditions(uuid, run)

        signRuns.push(run)
      }

      // each sign run becomes it's own transaction
      // which should start/end with the appropriate
      // prev/next sign id
      signRuns.forEach(run => {
        transactions.push({
          transaction: 'addSigns',
          scroll_version_id: this.scroll_version_id,
          signs: run,
        })
      })
    }

    // TODO: updates

    // finish
    return transactions
  }

  /**
   * Persist any changes to the column model
   *
   * @param {Column} column               The column model to persist
   */
  onChange() {
    this.queuePersist(this.column.getChanges())
  }
}
