
"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { forgotPasswordSchema } from "@/lib/validations/auth";
import { createClient } from "@/lib/supabase/client";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";

type ForgotPasswordForm = {
  email: string;
};

export default function ForgotPasswordPage() {
  const supabase = createClient();
  const [sent, setSent] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ForgotPasswordForm>({
    resolver: zodResolver(forgotPasswordSchema),
  });

  async function onSubmit(values: ForgotPasswordForm) {
    await supabase.auth.resetPasswordForEmail(values.email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });

    setSent(true);
  }

  return (
    <div className="mx-auto flex max-w-md flex-col gap-6 px-4 py-16">
      <h1 className="text-2xl font-bold">نسيت كلمة المرور</h1>

      <Card>
        {sent ? (
          <p className="text-sm text-muted">
            إذا كان البريد الإلكتروني مسجلًا لدينا، سيصلك رابط إعادة تعيين كلمة
            المرور.
          </p>
        ) : (
          <form
            onSubmit={handleSubmit(onSubmit)}
            className="flex flex-col gap-4"
          >
            <Input
              label="البريد الإلكتروني"
              type="email"
              {...register("email")}
              error={errors.email?.message}
            />

            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting
                ? "جارٍ الإرسال..."
                : "إرسال رابط إعادة التعيين"}
            </Button>
          </form>
        )}
      </Card>
    </div>
  );
}
