<template>
  <div class="register-container">
    <el-row>
      <el-col :span="4" :offset="10">
        <el-form label-width="80px">
          <el-form-item label="用户名">
            <el-input v-model="user.username"/>
          </el-form-item>
          <el-form-item label="昵称">
            <el-input v-model="user.nickname"/>
          </el-form-item>
          <el-form-item label="邮箱">
            <el-input v-model="user.email"/>
          </el-form-item>
          <el-form-item label="密码">
            <el-input v-model="user.password" type="password"/>
          </el-form-item>
          <el-form-item label="确认密码">
            <el-input v-model="user.confirmPassword" type="password"/>
          </el-form-item>
          <el-form-item>
            <el-button type="primary" style="width: 100%" @click="confirm()">立即注册</el-button>
          </el-form-item>
        </el-form>
      </el-col>
    </el-row>
  </div>
</template>

<script>
import { register } from '@/api/user'
import { Message } from 'element-ui'

export default {
  name: 'Register',
  components: { },
  data() {
    return {
      user: {
        username: null,
        password: null,
        confirmPassword: null,
        email: null,
        phone: null,
        nickname: null
      }
    }
  },
  watch: {
    $route: {
      handler: function(route) {
        this.redirect = route.query && route.query.redirect
      },
      immediate: true
    }
  },
  methods: {
    confirm() {
      if (!this.checkData()) {
        return
      }
      console.log(this.user)
      if (!this.checkPassword()) {
        return
      }
      register(this.user).then(response => {
        if (response) {
          this.$notify({
            title: '成功',
            message: response.data,
            type: 'success',
            duration: 2000
          })
          this.resetUser()
          this.$router.push('/login')
        }
      })
    },
    resetUser() {
      this.user = {
        username: null,
        password: null,
        confirmPassword: null,
        email: null,
        phone: null,
        nickname: null
      }
    },
    checkData() {
      let msg = ''
      if (!this.user.username || this.user.username === '') {
        msg = msg + '用户名,'
      }
      if (!this.user.password || this.user.password === '') {
        msg = msg + '密码,'
      }
      if (msg !== '') {
        Message({
          message: msg.substring(0, msg.length - 1) + '不能为空',
          type: 'error',
          duration: 5 * 1000
        })
        return false
      }
      return true
    },
    checkPassword() {
      if (this.user.password !== this.user.confirmPassword) {
        Message({
          message: '密码不一致，请重新输入',
          type: 'error',
          duration: 5 * 1000
        })
        return false
      }
      return true
    }
  }
}
</script>

<style rel="stylesheet/scss" lang="scss" scoped>
  .register-container {
    padding-top: 200px;
  }
</style>
