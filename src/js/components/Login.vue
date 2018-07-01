// TODO: check if the session is valid before trying to login with locatdata
<template>
  <el-card v-show="visible" class="loginCard" header="Login" :body-style="{ background: 'white' }">
    <el-form id="login" @submit.native.prevent="onSubmit" :label-position="labelPosition">
      <el-form-item class="error warningText" v-show='errMsg.length'>
        {{ errMsg }}
      </el-form-item>
      <el-form-item>
        <span slot="label">User name <span class="reqired warningText"></span> <span class="error warningText">{{ usernameErr }}</span></span>
        <el-input class="loginUsername" type="text" placeholder="Your login name" :class='{"error": usernameErr.length}' v-model='user'></el-input>
      </el-form-item>
      <el-form-item>
        <span slot="label">Password <span class="reqired warningText"></span> <span class="error warningText">{{ passwordErr }}</span></span>
        <el-input class="loginPassword" type="password" placeholder="Your password" :class='{"error": passwordErr.length}' v-model='passwd'></el-input>
      </el-form-item>
      <el-form-item label="Language / Sprache / שפה">
        <el-select class="langSelect" v-model="language">
          <el-option value="en">English</el-option>
          <el-option value="de">Deutsche</el-option>
          <el-option value="hb">עברית</el-option>
        </el-select>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" native-type="submit">Submit</el-button>
        <a href="mailto:Bronson.Brown-deVost@theologie.uni-goettingen.de?subject=Forgot%20password">Forgot my login</a>
      </el-form-item>
    </el-form>
  </el-card>
</template>

<script>
import { mapMutations, mapGetters } from 'vuex'
export default {
  data() {
    return {
      visible: false,
      user: '',
      passwd: '',
      errMsg: '',
      usernameErr: '',
      passwordErr: '',
      language: 'en',
      labelPosition: 'top',
    }
  },
  computed: {
    ...mapGetters(['username', 'sessionID']),
  },
  created() {
    this.user = this.username
    // if there's a session hanging around in localStorage, check that
    if (this.sessionID) {
      this.validateSession(window.localStorage ? window.localStorage : null)
    } else {
      // users first time here, show the Login screen
      this.visible = true
    }
  },
  methods: {
    ...mapMutations(['setSessionID', 'setUserID', 'setUsername', 'setLanguage']),
    onSubmit() {
      const isUserValid = this.validateUsername()
      const isPasswordValid = this.validatePassword()
      if (isUserValid && isPasswordValid) {
        this.attemptLogin()
      } else {
        this.errMsg = this.$i18n.str('Errors.Login')
      }
    },
    validateUsername() {
      if (!this.user.trim()) {
        this.usernameErr = 'Username is required'
        return false
      } else {
        this.usernameErr = ''
        return true
      }
    },
    validatePassword() {
      if (!this.passwd.trim()) {
        this.passwordErr = 'Password is required'
        return false
      } else {
        this.passwordErr = ''
        return true
      }
    },
    validateSession(storage) {
      return this.$post('resources/cgi-bin/scrollery-cgi.pl', {
        SESSION_ID: this.sessionID,
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
        .then(() => {
          this.visible = true
        })
        .catch(({ response }) => {
          // The Session is invalid, so clear out local Vuex storage but
          // no error message required.
          this.errMsg = ''
          storage && storage.removeItem('sqe-session')
          this.visible = true
        })
    },
    attemptLogin() {
      this.$post('resources/cgi-bin/scrollery-cgi.pl', {
        USER_NAME: this.user.trim(),
        PASSWORD: this.passwd.trim(),
        transaction: 'validateSession',
        SCROLLVERSION: 1,
      })
        .then(res => this.validateLogin(res))
        .catch(
          function({ response }) {
            this.errMsg = this.$i18n.str('Errors.ServiceUnavailable')
          }.bind(this)
        )
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
        } else if (res.data && res.data.SESSION_ID && res.data.USER_ID) {
          // Set store state
          this.setSessionID(res.data.SESSION_ID)
          this.setUserID(~~res.data.USER_ID)
          this.setUsername(this.user.trim())
          this.setLanguage(this.language)
          // Load language files
          this.$i18n
            .load()
            .then(() => {
              // success!
              this.$router.push({
                name: 'workbenchAddress',
                params: {
                  scrollID: '~',
                  scrollVersionID: '~',
                  imageID: '~',
                  colID: '~',
                  artID: '~',
                },
              })
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

<style lang="scss" scoped>
.loginCard {
  width: 325px;
  background: #409eff;
  color: white;
  font-size: 20px;
  font-family: 'Helvetica Neue', Helvetica, 'PingFang SC', 'Hiragino Sans GB', 'Microsoft YaHei',
    '微软雅黑', Arial, sans-serif;
}
.loginUsername {
  width: 100%;
}
.loginPassword {
  width: 100%;
}
.langSelect {
  width: 100%;
}
</style>
