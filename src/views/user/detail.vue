<template>
  <div class="user-detail-container">
    <!-- Back Button & Header -->
    <div class="header-section">
      <el-button :icon="ArrowLeft" @click="goBack" class="back-btn">{{ $t('detail.back') }}</el-button>
      <h2 class="page-title">{{ $t('detail.title') }}: <span class="username-highlight">{{ username }}</span></h2>
    </div>

    <!-- P2P/BT Alert Warning -->
    <el-alert
      v-if="hasAbuseBehavior"
      :title="$t('detail.abuseWarning')"
      type="error"
      effect="dark"
      show-icon
      style="margin-bottom: 24px; border-radius: 8px;"
    />

    <!-- Row 1: Account Info, Quick Actions, Subscription Generator -->
    <el-row :gutter="20" class="info-row">
      <!-- Card 1: Account Info -->
      <el-col :xs="24" :sm="24" :md="isAdmin ? 8 : 12">
        <el-card class="stat-card account-card">
          <template #header>
            <div class="card-header">
              <span>{{ $t('detail.accountStatus') }}</span>
              <el-tag :type="accountStatusType">{{ accountStatusText }}</el-tag>
            </div>
          </template>
          <div class="card-body">
            <div class="info-item">
              <span class="info-label">{{ $t('detail.expiryDate') }}:</span>
              <span class="info-value">{{ detailData.expiryDate || $t('detail.forever') }}</span>
            </div>
            <div class="info-item" v-if="detailData.useDays > 0">
              <span class="info-label">{{ $t('detail.limitDays') }}:</span>
              <span class="info-value">{{ detailData.useDays }} {{ $t('user.days') || '天' }}</span>
            </div>
            <div class="info-item">
              <span class="info-label">{{ $t('detail.abuseDetect') }}:</span>
              <span class="info-value">
                <el-tag :type="hasAbuseBehavior ? 'danger' : 'success'" size="small" effect="dark">
                  {{ hasAbuseBehavior ? $t('detail.abuseInfo', { n: abuseDomainsCount }) : $t('detail.noAbuse') }}
                </el-tag>
              </span>
            </div>
            
            <el-divider style="margin: 12px 0;" />
            
            <div class="progress-section">
              <div class="progress-labels">
                <span>{{ $t('detail.usedPercent') }}:</span>
                <span>{{ percentUsed }}%</span>
              </div>
              <el-progress 
                :percentage="percentUsed" 
                :status="percentUsed >= 90 ? 'exception' : (percentUsed >= 70 ? 'warning' : 'success')" 
                :stroke-width="12"
              />
              <div class="traffic-desc">
                {{ $t('detail.used') }}: <span class="highlight-text">{{ formatBytes(detailData.upload + detailData.download) }}</span> / {{ $t('detail.totalQuota') }}: {{ formatBytes(detailData.quota) }}
              </div>
            </div>

            <div class="traffic-direction">
              <div class="dir-item">
                <span class="dir-title">↑ {{ $t('detail.upload') }}</span>
                <span class="dir-value">{{ formatBytes(detailData.upload) }}</span>
              </div>
              <div class="dir-item">
                <span class="dir-title">↓ {{ $t('detail.download') }}</span>
                <span class="dir-value">{{ formatBytes(detailData.download) }}</span>
              </div>
            </div>
          </div>
        </el-card>
      </el-col>

      <!-- Card 2: Quick Actions (Only for Admin) -->
      <el-col :xs="24" :sm="24" :md="8" v-if="isAdmin">
        <el-card class="stat-card action-card">
          <template #header>
            <div class="card-header">
              <span>{{ $t('detail.accountOps') }}</span>
            </div>
          </template>
          <div class="card-body action-buttons-grid">
            <el-button type="primary" :icon="Tools" @click="handleLimitData">{{ $t('detail.limitQuota') }}</el-button>
            <el-button type="warning" :icon="RefreshRight" @click="handleResetData">{{ $t('detail.resetTraffic') }}</el-button>
            <el-button type="success" :icon="Edit" @click="handleModifyUser">{{ $t('detail.editUser') }}</el-button>
            <el-button type="info" :icon="Calendar" @click="handleSetExpire">{{ $t('detail.setExpire') }}</el-button>
            <el-button type="info" v-if="detailData.expiryDate" @click="handleCancelExpire">{{ $t('detail.cancelExpire') }}</el-button>
            <el-button type="danger" :icon="Delete" @click="handleDeleteUser">{{ $t('detail.delUser') }}</el-button>
          </div>
        </el-card>
      </el-col>

      <!-- Card 3: Subscription Generator -->
      <el-col :xs="24" :sm="24" :md="isAdmin ? 8 : 12">
        <el-card class="stat-card sub-card">
          <template #header>
            <div class="card-header">
              <span>{{ $t('detail.quickManage') }}</span>
            </div>
          </template>
          <div class="card-body">
            <el-radio-group v-model="subType" size="small" style="margin-bottom: 15px; display: flex; width: 100%;">
              <el-radio-button label="trojan">{{ $t('user.trojanShareLink') || 'Trojan节点' }}</el-radio-button>
              <el-radio-button label="clash">{{ $t('user.clashShareLink') || 'Clash订阅' }}</el-radio-button>
              <el-radio-button label="shadowrocket">{{ $t('user.universalShareLink') || '小火箭订阅' }}</el-radio-button>
            </el-radio-group>

            <el-input 
              v-model="shareLink" 
              readonly 
              placeholder="..." 
              size="small"
              class="sub-input"
            >
              <template #append>
                <el-button @click="copyLink">{{ $t('share') || '复制' }}</el-button>
              </template>
            </el-input>

            <div class="sub-actions" style="margin-top: 15px; display: flex; gap: 10px;">
              <el-button v-if="subType === 'clash'" type="primary" size="small" style="flex: 1;" @click="importToClash">
                {{ $t('user.importClash') || '一键导入 Clash' }}
              </el-button>
              <el-button type="success" size="small" style="flex: 1;" @click="showQRCode">
                {{ $t('share') || '二维码分享' }}
              </el-button>
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <!-- Row 2: Top 10 Domains Visited & IP Connection List -->
    <el-row :gutter="20" class="info-row">
      <!-- Top 10 Domains Visited -->
      <el-col :xs="24" :sm="24" :md="10">
        <el-card class="stat-card domain-card">
          <template #header>
            <div class="card-header">
              <span>{{ $t('detail.topDomains') }}</span>
              <el-tag type="info">{{ $t('detail.recentMonth') }}</el-tag>
            </div>
          </template>
          <div class="card-body">
            <div v-if="!detailData.domains || detailData.domains.length === 0" class="empty-state">
              <el-empty :description="$t('detail.noDomains')" :image-size="80" />
            </div>
            <div v-else class="domain-list">
              <div v-for="(item, index) in detailData.domains" :key="item.domain" class="domain-item">
                <div class="domain-rank-info">
                  <span class="rank-badge" :class="'rank-' + (index + 1)">{{ index + 1 }}</span>
                  <span class="domain-name" :title="item.domain">
                    {{ item.domain }}
                    <el-tag v-if="isAbuseDomain(item.domain)" type="danger" size="small" style="margin-left: 6px;">P2P/BT</el-tag>
                  </span>
                </div>
                <div class="domain-bar-section">
                  <el-progress 
                    :percentage="getDomainPercentage(item.visit_count)" 
                    :show-text="false" 
                    color="#409eff"
                    :stroke-width="8"
                    class="domain-progress-bar"
                  />
                </div>
                <span class="visit-count">{{ item.visit_count }} {{ $t('detail.visit') }}</span>
              </div>
            </div>
          </div>
        </el-card>
      </el-col>

      <!-- Connection IP List -->
      <el-col :xs="24" :sm="24" :md="14">
        <el-card class="stat-card ip-card">
          <template #header>
            <div class="card-header">
              <span>{{ $t('detail.recentIps') }}</span>
              <el-tag type="success">{{ $t('detail.ipAudit') }}</el-tag>
            </div>
          </template>
          <div class="card-body" style="padding: 0;">
            <el-table :data="ipTableData" style="width: 100%" class="ip-table" :empty-text="$t('detail.noIps')" height="340">
              <el-table-column label="#" type="index" width="50" align="center" />
              <el-table-column prop="ip" :label="$t('detail.ipAddress')" width="160">
                <template #default="scope">
                  <span class="ip-address-text">{{ scope.row.ip }}</span>
                  <div style="margin-top: 4px;">
                    <el-tag :type="scope.row.isActive ? 'success' : 'info'" size="small">
                      {{ scope.row.isActive ? $t('detail.online') : $t('detail.offline') }}
                    </el-tag>
                  </div>
                </template>
              </el-table-column>
              <el-table-column :label="$t('detail.location')" width="180">
                <template #default="scope">
                  <div v-if="scope.row.loading" class="geoip-loading">
                    <el-icon class="is-loading"><Loading /></el-icon> {{ $t('detail.querying') }}
                  </div>
                  <div v-else-if="scope.row.error" class="geoip-error">
                    <span class="text-muted">{{ $t('detail.queryFailed') }}</span>
                  </div>
                  <div v-else class="geoip-info-cell">
                    <span class="country-badge">{{ scope.row.country }}</span>
                    <div class="city-text">{{ scope.row.region }} {{ scope.row.city }}</div>
                  </div>
                </template>
              </el-table-column>
              <el-table-column :label="$t('detail.isp')">
                <template #default="scope">
                  <span v-if="scope.row.loading">-</span>
                  <span v-else-if="scope.row.error" class="text-muted">unknown</span>
                  <span class="isp-text" :title="scope.row.isp">{{ scope.row.isp || 'unknown' }}</span>
                </template>
              </el-table-column>
            </el-table>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <!-- Dialog for QR Code -->
    <el-dialog :title="$t('share')" v-model="qrcodeVisible" width="300px" @close="clearQRCode">
      <div style="display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 10px;">
        <div ref="qrcode" class="qrcode-box" style="margin-bottom: 10px;"></div>
        <p style="margin-top: 10px; font-size: 12px; color: var(--el-text-color-secondary); word-break: break-all; text-align: center; width: 100%;">
          {{ shareLink }}
        </p>
      </div>
    </el-dialog>

    <!-- Dialog for Set Quota -->
    <el-dialog :title="$t('detail.limitQuota') + ': ' + username" v-model="quotaVisible" :width="dialogWidth">
      <el-tooltip effect="dark" :content="$t('user.meanUnlimit')" placement="top">
        <el-input-number v-model="quota" :min="-1" :precision="0"></el-input-number>
      </el-tooltip>
      <el-select v-model="quotaUnit" :placeholder="$t('choice')" style="margin-left: 10px; width:100px">
        <el-option v-for="item in quotaOptions" :key="item.value" :label="item.value" :value="item.value" />
      </el-select>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="quotaVisible = false">{{ $t('cancel') }}</el-button>
          <el-button type="primary" @click="submitQuota">{{ $t('ok') }}</el-button>
        </span>
      </template>
    </el-dialog>

    <!-- Dialog for Set Expiry -->
    <el-dialog :title="$t('detail.setExpire') + ': ' + username" v-model="expiryVisible" :width="dialogWidth">
      <el-form label-position="top">
        <el-form-item :label="$t('user.expiryDate') + ':'">
          <div style="display: flex; gap: 10px; align-items: center; flex-wrap: wrap; width: 100%;">
            <el-date-picker v-model="expireDate" type="date" :placeholder="$t('choice')" value-format="YYYY-MM-DD" style="width: 160px;" />
            <el-button-group style="display: flex; flex-wrap: wrap;">
              <el-button v-for="item in expiryDateOptions" :key="item.value" size="default" :type="useDays === item.value ? 'primary' : 'default'" @click="useDays = item.value">
                {{ item.label }}
              </el-button>
            </el-button-group>
            <span style="font-size: 14px; margin-left: 4px; color: #9ca3af;">{{ $t('user.customDays') || '自定义(天):' }}</span>
            <el-input-number v-model="useDays" :min="0" :precision="0" style="width: 100px;"></el-input-number>
          </div>
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="expiryVisible = false">{{ $t('cancel') }}</el-button>
          <el-button type="primary" @click="submitExpire">{{ $t('ok') }}</el-button>
        </span>
      </template>
    </el-dialog>

    <!-- Dialog for Modify User -->
    <el-dialog :title="$t('detail.editUser') + ': ' + username" v-model="userVisible" :width="dialogWidth">
      <el-input type="text" v-model="userInfo.username" :placeholder="$root.$t('user.inputUsername')" style="margin-bottom: 15px;" />
      <el-input type="text" v-model="userInfo.password" :placeholder="$root.$t('user.inputPassword')" />
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="userVisible = false">{{ $t('cancel') }}</el-button>
          <el-button type="primary" @click="submitModifyUser">{{ $t('ok') }}</el-button>
        </span>
      </template>
    </el-dialog>

    <!-- Dialog for Confirm Operations -->
    <el-dialog :title="confirmTitle" v-model="confirmVisible" :width="dialogWidth">
      <p style="font-size: 14px; color: var(--el-text-color-regular);">{{ confirmText }}</p>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="confirmVisible = false">{{ $t('cancel') }}</el-button>
          <el-button type="primary" @click="confirmType === 0 ? submitDeleteUser() : submitResetData()">{{ $t('ok') }}</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script>
import { ArrowLeft, Loading, Tools, Edit, Delete, RefreshRight, Calendar } from '@element-plus/icons-vue'
import { userDetail, saveIPGeo, updateUser, delUser, setExpire, cancelExpire } from '@/api/user'
import { setQuota, cleanData } from '@/api/data'
import { restart } from '@/api/trojan'
import { readablizeBytes, base64Encode, base64Decode } from '@/utils/common'
import { mapState } from 'vuex'
import * as QRCode from 'easyqrcodejs'
import dayjs from 'dayjs'

export default {
  name: 'UserDetail',
  data() {
    return {
      ArrowLeft,
      Tools,
      Edit,
      Delete,
      RefreshRight,
      Calendar,
      username: '',
      detailData: {
        id: 0,
        username: '',
        password: '',
        download: 0,
        upload: 0,
        quota: -1,
        useDays: 0,
        expiryDate: '',
        ips: [],
        domains: []
      },
      ipTableData: [],
      maxVisitCount: 1,
      subType: 'trojan',
      qrcodeVisible: false,
      domain: '',
      port: 0,
      
      // Dialog-related variables
      quotaVisible: false,
      expiryVisible: false,
      userVisible: false,
      confirmVisible: false,
      confirmTitle: '',
      confirmText: '',
      confirmType: 0, // 0 for delete, 1 for reset traffic
      quota: -1,
      quotaUnit: 'MB',
      quotaOptions: [
        { value: 'MB' },
        { value: 'GB' }
      ],
      useDays: 7,
      expireDate: dayjs().add(7, 'day').format('YYYY-MM-DD'),
      expiryDateOptions: [
        { label: this.$t('user.week') || '单周', value: 7 },
        { label: this.$t('user.month') || '单月', value: 30 },
        { label: this.$t('user.season') || '单季', value: 90 },
        { label: this.$t('user.halfYear') || '半年', value: 183 },
        { label: this.$t('user.year') || '一年', value: 365 }
      ],
      userInfo: {
        username: '',
        password: ''
      }
    }
  },
  computed: {
    ...mapState(['dialogWidth', 'isAdmin']),
    accountStatus() {
      if (this.detailData.expiryDate) {
        const expiry = new Date(this.detailData.expiryDate.replace(/-/g, '/'))
        if (expiry < new Date()) {
          return 'Expired'
        }
      }
      if (this.detailData.quota > 0 && (this.detailData.upload + this.detailData.download) >= this.detailData.quota) {
        return 'Exceeded'
      }
      return 'Active'
    },
    accountStatusText() {
      const status = this.accountStatus
      if (status === 'Active') return this.$t('detail.noAbuse') || '正常可用'
      if (status === 'Expired') return this.$t('detail.offline') || '已过期'
      return this.$t('user.quota') || '流量超额'
    },
    accountStatusType() {
      const status = this.accountStatus
      if (status === 'Active') return 'success'
      if (status === 'Expired') return 'danger'
      return 'warning'
    },
    percentUsed() {
      if (this.detailData.quota <= 0) return 0
      const used = this.detailData.upload + this.detailData.download
      const percent = (used / this.detailData.quota) * 100
      return parseFloat(percent.toFixed(1))
    },
    shareLink() {
      if (!this.domain) return ''
      
      const pass = base64Decode(this.detailData.password || '')
      if (this.subType === 'trojan') {
        const remark = encodeURIComponent(`${this.domain}:${this.port}`)
        return `trojan://${pass}@${this.domain}:${this.port}#${remark}`
      } else {
        const userInfo = base64Encode(`{"user": "${this.username}", "pass": "${pass}"}`)
        const protocol = window.location.hostname === '127.0.0.1' ? 'https:' : window.location.protocol
        const baseSubUrl = `${protocol}//${this.domain}:${this.port}/trojan/user/subscribe?token=${userInfo}`
        if (this.subType === 'clash') {
          return baseSubUrl
        } else if (this.subType === 'shadowrocket') {
          return `${baseSubUrl}&flag=shadowrocket`
        }
      }
      return ''
    },
    hasAbuseBehavior() {
      if (!this.detailData.domains || this.detailData.domains.length === 0) return false
      return this.detailData.domains.some(item => this.isAbuseDomain(item.domain))
    },
    abuseDomainsCount() {
      if (!this.detailData.domains) return 0
      return this.detailData.domains.filter(item => this.isAbuseDomain(item.domain)).length
    }
  },
  watch: {
    expireDate(newVal) {
      if (newVal) {
        const today = dayjs().startOf('day')
        const target = dayjs(newVal).startOf('day')
        const diffDays = target.diff(today, 'day')
        if (diffDays >= 0 && this.useDays !== diffDays) {
          this.useDays = diffDays
        }
      }
    },
    useDays(newVal) {
      const today = dayjs().startOf('day')
      const computedDate = today.add(newVal, 'day').format('YYYY-MM-DD')
      if (this.expireDate !== computedDate) {
        this.expireDate = computedDate
      }
    }
  },
  created() {
    this.username = this.$route.query.username || ''
    if (this.username) {
      this.fetchDetail()
    } else {
      this.$message.error('Username param error')
      this.goBack()
    }
  },
  methods: {
    goBack() {
      this.$router.push({ name: 'user' })
    },
    formatBytes(bytes) {
      if (bytes === -1) return this.$t('user.unlimit') || '无限流量'
      return readablizeBytes(bytes)
    },
    getDomainPercentage(visitCount) {
      if (this.maxVisitCount <= 0) return 0
      return Math.round((visitCount / this.maxVisitCount) * 100)
    },
    async fetchDetail() {
      try {
        const res = await userDetail(this.username)
        if (res.Msg === 'success') {
          this.detailData = res.Data
          this.domain = res.Data.domain || ''
          this.port = res.Data.port || 0

          // 计算排名前十网站的最大访问量，用于折算相对百分比
          if (this.detailData.domains && this.detailData.domains.length > 0) {
            this.maxVisitCount = Math.max(...this.detailData.domains.map(d => d.visit_count))
          }

          // 初始化 IP 表格行，有缓存的 GeoIP 直接显示，没缓存的标记为 loading
          if (this.detailData.ips) {
            this.ipTableData = this.detailData.ips.map(item => {
              const hasCachedGeo = item.country && item.country !== ''
              return {
                ip: item.ip,
                isActive: item.is_active,
                country: item.country || '',
                region: item.region || '',
                city: item.city || '',
                isp: item.isp || '',
                loading: !hasCachedGeo,
                error: false
              }
            })
            // 只对没有缓存的 IP 查询归属地
            this.fetchGeoIPs()
          }
        } else {
          this.$message.error('Get details failed: ' + res.Msg)
        }
      } catch (err) {
        this.$message.error('Get details error: ' + err.message)
      }
    },
    // 串行查询未缓存 of IP 物理属地 (ipapi.co)，查询完成后回写服务器缓存
    async fetchGeoIPs() {
      const uncachedRows = this.ipTableData.filter(row => row.loading)
      if (uncachedRows.length === 0) return

      for (let i = 0; i < uncachedRows.length; i++) {
        const row = uncachedRows[i]
        try {
          const response = await fetch(`https://ipapi.co/${row.ip}/json/`)
          if (response.ok) {
            const data = await response.json()
            if (data && !data.error) {
              row.country = data.country_name || 'unknown'
              row.region = data.region || ''
              row.city = data.city || ''
              row.isp = data.org || data.asn || 'unknown'
              row.loading = false
            } else {
              row.error = true
              row.loading = false
            }
          } else {
            const backupResponse = await fetch(`http://ip-api.com/json/${row.ip}?lang=zh-CN`).catch(() => null)
            if (backupResponse && backupResponse.ok) {
              const data = await backupResponse.json()
              if (data && data.status === 'success') {
                row.country = data.country || 'unknown'
                row.region = data.regionName || ''
                row.city = data.city || ''
                row.isp = data.isp || 'unknown'
                row.loading = false
              } else {
                row.error = true
                row.loading = false
              }
            } else {
              row.error = true
              row.loading = false
            }
          }
        } catch (err) {
          row.error = true
          row.loading = false
        }

        // 查询成功后，异步回写服务器缓存（下次打开直接显示，不再查 API）
        if (!row.error && row.country) {
          const formData = new FormData()
          formData.append('username', this.username)
          formData.append('ip', row.ip)
          formData.append('country', row.country)
          formData.append('region', row.region)
          formData.append('city', row.city)
          formData.append('isp', row.isp)
          saveIPGeo(formData).catch(() => {}) // 缓存失败不影响前端显示
        }

        // 每个 IP 之间等待 300ms，避免被 ipapi.co 限流
        if (i < uncachedRows.length - 1) {
          await new Promise(resolve => setTimeout(resolve, 300))
        }
      }
    },
    isAbuseDomain(domain) {
      if (!domain) return false
      const abuseKeywords = ['torrent', 'tracker', 'peer', 'bittorrent', 'utorrent', 'opentracker', 'announce', 'magnet', 'xunlei', 'thunder', 'qbittorrent']
      const lowerDomain = domain.toLowerCase()
      return abuseKeywords.some(keyword => lowerDomain.includes(keyword))
    },
    copyLink() {
      const text = this.shareLink
      if (navigator.clipboard) {
        navigator.clipboard.writeText(text).then(() => {
          this.$message.success('Success')
        }).catch(() => {
          this.fallbackCopyText(text)
        })
      } else {
        this.fallbackCopyText(text)
      }
    },
    fallbackCopyText(text) {
      const textArea = document.createElement('textarea')
      textArea.value = text
      textArea.style.position = 'fixed'
      document.body.appendChild(textArea)
      textArea.focus()
      textArea.select()
      try {
        document.execCommand('copy')
        this.$message.success('Success')
      } catch (err) {
        this.$message.error('Copy failed')
      }
      document.body.removeChild(textArea)
    },
    importToClash() {
      const url = `clash://install-config?url=${encodeURIComponent(this.shareLink)}`
      window.location.href = url
    },
    showQRCode() {
      this.qrcodeVisible = true
      this.$nextTick(() => {
        const qrEl = this.$refs.qrcode
        if (qrEl) {
          qrEl.innerHTML = ''
          new QRCode(qrEl, {
            width: 200,
            height: 200,
            text: this.shareLink
          })
        }
      })
    },
    clearQRCode() {
      const qrEl = this.$refs.qrcode
      if (qrEl) {
        qrEl.innerHTML = ''
      }
    },

    // Action handlers
    handleLimitData() {
      this.quota = this.detailData.quota === -1 ? -1 : 0
      this.quotaUnit = 'GB'
      if (this.detailData.quota > 0) {
        if (this.detailData.quota % (1024 * 1024 * 1024) === 0) {
          this.quota = this.detailData.quota / (1024 * 1024 * 1024)
          this.quotaUnit = 'GB'
        } else {
          this.quota = Math.round(this.detailData.quota / (1024 * 1024))
          this.quotaUnit = 'MB'
        }
      }
      this.quotaVisible = true
    },
    async submitQuota() {
      let quotaBytes = this.quota
      if (this.quota !== -1) {
        if (this.quotaUnit === 'MB') {
          quotaBytes = this.quota * 1024 * 1024
        } else if (this.quotaUnit === 'GB') {
          quotaBytes = this.quota * 1024 * 1024 * 1024
        }
      }
      const formData = new FormData()
      formData.set('id', this.detailData.id)
      formData.set('quota', quotaBytes)
      const result = await setQuota(formData)
      if (result.Msg === 'success') {
        this.$message.success('Success')
        this.quotaVisible = false
        this.fetchDetail()
      } else {
        this.$message.error(result.Msg)
      }
    },
    handleResetData() {
      this.confirmTitle = this.$t('detail.resetTraffic')
      this.confirmText = this.$t('detail.resetConfirm', { username: this.username })
      this.confirmType = 1
      this.confirmVisible = true
    },
    async submitResetData() {
      const result = await cleanData(this.detailData.id)
      if (result.Msg === 'success') {
        this.$message.success('Success')
        this.confirmVisible = false
        this.fetchDetail()
      } else {
        this.$message.error(result.Msg)
      }
    },
    handleModifyUser() {
      this.userInfo.username = this.detailData.username
      this.userInfo.password = base64Decode(this.detailData.password)
      this.userVisible = true
    },
    async submitModifyUser() {
      if (this.userInfo.username === '' || this.userInfo.password === '') {
        this.$message.error('Field cannot be null')
        return
      }
      if (this.userInfo.username === 'admin') {
        this.$message.error("can't create username is admin")
        return
      }
      const formData = new FormData()
      formData.set('id', this.detailData.id)
      formData.set('username', this.userInfo.username)
      try {
        formData.set('password', base64Encode(this.userInfo.password))
      } catch (e) {
        this.$message.error("password doesn't support chinese!")
        return
      }
      const result = await updateUser(formData)
      this.userVisible = false
      if (result.Msg === 'success') {
        this.$message.success('Success')
        if (this.userInfo.username !== this.username) {
          this.username = this.userInfo.username
          this.$router.replace({
            name: 'userDetail',
            query: { username: this.username }
          })
        }
        this.fetchDetail()
        this.$store.commit('SET_NOERROR', true)
        try {
          await restart().catch()
        } catch (e) {
          // ignore
        } finally {
          this.$store.commit('SET_NOERROR', false)
        }
      } else {
        this.$message.error(result.Msg)
      }
    },
    handleSetExpire() {
      this.useDays = this.detailData.useDays || 7
      this.expireDate = this.detailData.expiryDate || dayjs().add(7, 'day').format('YYYY-MM-DD')
      this.expiryVisible = true
    },
    async submitExpire() {
      const formData = new FormData()
      formData.set('id', this.detailData.id)
      formData.set('useDays', this.useDays)
      const result = await setExpire(formData)
      if (result.Msg === 'success') {
        this.$message.success('Success')
        this.expiryVisible = false
        this.fetchDetail()
      } else {
        this.$message.error(result.Msg)
      }
    },
    async handleCancelExpire() {
      const result = await cancelExpire(this.detailData.id)
      if (result.Msg === 'success') {
        this.$message.success('Success')
        this.fetchDetail()
      } else {
        this.$message.error(result.Msg)
      }
    },
    handleDeleteUser() {
      this.confirmTitle = this.$t('detail.delUser')
      this.confirmText = this.$t('detail.delConfirm', { username: this.username })
      this.confirmType = 0
      this.confirmVisible = true
    },
    async submitDeleteUser() {
      this.$store.commit('SET_NOERROR', true)
      let result = null
      try {
        result = await delUser(this.detailData.id)
      } catch (err) {
        result = { Msg: 'success' }
      } finally {
        this.$store.commit('SET_NOERROR', false)
      }
      if (result.Msg === 'success') {
        this.$message.success(`Deleted ${this.username} successfully`)
        this.confirmVisible = false
        this.goBack()
      } else {
        this.$message.error(result.Msg)
      }
    }
  }
}
</script>

<style scoped lang="scss">
.user-detail-container {
  padding: 24px;
  background-color: var(--el-bg-color-page);
  min-height: calc(100vh - 50px);
}

.qrcode-box {
  background-color: #ffffff;
  padding: 10px;
  border-radius: 6px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  display: inline-block;
  
  canvas, img {
    display: block;
  }
}

.sub-card {
  .card-body {
    padding: 16px;
  }
}

.header-section {
  display: flex;
  align-items: center;
  margin-bottom: 24px;
  
  .back-btn {
    margin-right: 16px;
  }
  
  .page-title {
    margin: 0;
    font-size: 20px;
    font-weight: 600;
    color: var(--el-text-color-primary);
  }
  
  .username-highlight {
    color: var(--el-color-primary);
    font-weight: 700;
  }
}

.info-row {
  margin-bottom: 20px;
}

.stat-card {
  margin-bottom: 20px;
  border-radius: 12px;
  border: 1px solid var(--el-border-color-light);
  box-shadow: var(--el-box-shadow-light);
  background-color: var(--el-bg-color-overlay);
  
  .card-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    font-weight: 600;
    font-size: 15px;
    color: var(--el-text-color-primary);
  }
  
  .card-body {
    padding: 16px;
  }
}

.action-card {
  .action-buttons-grid {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 12px;
    
    .el-button {
      margin: 0 !important;
      width: 100%;
      height: 36px;
      font-weight: 600;
    }
  }
}

.account-card {
  .info-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 12px;
    font-size: 14px;
    
    .info-label {
      color: var(--el-text-color-secondary);
    }
    
    .info-value {
      font-weight: 600;
      color: var(--el-text-color-primary);
    }
  }
  
  .progress-section {
    margin-bottom: 20px;
    
    .progress-labels {
      display: flex;
      justify-content: space-between;
      margin-bottom: 8px;
      font-size: 14px;
      font-weight: 600;
    }
    
    .traffic-desc {
      margin-top: 8px;
      font-size: 12px;
      color: var(--el-text-color-secondary);
      
      .highlight-text {
        font-weight: 600;
        color: var(--el-color-primary);
      }
    }
  }

  .traffic-direction {
    display: flex;
    border-top: 1px solid var(--el-border-color-lighter);
    margin-top: 16px;
    
    .dir-item {
      flex: 1;
      text-align: center;
      padding: 12px 0 0 0;
      
      &:first-child {
        border-right: 1px solid var(--el-border-color-lighter);
      }
      
      .dir-title {
        display: block;
        font-size: 12px;
        color: var(--el-text-color-secondary);
        margin-bottom: 4px;
      }
      
      .dir-value {
        font-size: 14px;
        font-weight: 600;
        color: var(--el-text-color-primary);
      }
    }
  }
}

.domain-card {
  .card-body {
    height: 340px;
    overflow-y: auto;
  }
  
  .empty-state {
    padding: 40px 0;
    display: flex;
    justify-content: center;
    align-items: center;
    height: 100%;
  }
  
  .domain-list {
    display: flex;
    flex-direction: column;
    gap: 12px;
  }
  
  .domain-item {
    display: flex;
    align-items: center;
    font-size: 13px;
    
    .domain-rank-info {
      display: flex;
      align-items: center;
      width: 180px;
      overflow: hidden;
      
      .rank-badge {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        width: 18px;
        height: 18px;
        flex-shrink: 0;
        border-radius: 50%;
        font-size: 10px;
        font-weight: 600;
        margin-right: 8px;
        background-color: var(--el-fill-color-darker);
        color: var(--el-text-color-secondary);
        
        &.rank-1 { background-color: #f56c6c; color: white; }
        &.rank-2 { background-color: #e6a23c; color: white; }
        &.rank-3 { background-color: #409eff; color: white; }
      }
      
      .domain-name {
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
        font-weight: 500;
        color: var(--el-text-color-primary);
      }
    }
    
    .domain-bar-section {
      flex: 1;
      padding: 0 12px;
      
      .domain-progress-bar {
        margin: 0;
      }
    }
    
    .visit-count {
      width: 50px;
      text-align: right;
      font-size: 12px;
      color: var(--el-text-color-secondary);
      font-weight: 600;
    }
  }
}

.ip-card {
  .ip-table {
    margin: 0;
  }
  
  .ip-address-text {
    font-family: monospace;
    font-size: 13px;
    font-weight: 600;
    color: var(--el-text-color-primary);
  }
  
  .geoip-loading {
    color: var(--el-color-primary);
    display: flex;
    align-items: center;
    gap: 4px;
    font-size: 12px;
  }
  
  .geoip-error {
    color: var(--el-text-color-placeholder);
    font-size: 12px;
  }
  
  .geoip-info-cell {
    display: flex;
    flex-direction: column;
    gap: 2px;
    
    .country-badge {
      background-color: var(--el-color-primary-light-9);
      color: var(--el-color-primary);
      padding: 1px 4px;
      border-radius: 4px;
      font-size: 11px;
      font-weight: 600;
      align-self: flex-start;
    }
    
    .city-text {
      font-size: 12px;
      color: var(--el-text-color-regular);
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }
  }
  
  .isp-text {
    font-size: 12px;
    color: var(--el-text-color-regular);
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    display: block;
    max-width: 100%;
  }
}
</style>
