// عميل Supabase للاستخدام داخل Server Components / Server Actions / Route Handlers
// يستخدم Anon key + كوكيز الجلسة (RLS تبقى فعّالة).
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import type { Database } from "@/types/database";

export function createClient() {
  const cookieStore = cookies();
  return createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch {
            // يُتجاهل عند الاستدعاء من Server Component بدون إمكانية الكتابة
          }
        },
      },
    }
  );
}
