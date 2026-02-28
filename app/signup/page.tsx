"use client";

import { useState, FormEvent } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

// ── Shared input style ────────────────────────────────────────────────────────
const inputBase =
  "bg-white border border-black/10 h-14 rounded-lg px-6 w-full text-[#1a1a1a] text-base font-medium leading-6 tracking-[-0.32px] placeholder:text-[#8d9889] outline-none focus:border-[#238859] transition-colors duration-150";

export default function SignupPage() {
  const router = useRouter();

  const [form, setForm] = useState({ name: "", email: "", phone: "" });
  const [errors, setErrors] = useState<{ name?: string; email?: string; phone?: string }>({});
  const [serverError, setServerError] = useState("");
  const [loading, setLoading] = useState(false);

  function update(field: keyof typeof form) {
    return (e: React.ChangeEvent<HTMLInputElement>) => {
      setForm((prev) => ({ ...prev, [field]: e.target.value }));
      setErrors((prev) => ({ ...prev, [field]: "" }));
    };
  }

  function validate(): boolean {
    const newErrors: typeof errors = {};

    if (!form.name.trim()) {
      newErrors.name = "Full name is required.";
    }
    if (!form.email.trim()) {
      newErrors.email = "Email is required.";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      newErrors.email = "Please enter a valid email address.";
    }
    if (!form.phone.trim()) {
      newErrors.phone = "Phone number is required.";
    } else if (!/^[+]?[\d\s\-().]{7,15}$/.test(form.phone.trim())) {
      newErrors.phone = "Please enter a valid phone number.";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
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
        body: JSON.stringify({
          email:    form.email.trim(),
          fullName: form.name.trim(),
          phone:    form.phone.trim(),
        }),
      });
      const data = await res.json();

      if (!res.ok) {
        setServerError(data.error ?? "Something went wrong.");
        return;
      }

      // Pass email + name via URL so /verify can show personalised greeting
      router.push(
        `/verify?email=${encodeURIComponent(form.email.trim())}&name=${encodeURIComponent(form.name.trim())}&phone=${encodeURIComponent(form.phone.trim())}`
      );
    } catch {
      setServerError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  const isFilled = form.name.trim() && form.email.trim() && form.phone.trim();

  return (
    <div className="min-h-screen bg-[#ebffe0] flex items-center justify-center px-4 py-8">
      {/* ── Card with outline ── */}
      <div className="w-full max-w-sm bg-[#ebffe0] rounded-[32px] border border-black/10 overflow-hidden flex flex-col shadow-sm">

        {/* Hero image */}
        <div className="relative w-full aspect-[610/340] rounded-t-[32px] overflow-hidden shrink-0">
          <img
            src="https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=800&auto=format&fit=crop"
            alt="A couple relaxing in a cosy living room"
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
              Let&apos;s find your next home
            </h1>
            <p
              className="text-[#1a1a1a] text-base font-medium leading-6 tracking-[-0.32px]"
              style={{ fontFeatureSettings: "'dlig'" }}
            >
              Sign up to explore listings, save favorites, and book visits
            </p>
          </div>

          {/* Form */}
          <form
            onSubmit={handleSubmit}
            noValidate
            className="flex flex-col gap-10"
          >
            <div className="flex flex-col gap-10">
              {/* Full Name */}
              <div className="flex flex-col gap-3 w-full">
                <label className="text-[#8d9889] text-xs font-medium leading-3 tracking-[-0.24px]">
                  Full Name
                </label>
                <input
                  type="text"
                  placeholder="Enter your full name"
                  value={form.name}
                  onChange={update("name")}
                  className={inputBase}
                  autoComplete="name"
                />
                {errors.name && (
                  <p className="text-red-500 text-xs">{errors.name}</p>
                )}
              </div>

              {/* Email */}
              <div className="flex flex-col gap-3 w-full">
                <label className="text-[#8d9889] text-xs font-medium leading-3 tracking-[-0.24px]">
                  Email Address
                </label>
                <input
                  type="email"
                  placeholder="Enter your email address"
                  value={form.email}
                  onChange={update("email")}
                  className={inputBase}
                  autoComplete="email"
                />
                {errors.email && (
                  <p className="text-red-500 text-xs">{errors.email}</p>
                )}
              </div>

              {/* Phone Number */}
              <div className="flex flex-col gap-3 w-full">
                <label className="text-[#8d9889] text-xs font-medium leading-3 tracking-[-0.24px]">
                  Phone Number
                </label>
                <input
                  type="tel"
                  placeholder="Enter your phone number"
                  value={form.phone}
                  onChange={update("phone")}
                  className={inputBase}
                  autoComplete="tel"
                />
                {errors.phone && (
                  <p className="text-red-500 text-xs">{errors.phone}</p>
                )}
              </div>
            </div>

            {serverError && (
              <p className="text-red-500 text-sm text-center -mt-6">
                {serverError}
              </p>
            )}

            {/* Send OTP button */}
            <button
              type="submit"
              disabled={!isFilled || loading}
              className={`w-full h-14 flex items-center justify-center rounded-[20px] text-base font-medium transition-colors duration-200 ${
                isFilled && !loading
                  ? "bg-[#238859] text-white hover:bg-[#1d7049]"
                  : "bg-black/10 text-[#8d9889] cursor-not-allowed"
              }`}
            >
              {loading ? "Sending code…" : "Continue"}
            </button>

            {/* Divider */}
            <div className="border-t border-black/10" />

            {/* Login link */}
            <p className="text-base font-medium text-center">
              <span className="text-[#1a1a1a]">Already have a Helium Account? </span>
              <Link
                href="/login"
                className="text-[#238859] hover:underline"
              >
                Log in
              </Link>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}
