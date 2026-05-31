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

  // 1. Storage 이미지 삭제 (image_url에서 경로 추출)
  const { data: photos } = await supabase
    .from("daily_photos")
    .select("image_url, pets!inner(user_id)")
    .eq("pets.user_id", userId);

  if (photos && photos.length > 0) {
    const marker = "/pet-photos/";
    const storagePaths = photos
      .map((p: { image_url: string }) => {
        const idx = p.image_url.indexOf(marker);
        return idx >= 0 ? p.image_url.slice(idx + marker.length) : null;
      })
      .filter(Boolean) as string[];

    if (storagePaths.length > 0) {
      const { error: storageError } = await supabase.storage
        .from("pet-photos")
        .remove(storagePaths);
      if (storageError) console.error("Storage 삭제 실패:", storageError);
    }
  }

  // 2. DB 유저 삭제 (pets → daily_photos cascade)
  const { error } = await supabase.from("users").delete().eq("id", userId);

  if (error) {
    console.error("DB 삭제 실패:", error);
    return new Response("Internal Server Error", { status: 500, headers: corsHeaders });
  }

  return new Response("OK", { status: 200, headers: corsHeaders });
});
