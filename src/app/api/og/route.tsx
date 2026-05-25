import { ImageResponse } from "next/og";

export const runtime = "edge";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const title = searchParams.get("title") ?? "zxb · Java 全栈开发者";
  const description =
    searchParams.get("description") ?? "Java 全栈 · 跨端 · 桌面端 · AI 应用 · 端到端类型安全";

  return new ImageResponse(
    <div
      style={{
        height: "100%",
        width: "100%",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        background: "#0c0a09",
        padding: "56px",
      }}
    >
      {/* 终端窗口 */}
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          width: "100%",
          border: "1px solid #292524",
          borderRadius: 14,
          background: "#1c1917",
          overflow: "hidden",
        }}
      >
        {/* 标题栏 */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 10,
            padding: "18px 24px",
            borderBottom: "1px solid #292524",
          }}
        >
          <div
            style={{
              display: "flex",
              width: 14,
              height: 14,
              borderRadius: 7,
              background: "#f87171",
            }}
          />
          <div
            style={{
              display: "flex",
              width: 14,
              height: 14,
              borderRadius: 7,
              background: "#fbbf24",
            }}
          />
          <div
            style={{
              display: "flex",
              width: 14,
              height: 14,
              borderRadius: 7,
              background: "#34d399",
            }}
          />
          <div style={{ display: "flex", marginLeft: 12, fontSize: 20, color: "#78716c" }}>
            ~/zxb — portfolio
          </div>
        </div>

        {/* 内容 */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            padding: "56px 48px",
          }}
        >
          <div style={{ display: "flex", fontSize: 22, color: "#fb923c", marginBottom: 24 }}>
            $ whoami
          </div>
          <div
            style={{
              display: "flex",
              fontSize: 60,
              fontWeight: 700,
              color: "#fafaf9",
              lineHeight: 1.1,
              letterSpacing: "-0.02em",
              maxWidth: "92%",
            }}
          >
            {title}
          </div>
          <div
            style={{
              display: "flex",
              fontSize: 26,
              color: "#a8a29e",
              marginTop: 28,
              maxWidth: "85%",
              lineHeight: 1.4,
            }}
          >
            {description}
          </div>
        </div>
      </div>
    </div>,
    {
      width: 1200,
      height: 630,
    }
  );
}
