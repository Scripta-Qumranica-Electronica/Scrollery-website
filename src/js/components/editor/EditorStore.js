import { Store } from 'vuex'

export default () => new Store({
  state: {
      showReconstructedText: true
  },
  getters: {
      showReconstructedText: state => state.showReconstructedText
  },
  mutations: {
      showReconstructedText(state) {
          state.showReconstructedText = true;
      },
      hideReconstructedText(state) {
          state.showReconstructedText = false;
      }
  }
})