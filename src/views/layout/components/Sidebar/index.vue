<template>
  <div :class="{'has-logo': true, 'is-collapsed': isCollapse}" class="sidebar-container-inner">
    <!-- 系统 Logo 与标题区域 -->
    <div class="sidebar-logo-container" :class="{'is-collapsed': isCollapse}">
      <div v-show="!isCollapse" class="logo-wrapper">
        <img src="@/assets/logo.png" class="logo-img" alt="Logo" />
        <span class="logo-title">{{ docTitle || 'Trojan Web' }}</span>
      </div>
      <div class="hamburger-btn" @click="toggleSideBar">
        <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2.1" stroke-linecap="round" stroke-linejoin="round">
          <line x1="3" y1="12" x2="21" y2="12"></line>
          <line x1="3" y1="6" x2="21" y2="6"></line>
          <line x1="3" y1="18" x2="21" y2="18"></line>
        </svg>
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
  </div>
</template>

<script>
import { mapGetters } from 'vuex'
import SidebarItem from './SidebarItem'

export default {
    components: { SidebarItem },
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
        },
        docTitle() {
            return this.$store.state.docTitle
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
  height: 50px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 16px;
  border-bottom: 1px solid #1f2937;
  overflow: hidden;
  box-sizing: border-box;
  
  .logo-wrapper {
    display: flex;
    align-items: center;
    gap: 10px;
    flex: 1;
    min-width: 0;
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
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .hamburger-btn {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 28px;
    height: 28px;
    border-radius: 6px;
    color: #a0aec0;
    cursor: pointer;
    transition: all 0.2s;
    flex-shrink: 0;
    margin-left: 8px;

    &:hover {
      color: #ffffff;
      background-color: #1a202c;
    }
  }

  &.is-collapsed {
    padding: 0;
    justify-content: center;
    
    .hamburger-btn {
      width: 100%;
      height: 100%;
      border-radius: 0;
      color: #a0aec0;
      
      &:hover {
        color: #ffffff;
        background-color: #1a202c;
      }
    }
  }
}

.scrollbar-wrapper {
  flex: 1;
}

</style>
