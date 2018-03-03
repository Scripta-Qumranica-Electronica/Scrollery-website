// TODO: check if the session is valid before trying to login with locatdata
<template>
  <el-card class="loginCard" header="Login" :body-style="{ background: 'white' }">
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
        <el-input class="loginPassword" type="password" placeholder="Your password" :class='{"error": passwordErr.length}' v-model='password'></el-input>
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
      user: '',
      password: '',
      errMsg: '',
      usernameErr: '',
      passwordErr: '',
      language: 'en',
      labelPosition: 'top',
    }
  },
  computed: {
    ...mapGetters(['username',
                    'sessionID'])
  },
  created() {
    this.user = this.username
    if (this.sessionID) {
      this.validateSession(window.localStorage ? window.localStorage : null)
    }
  },
  methods: {
    ...mapMutations([
      'setSessionID',
      'setUserID',
      'setUsername',
      'setLanguage'
    ]),
    onSubmit() {
      const isUserValid = this.validateUsername();
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
      if (!this.password.trim()) {
        this.passwordErr = 'Password is required'
        return false
      } else {
        this.passwordErr = ''
        return true
      }
    },
    validateSession(storage) {
      this.$post('resources/cgi-bin/scrollery-cgi.pl', {
        SESSION_ID: this.sessionID,
        transaction: 'validateSession',
        SCROLLVERSION: 1
      })
      .then(res => {
        if (res.data && res.data.error) {

          // blow away localStorage on session error
          this.errMsg = ''
          storage.removeItem('sqe')
          
        } else if (res.data) {
          this.validateLogin(res)
        }
      })
      .catch(({ response }) => {

        // The Session is invalid, so clear out local Vuex storage but
        // no error message required.
        this.errMsg = ''
        storage && storage.removeItem('sqe')
      });
    },
    attemptLogin() {
      this.$post('resources/cgi-bin/scrollery-cgi.pl', {
        USER_NAME: this.user.trim(),
        PASSWORD: this.password.trim(),
        transaction: 'validateSession',
        SCROLLVERSION: 1
      })
      .then(res => this.validateLogin(res))
      .catch(({ response }) => {
        this.errMsg = this.$i18n.str('Errors.ServiceUnavailable')
      });
    },
    validateLogin(res) {
      if (res.data && res.data.error) {
        this.errMsg = res.data.error
        console.error(res.data)
      } else if (res.data 
                && res.data.SESSION_ID 
                &&  res.data.USER_ID 
        ) {

          // Set store state
          this.setSessionID(res.data.SESSION_ID)
          this.setUserID(res.data.USER_ID)
          this.setUsername(this.user.trim())
          this.setLanguage(this.language)

          // Load language files
          this.$i18n.load().then(() => {

            // success!
            this.$router.push({name: 'workbench'})
          })
          .catch(() => {
            this.errMsg = this.$i18n.str('Errors.ServiceUnavailable')
          })
      } else {
        this.errMsg = this.$i18n.str('Errors.Unknown')
      }
    }
  }
}
</script>

<style lang="scss" scoped>
.loginCard {
  width: 325px;
  background: #409EFF;
  color: white;
  font-size: 20px;
  font-family: "Helvetica Neue",Helvetica,"PingFang SC","Hiragino Sans GB","Microsoft YaHei","微软雅黑",Arial,sans-serif;
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