import { Suspense } from "react";
import { connection } from "next/server";
import { getHeroConfigForEdit } from "@/features/hero/admin-queries";
import { HeroForm } from "@/features/hero/components/hero-form";

export default function AdminHeroPage() {
  return (
    <div>
      <h1 className="text-2xl font-semibold tracking-tight">首页 Hero</h1>
      <p className="text-muted-foreground mt-1 mb-6 text-sm">
        编辑首页开场「开机序列」与交互终端的文案。
      </p>
      <Suspense fallback={<p className="text-muted-foreground text-sm">加载中…</p>}>
        <HeroEditor />
      </Suspense>
    </div>
  );
}

async function HeroEditor() {
  await connection();
  const cfg = await getHeroConfigForEdit();
  return <HeroForm defaultValues={cfg} />;
}
