/** 项目详情页 AI 分身的容器锚点 id。
 *
 * 详情页 RSC 用它给 <section> 打 id;
 * ⌘K 命令面板的「问 AI 这个项目」据此 scrollIntoView + 聚焦输入框。
 * 抽到独立模块避免 client 组件反向 import 整个 page.tsx。 */
export const PROJECT_AI_ANCHOR_ID = "ai-chat-project";

/** AiChat 内层容器 id(挂在 forwardRef 容器上,用于查 input 子元素并 focus)。 */
export const PROJECT_AI_INNER_ID = `${PROJECT_AI_ANCHOR_ID}-inner`;
