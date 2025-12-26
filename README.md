# Ear Read (耳读)

Ear Read 是一个专注于音频学习的 Web 应用程序，由 Next.js 构建。它旨在提供类似"得到"或"微信"文章阅读的优质用户体验，支持 PWA（渐进式 Web 应用），可安装在移动设备上使用。

## ✨ 主要功能

- **沉浸式音频播放**: 全局悬浮播放器，支持播放列表管理、倍速播放、进度记忆。
- **课程与文章**: 支持 Markdown 渲染的富文本课程内容，提供舒适的阅读体验。
- **多订阅管理**: 支持添加和管理多个外部课程资源（基于 RSS/JSON）。[查看编写指南](#订阅文件编写指南)
- **全局搜索**: 快速搜索所有订阅源中的课程和节目标题。
- **深色模式**: 支持浅色/深色/跟随系统三种主题模式切换。
- **离线支持**: 集成 PWA 功能，支持离线访问和桌面/主屏幕安装。
- **本地化存储**: 使用 LocalStorage 在本地存储播放进度和订阅数据，保护隐私。

## 🛠️ 技术栈

- **框架**: [Next.js 16](https://nextjs.org/) (App Router)
- **UI 库**: React 19
- **样式**: [Tailwind CSS v4](https://tailwindcss.com/)
- **状态管理**: [Zustand](https://github.com/pmndrs/zustand)
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

## 订阅文件编写指南

 为了让 Ear Read 能够加载您的课程资源，您需要按以下格式编写一个 JSON 文件（通常命名为 `rss.json`，并将其托管在支持跨域请求的服务器上）。

### 1. 基本结构

 订阅文件是一个包含多个“课程（Course）”对象的 JSON 数组。

 ```json
 [
   {
     "id": "course-id-1",
     "title": "课程名称",
     "cover": "cover.jpg", 
     "resources": [
       {
         "id": "resource-id-1",
         "title": "标题：第一讲",
         "audio_file": "audio/01.mp3",
         "content_file": "docs/01.md"
       }
     ]
   }
 ]
 ```

### 2. 字段详细说明

 | 字段 | 类型 | 说明 | 是否必填 |
 | :--- | :--- | :--- | :--- |
 | **课程 (Course)** | | | |
 | `id` | String | 课程的唯一标识符 | 是 |
 | `title` | String | 课程的显示标题 | 是 |
 | `cover` | String | 课程封面图的 URL 或相对路径 | 否 |
 | `resources` | Array | 该课程下的资源/单讲列表 | 是 |
 | **资源 (Resource)** | | | |
 | `id` | String | 单讲内容的唯一标识符 | 是 |
 | `title` | String | 单讲内容的显示标题 | 是 |
 | `audio_file` | String | 音频文件路径（相对于 JSON 的路径或绝对 URL） | 否 |
 | `content_file` | String | 内容 Markdown 文件路径（相对于 JSON 的路径或绝对 URL） | 否 |

### 3. 路径说明

- `audio_file` 和 `content_file` 建议使用 **相对路径**。
- 程序会自动基于订阅 JSON 的 URL 来解析这些相对路径。
- **跨域提示**: 托管 JSON 的服务器必须支持 CORS (跨域资源共享)，否则浏览器将无法加载。

### 4. 示例参考

 这是一个公开的订阅示例：
 `http://t7ic5bq7b.hn-bkt.clouddn.com/rss.json`
