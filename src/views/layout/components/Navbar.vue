<template>
  <div class="navbar">
    <breadcrumb class="breadcrumb-container" />

    <div class="right-menu">
        <!-- 一键切换语言按钮 -->
        <div class="lang-switch-btn" @click="toggleLanguage">
            <span class="lang-text">{{ currentLangText }}</span>
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
            <p> version: {{ versionList.version }} </p>
            <p> gitVersion: {{ versionList.gitVersion.slice(0,7) }} </p>
            <p> buildDate: {{ versionList.buildDate }} </p>
            <p> goVersion: {{ versionList.goVersion }} </p>
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
        right: 20px;
        top: 0;
        bottom: 0;
        display: flex;
        align-items: center;
        gap: 20px;

        .lang-switch-btn {
            display: flex;
            align-items: center;
            gap: 6px;
            cursor: pointer;
            color: var(--el-text-color-secondary);
            font-size: 13px;
            padding: 2px 10px;
            height: 28px;
            line-height: 24px;
            border-radius: 6px;
            transition: all 0.3s;
            border: 1px solid var(--el-border-color);
            background-color: rgba(255, 255, 255, 0.02);
            user-select: none;

            &:hover {
                color: var(--el-color-primary);
                border-color: var(--el-color-primary);
                background-color: rgba(99, 102, 241, 0.08);
            }

            .lang-icon {
                font-size: 15px;
            }
            .lang-text {
                font-weight: 600;
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