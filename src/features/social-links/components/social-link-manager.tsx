"use client";

import { CrudManager, type CrudColumn, type CrudField } from "@/components/admin/crud-manager";
import { socialLinkFormSchema, type SocialLinkFormValues } from "../schema";
import { createSocialLink, updateSocialLink, deleteSocialLink } from "../actions";

export type SocialLinkRow = {
  id: string;
  platform: string;
  url: string;
  icon: string | null;
  sortOrder: number;
};

const fields: CrudField<SocialLinkFormValues>[] = [
  { name: "platform", label: "平台", required: true, placeholder: "如 GitHub" },
  { name: "url", label: "链接", type: "url", required: true, placeholder: "https://" },
  { name: "icon", label: "图标", hint: "simple-icons 名称,可留空", placeholder: "github" },
  { name: "sortOrder", label: "排序", type: "number", hint: "数字越小越靠前" },
];

const columns: CrudColumn<SocialLinkRow>[] = [
  { header: "平台", cell: (r) => <span className="font-medium">{r.platform}</span> },
  {
    header: "链接",
    cell: (r) => (
      <span className="text-muted-foreground line-clamp-1 font-mono text-xs">{r.url}</span>
    ),
  },
  { header: "排序", cell: (r) => <span className="font-mono">{r.sortOrder}</span>, align: "right" },
];

const empty: SocialLinkFormValues = { platform: "", url: "", icon: "", sortOrder: 0 };

export function SocialLinkManager({ rows }: { rows: SocialLinkRow[] }) {
  return (
    <CrudManager
      rows={rows}
      columns={columns}
      fields={fields}
      schema={socialLinkFormSchema}
      emptyValues={empty}
      toValues={(r) => ({
        platform: r.platform,
        url: r.url,
        icon: r.icon ?? "",
        sortOrder: r.sortOrder,
      })}
      labelOf={(r) => r.platform}
      entityName="社交链接"
      create={createSocialLink}
      update={updateSocialLink}
      remove={deleteSocialLink}
      emptyHint="还没有社交链接,点击右上角新建。"
    />
  );
}
