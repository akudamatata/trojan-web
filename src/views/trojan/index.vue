<template>
  <div :style="mainStyle" class="trojan-container">
    <el-form :inline="true" class="control-form">
        <el-form-item>
            <el-button-group class="modern-btn-group">
                <el-button type="primary" :icon="Refresh" @click="update()">{{ textShow($t('update')) }}</el-button>
                <el-button type="success" :icon="VideoPlay" @click="start()">{{ textShow($t('start')) }}</el-button>
                <el-button type="danger" :icon="VideoPause" @click="stop()">{{ textShow($t('stop')) }}</el-button>
                <el-button type="warning" :icon="RefreshRight" @click="restart()">{{ textShow($t('restart')) }}</el-button>
            </el-button-group>
        </el-form-item>
        <el-form-item :label="$t('type')" class="form-select-item">
            <el-select v-model="type" :placeholder="$t('choice')" filterable @change="trojanSwitch()" style="width: 120px;">
            <el-option
                v-for="item in typeOptions"
                :key="item.label"
                :label="item.label"
                :value="item.label">
            </el-option>
            </el-select>
        </el-form-item>
        <el-form-item :label="$t('loglevel')" class="form-select-item">
            <el-select v-model="loglevel" :placeholder="$t('choice')" filterable @change="setLoglevel()" style="width: 110px;">
            <el-option
                v-for="item in loglevelOptions"
                :key="item.label"
                :label="item.label"
                :value="item.value">
            </el-option>
            </el-select>
        </el-form-item>
        <el-form-item :label="$t('line')" class="form-select-item">
            <el-select v-model="line" :placeholder="$t('choice')" filterable @change="getLog()" style="width: 110px;">
            <el-option
                v-for="item in logLineOptions"
                :key="item.label"
                :label="item.label"
                :value="item.value">
            </el-option>
            </el-select>
        </el-form-item>
        <el-form-item :label="$t('latest')" class="form-switch-item">
            <el-switch v-model="isFollow" active-color="#6366f1"></el-switch>
        </el-form-item>
    </el-form>

    <!-- Dev Terminal Console Window -->
    <div class="terminal-window">
      <div class="terminal-header">
        <div class="terminal-dots">
          <span class="dot red"></span>
          <span class="dot yellow"></span>
          <span class="dot green"></span>
        </div>
        <div class="terminal-title">Trojan System Terminal (Ctrl + Scroll to Zoom)</div>
      </div>
      <textarea id="logshow" readonly="readonly" class="terminal-body"></textarea>
    </div>
  </div>
</template>

<script>
import store from '@/store/index.js'
import { mapState } from 'vuex'
import { version } from '@/api/common'
import { Refresh, VideoPlay, VideoPause, RefreshRight } from '@element-plus/icons-vue'
import { start, stop, restart, update, getLoglevel, setLoglevel, trojanSwitch } from '@/api/trojan'
export default {
    setup() {
        return {
            Refresh,
            VideoPlay,
            VideoPause,
            RefreshRight
        }
    },
    data() {
        return {
            timer: null,
            isFollow: true,
            ws: null,
            scrollHeight: 0,
            fontSize: 13,
            mainStyle: {
                height: 0
            },
            typeOptions: [
                {
                    label: 'trojan'
                },
                {
                    label: 'trojan-go'
                }
            ],
            loglevelOptions: [
                {
                    label: 'ALL',
                    value: 0
                },
                {
                    label: 'INFO',
                    value: 1
                },
                {
                    label: 'WARN',
                    value: 2
                },
                {
                    label: 'ERROR',
                    value: 3
                },
                {
                    label: 'FATAL',
                    value: 4
                },
                {
                    label: 'OFF',
                    value: 5
                }
            ],
            logLineOptions: [
                {
                    label: '100',
                    value: 100
                },
                {
                    label: '300',
                    value: 300
                },
                {
                    label: '1000',
                    value: 1000
                },
                {
                    label: '5000',
                    value: 5000
                },
                {
                    label: this.$t('all'),
                    value: -1
                }
            ]
        }
    },
    mounted() {
        this.$store.commit('SET_NOERROR', true)
        this.mainStyle.height = (window.innerHeight - 85) + 'px'
        window.onresize = () => {
            this.mainStyle.height = (window.innerHeight - 85) + 'px'
        }
        const textarea = document.getElementById('logshow')
        // 监听这个dom的scroll事件
        textarea.addEventListener('scroll', () => {
            if (textarea.scrollHeight > textarea.clientHeight && textarea.scrollTop < this.scrollHeight) {
                this.isFollow = false
            } else {
                this.isFollow = true
            }
        }, true)
        this.getLog()
        this.getLoglevel()
        this.getTrojanType()
    },
    computed: {
        ...mapState(['line', 'loglevel', 'type', 'dialogWidth']),
        line: {
            get() {
                return this.$store.state.line
            },
            set(val) {
                this.$store.commit('SET_LINE', val)
            }
        },
        loglevel: {
            get() {
                return this.$store.state.loglevel
            },
            set(val) {
                this.$store.commit('SET_LOGLEVEL', val)
            }
        },
        type: {
            get() {
                return this.$store.state.type
            },
            set(val) {
                this.$store.commit('SET_TYPE', val)
            }
        }
    },
    unmounted() {
        this.$store.commit('SET_NOERROR', false)
        clearInterval(this.timer)
        this.timer = null
        this.ws.close()
    },
    methods: {
        textShow(text) {
            if (this.dialogWidth === '80%') {
                return ''
            } else {
                return text
            }
        },
        async setLoglevel() {
            try {
                const formData = new FormData()
                formData.set('level', this.loglevel)
                const result = await setLoglevel(formData)
                if (result.Msg === 'success') {
                    this.$message({
                        message: this.$t('trojan.loglevelSuccess'),
                        type: 'success'
                    })
                }
            } catch (e) {
                this.getLog()
            }
        },
        async getLoglevel() {
            const result = await getLoglevel()
            if (result.Msg === 'success') {
                this.loglevel = result.Data.loglevel
            } else {
                this.$message.error(result.Msg)
            }
        },
        async getTrojanType() {
            const result = await version()
            if (result.Msg === 'success') {
                this.type = result.Data.trojanType
            } else {
                this.$message.error(result.Msg)
            }
        },
        async start() {
            try {
                const result = await start()
                if (result.Msg === 'success') {
                    this.$message({
                        message: this.$t('trojan.startSuccess'),
                        type: 'success'
                    })
                }
            } catch (e) {
                this.getLog()
            }
        },
        async stop() {
            const result = await stop()
            if (result.Msg === 'success') {
                this.$message({
                    message: this.$t('trojan.stopSuccess'),
                    type: 'success'
                })
            }
        },
        async restart() {
            try {
                const result = await restart()
                if (result.Msg === 'success') {
                    this.$message({
                        message: this.$t('trojan.restartSuccess'),
                        type: 'success'
                    })
                }
            } catch (e) {
                this.getLog()
            }
        },
        async update() {
            try {
                const result = await update()
                if (result.Msg === 'success') {
                    this.$message({
                        message: this.$t('trojan.updateSuccess'),
                        type: 'success'
                    })
                }
            } catch (e) {
                this.getLog()
            }
        },
        async trojanSwitch() {
            try {
                const formData = new FormData()
                formData.set('type', this.type)
                const result = await trojanSwitch(formData)
                if (result.Msg === 'success') {
                    this.$message({
                        message: this.$t('trojan.switchSuccess'),
                        type: 'success'
                    })
                } else {
                    this.$message.error(result.Msg)
                }
            } catch (e) {
                this.getLog()
                this.$message({
                    message: this.$t('trojan.switchSuccess'),
                    type: 'success'
                })
            }
        },
        getLog() {
            this.isFollow = true
            if (this.ws != null) {
                this.ws.close()
                clearInterval(this.timer)
                this.timer = null
            }
            const textarea = document.getElementById('logshow')
            textarea.innerText = ''
            const prefix = process.env.NODE_ENV === 'production' ? '' : '/ws'
            const protocol = document.location.protocol === 'http:' ? 'ws' : 'wss'
            this.ws = new WebSocket(`${protocol}://${location.host}${prefix}/trojan/log?line=${this.line}&token=${store.state.UserToken}`)
            this.ws.onopen = function () {
                console.log('ws connected!')
            }
            this.ws.onmessage = function(e) {
                textarea.append(e.data)
            }
            this.ws.onerror = function(e) {
                console.log('ws error: ' + e)
            }
            this.ws.onclose = function() {
                console.log('ws closed')
            }
            textarea.scrollTop = textarea.scrollHeight
            this.scrollHeight = textarea.scrollTop
            this.timer = setInterval(() => {
                if (this.isFollow) {
                    textarea.scrollTop = textarea.scrollHeight
                    this.scrollHeight = textarea.scrollTop
                }
            }, 1000)
            // detect available wheel event
            const wheelSupport = 'onwheel' in document.createElement('div') ? 'wheel' : document.onmousewheel !== undefined ? 'mousewheel' : 'DOMMouseScroll'
            const logshow = document.getElementById('logshow')
            logshow.addEventListener(wheelSupport, (e) => {
                if (e.ctrlKey) {
                    e.preventDefault()
                    if (e.deltaY < 0) {
                        logshow.style.fontSize = ++this.fontSize + 'px'
                    } else {
                        logshow.style.fontSize = --this.fontSize + 'px'
                    }
                }
            }, { passive: false })
        }
    }
}
</script>

<style lang="scss" scoped>
.trojan-container {
  padding: 24px;
  background-color: var(--el-bg-color-page);
  display: flex;
  flex-direction: column;
  box-sizing: border-box;
}

.control-form {
  background: var(--el-bg-color-overlay);
  padding: 18px 24px 4px 24px;
  border-radius: 12px;
  border: 1px solid var(--el-border-color);
  margin-bottom: 24px;
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 12px;

  ::v-deep(.el-form-item) {
    margin-bottom: 14px !important;
  }
}

.modern-btn-group {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  border-radius: 8px;
  overflow: hidden;
  border: 1px solid var(--el-border-color);

  .el-button {
    border: none !important;
    border-radius: 0 !important;
    margin: 0 !important;
  }
}

.form-select-item {
  ::v-deep(.el-form-item__label) {
    color: var(--el-text-color-regular) !important;
    font-weight: 500;
  }
}

.form-switch-item {
  margin-left: 10px;
  ::v-deep(.el-form-item__label) {
    color: var(--el-text-color-regular) !important;
    font-weight: 500;
  }
}

.terminal-window {
  flex: 1;
  display: flex;
  flex-direction: column;
  border-radius: 12px;
  overflow: hidden;
  border: 1px solid var(--el-border-color);
  background-color: #05070c;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
  margin-bottom: 10px;
}

.terminal-header {
  height: 36px;
  background-color: #0f1319;
  border-bottom: 1px solid var(--el-border-color);
  display: flex;
  align-items: center;
  padding: 0 16px;
  position: relative;
}

.terminal-dots {
  display: flex;
  gap: 6px;
  
  .dot {
    width: 12px;
    height: 12px;
    border-radius: 50%;
    
    &.red { background-color: #ef4444; }
    &.yellow { background-color: #f59e0b; }
    &.green { background-color: #10b981; }
  }
}

.terminal-title {
  position: absolute;
  left: 50%;
  transform: translateX(-50%);
  color: var(--el-text-color-secondary);
  font-size: 12px;
  font-family: 'Inter', sans-serif;
  font-weight: 500;
}

.terminal-body {
  flex: 1;
  width: 100%;
  height: calc(100% - 36px);
  padding: 16px;
  background-color: #05070c !important;
  color: #10b981 !important;
  font-family: 'Consolas', 'Courier New', monospace;
  font-size: 13px;
  line-height: 1.5;
  border: none !important;
  resize: none;
  outline: none;
  box-sizing: border-box;
  overflow-y: auto;
  
  &::-webkit-scrollbar {
    width: 8px;
    height: 8px;
  }
  &::-webkit-scrollbar-thumb {
    background-color: #1a202c;
    border-radius: 4px;
    &:hover {
      background-color: #2d3748;
    }
  }
  &::-webkit-scrollbar-track {
    background: #05070c;
  }
}

/* 浅色主题终端与控制面板适配 */
:root[data-theme="light"] {
  .control-form {
    border-color: #e2e8f0;
  }
  
  .modern-btn-group {
    border-color: #e2e8f0;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.04);
  }
  
  .terminal-window {
    background-color: #f8fafc;
    border-color: #e2e8f0;
    box-shadow: 0 10px 30px rgba(99, 102, 241, 0.08);
  }
  
  .terminal-header {
    background-color: #f1f5f9;
    border-bottom: 1px solid #e2e8f0;
  }
  
  .terminal-body {
    background-color: #f8fafc !important;
    color: #334155 !important;
    
    &::-webkit-scrollbar-thumb {
      background-color: #cbd5e1;
      &:hover {
        background-color: #94a3b8;
      }
    }
    &::-webkit-scrollbar-track {
      background: #f8fafc;
    }
  }
}
</style>