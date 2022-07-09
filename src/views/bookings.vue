<template>
  <div class="container">
    <div class="has-text-centered">
      <figure class="image is-inline-block is-96x96">
        <img :src="$store.state.user.pictureUrl" class="is-rounded">
      </figure>
    </div>
    <h1 class="title is-size-5 has-text-centered">{{ $store.state.user.name }}</h1>
    <h1 class="subtitle is-size-5 has-text-centered">ท.น.{{ $store.state.user.license }}</h1>
    <h1 class="title has-text-centered has-text-info">รายการนัดหมาย</h1>
    <b-table :data="records" :loading="loading">
      <b-table-column field="datetime" label="วันที่ตรวจ" v-slot="props">
        {{ props.row.datetime }}
      </b-table-column>
      <b-table-column field="fullname" label="ผู้รับบริการ" v-slot="props">
        {{ props.row.fullname }}
      </b-table-column>
      <b-table-column field="pid" label="รหัสบัตรประชาชน" v-slot="props">
        {{ props.row.pid }}
      </b-table-column>
      <b-table-column field="phone" label="เบอร์ติดต่อ" v-slot="props">
        {{ props.row.phone }}
      </b-table-column>
      <b-table-column field="book" label="ยืนยัน" v-slot="props">
        <b-button v-if="props.row.myBooking == false"
                  icon-left="check-circle"
                  icon-pack="fas"
                  type="is-success"
                  @click="bookThis(props.row.id)">รับตรวจ</b-button>
        <b-button icon-left="times-circle" icon-pack="far" v-else type="is-danger" @click="withdraw(props.row.id)">ถอนตัว</b-button>
      </b-table-column>
    </b-table>
  </div>
</template>

<script>
import axios from "axios"
import {collection, doc, getDocs, getDoc, orderBy, query, updateDoc, where} from "firebase/firestore";
import {db} from "../firebase";
import moment from "moment";
import liff from "@line/liff";

moment.locale('th')

export default {
  name: "bookings",
  data () {
    return {
      records: [],
      loading: true,
      columns: [
        {
          field: 'datetime',
          label: 'วันที่ตรวจ',
        },
        {
          field: 'fullname',
          label: 'ชื่อผู้รับบริการ'
        },
        {
          field: 'phone',
          label: 'เบอร์ติดต่อ'
        },
      ]
    }
  },
  methods: {
    async withdraw(recordId) {
      const recordRef = doc(db, 'records', recordId)
      let querySnap = await getDoc(recordRef)
      this.$buefy.dialog.confirm({
        message: "ท่านต้องการยืนยันการถอนการให้บริการหรือไม่",
        onConfirm: () => {
          updateDoc(recordRef, {
            staff: {}
          }).then(() => {
            this.$buefy.toast.open({
              message: "ถอนการรับตรวจแล้ว",
              type: "is-success"
            })
            axios({
              method: "post",
              url: "https://mtc-hotline.herokuapp.com/book-confirm",
              data: {
                lineId: querySnap.data().lineId,
                message:"ขออภัย นักเทคนิคการแพทย์ขอยกเลิกการให้บริการ โปรดรอระบบจัดหารายใหม่ให้ท่าน"}
            })
            this.loadAsyncData()
          })
        }
      })
    },
    async bookThis(recordId) {
      const recordRef = doc(db, 'records', recordId)
      let querySnap = await getDoc(recordRef)
      this.$buefy.dialog.confirm({
        message: "ท่านต้องการยืนยันการให้บริการหรือไม่",
        onConfirm: () => {
          updateDoc(recordRef, {
            staff: {
              name: this.$store.state.user.name,
              license: this.$store.state.user.license,
              phone: this.$store.state.user.phone,
              lineId: this.$store.state.user.lineId
            }
          }).then(() => {
            this.$buefy.toast.open({
              message: "ลงวันตรวจเรียบร้อยแล้ว",
              type: "is-success"
            })
            axios({
              method: "post",
              url: "https://mtc-hotline.herokuapp.com/book-confirm",
              data: {
                lineId: querySnap.data().lineId,
                message: "ระบบได้รับการยืนยันจากนักเทคนิคการแพทย์สำหรับวันตรวจที่ท่านขอนัดหมายแล้ว"
              }
            })
            this.loadAsyncData()
          })
        }
      })
    },
    async loadAsyncData() {
      this.records = []
      this.loading = true
      const recordsRef = collection(db, 'records')
      let q = query(recordsRef)
      let querySnapshot = await getDocs(q, orderBy('datetime', 'desc'))
      this.loading = false
      for (let doc of querySnapshot.docs) {
        let d = doc.data()
        d.datetime = moment(d.datetime.toDate()).format('lll')
        d.id = doc.id
        if  (Object.keys(d.staff).length == 0 || d.staff.license == this.$store.state.user.license) {
          if (d.staff.license == this.$store.state.user.license) {
            d.myBooking = true
          } else {
            d.myBooking = false
          }
          this.records.push(d)
        }
      }
    }
  },
  async mounted() {
    if (!liff.isInClient()) {
      const userRef = collection(db, "staff")
      let q = query(userRef, where('lineId', '==', 'testaccount'))
      let querySnapshot = await getDocs(q)
      if (querySnapshot.empty) {
        this.$store.dispatch('updateLineProfile', { userId: 'testaccount'})
        this.$router.push({ name: 'staffForm' })
      }
      querySnapshot.forEach(doc => {
        this.$store.dispatch('updateUser', doc.data())
        this.loadAsyncData()
      })
    } else {
      liff.getProfile().then(async profile => {
        await this.$store.dispatch('updateLineProfile', profile)
        const userRef = collection(db, "staff")
        let q = query(userRef, where('lineId', '==', profile.userId))
        let querySnapshot = await getDocs(q)
        if (querySnapshot.empty) {
          await this.$router.push({name: 'staffForm'})
        } else {
          querySnapshot.forEach(doc => {
            this.$store.dispatch('updateUser', doc.data())
            this.loadAsyncData()
          })
        }
      })
    }
  }
}
</script>

<style scoped>

</style>