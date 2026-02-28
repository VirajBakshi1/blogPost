"use client";

import { useState, useRef, KeyboardEvent, ClipboardEvent, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";

// ── OTP Verification logic ────────────────────────────────────────────────────

function VerifyForm() {
  const router = useRouter();
  const params = useSearchParams();

  const email = params.get("email") ?? "";
  const name  = params.get("name")  ?? "";       // present for signup flow
  const phone = params.get("phone") ?? "";       // present for signup flow
  const firstName = name ? name.split(" ")[0] : "";

  const [digits, setDigits] = useState<string[]>(Array(6).fill(""));
  const [serverError, setServerError] = useState("");
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [resendMsg, setResendMsg] = useState("");

  const inputRefs = useRef<Array<HTMLInputElement | null>>([]);

  // ── Focus helpers ─────────────────────────────────────────────────────────
  function focusNext(index: number) {
    if (index < 5) inputRefs.current[index + 1]?.focus();
  }
  function focusPrev(index: number) {
    if (index > 0) inputRefs.current[index - 1]?.focus();
  }

  function handleInput(index: number, value: string) {
    // Accept only one digit
    const digit = value.replace(/\D/g, "").slice(-1);
    const next = [...digits];
    next[index] = digit;
    setDigits(next);
    setServerError("");
    if (digit) focusNext(index);
  }

  function handleKeyDown(index: number, e: KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Backspace") {
      if (digits[index]) {
        // Clear current
        const next = [...digits];
        next[index] = "";
        setDigits(next);
      } else {
        // Move to previous
        focusPrev(index);
      }
    }
    if (e.key === "ArrowLeft") focusPrev(index);
    if (e.key === "ArrowRight") focusNext(index);
  }

  function handlePaste(e: ClipboardEvent<HTMLInputElement>) {
    e.preventDefault();
    const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
    if (!pasted) return;
    const next = Array(6).fill("");
    pasted.split("").forEach((ch, i) => { next[i] = ch; });
    setDigits(next);
    // Focus last filled box or the one after
    const lastIdx = Math.min(pasted.length, 5);
    inputRefs.current[lastIdx]?.focus();
  }

  // ── Submit ────────────────────────────────────────────────────────────────
  async function handleVerify() {
    setServerError("");
    const otp = digits.join("");
    if (otp.length < 6) {
      setServerError("Please enter all 6 digits.");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/auth/verify-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        // fullName + phone are stored server-side in the OTP record
        body: JSON.stringify({ email, otp }),
      });
      const data = await res.json();

      if (!res.ok) {
        setServerError(data.error ?? "Verification failed.");
        return;
      }

      // Redirect to admin panel or user dashboard based on role
      router.push(data.role === "admin" ? "/admin" : "/dashboard");
    } catch {
      setServerError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  // ── Resend ────────────────────────────────────────────────────────────────
  async function handleResend() {
    setResendMsg("");
    setServerError("");
    setResending(true);
    try {
      const res = await fetch("/api/auth/send-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        // Re-attach fullName + phone so the new OTP doc can recreate the user if needed
        body: JSON.stringify({
          email,
          ...(name  ? { fullName: name  } : {}),
          ...(phone ? { phone:    phone } : {}),
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setServerError(data.error ?? "Failed to resend.");
      } else {
        setResendMsg("A new code has been sent!");
        setDigits(Array(6).fill(""));
        inputRefs.current[0]?.focus();
      }
    } catch {
      setServerError("Network error. Please try again.");
    } finally {
      setResending(false);
    }
  }

  const isComplete = digits.every(Boolean);

  return (
    <div className="min-h-screen bg-[#ebffe0] flex items-center justify-center px-4 py-8">
      {/* ── Card with outline ── */}
      <div className="w-full max-w-sm bg-[#ebffe0] rounded-[32px] border border-black/10 overflow-hidden flex flex-col shadow-sm">

        {/* Hero image */}
        <div className="relative w-full aspect-[610/340] rounded-t-[32px] overflow-hidden shrink-0">
          <img
            src="https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=800&auto=format&fit=crop"
            alt="A cosy home interior"
            className="absolute inset-0 w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-black/20" />
        </div>

        {/* Content area */}
        <div className="flex flex-col gap-[60px] px-12 py-[60px]">

          {/* Headline */}
          <div className="flex flex-col gap-2">
            <h1
              className="text-[#1a1a1a] text-2xl font-medium leading-8 tracking-[-0.48px]"
              style={{ fontFeatureSettings: "'ss01'" }}
            >
              {firstName ? `Almost there, ${firstName}` : "Almost there"}
            </h1>
            <p
              className="text-[#1a1a1a] text-base font-medium leading-6 tracking-[-0.32px]"
              style={{ fontFeatureSettings: "'dlig'" }}
            >
              Verify your account with the code sent to{" "}
              <span className="text-[#238859]">{email}</span>
            </p>
          </div>

          {/* OTP input */}
          <div className="flex flex-col gap-3 w-full">
            <label className="text-[#8d9889] text-xs font-medium leading-3 tracking-[-0.24px]">
              Enter 6-digit code
            </label>
            <div className="flex gap-[10px] items-center w-full">
              {digits.map((digit, i) => (
                <input
                  key={i}
                  ref={(el) => { inputRefs.current[i] = el; }}
                  type="text"
                  inputMode="numeric"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => handleInput(i, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(i, e)}
                  onPaste={handlePaste}
                  onFocus={(e) => e.target.select()}
                  className={`
                    flex-1 aspect-square min-w-0
                    bg-white rounded-lg
                    border text-center text-[#1a1a1a] text-xl font-semibold leading-none
                    outline-none transition-colors duration-150 caret-transparent
                    ${digit
                      ? "border-[#238859]"
                      : serverError
                        ? "border-red-400"
                        : "border-black/10 focus:border-[#238859]"
                    }
                  `}
                  autoFocus={i === 0}
                  autoComplete="one-time-code"
                />
              ))}
            </div>
            {serverError && (
              <p className="text-red-500 text-xs mt-1">{serverError}</p>
            )}
            {resendMsg && (
              <p className="text-[#238859] text-xs mt-1">{resendMsg}</p>
            )}
          </div>

          {/* Resend code */}
          <p className="text-[#1a1a1a] text-base font-medium -mt-[36px]">
            Didn&apos;t receive code?{" "}
            <button
              type="button"
              onClick={handleResend}
              disabled={resending}
              className="text-[#238859] font-semibold hover:underline disabled:opacity-60"
            >
              {resending ? "Sending…" : "Resend Code"}
            </button>
          </p>

          {/* Verify button */}
          <button
            type="button"
            onClick={handleVerify}
            disabled={!isComplete || loading}
            className={`w-full h-14 flex items-center justify-center rounded-[20px] text-base font-medium transition-colors duration-200 ${
              isComplete && !loading
                ? "bg-[#238859] text-white hover:bg-[#1d7049]"
                : "bg-black/10 text-[#8d9889] cursor-not-allowed"
            }`}
          >
            {loading ? "Verifying…" : "Login"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Suspense wrapper (required for useSearchParams) ───────────────────────────

export default function VerifyPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#ebffe0] flex items-center justify-center">
          <p className="text-[#5f665c] text-base font-medium">Loading…</p>
        </div>
      }
    >
      <VerifyForm />
    </Suspense>
  );
}
