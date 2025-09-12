import { NextRequest, NextResponse } from "next/server"
import fs from "fs/promises"
import path from "path"
import { verifyAdminAuth } from "@/lib/admin-auth"

const settingsFile = path.join(process.cwd(), "data", "settings.json")

async function ensureSettingsFile() {
  try {
    await fs.access(settingsFile)
  } catch {
    const defaultSettings = {
      siteName: "AI Blog Platform",
      siteDescription: "A modern blog platform powered by AI",
      siteUrl: "http://localhost:3000",
      adminEmail: "admin@example.com",
      allowRegistration: true,
      requireEmailVerification: false,
      maxPostsPerUser: 50,
      defaultPostStatus: "draft",
      enableComments: true,
      moderateComments: false,
      enableAI: true,
      theme: "system",
      maintenanceMode: false,
      maintenanceMessage: "We're performing scheduled maintenance. Please check back later.",
    }
    
    await fs.mkdir(path.dirname(settingsFile), { recursive: true })
    await fs.writeFile(settingsFile, JSON.stringify(defaultSettings, null, 2))
  }
}

export async function GET(request: NextRequest) {
  try {
    // Verify admin authentication
    const authResult = await verifyAdminAuth(request)
    if (!authResult.success) {
      return NextResponse.json({ success: false, error: authResult.error }, { status: 401 })
    }

    await ensureSettingsFile()
    
    const settingsData = await fs.readFile(settingsFile, "utf8")
    const settings = JSON.parse(settingsData)
    
    return NextResponse.json({ success: true, settings })
  } catch (error) {
    console.error("Error fetching settings:", error)
    return NextResponse.json(
      { success: false, error: "Failed to fetch settings" },
      { status: 500 }
    )
  }
}

export async function PUT(request: NextRequest) {
  try {
    // Verify admin authentication
    const authResult = await verifyAdminAuth(request)
    if (!authResult.success) {
      return NextResponse.json({ success: false, error: authResult.error }, { status: 401 })
    }

    const settings = await request.json()
    
    await ensureSettingsFile()
    await fs.writeFile(settingsFile, JSON.stringify(settings, null, 2))
    
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error saving settings:", error)
    return NextResponse.json(
      { success: false, error: "Failed to save settings" },
      { status: 500 }
    )
  }
}
