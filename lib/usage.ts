"use client";

import { createLocalStore } from "@/lib/localStore";

// 이 브라우저에서 퀴즈 라운드를 시작한 횟수
const usageStore = createLocalStore<number>("toeic-usage-count", 0);

export const useUsageCount = usageStore.useValue;

export function incrementUsage() {
  usageStore.set(usageStore.get() + 1);
}
