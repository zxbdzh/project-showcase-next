"use client";

import { useState, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import {
  useForm,
  type DefaultValues,
  type FieldValues,
  type Path,
  type Resolver,
} from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import type { ZodType } from "zod";
import { toast } from "sonner";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Field } from "@/components/admin/field";
import { DeleteButton } from "@/components/admin/delete-button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import type { ActionResult } from "@/lib/action-result";

export type CrudField<V extends FieldValues> = {
  name: Path<V>;
  label: string;
  type?: "text" | "number" | "textarea" | "url";
  required?: boolean;
  hint?: string;
  placeholder?: string;
  rows?: number;
};

export type CrudColumn<R> = {
  header: string;
  cell: (row: R) => ReactNode;
  align?: "right";
};

/**
 * 通用单页 CRUD:表格列出小型实体,顶部「新建」与每行「编辑」共用一个对话框表单,删除走二次确认。
 * 配置(列/字段/schema/取值函数)必须在客户端组件内定义后传入 —— 函数无法跨 RSC 边界传递。
 */
export function CrudManager<R extends { id: string }, V extends FieldValues>({
  rows,
  columns,
  fields,
  schema,
  emptyValues,
  toValues,
  labelOf,
  entityName,
  create,
  update,
  remove,
  emptyHint,
  readOnly = false,
}: {
  rows: R[];
  columns: CrudColumn<R>[];
  fields: CrudField<V>[];
  schema: ZodType<V>;
  emptyValues: V;
  toValues: (row: R) => V;
  labelOf: (row: R) => string;
  entityName: string;
  create: (input: V) => Promise<ActionResult<unknown>>;
  update: (id: string, input: V) => Promise<ActionResult<unknown>>;
  remove: (id: string) => Promise<ActionResult>;
  emptyHint: string;
  readOnly?: boolean;
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<V>({
    resolver: zodResolver(schema as never) as unknown as Resolver<V>,
    defaultValues: emptyValues as DefaultValues<V>,
  });

  function openCreate() {
    setEditingId(null);
    reset(emptyValues as DefaultValues<V>);
    setOpen(true);
  }

  function openEdit(row: R) {
    setEditingId(row.id);
    reset(toValues(row) as DefaultValues<V>);
    setOpen(true);
  }

  const onSubmit = handleSubmit(async (values) => {
    const v = values as V;
    const res = editingId ? await update(editingId, v) : await create(v);
    if (res.ok) {
      toast.success(editingId ? "已保存" : "已创建");
      setOpen(false);
      router.refresh();
      return;
    }
    if (res.fieldErrors) {
      for (const [key, msgs] of Object.entries(res.fieldErrors)) {
        if (msgs?.[0]) setError(key as Path<V>, { message: msgs[0] });
      }
    }
    toast.error(res.error);
  });

  const fieldError = (name: Path<V>) =>
    (errors as Record<string, { message?: string } | undefined>)[name]?.message;

  return (
    <>
      <div className="flex justify-end">
        <Button
          size="sm"
          onClick={openCreate}
          disabled={readOnly}
          title={readOnly ? "仅管理员可操作" : undefined}
        >
          <Plus /> 新建{entityName}
        </Button>
      </div>

      {rows.length === 0 ? (
        <div className="border-border/60 text-muted-foreground mt-6 rounded-md border border-dashed p-12 text-center text-sm">
          {emptyHint}
        </div>
      ) : (
        <div className="border-border/60 mt-4 overflow-x-auto rounded-md border">
          <table className="w-full text-sm">
            <thead className="border-border/60 text-muted-foreground border-b text-left text-xs">
              <tr>
                {columns.map((c) => (
                  <th
                    key={c.header}
                    className={`px-4 py-2.5 font-medium ${c.align === "right" ? "text-right" : ""}`}
                  >
                    {c.header}
                  </th>
                ))}
                <th className="px-4 py-2.5 text-right font-medium">操作</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr key={row.id} className="border-border/40 border-b last:border-0">
                  {columns.map((c) => (
                    <td
                      key={c.header}
                      className={`px-4 py-2.5 ${c.align === "right" ? "text-right font-mono" : ""}`}
                    >
                      {c.cell(row)}
                    </td>
                  ))}
                  <td className="px-4 py-2.5">
                    <div className="flex items-center justify-end gap-0.5">
                      <Button
                        variant="ghost"
                        size="icon-sm"
                        onClick={() => openEdit(row)}
                        disabled={readOnly}
                        aria-label={`编辑 ${labelOf(row)}`}
                        title={readOnly ? "仅管理员可操作" : "编辑"}
                      >
                        <Pencil className="size-4" />
                      </Button>
                      {readOnly ? (
                        <Button
                          variant="ghost"
                          size="icon-sm"
                          disabled
                          aria-label={`删除 ${labelOf(row)}`}
                          title="仅管理员可操作"
                        >
                          <Trash2 className="text-destructive size-4" />
                        </Button>
                      ) : (
                        <DeleteButton itemName={labelOf(row)} action={() => remove(row.id)} />
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingId ? "编辑" : "新建"}
              {entityName}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={onSubmit} className="space-y-4">
            {fields.map((f) => (
              <Field
                key={f.name}
                label={f.label}
                htmlFor={f.name}
                required={f.required}
                hint={f.hint}
                error={fieldError(f.name)}
              >
                {f.type === "textarea" ? (
                  <Textarea id={f.name} rows={f.rows ?? 3} {...register(f.name)} />
                ) : (
                  <Input
                    id={f.name}
                    type={f.type === "number" ? "number" : "text"}
                    placeholder={f.placeholder}
                    {...register(f.name, f.type === "number" ? { valueAsNumber: true } : {})}
                  />
                )}
              </Field>
            ))}
            <DialogFooter>
              <DialogClose render={<Button type="button" variant="outline" />}>取消</DialogClose>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "保存中…" : "保存"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}
