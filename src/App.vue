<template>
  <div id="app">
    <section class="section">
      <b-breadcrumb separator="has-bullet-separator" size="is-medium" align="is-centered">
        <b-breadcrumb-item tag="router-link" to="/" active>หน้าแรก</b-breadcrumb-item>
        <b-breadcrumb-item tag="router-link" to="/records">รายการจอง</b-breadcrumb-item>
        <b-breadcrumb-item tag="router-link" to="/about">เกี่ยวกับ</b-breadcrumb-item>
      </b-breadcrumb>
    </section>
    <section class="section">
      <div class="container">
        <router-view/>
      </div>
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
