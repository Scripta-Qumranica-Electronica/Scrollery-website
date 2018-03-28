import { Store } from 'vuex'

export default () => new Store({
  state: {
    showReconstructedText: true,
    fontClass: 'text-sbl-hebrew'
  },
  getters: {
    showReconstructedText: state => state.showReconstructedText,
    font: state => state.fontClass
  },
  mutations: {
    showReconstructedText(state) {
        state.showReconstructedText = true;
    },
    hideReconstructedText(state) {
        state.showReconstructedText = false;
    },
    setFontClass(state, font) {
        state.fontClass = font
    }
  }
})