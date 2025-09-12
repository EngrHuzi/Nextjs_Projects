"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import { Save, RefreshCw, AlertTriangle, CheckCircle, Settings, Globe, Users, Shield, Palette } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"

interface PlatformSettings {
  siteName: string
  siteDescription: string
  siteUrl: string
  adminEmail: string
  allowRegistration: boolean
  requireEmailVerification: boolean
  maxPostsPerUser: number
  defaultPostStatus: "draft" | "published"
  enableComments: boolean
  moderateComments: boolean
  enableAI: boolean
  theme: "light" | "dark" | "system"
  maintenanceMode: boolean
  maintenanceMessage: string
}

const defaultSettings: PlatformSettings = {
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

export function AdminSettings() {
  const [settings, setSettings] = useState<PlatformSettings>(defaultSettings)
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [saveStatus, setSaveStatus] = useState<"idle" | "success" | "error">("idle")

  useEffect(() => {
    loadSettings()
  }, [])

  const loadSettings = async () => {
    try {
      setIsLoading(true)
      const token = localStorage.getItem("auth_token")
      if (!token) return

      const response = await fetch("/api/admin/settings", {
        headers: {
          "Authorization": `Bearer ${token}`,
        },
      })
      if (response.ok) {
        const data = await response.json()
        if (data.success) {
          setSettings({ ...defaultSettings, ...data.settings })
        }
      }
    } catch (error) {
      console.error("Failed to load settings:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const saveSettings = async () => {
    try {
      setIsSaving(true)
      setSaveStatus("idle")
      
      const token = localStorage.getItem("auth_token")
      if (!token) return

      const response = await fetch("/api/admin/settings", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
        body: JSON.stringify(settings),
      })

      if (response.ok) {
        setSaveStatus("success")
        setTimeout(() => setSaveStatus("idle"), 3000)
      } else {
        setSaveStatus("error")
        setTimeout(() => setSaveStatus("idle"), 3000)
      }
    } catch (error) {
      console.error("Failed to save settings:", error)
      setSaveStatus("error")
      setTimeout(() => setSaveStatus("idle"), 3000)
    } finally {
      setIsSaving(false)
    }
  }

  const updateSetting = <K extends keyof PlatformSettings>(
    key: K,
    value: PlatformSettings[K]
  ) => {
    setSettings(prev => ({ ...prev, [key]: value }))
  }

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Platform Settings</CardTitle>
          <CardDescription>Loading settings...</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Platform Settings</h2>
          <p className="text-muted-foreground">
            Configure your blog platform settings and preferences
          </p>
        </div>
        <div className="flex gap-2">
          <Button onClick={loadSettings} variant="outline" size="sm">
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          <Button onClick={saveSettings} disabled={isSaving} size="sm">
            <Save className="h-4 w-4 mr-2" />
            {isSaving ? "Saving..." : "Save Settings"}
          </Button>
        </div>
      </div>

      {saveStatus === "success" && (
        <Alert>
          <CheckCircle className="h-4 w-4" />
          <AlertDescription>Settings saved successfully!</AlertDescription>
        </Alert>
      )}

      {saveStatus === "error" && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>Failed to save settings. Please try again.</AlertDescription>
        </Alert>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* General Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Globe className="h-5 w-5" />
              General Settings
            </CardTitle>
            <CardDescription>
              Basic site configuration and information
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="siteName">Site Name</Label>
              <Input
                id="siteName"
                value={settings.siteName}
                onChange={(e) => updateSetting("siteName", e.target.value)}
                placeholder="Your blog name"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="siteDescription">Site Description</Label>
              <Textarea
                id="siteDescription"
                value={settings.siteDescription}
                onChange={(e) => updateSetting("siteDescription", e.target.value)}
                placeholder="Brief description of your blog"
                rows={3}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="siteUrl">Site URL</Label>
              <Input
                id="siteUrl"
                value={settings.siteUrl}
                onChange={(e) => updateSetting("siteUrl", e.target.value)}
                placeholder="https://yourblog.com"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="adminEmail">Admin Email</Label>
              <Input
                id="adminEmail"
                type="email"
                value={settings.adminEmail}
                onChange={(e) => updateSetting("adminEmail", e.target.value)}
                placeholder="admin@yourblog.com"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="theme">Theme</Label>
              <Select value={settings.theme} onValueChange={(value: "light" | "dark" | "system") => updateSetting("theme", value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="light">Light</SelectItem>
                  <SelectItem value="dark">Dark</SelectItem>
                  <SelectItem value="system">System</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* User Management */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              User Management
            </CardTitle>
            <CardDescription>
              User registration and account settings
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Allow Registration</Label>
                <p className="text-sm text-muted-foreground">
                  Allow new users to register accounts
                </p>
              </div>
              <Switch
                checked={settings.allowRegistration}
                onCheckedChange={(checked) => updateSetting("allowRegistration", checked)}
              />
            </div>
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Require Email Verification</Label>
                <p className="text-sm text-muted-foreground">
                  Users must verify their email before accessing the platform
                </p>
              </div>
              <Switch
                checked={settings.requireEmailVerification}
                onCheckedChange={(checked) => updateSetting("requireEmailVerification", checked)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="maxPostsPerUser">Max Posts Per User</Label>
              <Input
                id="maxPostsPerUser"
                type="number"
                min="1"
                max="1000"
                value={settings.maxPostsPerUser}
                onChange={(e) => updateSetting("maxPostsPerUser", parseInt(e.target.value) || 50)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="defaultPostStatus">Default Post Status</Label>
              <Select value={settings.defaultPostStatus} onValueChange={(value: "draft" | "published") => updateSetting("defaultPostStatus", value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="draft">Draft</SelectItem>
                  <SelectItem value="published">Published</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Content Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5" />
              Content Settings
            </CardTitle>
            <CardDescription>
              Blog post and content management settings
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Enable Comments</Label>
                <p className="text-sm text-muted-foreground">
                  Allow readers to comment on blog posts
                </p>
              </div>
              <Switch
                checked={settings.enableComments}
                onCheckedChange={(checked) => updateSetting("enableComments", checked)}
              />
            </div>
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Moderate Comments</Label>
                <p className="text-sm text-muted-foreground">
                  Comments require approval before being published
                </p>
              </div>
              <Switch
                checked={settings.moderateComments}
                onCheckedChange={(checked) => updateSetting("moderateComments", checked)}
                disabled={!settings.enableComments}
              />
            </div>
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Enable AI Features</Label>
                <p className="text-sm text-muted-foreground">
                  Enable AI-powered content suggestions and improvements
                </p>
              </div>
              <Switch
                checked={settings.enableAI}
                onCheckedChange={(checked) => updateSetting("enableAI", checked)}
              />
            </div>
          </CardContent>
        </Card>

        {/* Maintenance Mode */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Maintenance Mode
            </CardTitle>
            <CardDescription>
              Temporarily disable public access to the platform
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Maintenance Mode</Label>
                <p className="text-sm text-muted-foreground">
                  Show maintenance page to all visitors except admins
                </p>
              </div>
              <Switch
                checked={settings.maintenanceMode}
                onCheckedChange={(checked) => updateSetting("maintenanceMode", checked)}
              />
            </div>
            {settings.maintenanceMode && (
              <div className="space-y-2">
                <Label htmlFor="maintenanceMessage">Maintenance Message</Label>
                <Textarea
                  id="maintenanceMessage"
                  value={settings.maintenanceMessage}
                  onChange={(e) => updateSetting("maintenanceMessage", e.target.value)}
                  placeholder="Message to show to visitors during maintenance"
                  rows={3}
                />
              </div>
            )}
            {settings.maintenanceMode && (
              <Alert>
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  Maintenance mode is currently active. Only administrators can access the platform.
                </AlertDescription>
              </Alert>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
