import { Card } from "@/components/ui/Card";

export const metadata = { title: "إرشادات المجتمع" };

// نص Placeholder فقط وفق القسم 52 — ليس استشارة قانونية احترافية.
export default function LegalPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-12">
      <h1 className="mb-6 text-2xl font-bold">إرشادات المجتمع</h1>
      <Card>
        <p className="text-sm leading-7 text-muted">
          هذا نص Placeholder مؤقت لصفحة "إرشادات المجتمع" الخاصة بمنصة EYAZO، وسيتم
          استبداله بالنص النهائي لاحقًا. هذا المحتوى لا يمثل استشارة قانونية
          احترافية.
        </p>
      </Card>
    </div>
  );
}
