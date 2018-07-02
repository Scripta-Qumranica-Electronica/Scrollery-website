<template>
  <el-col :span="24">
    <component v-bind:is="view"></component>
  </el-col>
</template>

<script>
import { mapGetters, mapMutations } from 'vuex'

// components
import Loading from './Loading.vue'
import AppBody from './AppBody.vue'

export default {
  /**
   * Route Guard
   */
  beforeRouteEnter(to, from, next) {
    next(vm => {
      if (!vm.sessionID.length || vm.userID === -1) {
        vm.$router.replace({ name: 'login' })
      }
    })
  },

  components: {
    loading: Loading,
    'app-body': AppBody,
  },

  data() {
    return {
      view: 'loading',
    }
  },

  computed: {
    ...mapGetters(['sessionID']),
  },

  mounted() {
    this.validateSession()
      .then(() => {
        this.view = 'app-body'
      })
      .catch(err => {
        console.error(err)
        this.$router.push({ name: 'login' })
      })
  },
  methods: {
    ...mapMutations(['setSessionID', 'setUserID', 'setUsername', 'setLanguage']),
    validateSession(storage) {
      return this.$post('resources/cgi-bin/scrollery-cgi.pl', {
        SESSION_ID: window.localStorage.getItem('sqe-session'),
        transaction: 'validateSession',
        SCROLLVERSION: 1,
      })
        .then(res => {
          if (res.data && res.data.error) {
            // blow away localStorage on session error
            this.errMsg = ''
            storage.removeItem('sqe-session')
          } else if (res.data) {
            return this.validateLogin(res)
          }
        })
        .catch(({ response }) => {
          // The Session is invalid, so clear out local Vuex storage but
          // no error message required.
          storage && storage.removeItem('sqe-session')
        })
    },
    validateLogin(res) {
      return new Promise((resolve, reject) => {
        // Safeguard to ensure data given
        if (!res) {
          reject(new Error('Login.validateLogin requires a server response'))
          return
        }

        // got a successful response
        if (res.data && res.data.error) {
          this.errMsg = res.data.error
          console.error(res.data)
          reject(new Error('Login invalid'))
        } else if (
          res.data &&
          res.data.SESSION_ID &&
          res.data.USER_ID &&
          (window.localStorage.getItem('name') &&
            JSON.parse(window.localStorage.getItem('name'))[~~res.data.USER_ID])
        ) {
          // Set store state
          this.setSessionID(res.data.SESSION_ID)
          this.setUserID(~~res.data.USER_ID)
          // Maybe we have the AJAX function send back the user_name as well.
          this.setUsername(JSON.parse(window.localStorage.getItem('name'))[~~res.data.USER_ID])
          this.setLanguage(window.localStorage.getItem('language') || this.language)
          // Load language files
          this.$i18n
            .load()
            .then(() => {
              resolve()
            })
            .catch(() => {
              this.errMsg = this.$i18n.str('Errors.ServiceUnavailable')
              reject(new Error('Service unavailable'))
            })
        } else {
          this.errMsg = this.$i18n.str('Errors.Unknown')
          reject(new Error('Unknown error'))
        }
      })
    },
  },
}
</script>
