import { NextRequest, NextResponse } from "next/server";
import mongoose from "mongoose";
import { connectDB } from "@/lib/db";
import { verifyToken } from "@/lib/auth";
import Blog from "@/models/Blog";

type RouteContext = { params: Promise<{ id: string }> };

// ── Helper: validate ObjectId ─────────────────────────────────────────────────
function isValidId(id: string) {
  return mongoose.Types.ObjectId.isValid(id);
}

// ── Helper: admin guard ───────────────────────────────────────────────────────
function getAdminSession(request: NextRequest) {
  const token = request.cookies.get("auth_token")?.value;
  if (!token) return null;
  const session = verifyToken(token);
  if (!session || session.role !== "admin") return null;
  return session;
}

/**
 * GET /api/blog/[id]
 * Public — returns a single blog post.
 */
export async function GET(_request: NextRequest, { params }: RouteContext) {
  const { id } = await params;

  if (!isValidId(id)) {
    return NextResponse.json({ error: "Invalid blog ID." }, { status: 400 });
  }

  try {
    await connectDB();
    const blog = await Blog.findById(id).lean();

    if (!blog) {
      return NextResponse.json({ error: "Blog not found." }, { status: 404 });
    }

    return NextResponse.json({ blog }, { status: 200 });
  } catch (error) {
    console.error("[API] GET /api/blog/[id] error:", error);
    return NextResponse.json(
      { error: "Failed to fetch blog post." },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/blog/[id]
 * Admin only — updates title, shortText, fullText, imageUrl.
 */
export async function PUT(request: NextRequest, { params }: RouteContext) {
  const { id } = await params;

  const session = getAdminSession(request);
  if (!session) {
    return NextResponse.json(
      { error: "Forbidden. Admin access required." },
      { status: 403 }
    );
  }

  if (!isValidId(id)) {
    return NextResponse.json({ error: "Invalid blog ID." }, { status: 400 });
  }

  try {
    await connectDB();

    const body = await request.json();
    const { title, shortText, fullText, imageUrl } = body;

    const updated = await Blog.findByIdAndUpdate(
      id,
      { title, shortText, fullText, imageUrl },
      { new: true, runValidators: true }
    );

    if (!updated) {
      return NextResponse.json({ error: "Blog not found." }, { status: 404 });
    }

    return NextResponse.json({ blog: updated }, { status: 200 });
  } catch (error) {
    console.error("[API] PUT /api/blog/[id] error:", error);
    return NextResponse.json(
      { error: "Failed to update blog post." },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/blog/[id]
 * Admin only — permanently deletes a blog post.
 */
export async function DELETE(request: NextRequest, { params }: RouteContext) {
  const { id } = await params;

  const session = getAdminSession(request);
  if (!session) {
    return NextResponse.json(
      { error: "Forbidden. Admin access required." },
      { status: 403 }
    );
  }

  if (!isValidId(id)) {
    return NextResponse.json({ error: "Invalid blog ID." }, { status: 400 });
  }

  try {
    await connectDB();
    const deleted = await Blog.findByIdAndDelete(id);

    if (!deleted) {
      return NextResponse.json({ error: "Blog not found." }, { status: 404 });
    }

    return NextResponse.json(
      { message: "Blog post deleted successfully." },
      { status: 200 }
    );
  } catch (error) {
    console.error("[API] DELETE /api/blog/[id] error:", error);
    return NextResponse.json(
      { error: "Failed to delete blog post." },
      { status: 500 }
    );
  }
}
