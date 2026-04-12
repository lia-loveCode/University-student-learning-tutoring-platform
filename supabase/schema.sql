-- Full schema: run in Supabase SQL Editor (one project = one run after reset, or run new blocks on existing DB).
-- All data is stored in Postgres; the app reads/writes via Supabase Data API.
-- ⚠️ Policies below allow anonymous read/write for demo. Add Supabase Auth + tighten RLS before production.

-- ─── courses ───────────────────────────────────────────────────────────────
create table if not exists public.courses (
  id text primary key,
  title text not null,
  category text,
  level text,
  author text,
  learners int default 0,
  rating numeric(3,1),
  summary text
);

alter table public.courses enable row level security;
drop policy if exists "Allow public read courses" on public.courses;
drop policy if exists "courses_anon_all" on public.courses;
create policy "courses_anon_all" on public.courses for all using (true) with check (true);

-- ─── progress ─────────────────────────────────────────────────────────────
create table if not exists public.progress_summary (
  id text primary key,
  week_focus_hours numeric(5,1) not null default 0,
  week_tasks_done int not null default 0,
  week_tasks_total int not null default 0,
  streak_days int not null default 0
);

alter table public.progress_summary enable row level security;
drop policy if exists "Allow public read progress_summary" on public.progress_summary;
drop policy if exists "progress_summary_anon_all" on public.progress_summary;
create policy "progress_summary_anon_all" on public.progress_summary for all using (true) with check (true);

insert into public.progress_summary (id, week_focus_hours, week_tasks_done, week_tasks_total, streak_days)
values ('global', 0, 0, 0, 0)
on conflict (id) do nothing;

create table if not exists public.progress_by_category (
  category text primary key,
  percent int not null check (percent >= 0 and percent <= 100)
);

alter table public.progress_by_category enable row level security;
drop policy if exists "Allow public read progress_by_category" on public.progress_by_category;
drop policy if exists "progress_by_category_anon_all" on public.progress_by_category;
create policy "progress_by_category_anon_all" on public.progress_by_category for all using (true) with check (true);

-- ─── plan ───────────────────────────────────────────────────────────────────
create table if not exists public.plan_once_tasks (
  id text primary key,
  title text not null,
  planned_date text not null,
  due text,
  slot text default '',
  tags jsonb default '[]'::jsonb,
  course_id text,
  link_url text,
  notes text default '',
  subtasks jsonb default '[]'::jsonb,
  done boolean not null default false,
  done_at text,
  created_at timestamptz not null default now()
);

alter table public.plan_once_tasks enable row level security;
drop policy if exists "plan_once_tasks_anon_all" on public.plan_once_tasks;
create policy "plan_once_tasks_anon_all" on public.plan_once_tasks for all using (true) with check (true);

create table if not exists public.plan_recurring_templates (
  id text primary key,
  title text not null,
  recurring_from text not null,
  recurring_to text not null,
  slot text default '',
  tags jsonb default '[]'::jsonb,
  course_id text,
  link_url text,
  notes text default '',
  subtasks jsonb default '[]'::jsonb,
  created_at timestamptz not null default now()
);

alter table public.plan_recurring_templates enable row level security;
drop policy if exists "plan_recurring_templates_anon_all" on public.plan_recurring_templates;
create policy "plan_recurring_templates_anon_all" on public.plan_recurring_templates for all using (true) with check (true);

create table if not exists public.plan_checkins (
  day text primary key,
  checked boolean not null default true
);

alter table public.plan_checkins enable row level security;
drop policy if exists "plan_checkins_anon_all" on public.plan_checkins;
create policy "plan_checkins_anon_all" on public.plan_checkins for all using (true) with check (true);

create table if not exists public.plan_recurring_day_done (
  template_id text not null references public.plan_recurring_templates (id) on delete cascade,
  day_date text not null,
  done boolean not null default true,
  primary key (template_id, day_date)
);

alter table public.plan_recurring_day_done enable row level security;
drop policy if exists "plan_recurring_day_done_anon_all" on public.plan_recurring_day_done;
create policy "plan_recurring_day_done_anon_all" on public.plan_recurring_day_done for all using (true) with check (true);

-- ─── Q&A ───────────────────────────────────────────────────────────────────
create table if not exists public.qa_questions (
  id text primary key,
  title text not null,
  category text not null default '其他',
  author text not null default '访客',
  content text default '',
  views int not null default 0,
  created_at date not null default (now() at time zone 'utc')::date,
  tags jsonb default '[]'::jsonb
);

alter table public.qa_questions enable row level security;
drop policy if exists "qa_questions_anon_all" on public.qa_questions;
create policy "qa_questions_anon_all" on public.qa_questions for all using (true) with check (true);

create table if not exists public.qa_answers (
  id text primary key,
  question_id text not null references public.qa_questions (id) on delete cascade,
  author text not null,
  content text not null,
  created_at date not null default (now() at time zone 'utc')::date
);

alter table public.qa_answers enable row level security;
drop policy if exists "qa_answers_anon_all" on public.qa_answers;
create policy "qa_answers_anon_all" on public.qa_answers for all using (true) with check (true);

-- ─── home (curated lists; fill in Table Editor or app admin later) ──────────
create table if not exists public.home_site_stats (
  stat_key text primary key,
  label text not null,
  value bigint not null default 0,
  trend numeric not null default 0
);

alter table public.home_site_stats enable row level security;
drop policy if exists "home_site_stats_anon_all" on public.home_site_stats;
create policy "home_site_stats_anon_all" on public.home_site_stats for all using (true) with check (true);

create table if not exists public.home_mentors (
  id text primary key,
  name text not null,
  major text not null default '',
  tags jsonb default '[]'::jsonb,
  sessions int not null default 0,
  rating numeric(3,1) not null default 5.0
);

alter table public.home_mentors enable row level security;
drop policy if exists "home_mentors_anon_all" on public.home_mentors;
create policy "home_mentors_anon_all" on public.home_mentors for all using (true) with check (true);

-- ─── profile (single default row; edit in Table Editor or future form) ───────
create table if not exists public.user_profile (
  id text primary key,
  display_name text not null default '同学',
  major text not null default '',
  grade text not null default '',
  bio text not null default '',
  my_courses int not null default 0,
  my_questions int not null default 0,
  my_answers int not null default 0,
  completed_plans int not null default 0
);

alter table public.user_profile enable row level security;
drop policy if exists "user_profile_anon_all" on public.user_profile;
create policy "user_profile_anon_all" on public.user_profile for all using (true) with check (true);

insert into public.user_profile (id, display_name, major, grade, bio, my_courses, my_questions, my_answers, completed_plans)
values ('default', '同学', '', '', '在 Supabase Table Editor 中编辑本行，或后续在站内增加资料表单。', 0, 0, 0, 0)
on conflict (id) do nothing;

-- 首页「平台数据」四块：初始为 0，可在 Table Editor 中改成真实统计
insert into public.home_site_stats (stat_key, label, value, trend) values
  ('qaCount', '累计答疑量', 0, 0),
  ('mentorCount', '优质学长数', 0, 0),
  ('courseCount', '课程资源数', 0, 0),
  ('activeUsers', '活跃用户数', 0, 0)
on conflict (stat_key) do update set
  label = excluded.label;

-- ─── 首页轮播 Banner、快捷入口（可在 Table Editor 维护）────────────────────
create table if not exists public.home_banner_slides (
  id text primary key,
  sort_order int not null default 0,
  kicker text not null default '大学生学习辅导平台',
  title text not null,
  slide_desc text not null,
  cta_label text not null,
  cta_to text not null,
  secondary_cta_label text not null default '制定学习计划',
  secondary_cta_to text not null default '/plan',
  tone text not null default 'toneA',
  image_url text
);

alter table public.home_banner_slides enable row level security;
drop policy if exists "home_banner_slides_anon_all" on public.home_banner_slides;
create policy "home_banner_slides_anon_all" on public.home_banner_slides for all using (true) with check (true);

insert into public.home_banner_slides (id, sort_order, kicker, title, slide_desc, cta_label, cta_to, secondary_cta_label, secondary_cta_to, tone, image_url) values
  ('value', 0, '大学生学习辅导平台', '学长 1v1 答疑 · 课程资源免费共享', '把学习问题当场解决，把学习计划坚持下去。', '去提问', '/qa', '制定学习计划', '/plan', 'toneA', null),
  ('mentor', 1, '大学生学习辅导平台', '热门答疑活动 · 学长招募中', '加入答疑，沉淀你的学习方法，也帮助更多同学。', '查看个人中心', '/profile', '制定学习计划', '/plan', 'toneB', null),
  ('courses', 2, '大学生学习辅导平台', '精品课程推荐 · 学习干货持续更新', '从课程列表开始，建立你的学习路径。', '浏览课程', '/courses', '制定学习计划', '/plan', 'toneC', null)
on conflict (id) do update set
  sort_order = excluded.sort_order,
  kicker = excluded.kicker,
  title = excluded.title,
  slide_desc = excluded.slide_desc,
  cta_label = excluded.cta_label,
  cta_to = excluded.cta_to,
  secondary_cta_label = excluded.secondary_cta_label,
  secondary_cta_to = excluded.secondary_cta_to,
  tone = excluded.tone,
  image_url = excluded.image_url;

create table if not exists public.home_quick_actions (
  id text primary key,
  sort_order int not null default 0,
  title text not null,
  action_desc text not null,
  route text not null,
  icon text not null default '📌'
);

alter table public.home_quick_actions enable row level security;
drop policy if exists "home_quick_actions_anon_all" on public.home_quick_actions;
create policy "home_quick_actions_anon_all" on public.home_quick_actions for all using (true) with check (true);

insert into public.home_quick_actions (id, sort_order, title, action_desc, route, icon) values
  ('qa', 0, '找学长答疑', '快速解决课程难点', '/qa', '🎓'),
  ('courses', 1, '课程资源', '精选资料与学习路径', '/courses', '📚'),
  ('plan', 2, '学习计划', '制定任务与进度跟踪', '/plan', '🗓️'),
  ('community', 3, '提问社区', '公开问答共同成长', '/qa', '❓')
on conflict (id) do update set
  sort_order = excluded.sort_order,
  title = excluded.title,
  action_desc = excluded.action_desc,
  route = excluded.route,
  icon = excluded.icon;
