<template>
  <div :class="{'has-logo': true, 'is-collapsed': isCollapse}" class="sidebar-container-inner">
    <!-- 系统 Logo 与标题区域 -->
    <div class="sidebar-logo-container">
      <div class="logo-wrapper">
        <img src="@/assets/logo.png" class="logo-img" alt="Logo" />
        <span v-show="!isCollapse" class="logo-title">Trojan Web</span>
      </div>
    </div>

    <!-- 菜单区域 -->
    <el-scrollbar wrap-class="scrollbar-wrapper">
      <el-menu
        router
        :default-active="activeMenu"
        :collapse="isCollapse"
        background-color="transparent"
        text-color="#a0aec0"
        :unique-opened="false"
        active-text-color="#ffffff"
        :collapse-transition="false"
        mode="vertical"
      >
        <sidebar-item v-for="route in routes" :key="route.path" :item="route" :base-path="route.path" />
      </el-menu>
    </el-scrollbar>

    <!-- 底部收起/展开按钮 -->
    <div class="collapse-trigger" @click="toggleSideBar">
      <el-icon class="trigger-icon">
        <ArrowLeft v-if="!isCollapse" />
        <ArrowRight v-else />
      </el-icon>
      <span v-show="!isCollapse" class="trigger-text">收起侧边栏</span>
    </div>
  </div>
</template>

<script>
import { mapGetters } from 'vuex'
import SidebarItem from './SidebarItem'
import { ArrowLeft, ArrowRight } from '@element-plus/icons-vue'

export default {
    components: { SidebarItem, ArrowLeft, ArrowRight },
    computed: {
        ...mapGetters([
            'sidebar'
        ]),
        routes() {
            return this.$router.options.routes
        },
        activeMenu() {
            const route = this.$route
            const { meta, path } = route
            if (meta.activeMenu) {
                return meta.activeMenu
            }
            return path
        },
        isCollapse() {
            return !this.sidebar.opened
        }
    },
    methods: {
        toggleSideBar() {
            this.$store.dispatch('app/toggleSideBar')
        }
    }
}
</script>

<style lang="scss" scoped>
.sidebar-container-inner {
  height: 100%;
  display: flex;
  flex-direction: column;
  background-color: #0a0e17;
}

.sidebar-logo-container {
  height: 51px;
  display: flex;
  align-items: center;
  padding: 0 16px;
  border-bottom: 1px solid #1f2937;
  overflow: hidden;
  
  .logo-wrapper {
    display: flex;
    align-items: center;
    gap: 10px;
  }
  
  .logo-img {
    width: 28px;
    height: 28px;
    border-radius: 6px;
    object-fit: cover;
    flex-shrink: 0;
  }
  
  .logo-title {
    font-size: 15px;
    font-weight: 700;
    color: #ffffff;
    letter-spacing: 0.5px;
    white-space: nowrap;
  }
}

.scrollbar-wrapper {
  flex: 1;
}

.collapse-trigger {
  height: 48px;
  border-top: 1px solid #1f2937;
  display: flex;
  align-items: center;
  padding: 0 20px;
  cursor: pointer;
  color: #a0aec0;
  transition: all 0.3s;
  background-color: #0d111a;
  gap: 12px;
  overflow: hidden;
  white-space: nowrap;

  &:hover {
    color: #ffffff;
    background-color: #1a202c;
  }

  .trigger-icon {
    font-size: 16px;
    transition: transform 0.3s;
  }

  .trigger-text {
    font-size: 13px;
    font-weight: 500;
  }
}

.is-collapsed {
  .sidebar-logo-container {
    padding: 0;
    justify-content: center;
    .logo-wrapper {
      justify-content: center;
      
      .logo-icon {
        margin: 0 !important;
      }
    }
  }
  .collapse-trigger {
    padding: 0;
    justify-content: center;
    .trigger-text {
      display: none;
    }
  }
}
</style>
