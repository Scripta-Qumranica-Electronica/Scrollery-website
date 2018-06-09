'use strict'

import { mount } from '@test'
import Login from '~/components/Login.vue'

describe('Login', function() {
  let wrapper, vm
  beforeEach(() => {
    wrapper = mount(Login)
    vm = wrapper.vm
  })

  it('has a button', () => {
    expect(wrapper.contains('el-button')).to.equal(true)
  })

  it('has a select dropdown', () => {
    expect(wrapper.contains('el-select')).to.equal(true)
  })

  it('has the initial language set to English', () => {
    expect(vm.language).to.equal('en')
  })

  it('sets initial visibility to false until session is validated', () => {
    expect(Login.data().visible).to.equal(false)

    // since, on create, it will check the session and immediately become
    // visible, this is true for the actual Vue component instance
    expect(vm.visible).to.equal(true)
  })

  it('should post a transaction to validate the session ID', done => {
    const sessionID = '1234567890'
    vm.$post = function(url, payload) {
      expect(payload.SESSION_ID).to.equal(sessionID)
      expect(payload.transaction).to.equal('validateSession')

      done()

      // adhere to interface
      return new Promise()
    }.bind(vm)
    vm.setSessionID(sessionID)
    vm.validateSession()
  })

  it('should clear localStorage on failure', done => {
    const sessionID = '1234567890'
    vm.$post = function(url, payload) {
      return new Promise((resolve, reject) => reject({ response: {} }))
    }.bind(vm)
    vm.setSessionID(sessionID)
    vm.validateSession({
      removeItem: key => {
        expect(key).to.equal('sqe')
        expect(vm.errMsg).to.equal('')
        done()
      },
    })
  })

  it('should clear localStorage on error message received', done => {
    const sessionID = '1234567890'
    const data = {
      error: 'Some error message',
    }
    vm.$post = function() {
      return new Promise((resolve, reject) => resolve({ data }))
    }.bind(vm)
    vm.setSessionID(sessionID)
    vm.validateSession({
      removeItem: key => {
        expect(key).to.equal('sqe')
        expect(vm.errMsg).to.equal('')
        done()
      },
    })
  })

  it('should login after successful sessionID check', done => {
    const sessionID = '1234567890'
    const data = {
      success: true,
    }
    vm.$post = function() {
      return new Promise((resolve, reject) => resolve({ data }))
    }.bind(vm)
    vm.validateLogin = function(res) {
      expect(res.data.success).to.equal(true)
      done()
    }.bind(vm)
    vm.setSessionID(sessionID)
    vm.validateSession()
  })

  describe('validations: ', () => {
    it('reject login attempts with no username', () => {
      const user = ''
      wrapper.setData({ user })

      const spy = sinon.spy(vm, 'validateUsername')

      // trigger form submission
      wrapper.vm.onSubmit()

      // assertions
      expect(spy.called).to.equal(true)
      expect(vm.errMsg.length).to.be.greaterThan(1)
      expect(vm.usernameErr.length).to.be.greaterThan(1)
    })

    it('reject login attempts with whitespace usernames', () => {
      const user = '  '
      wrapper.setData({ user })

      const spy = sinon.spy(vm, 'validateUsername')

      // trigger form submission
      wrapper.vm.onSubmit()

      // assertions
      expect(spy.called).to.equal(true)
      expect(vm.errMsg.length).to.be.greaterThan(1)
      expect(vm.usernameErr.length).to.be.greaterThan(1)
    })

    it('reject login attempts with no password', () => {
      const password = ''
      wrapper.setData({ password })

      const spy = sinon.spy(vm, 'validatePassword')

      // trigger form submission
      wrapper.vm.onSubmit()

      // assertions
      expect(spy.called).to.equal(true)
      expect(vm.errMsg.length).to.be.greaterThan(1)
      expect(vm.passwordErr.length).to.be.greaterThan(1)
    })

    it('reject login attempts with whitespace passwords', () => {
      const user = '  '
      wrapper.setData({ user })

      const spy = sinon.spy(vm, 'validatePassword')

      // trigger form submission
      wrapper.vm.onSubmit()

      // assertions
      expect(spy.called).to.equal(true)
      expect(vm.errMsg.length).to.be.greaterThan(1)
      expect(vm.passwordErr.length).to.be.greaterThan(1)
    })

    it('require a non-empty, non-whitespace password and username to pass', () => {
      const user = 'name'
      const passwd = 'password'
      wrapper.setData({ user, passwd })

      const spy = sinon.spy()
      vm.attemptLogin = spy

      // trigger form submission
      wrapper.vm.onSubmit()

      // assertions
      expect(spy.called).to.equal(true)
      expect(vm.errMsg.length).to.equal(0)
    })
  })

  it('should show an error message on failure', done => {
    const user = 'name'
    const passwd = 'password'
    wrapper.setData({ user, passwd })

    vm.$18n = {
      str: key => key
    }
    vm.$post = () => (new Promise((resolve, reject) => {
      reject({})

      // since the `catch` block is handled asychronously,
      // use setTimeout to wait until Vue has updates the
      // VM.
      // TODO: figure out better way to not use setTimeout
      setTimeout(() => {
        expect(vm.errMsg.length > 0).to.equal(true)
        done()
      }, 5)
    }))

    // trigger form submission
    wrapper.vm.onSubmit()
  })

  it('should attempt login on form submit', done => {
    const user = 'name'
    const passwd = 'password'
    wrapper.setData({ user, passwd })

    // patch in method for assertions
    vm.$post = function(url, data) {
      expect(data.USER_NAME).to.equal(user)
      expect(data.PASSWORD).to.equal(passwd)
      expect(data.transaction).to.equal('validateSession')
      done()

      // adhere to interface
      return new Promise(() => {})
    }.bind(vm)

    // trigger form submission
    wrapper.vm.onSubmit()
  })

  describe('validate login', () => {
    it('should fail if an empty response from server', done => {
      vm
        .validateLogin()
        .then(() => {
          done(new Error('test case expected failed promise, but succeeded'))
        })
        .catch(err => {
          expect(err instanceof Error).to.equal(true)
          done()
        })
    })

    it('should reject the promise if the response contains an error message', done => {
      vm
        .validateLogin({ data: { error: true } })
        .then(() => {
          done(new Error('test case expected failed promise, but succeeded'))
        })
        .catch(err => {
          expect(err instanceof Error).to.equal(true)
          done()
        })
    })

    it('should reject the promise if the response is not properly formatted', done => {
      const partialData = {
        data: {
          // missing a USER_ID
          SESSION_ID: 12345,
        },
      }

      vm
        .validateLogin(partialData)
        .then(() => {
          done(new Error('test case expected failed promise, but succeeded'))
        })
        .catch(err => {
          expect(err instanceof Error).to.equal(true)
          done()
        })
    })

    it('should load i18n and reroute to workbench', done => {
      const $i18nLoadStub = sinon.stub().returns(new Promise(resolve => resolve()))
      vm.$i18n.load = $i18nLoadStub
      vm.$router = {
        push: route => {
          // ensure route is workbench
          expect(route.name).to.equal('workbench')
        },
      }

      const res = {
        data: {
          USER_ID: 1,
          SESSION_ID: 12345,
        },
      }

      vm
        .validateLogin(res)
        .then(() => {
          // ensure that i18n is attempted to load
          expect($i18nLoadStub.called).to.equal(true)
          done()
        })
        .catch(err => {
          done(new Error('test case expected succesful promise, but failed'))
        })
    })
  })
})
