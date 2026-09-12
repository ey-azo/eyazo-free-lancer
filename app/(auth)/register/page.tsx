"use client";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { registerSchema, type RegisterInput } from "@/lib/validations/auth";
import { createClient } from "@/lib/supabase/client";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { useRouter } from "next/navigation";

export default function RegisterPage() {
  const router = useRouter();
  const supabase = createClient();
  const [serverError, setServerError] = useState<string | null>(null);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<RegisterInput>({ resolver: zodResolver(registerSchema) });

  async function onSubmit(values: RegisterInput) {
    setServerError(null);

    // تحقق من توفر اسم المستخدم قبل إنشاء الحساب
    const { data: existing } = await supabase
      .from("profiles")
      .select("id")
      .eq("username", values.username)
      .maybeSingle();
    if (existing) {
      setServerError("اسم المستخدم مستخدم بالفعل");
      return;
    }

    const { data, error } = await supabase.auth.signUp({
      email: values.email,
      password: values.password,
      options: {
        emailRedirectTo: `${window.location.origin}/verify-email`,
      },
    });

    if (error) {
      setServerError(error.message);
      return;
    }

    if (data.user) {
      const { error: profileError } = await supabase.from("profiles").insert({
        id: data.user.id,
        full_name: values.full_name,
        username: values.username,
        role: values.account_type,
      });
      if (profileError) {
        setServerError(profileError.message);
        return;
      }
      if (values.account_type === "FREELANCER") {
        await supabase.from("freelancer_profiles").insert({ profile_id: data.user.id });
      }
    }

    router.push("/verify-email");
  }

  return (
    <div className="mx-auto flex max-w-md flex-col gap-6 px-4 py-16">
      <h1 className="text-2xl font-bold">إنشاء حساب في EYAZO</h1>
      <Card>
        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
          <Input label="الاسم الكامل" {...register("full_name")} error={errors.full_name?.message} />
          <Input label="اسم المستخدم" {...register("username")} error={errors.username?.message} />
          <Input label="البريد الإلكتروني" type="email" {...register("email")} error={errors.email?.message} />
          <Input label="كلمة المرور" type="password" {...register("password")} error={errors.password?.message} />

          <div className="flex flex-col gap-1.5">
            <label className="text-sm">نوع الحساب</label>
            <select
              {...register("account_type")}
              className="rounded-lg border border-border bg-background px-3.5 py-2.5 text-sm"
              defaultValue=""
            >
              <option value="" disabled>اختر نوع الحساب</option>
              <option value="CLIENT">عميل</option>
              <option value="FREELANCER">فريلانسر</option>
            </select>
            {errors.account_type && <p className="text-xs text-red-400">{errors.account_type.message}</p>}
          </div>

          {serverError && <p className="text-sm text-red-400">{serverError}</p>}

          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? "جارٍ الإنشاء..." : "إنشاء حساب"}
          </Button>
        </form>
      </Card>
    </div>
  );
}
