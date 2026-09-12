// أنواع TypeScript مطابقة لبنية قاعدة البيانات (database/schema.sql).
// عند تغيير السكيمة يدويًا، حدّث هذا الملف يدويًا أو ولّده عبر:
//   supabase gen types typescript --project-id <id> > types/database.ts

export type UserRole = "CLIENT" | "FREELANCER" | "ADMIN";
export type VerificationStatus = "UNVERIFIED" | "PENDING" | "VERIFIED" | "REJECTED";
export type ServiceStatus = "DRAFT" | "PENDING_REVIEW" | "PUBLISHED" | "PAUSED" | "REJECTED";
export type ProjectStatus = "DRAFT" | "OPEN" | "IN_PROGRESS" | "COMPLETED" | "CANCELLED" | "CLOSED";
export type ProposalStatus = "PENDING" | "ACCEPTED" | "REJECTED" | "WITHDRAWN";
export type OrderStatus =
  | "PENDING_PAYMENT" | "PAID" | "IN_PROGRESS" | "DELIVERED" | "REVISION_REQUESTED"
  | "COMPLETED" | "CANCELLED" | "DISPUTED" | "REFUNDED";
export type ReportStatus = "OPEN" | "UNDER_REVIEW" | "RESOLVED" | "DISMISSED";
export type DisputeStatus = "OPEN" | "UNDER_REVIEW" | "WAITING_FOR_USER" | "RESOLVED" | "REJECTED";
export type PaymentStatus = "PENDING_MANUAL_CONFIRMATION" | "APPROVED" | "REJECTED";
export type PayoutStatus = "PENDING" | "PAID";

export interface Profile {
  id: string;
  full_name: string;
  username: string;
  role: UserRole;
  avatar_url: string | null;
  bio: string | null;
  country: string | null;
  languages: string[];
  is_banned: boolean;
  created_at: string;
  updated_at: string;
}

export interface FreelancerProfile {
  profile_id: string;
  job_title: string | null;
  experience_level: string | null;
  starting_price: number | null;
  skills: string[];
  verification_status: VerificationStatus;
  completed_orders_count: number;
  response_rate: number | null;
  on_time_delivery_rate: number | null;
  rating_average: number;
  rating_count: number;
  created_at: string;
  updated_at: string;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  parent_id: string | null;
  is_disabled: boolean;
}

export interface Service {
  id: string;
  freelancer_id: string;
  category_id: string;
  title: string;
  slug: string;
  description: string;
  price: number;
  delivery_days: number;
  revisions: number;
  tags: string[];
  status: ServiceStatus;
  created_at: string;
  updated_at: string;
}

export interface Project {
  id: string;
  client_id: string;
  category_id: string;
  title: string;
  description: string;
  required_skills: string[];
  budget_min: number | null;
  budget_max: number | null;
  deadline: string | null;
  status: ProjectStatus;
  created_at: string;
  updated_at: string;
}

export interface Proposal {
  id: string;
  project_id: string;
  freelancer_id: string;
  message: string;
  price: number;
  delivery_days: number;
  status: ProposalStatus;
  created_at: string;
}

export interface Order {
  id: string;
  client_id: string;
  freelancer_id: string;
  service_id: string | null;
  project_id: string | null;
  proposal_id: string | null;
  price: number;
  platform_fee: number;
  freelancer_earnings: number;
  revisions_remaining: number;
  status: OrderStatus;
  created_at: string;
  updated_at: string;
}

export interface PlatformSettings {
  id: true;
  platform_name: string;
  logo_url: string | null;
  commission_percentage: number;
  minimum_order_amount: number;
  maximum_file_size_mb: number;
  maintenance_mode: boolean;
  manual_payment_number: string;
  whatsapp_support_number: string;
}

// Placeholder generic type expected by @supabase/ssr generics.
// يمكن استبداله لاحقًا بالنوع المولّد تلقائيًا من Supabase CLI.
export type Database = any;
