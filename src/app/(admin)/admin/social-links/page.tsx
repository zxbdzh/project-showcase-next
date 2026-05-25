import { Suspense } from "react";
import { getSocialLinks } from "@/features/social-links/queries";
import { isAdmin } from "@/lib/is-admin";
import { SocialLinkManager } from "@/features/social-links/components/social-link-manager";

export default function AdminSocialLinksPage() {
  return (
    <div>
      <h1 className="text-2xl font-semibold tracking-tight">社交链接</h1>
      <p className="text-muted-foreground mt-1 mb-6 text-sm">管理联系页与关于页展示的社交链接。</p>
      <Suspense fallback={<p className="text-muted-foreground text-sm">加载中…</p>}>
        <SocialLinkList />
      </Suspense>
    </div>
  );
}

async function SocialLinkList() {
  const [rows, admin] = await Promise.all([getSocialLinks(), isAdmin()]);
  return (
    <SocialLinkManager
      rows={rows.map((l) => ({
        id: l.id,
        platform: l.platform,
        url: l.url,
        icon: l.icon,
        sortOrder: l.sortOrder ?? 0,
      }))}
      readOnly={!admin}
    />
  );
}
