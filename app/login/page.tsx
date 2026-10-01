import type { Metadata } from "next";
import LoginForm from "@/components/LoginForm";

export const metadata: Metadata = {
  title: "로그인 | 토익 영단어 퀴즈",
};

export default function LoginPage() {
  return (
    <main className="flex flex-1 items-start justify-center px-4 pt-4 pb-12">
      <LoginForm />
    </main>
  );
}
