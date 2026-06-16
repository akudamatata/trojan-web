<template>
  <div class="setting-container">
    <div class="setting-header">
      <h2>{{ $t('navbar.setting') }}</h2>
      <p>配置 Trojan 管理系统的运行参数、系统规则及数据备份</p>
    </div>

    <el-tabs v-model="activeTab" class="modern-tabs">
      <!-- 常规设置 -->
      <el-tab-pane label="常规设置" name="general">
        <el-card class="setting-card">
          <template #header>
            <div class="card-title">常规运行设置</div>
          </template>
          
          <el-form label-position="top" class="setting-form">
            <el-form-item :label="$t('navbar.changeTitle')">
              <div class="form-row">
                <el-input v-model="title" :placeholder="$t('navbar.inputTitle')" class="flex-input" />
                <el-button type="primary" @click="handleLoginInfo()">保存标题</el-button>
              </div>
              <div class="item-tip">修改登录页面显示的系统名称标题。</div>
            </el-form-item>

            <el-divider class="setting-divider" />

            <el-form-item :label="$t('navbar.resetTitle')">
              <div class="form-row">
                <el-input-number v-model="resetDay" :min="0" :max="31" class="flex-input-number" />
                <el-button type="primary" @click="handleResetDay()">更新重置日</el-button>
              </div>
              <div class="item-tip">{{ $t('navbar.meanClose') }}。每月该号将自动清空所有用户的上传/下载流量数据。</div>
            </el-form-item>

            <el-divider class="setting-divider" />

            <el-form-item label="修改Web服务端口">
              <div class="form-row">
                <el-input-number v-model="webPort" :min="1" :max="65535" class="flex-input-number" />
                <el-button type="primary" @click="handleWebPort()">更新端口</el-button>
              </div>
              <div class="item-tip warning-tip">注意：修改端口后Web面板将重启，并使用新端口访问，请注意防火墙放行。</div>
            </el-form-item>

            <el-divider class="setting-divider" />

            <el-form-item label="服务器总流量限制">
              <div class="form-row">
                <el-input-number v-model="serverTotalQuota" :min="-1" class="flex-input-number" />
                <el-select v-model="serverQuotaUnit" placeholder="单位" style="width: 100px">
                  <el-option label="GB" value="GB" />
                  <el-option label="TB" value="TB" />
                </el-select>
                <el-button type="primary" @click="handleServerTotalQuota()">更新限制</el-button>
              </div>
              <div class="item-tip">设置服务器双向总流量限制（输入 -1 表示无限制）。用量到达 80% 会在首页进行红色预警。</div>
            </el-form-item>
          </el-form>
        </el-card>
      </el-tab-pane>

      <!-- 域名与证书 -->
      <el-tab-pane label="域名与证书" name="domain">
        <el-card class="setting-card">
          <template #header>
            <div class="card-title">域名绑定与 SSL 证书管理</div>
          </template>
          
          <el-form label-position="top" class="setting-form">
            <el-form-item label="分享链接伪装域名 (Camouflage Domain)">
              <div class="form-row">
                <el-input v-model="camouflageDomain" placeholder="例如: a.com" class="flex-input" />
                <el-button type="primary" @click="handleCamouflageDomain()">保存域名</el-button>
              </div>
              <div class="item-tip">用于生成各种分享链接时的服务器域名。若为空，生成链接时默认使用管理面板的访问域名（B.com），且不带 SNI 参数。</div>
            </el-form-item>

            <el-divider class="setting-divider" />

            <el-form-item label="SSL/TLS 证书状态与申请">
              <div class="cert-status-box" v-if="certInfo">
                <p><b>证书包含域名 (DNS Names):</b> 
                  <span class="cert-value" v-if="certInfo.dnsNames && certInfo.dnsNames.length > 0">
                    {{ certInfo.dnsNames.join(', ') }}
                  </span>
                  <span class="cert-value" v-else>{{ certInfo.subject || '未载入' }}</span>
                </p>
                <p><b>过期时间 (Expiry Date):</b> <span class="cert-value">{{ certInfo.expireTime || '未载入' }}</span> 
                  <el-tag size="small" :type="certInfo.leftDays > 15 ? 'success' : 'danger'" style="margin-left: 8px">
                    剩余 {{ certInfo.leftDays }} 天
                  </el-tag>
                </p>
                <p><b>证书物理路径 (Cert Path):</b> <span class="cert-value cert-path">{{ certInfo.certPath || '未载入' }}</span></p>
              </div>
              <div class="form-row" style="margin-top: 15px">
                <el-button type="warning" :loading="certLoading" @click="handleApplyCert()">自动申请/更新证书</el-button>
              </div>
              <div class="item-tip warning-tip">注意：点击申请后，系统会自动检测主域名 and 伪装域名，并临时停用 Nginx（释放 80 端口占用），调用 acme.sh 自动为您申请双域名证书并自动恢复分流配置。申请大约需要 1-2 分钟。</div>
            </el-form-item>
          </el-form>
        </el-card>
      </el-tab-pane>

      <!-- 安全设置 -->
      <el-tab-pane label="安全设置" name="security">
        <el-card class="setting-card">
          <template #header>
            <div class="card-title">{{ $t('navbar.passwordTitle') }}</div>
          </template>
          
          <el-form :model="form" :rules="registerRules" ref="form" label-position="top" class="setting-form max-w-form">
            <el-form-item prop="password1" label="新管理员密码">
              <el-input name="password1" type="password" v-model="form.password1" :placeholder="$t('inputPass')" show-password />
            </el-form-item>
            
            <el-form-item prop="password2" label="确认新密码">
              <el-input name="password2" type="password" v-model="form.password2" :placeholder="$t('inputPassAgain')" show-password />
            </el-form-item>

            <el-form-item class="mt-6">
              <el-button type="danger" @click="changePass()">重置密码并重新登录</el-button>
            </el-form-item>
          </el-form>
        </el-card>
      </el-tab-pane>

      <!-- 路由规则 -->
      <el-tab-pane label="路由规则" name="rules">
        <el-card class="setting-card">
          <template #header>
            <div class="card-title">Clash 路由分流规则</div>
          </template>
          
          <el-form label-position="top" class="setting-form">
            <el-form-item :label="$t('navbar.changeRules')">
              <el-input type="textarea" v-model="rules" :rows="16" :placeholder="$t('navbar.inputTitle')" class="terminal-textarea" />
            </el-form-item>

            <el-form-item class="btn-row">
              <el-button @click="resetClashRules()">{{ $t('reset') }}</el-button>
              <el-button type="primary" @click="handleClashRules()">{{ $t('ok') }}</el-button>
            </el-form-item>
          </el-form>
        </el-card>
      </el-tab-pane>

      <!-- 数据管理 -->
      <el-tab-pane label="备份与恢复" name="backup">
        <el-card class="setting-card">
          <template #header>
            <div class="card-title">数据导入与导出</div>
          </template>

          <div class="backup-section">
            <div class="backup-item">
              <div class="backup-info">
                <h3>导出数据 (CSV)</h3>
                <p>{{ $t('navbar.exportTip') }}</p>
              </div>
              <el-button type="primary" @click="downloadCsv()">{{ $t('navbar.exportCsv') }}</el-button>
            </div>

            <el-divider class="setting-divider" />

            <div class="backup-item">
              <div class="backup-info">
                <h3>导入数据 (CSV)</h3>
                <p>{{ $t('navbar.importTip') }}</p>
              </div>
              <el-upload accept=".csv" :action="uploadUrl" :on-success="uploadSuccess" :show-file-list="false">
                <el-button type="success">{{ $t('navbar.importCsv') }}</el-button>
              </el-upload>
            </div>
          </div>
        </el-card>
      </el-tab-pane>
    </el-tabs>

    <!-- 证书申请日志弹窗 -->
    <el-dialog title="证书申请详细日志" v-model="logVisible" width="60%">
      <div class="cert-log-console">
        <pre>{{ applyLog }}</pre>
      </div>
      <template #footer>
        <span class="dialog-footer">
          <el-button type="primary" @click="logVisible = false">关闭</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script>
import { ElMessage } from "element-plus"
import CryptoJS from 'crypto-js'
import { mapState } from 'vuex'
import { sleep } from '@/utils/common'
import { resetPass, check } from '@/api/permission'
import { setLoginInfo, getClashRules, setClashRules, resetClashRules, getWebPort, setWebPort, getCamouflageDomain, setCamouflageDomain, getCertInfo, applyCert } from '@/api/common'
import { getResetDay, updateResetDay, getTotalQuota, setTotalQuota } from '@/api/data'

export default {
    name: 'Setting',
    data() {
        const validatePass = (rule, value, callback) => {
            if (value.length < 5) {
                callback(new Error(this.$t('passLessError')))
            } else {
                callback()
            }
        }
        return {
            activeTab: 'general',
            title: '',
            camouflageDomain: '',
            certInfo: null,
            certLoading: false,
            logVisible: false,
            applyLog: '',
            webPort: 80,
            rules: '',
            resetDay: 1,
            serverTotalQuota: -1,
            serverQuotaUnit: 'GB',
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
            }
        }
    },
    computed: {
        ...mapState(['isAdmin']),
        uploadUrl() {
            return `${process.env.NODE_ENV === 'production' ? `${location.origin}` : 'api'}/trojan/import`
        }
    },
    created() {
        this.initData()
    },
    methods: {
        async initData() {
            await this.getTitle()
            await this.getCamouflageDomain()
            await this.getCertInfo()
            await this.getResetDay()
            await this.getWebPortData()
            await this.getRules()
            await this.getServerTotalQuota()
        },
        async getTitle() {
            const result = await check()
            this.title = result.data.title
        },
        async getCamouflageDomain() {
            const result = await getCamouflageDomain()
            this.camouflageDomain = result.Data || ''
        },
        async getCertInfo() {
            try {
                const result = await getCertInfo()
                if (result.Msg === 'success') {
                    this.certInfo = result.Data
                } else {
                    this.certInfo = null
                    console.warn(result.Msg)
                }
            } catch (e) {
                console.error(e)
            }
        },
        async handleApplyCert() {
            this.certLoading = true
            ElMessage({
                message: '开始申请证书，正在解除 80 端口占用并调用 acme.sh，请耐心等待 1-2 分钟...',
                type: 'warning',
                duration: 5000
            })
            try {
                const result = await applyCert()
                this.certLoading = false
                if (result.Msg === 'success') {
                    this.applyLog = result.Data.log
                    this.logVisible = true
                    if (result.Data.success) {
                        ElMessage({
                            message: '证书申请并部署成功！正在重启相关服务...',
                            type: 'success'
                        })
                        await this.getCertInfo()
                    } else {
                        ElMessage.error('证书申请失败，请查看日志详情')
                    }
                } else {
                    ElMessage.error(result.Msg)
                }
            } catch (e) {
                this.certLoading = false
                const errMsg = e && e.message ? e.message : '请求连接断开（服务已成功部署证书并正在重启，请稍后刷新页面）'
                ElMessage.error('证书申请请求出错: ' + errMsg)
            }
        },
        async handleCamouflageDomain() {
            const formData = new FormData()
            formData.set('domain', this.camouflageDomain)
            const result = await setCamouflageDomain(formData)
            if (result.Msg === 'success') {
                ElMessage({
                    message: '保存伪装域名成功',
                    type: 'success'
                })
            } else {
                ElMessage.error(result.Msg)
            }
        },
        async getResetDay() {
            const result = await getResetDay()
            this.resetDay = result.Data.resetDay
        },
        async handleResetDay() {
            const formData = new FormData()
            formData.set('day', this.resetDay)
            const result = await updateResetDay(formData)
            if (result.Msg === 'success') {
                if (this.resetDay === 0) {
                    ElMessage({
                        message: this.$t('navbar.closeResetSuccess'),
                        type: 'success'
                    })
                } else {
                    ElMessage({
                        message: this.$t('navbar.changeDaySuccess'),
                        type: 'success'
                    })
                }
            } else {
                ElMessage.error(result.Msg)
            }
        },
        async handleLoginInfo() {
            const formData = new FormData()
            formData.set('title', this.title)
            const result = await setLoginInfo(formData)
            if (result.Msg === 'success') {
                ElMessage({
                    message: this.$t('navbar.changeTitleSuccess'),
                    type: 'success'
                })
                document.title = this.title
                this.$store.commit('SET_TITLE', this.title)
            } else {
                ElMessage.error(result.Msg)
            }
        },
        async getRules() {
            const result = await getClashRules()
            this.rules = result.Data
        },
        async resetClashRules() {
            const result = await resetClashRules()
            if (result.Msg === 'success') {
                ElMessage({
                    message: this.$t('navbar.resetRulesSuccess'),
                    type: 'success'
                })
                this.rules = result.Data
            } else {
                ElMessage.error(result.Msg)
            }
        },
        async handleClashRules() {
            const formData = new FormData()
            formData.set('rules', this.rules)
            const result = await setClashRules(formData)
            if (result.Msg === 'success') {
                ElMessage({
                    message: this.$t('navbar.changeRulesSuccess'),
                    type: 'success'
                })
            } else {
                ElMessage.error(result.Msg)
            }
        },
        async getServerTotalQuota() {
            const result = await getTotalQuota()
            const totalBytes = result.Data.totalQuota
            if (totalBytes === -1) {
                this.serverTotalQuota = -1
                this.serverQuotaUnit = 'GB'
            } else {
                const GB = 1024 * 1024 * 1024
                const TB = 1024 * 1024 * 1024 * 1024
                if (totalBytes >= TB && totalBytes % TB === 0) {
                    this.serverTotalQuota = totalBytes / TB
                    this.serverQuotaUnit = 'TB'
                } else {
                    this.serverTotalQuota = totalBytes / GB
                    this.serverQuotaUnit = 'GB'
                }
            }
        },
        async handleServerTotalQuota() {
            let bytes = this.serverTotalQuota
            if (bytes !== -1) {
                const GB = 1024 * 1024 * 1024
                const TB = 1024 * 1024 * 1024 * 1024
                if (this.serverQuotaUnit === 'GB') {
                    bytes = bytes * GB
                } else if (this.serverQuotaUnit === 'TB') {
                    bytes = bytes * TB
                }
            }
            const formData = new FormData()
            formData.set('quota', bytes)
            const result = await setTotalQuota(formData)
            if (result.Msg === 'success') {
                ElMessage({
                    message: '更新服务器总流量限制成功',
                    type: 'success'
                })
                this.getServerTotalQuota()
            } else {
                ElMessage.error(result.Msg)
            }
        },
        async getWebPortData() {
            const result = await getWebPort()
            this.webPort = result.Data.port
        },
        async handleWebPort() {
            const formData = new FormData()
            formData.set('port', this.webPort)
            const result = await setWebPort(formData)
            if (result.Msg === 'success') {
                ElMessage({
                    message: '修改Web端口成功，正在重启Web服务，请稍后使用新端口访问',
                    type: 'success'
                })
                await sleep(2000)
                const newOrigin = location.protocol + '//' + location.hostname + ':' + this.webPort
                location.href = newOrigin
            } else {
                ElMessage.error(result.Msg)
            }
        },
        async changePass() {
            const formData = new FormData()
            if (this.form.password1 !== this.form.password2) {
                ElMessage.error(this.$t('passDifferentError'))
                return
            } else {
                formData.set('password', CryptoJS.SHA224(this.form.password1).toString())
            }
            try {
                await resetPass(formData)
                ElMessage({
                    message: this.$t('navbar.resetSuccess'),
                    type: 'success'
                })
                await sleep(1000 * 2)
                this.$store.commit('LOGIN_OUT')
                this.$router.replace('/login').catch()
            } catch (e) {
                console.log(e)
            }
        },
        downloadCsv() {
            const prefix = process.env.NODE_ENV === 'production' ? `${location.origin}` : 'api'
            const downloadUrl = `${prefix}/trojan/export?token=${this.$store.state.UserToken}`
            window.open(downloadUrl)
        },
        uploadSuccess(res) {
            if (res.Msg === 'success') {
                ElMessage({
                    message: this.$t('navbar.importSuccess'),
                    type: 'success'
                })
            } else {
                ElMessage.error(res.Msg)
            }
        }
    }
}
</script>

<style lang="scss" scoped>
.setting-container {
  padding: 24px;
  background-color: var(--el-bg-color-page);
  min-height: calc(100vh - 50px);
}

.setting-header {
  margin-bottom: 24px;
  h2 {
    font-size: 22px;
    font-weight: 600;
    color: var(--el-text-color-primary);
    margin: 0 0 6px 0;
  }
  p {
    font-size: 14px;
    color: var(--el-text-color-secondary);
    margin: 0;
  }
}

.modern-tabs {
  ::v-deep(.el-tabs__header) {
    margin-bottom: 24px;
    border-bottom: 1px solid var(--el-border-color);
  }
  ::v-deep(.el-tabs__nav-wrap::after) {
    display: none;
  }
  ::v-deep(.el-tabs__item) {
    font-size: 15px;
    color: var(--el-text-color-secondary) !important;
    padding: 0 20px !important;
    height: 44px;
    line-height: 44px;
    &:hover {
      color: var(--el-color-primary) !important;
    }
    &.is-active {
      color: var(--el-color-primary) !important;
      font-weight: 600;
    }
  }
  ::v-deep(.el-tabs__active-bar) {
    height: 2px;
    background-color: var(--el-color-primary);
  }
}

.setting-card {
  background-color: #111827 !important;
  border: 1px solid #1f2937 !important;
  border-radius: 12px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
  margin-bottom: 24px;

  .card-title {
    font-size: 16px;
    font-weight: 600;
    color: var(--el-text-color-primary);
  }
}

.setting-form {
  padding: 8px 16px;

  ::v-deep(.el-form-item__label) {
    color: var(--el-text-color-regular) !important;
    font-size: 14px;
    font-weight: 600;
    margin-bottom: 8px;
  }
}

.max-w-form {
  max-width: 500px;
}

.form-row {
  display: flex;
  align-items: center;
  gap: 16px;
  width: 100%;
}

.flex-input {
  max-width: 400px;
}

.flex-input-number {
  width: 180px !important;
}

.item-tip {
  font-size: 12px;
  color: var(--el-text-color-secondary);
  margin-top: 6px;
  line-height: 1.4;

  &.warning-tip {
    color: var(--el-color-warning);
  }
}

.setting-divider {
  margin: 24px 0 !important;
  border-top-color: var(--el-border-color) !important;
}

.btn-row {
  margin-top: 20px;
  display: flex;
  justify-content: flex-start;
  gap: 12px;
}

.terminal-textarea {
  ::v-deep(.el-textarea__inner) {
    background-color: #05070c !important;
    border: 1px solid #1f2937 !important;
    color: #10b981 !important;
    font-family: 'Consolas', 'Courier New', monospace;
    font-size: 13px;
    line-height: 1.5;
    padding: 12px;
    border-radius: 8px;
    
    &:focus {
      border-color: var(--el-color-primary) !important;
    }
  }
}

.backup-section {
  padding: 12px 16px;
}

.backup-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 24px;
  
  .backup-info {
    h3 {
      font-size: 15px;
      font-weight: 600;
      color: var(--el-text-color-primary);
      margin: 0 0 4px 0;
    }
    p {
      font-size: 13px;
      color: var(--el-text-color-secondary);
      margin: 0;
    }
  }
}

.cert-log-console {
  background-color: #0d1117;
  color: #39c5bb;
  padding: 15px;
  border-radius: 8px;
  max-height: 400px;
  overflow-y: auto;
  font-family: 'Consolas', 'Courier New', monospace;
  white-space: pre-wrap;
  word-break: break-all;
}

.cert-status-box {
  background-color: rgba(255, 255, 255, 0.02);
  border: 1px solid var(--el-border-color);
  padding: 15px 20px;
  border-radius: 8px;
  margin-top: 10px;
  margin-bottom: 15px;
  max-width: 600px;
  
  p {
    margin: 8px 0;
    font-size: 13px;
    color: var(--el-text-color-regular);
    
    b {
      color: var(--el-text-color-primary);
      width: 200px;
      display: inline-block;
    }
    
    .cert-value {
      color: #10b981;
      font-weight: 500;
      
      &.cert-path {
        color: var(--el-text-color-secondary);
        font-family: monospace;
      }
    }
  }
}
</style>
