<template>
  <div class="message-bar" :class="classes">
      <div class="message">
          <div class="inline" :class="type">{{ message }} <span class="action" @click="fireAction" v-if="actionText">{{ actionText }}</span></div>
          
          <div class="inline float-right close" @click="close">
              <svg width="25" height="25" viewBox="0 0 1792 1792" xmlns="http://www.w3.org/2000/svg"><path d="M1225 1079l-146 146q-10 10-23 10t-23-10l-137-137-137 137q-10 10-23 10t-23-10l-146-146q-10-10-10-23t10-23l137-137-137-137q-10-10-10-23t10-23l146-146q10-10 23-10t23 10l137 137 137-137q10-10 23-10t23 10l146 146q10 10 10 23t-10 23l-137 137 137 137q10 10 10 23t-10 23zm215-183q0-148-73-273t-198-198-273-73-273 73-198 198-73 273 73 273 198 198 273 73 273-73 198-198 73-273zm224 0q0 209-103 385.5t-279.5 279.5-385.5 103-385.5-103-279.5-279.5-103-385.5 103-385.5 279.5-279.5 385.5-103 385.5 103 279.5 279.5 103 385.5z" fill="#fff"/></svg>
          </div>
      </div>
  </div>
</template>

<script>
const types = {
  info: 'info',
  warning: 'warning',
  error: 'error',
  success: 'success',
}

const defaultOptions = {
  type: 'info',
  timeout: 2000,
  keepOpen: false,
  actionText: '',
  actionCallback: () => {},
}

export default {
  data() {
    return {
      open: false,
      type: '',
      message: '',
      actionText: '',
      currentCallback: null,
    }
  },
  computed: {
    classes() {
      const classes = {
        open: this.open,
      }

      if (this.type) {
        classes[this.type] = true
      }

      return classes
    },
  },
  methods: {
    flash(message, opts = defaultOptions) {
      const args = {
        ...defaultOptions,
        ...opts,
      }

      this.message = message
      this.actionText = args.actionText
      this.type = types[args.type] || 'info'

      this.open = true
      this.currentCallback = args.actionCallback

      if (!args.keepOpen) {
        setTimeout(() => this.close(), args.timeout)
      }
    },
    fireAction() {
      if (typeof this.currentCallback === 'function') {
        this.currentCallback()
      }
    },
    close() {
      this.open = false

      setTimeout(() => {
        this.message = ''
        this.type = ''
        this.actionText = ''
        this.currentCallback = null
      }, 300)
    },
  },
}
</script>

<style lang="scss" scoped>
@import '~sass-vars';

.message-bar {
  position: absolute;
  bottom: -60px;
  height: 60px;
  width: 100%;
  background-color: rgba($ltBlue, 0.7);
  color: #fff;

  transition: bottom 300ms;

  &.open {
    bottom: 0;
  }

  &.error {
    background-color: rgba($error, 0.7);

    & .close {
      color: $error;
    }
  }

  &.warning {
    background-color: rgba($warning, 0.7);

    & .close {
      color: $warning;
    }
  }

  &.success {
    background-color: rgba($success, 0.7);

    & .close {
      color: $success;
    }
  }
}

.action {
  cursor: pointer;
  text-decoration: underline;
}

.message {
  padding: $spacer;
}

.close {
  cursor: pointer;
}
</style>
