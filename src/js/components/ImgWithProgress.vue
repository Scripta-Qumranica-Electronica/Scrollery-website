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
    console.log(this.url)
    this.loadImage(this.url)
      .then(url => (this.imageURL = url))
      .catch(err => console.error(err))
  },
  methods: {
    loadImage(imageUrl, onprogress) {
      return new Promise((resolve, reject) => {
        this.$get(imageUrl, {
          onDownloadProgress: progressEvent => {
            if (progressEvent.total) {
              this.progress = progressEvent.total / progressEvent.loaded
              console.log('loaded', progressEvent.loaded, '/', progressEvent.total, 'of', imageUrl)
            } else {
              console.log('finished loading', imageUrl)
              this.progress = 1
            }
          },
          responseType: 'blob',
        })
          .then(image => {
            console.log(image)
            resolve(window.URL.createObjectURL(image.data))
          })
          .catch(err => {
            reject(err)
          })
      })
    },
  },
}
</script>
