<template>
  <div class="container">
    <div class="has-text-centered">
      <figure class="image is-inline-block is-96x96">
        <img :src="$store.state.user.pictureUrl" class="is-rounded">
      </figure>
    </div>
    <h1 class="title is-size-6 has-text-centered">ยินดีต้อนรับ {{ $store.getters.fullname }}</h1>
    <h1 class="subtitle is-size-6 has-text-centered">กรุณาเลือกวันและเวลาตรวจ</h1>
    <b-field>
      <b-datetimepicker :mobile-native="true" is-medium locale="th" v-model="datetime" inline></b-datetimepicker>
    </b-field>
    <b-field class="is-grouped  is-grouped-centered">
      <b-button type="is-success" @click="book">จอง</b-button>
    </b-field>
    <b-notification type="is-light is-warning">
      ท่านสามารถตรวจสอบใบอนุญาตของนักเทคนิคการแพทย์ได้ที่ <a href="http://www.mtc.or.th">www.mtc.or.th</a>
    </b-notification>
    <h1 class="title is-size-6 has-text-centered">ประวัติการจอง</h1>
    <b-table :data="records" :columns="columns" :loading="loading"></b-table>
  </div>
</template>

<script>
import {collection, getDocs, query, where, orderBy, addDoc} from "firebase/firestore";
import moment from 'moment'
import {db} from "../firebase";
import liff from "@line/liff";

moment.locale('th')

export default {
  name: "Records",
  data () {
    return {
      records: [],
      loading: false,
      datetime: new Date(),
      columns: [
        {
          field: 'datetime',
          label: 'วันที่ตรวจ',
        },
        {
          field: 'bookDateTime',
          label: 'วันที่ทำการจอง'
        },
        {
          field: 'staffName',
          label: 'นักเทคนิคการแพทย์'
        },
        {
          field: 'license',
          label: 'หมายเลขใบอนุญาต'
        },
        {
          field: 'staffPhone',
          label: 'เบอร์ติดต่อ'
        },
      ]
    }
  },
  methods: {
    alert () {
      this.$buefy.dialog.alert({
        title: 'บันทึกการจองเรียบร้อย',
        message: 'กรุณารอการยืนยันจากนักเทคนิคการแพทย์',
        confirmText: 'รับทราบ'
      })
    },
    book () {
      const recordsRef = collection(db, 'records')
      let bookData = {
        lineId: this.$store.state.user.lineId,
        datetime: this.datetime,
        fullname: this.$store.getters.fullname,
        phone: this.$store.state.user.phone,
        bookDateTime: new Date(),
        confirmed: false,
        staff: {},
      }
      addDoc(recordsRef, bookData).then(()=>{
        this.alert()
        this.loadAsyncData()
      })
    },
    async loadAsyncData () {
      this.loading = true
      this.records = []
      const recordsRef = collection(db, 'records')
      let q = query(recordsRef,
          where('lineId', '==', this.$store.state.user.lineId),
          orderBy('bookDateTime', 'desc'))
      let querySnapshot = await getDocs(q)
      for (let doc of querySnapshot.docs) {
        let d = doc.data()
        d.datetime = moment(d.datetime.toDate()).format('lll')
        d.bookDateTime = moment(d.bookDateTime.toDate()).fromNow()
        d.id = doc.id
        if  (Object.keys(d.staff).length > 0) {
          d.staffName = d.staff.fullname
          d.license = d.staff.license
          d.staffPhone = d.staff.phone
        } else {
          d.staffName = ''
          d.license = ''
          d.staffPhone = ''
        }
        this.records.push(d)
      }
      this.loading = false
    },
  },
  async mounted() {
    if (!liff.isInClient()) {
      const userRef = collection(db, "users")
      let q = query(userRef, where('lineId', '==', 'testaccount'))
      let querySnapshot = await getDocs(q)
      querySnapshot.forEach(doc => {
        this.$store.dispatch('updateUser', doc.data())
        this.loadAsyncData()
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
          await this.$router.push({name: 'userForm'})
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