"use client";

import { useSyncExternalStore } from "react";
import type { Word } from "@/lib/words";

// 단어 암기장: 브라우저 localStorage에 저장한다.
const STORAGE_KEY = "toeic-notebook";
const EMPTY: Word[] = [];

const listeners = new Set<() => void>();
let cachedRaw: string | null = null;
let cachedWords: Word[] = EMPTY;

function read(): Word[] {
  let raw: string | null = null;
  try {
    raw = localStorage.getItem(STORAGE_KEY);
  } catch {
    return cachedWords;
  }
  if (raw !== cachedRaw) {
    cachedRaw = raw;
    try {
      cachedWords = raw ? (JSON.parse(raw) as Word[]) : EMPTY;
    } catch {
      cachedWords = EMPTY;
    }
  }
  return cachedWords;
}

function write(words: Word[]) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(words));
  } catch {
    cachedWords = words;
  }
  listeners.forEach((l) => l());
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  const onStorage = (e: StorageEvent) => e.key === STORAGE_KEY && listener();
  window.addEventListener("storage", onStorage);
  return () => {
    listeners.delete(listener);
    window.removeEventListener("storage", onStorage);
  };
}

export function useNotebook() {
  const words = useSyncExternalStore(subscribe, read, () => EMPTY);

  function add(items: Word[]) {
    const current = read();
    const fresh = items.filter((w) => !current.some((c) => c.en === w.en));
    if (fresh.length > 0) write([...fresh, ...current]);
  }

  function remove(en: string) {
    write(read().filter((w) => w.en !== en));
  }

  function has(en: string) {
    return words.some((w) => w.en === en);
  }

  return { words, add, remove, has };
}
