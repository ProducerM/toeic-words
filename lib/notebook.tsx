"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { useAuth } from "@/components/AuthProvider";
import { createLocalStore } from "@/lib/localStore";
import { supabase } from "@/lib/supabase";
import type { Word } from "@/lib/words";

// 로그아웃 상태에서는 브라우저에, 로그인 상태에서는 계정(Supabase)에 저장한다.
const localNotebook = createLocalStore<Word[]>("toeic-notebook", []);

type Notebook = {
  words: Word[];
  add: (items: Word[]) => void;
  remove: (en: string) => void;
  has: (en: string) => boolean;
};

const NotebookContext = createContext<Notebook | null>(null);

function mergeNew(current: Word[], items: Word[]) {
  return items.filter((w) => !current.some((c) => c.en === w.en));
}

export function NotebookProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const localWords = localNotebook.useValue();
  const [remote, setRemote] = useState<{ userId: string; words: Word[] } | null>(null);

  useEffect(() => {
    if (!user) return;
    let cancelled = false;

    (async () => {
      // 로그인 전에 저장해 둔 단어는 계정으로 옮긴다.
      const pending = localNotebook.get();
      if (pending.length > 0) {
        const { error } = await supabase
          .from("notebook_words")
          .upsert(pending, { onConflict: "user_id,en", ignoreDuplicates: true });
        if (!error) localNotebook.set([]);
      }
      const { data } = await supabase
        .from("notebook_words")
        .select("en, ko, example")
        .order("created_at", { ascending: false });
      if (!cancelled) setRemote({ userId: user.id, words: data ?? [] });
    })();

    return () => {
      cancelled = true;
    };
  }, [user]);

  const remoteWords = user && remote?.userId === user.id ? remote.words : [];
  const words = user ? remoteWords : localWords;

  function add(items: Word[]) {
    const fresh = mergeNew(words, items);
    if (fresh.length === 0) return;
    if (!user) {
      localNotebook.set([...fresh, ...localNotebook.get()]);
      return;
    }
    setRemote((r) => r && { ...r, words: [...fresh, ...r.words] });
    supabase
      .from("notebook_words")
      .insert(fresh)
      .then(({ error }) => {
        if (error) setRemote((r) => r && { ...r, words: r.words.filter((w) => !fresh.includes(w)) });
      });
  }

  function remove(en: string) {
    if (!user) {
      localNotebook.set(localNotebook.get().filter((w) => w.en !== en));
      return;
    }
    const removed = words.find((w) => w.en === en);
    setRemote((r) => r && { ...r, words: r.words.filter((w) => w.en !== en) });
    supabase
      .from("notebook_words")
      .delete()
      .eq("en", en)
      .then(({ error }) => {
        if (error && removed) setRemote((r) => r && { ...r, words: [removed, ...r.words] });
      });
  }

  function has(en: string) {
    return words.some((w) => w.en === en);
  }

  return <NotebookContext.Provider value={{ words, add, remove, has }}>{children}</NotebookContext.Provider>;
}

export function useNotebook() {
  const ctx = useContext(NotebookContext);
  if (!ctx) throw new Error("useNotebook must be used inside NotebookProvider");
  return ctx;
}
