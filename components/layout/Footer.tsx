import Link from "next/link";

const legalLinks = [
  { href: "/legal/terms", label: "شروط الاستخدام" },
  { href: "/legal/privacy", label: "سياسة الخصوصية" },
  { href: "/legal/community-guidelines", label: "إرشادات المجتمع" },
  { href: "/legal/payment-policy", label: "سياسة الدفع" },
  { href: "/legal/refund-policy", label: "سياسة الاسترجاع" },
  { href: "/legal/disputes-policy", label: "سياسة النزاعات" },
];

export function Footer() {
  return (
    <footer className="border-t border-border bg-background">
      <div className="mx-auto max-w-7xl px-4 py-10">
        <div className="mb-6 flex h-9 w-28 items-center justify-center rounded-md border border-dashed border-border text-xs text-muted">
          شعار EYAZO
        </div>
        <div className="flex flex-wrap gap-x-6 gap-y-2 text-sm text-muted">
          {legalLinks.map((l) => (
            <Link key={l.href} href={l.href} className="hover:text-foreground">
              {l.label}
            </Link>
          ))}
        </div>
        <p className="mt-6 text-xs text-muted">
          © {new Date().getFullYear()} EYAZO. جميع الحقوق محفوظة.
        </p>
      </div>
    </footer>
  );
}
