"use client";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { loginSchema, type LoginInput } from "@/lib/validations/auth";
import { createClient } from "@/lib/supabase/client";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();
  const supabase = createClient();
  const [serverError, setServerError] = useState<string | null>(null);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginInput>({ resolver: zodResolver(loginSchema) });

  async function onSubmit(values: LoginInput) {
    setServerError(null);
    const { error } = await supabase.auth.signInWithPassword(values);
    if (error) {
      setServerError("البريد الإلكتروني أو كلمة المرور غير صحيحة");
      return;
    }
    router.push("/");
    router.refresh();
  }

  return (
    <div className="mx-auto flex max-w-md flex-col gap-6 px-4 py-16">
      <h1 className="text-2xl font-bold">تسجيل الدخول</h1>
      <Card>
        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
          <Input label="البريد الإلكتروني" type="email" {...register("email")} error={errors.email?.message} />
          <Input label="كلمة المرور" type="password" {...register("password")} error={errors.password?.message} />
          {serverError && <p className="text-sm text-red-400">{serverError}</p>}
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? "جارٍ الدخول..." : "تسجيل الدخول"}
          </Button>
          <Link href="/forgot-password" className="text-center text-sm text-muted hover:text-foreground">
            نسيت كلمة المرور؟
          </Link>
        </form>
      </Card>
    </div>
  );
}
