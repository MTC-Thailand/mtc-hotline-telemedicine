<template>
  <section class="section">
    <div class="columns">
      <div class="column has-text-centered box">
        <figure class="image is-inline-block">
          <img src="../assets/calendar.png"/>
        </figure>
        <h1 class="title is-size-4 has-text-centered">ระบบนัดหมายเพื่อการตรวจ ATK ผ่านระบบทางไกล</h1>
        <h1 class="subtitle is-size-6 has-text-centered">โดยสภาเทคนิคการแพทย์</h1>
        <div class="buttons is-centered">
          <b-button @click="$router.push({ name: 'Records' })" type="is-danger">จองวันตรวจ</b-button>
          <b-button type="is-info">สำหรับเจ้าหน้าที่</b-button>
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
import {collection, getDocs, query, where} from "firebase/firestore";
import {db} from "../firebase";

export default {
  name: 'Home',
  methods: {
    async initializeLine () {
      liff.init({liffId: '1656942599-wqV1b0La'}).then(async () => {
        if (!liff.isInClient()) {
          const userRef = collection(db, "users")
          let q = query(userRef, where('lineId', '==', 'testaccount'))
          let querySnapshot = await getDocs(q)
          querySnapshot.forEach(doc=>{
            this.$store.dispatch('updateUser', doc.data())
          })
        } else {
          if (!liff.isLoggedIn()) {
            liff.login()
          }
          liff.getProfile().then(async profile => {
            await this.$store.dispatch('updateLineProfile', profile)
            const userRef = collection(db, "users")
            let q = query(userRef, where('lineId', '==', profile.userId))
            let querySnapshot = await getDocs(q)
            if (querySnapshot.empty) {
              await this.$router.push({ name: 'userForm' })
            } else {
              querySnapshot.forEach(doc=>{
                this.$store.dispatch('updateUser', doc.data())
              })
            }
          })
        }
      })
    }
  },
  mounted () {
    this.initializeLine()
  }
}

</script>
