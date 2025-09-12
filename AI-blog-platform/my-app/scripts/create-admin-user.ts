import { createUser } from "../lib/user-store"
import bcrypt from "bcryptjs"

async function createAdminUser() {
  try {
    const hashedPassword = await bcrypt.hash("admin123", 10)
    
    const adminUser = await createUser({
      id: "admin-" + Date.now(),
      name: "Admin User",
      email: "admin@example.com",
      password: hashedPassword,
      role: "ADMIN",
    })

    console.log("Admin user created successfully:")
    console.log("Email: admin@example.com")
    console.log("Password: admin123")
    console.log("User ID:", adminUser.id)
  } catch (error) {
    console.error("Error creating admin user:", error)
  }
}

createAdminUser()
