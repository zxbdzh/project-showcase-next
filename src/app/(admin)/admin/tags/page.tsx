import { Suspense } from "react";
import { connection } from "next/server";
import { getTags } from "@/features/taxonomy/queries";
import { TagManager } from "@/features/taxonomy/components/tag-manager";

export default function AdminTagsPage() {
  return (
    <div>
      <h1 className="text-2xl font-semibold tracking-tight">标签</h1>
      <p className="text-muted-foreground mt-1 mb-6 text-sm">管理项目标签。</p>
      <Suspense fallback={<p className="text-muted-foreground text-sm">加载中…</p>}>
        <TagList />
      </Suspense>
    </div>
  );
}

async function TagList() {
  await connection();
  const rows = await getTags();
  return <TagManager rows={rows.map((t) => ({ id: t.id, name: t.name, slug: t.slug }))} />;
}
