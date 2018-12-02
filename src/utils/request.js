import axios from 'axios'
import { Message } from 'element-ui'
import store from '@/store'
import router from '@/router'

// create an axios instance
const service = axios.create({
  baseURL: process.env.BASE_API, // api 的 base_url
  timeout: 5000, // request timeout,
  headers: {
    'content-type': 'application/json'
  }
})

// request interceptor
service.interceptors.request.use(
  config => {
    // Do something before request is sent
    if (store.getters.token) {
      console.log(store.getters.token)
      // 让每个请求携带token-- ['X-Token']为自定义key 请根据实际情况自行修改
      config.headers['security_token'] = store.getters.token
    }
    return config
  },
  error => {
    // Do something with request error
    console.log(error) // for debug
    Promise.reject(error)
  }
)

// response interceptor
service.interceptors.response.use(
  response => {
    switch (response.data.code) {
      case '1':
        return response.data
      case '1003':
        Message({
          message: response.data.msg,
          type: 'error',
          duration: 5 * 1000
        })
        router.push('/login')
        return Promise.reject('error').catch(a => {})
      default:
        Message({
          message: response.data.msg,
          type: 'error',
          duration: 5 * 1000
        })
        return Promise.reject('error').catch(a => {})
    }
  },
  error => {
    Message({
      message: error.message,
      type: 'error',
      duration: 5 * 1000
    })
    return Promise.reject(error).catch(e => {})
  }
)

export default service
