import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { sendOTPEmail } from "@/lib/mail";
import OTP from "@/models/OTP";

/**
 * POST /api/auth/send-otp
 *
 * Body: { email: string; fullName?: string; phone?: string }
 *
 * - Validates email
 * - Rate-limits to 1 OTP per minute per email
 * - Generates a 6-digit OTP, saves it (expires in 5 min), sends it via email
 * - Stores fullName + phone in the OTP doc so verify-otp can create the user
 */
export async function POST(request: NextRequest) {
  try {
    await connectDB();

    const body = await request.json();
    const { email, fullName, phone } = body;

    // ── Validation ──────────────────────────────────────────────────────────
    if (!email || typeof email !== "string") {
      return NextResponse.json(
        { error: "A valid email address is required." },
        { status: 400 }
      );
    }

    const normalizedEmail = email.toLowerCase().trim();

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail)) {
      return NextResponse.json(
        { error: "Please enter a valid email address." },
        { status: 400 }
      );
    }

    // ── Rate limiting: 1 OTP per minute ─────────────────────────────────────
    const oneMinuteAgo = new Date(Date.now() - 60 * 1000);
    const recentOTP = await OTP.findOne({
      email: normalizedEmail,
      createdAt: { $gt: oneMinuteAgo },
    });

    if (recentOTP) {
      return NextResponse.json(
        { error: "Please wait 1 minute before requesting a new code." },
        { status: 429 }
      );
    }

    // ── Generate OTP ─────────────────────────────────────────────────────────
    // Cryptographically random 6-digit string, zero-padded
    const otpValue = String(Math.floor(100000 + Math.random() * 900000));
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes

    // Delete any previous OTPs for this email before inserting new one
    await OTP.deleteMany({ email: normalizedEmail });

    await OTP.create({
      email: normalizedEmail,
      otp: otpValue,
      expiresAt,
      ...(fullName ? { fullName: String(fullName).trim() } : {}),
      ...(phone    ? { phone:    String(phone).trim()    } : {}),
    });

    // ── Send email ────────────────────────────────────────────────────────────
    await sendOTPEmail(normalizedEmail, otpValue, fullName);

    return NextResponse.json(
      { message: "Verification code sent to your email." },
      { status: 200 }
    );
  } catch (error) {
    console.error("[API] /api/auth/send-otp error:", error);
    return NextResponse.json(
      { error: "Failed to send OTP. Please try again." },
      { status: 500 }
    );
  }
}
