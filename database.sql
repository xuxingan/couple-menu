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

-- 修改采买清单表
create table shopping_lists (
  id text primary key, -- 使用菜品ID的排序后哈希值作为主键
  dish_ids text[] not null, -- 存储相关菜品的ID数组
  created_at timestamp with time zone default timezone('utc'::text, now()),
  updated_at timestamp with time zone default timezone('utc'::text, now()),
  content JSONB not null
); 