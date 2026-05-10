"use client";

import Image from "next/image";
import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import styles from "./login.module.css";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [totpCode, setTotpCode] = useState("");
  const [loginPhase, setLoginPhase] = useState<"password" | "totp">("password");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);

  const onSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setLoading(true);

    try {
      if (loginPhase === "password") {
        const precheck = await fetch("/api/auth/login-precheck", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, password }),
        });
        const payload = await precheck.json().catch(() => ({}));
        if (!precheck.ok || !payload.ok) {
          toast.error(typeof payload.message === "string" ? payload.message : "Invalid credentials");
          return;
        }

        if (payload.requiresTwoFactor) {
          setLoginPhase("totp");
          setTotpCode("");
          toast.success("Enter the 6-digit code from your authenticator app.");
          return;
        }

        const response = await signIn("credentials", { email, password, redirect: false });
        if (response?.error) {
          toast.error("Invalid credentials");
          return;
        }
        toast.success("Login successful");
        router.push("/dashboard");
        return;
      }

      const normalizedTotp = totpCode.trim().replace(/\s/g, "");
      if (!/^\d{6}$/.test(normalizedTotp)) {
        toast.error("Enter the 6-digit authenticator code.");
        return;
      }

      const response = await signIn("credentials", {
        email,
        password,
        totp: normalizedTotp,
        redirect: false,
      });
      if (response?.error) {
        toast.error("Invalid credentials or authenticator code.");
        return;
      }
      toast.success("Login successful");
      router.push("/dashboard");
    } finally {
      setLoading(false);
    }
  };

  const inputClass = `${styles.inputLine} w-full rounded-xl border border-slate-200/90 bg-white px-4 py-3.5 text-sm text-slate-800 placeholder:text-slate-400`;

  return (
    <>
      <div className={styles.pageBackdrop} aria-hidden>
        <div className={styles.pageBackdropBase} />
        <div className={styles.pageBackdropOrbs}>
          <div className={`${styles.orb} ${styles.orbGold}`} />
          <div className={`${styles.orb} ${styles.orbSilver}`} />
          <div className={`${styles.orb} ${styles.orbViolet}`} />
        </div>
        <div className={styles.pageBackdropMesh} />
        <div className={styles.pageBackdropSheen} />
        <div className={styles.pageBackdropVignette} />
      </div>
      <main className="relative z-10 flex min-h-screen items-center justify-center overflow-x-hidden px-4 py-10 md:px-8 md:py-14">
        <div className={`${styles.outerCard} w-full max-w-[960px] overflow-hidden rounded-[2rem] bg-white/95 shadow-[0_28px_80px_-16px_rgba(2,6,23,0.65)] ring-1 ring-white/10 backdrop-blur-sm`}>
        <div className="grid md:grid-cols-2 md:min-h-[560px]">
          {/* Left — welcome */}
          <section className={`relative flex flex-col justify-center overflow-hidden px-8 py-12 md:px-12 md:py-16 ${styles.welcomePanel}`}>
            <div className={`${styles.blob} ${styles.blob1}`} aria-hidden />
            <div className={`${styles.blob} ${styles.blob2}`} aria-hidden />
            <div className={`${styles.blob} ${styles.blob3}`} aria-hidden />
            <div className={`${styles.blob} ${styles.blob4}`} aria-hidden />

            <div className="relative z-[1] mb-6">
              <div className={styles.brandLogoShellWelcome}>
                <Image
                  src="/login-brand-logo.png"
                  alt=""
                  width={256}
                  height={256}
                  className={styles.brandLogoImgWelcome}
                  priority
                  sizes="76px"
                />
              </div>
            </div>

            <div className={`relative z-[1] ${styles.staggerWelcome}`}>
              <p className="text-3xl font-bold uppercase tracking-[0.15em] text-white drop-shadow-sm md:text-4xl">
                Welcome
              </p>
              <p className="mt-4 text-xs font-semibold uppercase tracking-[0.35em] text-white/95 md:text-sm">
                IT Asset Portal
              </p>
              <p className="mt-8 max-w-md text-sm leading-relaxed text-white/85">
                Manage subscriptions, vendors, renewals, and server inventory in one secure workspace. Sign in to access
                dashboards built for IT operations teams.
              </p>
            </div>
          </section>

          {/* Right — nested white form */}
          <section className={`relative flex flex-col items-center justify-center px-6 py-10 md:px-10 md:py-14 ${styles.formColumn}`}>
            <div className={`relative z-[1] w-full max-w-[400px] rounded-2xl bg-white p-8 shadow-[0_20px_50px_-12px_rgba(15,23,42,0.28)] md:p-10 ${styles.formCard}`}>
              <div className={styles.staggerForm}>
                <div>
                  <div className={styles.brandLogoShellForm}>
                    <Image
                      src="/login-brand-logo.png"
                      alt=""
                      width={256}
                      height={256}
                      className={styles.brandLogoImgForm}
                      sizes="56px"
                    />
                  </div>
                  <h2 className="text-center text-2xl font-bold tracking-tight text-blue-950">Sign in</h2>
                  <p className="mt-2 text-center text-sm text-slate-500">
                    Use your admin credentials to access the portal.
                  </p>
                </div>

                <form onSubmit={onSubmit} className="mt-8 space-y-5">
                  {loginPhase === "password" ? (
                    <>
                      <div className={styles.inputWrap}>
                        <label htmlFor="login-email" className="sr-only">
                          User name
                        </label>
                        <input
                          id="login-email"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          className={inputClass}
                          type="email"
                          autoComplete="username"
                          placeholder="User Name"
                          required
                        />
                      </div>

                      <div className={`${styles.inputWrap} space-y-2`}>
                        <label htmlFor="login-password" className="sr-only">
                          Password
                        </label>
                        <div className="relative">
                          <input
                            id="login-password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className={`${inputClass} pr-[5.5rem]`}
                            type={showPassword ? "text" : "password"}
                            autoComplete="current-password"
                            placeholder="Password"
                            required
                          />
                          <button
                            type="button"
                            onClick={() => setShowPassword((v) => !v)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold uppercase tracking-wide text-blue-600 transition hover:text-blue-800"
                          >
                            {showPassword ? "Hide" : "Show"}
                          </button>
                        </div>
                      </div>

                      <div className="flex flex-wrap items-center justify-between gap-3 text-sm">
                        <label className="flex cursor-pointer items-center gap-2 text-slate-600 select-none transition hover:text-slate-800">
                          <input
                            type="checkbox"
                            checked={rememberMe}
                            onChange={(e) => setRememberMe(e.target.checked)}
                            className="h-4 w-4 rounded border-slate-300 text-blue-600 transition hover:scale-110 focus:ring-blue-500"
                          />
                          Remember me
                        </label>
                        <button
                          type="button"
                          className={`${styles.linkBlue} text-sm font-medium text-blue-600 hover:underline`}
                          onClick={() => toast("Contact your administrator to reset your password.")}
                        >
                          Forgot Password?
                        </button>
                      </div>
                    </>
                  ) : (
                    <>
                      <p className="text-center text-sm text-slate-600">
                        Two-factor authentication is enabled for{" "}
                        <span className="font-medium text-slate-800">{email}</span>.
                      </p>
                      <div className={styles.inputWrap}>
                        <label htmlFor="login-totp" className="sr-only">
                          Authenticator code
                        </label>
                        <input
                          id="login-totp"
                          value={totpCode}
                          onChange={(e) => setTotpCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
                          className={`${inputClass} text-center font-mono text-lg tracking-[0.35em]`}
                          type="text"
                          inputMode="numeric"
                          autoComplete="one-time-code"
                          placeholder="000000"
                          autoFocus
                          required
                          maxLength={6}
                        />
                      </div>
                      <button
                        type="button"
                        className="w-full text-center text-sm font-medium text-blue-600 underline-offset-2 hover:underline"
                        onClick={() => {
                          setLoginPhase("password");
                          setTotpCode("");
                        }}
                      >
                        ← Back to password
                      </button>
                    </>
                  )}

                  <button
                    type="submit"
                    disabled={loading}
                    className={`${styles.btnSignIn} relative z-[1] flex w-full items-center justify-center rounded-xl py-3.5 text-sm font-bold text-white shadow-lg shadow-blue-600/30 disabled:cursor-not-allowed disabled:opacity-60`}
                  >
                    <span className="relative z-[2] flex items-center justify-center">
                      {loading ? (
                        <>
                          <span className={styles.loader} aria-hidden />
                          Signing in…
                        </>
                      ) : loginPhase === "password" ? (
                        "Continue"
                      ) : (
                        "Verify & sign in"
                      )}
                    </span>
                  </button>
                </form>

                <p className="mt-8 text-center text-sm text-slate-600">
                  Don&apos;t have an account?{" "}
                  <button
                    type="button"
                    className={`${styles.linkBlue} font-semibold text-blue-600 hover:underline`}
                    onClick={() => toast("Administrator accounts are provisioned by IT.")}
                  >
                    Sign Up
                  </button>
                </p>
              </div>
            </div>
          </section>
        </div>
        </div>
      </main>
    </>
  );
}
