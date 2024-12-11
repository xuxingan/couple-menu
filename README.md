# 情侣菜单 (Couple Menu)

一个温馨有趣的情侣美食愿望清单应用，让恋人之间通过美食传递爱意 ❤️

![应用截图](public/screenshot.png)

## ✨ 功能特点

- 👫 情侣分区 - 独立的男女生愿望清单空间
- 🍜 美食清单 - 轻松添加和管理想吃的美食
- 📝 丰富描述 - 支持添加文字描述和美食图片
- ❤️ 互动功能 - 可以标记"求投喂"并互相回应
- 🎨 精美界面 - 简约设计配合流畅动画效果
- 📱 全端适配 - 完美支持移动端和桌面端显示

## 🛠️ 技术栈

- **前端框架:** Next.js 13 + React 18
- **数据存储:** Supabase
- **样式方案:** TailwindCSS + DaisyUI
- **部署平台:** Vercel

## 🚀 快速开始

### 环境准备

- Node.js 16.x 或更高版本
- pnpm 或 yarn 包管理器
- Supabase 账号和项目

## 本地开发

1. 克隆项目 
```bash
git clone https://github.com/your-username/couple-food-wishlist.git
cd couple-food-wishlist
```

2. 安装依赖
```bash
bash
pnpm install
```
或
```bash
yarn install
```
3. 环境配置
新建`.env.local` 并填入你的配置信息：
```
NEXT_PUBLIC_SUPABASE_URL=你的_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY=你的_SUPABASE_ANON_KEY
```
4. 启动开发服务器
```bash
pnpm dev
```
或
```bash
yarn dev
```
访问 http://localhost:3000 查看应用

## 📝 数据库设置

在 Supabase 中创建以下表：

- `dishes`: 存储美食条目


详细的数据库 schema 可以在 `database.sql` 中找到。

## 🤝 贡献指南

欢迎提交 Pull Request 或创建 Issue！

1. Fork 本项目
2. 创建你的特性分支 (`git checkout -b feature/AmazingFeature`)
3. 提交你的修改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 创建一个 Pull Request

## 📄 开源协议

本项目采用 MIT 协议 - 查看 [LICENSE](LICENSE) 文件了解详情

## 👏 致谢