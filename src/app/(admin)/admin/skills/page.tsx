import { Suspense } from "react";
import { connection } from "next/server";
import { getSkills } from "@/features/skills/queries";
import { SkillManager } from "@/features/skills/components/skill-manager";

export default function AdminSkillsPage() {
  return (
    <div>
      <h1 className="text-2xl font-semibold tracking-tight">技能</h1>
      <p className="text-muted-foreground mt-1 mb-6 text-sm">管理关于页展示的技能与熟练度。</p>
      <Suspense fallback={<p className="text-muted-foreground text-sm">加载中…</p>}>
        <SkillList />
      </Suspense>
    </div>
  );
}

async function SkillList() {
  await connection();
  const rows = await getSkills();
  return (
    <SkillManager
      rows={rows.map((s) => ({
        id: s.id,
        name: s.name,
        category: s.category,
        level: s.level ?? 0,
        icon: s.icon,
        sortOrder: s.sortOrder ?? 0,
      }))}
    />
  );
}
