# 任务 05 · 后台 CMS(CRUD + 上传 + Dashboard)

- **状态**:已完成(siteSettings 暂缓,见下)
- **波次**:Wave 3
- **依赖**:01 数据层、04 鉴权(+ 02 设计系统)
- **可与之并行**:07 的后台集成在本任务后进行

## 目标

为各实体实现完整后台管理:Server Action + Zod + React Hook Form + 乐观更新,文件上传走 R2 服务端预签名,并提供数据 Dashboard。

## 交付物(checklist)

- [x] 各领域 `features/<domain>/`:`schema.ts`(Zod)、`actions.ts`(`'use server'` + Zod 校验 + `requireAdmin` 鉴权 + `revalidatePath` / `updateTag`)、`queries.ts`、`components/`(表单 + 列表)
  - [x] projects(含封面上传、techStack、分类、标签多选、草稿/发布)
  - [x] categories、tags、skills、socialLinks、profile
  - [ ] siteSettings — **暂缓**:当前前台无消费方,避免落地无用界面;导航位先给「资料」(profile)
- [x] 通用列表表格 + 表单(RHF + `@hookform/resolvers/zod`):`components/admin/crud-manager.tsx`(对话框增改 + 二次确认删除);分页 / 搜索 / 排序暂缓(数据量小)
- [x] toast 反馈 + `router.refresh()` 重拉(未用 `useOptimistic`,小表单收益有限)
- [x] **文件上传**:`src/lib/storage.ts`(R2 `@aws-sdk/client-s3` 预签名,仅服务端)+ 上传组件(直传 R2)
- [x] Dashboard:项目数 / 浏览量 / 各实体计数 + 最近更新列表(`features/dashboard/queries.ts`)
- [x] **演示只读模式**:后台入口对所有人可见、任意登录用户可进入浏览;非管理员控件禁用 + 横幅提示,写操作由各 Server Action 的 `requireAdmin` 兜底

## 技术要点

- Server Action 返回**类型化结果**(`{ ok, data | fieldErrors }`),表单据此展示错误。
- 预签名 URL 在 server action 生成,客户端直传,**密钥不下发**。
- 写后用 `revalidatePath` / `revalidateTag` 失效前台缓存。

## 相关 Skills

- `ui-ux-pro-max`(后台表单/表格体验)
- `code-review`、`security-review`(Server Action 鉴权与校验)

## 验收标准

- 各实体可增删改查,UI 即时反映(乐观更新)。
- 上传成功且浏览器网络面板中**看不到任何 R2 密钥**。
- 未鉴权调用 Server Action 被拒。
