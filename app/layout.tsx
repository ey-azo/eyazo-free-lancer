import type { Metadata } from "next";
import { Cairo } from "next/font/google";
import "./globals.css";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { WhatsAppButton } from "@/components/shared/WhatsAppButton";

const cairo = Cairo({ subsets: ["arabic", "latin"], variable: "--font-cairo" });

export const metadata: Metadata = {
  title: {
    default: "EYAZO — أنجز أعمالك مع مستقلين تثق بهم",
    template: "%s | EYAZO",
  },
  description: "EYAZO سوق عمل حر عربي بالكامل يربط العملاء بالفريلانسرز.",
};

/**
 * Root Layout — يحتوي على Navbar وFooter وزر دعم WhatsApp العائم (يظهر في كل
 * الصفحات العامة و Dashboards العميل والفريلانسر). داخل app/dashboard/admin
 * يوجد Layout خاص لا يستدعي هذا الزر — انظر القسم 12 من المواصفات.
 */
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ar" dir="rtl" className={cairo.variable}>
      <body className="min-h-screen font-sans antialiased">
        <Navbar />
        <main className="min-h-[60vh]">{children}</main>
        <Footer />
        <WhatsAppButton />
      </body>
    </html>
  );
}
