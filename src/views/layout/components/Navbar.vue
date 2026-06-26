<template>
  <div class="navbar">
    <breadcrumb class="breadcrumb-container" />

    <div class="right-menu">
        <!-- 主题切换按钮 -->
        <div class="icon-btn theme-btn" @click="toggleTheme" :title="themeTooltip">
            <svg v-if="themeMode === 'light'" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="theme-icon-svg"><circle cx="12" cy="12" r="5"></circle><line x1="12" y1="1" x2="12" y2="3"></line><line x1="12" y1="21" x2="12" y2="23"></line><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line><line x1="1" y1="12" x2="3" y2="12"></line><line x1="21" y1="12" x2="23" y2="12"></line><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line></svg>
            <svg v-else-if="themeMode === 'system'" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="theme-icon-svg"><rect x="2" y="3" width="20" height="14" rx="2" ry="2"></rect><line x1="8" y1="21" x2="16" y2="21"></line><line x1="12" y1="17" x2="12" y2="21"></line></svg>
            <svg v-else xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="theme-icon-svg"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path></svg>
        </div>

        <!-- Admin 用户头像与下拉菜单 -->
        <el-dropdown trigger="hover" class="avatar-dropdown">
            <div class="avatar-wrapper">
                <img src="@/assets/avatar.png" class="user-avatar" alt="Avatar" />
                <span class="username">Admin</span>
                <el-icon class="arrow-icon"><ArrowDown /></el-icon>
            </div>
            <template #dropdown>
                <el-dropdown-menu class="avatar-menu">
                    <el-dropdown-item :icon="InfoFilled" @click="systemVersion(); versionVisible=true">
                        {{ $t('navbar.version') }}
                    </el-dropdown-item>
                    <el-dropdown-item :icon="SwitchButton" divided @click="loginOut">
                        {{ $t('navbar.logout') }}
                    </el-dropdown-item>
                </el-dropdown-menu>
            </template>
        </el-dropdown>
        
        <el-dialog :modal="false" :title="$t('navbar.versionTitle')" v-model="versionVisible" :width="dialogWidth">
            <p> <b>Version:</b> {{ versionList.Version || versionList.version || 'v2.15.34' }} </p>
            <p> <b>Git Version:</b> {{ (versionList.GitVersion || versionList.gitVersion) ? (versionList.GitVersion || versionList.gitVersion).slice(0,7) : 'master' }} </p>
            <p> <b>Build Date:</b> {{ versionList.BuildDate || versionList.buildDate || '2026-06-16' }} </p>
            <p> <b>Go Version:</b> {{ versionList.GoVersion || versionList.goVersion || 'go1.21.0' }} </p>
            <template #footer>
                <span class="dialog-footer">
                    <el-button type="primary" @click="versionVisible = false">{{ $t('ok') }}</el-button>
                </span>
            </template>
        </el-dialog>
    </div>
  </div>
</template>

<script>
import { ElMessage } from "element-plus"
import { ArrowDown, SwitchButton, InfoFilled } from '@element-plus/icons-vue'
import { mapGetters, mapState } from 'vuex'
import Breadcrumb from '@/components/Breadcrumb'
import { version } from '@/api/common'

export default {
    setup() {
        return {
            ArrowDown,
            SwitchButton,
            InfoFilled
        }
    },
    data() {
        return {
            versionList: {
                version: '',
                buildDate: '',
                gitVersion: '',
                goVersion: ''
            },
            versionVisible: false
        }
    },
    components: {
        Breadcrumb
    },
    created() {
        document.title = this.docTitle
    },
    computed: {
        ...mapState(['docTitle', 'isAdmin', 'dialogWidth']),
        ...mapGetters([
            'sidebar'
        ]),
        themeMode() {
            return this.$store.state.app.themeMode
        },
        themeTooltip() {
            if (this.themeMode === 'light') return '当前：浅色模式，点击切换深色'
            if (this.themeMode === 'system') return '当前：跟随系统，点击切换深色'
            return '当前：深色模式，点击切换浅色'
        }
    },
    methods: {
        toggleTheme() {
            // 切换逻辑: dark -> light -> dark (system 通过设置页切换)
            const current = this.themeMode
            const next = (current === 'dark' || current === 'system') ? 'light' : 'dark'
            this.$store.dispatch('app/setTheme', next)
        },
        async systemVersion() {
            const result = await version()
            this.versionList = result.Data
        },
        loginOut() {
            this.$store.commit('LOGIN_OUT')
            /* 防止切换角色时addRoutes重复添加路由导致出现警告 */
            window.location.reload()
        }
    }
}
</script>

<style lang="scss" scoped>
.navbar {
    background-color: var(--el-bg-color);
    border-bottom: 1px solid var(--el-border-color);
    height: 50px;
    line-height: 50px;
    position: relative;
    transition: left 0.25s;

    .breadcrumb-container {
        float: left;
        padding-left: 20px;
    }

    .right-menu {
        height: 100%;
        float: right;
        position: absolute;
        right: 16px;
        top: 0;
        bottom: 0;
        display: flex;
        align-items: center;
        gap: 8px;

        /* 通用图标按钮样式 */
        .icon-btn {
            display: flex;
            align-items: center;
            justify-content: center;
            cursor: pointer;
            width: 32px;
            height: 32px;
            border-radius: 8px;
            transition: all 0.2s ease;
            border: 1px solid var(--el-border-color);
            background-color: transparent;
            user-select: none;
            flex-shrink: 0;

            &:hover {
                border-color: var(--el-color-primary);
                background-color: rgba(99, 102, 241, 0.08);
            }

            &:active {
                transform: scale(0.92);
            }
        }

        .theme-btn {
            .theme-icon-svg {
                color: var(--el-text-color-regular);
                transition: transform 0.4s cubic-bezier(0.4, 0, 0.2, 1), color 0.3s;
            }

            &:hover {
                .theme-icon-svg {
                    color: var(--el-color-primary);
                    transform: rotate(30deg) scale(1.15);
                }
            }
        }

        .avatar-dropdown {
            cursor: pointer;
        }

        .avatar-wrapper {
            display: flex;
            align-items: center;
            gap: 8px;
            color: var(--el-text-color-regular);
            transition: color 0.3s;
            height: 50px;
            line-height: 50px;
            margin-left: 8px;

            &:hover {
                color: var(--el-color-primary);
                .user-avatar {
                    border-color: var(--el-color-primary);
                    background-color: rgba(99, 102, 241, 0.15);
                }
            }

            .user-avatar {
                width: 30px;
                height: 30px;
                border-radius: 50%;
                border: 2px solid transparent;
                transition: all 0.3s;
                object-fit: cover;
                flex-shrink: 0;
            }

            .username {
                font-size: 14px;
                font-weight: 500;
                user-select: none;
            }

            .arrow-icon {
                font-size: 12px;
                color: var(--el-text-color-secondary);
            }
        }
    }
}
</style>