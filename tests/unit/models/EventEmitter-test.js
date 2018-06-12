import EventEmitter from '~/models/EventEmitter.js'

describe('EventEmitter', () => {

  let event
  beforeEach(() => {
    event = new EventEmitter()
  })

  describe('.prototype.emit', () => {

    it('should emit events using setTimeout to unblock event loop so all listeners are notified roughly at the same time', done => {
      
      let async = false

      // wire subscriber
      event.on('event', () => {

        // if a setTimeout is used, then the boolean async flag should
        // get switched before this callback is fired
        done(async ? null : new Error('This should not be called before the test is finished'))
      })
      event.emit('event')

      async = true
    })

    it('should emit the event with arguments (but new object)', done => {
      const args = {
        value: true
      }

      // wire subscriber
      event.on('event', eventArgs => {

        // it will be a new object
        expect(eventArgs === args).to.equal(false)

        // ... but it will match in values
        expect(eventArgs.value).to.equal(args.value)

        // end
        done()
      })
      event.emit('event', args)
    })

    it('should emit events to every listener', done => {
      let count = 0

      const handler = () => {
        count++
        if (count === 2) {
          done()
        }
      }

      // wire subscribers
      event.on('event', handler)
      event.on('event', handler)

      event.emit('event')
    })
  })

  describe('prototype.on', () => {

    it('should accept an array of event names with a single handler', done => {
      let count = 0

      const handler = () => {
        count++
        if (count === 2) {
          done()
        }
      }

      // wire subscribers
      event.on(['event1', 'event2'], handler)

      // emit both events
      event.emit('event1')
      event.emit('event2')
    })

  })

  describe('prototype.off', () => {

    it('should remove event listeners', done => {
      let count = 0

      const handler1 = () => {
        count++
        if (count === 3) {
          done(new Error('this event handler should be removed before'))
        } else {

          // after the first run, remove the event listener
          // and re-trigger ... which should finish in handler2
          event.off('event', handler1)
          event.emit('event')
        }
      }
      const handler2 = () => {
        count++
        if (count === 3) {
          done()
        }
      }
      
      // wire up event handlers
      event.on('event', handler1)
      event.on('event', handler2)

      // trigger the event to run once on each handler
      event.emit('event')
    })

  })


})