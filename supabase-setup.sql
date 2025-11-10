-- Enable extensions
create extension if not exists "uuid-ossp";
create extension if not exists pgcrypto; -- for gen_random_uuid()

-- Projects
create table public.projects (
  id uuid primary key default gen_random_uuid(),
  name text not null check (length(name) > 0),
  owner_id uuid not null references auth.users(id) on delete cascade,
  created_at timestamptz not null default now()
);

-- Project members (RBAC)
create table public.project_members (
  project_id uuid not null references public.projects(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  role text not null check (role in ('owner','editor','viewer')),
  added_at timestamptz not null default now(),
  primary key (project_id, user_id)
);

-- Notes
create table public.notes (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects(id) on delete cascade,
  author_id uuid not null references auth.users(id) on delete cascade,
  content text not null,
  created_at timestamptz not null default now()
);

-- Helper function for RLS: is a user a member of the project?
create or replace function public.is_project_member(p_project_id uuid, p_user_id uuid)
returns boolean
language sql
stable
as $$
  select exists(
    select 1
    from public.project_members pm
    where pm.project_id = p_project_id
      and pm.user_id = p_user_id
  );
$$;

-- When a project is created, auto-add owner into project_members as 'owner'
create or replace function public.add_owner_membership()
returns trigger
language plpgsql
as $$
begin
  insert into public.project_members (project_id, user_id, role)
  values (new.id, new.owner_id, 'owner')
  on conflict do nothing;
  return new;
end;
$$;

create trigger trg_add_owner_membership
after insert on public.projects
for each row execute function public.add_owner_membership();

alter table public.projects enable row level security;
alter table public.project_members enable row level security;
alter table public.notes enable row level security;

-- PROJECTS
-- read: any member
create policy "projects: select for members"
on public.projects
for select
to authenticated
using (public.is_project_member(id, auth.uid()));

-- insert: only the logged-in user as owner
create policy "projects: insert by owner"
on public.projects
for insert
to authenticated
with check (owner_id = auth.uid());

-- update/delete: only owner
create policy "projects: update by owner"
on public.projects
for update
to authenticated
using (owner_id = auth.uid())
with check (owner_id = auth.uid());

create policy "projects: delete by owner"
on public.projects
for delete
to authenticated
using (owner_id = auth.uid());

-- PROJECT MEMBERS
-- read: only members of that project
create policy "project_members: select for members"
on public.project_members
for select
to authenticated
using (public.is_project_member(project_id, auth.uid()));

-- add/remove members: only owner of the project
create policy "project_members: modify by owner"
on public.project_members
for insert
to authenticated
with check (
  exists(select 1 from public.projects p
         where p.id = project_members.project_id
           and p.owner_id = auth.uid())
);

create policy "project_members: delete by owner"
on public.project_members
for delete
to authenticated
using (
  exists(select 1 from public.projects p
         where p.id = project_members.project_id
           and p.owner_id = auth.uid())
);

-- NOTES
-- read: members of the project
create policy "notes: select for members"
on public.notes
for select
to authenticated
using (public.is_project_member(project_id, auth.uid()));

-- insert: any member of the project; author must be the user
create policy "notes: insert by members"
on public.notes
for insert
to authenticated
with check (
  public.is_project_member(project_id, auth.uid())
  and author_id = auth.uid()
);

-- update/delete: author or project owner
create policy "notes: update by author or owner"
on public.notes
for update
to authenticated
using (
  author_id = auth.uid()
  or exists(
    select 1 from public.projects p
    where p.id = notes.project_id and p.owner_id = auth.uid()
  )
)
with check (
  author_id = auth.uid()
  or exists(
    select 1 from public.projects p
    where p.id = notes.project_id and p.owner_id = auth.uid()
  )
);

create policy "notes: delete by author or owner"
on public.notes
for delete
to authenticated
using (
  author_id = auth.uid()
  or exists(
    select 1 from public.projects p
    where p.id = notes.project_id and p.owner_id = auth.uid()
  )
);

