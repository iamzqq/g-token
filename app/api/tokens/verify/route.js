import { supabase } from "../../../lib/supabase";

export async function POST(request) {
  const { token } = await request.json();
  if (!token) {
    return Response.json({ error: "Token required" }, { status: 400 });
  }

  try {
    const now = new Date().toISOString();
    const { data, error } = await supabase
      .from("tokens")
      .select("id")
      .eq("token", token)
      .eq("used", false)
      .gt("expires_at", now)
      .single();

    if (error || !data) {
      return Response.json(
        { valid: false, message: "无效或已使用的令牌" },
        { status: 401 },
      );
    }

    // 标记为已使用
    await supabase.from("tokens").update({ used: true }).eq("id", data.id);

    return Response.json({ valid: true, message: "验证成功" });
  } catch (error) {
    console.error(error);
    return Response.json({ error: error.message }, { status: 500 });
  }
}
