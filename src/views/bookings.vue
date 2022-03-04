<template>
  <div class="container">
    <h1 class="title is-size-5 has-text-centered">{{ $store.state.user.name }}</h1>
    <h1 class="subtitle is-size-5 has-text-centered">ท.น.{{ $store.state.user.license }}</h1>
    <b-table :data="records" :loading="loading">
      <b-table-column field="datetime" label="วันที่ตรวจ" v-slot="props">
        {{ props.row.datetime }}
      </b-table-column>
      <b-table-column field="fullname" label="ผู้รับบริการ" v-slot="props">
        {{ props.row.fullname }}
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
    <pre>
      {{ $store.state.user }}
    </pre>
  </div>
</template>

<script>
import {collection, doc, getDocs, orderBy, query, updateDoc, where} from "firebase/firestore";
import {db} from "../firebase";
import moment from "moment";
import liff from "@line/liff";

moment.locale('th')

export default {
  name: "bookings",
  data () {
    return {
      records: [],
      loading: false,
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
    withdraw (recordId) {
      const recordRef = doc(db, 'records', recordId)
      updateDoc(recordRef, {
        staff: {}
      }).then(()=>{
        this.$buefy.toast.open({
          message: "ถอนการรับตรวจแล้ว",
          type: "is-success"
        })
        this.loadAsyncData()
      })
    },
    bookThis (recordId) {
      const recordRef = doc(db, 'records', recordId)
      updateDoc(recordRef, {
        staff: {
          name: this.$store.state.user.name,
          license: this.$store.state.user.license,
          phone: this.$store.state.user.phone
        }
      }).then(()=>{
        this.$buefy.toast.open({
          message: "ลงวันตรวจเรียบร้อยแล้ว",
          type: "is-success"
        })
        this.loadAsyncData()
      })
    },
    async loadAsyncData() {
      this.records = []
      this.loading = true
      const recordsRef = collection(db, 'records')
      let q = query(recordsRef)
      let querySnapshot = await getDocs(q, orderBy('datetime', 'desc'))
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
        this.loading = false
      }
    }
  },
  async mounted() {
    if (!liff.isInClient()) {
      const userRef = collection(db, "staff")
      let q = query(userRef, where('lineId', '==', 'testaccount'))
      let querySnapshot = await getDocs(q)
      if (querySnapshot.empty) {
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