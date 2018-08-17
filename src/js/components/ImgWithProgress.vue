<template>
    <div>
        <div v-if="progress !== 1">
            <i 
                v-if="progress === 0"
                class="fa fa-spinner fa-spin fa-fw" 
                aria-hidden="true"
                style="color: black">
            </i>
            <el-progress v-else :percentage="progress * 100"></el-progress>
            <span>Loading image...</span>
        </div>
        <img v-if="imageURL && type === 'img'" :src="imageURL"/>
    </div>
</template>

<script>
/**
 * This is working, but the iiif servers do not seem to provide
 * a "total" variable for the progress event, so we never get a
 * real progress indicator, only the spinner.
 *
 * There is a problem with CORS on the Göttingen iiif server,
 * so this doesn't work with the images of 4Q51 served from there.
 */
import { mapGetters } from 'vuex'

export default {
  props: {
    url: undefined,
    type: undefined, // Eventually add support for SVG image elements as well.
  },
  data() {
    return {
      progress: 0,
      imageURL: undefined,
    }
  },
  mounted() {
    this.loadImage(this.url)
      .then(
        /* istanbul ignore next */
        url => (this.imageURL = url)
      )
      .catch(
        /* istanbul ignore next */
        err => console.error(err)
      )
  },
  computed: {
    ...mapGetters(['imageProxy']),
  },
  methods: {
    loadImage(imageUrl) {
      return new Promise((resolve, reject) => {
        /* istanbul ignore next */
        this.$get(this.imageProxy + imageUrl, {
          onDownloadProgress: progressEvent => {
            /* istanbul ignore next */
            if (progressEvent.total) {
              this.progress = progressEvent.loaded / progressEvent.total
            } else {
              this.progress = 1
            }
          },
          /* istanbul ignore next */
          responseType: 'blob',
        })
          .then(
            /* istanbul ignore next */
            image => {
              /* istanbul ignore next */
              resolve(window.URL.createObjectURL(image.data))
            }
          )
          .catch(
            /* istanbul ignore next */
            err => {
              /* istanbul ignore next */
              reject(err)
            }
          )
      })
    },
  },
}
</script>
