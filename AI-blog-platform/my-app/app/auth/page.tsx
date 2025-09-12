"use client"

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { LoginForm } from '@/components/auth/login-form'
import { RegisterForm } from '@/components/auth/register-form'

export default function AuthPage() {
  const [activeTab, setActiveTab] = useState('login')
  const router = useRouter()

  const handleAuthSuccess = () => {
    router.push('/')
  }

  return (
    <div className="bg-gradient-to-br from-background to-muted flex items-center justify-center p-4 py-12">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-foreground mb-2">AI Blog Platform</h1>
          <p className="text-muted-foreground">Welcome to your AI-powered blogging experience</p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="login">Sign In</TabsTrigger>
            <TabsTrigger value="register">Sign Up</TabsTrigger>
          </TabsList>
          
          <TabsContent value="login" className="mt-6">
            <LoginForm onSuccess={handleAuthSuccess} />
          </TabsContent>
          
          <TabsContent value="register" className="mt-6">
            <RegisterForm onSuccess={handleAuthSuccess} />
          </TabsContent>
        </Tabs>

        {/* <Card className="mt-6 p-4 bg-muted/50">
          <div className="text-center text-sm text-muted-foreground">
            <p className="mb-2">Demo Features:</p>
            <ul className="space-y-1 text-xs">
              <li>• First user automatically becomes admin</li>
              <li>• Data persists in localStorage</li>
              <li>• Role-based access control</li>
              <li>• Form validation with Zod</li>
            </ul>
          </div>
        </Card> */}
      </div>
    </div>
  )
}

