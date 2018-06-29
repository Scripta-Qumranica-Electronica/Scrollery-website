import Corpus from '~/models/Corpus.js'
import Combination from './Combination-factory.js'
import ImageReference from './ImageReference-factory.js'
import Image from './Image-factory.js'
import Col from './Col-factory.js'
import Artefact from './Artefact-factory.js'
import ROI from './ROI-factory.js'
import faker from 'faker'

const generateCorpus = () => {
  let corpus = new Corpus(faker.random.uuid(), faker.random.uuid())
  let cols = []
  let imageReferences = []
  let artefacts = []
  let rois = []
  let images = []
  let artefactRois = []

  for(let i = 0; i < 3; i++) {
    const scroll_version_id = faker.random.number(1000000)
    cols = []
    imageReferences = []
    artefacts = []
    rois = []

    for(let j = 0; j < 5; j++) {
      const col_id = faker.random.number(1000000)
      const image_catalog_id = faker.random.number(1000000)
      const artefact_id = faker.random.number(1000000)

      images = []
      artefactRois = []
      for(let z = 0; z < 5; z++) {
        const sign_char_roi_id = faker.random.number(1000000)
        const sqe_image_id = faker.random.number(1000000)

        corpus.rois._insertItem(new ROI({sign_char_roi_id: sign_char_roi_id}), scroll_version_id)
        rois.push(sign_char_roi_id)
        artefactRois.push(sign_char_roi_id)
        corpus.images._insertItem(new Image({
          sqe_image_id: sqe_image_id,
          type: z % 4,
        }))
        images.push(sqe_image_id)
      }


      corpus.cols._insertItem(new Col({
        col_id: col_id,
        rois: artefactRois,
        scroll_version_id: scroll_version_id
      }), scroll_version_id)
      cols.push(col_id)

      corpus.imageReferences._insertItem(new ImageReference({
        image_catalog_id: image_catalog_id,
        artefacts: [artefact_id],
        rois: artefactRois,
        images: images,
        side: j % 2
      }))
      imageReferences.push(image_catalog_id)

      corpus.artefacts._insertItem(new Artefact({
        artefact_id: artefact_id,
        rois: artefactRois,
        scroll_version_id: scroll_version_id,
        image_catalog_id: image_catalog_id,
      }), scroll_version_id)
      artefacts.push(artefact_id)
    }

    corpus.combinations._insertItem(
      new Combination({
        scroll_version_id: scroll_version_id,
        cols: cols,
        imageReferences: imageReferences,
        artefacts: artefacts,
        rois: rois
      })
    )
    console.log(corpus.combinations)
  }

  return corpus
}

const model = generateCorpus

export default model