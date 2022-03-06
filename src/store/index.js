import Vuex from 'vuex'
import Vue from 'vue'

Vue.use(Vuex)

const store = new Vuex.Store({
    state: {
        user: {
            lineId: null,
            pid: null,
            name: null,
            pictureUrl: null,
            title: null,
            license: null,
            phone: null,
        },
        lineProfile: {}
    },
    getters: {
        fullname: state => {
            return state.user.title + state.user.name
        }
    },
    mutations: {
        SET_USER(state, user) {
            state.user = user
        },
        SET_LINE_PROFILE(state, profile) {
            state.lineProfile = profile
        },
        SET_LINE_ID(state, lineId) {
            state.user.lineId = lineId
        },
    },
    actions: {
        updateUser({ commit }, user) {
            commit("SET_USER", user)
        },
        updateLineProfile({ commit }, profile) {
            commit("SET_LINE_PROFILE", profile)
        },
        updateLineId({ commit }, lineId) {
            commit("SET_LINE_ID", lineId)
        },
    },
})

export default store