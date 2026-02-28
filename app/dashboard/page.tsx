import { redirect } from "next/navigation";
import Link from "next/link";
import { getSessionFromCookie } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import Blog from "@/models/Blog";
import LogoutButton from "./LogoutButton";

// ── Arrow icon ─────────────────────────────────────────────────────────────────
function ArrowRight() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M5 12H19M13 6l6 6-6 6"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

// ── Blog card ──────────────────────────────────────────────────────────────────
function BlogCard({
  id,
  imageUrl,
  title,
  shortText,
}: {
  id: string;
  imageUrl: string;
  title: string;
  shortText: string;
}) {
  return (
    <div className="flex flex-col gap-5 w-full">
      <div className="relative h-[280px] sm:h-[360px] lg:h-[436px] rounded-[20px] overflow-hidden w-full">
        <img
          src={imageUrl}
          alt={title}
          className="absolute inset-0 w-full h-full object-cover"
        />
      </div>
      <div className="flex flex-col gap-5 pl-[5px]">
        <div className="flex flex-col gap-2">
          <h2
            className="text-[#1f4e4e] text-[23px] font-medium leading-6 tracking-[-0.46px]"
            style={{ fontFeatureSettings: "'dlig'" }}
          >
            {title}
          </h2>
          <p
            className="text-black text-base font-medium leading-6 tracking-[-0.32px]"
            style={{ fontFeatureSettings: "'dlig'" }}
          >
            {shortText}
          </p>
        </div>
        <Link
          href={`/blog/${id}`}
          className="inline-flex items-center gap-2 bg-[#1f4e4e] text-[#f5f5f0] text-[18px] font-semibold leading-[27px] tracking-[-0.36px] px-6 py-[16.5px] rounded-[20px] w-fit hover:bg-[#173c3c] transition-colors"
        >
          Details
          <ArrowRight />
        </Link>
      </div>
    </div>
  );
}

// ── Page ───────────────────────────────────────────────────────────────────────
export default async function DashboardPage() {
  const session = await getSessionFromCookie();
  if (!session) redirect("/login");

  // Fetch blogs directly (server component — no API call needed)
  await connectDB();
  const rawBlogs = await Blog.find({}).sort({ createdAt: -1 }).lean();
  const blogs = rawBlogs.map((b) => ({
    id: (b._id as unknown as string).toString(),
    imageUrl: b.imageUrl,
    title: b.title,
    shortText: b.shortText,
  }));

  return (
    <div className="min-h-screen bg-white">
      {/* ── Navbar ─────────────────────────────────────────────────────── */}
      <header className="border-b border-black/10 bg-white sticky top-0 z-10">
        <div className="max-w-[1440px] mx-auto px-5 sm:px-10 h-16 flex items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-[#1f4e4e] rounded-full flex items-center justify-center">
              <svg width="16" height="16" viewBox="0 0 22 22" fill="none">
                <path d="M11 2L3 9V20H9V14H13V20H19V9L11 2Z" fill="white" />
              </svg>
            </div>
            <span className="text-[#1f4e4e] text-lg font-semibold tracking-tight">
              Helium
            </span>
          </div>
          <div className="flex items-center gap-4">
            <span className="hidden sm:block text-[#7a7a76] text-sm font-medium truncate max-w-[220px]">
              {session.email}
            </span>
            <LogoutButton />
          </div>
        </div>
      </header>

      {/* ── Main ───────────────────────────────────────────────────────── */}
      <main className="max-w-[1440px] mx-auto px-5 sm:px-[80px] py-[120px]">
        {/* Section heading */}
        <div className="flex flex-col gap-[10px] items-center text-center mb-[80px]">
          <h1
            className="text-[#2b2b2a] text-4xl sm:text-[48px] font-medium leading-[1] tracking-[-0.96px] font-serif"
            style={{ fontFeatureSettings: "'ss01', 'dlig'" }}
          >
            Impact Stories
          </h1>
          <p
            className="text-[#7a7a76] text-lg sm:text-[24px] font-medium leading-6 tracking-[-0.48px]"
            style={{ fontFeatureSettings: "'dlig'" }}
          >
            Real change. Real people. Real results.
          </p>
        </div>

        {blogs.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-[#7a7a76] text-xl font-medium">
              No stories published yet. Check back soon.
            </p>
          </div>
        ) : (
          <>
            {/* ── Desktop: Figma staggered 3-column layout ─────────────── */}
            <div className="hidden lg:flex gap-[40px] items-start px-[40px]">
              {blogs.map((blog, index) => {
                const isMiddle = index % 3 === 1;
                return (
                  <div
                    key={blog.id}
                    className="flex flex-col w-[358px] shrink-0"
                    style={{ marginTop: isMiddle ? "50px" : "0" }}
                  >
                    {isMiddle && (
                      <div className="flex justify-center mb-[10px] h-[50px] items-start pt-[7px]">
                        <div className="w-[194px] border-t border-black/20" />
                      </div>
                    )}
                    <BlogCard {...blog} />
                    {!isMiddle && <div className="h-[50px]" />}
                  </div>
                );
              })}
            </div>

            {/* ── Mobile / tablet: responsive grid ─────────────────────── */}
            <div className="lg:hidden grid grid-cols-1 sm:grid-cols-2 gap-8">
              {blogs.map((blog) => (
                <BlogCard key={blog.id} {...blog} />
              ))}
            </div>
          </>
        )}
      </main>
    </div>
  );
}
