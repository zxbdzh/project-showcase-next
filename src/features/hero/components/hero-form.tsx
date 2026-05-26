"use client";

import { useRouter } from "next/navigation";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Field } from "@/components/admin/field";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { heroConfigSchema, type HeroConfig } from "../schema";
import { updateHero } from "../actions";

export function HeroForm({ defaultValues }: { defaultValues: HeroConfig }) {
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
        <span className="text-foreground">*星号*</span>{" "}
        包裹文字标为品牌色高亮。交互终端的命令(whoami / skills / projects / about / contact)现由{" "}
        <span className="text-foreground">项目 / 技能 / 个人资料 / 社交链接</span>{" "}
        数据实时生成,无需在此维护。
      </p>

      <fieldset className="space-y-8">
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
      </fieldset>

      <Button type="submit" disabled={isSubmitting}>
        {isSubmitting ? "保存中…" : "保存 Hero"}
      </Button>
    </form>
  );
}
