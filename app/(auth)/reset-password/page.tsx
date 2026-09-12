
"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { resetPasswordSchema } from "@/lib/validations/auth";
import { createClient } from "@/lib/supabase/client";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { useRouter } from "next/navigation";

type ResetPasswordForm = {
  password: string;
  confirm_password: string;
};

export default function ResetPasswordPage() {
  const supabase = createClient();
  const router = useRouter();
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ResetPasswordForm>({
    resolver: zodResolver(resetPasswordSchema),
  });

  async function onSubmit(values: ResetPasswordForm) {
    setServerError(null);

    const { error } = await supabase.auth.updateUser({
      password: values.password,
    });

    if (error) {
      setServerError(error.message);
      return;
    }

    router.push("/login");
  }

  return (
    <div className="mx-auto flex max-w-md flex-col gap-6 px-4 py-16">
      <h1 className="text-2xl font-bold">إعادة تعيين كلمة المرور</h1>

      <Card>
        <form
          onSubmit={handleSubmit(onSubmit)}
          className="flex flex-col gap-4"
        >
          <Input
            label="كلمة المرور الجديدة"
            type="password"
            {...register("password")}
            error={errors.password?.message}
          />

          <Input
            label="تأكيد كلمة المرور"
            type="password"
            {...register("confirm_password")}
            error={errors.confirm_password?.message}
          />

          {serverError && (
            <p className="text-sm text-red-400">{serverError}</p>
          )}

          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? "جارٍ الحفظ..." : "حفظ كلمة المرور"}
          </Button>
        </fo

