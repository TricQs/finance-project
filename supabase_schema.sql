-- ============================================================================
-- SKEMA DATABASE UANGKU
-- Salin dan jalankan seluruh script ini di SQL Editor Supabase Anda.
-- ============================================================================

-- 1. AKTIFKAN EXTENSION YANG DIBUTUHKAN (jika belum aktif)
create extension if not exists "uuid-ossp";

-- 2. HAPUS TABEL & FUNGSI JIKA SUDAH ADA (Untuk keperluan reset / fresh install)
drop trigger if exists on_auth_user_created on auth.users;
drop function if exists public.handle_new_user() cascade;
drop function if exists public.handle_transaction_balance_sync() cascade;
drop function if exists public.handle_transfer_balance_sync() cascade;

drop table if exists public.reminders cascade;
drop table if exists public.budgets cascade;
drop table if exists public.debts cascade;
drop table if exists public.goals cascade;
drop table if exists public.investments cascade;
drop table if exists public.transfers cascade;
drop table if exists public.transactions cascade;
drop table if exists public.accounts cascade;
drop table if exists public.profiles cascade;

-- 3. FUNGSI UNTUK OTOMATISASI TIMESTAMP updated_at
create or replace function public.handle_update_timestamp()
returns trigger as $$
begin
  new.updated_at = timezone('utc'::text, now());
  return new;
end;
$$ language plpgsql;

-- ============================================================================
-- PEMBUATAN TABEL
-- ============================================================================

-- A. TABEL PROFILES (Tautkan langsung dengan tabel bawaan auth.users)
create table public.profiles (
  id uuid references auth.users on delete cascade primary key,
  email text,
  full_name text not null,
  avatar_url text,
  currency text not null default 'IDR',
  locale text not null default 'id-ID',
  timezone text not null default 'Asia/Jakarta',
  role text not null default 'user' check (role in ('user', 'admin')),
  is_active boolean not null default true,
  created_at timestamp with time zone not null default timezone('utc'::text, now()),
  updated_at timestamp with time zone not null default timezone('utc'::text, now()),
  deleted_at timestamp with time zone
);

create trigger update_profiles_timestamp
  before update on public.profiles
  for each row execute procedure public.handle_update_timestamp();

-- B. TABEL ACCOUNTS
create table public.accounts (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  name text not null,
  type text not null check (type in ('bank', 'ewallet', 'cash', 'investment', 'other')),
  institution text,
  account_number text,
  balance numeric not null default 0,
  currency text not null default 'IDR',
  color text not null default '#6366f1',
  icon text not null default 'Wallet',
  sort_order integer not null default 0,
  is_active boolean not null default true,
  created_at timestamp with time zone not null default timezone('utc'::text, now()),
  updated_at timestamp with time zone not null default timezone('utc'::text, now()),
  deleted_at timestamp with time zone
);

create trigger update_accounts_timestamp
  before update on public.accounts
  for each row execute procedure public.handle_update_timestamp();

-- C. TABEL TRANSACTIONS
create table public.transactions (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  account_id uuid references public.accounts(id) on delete set null,
  type text not null check (type in ('income', 'expense')),
  amount numeric not null check (amount >= 0),
  category text not null,
  description text,
  date date not null default current_date,
  receipt_url text,
  is_recurring boolean not null default false,
  recurring_interval text check (recurring_interval in ('daily', 'weekly', 'monthly', 'yearly')),
  recurring_parent_id uuid references public.transactions(id) on delete set null,
  created_at timestamp with time zone not null default timezone('utc'::text, now()),
  updated_at timestamp with time zone not null default timezone('utc'::text, now()),
  deleted_at timestamp with time zone
);

create trigger update_transactions_timestamp
  before update on public.transactions
  for each row execute procedure public.handle_update_timestamp();

-- D. TABEL TRANSFERS
create table public.transfers (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  from_account_id uuid references public.accounts(id) on delete set null,
  to_account_id uuid references public.accounts(id) on delete set null,
  amount numeric not null check (amount >= 0),
  description text,
  date date not null default current_date,
  created_at timestamp with time zone not null default timezone('utc'::text, now()),
  deleted_at timestamp with time zone
);

-- E. TABEL INVESTMENTS
create table public.investments (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  type text not null check (type in ('gold', 'stock', 'crypto', 'mutual_fund', 'other')),
  name text not null,
  ticker text,
  platform text,
  quantity numeric not null default 0,
  buy_price numeric not null default 0,
  buy_date date not null default current_date,
  notes text,
  is_sold boolean not null default false,
  sold_price numeric,
  sold_date date,
  created_at timestamp with time zone not null default timezone('utc'::text, now()),
  updated_at timestamp with time zone not null default timezone('utc'::text, now()),
  deleted_at timestamp with time zone
);

create trigger update_investments_timestamp
  before update on public.investments
  for each row execute procedure public.handle_update_timestamp();

-- F. TABEL GOALS
create table public.goals (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  name text not null,
  target_amount numeric not null check (target_amount >= 0),
  current_amount numeric not null default 0 check (current_amount >= 0),
  target_date date,
  icon text not null default 'Target',
  color text not null default '#10b981',
  is_completed boolean not null default false,
  completed_at timestamp with time zone,
  created_at timestamp with time zone not null default timezone('utc'::text, now()),
  updated_at timestamp with time zone not null default timezone('utc'::text, now()),
  deleted_at timestamp with time zone
);

create trigger update_goals_timestamp
  before update on public.goals
  for each row execute procedure public.handle_update_timestamp();

-- G. TABEL DEBTS (Hutang / Piutang)
create table public.debts (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  type text not null check (type in ('debt', 'receivable')),
  contact_name text not null,
  original_amount numeric not null check (original_amount >= 0),
  remaining_amount numeric not null check (remaining_amount >= 0),
  due_date date,
  description text,
  is_settled boolean not null default false,
  settled_at timestamp with time zone,
  created_at timestamp with time zone not null default timezone('utc'::text, now()),
  updated_at timestamp with time zone not null default timezone('utc'::text, now()),
  deleted_at timestamp with time zone
);

create trigger update_debts_timestamp
  before update on public.debts
  for each row execute procedure public.handle_update_timestamp();

-- H. TABEL BUDGETS
create table public.budgets (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  category text not null,
  amount numeric not null check (amount >= 0),
  period text not null check (period in ('monthly', 'yearly')),
  month integer check (month between 1 and 12),
  year integer not null,
  created_at timestamp with time zone not null default timezone('utc'::text, now()),
  updated_at timestamp with time zone not null default timezone('utc'::text, now()),
  -- Satu kategori budget hanya boleh ada satu per periode
  unique (user_id, category, period, month, year)
);

create trigger update_budgets_timestamp
  before update on public.budgets
  for each row execute procedure public.handle_update_timestamp();

-- I. TABEL REMINDERS (Tagihan / Pengingat)
create table public.reminders (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  title text not null,
  amount numeric check (amount >= 0),
  due_date date not null,
  repeat_interval text not null check (repeat_interval in ('once', 'weekly', 'monthly', 'yearly')),
  is_done boolean not null default false,
  done_at timestamp with time zone,
  created_at timestamp with time zone not null default timezone('utc'::text, now()),
  updated_at timestamp with time zone not null default timezone('utc'::text, now())
);

create trigger update_reminders_timestamp
  before update on public.reminders
  for each row execute procedure public.handle_update_timestamp();


-- ============================================================================
-- INDEKS KINERJA (PERFORMANCE INDEXES)
-- ============================================================================
create index idx_accounts_user_id on public.accounts(user_id);
create index idx_transactions_user_id on public.transactions(user_id);
create index idx_transactions_account_id on public.transactions(account_id);
create index idx_transfers_user_id on public.transfers(user_id);
create index idx_investments_user_id on public.investments(user_id);
create index idx_goals_user_id on public.goals(user_id);
create index idx_debts_user_id on public.debts(user_id);
create index idx_budgets_user_id on public.budgets(user_id);
create index idx_reminders_user_id on public.reminders(user_id);


-- ============================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================================================

-- Aktifkan RLS untuk semua tabel
alter table public.profiles enable row level security;
alter table public.accounts enable row level security;
alter table public.transactions enable row level security;
alter table public.transfers enable row level security;
alter table public.investments enable row level security;
alter table public.goals enable row level security;
alter table public.debts enable row level security;
alter table public.budgets enable row level security;
alter table public.reminders enable row level security;

-- Kebijakan akses profiles
create policy "Pengguna hanya bisa melihat profil sendiri" on public.profiles
  for select using (auth.uid() = id);

create policy "Pengguna hanya bisa memperbarui profil sendiri" on public.profiles
  for update using (auth.uid() = id);

-- Kebijakan akses accounts
create policy "Pengguna memiliki kendali penuh atas akun milik sendiri" on public.accounts
  for all using (auth.uid() = user_id);

-- Kebijakan akses transactions
create policy "Pengguna memiliki kendali penuh atas transaksi milik sendiri" on public.transactions
  for all using (auth.uid() = user_id);

-- Kebijakan akses transfers
create policy "Pengguna memiliki kendali penuh atas transfer milik sendiri" on public.transfers
  for all using (auth.uid() = user_id);

-- Kebijakan akses investments
create policy "Pengguna memiliki kendali penuh atas investasi milik sendiri" on public.investments
  for all using (auth.uid() = user_id);

-- Kebijakan akses goals
create policy "Pengguna memiliki kendali penuh atas target milik sendiri" on public.goals
  for all using (auth.uid() = user_id);

-- Kebijakan akses debts
create policy "Pengguna memiliki kendali penuh atas hutang milik sendiri" on public.debts
  for all using (auth.uid() = user_id);

-- Kebijakan akses budgets
create policy "Pengguna memiliki kendali penuh atas budget milik sendiri" on public.budgets
  for all using (auth.uid() = user_id);

-- Kebijakan akses reminders
create policy "Pengguna memiliki kendali penuh atas pengingat milik sendiri" on public.reminders
  for all using (auth.uid() = user_id);


-- ============================================================================
-- AUTOMATED TRIGGERS & FUNCTIONS
-- ============================================================================

-- 1. TRIGGER: OTOMATIS MEMBUAT PROFIL SAAT USER MENDAFTAR (SIGN-UP)
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email, full_name, avatar_url)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'full_name', split_part(new.email, '@', 1)),
    new.raw_user_meta_data->>'avatar_url'
  );
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();


-- 2. TRIGGER: SINKRONISASI SALDO AKUN SAAT TRANSAKSI DITAMBAH, DIUBAH, ATAU DIHAPUS
create or replace function public.handle_transaction_balance_sync()
returns trigger as $$
declare
  v_diff numeric;
begin
  -- Kasus 1: INSERT
  if (TG_OP = 'INSERT') then
    if (new.type = 'income') then
      update public.accounts
      set balance = balance + new.amount
      where id = new.account_id;
    elsif (new.type = 'expense') then
      update public.accounts
      set balance = balance - new.amount
      where id = new.account_id;
    end if;

  -- Kasus 2: UPDATE
  elsif (TG_OP = 'UPDATE') then
    -- Jika akun berubah
    if (old.account_id <> new.account_id) then
      -- Kembalikan saldo akun lama
      if (old.type = 'income') then
        update public.accounts set balance = balance - old.amount where id = old.account_id;
      elsif (old.type = 'expense') then
        update public.accounts set balance = balance + old.amount where id = old.account_id;
      end if;
      
      -- Terapkan ke akun baru
      if (new.type = 'income') then
        update public.accounts set balance = balance + new.amount where id = new.account_id;
      elsif (new.type = 'expense') then
        update public.accounts set balance = balance - new.amount where id = new.account_id;
      end if;
    else
      -- Jika akun sama, hitung selisihnya saja
      if (old.type = 'income' and new.type = 'income') then
        v_diff := new.amount - old.amount;
        update public.accounts set balance = balance + v_diff where id = new.account_id;
      elsif (old.type = 'expense' and new.type = 'expense') then
        v_diff := new.amount - old.amount;
        update public.accounts set balance = balance - v_diff where id = new.account_id;
      elsif (old.type = 'expense' and new.type = 'income') then
        -- Tipe berubah dari pengeluaran menjadi pemasukan
        update public.accounts set balance = balance + old.amount + new.amount where id = new.account_id;
      elsif (old.type = 'income' and new.type = 'expense') then
        -- Tipe berubah dari pemasukan menjadi pengeluaran
        update public.accounts set balance = balance - old.amount - new.amount where id = new.account_id;
      end if;
    end if;

  -- Kasus 3: DELETE
  elsif (TG_OP = 'DELETE') then
    if (old.type = 'income') then
      update public.accounts
      set balance = balance - old.amount
      where id = old.account_id;
    elsif (old.type = 'expense') then
      update public.accounts
      set balance = balance + old.amount
      where id = old.account_id;
    end if;
  end if;
  
  return null;
end;
$$ language plpgsql security definer;

create trigger on_transaction_change
  after insert or update or delete on public.transactions
  for each row execute procedure public.handle_transaction_balance_sync();


-- 3. TRIGGER: SINKRONISASI SALDO AKUN SAAT TRANSFER ANTAR REKENING TERJADI
create or replace function public.handle_transfer_balance_sync()
returns trigger as $$
begin
  -- Kasus 1: INSERT
  if (TG_OP = 'INSERT') then
    -- Kurangi saldo dari akun pengirim
    if (new.from_account_id is not null) then
      update public.accounts
      set balance = balance - new.amount
      where id = new.from_account_id;
    end if;
    -- Tambah saldo ke akun penerima
    if (new.to_account_id is not null) then
      update public.accounts
      set balance = balance + new.amount
      where id = new.to_account_id;
    end if;

  -- Kasus 2: UPDATE
  elsif (TG_OP = 'UPDATE') then
    -- Kembalikan transfer lama
    if (old.from_account_id is not null) then
      update public.accounts set balance = balance + old.amount where id = old.from_account_id;
    end if;
    if (old.to_account_id is not null) then
      update public.accounts set balance = balance - old.amount where id = old.to_account_id;
    end if;
    
    -- Terapkan transfer baru
    if (new.from_account_id is not null) then
      update public.accounts set balance = balance - new.amount where id = new.from_account_id;
    end if;
    if (new.to_account_id is not null) then
      update public.accounts set balance = balance + new.amount where id = new.to_account_id;
    end if;

  -- Kasus 3: DELETE
  elsif (TG_OP = 'DELETE') then
    -- Kembalikan saldo awal
    if (old.from_account_id is not null) then
      update public.accounts
      set balance = balance + old.amount
      where id = old.from_account_id;
    end if;
    if (old.to_account_id is not null) then
      update public.accounts
      set balance = balance - old.amount
      where id = old.to_account_id;
    end if;
  end if;

  return null;
end;
$$ language plpgsql security definer;

create trigger on_transfer_change
  after insert or update or delete on public.transfers
  for each row execute procedure public.handle_transfer_balance_sync();
