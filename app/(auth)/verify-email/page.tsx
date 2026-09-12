import { Card } from "@/components/ui/Card";

export default function VerifyEmailPage() {
  return (
    <div className="mx-auto flex max-w-md flex-col gap-6 px-4 py-16 text-center">
      <h1 className="text-2xl font-bold">تحقق من بريدك الإلكتروني</h1>
      <Card>
        <p className="text-sm text-muted">
          أرسلنا رابط تفعيل إلى بريدك الإلكتروني. افتح الرابط لتفعيل حسابك ثم سجّل الدخول.
        </p>
      </Card>
    </div>
  );
}
