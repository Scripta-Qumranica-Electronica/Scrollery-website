import QueueAction from '~/utils/QueueAction.js'

describe('QueueAction', () => {
  describe('constructor', () => {
    it('should throw errors unless given two functions as params', () => {
      expect(() => {
        new QueueAction()
      }).to.throw(TypeError)
      expect(() => {
        new QueueAction(() => {})
      }).to.throw(TypeError)
      expect(() => {
        new QueueAction(() => {}, null)
      }).to.throw(TypeError)
    })

    it('should throw errors if given two of the same params', () => {
      let func = () => {}
      expect(() => {
        new QueueAction(func, func)
      }).to.throw(Error)
    })
  })

  describe('do', () => {
    it('should expose a do method', () => {
      let spy = sinon.spy()
      let action = new QueueAction(spy, () => {})
      action.do()
      expect(spy.called).to.equal(true)
    })

    it('should support async actions via promises', done => {
      let waiting = true
      let action = new QueueAction(
        () => {
          return new Promise(resolve => {
            // create an interval that will break
            // once no more waiting is necessary
            let int = setInterval(() => {
              if (!waiting) {
                clearInterval(int)
                resolve()
              }
            }, 1)
          })
        },
        () => {}
      )

      // after the promise is finished
      action.do().then(() => {
        expect(action.isComplete()).to.equal(true)
        done()
      })

      // make an initial assertion
      expect(action.isComplete()).to.equal(false)

      // allow the interval through
      waiting = false
    })
  })

  describe('undo', () => {
    it('should throw an error if attempting to do before undoing', () => {
      let action = new QueueAction(() => {}, () => {})
      expect(action.undo).to.throw(Error)
    })

    it('should expose an undo method', () => {
      let spy = sinon.spy()
      let action = new QueueAction(() => {}, spy)
      action.do()
      action.undo()
      expect(spy.called).to.equal(true)
    })

    it("should know if it's been completed", () => {
      let action = new QueueAction(() => {}, () => {})
      action.do()
      expect(action.isComplete()).to.equal(true)
    })
  })

  describe('clone', () => {
    it('should create a new QueueAction with the same callbacks', () => {
      let init = sinon.spy()
      let undo = sinon.spy()
      let action = new QueueAction(init, undo)
      action.do()
      action.undo()
      action = action.clone()
      action.do()
      action.undo()
      expect(init.calledTwice).to.equal(true)
      expect(undo.calledTwice).to.equal(true)
    })
  })
})
