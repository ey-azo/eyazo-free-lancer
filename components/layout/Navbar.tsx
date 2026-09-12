import Link from "next/link";
import { getCurrentUserWithRole } from "@/lib/rbac";
import { Button } from "@/components/ui/Button";

export async function Navbar() {
  const user = await getCurrentUserWithRole();

  const dashboardHref =
    user?.role === "ADMIN"
      ? "/dashboard/admin"
      : user?.role === "FREELANCER"
      ? "/dashboard/freelancer"
      : "/dashboard/client";

  return (
    <header className="sticky top-0 z-30 border-b border-border bg-background/95 backdrop-blur">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3">
        {/* مكان اللوجو — سيتم استبداله باللوجو الحقيقي لاحقًا */}
        <Link href="/" className="flex h-9 w-28 items-center justify-center rounded-md border border-dashed border-border text-xs text-muted">
          شعار EYAZO
        </Link>

        <nav className="hidden items-center gap-6 text-sm text-muted md:flex">
          <Link href="/services" className="hover:text-foreground">استكشف الخدمات</Link>
          <Link href="/projects" className="hover:text-foreground">استكشف المشاريع</Link>
        </nav>

        <div className="flex items-center gap-2">
          {user ? (
            <Link href={dashboardHref}>
              <Button size="sm" variant="secondary">لوحتي</Button>
            </Link>
          ) : (
            <>
              <Link href="/login">
                <Button size="sm" variant="ghost">تسجيل الدخول</Button>
              </Link>
              <Link href="/register">
                <Button size="sm">إنشاء حساب</Button>
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
