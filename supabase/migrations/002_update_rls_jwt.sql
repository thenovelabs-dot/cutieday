-- ====================================================
-- 기존 커스텀 헤더 방식 RLS 정책 삭제 후 JWT 방식으로 교체
-- auth.jwt() ->> 'sub' = 토스 userKey (또는 익명 UUID)
-- ====================================================

-- 기존 정책 삭제
DROP POLICY IF EXISTS "users_select_own" ON public.users;
DROP POLICY IF EXISTS "users_insert_own" ON public.users;
DROP POLICY IF EXISTS "users_update_own" ON public.users;
DROP POLICY IF EXISTS "pets_select_own" ON public.pets;
DROP POLICY IF EXISTS "pets_insert_own" ON public.pets;
DROP POLICY IF EXISTS "pets_update_own" ON public.pets;
DROP POLICY IF EXISTS "pets_delete_own" ON public.pets;
DROP POLICY IF EXISTS "daily_photos_select_own" ON public.daily_photos;
DROP POLICY IF EXISTS "daily_photos_insert_own" ON public.daily_photos;
DROP POLICY IF EXISTS "daily_photos_update_own" ON public.daily_photos;
DROP POLICY IF EXISTS "daily_photos_delete_own" ON public.daily_photos;
DROP POLICY IF EXISTS "storage_select_own" ON storage.objects;
DROP POLICY IF EXISTS "storage_insert_own" ON storage.objects;
DROP POLICY IF EXISTS "storage_delete_own" ON storage.objects;

-- users 정책
CREATE POLICY "users_select_own" ON public.users
  FOR SELECT USING (id = (auth.jwt() ->> 'sub'));

CREATE POLICY "users_insert_own" ON public.users
  FOR INSERT WITH CHECK (id = (auth.jwt() ->> 'sub'));

CREATE POLICY "users_update_own" ON public.users
  FOR UPDATE USING (id = (auth.jwt() ->> 'sub'));

-- pets 정책
CREATE POLICY "pets_select_own" ON public.pets
  FOR SELECT USING (user_id = (auth.jwt() ->> 'sub'));

CREATE POLICY "pets_insert_own" ON public.pets
  FOR INSERT WITH CHECK (user_id = (auth.jwt() ->> 'sub'));

CREATE POLICY "pets_update_own" ON public.pets
  FOR UPDATE USING (user_id = (auth.jwt() ->> 'sub'));

CREATE POLICY "pets_delete_own" ON public.pets
  FOR DELETE USING (user_id = (auth.jwt() ->> 'sub'));

-- daily_photos 정책
CREATE POLICY "daily_photos_select_own" ON public.daily_photos
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.pets WHERE pets.id = daily_photos.pet_id AND pets.user_id = (auth.jwt() ->> 'sub'))
  );

CREATE POLICY "daily_photos_insert_own" ON public.daily_photos
  FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM public.pets WHERE pets.id = daily_photos.pet_id AND pets.user_id = (auth.jwt() ->> 'sub'))
  );

CREATE POLICY "daily_photos_update_own" ON public.daily_photos
  FOR UPDATE USING (
    EXISTS (SELECT 1 FROM public.pets WHERE pets.id = daily_photos.pet_id AND pets.user_id = (auth.jwt() ->> 'sub'))
  );

CREATE POLICY "daily_photos_delete_own" ON public.daily_photos
  FOR DELETE USING (
    EXISTS (SELECT 1 FROM public.pets WHERE pets.id = daily_photos.pet_id AND pets.user_id = (auth.jwt() ->> 'sub'))
  );

-- storage 정책
CREATE POLICY "storage_select_own" ON storage.objects
  FOR SELECT USING (bucket_id = 'pet-photos' AND (storage.foldername(name))[1] = (auth.jwt() ->> 'sub'));

CREATE POLICY "storage_insert_own" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'pet-photos' AND (storage.foldername(name))[1] = (auth.jwt() ->> 'sub'));

CREATE POLICY "storage_delete_own" ON storage.objects
  FOR DELETE USING (bucket_id = 'pet-photos' AND (storage.foldername(name))[1] = (auth.jwt() ->> 'sub'));
