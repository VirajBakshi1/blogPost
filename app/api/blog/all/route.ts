import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import Blog from "@/models/Blog";

/**
 * GET /api/blog/all
 *
 * Public — returns all blogs sorted newest first.
 * No authentication required for reading.
 */
export async function GET() {
  try {
    await connectDB();

    const blogs = await Blog.find({})
      .sort({ createdAt: -1 })
      .lean();

    return NextResponse.json({ blogs }, { status: 200 });
  } catch (error) {
    console.error("[API] /api/blog/all error:", error);
    return NextResponse.json(
      { error: "Failed to fetch blog posts." },
      { status: 500 }
    );
  }
}
