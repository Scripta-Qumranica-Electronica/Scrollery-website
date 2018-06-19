import ItemList from './ItemList.js'
import Artefact from './Artefact.js'

export default class Artefacts extends ItemList {
  constructor(corpus, idKey, defaultPostData = undefined) {
    idKey = idKey || 'artefact_id'
    const listType = 'artefacts'
    const connectedLists = [corpus.combinations, corpus.imageReferences]
    const relativeToScrollVersion = true
    defaultPostData = defaultPostData ? defaultPostData : { transaction: 'getArtOfImage' }
    super(
      corpus,
      idKey,
      Artefact,
      listType,
      connectedLists,
      relativeToScrollVersion,
      defaultPostData
    )
  }
}
