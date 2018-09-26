/**
 * Since requests made over socket.io are not tightly bound to
 * the response, we use a transactions object to keep track
 * of which requests were made and whether or not they have received
 * a response yet.  A simple incrementer is used to track whether there
 * are any requests that have not yet received a response.
 *
 * In the future, it will probably be useful for the server to send the
 * undo table information in the response to edits, so that we can use the
 * information in this object to trigger an undo/redo.  Incidentally,
 * the list here should be used to furnish all necessary data for our
 * undo system.
 */
export default class Transactions {
  constructor(corpus) {
    // this.socket = this.corpus.socket  // We can use this to make undo requests
    this.requests = {}
    this.requestList = []
    this.unfinished = 0
  }

  /**
   * @params  dependentTransaction  Object  The object should contain a function and vars.
   */
  startRequests(id, transaction, request = undefined) {
    Object.assign(this.requests, {
      [id]: {
        transaction: transaction,
        request: request,
        finished: false,
      },
    })
    this.requestList.unshift(id)
    this.unfinished += 1
  }

  finishRequest(id, undo = undefined, response = undefined) {
    const request = this.requests[id]
    if (request) {
      request.finished = true
      request.undo = undo
      request.response = response
      Object.assign(this.requests, { [id]: request })
      this.unfinished -= 1
    } else {
      console.log(`Got message for id ${id}, but there is nothing to do.`)
    }
  }
}
