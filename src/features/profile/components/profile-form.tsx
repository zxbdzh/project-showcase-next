"use client";

import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Field } from "@/components/admin/field";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { profileFormSchema, type ProfileFormValues } from "../schema";
import { updateProfile } from "../actions";

export function ProfileForm({
  defaultValues,
  readOnly,
}: {
  defaultValues: ProfileFormValues;
  readOnly: boolean;
}) {
  const router = useRouter();
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<ProfileFormValues>({
    resolver: zodResolver(profileFormSchema),
    defaultValues,
  });

  const onSubmit = handleSubmit(async (values) => {
    const res = await updateProfile(values);
    if (res.ok) {
      toast.success("已保存");
      router.refresh();
      return;
    }
    if (res.fieldErrors) {
      for (const [key, msgs] of Object.entries(res.fieldErrors)) {
        if (msgs?.[0]) setError(key as keyof ProfileFormValues, { message: msgs[0] });
      }
    }
    toast.error(res.error);
  });

  return (
    <form onSubmit={onSubmit} className="max-w-2xl space-y-5">
      <fieldset disabled={readOnly} className="space-y-5">
        <Field label="一句话简介" htmlFor="headline" error={errors.headline?.message}>
          <Input id="headline" placeholder="如 Java 为主的全栈开发者" {...register("headline")} />
        </Field>

        <Field label="个人简介" htmlFor="bio" error={errors.bio?.message} hint="关于页主体文字">
          <Textarea id="bio" rows={6} {...register("bio")} />
        </Field>

        <div className="grid gap-5 sm:grid-cols-2">
          <Field label="所在地" htmlFor="location" error={errors.location?.message}>
            <Input id="location" {...register("location")} />
          </Field>
          <Field label="个人网站" htmlFor="website" error={errors.website?.message}>
            <Input id="website" placeholder="https://" {...register("website")} />
          </Field>
        </div>

        <Field label="头像地址" htmlFor="avatar" error={errors.avatar?.message} hint="图片 URL">
          <Input id="avatar" placeholder="https://" {...register("avatar")} />
        </Field>
      </fieldset>

      <Button
        type="submit"
        disabled={isSubmitting || readOnly}
        title={readOnly ? "仅管理员可操作" : undefined}
      >
        {isSubmitting ? "保存中…" : "保存资料"}
      </Button>
    </form>
  );
}
