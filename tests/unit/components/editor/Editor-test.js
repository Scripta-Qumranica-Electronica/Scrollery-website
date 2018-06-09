import { mount } from '@test'
import Editor from '~/components/editor/Editor.vue'
import Column from '~/models/Column.js'
import getTextOfFragment from './getTextOfFragment.json'

/**
 * Create a $route object with only the properties
 * that the Editor component cares about
 *
 * @param {number=1} colID column ID to use in the route
 * @param {number=2} scrollVersionID  scroll version ID to use
 */
let makeRoute = (colID = 1, scrollVersionID = 2) => ({
  params: {
    colID,
    scrollVersionID,
  },
})

/**
 * Mock an API response to retrieve the text.
 *
 * @param {number=200} [status]     The HTTP status code to return
 *
 * @returns {Promise} A promise that resolves with the response
 */
let mockAPIResponse = (status = 200) => {
  return new Promise((resolve, reject) => {
    if (status > 400) {
      reject(new Error('mock api err'))
    } else {
      resolve({
        status,
        data: status === 200
          ? getTextOfFragment
          : {text: []},
      })
    }
  })
}

/**
 * Mount an editor component
 *
 * Note that if a mock route is provided that will trigger an AJAX
 * request to the retrieve the text, a corresponding mock to override
 * getText must also be provided.
 *
 * If you need to mock actual API responses, the better way is to use
 * an invalid route at first, then use wrapper.vm.$post to stub a response,
 * and then use wrapper.setData($route) to trigger the request
 */
let mountEditor = ({ mocks = {}, methods = {} }) => {
  let $post = sinon.stub()
  $post.onFirstCall(mockAPIResponse())
  let wrapper = mount(Editor, {
    mocks: {
      $route: makeRoute('~'),
      ...mocks,
    },
    methods,
  })

  // reset stub.
  $post.reset()

  // attach post stub to vm for future use in tests
  wrapper.vm.$post = $post

  return wrapper
}

describe('Editor', () => {
  describe('mounting/creation', () => {
    it('should attempt to load text when created from values available in the route', () => {
      let getTextSpy = sinon.spy()
      let wrapper = mountEditor({
        mocks: {
          $route: makeRoute(1, 2),
        },
        methods: {
          getText: getTextSpy,
        },
      })

      expect(getTextSpy.firstCall.args[0]).to.equal(2)
      expect(getTextSpy.firstCall.args[1]).to.equal(1)
    })

    it('should require a valid colID in order to request the text', () => {
      let getTextSpy = sinon.spy()
      let wrapper = mountEditor({
        methods: {
          getText: getTextSpy,
        },
      })
      expect(getTextSpy.called).to.equal(false)
    })

    it('should watch the route for changes and respond by getting text', () => {
      let getTextSpy = sinon.spy()

      // set the closure-scope colID to an invalid value
      let wrapper = mountEditor({
        mocks: {
          $route: makeRoute('~'),
        },
        methods: {
          getText: getTextSpy,
        },
      })

      // initially, called should be false
      expect(getTextSpy.called).to.equal(false)

      // set route to something valid
      wrapper.setData({
        $route: makeRoute(1),
      })
      expect(getTextSpy.called).to.equal(true)

      // reset route to something invalid
      wrapper.setData({
        $route: makeRoute('~'),
      })
      expect(getTextSpy.getCalls().length).to.equal(1)
      expect(wrapper.vm.text.length).to.equal(0)
    })
  })

  describe('fullscreen', () => {
    it('should toggle full screen', () => {
      let wrapper = mountEditor({
        $route: makeRoute(1),
      })
      wrapper.vm.toggleFullScreen()
      expect(wrapper.vm.fullscreen).to.equal(true)
    })
  })

  describe('loading text', () => {
    it('should create a composition from the returned sign stream', done => {
      let colID = 1
      let wrapper = mountEditor({})

      // prepare a stubbed response
      wrapper.vm.$post.returns(mockAPIResponse())

      // trigger a retrieval of that column
      wrapper.setData({
        $route: makeRoute(colID),
      })

      // detecting async event -- better way?
      // mocha will time out if this isn't hit
      let interval = setInterval(() => {
        if (wrapper.vm.text.length) {
          expect(wrapper.vm.text.get(0) instanceof Column).to.equal(true)
          clearInterval(interval)
          done()
        }
      }, 1)
    })
  })
})
