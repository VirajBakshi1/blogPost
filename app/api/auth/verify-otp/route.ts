import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { signToken, getAuthCookieOptions } from "@/lib/auth";
import OTP from "@/models/OTP";
import User from "@/models/User";

const ADMIN_EMAIL = "virajbakshi083@gmail.com";

/**
 * POST /api/auth/verify-otp
 *
 * Body: { email: string; otp: string }
 *
 * - Validates the OTP
 * - Creates the user if they don't exist (reads fullName + phone from OTP doc)
 * - Assigns role: "admin" if email matches ADMIN_EMAIL, else "user"
 * - Deletes the OTP after successful verification
 * - Issues a JWT stored in an HTTP-only cookie
 * - Returns { message, role } so the client can redirect appropriately
 */
export async function POST(request: NextRequest) {
  try {
    await connectDB();

    const body = await request.json();
    const { email, otp } = body;

    // ── Validation ──────────────────────────────────────────────────────────
    if (!email || !otp) {
      return NextResponse.json(
        { error: "Email and OTP are required." },
        { status: 400 }
      );
    }

    if (typeof otp !== "string" || !/^\d{6}$/.test(otp)) {
      return NextResponse.json(
        { error: "Please enter a valid 6-digit code." },
        { status: 400 }
      );
    }

    const normalizedEmail = email.toLowerCase().trim();

    // ── Find and validate OTP ────────────────────────────────────────────────
    const otpRecord = await OTP.findOne({ email: normalizedEmail });

    if (!otpRecord) {
      return NextResponse.json(
        { error: "No verification code found. Please request a new one." },
        { status: 404 }
      );
    }

    // Check expiry
    if (otpRecord.expiresAt < new Date()) {
      await OTP.deleteOne({ _id: otpRecord._id });
      return NextResponse.json(
        { error: "This code has expired. Please request a new one." },
        { status: 410 }
      );
    }

    // Check correctness
    if (otpRecord.otp !== otp) {
      return NextResponse.json(
        { error: "Invalid code. Please check and try again." },
        { status: 401 }
      );
    }

    // ── Capture signup data from OTP record before deletion ──────────────────
    const fullName = otpRecord.fullName;
    const phone    = otpRecord.phone;

    // ── OTP is valid — delete it immediately ─────────────────────────────────
    await OTP.deleteOne({ _id: otpRecord._id });

    // ── Determine role based on email ────────────────────────────────────────
    const role: "admin" | "user" =
      normalizedEmail === ADMIN_EMAIL ? "admin" : "user";

    // ── Find or create user ──────────────────────────────────────────────────
    let user = await User.findOne({ email: normalizedEmail });

    if (!user) {
      // New user — fullName is required (must have been sent with send-otp)
      if (!fullName || !fullName.trim()) {
        return NextResponse.json(
          { error: "Full name is required to create your account. Please sign up again." },
          { status: 400 }
        );
      }

      user = await User.create({
        name: fullName.trim(),
        email: normalizedEmail,
        role,
        ...(phone ? { phone: phone.trim() } : {}),
      });
    } else {
      // Existing user — always sync role in case email changed ownership
      if (user.role !== role) {
        user.role = role;
        await user.save();
      }
    }

    // ── Issue JWT ────────────────────────────────────────────────────────────
    const token = signToken({
      userId: (user._id as unknown as string).toString(),
      email: user.email,
      name: user.name,
      role: user.role,
    });

    // ── Set HTTP-only cookie ─────────────────────────────────────────────────
    const cookieOptions = getAuthCookieOptions();
    const response = NextResponse.json(
      { message: "Verified successfully.", role: user.role },
      { status: 200 }
    );
    response.cookies.set(cookieOptions.name, token, cookieOptions);

    return response;
  } catch (error) {
    console.error("[API] /api/auth/verify-otp error:", error);
    return NextResponse.json(
      { error: "Internal server error. Please try again." },
      { status: 500 }
    );
  }
}
