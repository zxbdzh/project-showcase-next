# 任务 07 · 流式 AI(亮点 B)

- **状态**:待开始
- **波次**:Wave 2(`lib/ai.ts` 可独立先做)/ Wave 3(后台集成)
- **依赖**:01 数据层;后台集成依赖 05 后台 CMS
- **可与之并行**:03 3D Hero、04 鉴权、06 前台

## 目标

用 Vercel AI SDK 接入 GLM(OpenAI 兼容端点),为项目内容**流式生成标签 / 简介**,后台编辑时实时展示并支持一键采纳——密钥只在服务端。

## 交付物(checklist)

- [ ] 安装 `ai` `@ai-sdk/openai`
- [ ] `src/lib/ai.ts`:用 `createOpenAI({ baseURL: GLM端点, apiKey: 服务端密钥 })` 配置 provider(`GLM_API_KEY` / `GLM_BASE_URL` / `GLM_MODEL` 经 `env.ts`,仅服务端)
- [ ] 流式端点:`app/api/ai/tags/route.ts`(或 server action),用 `streamText` / `streamObject` 基于项目标题+描述生成标签建议
- [ ] 后台集成(任务 05 之后):项目表单内「AI 生成标签/简介」按钮 + 流式展示(`useObject` / `useChat`)+ 采纳到表单
- [ ] 错误与限流处理(失败回退、禁用态)

## 技术要点

- 用 `streamObject` + Zod schema 产出**结构化**标签建议(`{ name, confidence }[]`),前端边流边渲染。
- 所有 AI 调用在服务端;客户端只与本应用的 route/action 通信,**绝不暴露 GLM key**(根治老项目的 `VITE_GLM_API_KEY` 泄漏)。

## 相关 Skills

- `vercel-react-best-practices`(流式 UI / 渲染边界)

## 验收标准

- 后台点击生成,标签**流式**逐条出现,可一键采纳。
- 浏览器网络面板中无 GLM 密钥;请求只打到本应用端点。
