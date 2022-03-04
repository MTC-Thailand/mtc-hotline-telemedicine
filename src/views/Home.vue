<template>
  <div class="home">
    <h1 class="title is-size-4 has-text-centered">ระบบจองคิวตรวจ ATK ผ่านระบบทางไกล</h1>
    <div v-if="updateData">
      <h1 class="subtitle is-size-6 has-text-centered">กรุณากรอกข้อมูลเบื้องต้นเพื่อการติดต่อในกรณีจำเป็น</h1>
      <b-notification type="is-light" :closable="false">
        <b-field label="คำนำหน้า">
          <b-input v-model="title"></b-input>
        </b-field>
        <b-field label="ชื่อ นามสกุล" type="is-danger" message="จำเป็น">
          <b-input v-model="name"></b-input>
        </b-field>
        <b-field label="เบอร์ติดต่อ" type="is-danger" message="จำเป็น">
          <b-input v-model="phone"></b-input>
        </b-field>
        <div class="buttons is-centered">
          <b-button @click="saveData" type="is-success">บันทึก</b-button>
        </div>
      </b-notification>
    </div>
  </div>
</template>

<script>
import { db} from '../firebase'
import { collection, addDoc } from 'firebase/firestore'

export default {
  name: 'Home',
  data() {
    return {
      title: null,
      name: null,
      phone: null,
      updateData: true,
      lineId: null,
      pictureUrl: null,
    }
  },
  methods: {
    saveData () {
      const userRef = collection(db, "users")
      let newUser = {
        name: this.name,
        phone: this.phone,
        lineId: this.lineId,
        title: this.title,
        pictureUrl: this.pictureUrl
      }
      addDoc(userRef,
      ).then(()=>{
        this.$store.dispatch('updateUser', newUser)
        this.$router.push({ name: 'Records' })
      })
    },
  },
  mounted () {
  }
}
</script>
