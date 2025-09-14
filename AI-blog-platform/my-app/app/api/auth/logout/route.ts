import { NextResponse } from "next/server"
import { logger } from "@/lib/logger"

export async function POST() {
  try {
    const res = NextResponse.json({ success: true })
    // Clear cookie
    res.cookies.set("auth_token", "", { httpOnly: true, secure: process.env.NODE_ENV === "production", sameSite: "lax", path: "/", maxAge: 0 })
    res.cookies.set("refresh_token", "", { httpOnly: true, secure: process.env.NODE_ENV === "production", sameSite: "lax", path: "/api/auth", maxAge: 0 })
    logger.info("User logged out")
    return res
  } catch (err) {
    logger.error("Logout error", { error: err })
    return NextResponse.json({ error: "Failed to logout" }, { status: 500 })
  }
}