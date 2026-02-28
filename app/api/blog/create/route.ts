import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { verifyToken } from "@/lib/auth";
import { uploadImageToCloudinary } from "@/lib/cloudinary";
import Blog from "@/models/Blog";

/**
 * POST /api/blog/create
 *
 * Admin only. Accepts multipart/form-data:
 *   - title: string
 *   - shortText: string
 *   - fullText: string
 *   - image: File  (takes priority)
 *   - imageUrl: string  (fallback if no file)
 */
export async function POST(request: NextRequest) {
  // ── Auth check ────────────────────────────────────────────────────────────
  const token = request.cookies.get("auth_token")?.value;
  if (!token) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  const session = verifyToken(token);
  if (!session || session.role !== "admin") {
    return NextResponse.json(
      { error: "Forbidden. Admin access required." },
      { status: 403 }
    );
  }

  try {
    await connectDB();

    const formData = await request.formData();

    const title     = (formData.get("title")     as string | null)?.trim();
    const shortText = (formData.get("shortText") as string | null)?.trim();
    const fullText  = (formData.get("fullText")  as string | null)?.trim();
    const imageFile = formData.get("image") as File | null;
    const imageUrlInput = (formData.get("imageUrl") as string | null)?.trim();

    // ── Validation ────────────────────────────────────────────────────────
    if (!title || !shortText || !fullText) {
      return NextResponse.json(
        { error: "title, shortText, and fullText are all required." },
        { status: 400 }
      );
    }

    // ── Image handling ─────────────────────────────────────────────────────
    let imageUrl = "";

    if (imageFile && imageFile.size > 0) {
      // Upload file to Cloudinary
      imageUrl = await uploadImageToCloudinary(imageFile);
    } else if (imageUrlInput) {
      // Accept a direct URL (useful for testing without Cloudinary)
      imageUrl = imageUrlInput;
    } else {
      return NextResponse.json(
        { error: "An image file or imageUrl is required." },
        { status: 400 }
      );
    }

    // ── Save to DB ────────────────────────────────────────────────────────
    const blog = await Blog.create({
      title,
      imageUrl,
      shortText,
      fullText,
      createdBy: session.email,
    });

    return NextResponse.json({ blog }, { status: 201 });
  } catch (error) {
    console.error("[API] /api/blog/create error:", error);
    return NextResponse.json(
      { error: "Failed to create blog post. Please try again." },
      { status: 500 }
    );
  }
}
