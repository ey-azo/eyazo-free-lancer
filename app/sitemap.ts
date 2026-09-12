import type { MetadataRoute } from "next";
import { createClient } from "@/lib/supabase/server";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = process.env.NEXT_PUBLIC_SITE_URL ?? "https://example.com";
  const supabase = createClient();

  const { data: services } = await supabase.from("services").select("slug, updated_at").eq("status", "PUBLISHED");
  const { data: freelancers } = await supabase.from("profiles").select("username, updated_at").eq("role", "FREELANCER");

  return [
    { url: `${base}/`, changeFrequency: "daily", priority: 1 },
    { url: `${base}/services`, changeFrequency: "daily", priority: 0.9 },
    ...(services ?? []).map((s) => ({
      url: `${base}/services/${s.slug}`,
      lastModified: s.updated_at,
      changeFrequency: "weekly" as const,
    })),
    ...(freelancers ?? []).map((f) => ({
      url: `${base}/freelancer/${f.username}`,
      lastModified: f.updated_at,
      changeFrequency: "weekly" as const,
    })),
  ];
}
