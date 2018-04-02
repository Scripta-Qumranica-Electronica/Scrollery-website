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
  width: 0;
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
  width: 0;
  padding: 0;
  overflow-x: hidden;
  transition: all 300ms;
  text-align: left;
}

.menu-section.open {

  & .title {
    width: calc(100% - (#{$spacer} * 2) - 50px);
  }

  & .body {
    padding: #{$spacer};
    width: 100%;
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