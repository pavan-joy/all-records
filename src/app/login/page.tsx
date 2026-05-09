"use client";

import { Eye, EyeOff, Lock, Mail } from "lucide-react";
import Image from "next/image";
import { useState } from "react";
import FormPrimaryButton from "@/components/FormPrimaryButton";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("admin@example.com");
  const [password, setPassword] = useState("Admin@12345");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);

  const onSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setLoading(true);
    const response = await signIn("credentials", { email, password, redirect: false });
    setLoading(false);

    if (response?.error) {
      toast.error("Invalid credentials");
      return;
    }

    toast.success("Login successful");
    router.push("/dashboard");
  };

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#eceff7] p-4 md:p-8">
      <div className="relative w-full max-w-5xl overflow-hidden rounded-[2rem] border border-indigo-100 bg-white shadow-[0_25px_65px_rgba(76,81,191,0.25)]">
        <div className="grid md:grid-cols-2">
          <form onSubmit={onSubmit} className="z-10 px-8 py-10 md:px-12 md:py-12">
            <div className="mb-4 flex items-center gap-3">
              <Image src="/login-logo.png" alt="Portal logo" width={46} height={46} className="rounded-md" priority />
              <p className="text-sm font-semibold tracking-wide text-violet-600">IT ASSET PORTAL</p>
            </div>
            <h1 className="text-4xl font-bold tracking-tight text-slate-800">Hello!</h1>
            <p className="mt-1 text-slate-500">Sign in to your account</p>

            <div className="mt-8 space-y-4">
              <label className="relative block">
                <Mail className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-violet-500" />
                <input
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  className="w-full rounded-full border border-indigo-100 bg-[#f8f9ff] py-3 pl-11 pr-4 text-sm text-slate-700 shadow-[0_10px_25px_rgba(99,102,241,0.12)] outline-none transition focus:border-violet-300 focus:shadow-[0_12px_28px_rgba(124,58,237,0.2)]"
                  type="email"
                  placeholder="E-mail"
                  required
                />
              </label>

              <label className="relative block">
                <Lock className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-violet-500" />
                <input
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  className="w-full rounded-full border border-indigo-100 bg-[#f8f9ff] py-3 pl-11 pr-12 text-sm text-slate-700 shadow-[0_10px_25px_rgba(99,102,241,0.12)] outline-none transition focus:border-violet-300 focus:shadow-[0_12px_28px_rgba(124,58,237,0.2)]"
                  type={showPassword ? "text" : "password"}
                  placeholder="Password"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((prev) => !prev)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full p-1 text-violet-500 transition hover:bg-violet-100"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </label>
            </div>

            <div className="mt-3 flex items-center justify-between text-xs text-indigo-400">
              <label className="inline-flex cursor-pointer items-center gap-2">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(event) => setRememberMe(event.target.checked)}
                  className="h-3.5 w-3.5 rounded border-indigo-300 text-violet-600 focus:ring-violet-300"
                />
                Remember me
              </label>
            </div>

            <FormPrimaryButton
              variant="pill"
              disabled={loading}
              className="mt-6 w-full justify-center py-3 text-sm font-semibold tracking-wide disabled:cursor-not-allowed"
            >
              {loading ? "SIGNING IN..." : "SIGN IN"}
            </FormPrimaryButton>

            <p className="mt-8 text-center text-sm font-semibold tracking-wide text-violet-600">IT ADMINS ONLY</p>
          </form>

          <div className="relative hidden min-h-[560px] overflow-hidden md:block">
            <div className="absolute inset-0 bg-gradient-to-br from-[#6d28d9] via-[#4f46e5] to-[#2563eb]" />
            <div className="absolute -top-24 left-[-5%] h-64 w-[120%] rounded-[50%] bg-white" />
            <div className="absolute -bottom-20 left-[-15%] h-56 w-[135%] rounded-[55%] bg-white/95" />
            <div className="absolute right-12 top-1/2 max-w-xs -translate-y-1/2 text-white">
              <h2 className="text-4xl font-bold">Welcome Back!</h2>
              <p className="mt-4 text-sm leading-7 text-indigo-100">
                Access your IT asset, subscription, vendor, and server operations dashboard securely.
              </p>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
