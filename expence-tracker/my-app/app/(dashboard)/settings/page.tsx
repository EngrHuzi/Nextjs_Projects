'use client'

// T198-T203: Settings page for notification preferences
import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { toast } from 'sonner'
import { Bell, Clock, Mail, Smartphone } from 'lucide-react'

interface UserPreferences {
  budgetAlertsEnabled: boolean
  dailyRemindersEnabled: boolean
  reminderTime: string | null
  notificationMethod: 'IN_APP' | 'EMAIL' | 'BOTH'
}

export default function SettingsPage() {
  const [preferences, setPreferences] = useState<UserPreferences>({
    budgetAlertsEnabled: true,
    dailyRemindersEnabled: false,
    reminderTime: null,
    notificationMethod: 'IN_APP'
  })
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)

  // Fetch user preferences on mount
  useEffect(() => {
    fetchPreferences()
  }, [])

  const fetchPreferences = async () => {
    setIsLoading(true)
    try {
      const response = await fetch('/api/user/preferences')
      if (response.ok) {
        const data = await response.json()
        setPreferences(data.preferences)
      } else {
        toast.error('Failed to load preferences')
      }
    } catch (error) {
      console.error('Error fetching preferences:', error)
      toast.error('Failed to load preferences')
    } finally {
      setIsLoading(false)
    }
  }

  // T203: Save preferences on change
  const savePreferences = async (updatedPreferences: Partial<UserPreferences>) => {
    setIsSaving(true)
    try {
      const response = await fetch('/api/user/preferences', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedPreferences)
      })

      if (response.ok) {
        const data = await response.json()
        setPreferences(data.preferences)
        toast.success('Preferences saved successfully')
      } else {
        throw new Error('Failed to save preferences')
      }
    } catch (error) {
      console.error('Error saving preferences:', error)
      toast.error('Failed to save preferences')
    } finally {
      setIsSaving(false)
    }
  }

  // T199: Handle budget alerts toggle
  const handleBudgetAlertsToggle = () => {
    const newValue = !preferences.budgetAlertsEnabled
    setPreferences({ ...preferences, budgetAlertsEnabled: newValue })
    savePreferences({ budgetAlertsEnabled: newValue })
  }

  // T200: Handle daily reminders toggle
  const handleDailyRemindersToggle = () => {
    const newValue = !preferences.dailyRemindersEnabled
    setPreferences({ ...preferences, dailyRemindersEnabled: newValue })
    savePreferences({ dailyRemindersEnabled: newValue })
  }

  // T201: Handle reminder time change
  const handleReminderTimeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newTime = e.target.value
    setPreferences({ ...preferences, reminderTime: newTime })
    savePreferences({ reminderTime: newTime })
  }

  // T202: Handle notification method change
  const handleNotificationMethodChange = (method: 'IN_APP' | 'EMAIL' | 'BOTH') => {
    setPreferences({ ...preferences, notificationMethod: method })
    savePreferences({ notificationMethod: method })
  }

  if (isLoading) {
    return (
      <div className="p-8">
        <h1 className="text-3xl font-bold mb-6">Settings</h1>
        <p className="text-muted-foreground">Loading preferences...</p>
      </div>
    )
  }

  return (
    <div className="p-8 max-w-4xl">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Settings</h1>
        <p className="text-muted-foreground mt-2">
          Manage your notification preferences and alerts
        </p>
      </div>

      <div className="space-y-6">
        {/* T199: Global Budget Alerts */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Bell className="h-5 w-5 text-primary" />
              <CardTitle>Budget Alerts</CardTitle>
            </div>
            <CardDescription>
              Get notified when you're approaching or exceeding your budgets
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Enable Budget Alerts</p>
                <p className="text-sm text-muted-foreground mt-1">
                  Receive alerts at 90% and 100% of budget
                </p>
              </div>
              <button
                onClick={handleBudgetAlertsToggle}
                disabled={isSaving}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  preferences.budgetAlertsEnabled ? 'bg-primary' : 'bg-gray-200'
                } ${isSaving ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    preferences.budgetAlertsEnabled ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>
          </CardContent>
        </Card>

        {/* T200-T201: Daily Reminders */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-primary" />
              <CardTitle>Daily Reminders</CardTitle>
            </div>
            <CardDescription>
              Get reminded to track your expenses every day
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Enable Daily Reminders</p>
                <p className="text-sm text-muted-foreground mt-1">
                  Receive a daily reminder to log your transactions
                </p>
              </div>
              <button
                onClick={handleDailyRemindersToggle}
                disabled={isSaving}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  preferences.dailyRemindersEnabled ? 'bg-primary' : 'bg-gray-200'
                } ${isSaving ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    preferences.dailyRemindersEnabled ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>

            {/* T201: Reminder Time Picker */}
            {preferences.dailyRemindersEnabled && (
              <div>
                <Label htmlFor="reminderTime">Reminder Time</Label>
                <Input
                  id="reminderTime"
                  type="time"
                  value={preferences.reminderTime || '09:00'}
                  onChange={handleReminderTimeChange}
                  disabled={isSaving}
                  className="mt-2 max-w-xs"
                />
                <p className="text-xs text-muted-foreground mt-2">
                  Note: Email notifications are not yet implemented for MVP
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* T202: Notification Method */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Mail className="h-5 w-5 text-primary" />
              <CardTitle>Notification Method</CardTitle>
            </div>
            <CardDescription>
              Choose how you want to receive notifications
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <button
                onClick={() => handleNotificationMethodChange('IN_APP')}
                disabled={isSaving}
                className={`w-full flex items-center gap-3 p-4 rounded-lg border-2 transition-colors ${
                  preferences.notificationMethod === 'IN_APP'
                    ? 'border-primary bg-primary/5'
                    : 'border-gray-200 hover:border-gray-300'
                } ${isSaving ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
              >
                <div className={`h-4 w-4 rounded-full border-2 ${
                  preferences.notificationMethod === 'IN_APP'
                    ? 'border-primary bg-primary'
                    : 'border-gray-300'
                }`}>
                  {preferences.notificationMethod === 'IN_APP' && (
                    <div className="h-full w-full rounded-full bg-white scale-50" />
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <Smartphone className="h-4 w-4" />
                  <div className="text-left">
                    <p className="font-medium">In-App Only</p>
                    <p className="text-sm text-muted-foreground">
                      Notifications shown within the app
                    </p>
                  </div>
                </div>
              </button>

              <button
                onClick={() => handleNotificationMethodChange('EMAIL')}
                disabled={isSaving}
                className={`w-full flex items-center gap-3 p-4 rounded-lg border-2 transition-colors ${
                  preferences.notificationMethod === 'EMAIL'
                    ? 'border-primary bg-primary/5'
                    : 'border-gray-200 hover:border-gray-300'
                } ${isSaving ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
              >
                <div className={`h-4 w-4 rounded-full border-2 ${
                  preferences.notificationMethod === 'EMAIL'
                    ? 'border-primary bg-primary'
                    : 'border-gray-300'
                }`}>
                  {preferences.notificationMethod === 'EMAIL' && (
                    <div className="h-full w-full rounded-full bg-white scale-50" />
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <Mail className="h-4 w-4" />
                  <div className="text-left">
                    <p className="font-medium">Email Only</p>
                    <p className="text-sm text-muted-foreground">
                      Notifications sent to your email (Coming soon)
                    </p>
                  </div>
                </div>
              </button>

              <button
                onClick={() => handleNotificationMethodChange('BOTH')}
                disabled={isSaving}
                className={`w-full flex items-center gap-3 p-4 rounded-lg border-2 transition-colors ${
                  preferences.notificationMethod === 'BOTH'
                    ? 'border-primary bg-primary/5'
                    : 'border-gray-200 hover:border-gray-300'
                } ${isSaving ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
              >
                <div className={`h-4 w-4 rounded-full border-2 ${
                  preferences.notificationMethod === 'BOTH'
                    ? 'border-primary bg-primary'
                    : 'border-gray-300'
                }`}>
                  {preferences.notificationMethod === 'BOTH' && (
                    <div className="h-full w-full rounded-full bg-white scale-50" />
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <Bell className="h-4 w-4" />
                  <div className="text-left">
                    <p className="font-medium">Both</p>
                    <p className="text-sm text-muted-foreground">
                      In-app and email notifications (Coming soon)
                    </p>
                  </div>
                </div>
              </button>
            </div>

            <p className="text-xs text-muted-foreground mt-4">
              Note: Email notifications will be implemented in a future update
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
