export async function register() {
  // 仅在 Node.js 运行期、且配置了代理时,给全局 fetch(undici)挂上代理 agent。
  // 用于自托管在国内、需经代理访问 GitHub OAuth 等海外服务的场景;
  // 仅影响 fetch(HTTP),数据库等 TCP 连接不走此代理,不受影响。
  // 代理地址与白名单由 HTTP_PROXY / HTTPS_PROXY / NO_PROXY 环境变量控制(自动读取)。
  if (process.env.NEXT_RUNTIME !== "nodejs") return;
  if (!process.env.HTTP_PROXY && !process.env.HTTPS_PROXY) return;

  const { setGlobalDispatcher, EnvHttpProxyAgent } = await import("undici");
  setGlobalDispatcher(new EnvHttpProxyAgent());
}
