<template>
  <div class="buttons is-centered">
    <b-button @click="$router.push({ name: 'Records' })" type="is-danger">จองวันตรวจ</b-button>
    <b-button type="is-primary">สำหรับเจ้าหน้าที่</b-button>
  </div>
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
