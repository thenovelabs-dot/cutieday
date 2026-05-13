import { appLogin } from "@apps-in-toss/web-framework";
import { supabase } from "./supabase";

export interface TossLoginResult {
  userKey: string;
  isNewUser: boolean;
}

export async function loginWithToss(): Promise<TossLoginResult> {
  // 1. 토스 로그인 → 인가 코드 받기
  const { authorizationCode, referrer } = await appLogin();

  // 2. Edge Function에서 토큰 교환 + userKey 발급
  const { data, error } = await supabase.functions.invoke("toss-auth", {
    body: { authorizationCode, referrer },
  });

  if (error) throw new Error("토스 로그인 실패: " + error.message);

  return data as TossLoginResult;
}
