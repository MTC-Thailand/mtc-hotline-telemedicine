<template>
  <div class="container">
    <div class="has-text-centered">
      <figure class="image is-inline-block is-96x96">
        <img :src="$store.state.user.pictureUrl" class="is-rounded">
      </figure>
    </div>
    <b-loading :is-full-page="true" v-model="isLoading" :can-cancel="true"></b-loading>
    <h1 class="title is-size-3 has-text-centered">ประวัติการจองของท่าน</h1>
    <b-notification type="is-light is-info">
      โปรดศึกษาการเตรียมตัวก่อนทำการตรวจ <router-link :to="{ name: 'Preparation' }">หน้าเพจการเตรียมตัว</router-link>
    </b-notification>
    <b-notification type="is-light is-warning">
      ท่านสามารถตรวจสอบใบอนุญาตของนักเทคนิคการแพทย์ได้ที่ <a href="http://www.mtc.or.th">www.mtc.or.th</a>
    </b-notification>
    <b-table :data="records" :loading="loading">
      <b-table-column field="datetime" label="วันที่ต้องการตรวจ" v-slot="props">
        {{ props.row.datetime }}
      </b-table-column>
      <b-table-column field="bookDateTime" label="นัดหมายเมื่อ" v-slot="props">
        {{ props.row.bookDateTime }}
      </b-table-column>
      <b-table-column field="staffName" label="นักเทคนิคการแพทย์" v-slot="props">
        {{ props.row.staffName }}
      </b-table-column>
      <b-table-column field="license" label="หมายเลขใบอนุญาต" v-slot="props">
        {{ props.row.license }}
      </b-table-column>
      <b-table-column field="staffPhone" label="เบอร์ติดต่อ" v-slot="props">
        {{ props.row.staffPhone }}
      </b-table-column>
      <b-table-column field="delete" label="ยกเลิก" v-slot="props">
        <button class="button is-danger" @click="cancel(props.row.id)">ยกเลิก</button>
      </b-table-column>
    </b-table>
    <hr>
    <h1 class="subtitle is-size-4 has-text-centered">กรุณาเลือกวันและเวลาตรวจ</h1>
    <div class="has-text-centered">
      <b-field>
        <b-datetimepicker :mobile-native="true" is-medium locale="th" v-model="datetime" inline></b-datetimepicker>
      </b-field>
      <b-field class="is-grouped  is-grouped-centered">
        <b-button type="is-success" @click="book">จอง</b-button>
      </b-field>
    </div>
  </div>
</template>

<script>
import {collection, deleteDoc, getDocs, query, where, orderBy, addDoc, getDoc, doc} from "firebase/firestore";
import moment from 'moment'
import {db} from "../firebase";
import liff from "@line/liff";
import axios from "axios";

moment.locale('th')

export default {
  name: "Records",
  data () {
    return {
      records: [],
      loading: false,
      isLoading: true,
      datetime: new Date(),
    }
  },
  methods: {
    cancel (recordId) {
      this.$buefy.dialog.confirm({
        message: "ท่านต้องการยืนยันยกเลิกการนัดหมายหรือไม่",
        onConfirm: async () => {
          let docRef = doc(db, 'records', recordId)
          let querySnapshot = await getDoc(docRef)
          if (querySnapshot.exists) {
            await deleteDoc(docRef)
            axios({
              method: "post",
              url: "https://mtc-hotline.herokuapp.com/book-confirm",
              data: {
                lineId: querySnapshot.data().staff.lineId,
                message:"ขออภัย " + querySnapshot.data().fullname + " ขอยกเลิกการนัดหมาย กรุณาตรวจสอบข้อมูลของท่านอีกครั้ง"}
            })
            this.loadAsyncData()
            this.$buefy.dialog.alert({
              title: "ยกเลิกการนัดหมาย",
              message: "ยกเลิกการนัดหมายเรียบร้อยแล้ว"
            })
          }
        }
      })
    },
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
        pid: this.$store.state.user.pid,
        fullname: this.$store.getters.fullname,
        phone: this.$store.state.user.phone,
        bookDateTime: new Date(),
        confirmed: false,
        cancelled: false,
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
          d.staffName = d.staff.name
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
      this.isLoading = false
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
        this.isLoading = false
      })
    }
  }
}
</script>

<style scoped>

</style>