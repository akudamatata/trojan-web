<template>
  <div class="dashboard-container">
    <!-- Row 2: Traffic Counters (Upload, Download, Total) -->
    <div class="traffic-grid">
      <el-card class="traffic-card upload" shadow="never">
        <div class="traffic-icon-wrap">
          <span>▲</span>
        </div>
        <div class="traffic-info">
          <span>{{ $t('dashboard.upload') }}</span>
          <h2>{{ uploadData }}</h2>
        </div>
      </el-card>

      <el-card class="traffic-card download" shadow="never">
        <div class="traffic-icon-wrap">
          <span>▼</span>
        </div>
        <div class="traffic-info">
          <span>{{ $t('dashboard.download') }}</span>
          <h2>{{ downloadData }}</h2>
        </div>
      </el-card>

      <el-card class="traffic-card total" shadow="never">
        <div class="traffic-icon-wrap">
          <span>⇄</span>
        </div>
        <div class="traffic-info">
          <span>{{ $t('dashboard.total') }}</span>
          <h2>{{ totalData }}</h2>
        </div>
      </el-card>
    </div>

    <!-- Row 2.5: Real-time SVG Trend Charts (Only for Admin) -->
    <div v-if="isAdmin" class="charts-grid">
      <el-card class="chart-card" shadow="never">
        <template #header>
          <div class="chart-header">
            <span class="chart-title">{{ $t('dashboard.sysResourceTrend') }}</span>
            <div class="chart-legends">
              <span class="legend-item"><span class="legend-dot cpu"></span>CPU: {{ cpu.percentage }}%</span>
              <span class="legend-item"><span class="legend-dot mem"></span>{{ $t('dashboard.memory') }}: {{ memory.percentage }}%</span>
            </div>
          </div>
        </template>
        <div class="chart-body">
          <div class="y-axis-labels" style="width: 38px;">
            <span class="y-label">100%</span>
            <span class="y-label">80%</span>
            <span class="y-label">50%</span>
            <span class="y-label">20%</span>
            <span class="y-label">0%</span>
          </div>
          <div class="chart-main-wrap" style="padding-right: 38px;">
            <div class="trend-svg-wrap">
              <svg class="trend-svg" viewBox="0 0 500 120" preserveAspectRatio="none">
                <!-- 网格线 -->
                <line x1="0" y1="30" x2="500" y2="30" stroke="rgba(255,255,255,0.03)" />
                <line x1="0" y1="60" x2="500" y2="60" stroke="rgba(255,255,255,0.03)" />
                <line x1="0" y1="90" x2="500" y2="90" stroke="rgba(255,255,255,0.03)" />
                
                <defs>
                  <linearGradient id="cpuGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stop-color="#10b981" stop-opacity="0.15"/>
                    <stop offset="100%" stop-color="#10b981" stop-opacity="0.0"/>
                  </linearGradient>
                  <linearGradient id="memGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stop-color="#3b82f6" stop-opacity="0.15"/>
                    <stop offset="100%" stop-color="#3b82f6" stop-opacity="0.0"/>
                  </linearGradient>
                </defs>

                <!-- 渐变区域 -->
                <path :d="cpuAreaPath" fill="url(#cpuGrad)" v-if="cpuAreaPath" />
                <path :d="memAreaPath" fill="url(#memGrad)" v-if="memAreaPath" />

                <!-- 折线 -->
                <path :d="cpuLinePath" fill="none" stroke="#10b981" stroke-width="2" stroke-linecap="round" v-if="cpuLinePath" />
                <path :d="memLinePath" fill="none" stroke="#3b82f6" stroke-width="2" stroke-linecap="round" v-if="memLinePath" />
              </svg>
            </div>
          </div>
        </div>
      </el-card>

      <el-card class="chart-card" shadow="never">
        <template #header>
          <div class="chart-header">
            <span class="chart-title">{{ $t('dashboard.storageResourceTrend') }}</span>
            <div class="chart-legends">
              <span class="legend-item"><span class="legend-dot disk"></span>{{ $t('dashboard.disk') }}: {{ disk.percentage }}%</span>
              <span class="legend-item"><span class="legend-dot swap"></span>Swap: {{ swap.percentage }}%</span>
            </div>
          </div>
        </template>
        <div class="chart-body">
          <div class="y-axis-labels" style="width: 38px;">
            <span class="y-label">100%</span>
            <span class="y-label">80%</span>
            <span class="y-label">50%</span>
            <span class="y-label">20%</span>
            <span class="y-label">0%</span>
          </div>
          <div class="chart-main-wrap" style="padding-right: 38px;">
            <div class="trend-svg-wrap">
              <svg class="trend-svg" viewBox="0 0 500 120" preserveAspectRatio="none">
                <!-- 网格线 -->
                <line x1="0" y1="30" x2="500" y2="30" stroke="rgba(255,255,255,0.03)" />
                <line x1="0" y1="60" x2="500" y2="60" stroke="rgba(255,255,255,0.03)" />
                <line x1="0" y1="90" x2="500" y2="90" stroke="rgba(255,255,255,0.03)" />
                
                <defs>
                  <linearGradient id="diskGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stop-color="#f59e0b" stop-opacity="0.15"/>
                    <stop offset="100%" stop-color="#f59e0b" stop-opacity="0.0"/>
                  </linearGradient>
                  <linearGradient id="swapGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stop-color="#8b5cf6" stop-opacity="0.15"/>
                    <stop offset="100%" stop-color="#8b5cf6" stop-opacity="0.0"/>
                  </linearGradient>
                </defs>

                <!-- 渐变区域 -->
                <path :d="diskAreaPath" fill="url(#diskGrad)" v-if="diskAreaPath" />
                <path :d="swapAreaPath" fill="url(#swapGrad)" v-if="swapAreaPath" />

                <!-- 折线 -->
                <path :d="diskLinePath" fill="none" stroke="#f59e0b" stroke-width="2" stroke-linecap="round" v-if="diskLinePath" />
                <path :d="swapLinePath" fill="none" stroke="#8b5cf6" stroke-width="2" stroke-linecap="round" v-if="swapLinePath" />
              </svg>
            </div>
          </div>
        </div>
      </el-card>

      <el-card class="chart-card" shadow="never">
        <template #header>
          <div class="chart-header">
            <span class="chart-title">{{ $t('dashboard.netSpeedTrend') }}</span>
            <div class="chart-legends">
              <span class="legend-item"><span class="legend-dot up"></span>{{ $t('dashboard.upload') }}: {{ netSpeed.up }}</span>
              <span class="legend-item"><span class="legend-dot down"></span>{{ $t('dashboard.download') }}: {{ netSpeed.down }}</span>
            </div>
          </div>
        </template>
        <div class="chart-body">
          <div class="y-axis-labels" style="width: 78px;">
            <span class="y-label">{{ getNetSpeedYLabel(1.0) }}</span>
            <span class="y-label">{{ getNetSpeedYLabel(0.8) }}</span>
            <span class="y-label">{{ getNetSpeedYLabel(0.5) }}</span>
            <span class="y-label">{{ getNetSpeedYLabel(0.2) }}</span>
            <span class="y-label">0 B/s</span>
          </div>
          <div class="chart-main-wrap" style="padding-right: 78px;">
            <div class="trend-svg-wrap">
              <svg class="trend-svg" viewBox="0 0 500 120" preserveAspectRatio="none">
                <!-- 网格线 -->
                <line x1="0" y1="30" x2="500" y2="30" stroke="rgba(255,255,255,0.03)" />
                <line x1="0" y1="60" x2="500" y2="60" stroke="rgba(255,255,255,0.03)" />
                <line x1="0" y1="90" x2="500" y2="90" stroke="rgba(255,255,255,0.03)" />

                <defs>
                  <linearGradient id="upGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stop-color="#10b981" stop-opacity="0.15"/>
                    <stop offset="100%" stop-color="#10b981" stop-opacity="0.0"/>
                  </linearGradient>
                  <linearGradient id="downGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stop-color="#3b82f6" stop-opacity="0.15"/>
                    <stop offset="100%" stop-color="#3b82f6" stop-opacity="0.0"/>
                  </linearGradient>
                </defs>

                <!-- 渐变区域 -->
                <path :d="upAreaPath" fill="url(#upGrad)" v-if="upAreaPath" />
                <path :d="downAreaPath" fill="url(#downGrad)" v-if="downAreaPath" />

                <!-- 折线 -->
                <path :d="upLinePath" fill="none" stroke="#10b981" stroke-width="2" stroke-linecap="round" v-if="upLinePath" />
                <path :d="downLinePath" fill="none" stroke="#3b82f6" stroke-width="2" stroke-linecap="round" v-if="downLinePath" />
              </svg>
            </div>
          </div>
        </div>
      </el-card>

      <el-card class="chart-card" shadow="never">
        <template #header>
          <div class="chart-header">
            <span class="chart-title">{{ $t('dashboard.trafficTrend') }} ({{ historyTrafficType === 'day' ? $t('dashboard.dayDimension') : $t('dashboard.weekDimension') }})</span>
            <div style="display: flex; align-items: center; gap: 12px;">
              <el-radio-group v-model="historyTrafficType" size="small" @change="fetchTrafficHistory" class="mini-radio-group">
                <el-radio-button label="day">{{ $t('dashboard.dayUnit') }}</el-radio-button>
                <el-radio-button label="week">{{ $t('dashboard.weekUnit') }}</el-radio-button>
              </el-radio-group>
              <div class="chart-legends" style="margin-left: 4px;">
                <span class="legend-item"><span class="legend-dot up"></span>{{ $t('dashboard.upload') }}</span>
                <span class="legend-item"><span class="legend-dot down"></span>{{ $t('dashboard.download') }}</span>
              </div>
            </div>
          </div>
        </template>
        <div class="chart-body" style="height: 155px;">
          <div class="y-axis-labels" style="width: 48px;">
            <span class="y-label">{{ getTrafficHistoryYLabel(1.0) }}</span>
            <span class="y-label">{{ getTrafficHistoryYLabel(0.8) }}</span>
            <span class="y-label">{{ getTrafficHistoryYLabel(0.5) }}</span>
            <span class="y-label">{{ getTrafficHistoryYLabel(0.2) }}</span>
            <span class="y-label">0 B</span>
          </div>
          <div class="chart-main-wrap" style="padding-right: 48px;">
            <div class="trend-svg-wrap">
              <svg class="trend-svg" viewBox="0 0 500 120" preserveAspectRatio="none">
                <!-- 网格线 -->
                <line x1="0" y1="30" x2="500" y2="30" stroke="rgba(255,255,255,0.03)" />
                <line x1="0" y1="60" x2="500" y2="60" stroke="rgba(255,255,255,0.03)" />
                <line x1="0" y1="90" x2="500" y2="90" stroke="rgba(255,255,255,0.03)" />

                <defs>
                  <linearGradient id="histUpGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stop-color="#10b981" stop-opacity="0.15"/>
                    <stop offset="100%" stop-color="#10b981" stop-opacity="0.0"/>
                  </linearGradient>
                  <linearGradient id="histDownGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stop-color="#3b82f6" stop-opacity="0.15"/>
                    <stop offset="100%" stop-color="#3b82f6" stop-opacity="0.0"/>
                  </linearGradient>
                </defs>

                <!-- 渐变区域 -->
                <path :d="historyTrafficUpArea" fill="url(#histUpGrad)" v-if="historyTrafficUpArea" />
                <path :d="historyTrafficDownArea" fill="url(#histDownGrad)" v-if="historyTrafficDownArea" />

                <!-- 折线 -->
                <path :d="historyTrafficUpLine" fill="none" stroke="#10b981" stroke-width="2" stroke-linecap="round" v-if="historyTrafficUpLine" />
                <path :d="historyTrafficDownLine" fill="none" stroke="#3b82f6" stroke-width="2" stroke-linecap="round" v-if="historyTrafficDownLine" />
              </svg>
            </div>
            <div class="x-axis-labels">
              <span v-for="item in historyTrafficList" :key="item.label">{{ item.label }}</span>
            </div>
          </div>
        </div>
      </el-card>
    </div>

    <!-- Row 3: Server Information & Stats Grid -->
    <div class="info-grid">
      <el-card class="info-card" :header="$t('dashboard.sysServiceStatus')" shadow="never">
        <div class="card-content">
          <div class="info-item">
            <span class="info-label">{{ $t('dashboard.trojanVer') }}</span>
            <span class="info-value text-glow">{{ trojanVersion || '1.16.0' }}</span>
          </div>
          <div class="info-item">
            <span class="info-label">{{ $t('dashboard.runTime') }}</span>
            <span class="info-value">{{ trojanUptime }}</span>
          </div>
          <div class="info-item">
            <span class="info-label">{{ $t('dashboard.serviceType') }}</span>
            <span class="info-value status-badge">{{ $store.state.trojanType || 'trojan' }}</span>
          </div>
        </div>
      </el-card>

      <el-card class="info-card" :header="$t('dashboard.netConnectLoad')" shadow="never" v-if="isAdmin">
        <div class="card-content">
          <div class="info-item">
            <span class="info-label">{{ $t('dashboard.sysLoad') }}</span>
            <span class="info-value">{{ load }}</span>
          </div>
          <div class="info-item">
            <span class="info-label">{{ $t('dashboard.netConnectCount') }}</span>
            <span class="info-value">{{ netCount }}</span>
          </div>
          
          
          <div class="info-item traffic-quota-item">
            <div class="quota-meta">
              <span class="info-label">{{ $t('dashboard.serverQuota') }}</span>
              <span v-if="serverTotalQuota !== -1" :class="{'quota-warning-text': true, 'warning': serverUsePercent >= 80}">
                {{ serverUsePercent >= 80 ? $t('dashboard.quotaExceed') : $t('dashboard.quotaEnough') }}
              </span>
              <span v-else class="quota-warning-text normal">{{ $t('dashboard.noLimit') }}</span>
            </div>
            <div class="quota-progress-wrapper" v-if="serverTotalQuota !== -1">
              <el-progress 
                :percentage="serverUsePercent" 
                :stroke-width="12" 
                :show-text="false"
                :color="serverUsePercent >= 80 ? '#ef4444' : '#6366f1'"
                class="mini-progress"
              />
              <span class="progress-percent-text">{{ serverUsePercent }}%</span>
            </div>
            <div class="quota-details">
              <span>{{ $t('dashboard.usedTraffic') }}：{{ formatBytes(serverUsedTraffic) }}</span>
              <span>{{ $t('dashboard.quotaLimit') }}：{{ serverTotalQuota !== -1 ? formatBytes(serverTotalQuota) : $t('dashboard.noLimit') }}</span>
            </div>
          </div>
        </div>
      </el-card>

      <el-card class="info-card" :header="$t('dashboard.userConsole')" shadow="never">
        <div class="card-content">
          <div class="info-item">
            <span class="info-label">{{ $t('dashboard.totalUsers') }}</span>
            <span class="info-value link-value" @click="navigate('/user')">
              {{ userList.length }}{{ $t('dashboard.userUnit') }}
            </span>
          </div>
          <div class="info-item" v-if="isAdmin">
            <span class="info-label">{{ $t('dashboard.runStatus') }}</span>
            <span class="info-value status-online">{{ $t('dashboard.running') }}</span>
          </div>
          <div class="info-item">
            <span class="info-label">{{ $t('dashboard.securityStatus') }}</span>
            <span class="info-value status-safe">{{ $t('dashboard.safeStatus') }}</span>
          </div>
        </div>
      </el-card>
    </div>

    <!-- Top 10 流量使用用户排行榜 -->
    <div v-if="isAdmin" class="top-users-container">
      <el-card class="top-users-card" :header="$t('dashboard.topUsersTitle')" shadow="never">
        <el-table :data="top10Users" style="width: 100%" class="top-users-table">
          <el-table-column type="index" :label="$t('dashboard.rank')" width="80" align="center">
            <template #default="scope">
              <span :class="'rank-badge rank-' + (scope.$index + 1)">{{ scope.$index + 1 }}</span>
            </template>
          </el-table-column>
          <el-table-column prop="Username" :label="$t('dashboard.username')" />
          <el-table-column prop="Upload" :label="$t('dashboard.usedUpload')" :formatter="formatTableBytes" />
          <el-table-column prop="Download" :label="$t('dashboard.usedDownload')" :formatter="formatTableBytes" />
          <el-table-column :label="$t('dashboard.totalUsedTraffic')">
            <template #default="scope">
              <span :class="{'quota-warning-text': isUserQuotaWarning(scope.row)}">{{ formatBytes(scope.row.Upload + scope.row.Download) }}</span>
            </template>
          </el-table-column>
        </el-table>
      </el-card>
    </div>
  </div>
</template>

<script>
import { version, serverInfo, getTrafficHistory } from '@/api/common'
import { userList } from '@/api/user'
import { readablizeBytes } from '@/utils/common'
import { mapState } from 'vuex'

export default {
    data() {
        return {
            timer: null,
            trojanVersion: '',
            trojanUptime: '',
            keyOffset: 0,
            valueOffset: 0,
            userList: [],
            downloadData: 0,
            uploadData: 0,
            totalData: 0,
            cpu: { percentage: 0, color: '' },
            memory: { percentage: 0, used: 0, total: 0, color: '' },
            swap: { percentage: 0, used: 0, total: 0, color: '' },
            disk: { percentage: 0, used: 0, total: 0, color: '' },
            load: '',
            netSpeed: { up: '', down: '' },
            netCount: '',
            serverTotalQuota: -1,
            serverUsedTraffic: 0,
            top10Users: [],
            historyPoints: {
                cpu: [],
                memory: [],
                disk: [],
                swap: [],
                upSpeed: [],
                downSpeed: []
            },
            maxPoints: 20,
            historyTrafficType: 'day',
            historyTrafficList: []
        }
    },
    computed: {
        ...mapState(['isAdmin']),
        serverUsePercent() {
            if (this.serverTotalQuota <= 0) {
                return 0
            }
            const percent = (this.serverUsedTraffic / this.serverTotalQuota) * 100
            return parseFloat(percent.toFixed(2))
        },
        cpuLinePath() {
            return this.generateSvgPath(this.historyPoints.cpu, 100, false)
        },
        cpuAreaPath() {
            return this.generateSvgPath(this.historyPoints.cpu, 100, true)
        },
        memLinePath() {
            return this.generateSvgPath(this.historyPoints.memory, 100, false)
        },
        memAreaPath() {
            return this.generateSvgPath(this.historyPoints.memory, 100, true)
        },
        upLinePath() {
            return this.generateSvgPath(this.historyPoints.upSpeed, 'dynamic', false)
        },
        upAreaPath() {
            return this.generateSvgPath(this.historyPoints.upSpeed, 'dynamic', true)
        },
        downLinePath() {
            return this.generateSvgPath(this.historyPoints.downSpeed, 'dynamic', false)
        },
        downAreaPath() {
            return this.generateSvgPath(this.historyPoints.downSpeed, 'dynamic', true)
        },
        diskLinePath() {
            return this.generateSvgPath(this.historyPoints.disk, 100, false)
        },
        diskAreaPath() {
            return this.generateSvgPath(this.historyPoints.disk, 100, true)
        },
        swapLinePath() {
            return this.generateSvgPath(this.historyPoints.swap, 100, false)
        },
        swapAreaPath() {
            return this.generateSvgPath(this.historyPoints.swap, 100, true)
        },
        historyTrafficUpPoints() {
            return this.historyTrafficList.map(item => item.up)
        },
        historyTrafficDownPoints() {
            return this.historyTrafficList.map(item => item.down)
        },
        historyTrafficUpLine() {
            return this.generateHistorySvgPath(this.historyTrafficUpPoints, false)
        },
        historyTrafficUpArea() {
            return this.generateHistorySvgPath(this.historyTrafficUpPoints, true)
        },
        historyTrafficDownLine() {
            return this.generateHistorySvgPath(this.historyTrafficDownPoints, false)
        },
        historyTrafficDownArea() {
            return this.generateHistorySvgPath(this.historyTrafficDownPoints, true)
        }
    },
    created() {
        this.$store.commit('SET_NPROGRESS', false)
        this.setOffset()
        this.getVersion()
        this.getUserList()
    },
    mounted() {
        if (this.isAdmin) {
            this.getServerInfo()
            this.fetchTrafficHistory()
        }
        this.timer = setInterval(() => {
            if (this.isAdmin) {
                this.getServerInfo()
                this.fetchTrafficHistory()
            }
            this.getVersion()
            this.getUserList()
        }, 10000)
        window.onresize = () => {
            return (() => {
                this.setOffset()
            })()
        }
    },
    unmounted() {
        this.$store.commit('SET_NPROGRESS', true)
        clearInterval(this.timer)
    },
    methods: {
        setOffset() {
            const clientWith = document.body.clientWidth
            if (clientWith < 1000) {
                this.keyOffset = 1
                this.valueOffset = 2
                this.iconShow = false
            } else {
                this.keyOffset = 0
                this.valueOffset = 0
                this.iconShow = true
            }
        },
        navigate(path) {
            this.$router.push({ path: path })
        },
        getServerInfo() {
            serverInfo().then((res) => {
                const data = res.Data
                this.cpu.percentage = parseFloat(data.cpu[0].toFixed(2))
                this.cpu.color = this.computeColor(this.cpu.percentage)
                this.memory = this.computePercent(data.memory)
                this.swap = this.computePercent(data.swap)
                this.disk = this.computePercent(data.disk)
                this.netSpeed.up = readablizeBytes(data.speed.Up) + '/s'
                this.netSpeed.down = readablizeBytes(data.speed.Down) + '/s'
                this.netCount = data.netCount.tcp + ' / ' + data.netCount.udp
                this.load = data.load.load1 + ', ' + data.load.load5 + ', ' + data.load.load15
                this.serverTotalQuota = data.serverTotalQuota
                this.serverUsedTraffic = data.serverUsedTraffic
                this.top10Users = data.top10Users || []

                const history = this.historyPoints
                if (history.cpu.length === 0) {
                    for (let i = 0; i < this.maxPoints; i++) {
                        history.cpu.push(this.cpu.percentage)
                        history.memory.push(this.memory.percentage)
                        history.disk.push(this.disk.percentage)
                        history.swap.push(this.swap.percentage)
                        history.upSpeed.push(data.speed.Up)
                        history.downSpeed.push(data.speed.Down)
                    }
                } else {
                    history.cpu.push(this.cpu.percentage)
                    history.memory.push(this.memory.percentage)
                    history.disk.push(this.disk.percentage)
                    history.swap.push(this.swap.percentage)
                    history.upSpeed.push(data.speed.Up)
                    history.downSpeed.push(data.speed.Down)
                    if (history.cpu.length > this.maxPoints) {
                        history.cpu.shift()
                        history.memory.shift()
                        history.disk.shift()
                        history.swap.shift()
                        history.upSpeed.shift()
                        history.downSpeed.shift()
                    }
                }
            })
        },
        computePercent(data) {
            const percent = parseFloat(data.usedPercent.toFixed(2))
            return {
                percentage: percent,
                used: readablizeBytes(data.used),
                total: readablizeBytes(data.total),
                color: this.computeColor(percent)
            }
        },
        computeColor(percent) {
            if (percent < 80) {
                return '#10b981'
            } else if (percent < 90) {
                return '#f59e0b'
            } else {
                return '#ef4444'
            }
        },
        async getUserList() {
            const result = await userList()
            if (result.Msg === 'success') {
                const data = result.Data
                this.userList = data.userList
                let download = 0; let upload = 0
                for (let i = 0; i < this.userList.length; i++) {
                    download += this.userList[i].Download
                    upload += this.userList[i].Upload
                }
                this.downloadData = readablizeBytes(download)
                this.uploadData = readablizeBytes(upload)
                this.totalData = readablizeBytes(download + upload)
            } else {
                this.$message.error(result.Msg)
            }
        },
        async getVersion() {
            const result = await version()
            const data = result.Data || {}
            this.trojanVersion = data.TrojanVersion || data.trojanVersion || ''
            this.trojanUptime = this.parseUptime(data.TrojanUptime || data.trojanUptime || '')
        },
        parseUptime(uptime) {
            if (!uptime) return ''
            let result = ''
            if (uptime.indexOf('-') !== -1) {
                const splitInfo = uptime.split('-')
                result += splitInfo[0] + `${this.$t('dashboard.day')} `
                const timeInfo = splitInfo[1].split(':')
                result += timeInfo[0] + `${this.$t('dashboard.hour')} `
                result += timeInfo[1] + `${this.$t('dashboard.minute')} `
                result += timeInfo[2] + `${this.$t('dashboard.second')} `
            } else {
                const splitInfo = uptime.split(':')
                if (splitInfo.length === 3) {
                    result += splitInfo[0] + `${this.$t('dashboard.hour')} `
                    result += splitInfo[1] + `${this.$t('dashboard.minute')} `
                    result += splitInfo[2] + `${this.$t('dashboard.second')} `
                } else if (splitInfo.length === 2) {
                    result += splitInfo[0] + `${this.$t('dashboard.minute')} `
                    result += splitInfo[1] + `${this.$t('dashboard.second')} `
                }
            }
            return result
        },
        formatBytes(bytes) {
            return readablizeBytes(bytes)
        },
        formatTableBytes(row, column, cellValue) {
            return readablizeBytes(cellValue)
        },
        generateSvgPath(points, maxVal = 100, isArea = false) {
            if (points.length < 2) return ''
            let actualMax = maxVal
            if (maxVal === 'dynamic') {
                const maxInPoints = Math.max(...points)
                actualMax = maxInPoints > 1024 ? maxInPoints : 1024
            }
            const stepX = 500 / (this.maxPoints - 1)
            let path = ''
            const startX = 500 - (points.length - 1) * stepX
            points.forEach((val, index) => {
                const x = startX + index * stepX
                const ratio = val / actualMax
                const y = 110 - (ratio > 1 ? 1 : ratio) * 100
                if (index === 0) {
                    path += `M ${x.toFixed(1)} ${y.toFixed(1)}`
                } else {
                    path += ` L ${x.toFixed(1)} ${y.toFixed(1)}`
                }
            })
            if (isArea) {
                const firstX = startX
                const lastX = 500
                path += ` L ${lastX.toFixed(1)} 120 L ${firstX.toFixed(1)} 120 Z`
            }
            return path
        },
        isUserQuotaWarning(row) {
            if (!row || row.Quota === -1 || row.Quota === 0) return false
            const total = row.Upload + row.Download
            return total >= row.Quota * 0.8
        },
        async fetchTrafficHistory() {
            try {
                const res = await getTrafficHistory({ type: this.historyTrafficType })
                if (res.Msg === 'success') {
                    this.historyTrafficList = res.Data || []
                }
            } catch (err) {
                console.error(err)
            }
        },
        generateHistorySvgPath(points, isArea = false) {
            if (!points || points.length < 2) return ''
            const maxVal = Math.max(...points)
            const actualMax = maxVal > 0 ? maxVal : 1024
            const count = points.length
            const stepX = 500 / (count - 1)
            let path = ''
            points.forEach((val, index) => {
                const x = index * stepX
                const ratio = val / actualMax
                const y = 110 - (ratio > 1 ? 1 : ratio) * 100
                if (index === 0) {
                    path += `M ${x.toFixed(1)} ${y.toFixed(1)}`
                } else {
                    path += ` L ${x.toFixed(1)} ${y.toFixed(1)}`
                }
            })
            if (isArea) {
                path += ` L 500 120 L 0 120 Z`
            }
            return path
        },
        getNetSpeedYLabel(ratio) {
            const points = this.historyPoints.upSpeed.concat(this.historyPoints.downSpeed)
            if (points.length === 0) return '0 B/s'
            const maxInPoints = Math.max(...points)
            const actualMax = maxInPoints > 1024 ? maxInPoints : 1024
            return readablizeBytes(actualMax * ratio) + '/s'
        },
        getTrafficHistoryYLabel(ratio) {
            const points = this.historyTrafficUpPoints.concat(this.historyTrafficDownPoints)
            if (points.length === 0) return '0 B'
            const maxVal = Math.max(...points)
            const actualMax = maxVal > 0 ? maxVal : 1024
            return readablizeBytes(actualMax * ratio)
        }
    }
}
</script>

<style lang="scss" scoped>
.dashboard-container {
  padding: 24px;
  background-color: var(--el-bg-color-page);
  min-height: calc(100vh - 50px);
}

.metrics-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 20px;
  margin-bottom: 24px;
}

.metric-card {
  border-radius: 12px !important;
  background: #111827 !important;
  border: 1px solid #1f2937 !important;
  
  .metric-content {
    display: flex;
    align-items: center;
    gap: 16px;
    padding: 10px 5px;
  }

  .metric-icon-wrap {
    width: 48px;
    height: 48px;
    border-radius: 10px;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
    
    &.cpu { background-color: rgba(16, 185, 129, 0.08); color: #10b981; }
    &.mem { background-color: rgba(59, 130, 246, 0.08); color: #3b82f6; }
    &.disk { background-color: rgba(245, 158, 11, 0.08); color: #f59e0b; }
    &.swap { background-color: rgba(139, 92, 246, 0.08); color: #8b5cf6; }
  }
  
  .metric-info {
    .metric-title {
      font-size: 13px;
      color: #9ca3af;
      margin: 0 0 6px 0;
      font-weight: 500;
    }
    .metric-value {
      font-size: 16px;
      color: #ffffff;
      margin: 0;
      font-weight: 600;
    }
  }
}

.quota-warning-text {
  color: #ef4444 !important;
  font-weight: 600 !important;
}

.traffic-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 20px;
  margin-bottom: 24px;

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
}

.traffic-card {
  display: flex;
  align-items: center;
  gap: 20px;
  padding: 16px 20px;
  border-radius: 12px !important;
  position: relative;
  overflow: hidden;
  background: var(--el-bg-color-overlay) !important;
  border: 1px solid var(--el-border-color) !important;
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    width: 4px;
    height: 100%;
  }

  &.upload {
    &::before { background-color: #10b981; }
    .traffic-icon-wrap { background-color: rgba(16, 185, 129, 0.1); color: #10b981; }
  }

  &.download {
    &::before { background-color: #3b82f6; }
    .traffic-icon-wrap { background-color: rgba(59, 130, 246, 0.1); color: #3b82f6; }
  }

  &.total {
    &::before { background-color: #8b5cf6; }
    .traffic-icon-wrap { background-color: rgba(139, 92, 246, 0.1); color: #8b5cf6; }
  }
  
  .traffic-icon-wrap {
    width: 44px;
    height: 44px;
    border-radius: 10px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 18px;
    font-weight: bold;
  }
  
  .traffic-info {
    span {
      font-size: 12px;
      color: var(--el-text-color-secondary);
      font-weight: 500;
    }
    h2 {
      margin: 4px 0 0 0;
      font-size: 22px;
      color: var(--el-text-color-primary);
      font-weight: 700;
    }
  }
}

.info-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 20px;

  @media (max-width: 1024px) {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
  
  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
}

.info-card {
  border-radius: 12px !important;
  background: var(--el-bg-color-overlay) !important;
  border: 1px solid var(--el-border-color) !important;

  ::v-deep(.el-card__header) {
    border-bottom: 1px solid var(--el-border-color) !important;
    padding: 14px 20px !important;
    color: var(--el-text-color-primary) !important;
    font-weight: 600 !important;
    font-size: 15px !important;
  }

  .card-content {
    padding: 10px 0;
  }
  
  .info-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 12px 20px;
    border-bottom: 1px solid var(--el-border-color);
    
    &:last-child {
      border-bottom: none;
      padding-bottom: 0;
    }

    &:first-child {
      padding-top: 0;
    }
    
    .info-label {
      color: var(--el-text-color-secondary);
      font-size: 13px;
    }
    
    .info-value {
      color: var(--el-text-color-primary);
      font-size: 13px;
      font-weight: 500;
      
      &.text-glow {
        text-shadow: 0 0 8px rgba(99, 102, 241, 0.5);
        color: #a5b4fc;
      }
      
      &.status-badge {
        background-color: rgba(99, 102, 241, 0.15);
        color: #818cf8;
        padding: 2px 8px;
        border-radius: 6px;
        font-size: 11px;
      }

      &.status-online {
        color: #10b981;
        font-size: 13px;
        font-weight: 600;
      }

      &.status-safe {
        color: #10b981;
        font-size: 13px;
      }
      
      &.link-value {
        color: #6366f1;
        cursor: pointer;
        transition: color 0.2s;
        
        &:hover {
          color: #818cf8;
          text-decoration: underline;
        }
      }
      
      &.speed-value {
        display: flex;
        gap: 12px;
        
        .up { color: #10b981; }
        .down { color: #3b82f6; }
      }
    }
  }
}

.traffic-quota-item {
  flex-direction: column !important;
  align-items: stretch !important;
  gap: 8px;
  border-bottom: none !important;
  border-top: none !important;
  padding-bottom: 0 !important;
  padding-top: 12px !important;

  .quota-meta {
    display: flex;
    justify-content: space-between;
    align-items: center;
    font-size: 13px;

    .quota-warning-text {
      font-weight: 600;
      font-size: 12px;
      
      &.normal {
        color: #9ca3af;
      }
      
      &.warning {
        color: #ef4444;
        animation: warn-blink 1.5s infinite;
      }
    }
  }

  .quota-progress-wrapper {
    margin: 4px 0;
    position: relative;
    
    .mini-progress {
      ::v-deep(.el-progress-bar__outer) {
        background-color: var(--el-fill-color) !important;
        border-radius: 6px;
      }
      ::v-deep(.el-progress-bar__inner) {
        border-radius: 6px;
      }
    }

    .progress-percent-text {
      position: absolute;
      left: 50%;
      top: 50%;
      transform: translate(-50%, -50%);
      font-size: 10px;
      font-weight: 600;
      color: #ffffff;
      line-height: 1;
      pointer-events: none;
      text-shadow: 0 1px 2px rgba(0, 0, 0, 0.6);
    }
  }

  .quota-details {
    display: flex;
    justify-content: space-between;
    font-size: 12px;
    color: var(--el-text-color-secondary);
    margin-top: 2px;
  }
}

.charts-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 20px;
  margin-bottom: 24px;

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
}

.chart-card {
  border-radius: 12px !important;
  background: var(--el-bg-color-overlay) !important;
  border: 1px solid var(--el-border-color) !important;

  ::v-deep(.el-card__header) {
    border-bottom: 1px solid var(--el-border-color) !important;
    padding: 14px 20px !important;
  }

  .chart-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    width: 100%;
    
    .chart-title {
      color: var(--el-text-color-primary);
      font-weight: 600;
      font-size: 14px;
    }
    
    .chart-legends {
      display: flex;
      gap: 16px;
      font-size: 12px;
      color: var(--el-text-color-secondary);
      
      .legend-item {
        display: flex;
        align-items: center;
        gap: 6px;
        
        .legend-dot {
          width: 8px;
          height: 8px;
          border-radius: 50%;
          display: inline-block;
          
          &.cpu { background-color: #10b981; }
          &.mem { background-color: #3b82f6; }
          &.disk { background-color: #f59e0b; }
          &.swap { background-color: #8b5cf6; }
          &.up { background-color: #10b981; }
          &.down { background-color: #3b82f6; }
        }
      }
    }
  }

  .chart-body {
    padding: 10px 0;
    display: flex;
    align-items: stretch;
    height: 140px;
    box-sizing: border-box;

    .y-axis-labels {
      flex-shrink: 0;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      align-items: flex-end;
      padding-right: 8px;
      pointer-events: none;
      box-sizing: border-box;

      .y-label {
        font-size: 9px;
        font-family: monospace;
        color: var(--el-text-color-placeholder);
        white-space: nowrap;
        line-height: 1;

        &:first-child {
          color: var(--el-text-color-secondary);
        }
        &:last-child {
          color: var(--el-text-color-secondary);
        }
      }
    }

    .chart-main-wrap {
      flex: 1;
      min-width: 0;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
    }

    .trend-svg-wrap {
      flex: 1;
      min-width: 0;
      height: 120px;

      .trend-svg {
        width: 100%;
        height: 100%;
        display: block;
        overflow: visible;
        
        line {
          stroke: var(--el-border-color) !important;
          opacity: 0.4;
        }
      }
    }

    .x-axis-labels {
      display: flex;
      justify-content: space-between;
      padding: 6px 10px 0 10px;
      font-size: 10px;
      color: var(--el-text-color-secondary);
      font-family: monospace;
      box-sizing: border-box;
    }
  }
}

@keyframes warn-blink {
  0% { opacity: 1; }
  50% { opacity: 0.5; }
  100% { opacity: 1; }
}

.top-users-container {
  margin-top: 24px;
}

.top-users-card {
  border-radius: 12px !important;
  background: var(--el-bg-color-overlay) !important;
  border: 1px solid var(--el-border-color) !important;

  ::v-deep(.el-card__header) {
    border-bottom: 1px solid var(--el-border-color) !important;
    padding: 14px 20px !important;
    color: var(--el-text-color-primary) !important;
    font-weight: 600 !important;
    font-size: 15px !important;
  }

  .top-users-table {
    background-color: transparent !important;
    
    ::v-deep(tr) {
      background-color: transparent !important;
      &:hover > td {
        background-color: var(--el-fill-color-light) !important;
      }
    }

    ::v-deep(th.el-table__cell) {
      background-color: var(--el-fill-color) !important;
      color: var(--el-text-color-secondary) !important;
      border-bottom: 1px solid var(--el-border-color) !important;
    }

    ::v-deep(td.el-table__cell) {
      border-bottom: 1px solid var(--el-border-color) !important;
      color: var(--el-text-color-primary);
    }
  }

  .rank-badge {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 24px;
    height: 24px;
    border-radius: 50%;
    font-size: 12px;
    font-weight: bold;
    color: #ffffff;
    background-color: var(--el-border-color-lighter);

    &.rank-1 {
      background: linear-gradient(135deg, #fbbf24 0%, #d97706 100%);
      box-shadow: 0 2px 8px rgba(251, 191, 36, 0.4);
    }
    &.rank-2 {
      background: linear-gradient(135deg, #9ca3af 0%, #4b5563 100%);
      box-shadow: 0 2px 8px rgba(156, 163, 175, 0.4);
    }
    &.rank-3 {
      background: linear-gradient(135deg, #b45309 0%, #78350f 100%);
      box-shadow: 0 2px 8px rgba(180, 83, 9, 0.4);
    }
  }
}

::v-deep(.mini-radio-group) {
  .el-radio-button__inner {
    background-color: var(--el-fill-color) !important;
    border-color: var(--el-border-color) !important;
    color: var(--el-text-color-secondary) !important;
    font-size: 11px !important;
    padding: 5px 10px !important;
  }
  .el-radio-button__original-radio:checked + .el-radio-button__inner {
    background-color: var(--el-color-primary) !important;
    border-color: var(--el-color-primary) !important;
    color: #ffffff !important;
    box-shadow: none !important;
  }
}
</style>