import { NextRequest } from "next/server"
import { verifyJWT } from "./jwt"

export async function verifyAdminAuth(request: NextRequest) {
  try {
    const cookieToken = request.cookies.get("auth_token")?.value || null
    const header = request.headers.get("authorization")
    const headerToken = header && header.startsWith("Bearer ") ? header.replace("Bearer ", "") : null
    const token = cookieToken || headerToken
    if (!token) {
      return { success: false, error: "Unauthorized" }
    }
    const decoded = await verifyJWT(token)
    
    if (!decoded || decoded.role !== "ADMIN") {
      return { success: false, error: "Admin access required" }
    }

    return { success: true, user: decoded }
  } catch (error) {
    console.error("Admin auth verification failed:", error)
    return { success: false, error: "Invalid token" }
  }
}
