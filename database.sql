-- 菜品表
create table dishes (
  id uuid default uuid_generate_v4() primary key,
  name text not null,
  description text,
  image_url text,
  created_by text not null, -- 'male' 或 'female'
  created_at timestamp with time zone default timezone('utc'::text, now()),
  wished boolean default false,
  cooking_time_minutes integer default 30,
  ingredients JSONB
); 