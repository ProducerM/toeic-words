"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { supabase } from "@/lib/supabase";

type Mode = "signin" | "signup";

function toKorean(message: string): string {
  if (message.includes("Invalid login credentials")) return "이메일 또는 비밀번호가 올바르지 않아요.";
  if (message.includes("Email not confirmed")) return "이메일 인증이 아직 완료되지 않았어요. 받은 메일의 링크를 눌러주세요.";
  if (message.includes("already registered")) return "이미 가입된 이메일이에요. 로그인해 주세요.";
  if (message.includes("Password should be")) return "비밀번호는 6자 이상이어야 해요.";
  if (message.includes("rate limit")) return "요청이 너무 많아요. 잠시 후 다시 시도해 주세요.";
  return message;
}

export default function LoginForm() {
  const router = useRouter();
  const [mode, setMode] = useState<Mode>("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    setNotice(null);

    if (mode === "signin") {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      setBusy(false);
      if (error) return setError(toKorean(error.message));
      router.push("/");
      return;
    }

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { emailRedirectTo: window.location.origin },
    });
    setBusy(false);
    if (error) return setError(toKorean(error.message));
    if (data.session) {
      router.push("/");
    } else {
      setNotice("인증 메일을 보냈어요. 메일의 링크를 누르면 로그인됩니다.");
    }
  }

  return (
    <div className="flex w-full max-w-sm flex-col gap-6">
      <Link href="/" className="text-sm text-slate-500 hover:text-slate-800">
        ← 퀴즈로
      </Link>
      <h1 className="text-3xl font-bold text-slate-900">{mode === "signin" ? "로그인" : "회원가입"}</h1>
      <p className="-mt-3 text-sm text-slate-500">로그인하면 단어 암기장이 계정에 저장돼 다른 기기에서도 볼 수 있어요.</p>

      <form onSubmit={submit} className="flex flex-col gap-3">
        <label className="flex flex-col gap-1 text-sm font-medium text-slate-700">
          이메일
          <input
            type="email"
            required
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-base font-normal outline-none focus:border-slate-900"
          />
        </label>
        <label className="flex flex-col gap-1 text-sm font-medium text-slate-700">
          비밀번호
          <input
            type="password"
            required
            minLength={6}
            autoComplete={mode === "signin" ? "current-password" : "new-password"}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-base font-normal outline-none focus:border-slate-900"
          />
        </label>

        {error && <p className="rounded-lg bg-rose-50 px-3 py-2 text-sm text-rose-700">{error}</p>}
        {notice && <p className="rounded-lg bg-emerald-50 px-3 py-2 text-sm text-emerald-800">{notice}</p>}

        <button
          type="submit"
          disabled={busy}
          className="mt-2 rounded-full bg-slate-900 py-3 font-semibold text-white transition hover:bg-slate-700 disabled:opacity-60"
        >
          {busy ? "처리 중…" : mode === "signin" ? "로그인" : "가입하기"}
        </button>
      </form>

      <p className="text-center text-sm text-slate-500">
        {mode === "signin" ? "아직 계정이 없나요?" : "이미 계정이 있나요?"}{" "}
        <button
          onClick={() => {
            setMode(mode === "signin" ? "signup" : "signin");
            setError(null);
            setNotice(null);
          }}
          className="font-semibold text-slate-900 underline-offset-4 hover:underline"
        >
          {mode === "signin" ? "회원가입" : "로그인"}
        </button>
      </p>
    </div>
  );
}
