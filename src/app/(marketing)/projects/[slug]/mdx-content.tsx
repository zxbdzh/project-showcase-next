import { MDXRemote } from "next-mdx-remote/rsc";
import type { ComponentProps } from "react";

/** 终端风 MDX 渲染:等宽代码块、琥珀链接 */
const components = {
  pre: (props: ComponentProps<"pre">) => (
    <pre
      className="border-border bg-muted overflow-x-auto rounded-md border p-4 font-mono text-sm"
      {...props}
    />
  ),
  code: (props: ComponentProps<"code">) => <code className="font-mono text-sm" {...props} />,
  a: (props: ComponentProps<"a">) => (
    <a
      className="text-brand hover:text-brand-hover underline underline-offset-4 transition-colors"
      {...props}
    />
  ),
};

export function MdxContent({ source }: { source: string }) {
  return <MDXRemote source={source} components={components} />;
}
