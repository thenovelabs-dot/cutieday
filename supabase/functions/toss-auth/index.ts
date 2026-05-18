import { createClient } from "jsr:@supabase/supabase-js@2";

const TOSS_API_BASE = "https://apps-in-toss-api.toss.im";
const CLIENT_ID = Deno.env.get("TOSS_LOGIN_CLIENT_ID")!;

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, apikey, x-client-info",
};

async function createSupabaseJWT(userKey: string): Promise<string> {
  const secret = Deno.env.get("SUPABASE_JWT_SECRET")!;
  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );

  const now = Math.floor(Date.now() / 1000);
  const payload = {
    aud: "authenticated",
    exp: now + 60 * 60 * 24 * 7, // 7일
    iat: now,
    iss: "supabase",
    sub: userKey,
    role: "authenticated",
  };

  const encode = (obj: object) =>
    btoa(JSON.stringify(obj))
      .replace(/\+/g, "-").replace(/\//g, "_").replace(/=/g, "");

  const header = encode({ alg: "HS256", typ: "JWT" });
  const body = encode(payload);
  const signingInput = `${header}.${body}`;

  const raw = await crypto.subtle.sign(
    "HMAC",
    key,
    new TextEncoder().encode(signingInput)
  );

  const sig = btoa(String.fromCharCode(...new Uint8Array(raw)))
    .replace(/\+/g, "-").replace(/\//g, "_").replace(/=/g, "");

  return `${signingInput}.${sig}`;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 204, headers: corsHeaders });
  }

  const { authorizationCode, referrer } = await req.json();

  // 1. 인가 코드 → 액세스 토큰 교환
  const tokenRes = await fetch(
    `${TOSS_API_BASE}/api-partner/v1/apps-in-toss/user/oauth2/generate-token`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Client-Id": CLIENT_ID,
      },
      body: JSON.stringify({ authorizationCode, referrer }),
    }
  );

  if (!tokenRes.ok) {
    const err = await tokenRes.text();
    console.error("토큰 발급 실패:", err);
    return new Response(JSON.stringify({ error: "token_error", detail: err }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  const tokenData = await tokenRes.json();
  const tossAccessToken = tokenData.success?.accessToken ?? tokenData.accessToken;

  if (!tossAccessToken) {
    console.error("accessToken 없음:", JSON.stringify(tokenData));
    return new Response(JSON.stringify({ error: "no_access_token" }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  // 2. 액세스 토큰 → 사용자 정보 조회 (userKey)
  const userRes = await fetch(
    `${TOSS_API_BASE}/api-partner/v1/apps-in-toss/user/oauth2/login-me`,
    {
      headers: {
        Authorization: `Bearer ${tossAccessToken}`,
        "Content-Type": "application/json",
      },
    }
  );

  if (!userRes.ok) {
    const err = await userRes.text();
    console.error("유저 정보 조회 실패:", err);
    return new Response(JSON.stringify({ error: "user_error", detail: err }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  const userData = await userRes.json();
  const userKey = String(userData.userKey ?? userData.success?.userKey);

  if (!userKey || userKey === "undefined") {
    console.error("userKey 없음:", JSON.stringify(userData));
    return new Response(JSON.stringify({ error: "no_user_key" }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  // 3. Supabase users 테이블에 upsert
  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
  );

  const { error: upsertError } = await supabase
    .from("users")
    .upsert({ id: userKey }, { onConflict: "id" });

  if (upsertError) {
    console.error("upsert 실패:", upsertError);
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

  // 5. Supabase JWT 발급
  const supabaseToken = await createSupabaseJWT(userKey);

  return new Response(
    JSON.stringify({ userKey, isNewUser: count === 0, accessToken: supabaseToken }),
    { headers: { ...corsHeaders, "Content-Type": "application/json" } }
  );
});
