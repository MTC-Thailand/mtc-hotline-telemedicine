<template>
  <section class="section">
    <div class="columns">
      <div class="column has-text-centered box">
        <figure class="image is-inline-block">
          <img src="../assets/calendar.png"/>
        </figure>
        <h1 class="title is-size-4 has-text-centered">ระบบนัดหมายเพื่อการตรวจ ATK ผ่านระบบทางไกล</h1>
        <h1 class="subtitle is-size-6 has-text-centered">โดยสภาเทคนิคการแพทย์</h1>
        <p>v.1.1.5</p>
        <div class="buttons is-centered">
          <b-button @click="$router.push({ name: 'Records' })" type="is-danger">จองวันตรวจ</b-button>
          <b-button @click="$router.push({ name: 'bookings' })" type="is-info">สำหรับเจ้าหน้าที่</b-button>
        </div>
        <p class="help is-info has-text-centered">
          สอบถามเพิ่มเติมเกี่ยวกับการตรวจได้ทางช่องทางแชท
        </p>
      </div>
    </div>
  </section>
</template>

<script>

import liff from "@line/liff";

export default {
  name: 'Home',
  mounted () {
    liff.init({liffId: '1656942599-wqV1b0La'})
  }
}

</script>
