<template>
  <div class="container">
    <h1 class="title has-text-centered is-size-4">กรุณากรอกอีเมลและรหัสผ่าน</h1>
    <b-field label="E-mail">
      <b-input type="email" v-model="email"></b-input>
    </b-field>
    <b-field label="Password">
      <b-input type="password" v-model="password"></b-input>
    </b-field>
    <b-field>
      <div class="buttons is-centered">
        <b-button :loading="saving" @click="saveData" type="is-primary">Submit</b-button>
      </div>
    </b-field>
  </div>
</template>

<script>
import {collection, updateDoc, doc, getDocs, query, where} from "firebase/firestore";
import {db} from "../firebase";

export default {
  name: "staffForm",
  data () {
    return {
      email: "",
      password: "",
      saving: false
    }
  },
  methods: {
    async saveData() {
      this.saving = true
      const staffRef = collection(db, 'staff')
      let q = query(staffRef, where('email', '==', this.email))
      let querySnapshot = await getDocs(q)
      for (let document of querySnapshot.docs) {
        let d = document.data()
        if (this.password === d.password) {
          updateDoc(doc(db, "staff", document.id), {lineId: this.$store.state.lineProfile.userId}).then(()=>{
            this.$buefy.toast.open({
              message: "บันทึกข้อมูลเรียบร้อยแล้ว",
              type: "is-success",
              position: "is-top"
            })
            this.saving = false
            this.$store.dispatch('updateUser', d)
            this.$store.dispatch('updateLineId', this.$store.state.lineProfile.userId)
            this.$router.push({ name: "bookings" })
          })
        } else {
          this.saving = false
          this.$buefy.toast.open({
            message: "รหัสผ่านไม่ถูกต้อง",
            type: "is-warning",
            position: "is-top"
          })
        }
      }
    }
  }
}
</script>

<style scoped>

</style>