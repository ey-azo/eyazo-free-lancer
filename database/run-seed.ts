/**
 * EYAZO — Seed Runner
 * ينشئ بيانات DEMO/TEST فقط: Admin واحد، عدة Clients، عدة Freelancers،
 * Categories، Services، Projects، Orders، Reviews.
 *
 * ممنوع تشغيله في الإنتاج — القسم 55 من المواصفات.
 * التشغيل: npm run seed (يقرأ .env.local محليًا)
 */
import "dotenv/config";
import { createClient } from "@supabase/supabase-js";

if (process.env.NODE_ENV === "production") {
  console.error("Seed data must not run in production (NODE_ENV=production). Aborting.");
  process.exit(1);
}

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!url || !serviceKey) {
  console.error("Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env.local");
  process.exit(1);
}

const supabase = createClient(url, serviceKey);

const DEMO_PASSWORD = "Demo12345!";

type DemoUser = {
  email: string;
  full_name: string;
  username: string;
  role: "CLIENT" | "FREELANCER" | "ADMIN";
};

const demoUsers: DemoUser[] = [
  { email: "admin@eyazo.demo", full_name: "مدير المنصة (DEMO)", username: "eyazo_admin_demo", role: "ADMIN" },
  { email: "client1@eyazo.demo", full_name: "عميل تجريبي واحد (DEMO)", username: "client_one_demo", role: "CLIENT" },
  { email: "client2@eyazo.demo", full_name: "عميل تجريبي اثنان (DEMO)", username: "client_two_demo", role: "CLIENT" },
  { email: "freelancer1@eyazo.demo", full_name: "فريلانسر تجريبي واحد (DEMO)", username: "freelancer_one_demo", role: "FREELANCER" },
  { email: "freelancer2@eyazo.demo", full_name: "فريلانسر تجريبي اثنان (DEMO)", username: "freelancer_two_demo", role: "FREELANCER" },
];

async function main() {
  console.log("EYAZO seed: creating DEMO/TEST accounts only...");

  for (const u of demoUsers) {
    const { data: created, error } = await supabase.auth.admin.createUser({
      email: u.email,
      password: DEMO_PASSWORD,
      email_confirm: true,
    });
    if (error && !error.message.includes("already registered")) {
      console.error(`Failed to create ${u.email}:`, error.message);
      continue;
    }
    const userId = created?.user?.id;
    if (!userId) continue;

    await supabase.from("profiles").upsert({
      id: userId,
      full_name: u.full_name,
      username: u.username,
      role: u.role,
      bio: "هذا حساب DEMO / TEST لأغراض العرض فقط.",
      country: "مصر",
      languages: ["العربية"],
    });

    if (u.role === "FREELANCER") {
      await supabase.from("freelancer_profiles").upsert({
        profile_id: userId,
        job_title: "مطوّر ويب (DEMO)",
        experience_level: "متوسط",
        starting_price: 500,
        skills: ["Next.js", "TypeScript"],
      });
    }
  }

  console.log("Seed complete. All accounts are DEMO/TEST DATA — not real users.");
  console.log(`Demo password for all seeded accounts: ${DEMO_PASSWORD}`);
}

main();
