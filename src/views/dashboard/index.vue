<template>
  <div class="dashboard-container">
    <!-- Row 1: System Status Radial Progresses (Only for Admin) -->
    <div v-if="isAdmin" class="metrics-grid">
      <el-card class="metric-card" shadow="never">
        <div class="metric-content">
          <div class="metric-icon-wrap cpu">
            <svg viewBox="0 0 24 24" width="28" height="28" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
              <rect x="4" y="4" width="16" height="16" rx="2" />
              <rect x="9" y="9" width="6" height="6" />
              <path d="M9 1v3" />
              <path d="M15 1v3" />
              <path d="M9 20v3" />
              <path d="M15 20v3" />
              <path d="M20 9h3" />
              <path d="M20 15h3" />
              <path d="M1 9h3" />
              <path d="M1 15h3" />
            </svg>
          </div>
          <div class="metric-info">
            <h4 class="metric-title">CPU 使用率</h4>
            <p class="metric-value">{{ cpu.percentage }}%</p>
          </div>
        </div>
      </el-card>

      <el-card class="metric-card" shadow="never">
        <div class="metric-content">
          <div class="metric-icon-wrap mem">
            <svg viewBox="0 0 24 24" width="28" height="28" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
              <path d="M2 10h20M2 14h20" />
              <rect x="2" y="6" width="20" height="12" rx="2" />
              <path d="M6 6v4M10 6v4M14 6v4M18 6v4M6 14v4M10 14v4M14 14v4M18 14v4" />
            </svg>
          </div>
          <div class="metric-info">
            <h4 class="metric-title">{{ $t('dashboard.memory') }}</h4>
            <p class="metric-value">{{ memory.used }} / {{ memory.total }}</p>
          </div>
        </div>
      </el-card>

      <el-card class="metric-card" shadow="never">
        <div class="metric-content">
          <div class="metric-icon-wrap disk">
            <svg viewBox="0 0 24 24" width="28" height="28" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
              <ellipse cx="12" cy="5" rx="9" ry="3" />
              <path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5" />
              <path d="M3 12c0 1.66 4 3 9 3s9-1.34 9-3" />
            </svg>
          </div>
          <div class="metric-info">
            <h4 class="metric-title">{{ $t('dashboard.disk') }}</h4>
            <p class="metric-value">{{ disk.used }} / {{ disk.total }}</p>
          </div>
        </div>
      </el-card>

      <el-card class="metric-card" shadow="never">
        <div class="metric-content">
          <div class="metric-icon-wrap swap">
            <svg viewBox="0 0 24 24" width="28" height="28" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
              <path d="M21 12a9 9 0 0 0-9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
              <path d="M3 3v5h5" />
              <path d="M3 12a9 9 0 0 0 9 9 9.75 9.75 0 0 0 6.74-2.74L21 16" />
              <path d="M16 16h5v5" />
            </svg>
          </div>
          <div class="metric-info">
            <h4 class="metric-title">Swap 缓存</h4>
            <p class="metric-value">{{ swap.used }} / {{ swap.total }}</p>
          </div>
        </div>
      </el-card>
    </div>

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
            <span class="chart-title">系统资源实时走势 (CPU / 内存)</span>
            <div class="chart-legends">
              <span class="legend-item"><span class="legend-dot cpu"></span>CPU: {{ cpu.percentage }}%</span>
              <span class="legend-item"><span class="legend-dot mem"></span>内存: {{ memory.percentage }}%</span>
            </div>
          </div>
        </template>
        <div class="chart-body">
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
      </el-card>

      <el-card class="chart-card" shadow="never">
        <template #header>
          <div class="chart-header">
            <span class="chart-title">实时网络速率走势</span>
            <div class="chart-legends">
              <span class="legend-item"><span class="legend-dot up"></span>上传: {{ netSpeed.up }}</span>
              <span class="legend-item"><span class="legend-dot down"></span>下载: {{ netSpeed.down }}</span>
            </div>
          </div>
        </template>
        <div class="chart-body">
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
                <stop offset="0%" stop-color="#8b5cf6" stop-opacity="0.15"/>
                <stop offset="100%" stop-color="#8b5cf6" stop-opacity="0.0"/>
              </linearGradient>
            </defs>

            <!-- 渐变区域 -->
            <path :d="upAreaPath" fill="url(#upGrad)" v-if="upAreaPath" />
            <path :d="downAreaPath" fill="url(#downGrad)" v-if="downAreaPath" />

            <!-- 折线 -->
            <path :d="upLinePath" fill="none" stroke="#10b981" stroke-width="2" stroke-linecap="round" v-if="upLinePath" />
            <path :d="downLinePath" fill="none" stroke="#8b5cf6" stroke-width="2" stroke-linecap="round" v-if="downLinePath" />
          </svg>
        </div>
      </el-card>
    </div>

    <!-- Row 3: Server Information & Stats Grid -->
    <div class="info-grid">
      <el-card class="info-card" header="系统服务状态" shadow="never">
        <div class="card-content">
          <div class="info-item">
            <span class="info-label">Trojan 版本</span>
            <span class="info-value text-glow">{{ trojanVersion || '1.16.0' }}</span>
          </div>
          <div class="info-item">
            <span class="info-label">已运行时间</span>
            <span class="info-value">{{ trojanUptime }}</span>
          </div>
          <div class="info-item">
            <span class="info-label">服务类型</span>
            <span class="info-value status-badge">{{ $store.state.trojanType || 'trojan' }}</span>
          </div>
        </div>
      </el-card>

      <el-card class="info-card" header="网络连接与负载" shadow="never" v-if="isAdmin">
        <div class="card-content">
          <div class="info-item">
            <span class="info-label">系统负载 (Load)</span>
            <span class="info-value">{{ load }}</span>
          </div>
          <div class="info-item">
            <span class="info-label">网络并发连接数 (TCP/UDP)</span>
            <span class="info-value">{{ netCount }}</span>
          </div>
          <div class="info-item">
            <span class="info-label">实时速率 (上传/下载)</span>
            <span class="info-value speed-value">
              <span class="up">▲ {{ netSpeed.up }}</span>
              <span class="down">▼ {{ netSpeed.down }}</span>
            </span>
          </div>
          
          <el-divider class="inner-divider" />
          
          <div class="info-item traffic-quota-item">
            <div class="quota-meta">
              <span class="info-label">服务器总流量限额</span>
              <span v-if="serverTotalQuota !== -1" :class="{'quota-warning-text': true, 'warning': serverUsePercent >= 80}">
                {{ serverUsePercent >= 80 ? '⚠️ 已超 80%！' : '限额充足' }}
              </span>
              <span v-else class="quota-warning-text normal">无限制</span>
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
              <span>已用：{{ formatBytes(serverUsedTraffic) }}</span>
              <span>限额：{{ serverTotalQuota !== -1 ? formatBytes(serverTotalQuota) : '无限制' }}</span>
            </div>
          </div>
        </div>
      </el-card>

      <el-card class="info-card" header="用户与控制台" shadow="never">
        <div class="card-content">
          <div class="info-item">
            <span class="info-label">总注册用户数</span>
            <span class="info-value link-value" @click="navigate('/user')">
              {{ userList.length }} 个用户 ➔
            </span>
          </div>
          <div class="info-item" v-if="isAdmin">
            <span class="info-label">运行状态</span>
            <span class="info-value status-online">● 运行中</span>
          </div>
          <div class="info-item">
            <span class="info-label">安全状况</span>
            <span class="info-value status-safe">未发现安全问题</span>
          </div>
        </div>
      </el-card>
    </div>

    <!-- Top 10 流量使用用户排行榜 -->
    <div v-if="isAdmin" class="top-users-container">
      <el-card class="top-users-card" header="使用流量 Top 10 用户排行榜" shadow="never">
        <el-table :data="top10Users" style="width: 100%" class="top-users-table">
          <el-table-column type="index" label="排名" width="80" align="center">
            <template #default="scope">
              <span :class="'rank-badge rank-' + (scope.$index + 1)">{{ scope.$index + 1 }}</span>
            </template>
          </el-table-column>
          <el-table-column prop="Username" label="用户名" />
          <el-table-column prop="Upload" label="已用上传" :formatter="formatTableBytes" />
          <el-table-column prop="Download" label="已用下载" :formatter="formatTableBytes" />
          <el-table-column label="总使用流量">
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
import { version, serverInfo } from '@/api/common'
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
                upSpeed: [],
                downSpeed: []
            },
            maxPoints: 20
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
        }
        this.timer = setInterval(() => {
            if (this.isAdmin) {
                this.getServerInfo()
            }
            this.getVersion()
            this.getUserList()
        }, 6000)
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
                history.cpu.push(this.cpu.percentage)
                history.memory.push(this.memory.percentage)
                history.upSpeed.push(data.speed.Up)
                history.downSpeed.push(data.speed.Down)
                if (history.cpu.length > this.maxPoints) {
                    history.cpu.shift()
                    history.memory.shift()
                    history.upSpeed.shift()
                    history.downSpeed.shift()
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
            const data = result.Data
            this.trojanVersion = data.trojanVersion
            this.trojanUptime = this.parseUptime(data.trojanUptime)
        },
        parseUptime(uptime) {
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
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 20px;
  margin-bottom: 24px;
}

.traffic-card {
  display: flex;
  align-items: center;
  gap: 20px;
  padding: 16px 20px;
  border-radius: 12px !important;
  position: relative;
  overflow: hidden;
  background: #111827 !important;
  border: 1px solid #1f2937 !important;
  
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
      color: #9ca3af;
      font-weight: 500;
    }
    h2 {
      margin: 4px 0 0 0;
      font-size: 22px;
      color: #ffffff;
      font-weight: 700;
    }
  }
}

.info-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 20px;
}

.info-card {
  border-radius: 12px !important;
  background: #111827 !important;
  border: 1px solid #1f2937 !important;

  ::v-deep(.el-card__header) {
    border-bottom: 1px solid #1f2937 !important;
    padding: 14px 20px !important;
    color: #ffffff !important;
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
    border-bottom: 1px solid rgba(255, 255, 255, 0.05);
    
    &:last-child {
      border-bottom: none;
      padding-bottom: 0;
    }

    &:first-child {
      padding-top: 0;
    }
    
    .info-label {
      color: #9ca3af;
      font-size: 13px;
    }
    
    .info-value {
      color: #ffffff;
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

.inner-divider {
  margin: 12px 20px !important;
  border-top-color: rgba(255, 255, 255, 0.08) !important;
  border-bottom: none !important;
}

.traffic-quota-item {
  flex-direction: column !important;
  align-items: stretch !important;
  gap: 8px;
  border-bottom: none !important;
  border-top: none !important;
  padding-bottom: 0 !important;
  padding-top: 0 !important;

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
        background-color: #1a202c !important;
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
    color: #9ca3af;
    margin-top: 2px;
  }
}

.charts-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(450px, 1fr));
  gap: 20px;
  margin-bottom: 24px;

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
}

.chart-card {
  border-radius: 12px !important;
  background: #111827 !important;
  border: 1px solid #1f2937 !important;

  ::v-deep(.el-card__header) {
    border-bottom: 1px solid #1f2937 !important;
    padding: 14px 20px !important;
  }

  .chart-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    width: 100%;
    
    .chart-title {
      color: #ffffff;
      font-weight: 600;
      font-size: 14px;
    }
    
    .chart-legends {
      display: flex;
      gap: 16px;
      font-size: 12px;
      color: #9ca3af;
      
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
          &.up { background-color: #10b981; }
          &.down { background-color: #8b5cf6; }
        }
      }
    }
  }

  .chart-body {
    padding: 10px 0;
    
    .trend-svg {
      width: 100%;
      height: 120px;
      display: block;
      overflow: visible;
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
  background: #111827 !important;
  border: 1px solid #1f2937 !important;

  ::v-deep(.el-card__header) {
    border-bottom: 1px solid #1f2937 !important;
    padding: 14px 20px !important;
    color: #ffffff !important;
    font-weight: 600 !important;
    font-size: 15px !important;
  }

  .top-users-table {
    background-color: transparent !important;
    
    ::v-deep(tr) {
      background-color: transparent !important;
      &:hover > td {
        background-color: #1a202c !important;
      }
    }

    ::v-deep(th.el-table__cell) {
      background-color: #0d111a !important;
      color: #9ca3af !important;
      border-bottom: 1px solid #1f2937 !important;
    }

    ::v-deep(td.el-table__cell) {
      border-bottom: 1px solid #1f2937 !important;
      color: #ffffff;
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
    background-color: #374151;

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
</style>