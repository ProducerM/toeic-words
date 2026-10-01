"use client";

import Link from "next/link";
import { useAuth } from "@/components/AuthProvider";
import { useNotebook } from "@/lib/notebook";
import { supabase } from "@/lib/supabase";
import { useUsageCount } from "@/lib/usage";

export default function Header() {
  const usage = useUsageCount();
  const { words } = useNotebook();
  const { user, loading } = useAuth();

  return (
    <header className="flex items-center justify-between gap-3 px-4 py-4 sm:px-8">
      <p className="rounded-full bg-white px-3 py-1.5 text-sm text-slate-600 shadow-sm">
        퀴즈 <b className="text-rose-600">{usage}</b>회
      </p>
      <nav className="flex items-center gap-2">
        <Link
          href="/notebook"
          className="rounded-full border border-slate-300 bg-white px-4 py-1.5 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
        >
          📒 단어장 <span className="text-slate-400">{words.length}</span>
        </Link>
        {loading ? null : user ? (
          <>
            <span className="hidden max-w-40 truncate text-sm text-slate-500 sm:inline" title={user.email}>
              {user.email}
            </span>
            <button
              onClick={() => supabase.auth.signOut()}
              className="rounded-full px-4 py-1.5 text-sm font-medium text-slate-600 transition hover:bg-white"
            >
              로그아웃
            </button>
          </>
        ) : (
          <Link
            href="/login"
            className="rounded-full bg-slate-900 px-4 py-1.5 text-sm font-medium text-white transition hover:bg-slate-700"
          >
            로그인
          </Link>
        )}
      </nav>
    </header>
  );
}
