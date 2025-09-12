import { NextRequest, NextResponse } from "next/server"
import { readAllUsers } from "@/lib/user-store"
import { verifyAdminAuth } from "@/lib/admin-auth"

export async function GET(request: NextRequest) {
  try {
    // Verify admin authentication
    const authResult = await verifyAdminAuth(request)
    if (!authResult.success) {
      return NextResponse.json({ success: false, error: authResult.error }, { status: 401 })
    }
    
    // Get all users
    const users = await readAllUsers()
    
    // Remove password from response
    const safeUsers = users.map(user => ({
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      createdAt: user.createdAt,
    }))

    return NextResponse.json({ success: true, users: safeUsers })
  } catch (error) {
    console.error("Error fetching users:", error)
    return NextResponse.json(
      { success: false, error: "Failed to fetch users" },
      { status: 500 }
    )
  }
}
