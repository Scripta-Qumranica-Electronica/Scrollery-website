<template>
  <div class="col col-6 push-middle push-center login-wrapper">
    <div class="header"><h2>Login</h2></div>
    <form id="login" class="form left" @submit.prevent="onSubmit">
        <div class="error" v-show='errMsg.length'>
          {{ errMsg }}
        </div>
        <div class="form-item">
          <label>User name <span class="req"></span> <span class="error">{{ usernameErr }}</span></label>
          <input type="text" placeholder="Your login name" class="small" :class='{"error": usernameErr.length}' v-model='username'>
        </div>
        <div class="form-item">
          <label>Password <span class="req"></span> <span class="error">{{ passwordErr }}</span></label>
          <input type="password" placeholder="Your password" class="small" :class='{"error": passwordErr.length}' v-model='password'>
        </div>
        <div class="form-item">
          <label>Language / Sprache / שפה</label>
          <select v-model="language">
            <option value="en">English</option>
            <option value="de">Deutsche</option>
            <option value="hb">עברית</option>
          </select>
        </div>
        <div class="form-item">
          <button type="submit">Submit</button>
          <a href="mailto:martin.schroeter@theologie.uni-goettingen.de?subject=Forgot%20password">Forgot my login</a>
        </div>
    </form>
  </div>
</template>

<script>
import { mapMutations } from 'vuex'

export default {
  data() {
    return {
      username: '',
      password: '',
      errMsg: '',
      usernameErr: '',
      passwordErr: '',
      language: 'en'
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
        this.errMsg = 'Please correct errors and resubmit.'
      }
    },
    validateUsername() {
      if (!this.username.trim()) {
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
    attemptLogin() {
      this.$post('resources/cgi-bin/server.pl', {
        USER_NAME: this.username.trim(),
        PASSWORD: this.password.trim(),
        request: 'login',
        SCROLLVERSION: 1
      })
      .then(res => {
        if (res.data && res.data.error) {
          console.error(res.data)
          this.errMsg = res.data.error
        } else if (res.data 
                  && res.data.SESSION_ID 
                  &&  res.data.USER_ID 
          ) {
              this.setSessionID(res.data.SESSION_ID)
              this.setUserID(res.data.USER_ID)
              this.setUsername(this.username.trim())
              this.setLanguage(this.language)
              // success!
              this.$router.push({name: 'workbench'})
        } else {
          this.errMsg = 'Unexpected response'
        }
      })
      .catch(({ response }) => {
        this.errMsg = 'Unable to connect to the server. Please retry another time.'
      });
    }
  }
}
</script>

<style lang="sass" scoped>
label {
  font-weight: 600;
}

.login-wrapper {
  border-radius: 4px;
  box-shadow: 2px 3px 3px rgba(153, 153, 153, .2);
}

.form-item {
  margin-bottom: 10px;
}

.form-item a {
  font-size: 16px;
}

.header {
  border-radius: 4px 4px 0 0;
  background-color: #1c86f2;
  padding: 10px;
}

.header h2 {
  color: #fff;
  text-shadow: .3px .1px 0 #000;
  margin: 0;
}

#login {
  padding: 10px;
  border: 1px solid lightgray;
  background-color: #fff;
  border-radius: 0 0 4px 4px;
  margin: 0;
}

.left {
  text-align: left;
}

.right {
  text-align: right;
}

.center {
  text-align: center;
}
</style>