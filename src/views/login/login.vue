<template>
  <div class="login-container">
    <el-form ref="loginForm" :model="loginForm" class="login-form" autocomplete="on" label-position="left">

      <div class="title-container">
        <h3 class="title"> {{title}} </h3>
      </div>

      <el-form-item prop="username">
        <span class="svg-container">
          <svg-icon icon-class="user" />
        </span>
        <el-input
          ref="username"
          v-model="loginForm.username"
          placeholder="Username"
          name="username"
          type="text"
          tabindex="1"
          auto-complete="on"
        />
      </el-form-item>

      <el-tooltip v-model:visible="capsTooltip" content="Caps lock is On" placement="right" manual>
        <el-form-item prop="password">
          <span class="svg-container">
            <svg-icon icon-class="password" />
          </span>
          <el-input
            :key="passwordType"
            ref="password"
            v-model="loginForm.password"
            :type="passwordType"
            placeholder="Password"
            name="password"
            tabindex="2"
            auto-complete="on"
            @keyup="checkCapslock"
            @blur="capsTooltip = false"
            @keyup.enter="handleLogin"
          />
          <span class="show-pwd" @click="showPwd">
            <svg-icon :icon-class="passwordType === 'password' ? 'eye' : 'eye-open'" />
          </span>
        </el-form-item>
      </el-tooltip>

      <el-button :loading="loading" type="primary" style="width:100%;margin-bottom:30px;" @click.prevent="handleLogin">{{ $t('login') }}</el-button>
    </el-form>
  </div>
</template>

<script>
import { mapState } from 'vuex'
import CryptoJS from 'crypto-js'
import { check, login } from '@/api/permission'
export default {
    data() {
        return {
            loginForm: {
                username: '',
                password: ''
            },
            loading: false,
            capsTooltip: false,
            passwordType: 'password',
            title: ''
        }
    },
    created() {
        document.title = this.docTitle
        check().then((res) => {
            if (res.code === 201) {
                this.$router.replace('/register').catch()
            } else {
                this.title = res.data.title
                document.title = this.title
                this.$store.commit('SET_TITLE', this.title)
            }
        })
    },
    computed: {
        ...mapState(['docTitle'])
    },
    mounted() {
        this.$refs.password.focus()
    },
    methods: {
        showPwd() {
            if (this.passwordType === 'password') {
                this.passwordType = ''
            } else {
                this.passwordType = 'password'
            }
            this.$nextTick(() => {
                this.$refs.password.focus()
            })
        },
        checkCapslock(e) {
            const { key } = e
            this.capsTooltip = key && key.length === 1 && (key >= 'A' && key <= 'Z')
        },
        async handleLogin() {
            if (this.loginForm.username === '' || this.loginForm.password === '') {
                this.$message.error(this.$t('inputNotNull'))
                return
            }
            const loginInfo = Object.assign({}, this.loginForm)
            loginInfo.password = CryptoJS.SHA224(this.loginForm.password).toString()
            const data = await login(loginInfo)
            const token = data.token
            let isAdmin = false
            if (this.loginForm.username === 'admin') {
                isAdmin = true
            }
            this.$store.commit('SET_ADMIN', isAdmin)
            this.$store.commit('LOGIN_IN', token)
            this.$router.replace('/').catch()
        }
    }
}
</script>

<style lang="scss">
$light_gray:#fff;
$cursor: #fff;

.login-container {
  .el-input {
    height: 48px;
    width: 90%;
    position: static;

    .el-input__wrapper {
      padding: 0;
      box-shadow: none;
      background: transparent !important;
    }

    input {
      background: transparent !important;
      border: 0px;
      -webkit-appearance: none;
      border-radius: 0px;
      padding: 12px 5px 12px 15px;
      color: $light_gray;
      height: 48px;
      caret-color: $cursor;

      &:-webkit-autofill {
        box-shadow: 0 0 0px 1000px #1a202c inset !important;
        -webkit-text-fill-color: $cursor !important;
      }
    }
  }

  .el-form-item {
    border: 1px solid rgba(255, 255, 255, 0.08) !important;
    background: rgba(0, 0, 0, 0.25) !important;
    border-radius: 10px !important;
    color: #454545;
    margin-bottom: 20px !important;
    transition: border-color 0.3s ease !important;

    &:hover {
      border-color: rgba(99, 102, 241, 0.4) !important;
    }
  }
}
</style>

<style lang="scss" scoped>
.login-container {
  min-height: 100%;
  width: 100%;
  background-color: #030712;
  // Beautiful glowing gradient spots
  background-image: 
    radial-gradient(circle at 10% 20%, rgba(99, 102, 241, 0.1) 0%, transparent 40%),
    radial-gradient(circle at 90% 80%, rgba(139, 92, 246, 0.1) 0%, transparent 40%);
  overflow: hidden;
  display: flex;
  justify-content: center;
  align-items: center;

  .login-form {
    position: relative;
    width: 460px;
    max-width: 90%;
    padding: 40px;
    background: rgba(17, 24, 39, 0.7);
    backdrop-filter: blur(20px);
    border: 1px solid rgba(255, 255, 255, 0.05);
    border-radius: 20px;
    box-shadow: 0 20px 50px rgba(0, 0, 0, 0.4);
  }

  .svg-container {
    padding: 6px 5px 6px 15px;
    color: #9ca3af;
    vertical-align: middle;
    width: 35px;
    display: inline-block;
  }

  .title-container {
    position: relative;
    margin-bottom: 40px;

    .title {
      font-size: 24px;
      // Gradient text
      background: linear-gradient(135deg, #a5b4fc 0%, #6366f1 100%);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      margin: 0px auto;
      text-align: center;
      font-weight: 700;
      letter-spacing: 1px;
    }
  }

  .show-pwd {
    position: absolute;
    right: 12px;
    top: 10px;
    font-size: 16px;
    color: #9ca3af;
    cursor: pointer;
    user-select: none;
    transition: color 0.2s;

    &:hover {
      color: #6366f1;
    }
  }
}
</style>

