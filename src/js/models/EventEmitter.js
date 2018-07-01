/**
 * The event emitter is a simple class that allows pub/sub
 * on another class
 */
export default class EventEmitter {
  constructor() {
    this.__events = {}
  }

  /**
   * Emit the event to all listeners
   *
   * @param {string}    name   The name
   * @param {object={}} [args] Arguments to pass to
   */
  emit(name, args = {}) {
    // safeguard
    if (!name) {
      return
    }

    // run through the event handlers and call
    // it for each one
    const handlers = this.__events[name]
    if (handlers && handlers.length) {
      for (let i = 0, handler; (handler = handlers[i]); i++) {
        // kick each handler onto the event loop so that no one blocks the emission
        // of the all of the events
        // consider: deep clone args so that one handler cannot modify.
        // This should be fine if args are simple properties
        ;(function(h) {
          setTimeout(() => h({ ...args }))
        })(handler)
      }
    }
  }

  /**
   * Subscribe to an event
   *
   * @param {string[]|string}   names    Name of the event to listen to
   * @param {function} handler The handler function
   */
  on(names, handler) {
    if (!names || typeof handler !== 'function') {
      throw new TypeError(
        'EventEmitter.prototype.on requires a name (String[]) and handler (Function)'
      )
    }

    if (!Array.isArray(names)) {
      names = [names]
    }

    for (let i = 0, name; (name = names[i]); i++) {
      if (!this.__events[name]) {
        this.__events[name] = []
      }

      this.__events[name].push(handler)
    }
  }

  /**
   * Un-subscribe from an event
   *
   * @param {string[]|string}   names       The event to listen to
   * @param {function} handler    The event handler to remove
   */
  off(names, handler) {
    if (!names || typeof handler !== 'function') {
      throw new TypeError(
        'EventEmitter.prototype.off requires a name (String) and handler (Function)'
      )
    }

    if (!Array.isArray(names)) {
      names = [names]
    }

    for (let i = 0, name; (name = names[i]); i++) {
      let handlers = this.__events[name]

      if (handlers && handlers.length) {
        // filter out the function that was subscribed
        handlers = this.__events[name] = handlers.filter(func => func !== handler)

        // if there are no longer handlers, remove the memory alotment
        if (!handlers.length) {
          delete this.__events[name]
        }
      }
    }
  }
}
