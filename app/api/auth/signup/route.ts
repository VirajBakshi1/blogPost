import { NextResponse } from "next/server";

/**
 * @deprecated Password-based signup has been replaced by email OTP.
 * Use POST /api/auth/send-otp then POST /api/auth/verify-otp instead.
 */
export async function POST() {
  return NextResponse.json(
    { error: "This endpoint is deprecated. Use /api/auth/send-otp instead." },
    { status: 410 }
  );
}
