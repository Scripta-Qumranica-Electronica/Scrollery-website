<template>
  <section class="menu-section" :class='{"open": open}'>
    <div class="header">
      <div class="icon">
        <slot name="icon"></slot>
      </div>
    </div>
    <div class="body">
      <div class="title">
        {{ title }}
      </div>
      <slot name="body"></slot>
    </div>
  </section>
</template>

<style lang="scss" scoped>

@import "~sass-vars";

.header {
  width: 100%;
}

.title {
  overflow: hidden;
  width: calc(100% - (#{$spacer} * 2) - 50px);
  color: $dkBlue;
  font-weight: 600;
}

.icon {
  line-height: calc(#{$header} - #{$spacer * 2});
  font-size: 2em;
  padding: $spacer;
  width: 50px;
  color: $dkBlue;
  transition: color 300ms;
  float: right;
}

.body {
  padding: #{$spacer};
  width: 100%;
  opacity: 0;
  transition: all 100ms;
  transition-timing-function: ease-out;
  text-align: left;
}

.menu-section.open {
  & .body {
    opacity: 1.0;
    transition: all 300ms;
  transition-timing-function: ease-in;
  }
}

</style>

<script>
export default {
  props: {
    open: Boolean,
    title: String
  }
}
</script>