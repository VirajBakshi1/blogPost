"use client";

import { useState, FormEvent } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

// ── Shared input style ────────────────────────────────────────────────────────
const inputBase =
  "bg-white border border-black/10 h-14 rounded-lg px-6 w-full text-[#1a1a1a] text-base font-medium leading-6 tracking-[-0.32px] placeholder:text-[#8d9889] outline-none focus:border-[#238859] transition-colors duration-150";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [serverError, setServerError] = useState("");
  const [loading, setLoading] = useState(false);

  function validate(): boolean {
    if (!email.trim()) {
      setError("Email is required.");
      return false;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError("Please enter a valid email address.");
      return false;
    }
    setError("");
    return true;
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setServerError("");
    if (!validate()) return;

    setLoading(true);
    try {
      const res = await fetch("/api/auth/send-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim() }),
      });
      const data = await res.json();

      if (!res.ok) {
        setServerError(data.error ?? "Something went wrong.");
        return;
      }

      // Pass email via URL so /verify can read it
      router.push(
        `/verify?email=${encodeURIComponent(email.trim())}`
      );
    } catch {
      setServerError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-[#ebffe0] flex items-center justify-center px-4 py-8">
      {/* ── Card with outline ── */}
      <div className="w-full max-w-sm bg-[#ebffe0] rounded-[32px] border border-black/10 overflow-hidden flex flex-col shadow-sm">

        {/* Hero image */}
        <div className="relative w-full aspect-[610/340] rounded-t-[32px] overflow-hidden shrink-0">
          <img
            src="https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800&auto=format&fit=crop"
            alt="A bright and airy home interior"
            className="absolute inset-0 w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-black/20" />
        </div>

        {/* Form area */}
        <div className="flex flex-col gap-10 px-12 py-[60px]">

          {/* Headline */}
          <div className="flex flex-col gap-2">
            <h1
              className="text-[#1a1a1a] text-2xl font-medium leading-8 tracking-[-0.48px]"
              style={{ fontFeatureSettings: "'ss01'" }}
            >
              Welcome Back!
            </h1>
            <p
              className="text-[#1a1a1a] text-base font-medium leading-6 tracking-[-0.32px]"
              style={{ fontFeatureSettings: "'dlig'" }}
            >
              Log in to your account
            </p>
          </div>

          {/* Fields */}
          <form
            onSubmit={handleSubmit}
            noValidate
            className="flex flex-col gap-10"
          >
            <div className="flex flex-col gap-3 w-full">
              <label className="text-[#8d9889] text-xs font-medium leading-3 tracking-[-0.24px]">
                Email Address
              </label>
              <input
                type="email"
                placeholder="Enter your email address"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  setError("");
                }}
                className={inputBase}
                autoComplete="email"
              />
              {error && (
                <p className="text-red-500 text-xs">{error}</p>
              )}
            </div>

            {serverError && (
              <p className="text-red-500 text-sm text-center -mt-6">
                {serverError}
              </p>
            )}

            {/* Send OTP button */}
            <button
              type="submit"
              disabled={!email.trim() || loading}
              className={`w-full h-14 flex items-center justify-center rounded-[20px] text-base font-medium transition-colors duration-200 ${
                email.trim() && !loading
                  ? "bg-[#238859] text-white hover:bg-[#1d7049]"
                  : "bg-black/10 text-[#5f665c] cursor-not-allowed"
              }`}
            >
              {loading ? "Sending code…" : "Continue"}
            </button>

            {/* Divider */}
            <div className="border-t border-black/10" />

            {/* Create account link */}
            <p className="text-base font-medium text-center">
              <span className="text-[#1a1a1a]">New to Helium? </span>
              <Link
                href="/signup"
                className="text-[#238859] hover:underline"
              >
                Create a new Account
              </Link>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}
