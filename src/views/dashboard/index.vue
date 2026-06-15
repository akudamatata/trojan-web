<template>
  <div class="dashboard-container">
    <!-- Row 1: System Status Radial Progresses (Only for Admin) -->
    <div v-if="isAdmin" class="metrics-grid">
      <el-card class="metric-card" shadow="never">
        <div class="metric-content">
          <el-progress type="circle" :percentage="cpu.percentage" :color="cpu.color" :stroke-width="8" :width="85" />
          <div class="metric-info">
            <h4 class="metric-title">CPU 使用率</h4>
            <p class="metric-value">{{ cpu.percentage }}%</p>
          </div>
        </div>
      </el-card>

      <el-card class="metric-card" shadow="never">
        <div class="metric-content">
          <el-progress type="circle" :percentage="memory.percentage" :color="memory.color" :stroke-width="8" :width="85" />
          <div class="metric-info">
            <h4 class="metric-title">{{ $t('dashboard.memory') }}</h4>
            <p class="metric-value">{{ memory.used }} / {{ memory.total }}</p>
          </div>
        </div>
      </el-card>

      <el-card class="metric-card" shadow="never">
        <div class="metric-content">
          <el-progress type="circle" :percentage="disk.percentage" :color="disk.color" :stroke-width="8" :width="85" />
          <div class="metric-info">
            <h4 class="metric-title">{{ $t('dashboard.disk') }}</h4>
            <p class="metric-value">{{ disk.used }} / {{ disk.total }}</p>
          </div>
        </div>
      </el-card>

      <el-card class="metric-card" shadow="never">
        <div class="metric-content">
          <el-progress type="circle" :percentage="swap.percentage" :color="swap.color" :stroke-width="8" :width="85" />
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

    <!-- 服务器总流量用量进度展示 -->
    <div v-if="isAdmin" class="quota-progress-container">
      <el-card class="quota-progress-card" shadow="never">
        <div class="progress-header">
          <span class="progress-title">服务器双向总流量限额进度</span>
          <span v-if="serverTotalQuota !== -1" :class="{'progress-status': true, 'warning': serverUsePercent >= 80}">
            {{ serverUsePercent >= 80 ? '⚠️ 服务器已用流量已达 80% 以上，请合理规划额度！' : '流量配额充足' }}
          </span>
          <span v-else class="progress-status normal">
            流量无限制
          </span>
        </div>
        <div class="progress-body">
          <el-progress 
            v-if="serverTotalQuota !== -1"
            :percentage="serverUsePercent" 
            :stroke-width="18" 
            :text-inside="true"
            :color="serverUsePercent >= 80 ? '#ef4444' : '#6366f1'"
            class="custom-progress"
          />
          <div class="progress-info">
            <span>已使用：{{ formatBytes(serverUsedTraffic) }}</span>
            <span v-if="serverTotalQuota !== -1">总限额：{{ formatBytes(serverTotalQuota) }}</span>
            <span v-else>总限额：无限制</span>
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
              <span>{{ formatBytes(scope.row.Upload + scope.row.Download) }}</span>
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
            top10Users: []
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

.quota-progress-container {
  margin-bottom: 24px;
}
.quota-progress-card {
  border-radius: 12px !important;
  background: #111827 !important;
  border: 1px solid #1f2937 !important;

  .progress-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 16px;
    padding: 2px 4px;

    .progress-title {
      font-size: 15px;
      font-weight: 600;
      color: #ffffff;
    }

    .progress-status {
      font-size: 13px;
      font-weight: 500;
      
      &.normal {
        color: #9ca3af;
      }
      
      &.warning {
        color: #ef4444;
        animation: warn-blink 1.5s infinite;
      }
    }
  }

  .custom-progress {
    margin-bottom: 12px;
    ::v-deep(.el-progress-bar__outer) {
      background-color: #1a202c !important;
      border-radius: 10px;
    }
    ::v-deep(.el-progress-bar__inner) {
      border-radius: 10px;
    }
  }

  .progress-info {
    display: flex;
    justify-content: space-between;
    font-size: 12px;
    color: #9ca3af;
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