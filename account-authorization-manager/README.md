# 账号授权管理器

账号授权管理器是基于 Vite、React、TailwindCSS、FullCalendar 与 TanStack Table 打造的轻量化控制台，用于统一查看账号授权、管理员授权窗口以及相关提醒。

## 快速开始

```bash
npm install
npm run dev
```

打开浏览器访问 `http://localhost:5173` 即可查看界面。

## 目录结构

```
src/
├─ components/     # 日历、数据表格与提醒组件
├─ data/           # 模拟账号与管理员数据
├─ hooks/          # 授权状态与提醒逻辑
├─ pages/          # 仪表盘、列表与提醒页面
├─ App.jsx         # 应用外壳与导航
├─ main.jsx        # 应用入口
└─ index.css       # TailwindCSS 引导样式
```

## 功能亮点

- 日历视图以颜色区分账号与管理员的授权状态
- 基于 TanStack Table 的状态感知账号表格
- 提醒中心集中呈现账号、管理员到期提醒与替换建议
- TailwindCSS 构建的现代风格界面，圆角卡片与柔和阴影

## 接入 Supabase（可选）

项目默认内置了一份示例数据。如果你希望接入真实数据库，可按照以下步骤配置 Supabase：

1. 在 Supabase 控制台创建项目，记录 `Project URL` 与匿名 `anon key`。
2. 复制 `.env.example` 为 `.env.local`，填写：
   ```
   VITE_SUPABASE_URL=你的 Supabase 项目地址
   VITE_SUPABASE_ANON_KEY=匿名 anon key
   ```
3. 重新运行 `npm run dev`（或 `npm run build`），前端会自动读取真实数据。
4. 若在部署平台（GitHub Pages、Cloudflare Pages 等）构建，需要在平台的环境变量中配置同名键值对。

> 未配置 Supabase 时，页面会自动回退到示例数据；成功连接后，可在右上角状态栏看到同步提示，并可随时手动刷新。
