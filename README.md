# Trojan Panel Web

<p align="center">
  <img src="https://img.shields.io/badge/Vue-3.x-4fc08d?style=flat-svg&logo=vue.js" alt="Vue 3">
  <img src="https://img.shields.io/badge/Element--Plus-latest-409eff?style=flat-svg&logo=element" alt="Element Plus">
  <img src="https://img.shields.io/badge/Vite-latest-646cff?style=flat-svg&logo=vite" alt="Vite">
  <img src="https://img.shields.io/badge/License-MIT-success?style=flat-svg" alt="MIT License">
</p>

这是一个专为 [Trojan 管理程序](https://github.com/Jrohy/trojan) 打造的高级、现代且响应式的前端管理面板。项目基于最新的前端技术栈构建，具有精致的深色视觉风格、丝滑的微交互动画以及全方位的管理功能。

---

## ✨ 核心亮点

* **🌌 极致视觉美感**：采用精心调校的暗黑美学设计，搭配毛玻璃渐变和柔和发光动效，为运维体验注入高级质感。
* **📊 实时状态大屏**：整合系统资源（CPU/内存）、存储状态（磁盘/Swap）、网络实时速率和历史流量趋势的精美 SVG 可视化折线图，支持自适应布局，侧边栏展开无缝伸缩。
* **👥 智能用户管理**：
  * 支持一键批量重置流量、批量限制额度。
  * 引入全新设计的**批量设置到期限期**功能（支持首选日历选择及多档快捷选项一键预设）。
  * 智能流量预警，用户用量到达阈值时自动展示高亮视觉提醒。
* **👮 安全防范与连入控制**：
  * **P2P/BT 滥用警报**：对用户近期的恶意 P2P 下载行为进行诊断，并在详情页顶部展示醒目的版权警示条。
  - **最近连入记录审计**：查看用户最近 30 天连入过的 IP 及其物理属地与运营商，支持对在线客户端 IP 执行**一键断流**踢下线。
  - **防火墙黑名单**：支持一键封禁恶意 IP，提供黑名单管理弹窗，支持一键解封操作。
* **🔒 域名与证书自动化**：一键申请与更新双域名 SSL 证书，完美整合“伪装站”配置。自动停用与恢复 Nginx 端口分流，极简化运维。
* **🌍 多语言生态**：深度适配中英文双语，所有界面文字、操作反馈均支持国际化无缝切换。

---

## 🛠️ 技术底座

| 核心依赖 | 作用说明 |
| :--- | :--- |
| **Vue 3** | 高性能组件化开发框架 |
| **Element Plus** | 现代化的组件库支持 |
| **Vite** | 极速的构建工具与冷启动开发服务 |
| **Day.js** | 轻量级时间与日期处理库 |
| **EasyQRCodeJS** | 高性能多终端分享二维码渲染引擎 |

---

## 🚀 快速启动指南

### 1. 克隆与环境配置
```bash
# 克隆本项目
git clone https://github.com/Jrohy/trojan-web.git
cd trojan-web
```

### 2. 安装项目依赖
推荐使用 `npm` 进行依赖管理：
```bash
npm install
```

### 3. 开发环境预览
启动 Vite 开发服务器，享受秒级热更新：
```bash
npm run dev
```

### 4. 生产环境构建
编译并压缩打包，输出的代码会自动进行代码分割及体积优化，生成至 `dist` 目录：
```bash
npm run build
```

---

## 📂 项目结构规范

```text
├── src/
│   ├── api/          # 接口请求封装 (user, common, data, trojan)
│   ├── assets/       # 静态资源与全局样式
│   ├── components/   # 通用交互组件
│   ├── lang/         # 国际化语言包 (zh.js, en.js)
│   ├── router/       # Vue Router 路由配置
│   ├── store/        # Vuex 状态管理
│   ├── utils/        # 工具函数库
│   └── views/        # 页面视图 (dashboard, user, setting, trojan)
├── index.html
├── package.json
└── vite.config.js
```

---

## 🤝 贡献与反馈

欢迎提交 PR 或 Issue 来共同改进此面板的视觉与交互体验！

* **原作者后端项目**: [Jrohy/trojan](https://github.com/Jrohy/trojan)