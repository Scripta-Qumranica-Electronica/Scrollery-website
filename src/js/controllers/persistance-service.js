import EventEmitter from '~/models/EventEmitter.js'
import debounce from 'lodash/debounce'

const base = {
  additions: {},
  deletions: {},
  updates: {},
}

/**
 * The persistance service can be extended to enable persistance
 * of various model lists
 */
export default class PersistanceService extends EventEmitter {
  constructor() {
    super()

    // the queued up changes object
    this.queued = base

    // whether or not the service has a currently pending request
    this.isPersisting = false

    // a function that will debounce persistance requests
    this.debouncedPersist = debounce(this._persist.bind(this), 400, {
      trailing: true,
    })
  }

  /**
   * @public
   * @instance
   *
   * @param {object} changes a changes object
   */
  queuePersist(changes = base) {
    this._mergeChanges(changes)
    this._queue()
  }

  /**
   * Actually make the request to persist any tracked changes
   *
   * @protected
   * @abstract
   * @instance
   */
  _makeRequest() {
    return new Promise(r => r())
  }

  /**
   * Queue up a persistance request
   *
   * @protected
   * @instance
   */
  _queue() {
    this.debouncedPersist()
  }

  /**
   * Expects to be debounced
   *
   * @protected
   * @instance
   *
   * @emits 'persisted'
   */
  _persist() {
    // safeguard to simply re-queue any attempts
    // to call this function while a persistance
    // requests is still over the network
    if (this.isPersisting) {
      return this._queue()
    }

    const q = this.queued
    if (
      q &&
      (Object.keys(q.additions).length ||
        Object.keys(q.deletions).length ||
        Object.keys(q.updates).length)
    ) {
      // copy the queued persist into the on-deck version
      // TODO: validate change object
      const onDeck = { ...q }

      // reset the queued for the next round
      this.queued = base

      // do the persist ...
      this.isPersisting = true
      this._makeRequest(onDeck)
        .then(res => {
          this.isPersisting = false

          this.emit('persisted', {
            changes: onDeck,
            res: res,
          })
        })
        .catch(res => {
          this.isPersisting = false

          this.emit('error', res)
        })
    }
  }

  /**
   * @protected
   * @instance
   *
   * @param {object} changes A changes object to merge into the queued up change
   */
  _mergeChanges(changes) {
    this.queued = {
      additions: {
        ...this.queued.additions,
        ...changes.additions,
      },
      deletions: {
        ...this.queued.deletions,
        ...changes.deletions,
      },
      updates: {
        ...this.queued.updates,
        ...changes.updates,
      },
    }
  }
}
