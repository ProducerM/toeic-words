import type { Metadata } from "next";
import Notebook from "@/components/Notebook";

export const metadata: Metadata = {
  title: "단어 암기장 | 토익 영단어 퀴즈",
};

export default function NotebookPage() {
  return (
    <main className="flex flex-1 justify-center px-4 pt-4 pb-12">
      <Notebook />
    </main>
  );
}
