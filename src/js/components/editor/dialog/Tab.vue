<template>
  <section class="tab">
    <div class="tab-body">
        <slot></slot>
    </div>
  </section>
</template>

<style lang="scss" scoped>

section,
div {
  &::-webkit-scrollbar {
      width: 0px;  /* remove scrollbar space */
      background: transparent;  /* optional: just make scrollbar invisible */
  }
}

.tab {
  width: 100%;
  height: 400px;
  overflow: scroll;
}

.tab-body {
  height: 100%;
}
</style>