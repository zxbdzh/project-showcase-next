import { Suspense } from "react";
import { getEditableProfile } from "@/features/profile/admin-queries";
import { isStorageConfigured } from "@/lib/storage";
import { ProfileForm } from "@/features/profile/components/profile-form";
import type { ProfileFormValues } from "@/features/profile/schema";

export default function AdminProfilePage() {
  return (
    <div>
      <h1 className="text-2xl font-semibold tracking-tight">资料</h1>
      <p className="text-muted-foreground mt-1 mb-6 text-sm">
        编辑关于页与 AI 分身使用的个人资料。
      </p>
      <Suspense fallback={<p className="text-muted-foreground text-sm">加载中…</p>}>
        <ProfileEditor />
      </Suspense>
    </div>
  );
}

async function ProfileEditor() {
  const profile = await getEditableProfile();
  const uploadEnabled = isStorageConfigured();

  const defaultValues: ProfileFormValues = {
    headline: profile?.headline ?? "",
    bio: profile?.bio ?? "",
    location: profile?.location ?? "",
    website: profile?.website ?? "",
    avatar: profile?.avatar ?? "",
  };

  return <ProfileForm defaultValues={defaultValues} uploadEnabled={uploadEnabled} />;
}
