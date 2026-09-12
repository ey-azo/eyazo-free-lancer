// عميل Supabase بصلاحية Service Role — يعمل فقط داخل كود السيرفر
// (Server Actions / Route Handlers). ممنوع استيراد هذا الملف في أي كود
// يعمل داخل المتصفح (لا "use client" في أي مكان يستدعيه).
import "server-only";
import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/types/database";

export function createAdminClient() {
  return createSupabaseClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  );
}
