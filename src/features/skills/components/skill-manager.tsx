"use client";

import { CrudManager, type CrudColumn, type CrudField } from "@/components/admin/crud-manager";
import { skillFormSchema, type SkillFormValues } from "../schema";
import { createSkill, updateSkill, deleteSkill } from "../actions";

export type SkillRow = {
  id: string;
  name: string;
  category: string | null;
  level: number;
  icon: string | null;
  sortOrder: number;
};

const fields: CrudField<SkillFormValues>[] = [
  { name: "name", label: "名称", required: true, placeholder: "如 Spring Boot" },
  { name: "category", label: "分类", hint: "如 后端 / 前端 / 工具", placeholder: "后端" },
  { name: "level", label: "熟练度", type: "number", hint: "0–100" },
  { name: "icon", label: "图标", hint: "simple-icons 名称,可留空", placeholder: "springboot" },
  { name: "sortOrder", label: "排序", type: "number", hint: "数字越小越靠前" },
];

const columns: CrudColumn<SkillRow>[] = [
  { header: "名称", cell: (r) => <span className="font-medium">{r.name}</span> },
  {
    header: "分类",
    cell: (r) => <span className="text-muted-foreground">{r.category ?? "—"}</span>,
  },
  { header: "熟练度", cell: (r) => <span className="font-mono">{r.level}</span>, align: "right" },
  { header: "排序", cell: (r) => <span className="font-mono">{r.sortOrder}</span>, align: "right" },
];

const empty: SkillFormValues = { name: "", category: "", level: 0, icon: "", sortOrder: 0 };

export function SkillManager({ rows, readOnly }: { rows: SkillRow[]; readOnly: boolean }) {
  return (
    <CrudManager
      rows={rows}
      columns={columns}
      fields={fields}
      schema={skillFormSchema}
      emptyValues={empty}
      toValues={(r) => ({
        name: r.name,
        category: r.category ?? "",
        level: r.level,
        icon: r.icon ?? "",
        sortOrder: r.sortOrder,
      })}
      labelOf={(r) => r.name}
      entityName="技能"
      create={createSkill}
      update={updateSkill}
      remove={deleteSkill}
      emptyHint="还没有技能,点击右上角新建。"
      readOnly={readOnly}
    />
  );
}
