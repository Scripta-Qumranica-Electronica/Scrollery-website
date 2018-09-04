class QueueAction {
  constructor(action, undo) {
    // assertions
    if (typeof action !== 'function' || typeof undo !== 'function') {
      throw new TypeError(
        'new QueueAction(action = function, undo = function) expects an action and undo function but got',
        arguments
      )
    }

    if (action === undo) {
      throw new Error('Action and undo cannot be the same')
    }

    this._do = action
    this._undo = undo
    this._completed = false
    this._promise = null
  }

  /**
   * Do the action
   *
   * @return {mixed} The response from the callback, if any
   */
  do() {
    const res = this._do()

    if (res instanceof Promise) {
      this._promise = res
      res.then(() => {
        this._completed = true
        return arguments
      })
    } else {
      this._completed = true
    }

    return res
  }

  /**
   * @return {mixed} apply the undo action
   */
  undo() {
    if (!this.isComplete()) {
      throw new Error('Cannot undo an action that is not yet complete')
    }
    return this._undo()
  }

  /**
   * @return {boolean} true if the action has been completed; otherwise false
   */
  isComplete() {
    return this._completed
  }

  /**
   * Re-create this QueueAction
   *
   * @return {QueueAction} A new queue action that can be used to re-do this action
   */
  clone() {
    return new QueueAction(this._do, this._undo)
  }
}

export default QueueAction
