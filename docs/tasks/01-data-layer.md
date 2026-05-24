# 任务 01 · 数据层(Drizzle + Neon)

- **状态**:已完成（代码已创建，待安装依赖验证）
- **波次**:Wave 1
- **依赖**:仅脚手架
- **可与之并行**:02 设计系统、08 工程化/CI
- **是后续基础**:04 鉴权、05 后台 CMS、06 前台、07 AI 都依赖本任务

## 目标

用 Drizzle 定义全部数据表与关系,迁移到 Neon,并写 seed 脚本灌入示例数据。彻底取代老项目「手写 `Database` 类型 + 前端直连」的反模式,实现 schema 单一真相源 + 类型自动推断。

## 交付物(checklist)

- [ ] 安装 `drizzle-orm` `@neondatabase/serverless`,`-D drizzle-kit` `tsx` `dotenv`
- [x] `src/db/schema/` 按领域拆分表文件:
  - [x] `auth.ts`:`users`(含 `role` pgEnum `admin|user`)、`accounts`、`sessions`、`verificationTokens`(Auth.js 适配器表结构)
  - [x] `profiles.ts`:bio / headline / location / website / avatar
  - [x] `projects.ts`:`slug`(unique)、title、summary、content(MDX)、coverImage、demoUrl、repoUrl、techStack(`text[]`)、featured、status(pgEnum `draft|published`)、views、sortOrder、`categoryId` FK、timestamps
  - [x] `taxonomy.ts`:`categories`、`tags`、`projectsToTags`(联结表 + 复合主键)
  - [x] `skills.ts`、`socialLinks.ts`、`siteSettings.ts`(key + `jsonb` value)
- [x] 用 `relations()` 定义关系(project↔category 一对多、project↔tags 多对多)
- [x] `src/db/index.ts`:`drizzle(neon(...))`(neon-http driver),导出 `db`
- [x] `drizzle.config.ts`:dialect `postgresql`、schema 路径、out `./drizzle`
- [x] `src/db/seed.ts`:分类、标签、技能、社交链接、若干示例项目
- [ ] `package.json` 脚本:`db:generate` / `db:migrate` / `db:push` / `db:seed`

## 技术要点

- 类型统一用 `typeof table.$inferSelect` / `$inferInsert` 导出(`src/db/schema/index.ts` 汇总 re-export)。
- 时间戳:`timestamp(...).defaultNow()` + `.$onUpdate(() => new Date())`。
- 枚举用 `pgEnum`;slug 唯一索引;外键 `onDelete`。
- 参考已批准 plan 的「数据模型」一节。Neon 连接串放 `DATABASE_URL`(服务端,经 `env.ts`)。

## 相关 Skills

- `code-review`(schema 设计审查)

## 验收标准

- `pnpm db:push` 成功建表;`pnpm db:seed` 后能查询到数据。
- 在一个临时 RSC / 脚本里 `db.query.projects.findMany({ with: { category, tags } })` 类型与运行均正确。
