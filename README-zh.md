# AppPreviewed

🌍 [*Read this in English*](https://github.com/dhs964057117/AppPreviewed/blob/main/README.md)

**AppPreviewed** 是一个快速、轻量且功能强大的 Web 应用程序，旨在帮助开发者和设计师轻松创建精美的 App Store 和 Google Play 应用截图及设备模型。它基于现代 Web 技术构建，可直接在浏览器中为您提供流畅的编辑体验。

<img src="./public/preview.png" style="zoom:25%; display: block; margin-left: auto; margin-right: auto;" />

## ✨ 功能特点

* **直观的画布编辑器**: 轻松拖放和编辑元素，制作完美的应用截图。

* **多平台支持**: 生成专为 Apple App Store 和 Google Play Store 尺寸量身定制的设备预览图。

* **可自定义模板**: 内置多种布局模板，助您快速上手。

* **高质量导出**: 下载高分辨率的 PNG/JPEG 格式图片，可直接用于应用商店提交。

* **SEO 与广告支持**: 已预先配置 Meta 标签、站点地图 (Sitemap) 以及 Google AdSense 代码，便于变现和搜索引擎收录。

* **现代技术栈**: 采用 React、Vite 构建，并使用现代 CSS 框架进行样式设计。

## 🛠️ 本地开发

1. 克隆仓库：

   ```bash
   git clone [https://github.com/yourusername/AppPreviewed.git](https://github.com/yourusername/AppPreviewed.git)
   cd AppPreviewed
   ```
2. 安装依赖：
   ```bash
   npm install
   ```
3. 启动本地开发服务：
   ```bash
   npm run dev
   ```
## 🚀 如何部署到 Cloudflare Pages

将 AppPreviewed 部署到 Cloudflare Pages 非常简单，并且能为您提供极佳的全球边缘节点访问速度。

1. 将代码推送到 GitHub：确保您的 AppPreviewed 项目代码库已推送到 GitHub。

2. 登录 Cloudflare：前往 Cloudflare 控制台，并进入左侧的 Workers & Pages 菜单。

3. 创建新页面：点击 创建应用程序 (Create application) -> Pages -> 连接到 Git (Connect to Git)。

4. 选择代码库：授权您的 GitHub 账号，并选中您的 AppPreviewed 仓库。

5. 配置构建设置：
  * 框架预设 (Framework preset): 选择 Vite
  * 构建命令 (Build command): npm run build
  * 构建输出目录 (Build output directory): dist

6. 部署：点击 保存并部署 (Save and Deploy)。Cloudflare 会自动构建并发布您的网站，完成后会分配给您一个可访问的域名！

## 🎁 推荐我的另一款应用：SnapSaver

寻找更多实用工具？欢迎体验我上架到 Google Play 的另一款精彩应用！

* 🌐 **[SnapSaver 官方网站](https://snapsaver.suansuan.dpdns.org/)**
* 📱 **[在 Google Play 商店获取](https://play.google.com/store/apps/details?id=com.awesome.dhs.tools.snapsave)**

---