"use client";

import { CrudManager, type CrudColumn, type CrudField } from "@/components/admin/crud-manager";
import { tagFormSchema, type TagFormValues } from "../schema";
import { createTag, updateTag, deleteTag } from "../actions";

export type TagRow = {
  id: string;
  name: string;
  slug: string;
};

const fields: CrudField<TagFormValues>[] = [
  { name: "name", label: "名称", required: true, placeholder: "如 TypeScript" },
  {
    name: "slug",
    label: "Slug",
    required: true,
    hint: "URL 片段,仅小写字母、数字与连字符",
    placeholder: "typescript",
  },
];

const columns: CrudColumn<TagRow>[] = [
  { header: "名称", cell: (r) => <span className="font-medium">{r.name}</span> },
  {
    header: "Slug",
    cell: (r) => <span className="text-muted-foreground font-mono text-xs">/{r.slug}</span>,
  },
];

const empty: TagFormValues = { name: "", slug: "" };

export function TagManager({ rows }: { rows: TagRow[] }) {
  return (
    <CrudManager
      rows={rows}
      columns={columns}
      fields={fields}
      schema={tagFormSchema}
      emptyValues={empty}
      toValues={(r) => ({ name: r.name, slug: r.slug })}
      labelOf={(r) => r.name}
      entityName="标签"
      create={createTag}
      update={updateTag}
      remove={deleteTag}
      emptyHint="还没有标签,点击右上角新建。"
    />
  );
}
