-- 菜品表
create table dishes (
  id uuid default uuid_generate_v4() primary key,
  name text not null,
  description text,
  image_url text,
  created_by text not null, -- 'male' 或 'female'
  created_at timestamp with time zone default timezone('utc'::text, now()),
  wished boolean default false
);

-- 期待清单表
create table wish_list (
  id uuid default uuid_generate_v4() primary key,
  dish_id uuid references dishes(id),
  wished_by text not null, -- 'male' 或 'female'
  created_at timestamp with time zone default timezone('utc'::text, now())
); 