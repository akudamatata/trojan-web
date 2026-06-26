<template>
  <div class="navbar">
    <breadcrumb class="breadcrumb-container" />

    <div class="right-menu">
        <!-- 主题切换按钮 -->
        <div class="icon-btn theme-btn" @click="toggleTheme" :title="themeTooltip">
            <span class="icon-btn-icon">{{ themeIcon }}</span>
        </div>

        <!-- 语言切换快捷按钮 -->
        <div class="icon-btn lang-btn" @click="toggleLanguage" :title="currentLangText === 'EN' ? '切换为英文' : 'Switch to Chinese'">
            <span class="icon-btn-text">{{ currentLangText }}</span>
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
        currentLangText() {
            return this.$i18n.locale === 'zh' ? 'EN' : '中'
        },
        themeMode() {
            return this.$store.state.app.themeMode
        },
        themeIcon() {
            if (this.themeMode === 'light') return '☀️'
            if (this.themeMode === 'system') return '💻'
            return '🌙'
        },
        themeTooltip() {
            if (this.themeMode === 'light') return '当前：浅色模式，点击切换深色'
            if (this.themeMode === 'system') return '当前：跟随系统，点击切换深色'
            return '当前：深色模式，点击切换浅色'
        }
    },
    methods: {
        toggleLanguage() {
            const nextLang = this.$i18n.locale === 'zh' ? 'en' : 'zh'
            this.$i18n.locale = nextLang
            this.$store.dispatch('app/setLanguage', nextLang)
            ElMessage({
                message: nextLang === 'zh' ? '切换语言成功' : 'Switch Language Success',
                type: 'success'
            })
        },
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
            .icon-btn-icon {
                font-size: 16px;
                line-height: 1;
            }
        }

        .lang-btn {
            .icon-btn-text {
                font-size: 12px;
                font-weight: 700;
                color: var(--el-text-color-secondary);
            }

            &:hover .icon-btn-text {
                color: var(--el-color-primary);
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