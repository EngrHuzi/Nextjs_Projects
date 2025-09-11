import { NextResponse } from "next/server"
import { logger } from "@/lib/logger"

export async function POST() {
  try {
    // In a real application with HTTP-only cookies, we would clear them here
    // Since we're using localStorage in the client, the actual token removal happens client-side
    // This endpoint is mainly for logging and potential future server-side cleanup
    
    logger.info("User logged out")
    return NextResponse.json({ success: true })
  } catch (err) {
    logger.error("Logout error", { error: err })
    return NextResponse.json({ error: "Failed to logout" }, { status: 500 })
  }
}