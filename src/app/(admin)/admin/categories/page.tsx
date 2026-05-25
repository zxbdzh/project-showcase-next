import { Suspense } from "react";
import { getCategories } from "@/features/taxonomy/queries";
import { isAdmin } from "@/lib/is-admin";
import { CategoryManager } from "@/features/taxonomy/components/category-manager";

export default function AdminCategoriesPage() {
  return (
    <div>
      <h1 className="text-2xl font-semibold tracking-tight">分类</h1>
      <p className="text-muted-foreground mt-1 mb-6 text-sm">管理项目分类。</p>
      <Suspense fallback={<p className="text-muted-foreground text-sm">加载中…</p>}>
        <CategoryList />
      </Suspense>
    </div>
  );
}

async function CategoryList() {
  const [rows, admin] = await Promise.all([getCategories(), isAdmin()]);
  return (
    <CategoryManager
      rows={rows.map((c) => ({ id: c.id, name: c.name, slug: c.slug, description: c.description }))}
      readOnly={!admin}
    />
  );
}
