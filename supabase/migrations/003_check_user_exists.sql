-- 인증 없이 userKey 존재 여부만 확인하는 함수 (로그인 끊기 감지용)
-- SECURITY DEFINER: RLS 우회해서 실행 (개인정보 노출 없이 boolean만 반환)
CREATE OR REPLACE FUNCTION public.check_user_exists(user_id TEXT)
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER
AS $$
  SELECT EXISTS(SELECT 1 FROM public.users WHERE id = user_id);
$$;

GRANT EXECUTE ON FUNCTION public.check_user_exists(TEXT) TO anon;
