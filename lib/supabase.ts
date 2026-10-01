import { createBrowserClient } from "@supabase/ssr";

// publishable 키는 브라우저에 공개되는 값이라 기본값으로 둔다(데이터는 RLS로 보호).
// 다른 Supabase 프로젝트를 쓰려면 환경 변수로 덮어쓴다.
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://plrngsporiozfdnxkgnk.supabase.co";
const SUPABASE_PUBLISHABLE_KEY =
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || "sb_publishable_HuZZGP0nY8TtjfC2rwZdHg_wzmKU4HO";

export const supabase = createBrowserClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY);
