import { Store } from 'vuex'

export default $i18n => {
  const SBLHebrew = {
    name: 'SBL Hebrew',
    class: 'text-sbl-hebrew',
    label: `SBL Hebrew (${$i18n.str('Editor.HandOf')})`,
  }

  return new Store({
    state: {
      locked: true,
      showReconstructedText: true,
      font: SBLHebrew,
      fonts: {
        'SBL Hebrew': {
          name: 'SBL Hebrew',
          class: 'text-sbl-hebrew',
          label: `SBL Hebrew (${$i18n.str('Global.Default')})`,
        },
        '4Q416': {
          name: '4Q416',
          class: 'text-4Q416',
          label: `${$i18n.str('Editor.HandOf')} 4Q416`,
        },
        '4Q417': {
          name: '4Q417',
          class: 'text-4Q417',
          label: `${$i18n.str('Editor.HandOf')} 4Q417`,
        },
        '4Q418': {
          name: '4Q418',
          class: 'text-4Q418',
          label: `${$i18n.str('Editor.HandOf')} 4Q418`,
        },
        '4Q503': {
          name: '4Q503',
          class: 'text-4Q503',
          label: `${$i18n.str('Editor.HandOf')} 4Q503`,
        },
        cryptic: {
          name: 'Cryptic',
          class: 'text-cryptic',
          label: 'Cryptic',
        },
      },
    },
    getters: {
      showReconstructedText: state => state.showReconstructedText,
      font: state => state.font,
      fonts: state => state.fonts,
      locked: state => state.locked,
    },
    mutations: {
      showReconstructedText(state) {
        state.showReconstructedText = true
      },
      hideReconstructedText(state) {
        state.showReconstructedText = false
      },
      setFont(state, font) {
        // ensure font is a registered/known font
        if (state.fonts[font]) {
          state.font = state.fonts[font]
        }
      },
      setLocked: (state, locked) => {
        state.locked = locked
      },
    },
  })
}
