import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { verifyToken } from "@/lib/auth";
import User from "@/models/User";

/**
 * GET /api/admin/users
 *
 * Admin only — returns all registered users.
 * Fields returned: fullName (name), email, phone, role, createdAt.
 */
export async function GET(request: NextRequest) {
  // ── Admin guard ───────────────────────────────────────────────────────────
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

    const users = await User.find({})
      .select("name email phone role createdAt")
      .sort({ createdAt: -1 })
      .lean();

    return NextResponse.json({ users }, { status: 200 });
  } catch (error) {
    console.error("[API] /api/admin/users error:", error);
    return NextResponse.json(
      { error: "Failed to fetch users." },
      { status: 500 }
    );
  }
}
