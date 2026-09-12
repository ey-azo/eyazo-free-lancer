import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import type { Metadata } from "next";

interface Props { params: { slug: string } }

async function getService(slug: string) {
  const supabase = createClient();
  const { data } = await supabase
    .from("services")
    .select("*, profiles:freelancer_id(full_name, username), service_images(*)")
    .eq("slug", slug)
    .single();
  return data;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const service = await getService(params.slug);
  if (!service) return {};
  return { title: service.title, description: service.description?.slice(0, 150) };
}

export default async function ServiceDetailPage({ params }: Props) {
  const service = await getService(params.slug);
  if (!service || service.status !== "PUBLISHED") notFound();

  return (
    <div className="mx-auto grid max-w-5xl grid-cols-1 gap-8 px-4 py-10 lg:grid-cols-3">
      <div className="lg:col-span-2">
        <h1 className="text-2xl font-bold">{service.title}</h1>
        <p className="mt-2 text-sm text-muted">
          بواسطة{" "}
          <a href={`/freelancer/${service.profiles?.username}`} className="text-foreground hover:underline">
            {service.profiles?.full_name}
          </a>
        </p>
        <p className="mt-6 whitespace-pre-line text-sm leading-7">{service.description}</p>
        {service.tags?.length > 0 && (
          <div className="mt-6 flex flex-wrap gap-2 text-xs text-muted">
            {service.tags.map((t: string) => <span key={t} className="rounded-full border border-border px-2 py-1">{t}</span>)}
          </div>
        )}
      </div>

      <Card className="h-fit">
        <p className="text-2xl font-bold">{service.price} ج.م</p>
        <p className="mt-2 text-sm text-muted">التسليم خلال {service.delivery_days} يوم</p>
        <p className="text-sm text-muted">{service.revisions} تعديلات مجانية</p>
        <Button className="mt-4 w-full">اطلب هذه الخدمة</Button>
      </Card>
    </div>
  );
}
