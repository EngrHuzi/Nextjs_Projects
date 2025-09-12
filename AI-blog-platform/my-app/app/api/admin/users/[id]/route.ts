import { NextRequest, NextResponse } from "next/server"
import { readAllUsers, writeAllUsers } from "@/lib/user-store"
import { verifyAdminAuth } from "@/lib/admin-auth"

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Verify admin authentication
    const authResult = await verifyAdminAuth(request)
    if (!authResult.success) {
      return NextResponse.json({ success: false, error: authResult.error }, { status: 401 })
    }

    const { id } = params
    const { role } = await request.json()

    if (!role || !["ADMIN", "USER"].includes(role)) {
      return NextResponse.json(
        { success: false, error: "Invalid role" },
        { status: 400 }
      )
    }

    const users = await readAllUsers()
    const userIndex = users.findIndex(user => user.id === id)

    if (userIndex === -1) {
      return NextResponse.json(
        { success: false, error: "User not found" },
        { status: 404 }
      )
    }

    // Update user role
    users[userIndex].role = role
    await writeAllUsers(users)

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error updating user:", error)
    return NextResponse.json(
      { success: false, error: "Failed to update user" },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Verify admin authentication
    const authResult = await verifyAdminAuth(request)
    if (!authResult.success) {
      return NextResponse.json({ success: false, error: authResult.error }, { status: 401 })
    }

    const { id } = params

    const users = await readAllUsers()
    const userIndex = users.findIndex(user => user.id === id)

    if (userIndex === -1) {
      return NextResponse.json(
        { success: false, error: "User not found" },
        { status: 404 }
      )
    }

    // Remove user
    users.splice(userIndex, 1)
    await writeAllUsers(users)

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error deleting user:", error)
    return NextResponse.json(
      { success: false, error: "Failed to delete user" },
      { status: 500 }
    )
  }
}
