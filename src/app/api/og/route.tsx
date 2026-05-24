import { ImageResponse } from "next/og";

export const runtime = "edge";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const title = searchParams.get("title") ?? "Java 全栈工程师 · 作品集";
  const description =
    searchParams.get("description") ?? "Java / Spring Boot 后端 · 端到端 Web 应用开发";

  return new ImageResponse(
    <div
      style={{
        height: "100%",
        width: "100%",
        display: "flex",
        flexDirection: "column",
        alignItems: "flex-start",
        justifyContent: "center",
        background: "#000000",
        padding: "80px",
      }}
    >
      <div
        style={{
          fontSize: 14,
          fontWeight: 600,
          color: "#4F46E5",
          letterSpacing: "0.05em",
          marginBottom: 24,
        }}
      >
        Java 全栈工程师 · 作品集
      </div>
      <div
        style={{
          fontSize: 56,
          fontWeight: 700,
          color: "#f5f5f7",
          lineHeight: 1.1,
          letterSpacing: "-0.02em",
          maxWidth: "80%",
        }}
      >
        {title}
      </div>
      <div
        style={{
          fontSize: 24,
          color: "#a1a1a6",
          marginTop: 24,
          maxWidth: "70%",
          lineHeight: 1.4,
        }}
      >
        {description}
      </div>
    </div>,
    {
      width: 1200,
      height: 630,
    }
  );
}
