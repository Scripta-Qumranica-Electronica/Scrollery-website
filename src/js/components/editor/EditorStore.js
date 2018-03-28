import { Store } from 'vuex'

export default $i18n => (new Store({
  state: {
    showReconstructedText: true,
    font: {
      name: 'SBL Hebrew',
      class: 'text-sbl-hebrew',
      label: `SBL Hebrew (${$i18n.str('Editor.HandOf')})` 
    }
  },
  getters: {
    showReconstructedText: state => state.showReconstructedText,
    font: state => state.font
  },
  mutations: {
    showReconstructedText(state) {
        state.showReconstructedText = true;
    },
    hideReconstructedText(state) {
        state.showReconstructedText = false;
    },
    setFont(state, font) {
        state.font = font
    }
  }
}))