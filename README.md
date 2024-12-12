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
- 🤖 AI 助手 - 智能推荐菜品所需的食材清单
- 📋 食材管理 - 支持编辑和自定义食材配比

## 🛠️ 技术栈

- **前端框架:** Next.js 13 + React 18
- **数据存储:** Supabase
- **样式方案:** TailwindCSS + DaisyUI
- **AI 能力:** Deepseek Chat API
- **部署平台:** Vercel

## 🚀 快速开始

### 环境准备

- Node.js 16.x 或更高版本
- pnpm 或 yarn 包管理器
- Supabase 账号和项目
- Deepseek API 密钥

## 本地开发

1. 克隆项目 
```bash
git clone https://github.com/your-username/couple-food-wishlist.git
cd couple-food-wishlist
```

2. 安装依赖
```bash
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
NEXT_PUBLIC_OPENAI_BASE_URL=你的_DEEPSEEK_API_URL
NEXT_PUBLIC_OPENAI_API_KEY=你的_DEEPSEEK_API_KEY
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

- `dishes`: 存储美食条目，包含以下字段：
  - `id`: UUID 主键
  - `name`: 菜品名称
  - `description`: 菜品描述
  - `image_url`: 图片链接
  - `created_by`: 创建者('male'/'female')
  - `wished`: 求投喂状态
  - `cooking_time_minutes`: 烹饪时间
  - `ingredients`: 食材清单(JSONB)

详细的数据库 schema 可以在 `database.sql` 中找到。

## 🤖 AI 功能

本项目集成了 Deepseek Chat API，提供以下智能功能：

- **智能食材推荐**: 根据菜品名称自动生成所需的食材清单
- **精确用量建议**: AI 会根据经验推荐每种食材的适当用量
- **JSON 格式化**: 自动将 AI 响应格式化为标准的 JSON 数据结构

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

- [Deepseek](https://deepseek.com/) - 提供强大的 AI 对话能力
- [Supabase](https://supabase.com/) - 提供可靠的数据存储服务
- [DaisyUI](https://daisyui.com/) - 提供精美的 UI 组件