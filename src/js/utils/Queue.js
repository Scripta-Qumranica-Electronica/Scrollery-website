/**
 * The Queue is a LiFo where items added are put on at the end
 */
class Queue {

  constructor() {
    this._q = []
  }

  /**
   * Todo consider how a sequence of async actions should be handled
   * 
   * @param {...QueueAction} actions  on or more QueueActions to apply to the queue
   */
  push(...actions) {
    for (let i = 0, n = actions.length; i < n; i++) {
      actions[i].do()
      this._q.push(actions[i])
    }
  }

  /**
   * @returns {mixed} The result of the QueueAction undo, or undefined if the queue is empty
   */
  pop() {
    return this._q.length ? this._q.pop().undo() : undefined
  }

}

export default Queue