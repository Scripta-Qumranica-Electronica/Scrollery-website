export default class Combination {
  constructor(record = {}) {
    this.name = record.name
    this.scroll_id = record.scroll_id
    this.scroll_version_id = record.scroll_version_id
    this.locked = record.locked
    this.user_id = record.user_id
    this.cols = []
    this.imageReferences = []
    this.artefacts = []
    this.rois = []
  }
}
