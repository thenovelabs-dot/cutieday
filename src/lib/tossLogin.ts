import { appLogin } from "@apps-in-toss/web-framework";
import { supabase } from "./supabase";
import { setUserKey } from "./auth";

export interface TossLoginResult {
  userKey: string;
  isNewUser: boolean;
  accessToken: string;
}

export async function loginWithToss(): Promise<TossLoginResult> {
  if (import.meta.env.DEV) {
    const devUserKey = "f71a8290-0a58-4f37-a27d-1ed03b158e5b";
    setUserKey(devUserKey);
    return { userKey: devUserKey, isNewUser: true, accessToken: "" };
  }

  // 1. 토스 로그인 → 인가 코드 받기
  const { authorizationCode, referrer } = await appLogin();

  // 2. Edge Function에서 토큰 교환 + userKey + Supabase JWT 발급
  const res = await fetch(
    `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/toss-auth`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ authorizationCode, referrer }),
    }
  );

  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`토스 로그인 실패: ${res.status} ${errText}`);
  }

  const result = (await res.json()) as TossLoginResult;

  // 3. Supabase 세션 설정 → 이후 모든 요청에 JWT 자동 첨부
  await supabase.auth.setSession({
    access_token: result.accessToken,
    refresh_token: result.accessToken,
  });

  setUserKey(result.userKey);

  return result;
}
