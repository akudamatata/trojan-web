<template>
  <div class="user-detail-container">
    <!-- Back Button & Header -->
    <div class="header-section">
      <el-button :icon="ArrowLeft" @click="goBack" class="back-btn">返回列表</el-button>
      <h2 class="page-title">用户详情面板: <span class="username-highlight">{{ username }}</span></h2>
    </div>

    <el-row :gutter="24" class="info-row">
      <!-- Left side: Account Info Cards -->
      <el-col :xs="24" :sm="24" :md="8">
        <el-card class="stat-card account-card">
          <template #header>
            <div class="card-header">
              <span>账户基本状态</span>
              <el-tag :type="accountStatusType">{{ accountStatus }}</el-tag>
            </div>
          </template>
          <div class="card-body">
            <div class="info-item">
              <span class="info-label">到期时间:</span>
              <span class="info-value">{{ detailData.expiryDate || '永久有效' }}</span>
            </div>
            <div class="info-item" v-if="detailData.useDays > 0">
              <span class="info-label">限制使用天数:</span>
              <span class="info-value">{{ detailData.useDays }} 天</span>
            </div>
            
            <el-divider />
            
            <div class="progress-section">
              <div class="progress-labels">
                <span>流量额度已使用:</span>
                <span>{{ percentUsed }}%</span>
              </div>
              <el-progress 
                :percentage="percentUsed" 
                :status="percentUsed >= 90 ? 'exception' : (percentUsed >= 70 ? 'warning' : 'success')" 
                :stroke-width="12"
              />
              <div class="traffic-desc">
                已使用: <span class="highlight-text">{{ formatBytes(detailData.upload + detailData.download) }}</span> / 总配额: {{ formatBytes(detailData.quota) }}
              </div>
            </div>

            <div class="traffic-direction">
              <div class="dir-item">
                <span class="dir-title">↑ 上行流量</span>
                <span class="dir-value">{{ formatBytes(detailData.upload) }}</span>
              </div>
              <div class="dir-item">
                <span class="dir-title">↓ 下行流量</span>
                <span class="dir-value">{{ formatBytes(detailData.download) }}</span>
              </div>
            </div>
          </div>
        </el-card>
      </el-col>

      <!-- Right side: Top 10 Domains Visited -->
      <el-col :xs="24" :sm="24" :md="16">
        <el-card class="stat-card domain-card">
          <template #header>
            <div class="card-header">
              <span>用户访问频率最高网站 (Top 10)</span>
              <el-tag type="info">最近30天</el-tag>
            </div>
          </template>
          <div class="card-body">
            <div v-if="!detailData.domains || detailData.domains.length === 0" class="empty-state">
              <el-empty description="暂无访问网站数据记录" :image-size="100" />
            </div>
            <div v-else class="domain-list">
              <div v-for="(item, index) in detailData.domains" :key="item.domain" class="domain-item">
                <div class="domain-rank-info">
                  <span class="rank-badge" :class="'rank-' + (index + 1)">{{ index + 1 }}</span>
                  <span class="domain-name" :title="item.domain">{{ item.domain }}</span>
                </div>
                <div class="domain-bar-section">
                  <el-progress 
                    :percentage="getDomainPercentage(item.visitCount)" 
                    :show-text="false" 
                    color="#409eff"
                    :stroke-width="10"
                    class="domain-progress-bar"
                  />
                </div>
                <span class="visit-count">{{ item.visit_count }} 次访问</span>
              </div>
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <!-- Bottom: Connection IP List -->
    <el-card class="stat-card ip-card">
      <template #header>
        <div class="card-header">
          <span>最近一个月连接过的 IP 列表</span>
          <el-tag type="success">活跃 IP 归属审计</el-tag>
        </div>
      </template>
      <div class="card-body">
        <el-table :data="ipTableData" style="width: 100%" class="ip-table" empty-text="最近一个月无登录 IP 记录">
          <el-table-column label="序号" type="index" width="80" align="center" />
          <el-table-column prop="ip" label="客户端连入 IP" width="220" align="left">
            <template #default="scope">
              <span class="ip-address-text">{{ scope.row.ip }}</span>
            </template>
          </el-table-column>
          <el-table-column label="地理归属地 (国家/省/市)" width="320" align="left">
            <template #default="scope">
              <div v-if="scope.row.loading" class="geoip-loading">
                <el-icon class="is-loading"><Loading /></el-icon> 正在查询 IP 属地...
              </div>
              <div v-else-if="scope.row.error" class="geoip-error">
                <span class="text-muted">查询失败</span>
              </div>
              <div v-else class="geoip-info-cell">
                <span class="country-badge">{{ scope.row.country }}</span>
                <span class="city-text">{{ scope.row.region }} {{ scope.row.city }}</span>
              </div>
            </template>
          </el-table-column>
          <el-table-column label="运营商 (ISP)" align="left">
            <template #default="scope">
              <span v-if="scope.row.loading">-</span>
              <span v-else-if="scope.row.error" class="text-muted">未知</span>
              <span v-else class="isp-text">{{ scope.row.isp || '未知' }}</span>
            </template>
          </el-table-column>
        </el-table>
      </div>
    </el-card>
  </div>
</template>

<script>
import { ArrowLeft, Loading } from '@element-plus/icons-vue'
import { userDetail } from '@/api/user'
import { bytefmt } from '@/utils/string'

export default {
  name: 'UserDetail',
  data() {
    return {
      ArrowLeft,
      username: '',
      detailData: {
        username: '',
        download: 0,
        upload: 0,
        quota: -1,
        useDays: 0,
        expiryDate: '',
        ips: [],
        domains: []
      },
      ipTableData: [],
      maxVisitCount: 1
    }
  },
  computed: {
    accountStatus() {
      if (this.detailData.expiryDate) {
        const expiry = new Date(this.detailData.expiryDate.replace(/-/g, '/'))
        if (expiry < new Date()) {
          return '已过期'
        }
      }
      if (this.detailData.quota > 0 && (this.detailData.upload + this.detailData.download) >= this.detailData.quota) {
        return '流量超额'
      }
      return '正常可用'
    },
    accountStatusType() {
      const status = this.accountStatus
      if (status === '正常可用') return 'success'
      if (status === '已过期') return 'danger'
      return 'warning'
    },
    percentUsed() {
      if (this.detailData.quota <= 0) return 0
      const used = this.detailData.upload + this.detailData.download
      const percent = (used / this.detailData.quota) * 100
      return parseFloat(percent.toFixed(1))
    }
  },
  created() {
    this.username = this.$route.query.username || ''
    if (this.username) {
      this.fetchDetail()
    } else {
      this.$message.error('参数错误: 用户名不能为空')
      this.goBack()
    }
  },
  methods: {
    goBack() {
      this.$router.push({ name: 'user' })
    },
    formatBytes(bytes) {
      if (bytes === -1) return '无限流量'
      return bytefmt(bytes)
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

          // 计算排名前十网站的最大访问量，用于折算相对百分比
          if (this.detailData.domains && this.detailData.domains.length > 0) {
            this.maxVisitCount = Math.max(...this.detailData.domains.map(d => d.visit_count))
          }

          // 初始化 IP 表格行，默认 loading
          if (this.detailData.ips) {
            this.ipTableData = this.detailData.ips.map(ip => ({
              ip,
              country: '',
              region: '',
              city: '',
              isp: '',
              loading: true,
              error: false
            }))
            // 并发获取 IP 归属地信息
            this.fetchGeoIPs()
          }
        } else {
          this.$message.error('获取详情失败: ' + res.Msg)
        }
      } catch (err) {
        this.$message.error('获取详情错误: ' + err.message)
      }
    },
    // 并发查询 IP 物理属地 (ip-api.com)
    fetchGeoIPs() {
      this.ipTableData.forEach(async (row) => {
        try {
          const response = await fetch(`https://ipapi.co/${row.ip}/json/`)
          if (response.ok) {
            const data = await response.json()
            if (data && !data.error) {
              row.country = data.country_name || '未知'
              row.region = data.region || ''
              row.city = data.city || ''
              row.isp = data.org || data.asn || '未知'
              row.loading = false
            } else {
              row.error = true
              row.loading = false
            }
          } else {
            // 备用国内接口 ip-api.com (免费版不支持 https，所以如果在 https 面板运行，这里会报 mixed content，我们进行报错处理)
            const backupResponse = await fetch(`http://ip-api.com/json/${row.ip}?lang=zh-CN`).catch(() => null)
            if (backupResponse && backupResponse.ok) {
              const data = await backupResponse.json()
              if (data && data.status === 'success') {
                row.country = data.country || '未知'
                row.region = data.regionName || ''
                row.city = data.city || ''
                row.isp = data.isp || '未知'
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
      })
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
  margin-bottom: 24px;
}

.stat-card {
  margin-bottom: 24px;
  border-radius: 8px;
  border: 1px solid var(--el-border-color-light);
  box-shadow: var(--el-box-shadow-light);
  
  .card-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    font-weight: 600;
    font-size: 15px;
  }
}

.account-card {
  .card-body {
    padding: 12px 0;
  }
  
  .info-item {
    display: flex;
    justify-content: space-between;
    margin-bottom: 12px;
    padding: 0 16px;
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
    padding: 0 16px;
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
    
    .dir-item {
      flex: 1;
      text-align: center;
      padding: 16px 0;
      
      &:first-child {
        border-right: 1px solid var(--el-border-color-lighter);
      }
      
      .dir-title {
        display: block;
        font-size: 12px;
        color: var(--el-text-color-secondary);
        margin-bottom: 6px;
      }
      
      .dir-value {
        font-size: 15px;
        font-weight: 600;
        color: var(--el-text-color-primary);
      }
    }
  }
}

.domain-card {
  .card-body {
    min-height: 245px;
  }
  
  .empty-state {
    padding: 40px 0;
  }
  
  .domain-list {
    display: flex;
    flex-direction: column;
    gap: 14px;
  }
  
  .domain-item {
    display: flex;
    align-items: center;
    font-size: 14px;
    
    .domain-rank-info {
      display: flex;
      align-items: center;
      width: 250px;
      
      .rank-badge {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        width: 20px;
        height: 20px;
        border-radius: 50%;
        font-size: 11px;
        font-weight: 600;
        margin-right: 12px;
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
      padding: 0 20px;
      
      .domain-progress-bar {
        margin: 0;
      }
    }
    
    .visit-count {
      width: 80px;
      text-align: right;
      font-size: 13px;
      color: var(--el-text-color-secondary);
      font-weight: 600;
    }
  }
}

.ip-card {
  margin-top: 12px;
  
  .ip-table {
    margin: 8px 0;
  }
  
  .ip-address-text {
    font-family: monospace;
    font-size: 14px;
    font-weight: 600;
    color: var(--el-text-color-primary);
  }
  
  .geoip-loading {
    color: var(--el-color-primary);
    display: flex;
    align-items: center;
    gap: 6px;
    font-size: 13px;
  }
  
  .geoip-error {
    color: var(--el-text-color-placeholder);
    font-size: 13px;
  }
  
  .geoip-info-cell {
    display: flex;
    align-items: center;
    gap: 8px;
    
    .country-badge {
      background-color: var(--el-color-primary-light-9);
      color: var(--el-color-primary);
      padding: 2px 6px;
      border-radius: 4px;
      font-size: 12px;
      font-weight: 600;
    }
    
    .city-text {
      font-size: 13px;
      color: var(--el-text-color-regular);
    }
  }
  
  .isp-text {
    font-size: 13px;
    color: var(--el-text-color-regular);
  }
}
</style>
