import { mount, factory } from '@test'
import ColumnComponent from '~/components/editor/Column.vue'
import Column from '~/models/Column.js'
import editorStore from '~/components/editor/EditorStore.js'

import select from '~/utils/DOMSelection.js'
import KEY_CODES from '~/components/editor/key_codes.js'

/**
 * Construct Column for testing
 *
 * @return {VueTestWrapper} the vue-test-utils wrapper class
 */
const columnFactory = () => {
  return mount(ColumnComponent, {
    attachToDocument: true, // important to ensure selection API works
    propsData: {
      state: editorStore({
        str: key => key,
      }),
      column: factory.column(),
    },
    mocks: {

      // route is accessed during mount. Just need a simple
      // stub of the $route global to avoid hard errors.
      $route: {
        params: {}
      }
    }
  })
}

describe('ColumnComponent', () => {
  let vm, wrapper
  beforeEach(() => {
    wrapper = columnFactory()
    vm = wrapper.vm
    vm.state.commit('setLocked', false)
  })

  afterEach(() => {
    // ensure the Column object is removed from the DOM
    wrapper.destroy()
  })

  it('should contain a div with the column text', () => {
    expect(wrapper.contains('.text-col[contenteditable]')).to.equal(true)
  })

  describe('keyboard events', () => {
    describe('meta-key actions aka hot keys aka shortcuts', () => {
      describe('prevented', () => {
        it('should disallow italics', () => {
          const e = new KeyboardEvent('keydown', {
            metaKey: true,
            keyCode: KEY_CODES.ALPHA.I,
            key: 'i',
          })
          sinon.spy(e, 'preventDefault')

          vm.onKeydown(e)
          expect(e.preventDefault.called).to.equal(true)
        })

        it('should disallow bold', () => {
          const e = new KeyboardEvent('keydown', {
            metaKey: true,
            keyCode: KEY_CODES.ALPHA.B,
            key: 'b',
          })
          sinon.spy(e, 'preventDefault')

          vm.onKeydown(e)
          expect(e.preventDefault.called).to.equal(true)
        })
      })

      describe('accepted', () => {
        it('should attempt to open the editor dialog on ctl+o', done => {
          const e = new KeyboardEvent('keydown', {
            metaKey: true,
            keyCode: KEY_CODES.ALPHA.O,
            key: 'o',
          })
          sinon.spy(e, 'preventDefault')

          // set a timeout to give browser time to render
          setTimeout(() => {
            // grab the text column
            const { element } = wrapper.find('.text-col')

            // the first child will be the <p> element representing the first line
            select.setRange(element.firstChild, 1, 2)

            // it prevents this default event action, but continues
            vm.onKeydown(e)
            expect(e.preventDefault.called).to.equal(true)

            expect(vm.dialogVisible).to.equal(true)
            done()
          }, 20)
        })
      })
    })
  })
})
