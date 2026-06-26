<template>
    <router-view />
</template>

<script>
export default {
    name: 'App',
    created() {
        // 在应用启动时立即应用存储的主题设置
        this.$store.dispatch('app/applyTheme')
    }
}
</script>
