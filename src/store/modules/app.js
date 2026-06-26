import { getLanguage } from '@/lang/index'

// 应用主题到 html 元素
function applyThemeToDOM(mode) {
    const html = document.documentElement
    if (mode === 'system') {
        const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
        html.setAttribute('data-theme', prefersDark ? 'dark' : 'light')
    } else {
        html.setAttribute('data-theme', mode)
    }
}

const state = {
    sidebar: {
        opened: Object.prototype.hasOwnProperty.call(localStorage, 'sidebarStatus') ? localStorage.getItem('sidebarStatus') === '1' : true,
        withoutAnimation: false
    },
    language: getLanguage(),
    device: 'desktop',
    themeMode: localStorage.getItem('themeMode') || 'dark'
}

const mutations = {
    TOGGLE_SIDEBAR: state => {
        state.sidebar.opened = !state.sidebar.opened
        state.sidebar.withoutAnimation = false
        if (state.sidebar.opened) {
            localStorage.setItem('sidebarStatus', 1)
        } else {
            localStorage.setItem('sidebarStatus', 0)
        }
    },
    CLOSE_SIDEBAR: (state, withoutAnimation) => {
        localStorage.setItem('sidebarStatus', 0)
        state.sidebar.opened = false
        state.sidebar.withoutAnimation = withoutAnimation
    },
    TOGGLE_DEVICE: (state, device) => {
        state.device = device
    },
    SET_LANGUAGE: (state, language) => {
        state.language = language
        localStorage.setItem('language', language)
    },
    SET_THEME: (state, mode) => {
        state.themeMode = mode
        localStorage.setItem('themeMode', mode)
    }
}

const actions = {
    toggleSideBar({ commit }) {
        commit('TOGGLE_SIDEBAR')
    },
    closeSideBar({ commit }, { withoutAnimation }) {
        commit('CLOSE_SIDEBAR', withoutAnimation)
    },
    toggleDevice({ commit }, device) {
        commit('TOGGLE_DEVICE', device)
    },
    setLanguage({ commit }, language) {
        commit('SET_LANGUAGE', language)
    },
    setTheme({ commit, state }, mode) {
        commit('SET_THEME', mode)
        applyThemeToDOM(mode)

        // 如果是 system 模式，监听系统主题变化
        if (mode === 'system') {
            const mq = window.matchMedia('(prefers-color-scheme: dark)')
            const handler = () => applyThemeToDOM('system')
            // 移除旧的监听器（保存在 window 上防止重复绑定）
            if (window._themeMediaQueryHandler) {
                mq.removeEventListener('change', window._themeMediaQueryHandler)
            }
            window._themeMediaQueryHandler = handler
            mq.addEventListener('change', handler)
        } else {
            // 非 system 模式，移除 system 监听器
            const mq = window.matchMedia('(prefers-color-scheme: dark)')
            if (window._themeMediaQueryHandler) {
                mq.removeEventListener('change', window._themeMediaQueryHandler)
                window._themeMediaQueryHandler = null
            }
        }
    },
    applyTheme({ dispatch, state }) {
        dispatch('setTheme', state.themeMode)
    }
}

export default {
    namespaced: true,
    state,
    mutations,
    actions
}
