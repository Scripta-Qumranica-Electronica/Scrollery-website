import Queue from '~/utils/Queue.js'
import QueueAction from '~/utils/QueueAction.js'

describe('Queue', () => {

  let q, action, init, undo
  beforeEach(() => {
    q = new Queue()

    init = sinon.stub()
    undo = sinon.stub()
    action = new QueueAction(init, undo)
  })

  describe('push', () => {
    it('should allow pushing items onto the queue and immediately invoke the do', () => {
      q.push(action)
      expect(init.called).to.equal(true)
    })

    it('should support pushing multiple items simultaneously', () => {
      let action2 = new QueueAction(init, undo)
      q.push(action, action2)
      expect(init.calledTwice).to.equal(true)
    });
  })

  describe('pop', () => {

    it('should allow poping items off the queue and immediately invoke the undo', () => {
      q.push(action)
      q.pop()
      expect(undo.called).to.equal(true)
    })

    it('should pop items off in the reverse order they were pushed on', () => {
      q.push(
        new QueueAction(init, () => 1), 
        new QueueAction(init, () => 2),
        new QueueAction(init, () => 3)
      )

      // expect undo call orders
      expect(q.pop()).to.equal(3)
      expect(q.pop()).to.equal(2)
      expect(q.pop()).to.equal(1)
    });
  })

})