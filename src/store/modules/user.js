import { getToken, removeToken } from '@/utils/auth'

const user = {
  state: {
    user: sessionStorage.getItem('user'),
    status: '',
    code: '',
    token: getToken(),
    name: '',
    avatar: '',
    introduction: '',
    setting: {
      articlePlatform: []
    }
  },

  mutations: {
    SET_TOKEN: (state, token) => {
      state.token = token
    },
    SET_USER: (state, user) => {
      state.user = user
    }
  },

  actions: {
    // 用户名登录
    LoginByUsername({ commit }) {
      const token = sessionStorage.getItem('token')
      const user = sessionStorage.getItem('user')
      commit('SET_TOKEN', token)
      commit('SET_USER', user)
    },

    // 登出
    LogOut({ commit, state }) {
      sessionStorage.removeItem('token')
      sessionStorage.removeItem('user')
      commit('SET_TOKEN', '')
      commit('SET_USER', '')
    },

    // 前端 登出
    FedLogOut({ commit }) {
      commit('SET_TOKEN', '')
      removeToken()
    }
  }
}

export default user
