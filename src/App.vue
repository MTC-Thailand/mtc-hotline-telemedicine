<template>
  <div id="app">
    <section class="section">
      <b-breadcrumb separator="has-bullet-separator" size="is-small" align="is-centered">
        <b-breadcrumb-item tag="router-link" to="/records">รายการจอง</b-breadcrumb-item>
        <b-breadcrumb-item tag="router-link" to="/about">การเตรียมตัว</b-breadcrumb-item>
      </b-breadcrumb>
      <router-view/>
    </section>
  </div>
</template>

<style>
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}
</style>
