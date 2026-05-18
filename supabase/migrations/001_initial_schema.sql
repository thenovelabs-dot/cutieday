-- ====================================================
-- 오늘도 귀여웠어 - Initial Schema
-- Supabase SQL Editor에서 순서대로 실행
-- ====================================================

-- 1. 테이블 생성
-- ====================================================

CREATE TABLE IF NOT EXISTS public.users (
  id TEXT PRIMARY KEY,           -- 토스 로그인 발급 고유 사용자 ID
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.pets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  species TEXT NOT NULL CHECK (species IN ('강아지', '고양이', '기타')),
  breed TEXT,                    -- 기타 선택 시 직접 입력값
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.daily_photos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  pet_id UUID NOT NULL REFERENCES public.pets(id) ON DELETE CASCADE,
  date DATE NOT NULL,            -- YYYY-MM-DD
  image_url TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (pet_id, date)          -- 하루 1장 제한
);

-- 인덱스
CREATE INDEX IF NOT EXISTS idx_pets_user_id ON public.pets(user_id);
CREATE INDEX IF NOT EXISTS idx_daily_photos_pet_id ON public.daily_photos(pet_id);
CREATE INDEX IF NOT EXISTS idx_daily_photos_date ON public.daily_photos(date);


-- 2. RLS 활성화
-- ====================================================

ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.daily_photos ENABLE ROW LEVEL SECURITY;


-- 3. RLS 정책 (토스 로그인 기반 — Supabase Auth 미사용)
-- anon key로 접근 시 request.headers()에서 x-toss-user-id를 전달받아 검증
-- ====================================================

-- users 테이블
CREATE POLICY "users_select_own" ON public.users
  FOR SELECT USING (id = current_setting('request.headers')::json->>'x-toss-user-id');

CREATE POLICY "users_insert_own" ON public.users
  FOR INSERT WITH CHECK (id = current_setting('request.headers')::json->>'x-toss-user-id');

CREATE POLICY "users_update_own" ON public.users
  FOR UPDATE USING (id = current_setting('request.headers')::json->>'x-toss-user-id');

-- pets 테이블
CREATE POLICY "pets_select_own" ON public.pets
  FOR SELECT USING (
    user_id = current_setting('request.headers')::json->>'x-toss-user-id'
  );

CREATE POLICY "pets_insert_own" ON public.pets
  FOR INSERT WITH CHECK (
    user_id = current_setting('request.headers')::json->>'x-toss-user-id'
  );

CREATE POLICY "pets_update_own" ON public.pets
  FOR UPDATE USING (
    user_id = current_setting('request.headers')::json->>'x-toss-user-id'
  );

CREATE POLICY "pets_delete_own" ON public.pets
  FOR DELETE USING (
    user_id = current_setting('request.headers')::json->>'x-toss-user-id'
  );

-- daily_photos 테이블 (pets를 통해 user_id 조인)
CREATE POLICY "daily_photos_select_own" ON public.daily_photos
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.pets
      WHERE pets.id = daily_photos.pet_id
        AND pets.user_id = current_setting('request.headers')::json->>'x-toss-user-id'
    )
  );

CREATE POLICY "daily_photos_insert_own" ON public.daily_photos
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.pets
      WHERE pets.id = daily_photos.pet_id
        AND pets.user_id = current_setting('request.headers')::json->>'x-toss-user-id'
    )
  );

CREATE POLICY "daily_photos_update_own" ON public.daily_photos
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.pets
      WHERE pets.id = daily_photos.pet_id
        AND pets.user_id = current_setting('request.headers')::json->>'x-toss-user-id'
    )
  );

CREATE POLICY "daily_photos_delete_own" ON public.daily_photos
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM public.pets
      WHERE pets.id = daily_photos.pet_id
        AND pets.user_id = current_setting('request.headers')::json->>'x-toss-user-id'
    )
  );


-- 4. Storage 버킷 생성
-- ====================================================

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'pet-photos',
  'pet-photos',
  false,                          -- public URL 비공개 (signed URL 사용)
  512000,                         -- 500KB 제한
  ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/heic']
)
ON CONFLICT (id) DO NOTHING;

-- Storage RLS 정책
CREATE POLICY "storage_select_own" ON storage.objects
  FOR SELECT USING (
    bucket_id = 'pet-photos'
    AND (storage.foldername(name))[1] = current_setting('request.headers')::json->>'x-toss-user-id'
  );

CREATE POLICY "storage_insert_own" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'pet-photos'
    AND (storage.foldername(name))[1] = current_setting('request.headers')::json->>'x-toss-user-id'
  );

CREATE POLICY "storage_delete_own" ON storage.objects
  FOR DELETE USING (
    bucket_id = 'pet-photos'
    AND (storage.foldername(name))[1] = current_setting('request.headers')::json->>'x-toss-user-id'
  );
