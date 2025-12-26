# Ear Read (耳读)

Ear Read 是一个专注于音频学习的 Web 应用程序，由 Next.js 构建。它旨在提供类似“得到”或“微信”文章阅读的优质用户体验，支持 PWA（渐进式 Web 应用），可安装在移动设备上使用。

## ✨ 主要功能

- **沉浸式音频播放**: 全局悬浮播放器，支持播放列表管理、倍速播放、进度记忆。
- **课程与文章**: 支持 Markdown 渲染的富文本课程内容，提供舒适的阅读体验。
- **订阅管理**: 支持添加和管理外部课程资源（基于 RSS/JSON）。
- **离线支持**: 集成 PWA 功能，支持离线访问和桌面/主屏幕安装。
- **本地化存储**: 使用 Dexie.js (IndexedDB) 在本地存储播放进度和订阅数据，保护隐私。

## 🛠️ 技术栈

- **框架**: [Next.js 15](https://nextjs.org/) (App Router)
- **UI 库**: React 19
- **样式**: [Tailwind CSS v4](https://tailwindcss.com/)
- **状态管理**: [Zustand](https://github.com/pmndrs/zustand)
- **数据库**: [Dexie.js](https://dexie.org/)
- **PWA**: [@ducanh2912/next-pwa](https://github.com/DuCanhGH/next-pwa)
- **图标**: Lucide React

## 🚀 快速开始

本项目使用 [pnpm](https://pnpm.io/) 进行包管理。

1. **安装依赖**

    ```bash
    pnpm install
    ```

2. **启动开发服务器**

    ```bash
    pnpm dev
    ```

    打开 [http://localhost:3000](http://localhost:3000) 查看结果。

## 📱 PWA 说明

本项目配置了 PWA 支持。在生产环境构建中，Service Worker 会自动注册。
在开发模式下，可以通过浏览器开发者工具的 "Application" 标签页检查 PWA 状态。

## 🤝 贡献

欢迎提交 Issue 和 Pull Request 来改进这个项目。
