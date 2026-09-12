-- ============================================================================
-- EYAZO — ROW LEVEL SECURITY POLICIES
-- كل جدول فيه بيانات مستخدمين يجب أن يكون RLS مفعّل عليه، ولا يعتمد أي شيء
-- على إخفاء العناصر في الواجهة فقط.
-- ============================================================================

-- ---------------------------------------------------------------------------
-- Helper: هل المستخدم الحالي Admin؟
-- ---------------------------------------------------------------------------
create or replace function is_admin()
returns boolean as $$
  select exists (
    select 1 from profiles where id = auth.uid() and role = 'ADMIN'
  );
$$ language sql stable security definer;

-- ---------------------------------------------------------------------------
-- PROFILES
-- ---------------------------------------------------------------------------
alter table profiles enable row level security;

create policy "profiles_select_public" on profiles
  for select using (true); -- الملف الشخصي عام (القسم 13) لكن لا يعرض بيانات حساسة (يُضبط ذلك في الـ API/select columns)

create policy "profiles_update_own" on profiles
  for update using (auth.uid() = id) with check (auth.uid() = id);

create policy "profiles_admin_all" on profiles
  for all using (is_admin()) with check (is_admin());

-- ---------------------------------------------------------------------------
-- FREELANCER_PROFILES
-- ---------------------------------------------------------------------------
alter table freelancer_profiles enable row level security;

create policy "freelancer_profiles_select_public" on freelancer_profiles
  for select using (true);

create policy "freelancer_profiles_update_own" on freelancer_profiles
  for update using (auth.uid() = profile_id) with check (auth.uid() = profile_id);

create policy "freelancer_profiles_insert_own" on freelancer_profiles
  for insert with check (auth.uid() = profile_id);

create policy "freelancer_profiles_admin_all" on freelancer_profiles
  for all using (is_admin()) with check (is_admin());

-- ---------------------------------------------------------------------------
-- PORTFOLIO ITEMS
-- ---------------------------------------------------------------------------
alter table portfolio_items enable row level security;

create policy "portfolio_select_public" on portfolio_items for select using (true);
create policy "portfolio_owner_manage" on portfolio_items
  for all using (auth.uid() = freelancer_id) with check (auth.uid() = freelancer_id);

-- ---------------------------------------------------------------------------
-- CATEGORIES — عامة للقراءة، الإدارة فقط للـ Admin
-- ---------------------------------------------------------------------------
alter table categories enable row level security;

create policy "categories_select_public" on categories for select using (true);
create policy "categories_admin_write" on categories
  for all using (is_admin()) with check (is_admin());

-- ---------------------------------------------------------------------------
-- SERVICES
-- ---------------------------------------------------------------------------
alter table services enable row level security;

create policy "services_select_published_or_owner" on services
  for select using (
    status = 'PUBLISHED' or auth.uid() = freelancer_id or is_admin()
  );

create policy "services_owner_write" on services
  for insert with check (auth.uid() = freelancer_id);

create policy "services_owner_update" on services
  for update using (auth.uid() = freelancer_id or is_admin())
  with check (auth.uid() = freelancer_id or is_admin());

create policy "services_owner_delete" on services
  for delete using (auth.uid() = freelancer_id or is_admin());

alter table service_images enable row level security;
create policy "service_images_select" on service_images for select using (
  exists (select 1 from services s where s.id = service_id and (s.status = 'PUBLISHED' or s.freelancer_id = auth.uid() or is_admin()))
);
create policy "service_images_owner_manage" on service_images for all using (
  exists (select 1 from services s where s.id = service_id and s.freelancer_id = auth.uid())
) with check (
  exists (select 1 from services s where s.id = service_id and s.freelancer_id = auth.uid())
);

-- ---------------------------------------------------------------------------
-- PROJECTS
-- ---------------------------------------------------------------------------
alter table projects enable row level security;

create policy "projects_select_open_or_involved" on projects
  for select using (
    status in ('OPEN','IN_PROGRESS','COMPLETED') or auth.uid() = client_id or is_admin()
    or exists (select 1 from proposals p where p.project_id = projects.id and p.freelancer_id = auth.uid())
  );

create policy "projects_owner_write" on projects
  for insert with check (auth.uid() = client_id);

create policy "projects_owner_update" on projects
  for update using (auth.uid() = client_id or is_admin())
  with check (auth.uid() = client_id or is_admin());

alter table project_attachments enable row level security;
create policy "project_attachments_involved" on project_attachments for select using (
  exists (
    select 1 from projects pr where pr.id = project_id and (
      pr.client_id = auth.uid() or is_admin() or pr.status in ('OPEN','IN_PROGRESS','COMPLETED')
      or exists (select 1 from proposals p where p.project_id = pr.id and p.freelancer_id = auth.uid())
    )
  )
);
create policy "project_attachments_owner_manage" on project_attachments for all using (
  exists (select 1 from projects pr where pr.id = project_id and pr.client_id = auth.uid())
) with check (
  exists (select 1 from projects pr where pr.id = project_id and pr.client_id = auth.uid())
);

-- ---------------------------------------------------------------------------
-- PROPOSALS — لا يراها إلا صاحب المشروع ومقدّم العرض نفسه
-- ---------------------------------------------------------------------------
alter table proposals enable row level security;

create policy "proposals_select_involved" on proposals
  for select using (
    auth.uid() = freelancer_id
    or is_admin()
    or exists (select 1 from projects pr where pr.id = project_id and pr.client_id = auth.uid())
  );

create policy "proposals_freelancer_insert" on proposals
  for insert with check (auth.uid() = freelancer_id);

create policy "proposals_update_involved" on proposals
  for update using (
    auth.uid() = freelancer_id
    or exists (select 1 from projects pr where pr.id = project_id and pr.client_id = auth.uid())
    or is_admin()
  );

-- ---------------------------------------------------------------------------
-- ORDERS — طرفا الطلب فقط + Admin. الإنشاء والتحديث الفعلي عبر Server (service role)
-- ---------------------------------------------------------------------------
alter table orders enable row level security;

create policy "orders_select_involved" on orders
  for select using (auth.uid() = client_id or auth.uid() = freelancer_id or is_admin());

-- لا توجد سياسة insert/update عامة للمستخدمين: الإنشاء وتغيير الحالة يتم فقط
-- عبر Server Actions/Route Handlers باستخدام Service Role (يتجاوز RLS بشكل متعمد
-- وتحت تحقق صارم من الصلاحيات في الكود، وفقًا للقسم 19 و53).
create policy "orders_admin_manage" on orders for all using (is_admin()) with check (is_admin());

alter table order_events enable row level security;
create policy "order_events_select_involved" on order_events for select using (
  exists (select 1 from orders o where o.id = order_id and (o.client_id = auth.uid() or o.freelancer_id = auth.uid() or is_admin()))
);

alter table deliveries enable row level security;
create policy "deliveries_select_involved" on deliveries for select using (
  exists (select 1 from orders o where o.id = order_id and (o.client_id = auth.uid() or o.freelancer_id = auth.uid() or is_admin()))
);
create policy "deliveries_freelancer_insert" on deliveries for insert with check (
  exists (select 1 from orders o where o.id = order_id and o.freelancer_id = auth.uid())
);

alter table delivery_files enable row level security;
create policy "delivery_files_select_involved" on delivery_files for select using (
  exists (
    select 1 from deliveries d join orders o on o.id = d.order_id
    where d.id = delivery_id and (o.client_id = auth.uid() or o.freelancer_id = auth.uid() or is_admin())
  )
);

-- ---------------------------------------------------------------------------
-- FAVORITES — خاصة بصاحبها فقط
-- ---------------------------------------------------------------------------
alter table favorites enable row level security;
create policy "favorites_owner_all" on favorites
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- ---------------------------------------------------------------------------
-- CONVERSATIONS & MESSAGES — لا يرى المستخدم محادثة ليس طرفًا فيها (القسم 24)
-- ---------------------------------------------------------------------------
alter table conversations enable row level security;
create policy "conversations_participants_only" on conversations
  for select using (auth.uid() = participant_one or auth.uid() = participant_two or is_admin());

create policy "conversations_participants_insert" on conversations
  for insert with check (auth.uid() = participant_one or auth.uid() = participant_two);

alter table messages enable row level security;
create policy "messages_participants_only" on messages
  for select using (
    exists (
      select 1 from conversations c where c.id = conversation_id
      and (c.participant_one = auth.uid() or c.participant_two = auth.uid())
    ) or is_admin()
  );

create policy "messages_participants_insert" on messages
  for insert with check (
    auth.uid() = sender_id and exists (
      select 1 from conversations c where c.id = conversation_id
      and (c.participant_one = auth.uid() or c.participant_two = auth.uid())
    )
  );

alter table message_attachments enable row level security;
create policy "message_attachments_participants_only" on message_attachments for select using (
  exists (
    select 1 from messages m join conversations c on c.id = m.conversation_id
    where m.id = message_id and (c.participant_one = auth.uid() or c.participant_two = auth.uid() or is_admin())
  )
);

-- ---------------------------------------------------------------------------
-- NOTIFICATIONS — خاصة بصاحبها فقط
-- ---------------------------------------------------------------------------
alter table notifications enable row level security;
create policy "notifications_owner_select" on notifications for select using (auth.uid() = user_id);
create policy "notifications_owner_update" on notifications for update using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- ---------------------------------------------------------------------------
-- REVIEWS — عامة للقراءة، الكتابة فقط لطرف الطلب المكتمل (يُتحقق أيضًا في الكود)
-- ---------------------------------------------------------------------------
alter table reviews enable row level security;
create policy "reviews_select_public" on reviews for select using (is_hidden = false or is_admin());
create policy "reviews_insert_order_party" on reviews
  for insert with check (
    auth.uid() = reviewer_id and exists (
      select 1 from orders o where o.id = order_id and o.status = 'COMPLETED'
      and (o.client_id = auth.uid() or o.freelancer_id = auth.uid())
    )
  );
create policy "reviews_admin_manage" on reviews for all using (is_admin()) with check (is_admin());

-- ---------------------------------------------------------------------------
-- REPORTS — صاحب البلاغ و Admin فقط
-- ---------------------------------------------------------------------------
alter table reports enable row level security;
create policy "reports_owner_select" on reports for select using (auth.uid() = reporter_id or is_admin());
create policy "reports_owner_insert" on reports for insert with check (auth.uid() = reporter_id);
create policy "reports_admin_update" on reports for update using (is_admin()) with check (is_admin());

-- ---------------------------------------------------------------------------
-- DISPUTES — طرفا الطلب و Admin فقط
-- ---------------------------------------------------------------------------
alter table disputes enable row level security;
create policy "disputes_involved_select" on disputes for select using (
  auth.uid() = opened_by or is_admin() or
  exists (select 1 from orders o where o.id = order_id and (o.client_id = auth.uid() or o.freelancer_id = auth.uid()))
);
create policy "disputes_involved_insert" on disputes for insert with check (
  auth.uid() = opened_by and exists (
    select 1 from orders o where o.id = order_id and (o.client_id = auth.uid() or o.freelancer_id = auth.uid())
  )
);
create policy "disputes_admin_update" on disputes for update using (is_admin()) with check (is_admin());

-- ---------------------------------------------------------------------------
-- PAYMENTS / TRANSACTIONS / REFUNDS / PAYOUTS / PLATFORM_FEES — مالية حساسة:
-- طرفا الطلب (قراءة فقط) و Admin (كل شيء). لا كتابة مباشرة من المستخدم إلا
-- إدخال Transaction Reference ورفع الإثبات عبر مسار Server مخصص.
-- ---------------------------------------------------------------------------
alter table payments enable row level security;
create policy "payments_involved_select" on payments for select using (
  is_admin() or exists (select 1 from orders o where o.id = order_id and (o.client_id = auth.uid() or o.freelancer_id = auth.uid()))
);
create policy "payments_admin_manage" on payments for all using (is_admin()) with check (is_admin());

alter table transactions enable row level security;
create policy "transactions_involved_select" on transactions for select using (
  is_admin() or exists (select 1 from orders o where o.id = order_id and (o.client_id = auth.uid() or o.freelancer_id = auth.uid()))
);

alter table refunds enable row level security;
create policy "refunds_involved_select" on refunds for select using (
  is_admin() or exists (select 1 from orders o where o.id = order_id and (o.client_id = auth.uid() or o.freelancer_id = auth.uid()))
);
create policy "refunds_admin_manage" on refunds for all using (is_admin()) with check (is_admin());

alter table payouts enable row level security;
create policy "payouts_involved_select" on payouts for select using (
  is_admin() or auth.uid() = freelancer_id
);
create policy "payouts_admin_manage" on payouts for all using (is_admin()) with check (is_admin());

alter table platform_fees enable row level security;
create policy "platform_fees_involved_select" on platform_fees for select using (
  is_admin() or exists (select 1 from orders o where o.id = order_id and (o.client_id = auth.uid() or o.freelancer_id = auth.uid()))
);

-- ---------------------------------------------------------------------------
-- VERIFICATION REQUESTS
-- ---------------------------------------------------------------------------
alter table verification_requests enable row level security;
create policy "verification_owner_select" on verification_requests for select using (auth.uid() = freelancer_id or is_admin());
create policy "verification_owner_insert" on verification_requests for insert with check (auth.uid() = freelancer_id);
create policy "verification_admin_update" on verification_requests for update using (is_admin()) with check (is_admin());

-- ---------------------------------------------------------------------------
-- AUDIT LOGS — Admin فقط
-- ---------------------------------------------------------------------------
alter table audit_logs enable row level security;
create policy "audit_logs_admin_only" on audit_logs for all using (is_admin()) with check (is_admin());

-- ---------------------------------------------------------------------------
-- PLATFORM SETTINGS — قراءة عامة (تُستخدم في الواجهة)، تعديل Admin فقط
-- ---------------------------------------------------------------------------
alter table platform_settings enable row level security;
create policy "platform_settings_select_public" on platform_settings for select using (true);
create policy "platform_settings_admin_update" on platform_settings for update using (is_admin()) with check (is_admin());
