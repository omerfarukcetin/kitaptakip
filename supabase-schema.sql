-- Create profiles table
create table profiles (
  id uuid references auth.users on delete cascade primary key,
  email text,
  full_name text,
  avatar_url text,
  reading_goal_yearly int default 12,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

-- Enable RLS
alter table profiles enable row level security;

-- Profiles policies
create policy "Users can view own profile"
  on profiles for select
  using (auth.uid() = id);

create policy "Users can update own profile"
  on profiles for update
  using (auth.uid() = id);

create policy "Users can insert own profile"
  on profiles for insert
  with check (auth.uid() = id);

-- Create updated_at trigger function
create or replace function update_updated_at_column()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

-- Create trigger for profiles
create trigger update_profiles_updated_at
  before update on profiles
  for each row
  execute function update_updated_at_column();

-- Create book_status enum
create type book_status as enum ('to_read', 'reading', 'completed');

-- Create books table
create table books (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users on delete cascade not null,
  title text not null,
  author text,
  total_pages int not null,
  current_page int default 0,
  status book_status default 'to_read',
  cover_url text,
  isbn text,
  categories text[],
  notes text,
  rating int check (rating >= 1 and rating <= 5),
  started_at timestamp with time zone,
  completed_at timestamp with time zone,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

-- Indexes for books
create index books_user_id_idx on books(user_id);
create index books_status_idx on books(status);
create index books_isbn_idx on books(isbn);

-- Enable RLS for books
alter table books enable row level security;

-- Books policies
create policy "Users can view own books"
  on books for select
  using (auth.uid() = user_id);

create policy "Users can insert own books"
  on books for insert
  with check (auth.uid() = user_id);

create policy "Users can update own books"
  on books for update
  using (auth.uid() = user_id);

create policy "Users can delete own books"
  on books for delete
  using (auth.uid() = user_id);

-- Create trigger for books
create trigger update_books_updated_at
  before update on books
  for each row
  execute function update_updated_at_column();

-- Create reading_plans table
create table reading_plans (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users on delete cascade not null,
  book_id uuid references books on delete cascade not null,
  start_date date not null,
  end_date date not null,
  daily_pages int not null,
  calculation_mode text check (calculation_mode in ('pages', 'date')),
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

-- Enable RLS for reading_plans
alter table reading_plans enable row level security;

-- Reading plans policies
create policy "Users can manage own reading plans"
  on reading_plans for all
  using (auth.uid() = user_id);

-- Create trigger for reading_plans
create trigger update_reading_plans_updated_at
  before update on reading_plans
  for each row
  execute function update_updated_at_column();

-- Create reading_progress table
create table reading_progress (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users on delete cascade not null,
  book_id uuid references books on delete cascade not null,
  date date not null,
  pages_read int not null,
  notes text,
  created_at timestamp with time zone default now(),
  unique(user_id, book_id, date)
);

-- Enable RLS for reading_progress
alter table reading_progress enable row level security;

-- Reading progress policies
create policy "Users can manage own progress"
  on reading_progress for all
  using (auth.uid() = user_id);

-- Function to automatically create profile on signup
create or replace function handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email, full_name)
  values (new.id, new.email, new.raw_user_meta_data->>'full_name');
  return new;
end;
$$ language plpgsql security definer;

-- Trigger to create profile on signup
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function handle_new_user();
