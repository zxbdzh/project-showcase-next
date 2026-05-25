"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { submitContactForm, type ContactFormState } from "@/features/contact/actions";
import { toast } from "sonner";
import { useEffect } from "react";

const initialState: ContactFormState = { success: false, message: "" };

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" className="w-full rounded-md" size="lg" disabled={pending}>
      {pending ? "发送中..." : "发送留言"}
    </Button>
  );
}

export function ContactForm() {
  const [state, formAction] = useActionState(submitContactForm, initialState);

  useEffect(() => {
    if (state.message) {
      if (state.success) {
        toast.success(state.message);
      } else {
        toast.error(state.message);
      }
    }
  }, [state]);

  return (
    <form action={formAction} className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="name">姓名</Label>
        <Input id="name" name="name" placeholder="你的名字" required className="rounded-sm" />
      </div>
      <div className="space-y-2">
        <Label htmlFor="email">邮箱</Label>
        <Input
          id="email"
          name="email"
          type="email"
          placeholder="you@example.com"
          required
          className="rounded-sm"
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="message">留言</Label>
        <Textarea
          id="message"
          name="message"
          placeholder="说点什么..."
          rows={5}
          required
          className="rounded-sm"
        />
      </div>
      <SubmitButton />
    </form>
  );
}
