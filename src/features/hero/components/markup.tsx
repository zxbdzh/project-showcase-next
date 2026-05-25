"use client";

import { Fragment, type ReactNode } from "react";
import { Link } from "next-view-transitions";

/** 站内路由提示:可点击跳转(走 View Transitions) */
export function RouteLink({ href, children }: { href: string; children: ReactNode }) {
  return (
    <Link href={href} className="text-brand decoration-brand/40 underline-offset-2 hover:underline">
      {children}
    </Link>
  );
}

/** 可经文本自动链接化的站内路由 */
const INTERNAL_ROUTES = new Set(["/projects", "/about", "/contact"]);

// 顺序:*高亮* | http(s) 链接 | /站内路由
const TOKEN = /(\*[^*\n]+\*)|(https?:\/\/[^\s]+)|(\/[a-z]+)/g;

/** 把一行文本切成纯文本 / 高亮 / 链接片段。linkify 为 false 时只处理高亮。 */
function renderInline(text: string, linkify: boolean, keyBase: string): ReactNode[] {
  const out: ReactNode[] = [];
  const re = new RegExp(TOKEN);
  let last = 0;
  let i = 0;
  let m: RegExpExecArray | null;
  while ((m = re.exec(text)) !== null) {
    if (m.index > last) {
      out.push(<Fragment key={`${keyBase}-t${i}`}>{text.slice(last, m.index)}</Fragment>);
    }
    const [full, hl, url, route] = m;
    if (hl) {
      out.push(
        <span key={`${keyBase}-h${i}`} className="text-brand">
          {hl.slice(1, -1)}
        </span>
      );
    } else if (url && linkify) {
      out.push(
        <a
          key={`${keyBase}-u${i}`}
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          className="text-brand decoration-brand/40 underline-offset-2 hover:underline"
        >
          {url}
        </a>
      );
    } else if (route && linkify && INTERNAL_ROUTES.has(route)) {
      out.push(
        <RouteLink key={`${keyBase}-r${i}`} href={route}>
          {route}
        </RouteLink>
      );
    } else {
      out.push(<Fragment key={`${keyBase}-p${i}`}>{full}</Fragment>);
    }
    last = m.index + full.length;
    i += 1;
  }
  if (last < text.length) out.push(<Fragment key={`${keyBase}-end`}>{text.slice(last)}</Fragment>);
  return out;
}

/** 单行内联文本:仅把 *星号* 片段渲染为品牌色。供开机序列叙事用。 */
export function Highlighted({ text }: { text: string }) {
  return <>{renderInline(text, false, "hl")}</>;
}

/** 多行终端输出:按 \n 拆行,*高亮* + 站内路由 / 外链自动链接化。 */
export function TerminalOutput({ text }: { text: string }) {
  const lines = text.split("\n");
  return (
    <div className="text-muted-foreground">
      {lines.map((line, i) => (
        <p key={i}>{line === "" ? " " : renderInline(line, true, `l${i}`)}</p>
      ))}
    </div>
  );
}
