"use client";

import React, { useState, useEffect, Suspense } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { User, Lock, Eye, EyeOff, ArrowLeft, ShieldCheck, AlertCircle, Loader2, Sparkles } from "lucide-react";
import { authService } from "@/lib/auth/authService";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const returnUrl = searchParams.get("returnUrl") || "/admin";

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [forgotMsg, setForgotMsg] = useState("");

  // Check if already authenticated
  useEffect(() => {
    authService.isAuthenticated().then((authed) => {
      if (authed) {
        router.replace(returnUrl);
      }
    });
  }, [router, returnUrl]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");
    setForgotMsg("");

    if (!username.trim()) {
      setErrorMsg("Please enter your username or email.");
      return;
    }
    if (!password) {
      setErrorMsg("Please enter your password.");
      return;
    }

    setIsLoading(true);
    try {
      const res = await authService.login({
        username: username.trim(),
        password,
        rememberMe,
      });

      if (res.success) {
        router.push(returnUrl);
      } else {
        setErrorMsg(res.error || "Invalid username or password. Please try again.");
      }
    } catch {
      setErrorMsg("An unexpected error occurred during login. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleForgotPassword = async (e: React.MouseEvent) => {
    e.preventDefault();
    if (!username.trim()) {
      setErrorMsg("Please enter your username above to reset password.");
      return;
    }
    setErrorMsg("");
    setForgotMsg("Checking password reset options...");
    const res = await authService.forgotPassword(username.trim());
    setForgotMsg(res.message);
  };

  return (
    <div className="min-h-screen bg-[#FAF7F3] flex flex-col justify-between selection:bg-[#C5A47E]/25 selection:text-[#231610]">
      {/* Top Bar with Back Link */}
      <div className="max-w-[1280px] w-full mx-auto px-4 sm:px-6 pt-6 pb-2 flex items-center justify-between">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-xs sm:text-sm font-medium tracking-wide text-[#7A6F68] hover:text-[#9C5A2C] transition-colors py-1.5 px-2.5 rounded-lg hover:bg-[#F3ECE4]/80"
        >
          <ArrowLeft className="w-4 h-4 stroke-[1.5]" />
          <span>Back to Insha Collections</span>
        </Link>
        <div className="flex items-center gap-1.5 text-xs text-[#8C7E75] font-serif-luxury tracking-widest uppercase">
          <ShieldCheck className="w-4 h-4 text-[#B89366]" />
          <span>Admin Portal</span>
        </div>
      </div>

      {/* Main Login Card Container */}
      <div className="flex-1 flex items-center justify-center px-4 sm:px-6 py-8 sm:py-12">
        <div className="w-full max-w-[440px] bg-[#FAF7F3] sm:bg-[#FFFDFB] sm:border sm:border-[#EAE2D8] sm:shadow-[0_12px_40px_rgba(35,22,16,0.06)] rounded-2xl sm:rounded-3xl p-6 sm:p-10 relative overflow-hidden transition-all">
          
          {/* Subtle Royal Accent Corner Flourish */}
          <div className="absolute -top-12 -right-12 w-28 h-28 bg-[#C5A47E]/10 rounded-full blur-2xl pointer-events-none" />
          <div className="absolute -bottom-12 -left-12 w-28 h-28 bg-[#6A1A24]/5 rounded-full blur-2xl pointer-events-none" />

          {/* Brand Logo & Header */}
          <div className="flex flex-col items-center text-center mb-8">
            <Link href="/" className="inline-block group mb-4">
              <div className="relative w-[130px] sm:w-[150px] h-[80px] sm:h-[90px] transition-transform duration-300 group-hover:scale-105">
                <Image
                  src="/images/New-logo.jpeg"
                  alt="Insha Collections Logo"
                  fill
                  priority
                  className="object-contain mix-blend-multiply"
                  sizes="(max-width: 640px) 130px, 150px"
                />
              </div>
            </Link>

            <div className="flex items-center gap-2 mb-2">
              <div className="h-px w-6 bg-gradient-to-r from-transparent to-[#C5A47E]" />
              <Sparkles className="w-3.5 h-3.5 text-[#B89366]" />
              <div className="h-px w-6 bg-gradient-to-l from-transparent to-[#C5A47E]" />
            </div>

            <h1 className="font-serif-luxury text-2xl sm:text-[28px] font-semibold tracking-tight text-[#231610]">
              Welcome Back
            </h1>
            <p className="text-xs sm:text-sm text-[#7A6F68] mt-1.5 leading-relaxed max-w-[320px]">
              Login to manage your Insha Collections store.
            </p>
          </div>

          {/* Feedback Messages */}
          {errorMsg && (
            <div className="mb-6 p-3.5 rounded-xl bg-[#6A1A24]/10 border border-[#6A1A24]/20 flex items-start gap-3 text-[#6A1A24] text-xs sm:text-sm animate-fadeIn">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-[#6A1A24]" />
              <p className="leading-snug">{errorMsg}</p>
            </div>
          )}

          {forgotMsg && (
            <div className="mb-6 p-3.5 rounded-xl bg-[#B89366]/10 border border-[#B89366]/30 flex items-start gap-3 text-[#5A4325] text-xs sm:text-sm animate-fadeIn">
              <ShieldCheck className="w-4 h-4 shrink-0 mt-0.5 text-[#B89366]" />
              <p className="leading-snug">{forgotMsg}</p>
            </div>
          )}

          {/* Login Form */}
          <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-5">
            {/* Username Input */}
            <div className="space-y-1.5">
              <label
                htmlFor="username"
                className="block text-xs font-semibold text-[#231610] uppercase tracking-wider"
              >
                Username <span className="text-[#6A1A24]">*</span>
              </label>
              <div className="relative flex items-center">
                <div className="absolute left-3.5 text-[#8C7E75] pointer-events-none">
                  <User className="w-4 h-4 stroke-[1.6]" />
                </div>
                <input
                  id="username"
                  name="username"
                  type="text"
                  autoComplete="username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Enter store admin username"
                  className="w-full bg-[#FAF7F3] sm:bg-white text-[#231610] text-sm pl-10 pr-4 py-3 rounded-xl border border-[#EAE2D8] focus:border-[#B89366] focus:ring-2 focus:ring-[#C5A47E]/20 focus:outline-none transition-all placeholder:text-[#A89E96]"
                  disabled={isLoading}
                  required
                />
              </div>
            </div>

            {/* Password Input */}
            <div className="space-y-1.5">
              <label
                htmlFor="password"
                className="block text-xs font-semibold text-[#231610] uppercase tracking-wider"
              >
                Password <span className="text-[#6A1A24]">*</span>
              </label>
              <div className="relative flex items-center">
                <div className="absolute left-3.5 text-[#8C7E75] pointer-events-none">
                  <Lock className="w-4 h-4 stroke-[1.6]" />
                </div>
                <input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full bg-[#FAF7F3] sm:bg-white text-[#231610] text-sm pl-10 pr-11 py-3 rounded-xl border border-[#EAE2D8] focus:border-[#B89366] focus:ring-2 focus:ring-[#C5A47E]/20 focus:outline-none transition-all placeholder:text-[#A89E96]"
                  disabled={isLoading}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 text-[#8C7E75] hover:text-[#231610] p-1 transition-colors focus:outline-none cursor-pointer"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? (
                    <EyeOff className="w-4 h-4 stroke-[1.6]" />
                  ) : (
                    <Eye className="w-4 h-4 stroke-[1.6]" />
                  )}
                </button>
              </div>
            </div>

            {/* Options: Remember Me & Forgot Password */}
            <div className="flex items-center justify-between text-xs sm:text-xs pt-1">
              <label className="flex items-center gap-2 cursor-pointer select-none text-[#5A4E46]">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="w-4 h-4 rounded border-[#D8CEBE] text-[#9C5A2C] focus:ring-[#C5A47E] accent-[#9C5A2C] cursor-pointer"
                />
                <span>Remember me</span>
              </label>

              <button
                type="button"
                onClick={handleForgotPassword}
                className="text-[#9C5A2C] hover:text-[#6A1A24] font-medium transition-colors hover:underline cursor-pointer"
              >
                Forgot password?
              </button>
            </div>

            {/* Submit Button */}
            <div className="pt-2">
              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-gradient-to-r from-[#B89366] via-[#A67F4F] to-[#8C6332] hover:from-[#A88255] hover:via-[#966E3E] hover:to-[#7D5424] text-white text-xs sm:text-sm font-semibold tracking-[0.15em] uppercase py-3.5 px-6 rounded-xl shadow-md hover:shadow-lg transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed active:scale-[0.99]"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Authenticating...</span>
                  </>
                ) : (
                  <span>LOGIN</span>
                )}
              </button>
            </div>
          </form>

          {/* Footer Assistance */}
          <div className="mt-8 pt-6 border-t border-[#EAE2D8] text-center">
            <p className="text-xs text-[#7A6F68]">
              Need help?{" "}
              <a
                href="https://wa.me/919618648050?text=Hi%20Insha%20Collections%20Support,%20I%20need%20assistance%20with%20Admin%20Portal%20access."
                target="_blank"
                rel="noopener noreferrer"
                className="text-[#9C5A2C] font-semibold hover:underline"
              >
                Contact Support
              </a>
            </p>
          </div>
        </div>
      </div>

      {/* Bottom Footer Note */}
      <div className="py-4 text-center text-[11px] text-[#A89E96]">
        &copy; {new Date().getFullYear()} Insha Collections. All Rights Reserved. Protected Admin Access.
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#FAF7F3] flex items-center justify-center">
          <Loader2 className="w-8 h-8 text-[#B89366] animate-spin" />
        </div>
      }
    >
      <LoginForm />
    </Suspense>
  );
}
