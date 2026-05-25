"use client";

import { useState, useTransition, type ReactElement } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import type { ActionResult } from "@/lib/action-result";

/** 二次确认删除:点击 → 弹窗确认 → 调用 server action → toast + 刷新。 */
export function DeleteButton({
  action,
  itemName,
  trigger,
  redirectTo,
}: {
  action: () => Promise<ActionResult>;
  itemName: string;
  trigger?: ReactElement;
  redirectTo?: string;
}) {
  const [open, setOpen] = useState(false);
  const [pending, start] = useTransition();
  const router = useRouter();

  function handleDelete() {
    start(async () => {
      const res = await action();
      if (res.ok) {
        toast.success("已删除");
        setOpen(false);
        if (redirectTo) router.push(redirectTo);
        else router.refresh();
      } else {
        toast.error(res.error);
      }
    });
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger
        render={
          trigger ?? (
            <Button variant="ghost" size="icon-sm" aria-label={`删除 ${itemName}`}>
              <Trash2 className="text-destructive" />
            </Button>
          )
        }
      />
      <DialogContent>
        <DialogHeader>
          <DialogTitle>确认删除?</DialogTitle>
          <DialogDescription>将永久删除「{itemName}」,此操作不可撤销。</DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <DialogClose render={<Button variant="outline" />}>取消</DialogClose>
          <Button variant="destructive" onClick={handleDelete} disabled={pending}>
            {pending ? "删除中…" : "删除"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
