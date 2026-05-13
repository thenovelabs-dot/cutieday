import { createClient } from "jsr:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

const EXPECTED_AUTH = Deno.env.get("DISCONNECT_CALLBACK_AUTH");

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 204, headers: corsHeaders });
  }

  if (req.method !== "POST") {
    return new Response("Method Not Allowed", { status: 405, headers: corsHeaders });
  }

  const authHeader = req.headers.get("Authorization");
  if (EXPECTED_AUTH && authHeader !== `Basic ${EXPECTED_AUTH}`) {
    return new Response("Unauthorized", { status: 401, headers: corsHeaders });
  }

  const body = await req.json().catch(() => null);
  const userId = body?.user_id ?? body?.userId;

  if (!userId) {
    return new Response("OK", { status: 200, headers: corsHeaders });
  }

  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
  );

  // 사용자 데이터 전체 삭제 (pets → daily_photos cascade 삭제)
  const { error } = await supabase.from("users").delete().eq("id", userId);

  if (error) {
    console.error("삭제 실패:", error);
    return new Response("Internal Server Error", { status: 500, headers: corsHeaders });
  }

  return new Response("OK", { status: 200, headers: corsHeaders });
});
