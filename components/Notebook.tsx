"use client";

import Link from "next/link";
import { useState } from "react";
import { useNotebook } from "@/lib/notebook";

export default function Notebook() {
  const { words, remove } = useNotebook();
  const [hideKo, setHideKo] = useState(false);

  return (
    <div className="flex w-full max-w-xl flex-col gap-6">
      <div className="flex items-center justify-between">
        <Link href="/" className="text-sm text-slate-500 hover:text-slate-800">
          ← 퀴즈로
        </Link>
        {words.length > 0 && (
          <button
            onClick={() => setHideKo((v) => !v)}
            className="rounded-full border border-slate-300 px-4 py-1.5 text-sm font-medium text-slate-700 transition hover:bg-white"
          >
            {hideKo ? "뜻 보이기" : "뜻 가리기"}
          </button>
        )}
      </div>

      <h1 className="text-3xl font-bold text-slate-900">
        📒 단어 암기장 <span className="text-lg font-medium text-slate-400">{words.length}개</span>
      </h1>

      {words.length === 0 ? (
        <p className="rounded-2xl bg-white px-6 py-12 text-center text-slate-500 shadow-sm">
          저장된 단어가 없어요.
          <br />
          퀴즈를 마친 뒤 틀린 단어를 저장해 보세요.
        </p>
      ) : (
        <ul className="grid gap-2">
          {words.map((word) => (
            <li key={word.en} className="group flex items-center gap-4 rounded-xl bg-white px-5 py-4 shadow-sm">
              <div className="flex-1">
                <p className="text-lg font-semibold text-slate-900">{word.en}</p>
                <p className={`text-slate-600 transition ${hideKo ? "blur-sm select-none hover:blur-none" : ""}`}>
                  {word.ko}
                </p>
                <p className="mt-1 text-sm italic text-slate-400">{word.example}</p>
              </div>
              <button
                onClick={() => remove(word.en)}
                className="rounded-md px-2 py-1 text-sm text-slate-400 transition hover:bg-rose-50 hover:text-rose-600"
                aria-label={`${word.en} 삭제`}
              >
                삭제
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
