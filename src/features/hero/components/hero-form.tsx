"use client";

import { useRouter } from "next/navigation";
import { useForm, useFieldArray, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Plus, Trash2 } from "lucide-react";
import { Field } from "@/components/admin/field";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { heroConfigSchema, type HeroConfig } from "../schema";
import { updateHero } from "../actions";

export function HeroForm({
  defaultValues,
  readOnly,
}: {
  defaultValues: HeroConfig;
  readOnly: boolean;
}) {
  const router = useRouter();
  const {
    register,
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<HeroConfig>({
    resolver: zodResolver(heroConfigSchema),
    defaultValues,
  });

  const { fields, append, remove } = useFieldArray({ control, name: "terminal.commands" });

  const onSubmit = handleSubmit(async (values) => {
    const payload: HeroConfig = {
      ...values,
      intro: {
        ...values.intro,
        lines: values.intro.lines.filter((l) => l.trim() !== ""),
      },
    };
    const res = await updateHero(payload);
    if (res.ok) {
      toast.success("已保存");
      router.refresh();
      return;
    }
    toast.error(res.error);
  });

  return (
    <form onSubmit={onSubmit} className="max-w-2xl space-y-8">
      <p className="text-muted-foreground border-border/60 bg-muted/30 rounded-md border px-3 py-2 text-xs">
        <span className="text-brand font-mono">{"// "}</span>用{" "}
        <span className="text-foreground">*星号*</span> 包裹文字标为品牌色高亮;终端输出里的{" "}
        <span className="text-foreground">/projects</span> 等站内路由与网址会自动变成可点击链接。
        <span className="text-foreground"> help</span> /{" "}
        <span className="text-foreground">clear</span> 为内置命令。
      </p>

      <fieldset disabled={readOnly} className="space-y-8">
        {/* 开场 · 开机序列 */}
        <section className="space-y-5">
          <h2 className="font-mono text-sm font-medium">
            <span className="text-brand">{"// "}</span>开场(开机序列)
          </h2>

          <Field label="问候" htmlFor="greeting" error={errors.intro?.greeting?.message}>
            <Input id="greeting" {...register("intro.greeting")} />
          </Field>

          <Controller
            control={control}
            name="intro.lines"
            render={({ field }) => (
              <Field
                label="自我介绍(每行一句)"
                error={errors.intro?.lines?.message}
                hint="一行一句,最多 8 行"
              >
                <Textarea
                  rows={4}
                  value={field.value.join("\n")}
                  onChange={(e) => field.onChange(e.target.value.split("\n"))}
                />
              </Field>
            )}
          />

          <Field label="状态条" htmlFor="status" error={errors.intro?.status?.message}>
            <Input id="status" {...register("intro.status")} />
          </Field>

          <div className="grid gap-5 sm:grid-cols-2">
            <Field label="主按钮文字" error={errors.intro?.primaryCta?.label?.message}>
              <Input {...register("intro.primaryCta.label")} />
            </Field>
            <Field label="主按钮链接" error={errors.intro?.primaryCta?.href?.message}>
              <Input placeholder="/projects" {...register("intro.primaryCta.href")} />
            </Field>
            <Field label="次按钮文字" error={errors.intro?.secondaryCta?.label?.message}>
              <Input {...register("intro.secondaryCta.label")} />
            </Field>
            <Field label="次按钮链接" error={errors.intro?.secondaryCta?.href?.message}>
              <Input placeholder="/contact" {...register("intro.secondaryCta.href")} />
            </Field>
          </div>
        </section>

        {/* 交互终端 */}
        <section className="space-y-5">
          <div className="flex items-center justify-between">
            <h2 className="font-mono text-sm font-medium">
              <span className="text-brand">{"// "}</span>交互终端命令
            </h2>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => append({ name: "", desc: "", output: "" })}
              disabled={readOnly || fields.length >= 12}
            >
              <Plus className="size-4" />
              新增命令
            </Button>
          </div>

          {errors.terminal?.commands?.message && (
            <p className="text-destructive text-xs">{errors.terminal.commands.message}</p>
          )}

          <div className="space-y-4">
            {fields.map((f, i) => (
              <div key={f.id} className="border-border/60 space-y-4 rounded-md border p-4">
                <div className="grid gap-4 sm:grid-cols-2">
                  <Field
                    label="命令名"
                    error={errors.terminal?.commands?.[i]?.name?.message}
                    hint="小写字母 / 数字 / 连字符"
                  >
                    <Input placeholder="skills" {...register(`terminal.commands.${i}.name`)} />
                  </Field>
                  <Field
                    label="描述(help 里显示)"
                    error={errors.terminal?.commands?.[i]?.desc?.message}
                  >
                    <Input placeholder="技术栈" {...register(`terminal.commands.${i}.desc`)} />
                  </Field>
                </div>
                <Field
                  label="输出(支持多行)"
                  error={errors.terminal?.commands?.[i]?.output?.message}
                >
                  <Textarea rows={4} {...register(`terminal.commands.${i}.output`)} />
                </Field>
                <div className="flex justify-end">
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => remove(i)}
                    disabled={readOnly}
                    className="text-muted-foreground hover:text-destructive"
                  >
                    <Trash2 className="size-4" />
                    删除
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </section>
      </fieldset>

      <Button
        type="submit"
        disabled={isSubmitting || readOnly}
        title={readOnly ? "仅管理员可操作" : undefined}
      >
        {isSubmitting ? "保存中…" : "保存 Hero"}
      </Button>
    </form>
  );
}
