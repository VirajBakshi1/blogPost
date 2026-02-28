import { notFound } from "next/navigation";
import Link from "next/link";
import { connectDB } from "@/lib/db";
import Blog from "@/models/Blog";

type Props = { params: Promise<{ id: string }> };

export default async function BlogDetailPage({ params }: Props) {
  const { id } = await params;

  await connectDB();

  let blog;
  try {
    blog = await Blog.findById(id).lean();
  } catch {
    notFound();
  }

  if (!blog) notFound();

  const formattedDate = new Date(blog.createdAt).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  return (
    <div className="min-h-screen bg-white">
      {/* ── Navbar ─────────────────────────────────────────────────────────── */}
      <header className="border-b border-black/10 bg-white sticky top-0 z-10">
        <div className="max-w-[900px] mx-auto px-5 sm:px-10 h-16 flex items-center gap-4">
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-2 text-[#1f4e4e] text-sm font-semibold hover:underline"
          >
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              aria-hidden
            >
              <path
                d="M19 12H5M11 18l-6-6 6-6"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            Back to Stories
          </Link>
        </div>
      </header>

      {/* ── Article ─────────────────────────────────────────────────────────── */}
      <article className="max-w-[900px] mx-auto px-5 sm:px-10 py-16">
        {/* Hero image */}
        <div className="relative w-full aspect-[16/9] rounded-[20px] overflow-hidden mb-12">
          <img
            src={blog.imageUrl}
            alt={blog.title}
            className="absolute inset-0 w-full h-full object-cover"
          />
        </div>

        {/* Meta */}
        <div className="flex flex-col gap-4 mb-10">
          <p className="text-[#7a7a76] text-sm font-medium tracking-[-0.28px]">
            {formattedDate}
          </p>
          <h1
            className="text-[#1f4e4e] text-3xl sm:text-[40px] font-medium leading-tight tracking-[-0.80px]"
            style={{ fontFeatureSettings: "'dlig'" }}
          >
            {blog.title}
          </h1>
          <p
            className="text-[#2b2b2a] text-lg font-medium leading-7 tracking-[-0.36px]"
            style={{ fontFeatureSettings: "'dlig'" }}
          >
            {blog.shortText}
          </p>
        </div>

        {/* Divider */}
        <div className="border-t border-black/10 mb-10" />

        {/* Full content */}
        <div
          className="text-[#2b2b2a] text-base sm:text-[18px] font-medium leading-8 tracking-[-0.36px] whitespace-pre-wrap"
          style={{ fontFeatureSettings: "'dlig'" }}
        >
          {blog.fullText}
        </div>
      </article>
    </div>
  );
}
