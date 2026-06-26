<template>
  <div class="user-detail-container">
    <!-- Back Button & Header -->
    <div class="header-section">
      <el-button :icon="ArrowLeft" @click="goBack" class="back-btn">{{ $t('detail.back') }}</el-button>
      <div class="breadcrumb-nav">
        <span class="bc-item">首页</span>
        <span class="bc-separator">/</span>
        <span class="bc-item active">用户详情</span>
      </div>
    </div>

    <!-- P2P/BT Alert Warning -->
    <el-alert
      v-if="hasAbuseBehavior"
      :title="$t('detail.abuseWarning')"
      type="error"
      effect="dark"
      show-icon
      class="abuse-alert-banner"
    />

    <!-- Header Hero Profile Card -->
    <div class="profile-hero-card">
      <div class="hero-left">
        <div class="user-avatar-glowing">
          {{ username.substring(0, 2).toUpperCase() }}
        </div>
        <div class="user-meta-info">
          <div class="user-title-row">
            <h1 class="user-name">{{ username }}</h1>
            <el-tag :type="accountStatusType" size="small" effect="dark" class="status-tag">
              {{ accountStatusText }}
            </el-tag>
          </div>
          <div class="user-sub-details">
            <span class="sub-info-item">
              <el-icon><Calendar /></el-icon>
              <span class="sub-info-label">{{ $t('detail.expiryDate') }}:</span>
              <el-tag type="info" size="small" effect="plain" class="info-tag-val">
                {{ detailData.expiryDate || $t('detail.forever') }}
              </el-tag>
            </span>
            <span class="sub-info-item" v-if="detailData.useDays > 0">
              <el-icon><Clock /></el-icon>
              <span class="sub-info-label">{{ $t('detail.limitDays') }}:</span>
              <el-tag type="warning" size="small" effect="plain" class="info-tag-val">
                {{ detailData.useDays }} {{ $t('user.days') || '天' }}
              </el-tag>
            </span>
            <span class="sub-info-item">
              <el-icon><Warning /></el-icon>
              <span class="sub-info-label">{{ $t('detail.abuseDetect') }}:</span>
              <el-tag :type="hasAbuseBehavior ? 'danger' : 'success'" size="small" effect="plain" class="abuse-badge">
                {{ hasAbuseBehavior ? $t('detail.abuseInfo', { n: abuseDomainsCount }) : $t('detail.noAbuse') }}
              </el-tag>
            </span>
          </div>
        </div>
      </div>
      <div class="hero-right">
        <div class="metric-item">
          <span class="metric-label">{{ $t('detail.used') }}</span>
          <span class="metric-value">{{ formatBytes(detailData.upload + detailData.download) }}</span>
        </div>
        <el-divider direction="vertical" class="metric-divider" />
        <div class="metric-item">
          <span class="metric-label">{{ $t('detail.totalQuota') }}</span>
          <span class="metric-value">{{ formatBytes(detailData.quota) }}</span>
        </div>
        <el-divider direction="vertical" class="metric-divider" />
        <div class="metric-item">
          <span class="metric-label">{{ $t('detail.upload') }} / {{ $t('detail.download') }}</span>
          <span class="metric-sub-value">
            <span class="up-val">↑ {{ formatBytes(detailData.upload) }}</span>
            <span class="down-val">↓ {{ formatBytes(detailData.download) }}</span>
          </span>
        </div>
      </div>
    </div>

    <!-- Main Content Area -->
    <el-row :gutter="24" class="content-row">
      <!-- Left Column: Usage progress & unified dashboard -->
      <el-col :xs="24" :sm="24" :md="16" class="col-left">
        <!-- Progress bar for data usage -->
        <el-card class="stat-card usage-progress-card">
          <div class="progress-section">
            <div class="progress-labels">
              <span class="progress-title">{{ $t('detail.usedPercent') }}</span>
              <span class="progress-num">{{ percentUsed }}%</span>
            </div>
            <el-progress 
              :percentage="percentUsed" 
              :status="percentUsed >= 90 ? 'exception' : (percentUsed >= 70 ? 'warning' : 'success')" 
              :stroke-width="12"
              class="custom-progress"
            />
          </div>
        </el-card>

        <!-- Recent Connected IPs -->
        <el-card class="stat-card ip-card">
          <template #header>
            <div class="card-header" style="display: flex; justify-content: space-between; align-items: center; width: 100%;">
              <span>最近连入记录 (近30天)</span>
              <el-button type="info" size="small" @click="showBlacklistDialog">
                黑名单管理
              </el-button>
            </div>
          </template>
          <div class="card-body-table">
            <el-table :data="ipTableData" style="width: 100%" class="ip-table" :empty-text="$t('detail.noIps')" height="280">
              <el-table-column label="#" type="index" width="50" align="center" />
              <el-table-column prop="ip" :label="$t('detail.ipAddress')" min-width="140">
                <template #default="scope">
                  <span class="ip-address-text">{{ scope.row.ip }}</span>
                  <div style="margin-top: 4px;">
                    <el-tag :type="scope.row.isActive ? 'success' : 'info'" size="small">
                      {{ scope.row.isActive ? $t('detail.online') : $t('detail.offline') }}
                    </el-tag>
                  </div>
                </template>
              </el-table-column>
              <el-table-column :label="$t('detail.location')" min-width="160">
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
              <el-table-column :label="$t('detail.isp')" min-width="140">
                <template #default="scope">
                  <span v-if="scope.row.loading">-</span>
                  <span v-else-if="scope.row.error" class="text-muted">unknown</span>
                  <span class="isp-text" :title="scope.row.isp">{{ scope.row.isp || 'unknown' }}</span>
                </template>
              </el-table-column>
              <el-table-column label="操作" align="center" min-width="240">
                <template #default="scope">
                  <div style="display: flex; justify-content: center; gap: 8px; align-items: center;">
                    <!-- 如果已被封禁，显示解封按钮 -->
                    <el-button 
                      v-if="scope.row.isBanned"
                      type="success" 
                      size="small" 
                      @click="handleUnbanIP(scope.row.ip)"
                    >
                      解除封禁
                    </el-button>
                    <!-- 如果未封禁，且在线，显示断流和拉黑 -->
                    <template v-else-if="scope.row.isActive">
                      <el-button 
                        type="danger" 
                        size="small" 
                        @click="kickIP(scope.row.ip)"
                      >
                        一键断流
                      </el-button>
                      <el-dropdown trigger="click" @command="(cmd) => handleBanIP(scope.row.ip, cmd)">
                        <el-button type="warning" size="small">
                          一键拉黑<el-icon class="el-icon--right"><ArrowDown /></el-icon>
                        </el-button>
                        <template #dropdown>
                          <el-dropdown-menu>
                            <el-dropdown-item command="day">拉黑 1 天</el-dropdown-item>
                            <el-dropdown-item command="week">拉黑 1 周</el-dropdown-item>
                            <el-dropdown-item command="month">拉黑 1 月</el-dropdown-item>
                            <el-dropdown-item command="permanent">永久拉黑</el-dropdown-item>
                          </el-dropdown-menu>
                        </template>
                      </el-dropdown>
                    </template>
                    <!-- 如果未封禁且不在线，只显示拉黑 -->
                    <el-dropdown v-else trigger="click" @command="(cmd) => handleBanIP(scope.row.ip, cmd)">
                      <el-button type="warning" size="small">
                        一键拉黑<el-icon class="el-icon--right"><ArrowDown /></el-icon>
                      </el-button>
                      <template #dropdown>
                        <el-dropdown-menu>
                          <el-dropdown-item command="day">拉黑 1 天</el-dropdown-item>
                          <el-dropdown-item command="week">拉黑 1 周</el-dropdown-item>
                          <el-dropdown-item command="month">拉黑 1 月</el-dropdown-item>
                          <el-dropdown-item command="permanent">永久拉黑</el-dropdown-item>
                        </el-dropdown-menu>
                      </template>
                    </el-dropdown>
                  </div>
                </template>
              </el-table-column>
            </el-table>
          </div>
        </el-card>

        <!-- Top 10 Domains Visited -->
        <el-card class="stat-card domain-card">
          <template #header>
            <div class="card-header">
              <span>最常访问网站 TOP 10</span>
            </div>
          </template>
          <div class="card-body">
            <div v-if="!detailData.domains || detailData.domains.length === 0" class="empty-state">
              <el-empty :description="$t('detail.noDomains')" :image-size="50" />
            </div>
            <div v-else class="domain-list">
              <div v-for="(item, index) in detailData.domains" :key="item.domain" class="domain-item">
                <div class="domain-rank-info">
                  <span class="rank-badge" :class="'rank-' + (index + 1)">{{ index + 1 }}</span>
                  <span class="domain-name" :title="item.domain">
                    {{ item.domain }}
                    <el-tag v-if="isAbuseDomain(item.domain)" type="danger" size="small" style="margin-left: 4px;">P2P</el-tag>
                  </span>
                </div>
                <div class="domain-bar-section">
                  <el-progress 
                    :percentage="getDomainPercentage(item.visit_count)" 
                    :show-text="false" 
                    :stroke-width="6" 
                    class="domain-progress-bar"
                  />
                </div>
                <span class="visit-count">{{ item.visit_count }}次</span>
              </div>
            </div>
          </div>
        </el-card>
      </el-col>

      <!-- Right Column: Sub card & Quick action card -->
      <el-col :xs="24" :sm="24" :md="8" class="col-right">
        <!-- Sub Card -->
        <el-card class="stat-card sub-card">
          <template #header>
            <div class="card-header">
              <span>{{ $t('detail.quickManage') }}</span>
            </div>
          </template>
          <div class="card-body">
            <!-- Inline QR Code Display -->
            <div class="qr-container-inline">
              <div ref="qrcodeInline" class="qrcode-inline-box"></div>
            </div>

            <el-radio-group v-model="subType" size="default" class="sub-radio-group">
              <el-radio-button label="trojan">{{ $t('user.trojanShareLink') || 'Trojan' }}</el-radio-button>
              <el-radio-button label="clash">{{ $t('user.clashShareLink') || 'Clash' }}</el-radio-button>
              <el-radio-button label="shadowrocket">{{ $t('user.universalShareLink') || 'Rocket' }}</el-radio-button>
            </el-radio-group>

            <div class="sub-input-container">
              <el-input 
                v-model="shareLink" 
                readonly 
                placeholder="..." 
                size="default"
                class="sub-input"
              >
                <template #append>
                  <el-button @click="copyLink" class="copy-btn-inner">{{ $t('copy') || '复制' }}</el-button>
                </template>
              </el-input>
            </div>

            <div class="sub-actions" v-if="subType === 'clash'">
              <el-button type="primary" size="default" class="clash-btn" @click="importToClash">
                {{ $t('user.importClash') || '导入 Clash' }}
              </el-button>
            </div>
          </div>
        </el-card>

        <!-- Quick Actions Card (Admin only) -->
        <el-card class="stat-card action-card" v-if="isAdmin">
          <template #header>
            <div class="card-header">
              <span>{{ $t('detail.accountOps') }}</span>
            </div>
          </template>
          <div class="card-body-actions">
            <div class="action-list">
              <div class="action-item">
                <div class="action-info">
                  <span class="action-name">{{ $t('detail.limitQuota') }}</span>
                  <span class="action-desc">设定用户可用流量配额</span>
                </div>
                <el-button type="primary" :icon="Tools" @click="handleLimitData">配置</el-button>
              </div>
              <div class="action-item">
                <div class="action-info">
                  <span class="action-name">{{ $t('detail.resetTraffic') }}</span>
                  <span class="action-desc">重置已使用上传与下载流量</span>
                </div>
                <el-button type="warning" :icon="RefreshRight" @click="handleResetData">重置</el-button>
              </div>
              <div class="action-item">
                <div class="action-info">
                  <span class="action-name">{{ $t('detail.editUser') }}</span>
                  <span class="action-desc">修改该用户的用户名及密码</span>
                </div>
                <el-button type="success" :icon="Edit" @click="handleModifyUser">修改</el-button>
              </div>
              <div class="action-item">
                <div class="action-info">
                  <span class="action-name">{{ $t('detail.setExpire') }}</span>
                  <span class="action-desc">设置该账户的有效使用期限</span>
                </div>
                <el-button type="info" :icon="Calendar" @click="handleSetExpire">设置</el-button>
              </div>
              <div class="action-item" v-if="detailData.expiryDate">
                <div class="action-info">
                  <span class="action-name">{{ $t('detail.cancelExpire') }}</span>
                  <span class="action-desc">恢复该账户为永久有效状态</span>
                </div>
                <el-button type="info" @click="handleCancelExpire">取消</el-button>
              </div>
              <div class="action-item danger-item">
                <div class="action-info">
                  <span class="action-name">{{ $t('detail.delUser') }}</span>
                  <span class="action-desc">从系统中彻底移除该用户账户</span>
                </div>
                <el-button type="danger" :icon="Delete" @click="handleDeleteUser">删除</el-button>
              </div>
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>

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

    <!-- Dialog for Blacklist Management -->
    <el-dialog title="黑名单 IP 管理" v-model="blacklistVisible" width="620px">
      <el-table :data="blacklistData" style="width: 100%" height="300" :empty-text="'暂无封禁IP'">
        <el-table-column prop="ip" label="被封 IP" width="150" align="center" />
        <el-table-column prop="ban_type" label="封禁时长" width="100" align="center">
          <template #default="scope">
            <el-tag :type="scope.row.ban_type === 'permanent' ? 'danger' : 'warning'" size="small">
              {{ scope.row.ban_type === 'day' ? '1天' : (scope.row.ban_type === 'week' ? '1周' : (scope.row.ban_type === 'month' ? '1月' : '永久')) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="created_at" label="封禁时间" width="160" align="center" />
        <el-table-column label="操作" align="center">
          <template #default="scope">
            <el-button type="success" size="small" @click="handleUnbanIP(scope.row.ip)">
              解封
            </el-button>
          </template>
        </el-table-column>
      </el-table>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="blacklistVisible = false">关闭</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script>
import { ArrowLeft, Loading, Tools, Edit, Delete, RefreshRight, Calendar, Clock, Warning, ArrowDown } from '@element-plus/icons-vue'
import { userDetail, saveIPGeo, updateUser, delUser, setExpire, cancelExpire, killConnectionByIP, getIPBlacklist, banIP, unbanIP } from '@/api/user'
import { setQuota, cleanData } from '@/api/data'
import { restart } from '@/api/trojan'
import { readablizeBytes, base64Encode, base64Decode } from '@/utils/common'
import { mapState } from 'vuex'
import * as QRCode from 'easyqrcodejs'
import dayjs from 'dayjs'

export default {
  name: 'UserDetail',
  components: {
    Calendar,
    Clock,
    Warning,
    ArrowDown
  },
  data() {
    return {
      ArrowLeft,
      Tools,
      Edit,
      Delete,
      RefreshRight,
      Calendar,
      Clock,
      Warning,
      ArrowDown,
      blacklistVisible: false,
      blacklistData: [],
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
    },
    shareLink(newVal) {
      this.updateInlineQRCode(newVal)
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
    async showBlacklistDialog() {
      this.blacklistVisible = true
      await this.loadBlacklist()
    },
    async loadBlacklist() {
      try {
        const res = await getIPBlacklist()
        if (res.Msg === 'success') {
          this.blacklistData = res.Data || []
        } else {
          this.$message.error(res.Msg)
        }
      } catch (e) {
        this.$message.error(e.message || '加载黑名单失败')
      }
    },
    async handleBanIP(ip, duration) {
      try {
        const res = await banIP(ip, duration)
        if (res.Msg === 'success') {
          this.$message.success('IP拉黑成功并已切断当前连接')
          await this.fetchDetail()
        } else {
          this.$message.error(res.Msg)
        }
      } catch (e) {
        this.$message.error(e.message || '拉黑失败')
      }
    },
    async handleUnbanIP(ip) {
      try {
        const res = await unbanIP(ip)
        if (res.Msg === 'success') {
          this.$message.success('IP解封成功')
          await this.loadBlacklist()
          await this.fetchDetail()
        } else {
          this.$message.error(res.Msg)
        }
      } catch (e) {
        this.$message.error(e.message || '解封失败')
      }
    },
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
                isBanned: item.is_banned || false,
                loading: !hasCachedGeo,
                error: false
              }
            })
            // 只对没有缓存的 IP 查询归属地
            this.fetchGeoIPs()
          }

          // Generate initial inline QR code
          this.$nextTick(() => {
            this.updateInlineQRCode(this.shareLink)
          })
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
    updateInlineQRCode(text) {
      this.$nextTick(() => {
        const qrEl = this.$refs.qrcodeInline
        if (qrEl) {
          qrEl.innerHTML = ''
          if (text) {
            new QRCode(qrEl, {
              width: 180,
              height: 180,
              text: text
            })
          }
        }
      })
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
    },
    async kickIP(ip) {
      try {
        const res = await killConnectionByIP(ip)
        if (res.Msg === 'success') {
          const killed = res.Data && res.Data.killed ? res.Data.killed : 0
          this.$message.success(`已向 ${ip} 发送断流指令 (切断 ${killed} 个连接)`)
          // 延迟刷新，让连接有时间真正断开
          setTimeout(() => this.fetchDetail(), 1500)
        } else {
          this.$message.error('断流失败: ' + res.Msg)
        }
      } catch (err) {
        this.$message.error('操作失败: ' + err.message)
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

.header-section {
  display: flex;
  align-items: center;
  margin-bottom: 20px;
  
  .back-btn {
    margin-right: 16px;
    font-weight: 500;
  }
  
  .breadcrumb-nav {
    display: flex;
    align-items: center;
    gap: 8px;
    font-size: 14px;
    color: var(--el-text-color-secondary);
    
    .bc-item {
      &.active {
        color: var(--el-text-color-primary);
        font-weight: 600;
      }
    }
    
    .bc-separator {
      color: var(--el-text-color-placeholder);
    }
  }
}

.abuse-alert-banner {
  margin-bottom: 24px;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(239, 68, 68, 0.1);
}

/* Profile Hero Card Design */
.profile-hero-card {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: linear-gradient(135deg, rgba(31, 41, 55, 0.6) 0%, rgba(17, 24, 39, 0.8) 100%);
  backdrop-filter: blur(16px);
  border: 1px solid rgba(255, 255, 255, 0.05);
  border-radius: 16px;
  padding: 24px 32px;
  margin-bottom: 24px;
  box-shadow: var(--el-box-shadow-light);
  flex-wrap: wrap;
  gap: 24px;
  
  .hero-left {
    display: flex;
    align-items: center;
    gap: 20px;
    
    .user-avatar-glowing {
      width: 64px;
      height: 64px;
      border-radius: 50%;
      background: linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%);
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 24px;
      font-weight: 700;
      color: #ffffff;
      box-shadow: 0 0 20px rgba(59, 130, 246, 0.4);
      border: 2px solid rgba(255, 255, 255, 0.1);
    }
    
    .user-meta-info {
      .user-title-row {
        display: flex;
        align-items: center;
        gap: 12px;
        margin-bottom: 8px;
        
        .user-name {
          margin: 0;
          font-size: 24px;
          font-weight: 700;
          color: var(--el-text-color-primary);
          letter-spacing: -0.5px;
        }
        
        .status-tag {
          font-weight: 600;
          letter-spacing: 0.5px;
        }
      }
      
      .user-sub-details {
        display: flex;
        align-items: center;
        gap: 16px;
        flex-wrap: wrap;
        
        .sub-info-item {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          font-size: 13px;
          color: var(--el-text-color-secondary);
          line-height: 1;
          
          .sub-info-label {
            margin-right: 2px;
            display: inline-flex;
            align-items: center;
            height: 24px;
            line-height: 1;
          }
          
          .info-tag-val {
            font-weight: 600;
            border-radius: 4px;
            display: inline-flex;
            align-items: center;
            height: 24px;
          }
          
          .highlight {
            color: var(--el-text-color-primary);
            font-weight: 600;
          }
          
          .el-icon {
            font-size: 14px;
            display: inline-flex;
            align-items: center;
            justify-content: center;
            height: 24px;
          }
        }
        
        .abuse-badge {
          border-radius: 4px;
          font-weight: 600;
        }
      }
    }
  }
  
  .hero-right {
    display: flex;
    align-items: center;
    gap: 28px;
    flex-wrap: wrap;
    
    .metric-item {
      display: flex;
      flex-direction: column;
      
      .metric-label {
        font-size: 12px;
        color: var(--el-text-color-secondary);
        margin-bottom: 4px;
        text-transform: uppercase;
        letter-spacing: 0.5px;
      }
      
      .metric-value {
        font-size: 20px;
        font-weight: 700;
        color: var(--el-text-color-primary);
      }
      
      .metric-sub-value {
        font-size: 13px;
        font-weight: 600;
        display: flex;
        flex-direction: column;
        gap: 2px;
        
        .up-val {
          color: var(--el-color-primary);
        }
        .down-val {
          color: var(--el-color-success);
        }
      }
    }
    
    .metric-divider {
      height: 40px;
      margin: 0;
      border-color: rgba(255, 255, 255, 0.08);
    }
  }
}

.content-row {
  margin-bottom: 24px;
}

.stat-card {
  margin-bottom: 24px;
  border-radius: 16px;
  border: 1px solid var(--el-border-color-light);
  box-shadow: var(--el-box-shadow-light);
  background-color: var(--el-bg-color-overlay);
  overflow: hidden;
  
  :deep(.el-card__header) {
    padding: 14px 20px;
    border-bottom: 1px solid var(--el-border-color-light);
  }
  
  .card-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    font-weight: 700;
    font-size: 15px;
    color: var(--el-text-color-primary);
  }
  
  .card-body {
    padding: 20px;
  }
  
  .card-body-table {
    padding: 0 20px 20px 20px;
  }
}

/* Usage progress card */
.usage-progress-card {
  .progress-section {
    padding: 20px;
    
    .progress-labels {
      display: flex;
      justify-content: space-between;
      margin-bottom: 10px;
      
      .progress-title {
        font-size: 14px;
        font-weight: 700;
        color: var(--el-text-color-primary);
      }
      
      .progress-num {
        font-size: 14px;
        font-weight: 700;
        color: var(--el-text-color-primary);
      }
    }
    
    .custom-progress {
      margin-bottom: 8px;
    }
    
    .traffic-desc {
      font-size: 12px;
      color: var(--el-text-color-secondary);
      
      .highlight-text {
        font-weight: 600;
        color: var(--el-color-primary);
      }
    }
  }
}

/* Sub card design */
.sub-card {
  .qr-container-inline {
    display: flex;
    justify-content: center;
    align-items: center;
    margin-bottom: 24px;
    
    .qrcode-inline-box {
      background-color: #ffffff;
      padding: 12px;
      border-radius: 12px;
      box-shadow: 0 6px 18px rgba(0, 0, 0, 0.2);
      display: inline-block;
      
      canvas, img {
        display: block;
      }
    }
  }

  .sub-radio-group {
    display: flex;
    width: 100%;
    margin-bottom: 20px;
    
    .el-radio-button {
      flex: 1;
      text-align: center;
      
      :deep(.el-radio-button__inner) {
        width: 100%;
        font-size: 14px;
        font-weight: 600;
        padding: 0 20px;
        height: 44px;
        display: inline-flex;
        align-items: center;
        justify-content: center;
      }
    }
  }
  
  .sub-input-container {
    margin-bottom: 20px;
    
    .sub-input {
      :deep(.el-input__wrapper) {
        height: 44px;
        font-size: 14px;
      }
      :deep(.el-input-group__append) {
        padding: 0;
        
        .el-button {
          margin: 0;
          border: none;
          background: transparent;
          font-weight: 600;
          color: var(--el-color-primary);
          height: 100%;
          padding: 0 20px;
          border-radius: 0;
          font-size: 14px;
          
          &:hover {
            background-color: var(--el-fill-color-light);
          }
        }
      }
    }
  }
  
  .sub-actions {
    display: flex;
    gap: 12px;
    
    .clash-btn {
      flex: 1;
      height: 44px;
      font-weight: 600;
      font-size: 14px;
    }
  }
}

/* Quick Actions Card Design */
.action-card {
  .card-body-actions {
    padding: 8px 0;
  }
  
  .action-list {
    display: flex;
    flex-direction: column;
    
    .action-item {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 12px 20px;
      border-bottom: 1px solid var(--el-border-color-lighter);
      transition: background-color 0.2s ease;
      
      &:last-child {
        border-bottom: none;
      }
      
      &:hover {
        background-color: var(--el-fill-color-blank);
      }
      
      .action-info {
        display: flex;
        flex-direction: column;
        gap: 3px;
        flex: 1;
        padding-right: 12px;
        
        .action-name {
          font-size: 14px;
          font-weight: 600;
          color: var(--el-text-color-primary);
        }
        
        .action-desc {
          font-size: 12px;
          color: var(--el-text-color-secondary);
        }
      }
      
      .el-button {
        width: 88px;
        height: 38px;
        font-weight: 600;
        font-size: 13px;
      }
    }
  }
}

/* Top 10 Domains Visited Design */
.domain-card {
  .card-body {
    padding: 20px;
  }
  
  .empty-state {
    padding: 40px 0;
    display: flex;
    justify-content: center;
    align-items: center;
  }
  
  .domain-list {
    display: flex;
    flex-direction: column;
    gap: 14px;
  }
  
  .domain-item {
    display: flex;
    align-items: center;
    font-size: 13px;
    
    .domain-rank-info {
      display: flex;
      align-items: center;
      width: 220px;
      overflow: hidden;
      
      .rank-badge {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        width: 20px;
        height: 20px;
        flex-shrink: 0;
        border-radius: 50%;
        font-size: 11px;
        font-weight: 700;
        margin-right: 12px;
        background-color: var(--el-fill-color-darker);
        color: var(--el-text-color-secondary);
        
        &.rank-1 { background-color: #ef4444; color: white; }
        &.rank-2 { background-color: #f59e0b; color: white; }
        &.rank-3 { background-color: #3b82f6; color: white; }
      }
      
      .domain-name {
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
        font-weight: 600;
        color: var(--el-text-color-primary);
      }
    }
    
    .domain-bar-section {
      flex: 1;
      padding: 0 16px;
      
      .domain-progress-bar {
        margin: 0;
      }
    }
    
    .visit-count {
      width: 60px;
      text-align: right;
      font-size: 12px;
      color: var(--el-text-color-secondary);
      font-weight: 600;
    }
  }
}

/* IP Card Design */
.ip-card {
  .ip-table {
    margin: 0;
  }
  
  .ip-address-text {
    font-family: var(--el-font-family-monospace);
    font-size: 13px;
    font-weight: 600;
    color: var(--el-text-color-primary);
  }
  
  .geoip-loading {
    color: var(--el-color-primary);
    display: flex;
    align-items: center;
    gap: 6px;
    font-size: 12px;
  }
  
  .geoip-error {
    color: var(--el-text-color-placeholder);
    font-size: 12px;
  }
  
  .geoip-info-cell {
    display: flex;
    flex-direction: column;
    gap: 4px;
    
    .country-badge {
      background-color: var(--el-color-primary-light-9);
      color: var(--el-color-primary);
      padding: 1px 6px;
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

/* Responsive Scaling */
@media (max-width: 768px) {
  .profile-hero-card {
    flex-direction: column;
    align-items: flex-start;
    padding: 20px;
    
    .hero-right {
      width: 100%;
      justify-content: space-between;
      border-top: 1px solid rgba(255, 255, 255, 0.05);
      padding-top: 16px;
      gap: 12px;
      
      .metric-divider {
        display: none;
      }
    }
  }
}

/* Unified Tabs Dashboard */
.dashboard-tabs-card {
  margin-top: 12px;
  background-color: var(--el-bg-color-overlay);
  border-radius: 16px;
  border: 1px solid var(--el-border-color-light);
  box-shadow: var(--el-box-shadow-light);

  :deep(.el-card__body) {
    padding: 24px;
    height: 600px;
    box-sizing: border-box;
    display: flex;
    flex-direction: column;
  }

  .dashboard-tabs {
    flex: 1;
    display: flex;
    flex-direction: column;
    height: 100%;

    :deep(.el-tabs__header) {
      margin-bottom: 20px;
    }

    :deep(.el-tabs__content) {
      flex: 1;
      overflow: hidden;
      display: flex;
      flex-direction: column;
    }

    :deep(.el-tab-pane) {
      flex: 1;
      height: 100%;
      overflow: hidden;
      display: flex;
      flex-direction: column;
    }
  }
}

.tab-content-split {
  display: flex;
  gap: 24px;
  height: 100%;
  flex: 1;
  overflow: hidden;
}

.split-section {
  flex: 1;
  display: flex;
  flex-direction: column;
  height: 100%;
  overflow: hidden;
  
  .section-header-sub {
    margin-bottom: 12px;
    display: flex;
    justify-content: space-between;
    align-items: center;
    
    .sub-title {
      font-size: 14px;
      font-weight: 700;
      color: var(--el-text-color-primary);
    }
  }
}

.pulsating-tag {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-weight: 600;
  
  .pulse-dot {
    width: 6px;
    height: 6px;
    background-color: var(--el-color-success);
    border-radius: 50%;
    display: inline-block;
    box-shadow: 0 0 8px var(--el-color-success);
    animation: pulse 1.8s infinite;
  }
}

@keyframes pulse {
  0% { transform: scale(0.9); opacity: 0.7; }
  50% { transform: scale(1.2); opacity: 1; }
  100% { transform: scale(0.9); opacity: 0.7; }
}

.active-conns-table, .ip-table {
  flex: 1;
  border-radius: 8px;
  border: 1px solid var(--el-border-color-lighter);
  background-color: var(--el-bg-color-page);
  
  .port-sub-text {
    font-size: 11px;
    color: var(--el-text-color-secondary);
    margin-top: 2px;
  }
  
  .conn-time-badge {
    background-color: rgba(59, 130, 246, 0.1);
    color: var(--el-color-primary);
    padding: 2px 6px;
    border-radius: 4px;
    font-size: 11px;
    font-weight: 600;
  }
}

/* Traffic Trend Tab */

.echarts-container {
  flex: 1;
  width: 100%;
  min-height: 280px;
}

/* Compliance split */
.compliance-split {
  .split-col {
    flex: 1;
    display: flex;
    flex-direction: column;
    height: 100%;
    overflow: hidden;
    
    &.gauge-section {
      align-items: center;
      justify-content: center;
      
      .gauge-chart-box {
        min-height: 200px;
        flex: 1;
      }
      
      .score-explain-text {
        font-size: 12px;
        font-weight: 600;
        color: var(--el-text-color-secondary);
        margin-top: -12px;
        margin-bottom: 24px;
        text-align: center;
      }
    }
    
    &.domain-list-section {
      flex: 1.1;
      
      .domain-scroll-wrap {
        flex: 1;
        overflow-y: auto;
        padding-right: 8px;
        
        &::-webkit-scrollbar {
          width: 6px;
        }
        &::-webkit-scrollbar-thumb {
          background-color: var(--el-border-color-lighter);
          border-radius: 3px;
        }
      }
      
      .domain-item-mini {
        display: flex;
        align-items: center;
        padding: 8px 4px;
        border-bottom: 1px solid var(--el-border-color-lighter);
        font-size: 12px;
        
        &:last-child {
          border-bottom: none;
        }
        
        .rank-badge-mini {
          width: 18px;
          height: 18px;
          border-radius: 50%;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          font-size: 10px;
          font-weight: 700;
          margin-right: 8px;
          background-color: var(--el-fill-color-darker);
          color: var(--el-text-color-secondary);
          flex-shrink: 0;
          
          &.rank-1 { background-color: #ef4444; color: white; }
          &.rank-2 { background-color: #f59e0b; color: white; }
          &.rank-3 { background-color: #3b82f6; color: white; }
        }
        
        .domain-name-mini {
          flex: 1;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
          font-weight: 600;
          color: var(--el-text-color-primary);
        }
        
        .visit-count-mini {
          font-size: 11px;
          font-weight: 600;
          color: var(--el-text-color-secondary);
          margin-left: 8px;
        }
      }
    }
  }
}

/* Responsive Scaling */
@media (max-width: 768px) {
  .profile-hero-card {
    flex-direction: column;
    align-items: flex-start;
    padding: 20px;
    
    .hero-right {
      width: 100%;
      justify-content: space-between;
      border-top: 1px solid rgba(255, 255, 255, 0.05);
      padding-top: 16px;
      gap: 12px;
      
      .metric-divider {
        display: none;
      }
    }
  }
  
  .tab-content-split {
    flex-direction: column;
    overflow-y: auto;
  }
}

/* Align left and right columns to equal height on desktop */
@media (min-width: 992px) {
  .col-left, .col-right {
    display: flex;
    flex-direction: column;
    
    .stat-card {
      margin-bottom: 24px;
      
      &:last-child {
        margin-bottom: 0;
      }
    }
  }
  
  .col-left {
    .domain-card {
      flex: 1;
      display: flex;
      flex-direction: column;
      
      :deep(.el-card__body) {
        flex: 1;
        display: flex;
        flex-direction: column;
      }
    }
  }
  
  .col-right {
    .action-card {
      flex: 1;
      display: flex;
      flex-direction: column;
      
      :deep(.el-card__body) {
        flex: 1;
        display: flex;
        flex-direction: column;
      }
    }
  }
}
</style>
