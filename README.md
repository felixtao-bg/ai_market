# AI Market

Next.js 技能 / MCP 小集市：市场列表、产品管理、Auth.js 登录（含钱包 SIWE + RainbowKit）、Stripe 占位。

## 本地开发

1. 复制环境变量：`cp .env.example .env`，按需填写 `AUTH_SECRET` 等。
2. 启动 PostgreSQL：`docker compose up -d`（端口 **5433**）。
3. 同步库表：`npx prisma migrate dev`（首次会应用 `prisma/migrations`）。
4. 可选种子：`npm run db:seed`
5. 启动：`npm run dev` → [http://localhost:3000](http://localhost:3000)

> 若曾使用旧版 SQLite，请改用上面的 `DATABASE_URL` 指向 Postgres，勿再使用 `file:./prisma/dev.db`。

## 部署到 Vercel

### 托管 PostgreSQL：怎么拿到 `DATABASE_URL`

`DATABASE_URL` 是一整段 **Postgres 连接 URI**，形如：

`postgresql://用户名:密码@主机:5432/数据库名?参数…`

Prisma 要求协议是 `postgresql://` 或 `postgres://`。托管平台控制台里一般叫 **Connection string**、**URI**、**Database URL**。

---

#### 方案 A：Neon（常用，有免费档）

1. 打开 [https://neon.tech](https://neon.tech) 注册并登录。
2. **Create a project**：起个项目名，**Region** 尽量选离 Vercel 部署区域近的（例如美东 `aws-us-east-1`，减少延迟）。
3. 创建完成后进入该项目的 **Dashboard**。
4. 找到 **Connection details**（或 **Connect**）面板。
5. 把 **Connection string** 选成 **PostgreSQL**，必要时点 **Reveal password** / **Reset password**，复制整段 URI。
6. 若字符串里没有 SSL 相关参数，可在末尾补上 `?sslmode=require`（Neon 多数模板已带好）。

把复制的内容作为 **`DATABASE_URL`**（本地可写进 `.env`，Vercel 里新建同名环境变量）。

---

#### 方案 B：Supabase（常用，有免费档）

1. 打开 [https://supabase.com](https://supabase.com) 注册并登录。
2. **New project**：选组织、数据库密码（请保存），选区域后等待实例就绪。
3. 左侧 **Project Settings**（齿轮）→ **Database**。
4. 滚动到 **Connection string**，模式选 **URI**。
5. 复制连接串，把其中的 **`[YOUR-PASSWORD]`** 换成你创建项目时设的数据库密码（若含特殊字符需按 URL 编码）。
6. 连接串里通常已带 `?sslmode=require`；**Session mode** / **Transaction mode** 对 Serverless 的说明以 Supabase 文档为准，先沿用页面默认 URI 即可跑通首次部署。

同样把最终 URI 填到 **`DATABASE_URL`**。

---

#### 方案 C：Vercel Postgres（和 Vercel 同一账单、集成方便）

1. 打开 [Vercel Dashboard](https://vercel.com/dashboard) → 顶部或 **Storage** 进入存储。
2. **Create Database** → 选 **Postgres**（或 **Neon** 等 Vercel 提供的托管入口，按向导创建）。
3. 创建后打开该数据库详情页，查看 **Quickstart** / **.env.local** 里列出的变量名。
4. 控制台往往会给出 `POSTGRES_URL`、`POSTGRES_PRISMA_URL` 等：**把适合 Prisma 的那一条（常见为带 `prisma` 或文档标明用于 ORM 的 URL）整段复制**，在 Vercel 项目里命名为 **`DATABASE_URL`** 粘贴进去（若官方写明可直接映射 `POSTGRES_PRISMA_URL`，按其说明即可）。

把数据库 **Connect / Link** 到你的 Next 项目后，有时变量会自动注入；仍以界面里实际变量名为准。

---

#### 填到哪儿

- **Vercel**：Project → **Settings** → **Environment Variables** → 新增 **`DATABASE_URL`**，勾选 **Production**（以及需要的 Preview / Development），保存。
- **本地**：`.env` 里一行 `DATABASE_URL="粘贴的 URI"`（勿提交到 Git）。

---

1. 把代码推到 **GitHub / GitLab / Bitbucket**。
2. 打开 [vercel.com/new](https://vercel.com/new)，导入该仓库，Framework Preset 选 **Next.js**（默认构建命令会使用 `npm run build`，其中包含 `prisma migrate deploy`）。
3. 在 Vercel 项目 **Settings → Environment Variables** 中至少配置：

| 变量 | 说明 |
|------|------|
| `DATABASE_URL` | 托管 PostgreSQL 连接串（推荐 [Neon](https://neon.tech)、[Supabase](https://supabase.com)、[Vercel Postgres](https://vercel.com/storage/postgres) 等） |
| `AUTH_SECRET` | `openssl rand -base64 32` 生成 |
| `AUTH_TRUST_HOST` | `true` |
| `AUTH_URL` | 生产站点根地址，如 `https://xxx.vercel.app`（自定义域名则填该域名） |
| `NEXTAUTH_URL` | 与 `AUTH_URL` 相同即可（兼容旧名） |
| `NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID` | [Reown Cloud](https://cloud.reown.com) 项目 ID（钱包扫码） |

按需再加 OAuth、Stripe 等（与 `.env.example` 一致）。**不要**在生产环境设置 `AUTH_DEV_LOGIN=1`。

4. 首次 **Deploy**。构建阶段会向数据库执行迁移；请保证 `DATABASE_URL` 已对应该库且网络可达（Neon 等通常需允许 Vercel 区域访问）。
5. 部署完成后把 `AUTH_URL` / `NEXTAUTH_URL` 改成最终域名并 **Redeploy**（若首次用了临时预览域名）。

Webhook（如 Stripe）需在对应控制台把 Endpoint URL 改为生产地址。

## 脚本摘要

- `npm run build` — 生产构建（`prisma migrate deploy` + `next build`，需可用的 `DATABASE_URL`；Vercel 默认跑此命令）
- `npm run build:next-only` — 仅 `next build`（本地未起库时凑合验证编译）
- `npm run dev` — 本地开发（Webpack，与 RainbowKit/viem 兼容）
- `npm run dev:turbo` — 可选 Turbopack（可能与 viem 子路径解析冲突）
