"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useNotebook } from "@/lib/notebook";
import { WORDS, type Word } from "@/lib/words";

const ROUND_SIZE = 20;
const CORRECT_DELAY_MS = 1300;
const REVEAL_DELAY_MS = 2600;

type Question = {
  word: Word;
  options: string[];
};

type Phase = "answering" | "correct" | "revealed";

type Miss = {
  word: Word;
  result: "second" | "missed";
};

type Stats = {
  first: number;
  second: number;
  missed: number;
};

function shuffle<T>(items: T[]): T[] {
  const arr = [...items];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

function buildRound(): Question[] {
  return shuffle(WORDS)
    .slice(0, ROUND_SIZE)
    .map((word) => {
      const distractors = shuffle(WORDS.filter((w) => w.en !== word.en))
        .slice(0, 3)
        .map((w) => w.en);
      return { word, options: shuffle([word.en, ...distractors]) };
    });
}

// 예문에서 정답 단어(활용형 포함)를 빈칸으로 가린다.
function blankExample(word: Word): string {
  const stem = word.en.slice(0, Math.max(3, word.en.length - 2)).toLowerCase();
  return word.example
    .split(" ")
    .map((token) => (token.toLowerCase().startsWith(stem) ? "_____" + token.replace(/^[A-Za-z]+/, "") : token))
    .join(" ");
}

function letterHint(en: string): string {
  return [en[0], ...Array(en.length - 1).fill("_")].join(" ");
}

function RedCircle() {
  return (
    <svg className="pointer-events-none absolute -inset-2 h-[calc(100%+1rem)] w-[calc(100%+1rem)]" viewBox="0 0 40 40" aria-hidden>
      <path
        className="red-circle"
        d="M 8 32 C 3 26, 3 14, 8 8 C 13 3, 27 3, 32 8 C 37 13, 37 26, 32 32 C 27 37, 13 37, 7 31"
        fill="none"
        stroke="#e11d48"
        strokeWidth="3"
        strokeLinecap="round"
        pathLength={1}
      />
    </svg>
  );
}

export default function Quiz() {
  const [round, setRound] = useState<Question[] | null>(null);
  const [index, setIndex] = useState(0);
  const [phase, setPhase] = useState<Phase>("answering");
  const [wrong, setWrong] = useState<string[]>([]);
  const [stats, setStats] = useState<Stats>({ first: 0, second: 0, missed: 0 });
  const [misses, setMisses] = useState<Miss[]>([]);
  const notebook = useNotebook();

  const question = round?.[index];
  const finished = round !== null && index >= round.length;

  function start() {
    setRound(buildRound());
    setIndex(0);
    setPhase("answering");
    setWrong([]);
    setStats({ first: 0, second: 0, missed: 0 });
    setMisses([]);
  }

  function next() {
    setIndex((i) => i + 1);
    setPhase("answering");
    setWrong([]);
  }

  useEffect(() => {
    if (phase === "answering") return;
    const timer = setTimeout(next, phase === "correct" ? CORRECT_DELAY_MS : REVEAL_DELAY_MS);
    return () => clearTimeout(timer);
  }, [phase, index]);

  function choose(option: string) {
    if (!question || phase !== "answering" || wrong.includes(option)) return;

    if (option === question.word.en) {
      setPhase("correct");
      if (wrong.length === 0) {
        setStats((s) => ({ ...s, first: s.first + 1 }));
      } else {
        setStats((s) => ({ ...s, second: s.second + 1 }));
        setMisses((m) => [...m, { word: question.word, result: "second" }]);
      }
      return;
    }

    setWrong((w) => [...w, option]);
    if (wrong.length >= 1) {
      setPhase("revealed");
      setStats((s) => ({ ...s, missed: s.missed + 1 }));
      setMisses((m) => [...m, { word: question.word, result: "missed" }]);
    }
  }

  if (round === null) {
    return (
      <div className="flex flex-col items-center gap-6 text-center">
        <p className="text-sm font-semibold tracking-widest text-rose-600">TOEIC VOCA</p>
        <h1 className="text-4xl font-bold text-slate-900">토익 영단어 퀴즈</h1>
        <button
          onClick={start}
          className="rounded-full bg-slate-900 px-8 py-3 font-semibold text-white transition hover:bg-slate-700"
        >
          시작하기 ({ROUND_SIZE}문제)
        </button>
        <Link href="/notebook" className="text-sm font-medium text-slate-600 underline-offset-4 hover:underline">
          📒 단어 암기장 ({notebook.words.length})
        </Link>
      </div>
    );
  }

  if (finished) {
    const total = round.length;
    return (
      <div className="flex flex-col items-center gap-6 text-center">
        <h2 className="text-3xl font-bold text-slate-900">라운드 완료!</h2>
        <p className="text-6xl font-bold text-rose-600">
          {stats.first + stats.second}
          <span className="text-2xl text-slate-400"> / {total}</span>
        </p>
        <ul className="grid w-full max-w-xs gap-2 text-left text-slate-700">
          <li className="flex justify-between rounded-lg bg-white px-4 py-2 shadow-sm">
            <span>한 번에 정답</span>
            <b>{stats.first}</b>
          </li>
          <li className="flex justify-between rounded-lg bg-white px-4 py-2 shadow-sm">
            <span>힌트 후 정답</span>
            <b>{stats.second}</b>
          </li>
          <li className="flex justify-between rounded-lg bg-white px-4 py-2 shadow-sm">
            <span>오답</span>
            <b>{stats.missed}</b>
          </li>
        </ul>

        {misses.length > 0 && (
          <section className="w-full max-w-md text-left">
            <div className="mb-3 flex items-center justify-between">
              <h3 className="text-lg font-bold text-slate-900">틀린 단어 ({misses.length})</h3>
              <button
                onClick={() => notebook.add(misses.map((m) => m.word))}
                disabled={misses.every((m) => notebook.has(m.word.en))}
                className="rounded-full border border-slate-300 px-4 py-1.5 text-sm font-medium text-slate-700 transition hover:bg-white disabled:cursor-default disabled:opacity-50"
              >
                모두 암기장에 저장
              </button>
            </div>
            <ul className="grid gap-2">
              {misses.map(({ word, result }) => {
                const saved = notebook.has(word.en);
                return (
                  <li key={word.en} className="flex items-center gap-3 rounded-lg bg-white px-4 py-3 shadow-sm">
                    <div className="flex-1">
                      <p className="font-semibold text-slate-900">{word.en}</p>
                      <p className="text-sm text-slate-500">{word.ko}</p>
                    </div>
                    <span
                      className={`rounded-full px-2 py-0.5 text-xs ${result === "missed" ? "bg-rose-50 text-rose-600" : "bg-amber-50 text-amber-700"}`}
                    >
                      {result === "missed" ? "오답" : "힌트 후 정답"}
                    </span>
                    <button
                      onClick={() => notebook.add([word])}
                      disabled={saved}
                      className="w-16 rounded-md bg-slate-900 px-2 py-1 text-xs font-medium text-white transition hover:bg-slate-700 disabled:bg-slate-200 disabled:text-slate-500"
                    >
                      {saved ? "저장됨" : "저장"}
                    </button>
                  </li>
                );
              })}
            </ul>
          </section>
        )}

        <div className="flex flex-wrap items-center justify-center gap-3">
          <button
            onClick={start}
            className="rounded-full bg-slate-900 px-8 py-3 font-semibold text-white transition hover:bg-slate-700"
          >
            다시 하기
          </button>
          <Link
            href="/notebook"
            className="rounded-full border border-slate-300 px-8 py-3 font-semibold text-slate-700 transition hover:bg-white"
          >
            📒 단어 암기장 ({notebook.words.length})
          </Link>
        </div>
      </div>
    );
  }

  const q = question!;
  const showHint = wrong.length >= 1 && phase !== "correct";

  return (
    <div className="flex w-full max-w-xl flex-col gap-6">
      <div className="flex items-center justify-between text-sm text-slate-500">
        <span>
          {index + 1} / {round.length}
        </span>
        <span>정답 {stats.first + stats.second}</span>
      </div>
      <div className="h-1.5 w-full overflow-hidden rounded-full bg-slate-200">
        <div
          className="h-full bg-rose-500 transition-all duration-500"
          style={{ width: `${(index / round.length) * 100}%` }}
        />
      </div>

      <div className="rounded-2xl bg-white px-6 py-10 text-center shadow-sm">
        <p className="mb-2 text-sm text-slate-400">다음 뜻의 영어 단어는?</p>
        <p className="text-3xl font-bold text-slate-900">{q.word.ko}</p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {q.options.map((option, i) => {
          const isAnswer = option === q.word.en;
          const isWrong = wrong.includes(option);
          const reveal = phase === "revealed" && isAnswer;
          let style = "border-slate-200 bg-white text-slate-800 hover:border-slate-400 hover:bg-slate-50";
          if (isWrong) style = "border-slate-200 bg-slate-100 text-slate-400 line-through";
          if (phase === "correct" && isAnswer) style = "border-rose-300 bg-rose-50 text-rose-700";
          if (reveal) style = "border-emerald-400 bg-emerald-50 text-emerald-700";

          return (
            <button
              key={option}
              onClick={() => choose(option)}
              disabled={phase !== "answering" || isWrong}
              className={`relative rounded-xl border-2 px-5 py-4 text-left text-lg font-medium transition ${style} disabled:cursor-default`}
            >
              <span className="relative mr-3 inline-flex h-6 w-6 items-center justify-center text-sm text-slate-400">
                {i + 1}
                {phase === "correct" && isAnswer && <RedCircle />}
              </span>
              {option}
            </button>
          );
        })}
      </div>

      <div className="min-h-24" aria-live="polite">
        {phase === "correct" && <p className="text-center text-lg font-semibold text-rose-600">정답입니다!</p>}
        {showHint && phase === "answering" && (
          <div className="rounded-xl border border-amber-200 bg-amber-50 px-5 py-4 text-amber-900">
            <p className="mb-1 font-semibold">💡 힌트</p>
            <p className="font-mono tracking-wider">
              {letterHint(q.word.en)} <span className="font-sans text-sm">({q.word.en.length}글자)</span>
            </p>
            <p className="mt-1 text-sm italic">{blankExample(q.word)}</p>
          </div>
        )}
        {phase === "revealed" && (
          <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-5 py-4 text-emerald-900">
            <p>
              정답은 <b className="text-lg">{q.word.en}</b> 입니다.
            </p>
            <p className="mt-1 text-sm italic">{q.word.example}</p>
          </div>
        )}
      </div>
    </div>
  );
}
