create table tomes (
  id serial primary key,
  numero integer unique not null,
  titre text,
  possede boolean not null default false,
  updated_at timestamptz not null default now()
);

create table reservations (
  id uuid primary key default gen_random_uuid(),
  tome_id integer not null references tomes(id) on delete cascade,
  guest_name text not null,
  guest_token uuid not null,
  status text not null default 'active' check (status in ('active','cancelled')),
  created_at timestamptz not null default now()
);

-- Une seule réservation active possible par tome
create unique index one_active_reservation_per_tome
  on reservations (tome_id)
  where status = 'active';

alter table tomes enable row level security;
alter table reservations enable row level security;

create policy "lecture publique tomes" on tomes for select using (true);
create policy "maj proprietaire" on tomes for update using (auth.role() = 'authenticated');
create policy "lecture publique reservations" on reservations for select using (true);
create policy "creation reservation" on reservations for insert with check (true);
create policy "annulation par le reservant" on reservations for update using (true);