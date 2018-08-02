/**
 * A Set of Cross-Browser tools for managing selections
 */

const getSelection = () => {
  return document.getSelection ? document.getSelection() : document.selection
}

export default {
  getSelection,
  setRange: (elem, start = 0, end = 0) => {
    const range = document.createRange ? document.createRange() : document.selection.createRange()
    range.setStart(elem.firstChild, start)
    range.setEnd(elem.firstChild, end)
    getSelection().addRange(range)
  },
}
