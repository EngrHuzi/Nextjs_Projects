import { NextRequest } from "next/server"
import { verifyJWT } from "./jwt"

export async function verifyAdminAuth(request: NextRequest) {
  try {
    const authHeader = request.headers.get("authorization")
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return { success: false, error: "No authorization header" }
    }

    const token = authHeader.replace("Bearer ", "")
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
