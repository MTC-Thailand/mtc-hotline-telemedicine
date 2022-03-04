<template>
  <div>
    <h1 class="title is-size-6 has-text-centered">กรุณากรอกข้อมูลเบื้องต้นเพื่อการติดต่อในกรณีจำเป็น</h1>
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
</template>

<script>
import {addDoc, collection} from "firebase/firestore";
import {db} from "../firebase";

export default {
  name: "userForm",
  data() {
    return {
      title: null,
      name: null,
      phone: null,
    }
  },
  methods: {
    saveData () {
      const userRef = collection(db, "users")
      let newUser = {
        name: this.name,
        phone: this.phone,
        lineId: this.$store.state.lineProfile.userId,
        title: this.title,
        pictureUrl: this.$store.state.lineProfile.pictureUrl
      }
      addDoc(userRef, newUser).then(()=>{
        this.$store.dispatch('updateUser', newUser)
        this.$router.push({ name: 'Records' })
      })
    },
  },
}
</script>

<style scoped>

</style>