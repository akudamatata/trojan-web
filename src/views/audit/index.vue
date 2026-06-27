<template>
  <div class="audit-container">
    <!-- Filter Card -->
    <el-card class="filter-card" shadow="hover">
      <div class="filter-wrapper">
        <div class="filter-row">
          <!-- Username Filter -->
          <div class="filter-item">
            <span class="filter-label">{{ $t('username') || '用户名' }}</span>
            <el-input
              v-model="filters.username"
              placeholder="搜索用户名"
              clearable
              :prefix-icon="Search"
              @change="handleSearch"
            />
          </div>

          <!-- Domain Filter -->
          <div class="filter-item">
            <span class="filter-label">访问域名</span>
            <el-input
              v-model="filters.domain"
              placeholder="搜索域名/品牌"
              clearable
              :prefix-icon="Search"
              @change="handleSearch"
            />
          </div>

          <!-- Category Filter -->
          <div class="filter-item">
            <span class="filter-label">类别筛选</span>
            <el-select v-model="filters.category" placeholder="全部类别" clearable @change="handleSearch">
              <el-option label="全部" value="" />
              <el-option label="🔞 成人内容" value="成人内容" />
              <el-option label="💬 社交与视频" value="社交与视频" />
              <el-option label="🛠️ 主流服务" value="主流服务" />
              <el-option label="📦 其他" value="其他" />
            </el-select>
          </div>
        </div>

        <div class="filter-row second-row">
          <!-- Date Range Picker -->
          <div class="filter-item date-picker-item">
            <span class="filter-label">时间范围</span>
            <el-date-picker
              v-model="dateRange"
              type="daterange"
              range-separator="至"
              start-placeholder="开始日期"
              end-placeholder="结束日期"
              format="YYYY-MM-DD"
              value-format="YYYY-MM-DD"
              :clearable="false"
              @change="handleDateRangeChange"
            />
          </div>

          <!-- CDN Switch -->
          <div class="filter-item cdn-switch-item">
            <span class="filter-label">过滤静态资源/CDN</span>
            <el-switch
              v-model="filters.hide_cdn"
              inline-prompt
              active-text="已过滤"
              inactive-text="不过滤"
              @change="handleSearch"
            />
          </div>

          <!-- Action Buttons -->
          <div class="filter-actions">
            <el-button type="primary" :icon="Search" @click="handleSearch">查询</el-button>
            <el-button :icon="Refresh" @click="resetFilters">重置</el-button>
          </div>
        </div>
      </div>
    </el-card>

    <!-- Data Table Card -->
    <el-card class="table-card" shadow="hover">
      <el-table
        v-loading="loading"
        :data="records"
        style="width: 100%"
        class="audit-table"
      >
        <el-table-column prop="username" :label="$t('username') || '用户名'" width="160">
          <template #default="scope">
            <el-button type="primary" link @click="filterByUser(scope.row.username)">
              {{ scope.row.username }}
            </el-button>
          </template>
        </el-table-column>

        <el-table-column prop="domain" label="访问域名" min-width="260" show-overflow-tooltip>
          <template #default="scope">
            <div class="domain-cell">
              <span class="domain-text">{{ scope.row.domain }}</span>
              <el-tag
                v-if="scope.row.domain !== scope.row.mapped_domain"
                size="small"
                type="success"
                effect="plain"
                class="brand-tag"
              >
                {{ scope.row.mapped_domain }}
              </el-tag>
            </div>
          </template>
        </el-table-column>

        <el-table-column prop="category" label="分类" width="150">
          <template #default="scope">
            <el-tag :type="getCategoryTagType(scope.row.category)" effect="dark" round>
              {{ getCategoryEmoji(scope.row.category) }} {{ scope.row.category }}
            </el-tag>
          </template>
        </el-table-column>

        <el-table-column prop="visit_count" label="访问次数" width="120" sortable align="center">
          <template #default="scope">
            <span class="visit-count-badge">{{ scope.row.visit_count }}</span>
          </template>
        </el-table-column>

        <el-table-column prop="last_visited_at" label="最后访问时间" width="200" sortable>
          <template #default="scope">
            <span class="time-text">{{ scope.row.last_visited_at }}</span>
          </template>
        </el-table-column>

        <el-table-column label="操作" width="140" align="center" fixed="right">
          <template #default="scope">
            <el-button
              type="primary"
              link
              :icon="View"
              @click="openDomainUsersDrawer(scope.row.domain)"
            >
              用户排行
            </el-button>
          </template>
        </el-table-column>
      </el-table>

      <!-- Pagination -->
      <div class="pagination-container">
        <el-pagination
          v-model:current-page="pagination.page"
          v-model:page-size="pagination.limit"
          :page-sizes="[10, 20, 50, 100]"
          layout="total, sizes, prev, pager, next, jumper"
          :total="total"
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
        />
      </div>
    </el-card>

    <!-- Domain Users Drawer -->
    <el-drawer
      v-model="drawer.visible"
      :title="`访问域名 [ ${drawer.targetDomain} ] 的用户排行`"
      size="50%"
      destroy-on-close
    >
      <div class="drawer-content">
        <el-alert
          title="数据为所选日期范围内，该域名（包含其关联 CDN 分包）的累计访问量统计。"
          type="info"
          show-icon
          :closable="false"
          style="margin-bottom: 20px"
        />
        <el-table :data="drawer.records" v-loading="drawer.loading" style="width: 100%">
          <el-table-column type="index" label="排名" width="80" align="center" />
          <el-table-column prop="username" :label="$t('username') || '用户名'">
            <template #default="scope">
              <el-button type="primary" link @click="filterByUserFromDrawer(scope.row.username)">
                {{ scope.row.username }}
              </el-button>
            </template>
          </el-table-column>
          <el-table-column prop="visit_count" label="累计访问次数" width="150" align="center">
            <template #default="scope">
              <span class="drawer-visit-badge">{{ scope.row.visit_count }}</span>
            </template>
          </el-table-column>
          <el-table-column prop="last_visited_at" label="最后访问时间" width="200" />
        </el-table>
      </div>
    </el-drawer>
  </div>
</template>

<script>
import { auditList, auditDomainUsers } from '@/api/user'
import { Search, Refresh, View } from '@element-plus/icons-vue'
import dayjs from 'dayjs'

export default {
  name: 'UserAudit',
  data() {
    return {
      Search,
      Refresh,
      View,
      loading: false,
      records: [],
      total: 0,
      dateRange: [
        dayjs().subtract(7, 'day').format('YYYY-MM-DD'),
        dayjs().format('YYYY-MM-DD')
      ],
      filters: {
        username: '',
        domain: '',
        category: '',
        hide_cdn: true
      },
      pagination: {
        page: 1,
        limit: 20
      },
      drawer: {
        visible: false,
        targetDomain: '',
        loading: false,
        records: []
      }
    }
  },
  created() {
    this.fetchData()
  },
  methods: {
    async fetchData() {
      this.loading = true
      try {
        const params = {
          username: this.filters.username,
          domain: this.filters.domain,
          category: this.filters.category,
          hide_cdn: this.filters.hide_cdn,
          date_start: this.dateRange[0],
          date_end: this.dateRange[1],
          page: this.pagination.page,
          limit: this.pagination.limit
        }
        const res = await auditList(params)
        console.log('API Raw Response:', res)
        console.log('res.data:', res.data)
        if (res.msg === 'success' && res.data) {
          this.records = res.data.records || []
          this.total = res.data.total || 0
          console.log('Set records success, count:', this.records.length)
        }
      } catch (err) {
        console.error('Fetch audit logs error:', err)
      } finally {
        this.loading = false
      }
    },
    handleSearch() {
      this.pagination.page = 1
      this.fetchData()
    },
    handleDateRangeChange() {
      this.handleSearch()
    },
    resetFilters() {
      this.filters = {
        username: '',
        domain: '',
        category: '',
        hide_cdn: true
      }
      this.dateRange = [
        dayjs().subtract(7, 'day').format('YYYY-MM-DD'),
        dayjs().format('YYYY-MM-DD')
      ]
      this.handleSearch()
    },
    filterByUser(username) {
      this.filters.username = username
      this.handleSearch()
    },
    filterByUserFromDrawer(username) {
      this.drawer.visible = false
      this.filters.username = username
      this.handleSearch()
    },
    handleSizeChange(val) {
      this.pagination.limit = val
      this.pagination.page = 1
      this.fetchData()
    },
    handleCurrentChange(val) {
      this.pagination.page = val
      this.fetchData()
    },
    getCategoryTagType(category) {
      switch (category) {
        case '成人内容':
          return 'danger'
        case '社交与视频':
          return 'warning'
        case '主流服务':
          return 'success'
        default:
          return 'info'
      }
    },
    getCategoryEmoji(category) {
      switch (category) {
        case '成人内容':
          return '🔞'
        case '社交与视频':
          return '💬'
        case '主流服务':
          return '🛠️'
        default:
          return '📦'
      }
    },
    async openDomainUsersDrawer(domain) {
      this.drawer.targetDomain = domain
      this.drawer.visible = true
      this.drawer.loading = true
      try {
        const params = {
          domain: domain,
          date_start: this.dateRange[0],
          date_end: this.dateRange[1]
        }
        const res = await auditDomainUsers(params)
        if (res.msg === 'success' && res.data) {
          this.drawer.records = res.data || []
        }
      } catch (err) {
        console.error('Fetch domain users error:', err)
      } finally {
        this.drawer.loading = false
      }
    }
  }
}
</script>

<style lang="scss" scoped>
.audit-container {
  padding: 20px;

  .filter-card {
    background-color: var(--el-bg-color-overlay, #111827);
    border: 1px solid var(--el-border-color-light, #1f2937);
    border-radius: 12px;
    margin-bottom: 20px;
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);

    .filter-wrapper {
      display: flex;
      flex-direction: column;
      gap: 16px;
    }

    .filter-row {
      display: flex;
      flex-wrap: wrap;
      align-items: center;
      gap: 24px;

      &.second-row {
        margin-top: 4px;
      }
    }

    .filter-item {
      display: flex;
      align-items: center;
      gap: 10px;

      .filter-label {
        font-size: 13px;
        font-weight: 500;
        color: var(--el-text-color-secondary, #9ca3af);
        white-space: nowrap;
      }

      .el-input, .el-select {
        width: 200px;
      }

      &.date-picker-item {
        .el-date-editor {
          width: 320px !important;
        }
      }

      &.cdn-switch-item {
        background: var(--el-bg-color, #0f172a);
        padding: 6px 14px;
        border-radius: 8px;
        border: 1px solid var(--el-border-color-light, #1e293b);
      }
    }

    .filter-actions {
      display: flex;
      gap: 12px;
      margin-left: auto;
    }
  }

  .table-card {
    background-color: var(--el-bg-color-overlay, #111827);
    border: 1px solid var(--el-border-color-light, #1f2937);
    border-radius: 12px;
    padding: 10px;
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);

    .audit-table {
      --el-table-border-color: var(--el-border-color-light, #1f2937);
      background-color: transparent;
    }

    .domain-cell {
      display: flex;
      align-items: center;
      gap: 8px;
      overflow: hidden;

      .domain-text {
        font-family: Menlo, Monaco, Consolas, Courier New, monospace;
        font-size: 13px;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }

      .brand-tag {
        font-weight: 600;
        flex-shrink: 0;
      }
    }

    .visit-count-badge {
      display: inline-block;
      min-width: 24px;
      padding: 2px 8px;
      border-radius: 20px;
      background: var(--el-color-primary-light-9, rgba(99, 102, 241, 0.15));
      color: var(--el-color-primary, #6366f1);
      font-weight: 700;
      font-size: 12px;
    }

    .time-text {
      color: var(--el-text-color-regular, #d1d5db);
      font-size: 13px;
    }

    .pagination-container {
      margin-top: 20px;
      display: flex;
      justify-content: flex-end;
    }
  }

  .drawer-content {
    padding: 0 10px;

    .drawer-visit-badge {
      display: inline-block;
      min-width: 24px;
      padding: 2px 8px;
      border-radius: 20px;
      background: rgba(245, 158, 11, 0.15);
      color: #f59e0b;
      font-weight: 700;
      font-size: 12px;
    }
  }
}

/* Element Plus overrides to fit rich dark theme rules */
:deep(.el-drawer) {
  background-color: var(--el-bg-color-overlay, #111827) !important;
  border-left: 1px solid var(--el-border-color-light, #1f2937) !important;
}

:deep(.el-drawer__title) {
  font-weight: 700;
  color: var(--el-text-color-primary, #ffffff);
}
</style>
