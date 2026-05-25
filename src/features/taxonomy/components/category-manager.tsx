"use client";

import { CrudManager, type CrudColumn, type CrudField } from "@/components/admin/crud-manager";
import { categoryFormSchema, type CategoryFormValues } from "../schema";
import { createCategory, updateCategory, deleteCategory } from "../actions";

export type CategoryRow = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
};

const fields: CrudField<CategoryFormValues>[] = [
  { name: "name", label: "名称", required: true, placeholder: "如 Web 应用" },
  {
    name: "slug",
    label: "Slug",
    required: true,
    hint: "URL 片段,仅小写字母、数字与连字符",
    placeholder: "web-app",
  },
  { name: "description", label: "描述", type: "textarea" },
];

const columns: CrudColumn<CategoryRow>[] = [
  { header: "名称", cell: (r) => <span className="font-medium">{r.name}</span> },
  {
    header: "Slug",
    cell: (r) => <span className="text-muted-foreground font-mono text-xs">/{r.slug}</span>,
  },
  {
    header: "描述",
    cell: (r) => <span className="text-muted-foreground line-clamp-1">{r.description ?? "—"}</span>,
  },
];

const empty: CategoryFormValues = { name: "", slug: "", description: "" };

export function CategoryManager({ rows, readOnly }: { rows: CategoryRow[]; readOnly: boolean }) {
  return (
    <CrudManager
      rows={rows}
      columns={columns}
      fields={fields}
      schema={categoryFormSchema}
      emptyValues={empty}
      toValues={(r) => ({ name: r.name, slug: r.slug, description: r.description ?? "" })}
      labelOf={(r) => r.name}
      entityName="分类"
      create={createCategory}
      update={updateCategory}
      remove={deleteCategory}
      emptyHint="还没有分类,点击右上角新建。"
      readOnly={readOnly}
    />
  );
}
