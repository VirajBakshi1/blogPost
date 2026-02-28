import Link from "next/link";

export default function Home() {
  return (
    <main className="min-h-screen bg-[#ebffe0] flex flex-col items-center justify-center px-6">
      {/* Brand */}
      <div className="mb-12 text-center">
        <div className="inline-flex items-center justify-center gap-2 mb-6">
          <div className="w-10 h-10 bg-[#238859] rounded-full flex items-center justify-center">
            <svg width="20" height="20" viewBox="0 0 22 22" fill="none">
              <path d="M11 2L3 9V20H9V14H13V20H19V9L11 2Z" fill="white" />
            </svg>
          </div>
          <span className="text-[#1a1a1a] text-2xl font-semibold tracking-tight">
            Helium
          </span>
        </div>
        <h1 className="text-[#1a1a1a] text-[32px] font-semibold leading-[1.2] tracking-tight max-w-xs mx-auto">
          Find your next home
        </h1>
        <p className="mt-3 text-[#5f665c] text-base font-medium leading-relaxed max-w-xs mx-auto">
          Explore listings, save favourites, and book visits — all in one place.
        </p>
      </div>

      {/* CTA Buttons */}
      <div className="flex flex-col gap-4 w-full max-w-[320px]">
        <Link
          href="/signup"
          className="w-full bg-[#238859] text-white text-base font-medium text-center py-4 rounded-[20px] hover:bg-[#1d7049] transition-colors duration-200"
        >
          Create Account
        </Link>
        <Link
          href="/login"
          className="w-full bg-white border border-black/10 text-[#1a1a1a] text-base font-medium text-center py-4 rounded-[20px] hover:bg-gray-50 transition-colors duration-200"
        >
          Login
        </Link>
      </div>
    </main>
  );
}
