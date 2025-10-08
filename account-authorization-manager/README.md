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

-   日历视图以颜色区分账号与管理员的授权状态
-   基于 TanStack Table 的状态感知账号表格
-   提醒中心集中呈现账号、管理员到期提醒与替换建议
-   TailwindCSS 构建的现代风格界面，圆角卡片与柔和阴影
-   页面右上角支持中文 / English 一键切换（默认中文，语言偏好会保存在浏览器）

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

### 数据表结构示例

如需在 Supabase 中同步数据，可按照以下名称与字段创建表：

-   `admins_table`
    -   `id` (uuid, Primary key, 默认值 `uuid_generate_v4()`)
    -   `admin_name` (text)
    -   `admin_password` (text，可选)
    -   `start_date` (date)
    -   `end_date` (date)
    -   `description` (text，可选)
    -   `other` (text，可选)
-   `accounts_table`
    -   `id` (uuid, Primary key)
    -   `name` (text)
    -   `authorized_by` (uuid，建议外键关联 `admins_table.id`)
    -   `start_date` (date)
    -   `end_date` (date)
    -   `long_times` (bigint，可存放授权天数)

管理员授权时长不应超过 12 天，前端表单会自动校验。

### 匿名策略（anon 角色。）

若希望在无登录状态下直接写入 Supabase，需要为匿名角色添加读写策略，可在 SQL Editor 中执行：

```sql
-- admins_table
DROP POLICY IF EXISTS "Allow anon select admins_table" ON public.admins_table;
DROP POLICY IF EXISTS "Allow anon insert admins_table" ON public.admins_table;
DROP POLICY IF EXISTS "Allow anon update admins_table" ON public.admins_table;
DROP POLICY IF EXISTS "Allow anon delete admins_table" ON public.admins_table;

CREATE POLICY "Allow anon select admins_table"
  ON public.admins_table
  FOR SELECT
  USING (auth.role() = 'anon');

CREATE POLICY "Allow anon insert admins_table"
  ON public.admins_table
  FOR INSERT
  WITH CHECK (auth.role() = 'anon');

CREATE POLICY "Allow anon update admins_table"
  ON public.admins_table
  FOR UPDATE
  USING (auth.role() = 'anon')
  WITH CHECK (auth.role() = 'anon');

CREATE POLICY "Allow anon delete admins_table"
  ON public.admins_table
  FOR DELETE
  USING (auth.role() = 'anon');

-- accounts_table
DROP POLICY IF EXISTS "Allow anon select accounts_table" ON public.accounts_table;
DROP POLICY IF EXISTS "Allow anon insert accounts_table" ON public.accounts_table;
DROP POLICY IF EXISTS "Allow anon update accounts_table" ON public.accounts_table;
DROP POLICY IF EXISTS "Allow anon delete accounts_table" ON public.accounts_table;

CREATE POLICY "Allow anon select accounts_table"
  ON public.accounts_table
  FOR SELECT
  USING (auth.role() = 'anon');

CREATE POLICY "Allow anon insert accounts_table"
  ON public.accounts_table
  FOR INSERT
  WITH CHECK (auth.role() = 'anon');

CREATE POLICY "Allow anon update accounts_table"
  ON public.accounts_table
  FOR UPDATE
  USING (auth.role() = 'anon')
  WITH CHECK (auth.role() = 'anon');

CREATE POLICY "Allow anon delete accounts_table"
  ON public.accounts_table
  FOR DELETE
  USING (auth.role() = 'anon');
```

> 若计划接入真实登录鉴权，请改为对特定角色开放权限或在后端使用 `service_role` key 代理请求。

### 为何会看到“示例数据模式”

-   未配置 Supabase 环境变量或 Supabase 不可达时，页面默认加载内置 mock 数据，所有新增、编辑、删除操作仅存活在浏览器内存。
-   成功连接 Supabase 后，右上角会显示“Supabase 数据已同步”，此时所有 CRUD 操作均实时写入数据库。

### 多语言切换

-   头部工具栏的“语言”按钮可以在中文与英文之间切换，界面文本、状态提示、表单校验信息会即时更新。
-   语言偏好保存在 `localStorage`，刷新或重新打开页面时会自动应用上次选择的语言。
-   如需扩展更多语言，可在 `src/i18n/translations.js` 中添加词条，并通过 `I18nProvider` 注册。

### CRUD 功能速览

-   **管理员**：新增 / 编辑 / 删除；包含姓名、授权窗口、专长、密码、备注等字段。删除管理员时所有关联账号会解除授权。
-   **账号**：新增 / 编辑 / 删除；支持选择授权管理员、设置起止日期并自动计算授权天数。
-   **提醒与日历**：所有操作完成后立即刷新提醒状态与日历事件，保持数据一致。
