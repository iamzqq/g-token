import { supabase } from "../../../lib/supabase";
import crypto from "crypto";

// 生成随机令牌（8 位十六进制）
function generateToken() {
  return crypto.randomBytes(4).toString("hex").toUpperCase();
}

// GET /api/tokens - 获取所有未使用且未过期的令牌
export async function GET() {
  try {
    const now = new Date().toISOString();
    const { data, error } = await supabase
      .from("tokens")
      .select("*")
      .eq("used", false)
      .gt("expires_at", now)
      .order("created_at", { ascending: false });

    if (error) throw error;
    return Response.json(data);
  } catch (error) {
    console.error(error);
    return Response.json({ error: error.message }, { status: 500 });
  }
}

// POST /api/tokens - 生成一个新令牌
export async function POST() {
  try {
    const token = generateToken();
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getMinutes() + 1); // 24 小时有效期

    const { data, error } = await supabase
      .from("tokens")
      .insert([{ token, expires_at: expiresAt.toISOString() }])
      .select()
      .single();

    if (error) throw error;
    return Response.json(data, { status: 201 });
  } catch (error) {
    console.error(error);
    return Response.json({ error: error.message }, { status: 500 });
  }
}

// DELETE /api/tokens?id=xxx - 删除指定令牌
export async function DELETE(request) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");
  if (!id) {
    return Response.json({ error: "Missing token id" }, { status: 400 });
  }

  try {
    const { error } = await supabase.from("tokens").delete().eq("id", id);
    if (error) throw error;
    return new Response(null, { status: 204 });
  } catch (error) {
    console.error(error);
    return Response.json({ error: error.message }, { status: 500 });
  }
}
