import { createClient } from "jsr:@supabase/supabase-js@2";

const TOSS_API_BASE = "https://api-partner.toss.im";
const CLIENT_ID = Deno.env.get("TOSS_LOGIN_CLIENT_ID")!;

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

function getMTLSClient() {
  const certB64 = Deno.env.get("TOSS_MTLS_CERT")!;
  const keyB64 = Deno.env.get("TOSS_MTLS_KEY")!;
  const cert = atob(certB64);
  const key = atob(keyB64);
  return { cert, key };
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 204, headers: corsHeaders });
  }

  const { authorizationCode, referrer } = await req.json();
  const { cert, key } = getMTLSClient();

  // 1. 인가 코드 → 액세스 토큰 교환 (mTLS)
  const tokenRes = await fetch(
    `${TOSS_API_BASE}/api-partner/v1/apps-in-toss/user/oauth2/generate-token`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Client-Id": CLIENT_ID,
        // @ts-ignore Deno fetch supports cert/key
        cert,
        key,
      },
      body: JSON.stringify({ authorizationCode, referrer }),
    }
  );

  if (!tokenRes.ok) {
    const err = await tokenRes.text();
    console.error("토큰 발급 실패:", err);
    return new Response(JSON.stringify({ error: "token_error" }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  const { accessToken } = await tokenRes.json();

  // 2. 액세스 토큰 → 사용자 정보 조회 (userKey)
  const userRes = await fetch(
    `${TOSS_API_BASE}/api-partner/v1/apps-in-toss/user/oauth2/login-me`,
    {
      headers: { Authorization: `Bearer ${accessToken}` },
    }
  );

  if (!userRes.ok) {
    return new Response(JSON.stringify({ error: "user_error" }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  const { userKey } = await userRes.json();

  // 3. Supabase users 테이블에 upsert (신규 유저면 생성, 기존이면 그냥 통과)
  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
  );

  const { error } = await supabase
    .from("users")
    .upsert({ id: userKey }, { onConflict: "id" });

  if (error) {
    console.error("upsert 실패:", error);
    return new Response(JSON.stringify({ error: "db_error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  // 4. 신규/기존 유저 판단
  const { count } = await supabase
    .from("pets")
    .select("*", { count: "exact", head: true })
    .eq("user_id", userKey);

  return new Response(
    JSON.stringify({ userKey, isNewUser: count === 0 }),
    { headers: { ...corsHeaders, "Content-Type": "application/json" } }
  );
});
