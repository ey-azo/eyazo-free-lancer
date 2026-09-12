"use client";
import { usePathname } from "next/navigation";
import { MessageCircle } from "lucide-react";
import { WHATSAPP_LINK } from "@/lib/constants";

/**
 * زر دعم WhatsApp عائم — يظهر في كل الصفحات العامة و Dashboards العميل
 * والفريلانسر، ولا يظهر داخل Admin Dashboard (القسم 12 من المواصفات).
 * يُستبعد هنا بفحص المسار لأن الزر موضوع في Root Layout المشترك بين كل
 * الصفحات — استبعاده عبر Frontend فقط هنا مقبول لأنه عنصر واجهة وليس
 * قرارًا أمنيًا أو صلاحية وصول لبيانات.
 */
export function WhatsAppButton() {
  const pathname = usePathname();
  if (pathname?.startsWith("/dashboard/admin")) return null;

  return (
    <a
      href={WHATSAPP_LINK}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="تواصل معنا عبر واتساب"
      className="fixed bottom-20 left-4 z-40 flex h-14 w-14 items-center justify-center rounded-full bg-[#25D366] text-white shadow-lg shadow-black/40 transition-transform hover:scale-105 md:bottom-6"
    >
      <MessageCircle className="h-7 w-7" />
    </a>
  );
}
