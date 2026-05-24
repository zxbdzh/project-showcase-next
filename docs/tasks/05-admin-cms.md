# 任务 05 · 后台 CMS(CRUD + 上传 + Dashboard)

- **状态**:待开始
- **波次**:Wave 3
- **依赖**:01 数据层、04 鉴权(+ 02 设计系统)
- **可与之并行**:07 的后台集成在本任务后进行

## 目标

为各实体实现完整后台管理:Server Action + Zod + React Hook Form + 乐观更新,文件上传走 R2 服务端预签名,并提供数据 Dashboard。

## 交付物(checklist)

- [ ] 各领域 `features/<domain>/`:`schema.ts`(Zod)、`actions.ts`(`'use server'` + Zod 校验 + `auth()` 鉴权 + `revalidatePath`)、`queries.ts`、`components/`(表单 + 列表)
  - [ ] projects(含封面上传、techStack、分类、标签多选、草稿/发布)
  - [ ] categories、tags、skills、socialLinks、siteSettings
- [ ] 通用列表表格(分页 / 搜索 / 排序)与表单(RHF + `@hookform/resolvers/zod`)
- [ ] 乐观更新(`useOptimistic`)+ toast 反馈
- [ ] **文件上传**:`src/lib/storage.ts`(R2 `@aws-sdk/client-s3` 预签名,仅服务端)+ 上传组件(直传 R2)
- [ ] Dashboard:项目数 / 浏览量 / 最近活动等统计卡片

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
