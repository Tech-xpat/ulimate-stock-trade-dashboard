import { NextRequest, NextResponse } from "next/server"

const ADMIN_EMAILS = process.env.ADMIN_EMAILS?.split(",").map((e) => e.trim()) || []

/**
 * POST /api/admin/check-admin
 * Checks if the current user (via Firebase token) is an admin
 * Admin emails are stored server-side in environment variables
 */
export async function GET(request: NextRequest) {
  try {
    // Get Firebase ID token from Authorization header
    const authHeader = request.headers.get("authorization")
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json({ isAdmin: false }, { status: 401 })
    }

    const idToken = authHeader.substring(7)

    // Verify token with Firebase Admin SDK (would need setup)
    // For now, we return isAdmin: false to be safe
    // In production, you should:
    // 1. Set up Firebase Admin SDK
    // 2. Verify the token: const decodedToken = await admin.auth().verifyIdToken(idToken)
    // 3. Get user email from decodedToken.email
    // 4. Check against ADMIN_EMAILS

    // Placeholder: Token verification should happen here
    console.log("[v0] Admin check request received with token")

    return NextResponse.json(
      { isAdmin: false, message: "Admin verification requires server setup" },
      { status: 200 }
    )
  } catch (error) {
    console.error("[v0] Admin check error:", error)
    return NextResponse.json({ isAdmin: false, error: "Internal server error" }, { status: 500 })
  }
}
