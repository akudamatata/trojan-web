<template>
  <div class="register-container">
    <el-form class="register-form" :model="form" :rules="registerRules" ref="form" label-position="left">
      <div class="title-container">
        <h3 class="title">
          <template v-for="(item, idx) in parsedTitle" :key="idx">
            <span v-if="item.isEmoji" class="emoji-text">{{ item.text }}</span>
            <span v-else class="gradient-text">{{ item.text }}</span>
          </template>
        </h3>
      </div>
      <el-form-item prop="password1">
        <span class="svg-container">
          <svg-icon icon-class="password" />
        </span>
        <el-input name="password1" :type="pwdType" v-model="form.password1" :placeholder="$t('inputPass')" show-password/>
      </el-form-item>
      <el-form-item prop="password2">
        <span class="svg-container">
          <svg-icon icon-class="password" />
        </span>
        <el-input name="password2" :type="pwdType" @keyup.enter="register" v-model="form.password2" :placeholder="$t('inputPassAgain')" show-password/>
      </el-form-item>
      <el-button type="primary" style="width:100%;height:48px;border-radius:10px;font-size:16px;font-weight:600;margin-bottom:30px;background: linear-gradient(135deg, #6366f1 0%, #4f46e5 100%);border: none;" :loading="loading" @click.prevent="register">
        {{ $t('register') }}
      </el-button>
      <div v-if="footer" class="register-footer">{{ footer }}</div>
    </el-form>
  </div>
</template>

<script>
import { mapState } from 'vuex'
import { register, check } from '@/api/permission'
import CryptoJS from 'crypto-js'
export default {
    data() {
        const validatePass = (rule, value, callback) => {
            if (value.length < 5) {
                callback(new Error(this.$t('passLessError')))
            } else {
                callback()
            }
        }
        return {
            form: {
                password1: '',
                password2: ''
            },
            registerRules: {
                password1: [
                    { required: true, trigger: 'blur', validator: validatePass }
                ],
                password2: [
                    { required: true, trigger: 'blur', validator: validatePass }
                ]
            },
            loading: false,
            pwdType: 'password',
            title: '',
            footer: ''
        }
    },
    computed: {
        ...mapState(['docTitle']),
        parsedTitle() {
            const titleVal = this.title || this.$t('setupPass')
            try {
                const parts = titleVal.split(/(\p{Extended_Pictographic})/gu)
                return parts.map(part => {
                    return {
                        text: part,
                        isEmoji: part ? /(\p{Extended_Pictographic})/u.test(part) : false
                    }
                }).filter(item => item.text !== '')
            } catch (e) {
                return [{ text: titleVal, isEmoji: false }]
            }
        }
    },
    created() {
        document.title = this.docTitle
        check().then((res) => {
            if (res.code === 200) {
                this.$store.commit('LOGIN_OUT')
                this.$router.replace('/login').catch()
            } else if (res.data) {
                this.title = res.data.title || ''
                this.footer = res.data.footer || ''
                if (this.title) {
                    document.title = this.title
                }
            }
        })
    },
    methods: {
        async register() {
            const formData = new FormData()
            if (this.form.password1 !== this.form.password2) {
                this.$message.error(this.$t('passDifferentError'))
                return
            } else {
                formData.set('password', CryptoJS.SHA224(this.form.password1).toString())
            }
            await register(formData)
            this.$router.replace('/login').catch()
        }
    }
}
</script>

<style lang="scss">
$light_gray:#fff;
$cursor: #fff;

.register-container {
  .el-input {
    height: 48px;
    width: 90%;
    position: static;

    .el-input__wrapper {
      padding: 0;
      box-shadow: none !important;
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
.register-container {
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

  .register-form {
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
      margin: 0px auto;
      text-align: center;
      font-weight: 700;
      letter-spacing: 1px;

      .gradient-text {
        background: linear-gradient(135deg, #a5b4fc 0%, #6366f1 100%);
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
      }

      .emoji-text {
        -webkit-text-fill-color: initial;
        background: none;
      }
    }
  }

  .register-footer {
    text-align: center;
    font-size: 12px;
    color: #9ca3af;
    opacity: 0.6;
    margin-top: 10px;
    letter-spacing: 0.5px;
  }
}
</style>
