"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { 
  BookOpen, 
  Sparkles, 
  Users, 
  Shield, 
  Zap, 
  Target,
  ArrowRight,
  CheckCircle
} from "lucide-react"
import Link from "next/link"

export function HeroSection() {
  const features = [
    {
      icon: BookOpen,
      title: "Smart Blog Management",
      description: "Create, edit, and organize your blog posts with our intuitive editor"
    },
    {
      icon: Sparkles,
      title: "AI-Powered Content",
      description: "Generate titles, summaries, and SEO keywords with AI assistance"
    },
    {
      icon: Users,
      title: "Community Features",
      description: "Engage with readers through comments and discussions"
    },
    {
      icon: Shield,
      title: "Admin Dashboard",
      description: "Comprehensive management tools for users and content"
    }
  ]

  const benefits = [
    "AI-generated content suggestions",
    "SEO optimization tools",
    "Real-time collaboration",
    "Analytics and insights",
    "Mobile-responsive design",
    "Secure and reliable"
  ]

  return (
    <div className="bg-gradient-to-br from-background to-muted">
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-6xl mx-auto">
          {/* Hero Section */}
          <div className="text-center mb-16">
            <Badge variant="secondary" className="mb-4">
              <Zap className="h-3 w-3 mr-1" />
              AI-Powered Blogging Platform
            </Badge>
            <h1 className="text-5xl md:text-6xl font-bold mb-6">
              Create Amazing Content with{" "}
              <span className="text-primary">AI Assistance</span>
            </h1>
            <p className="text-xl text-muted-foreground mb-8 max-w-3xl mx-auto">
              Transform your blogging experience with our AI-powered platform. 
              Write better, publish faster, and grow your audience with intelligent content tools.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" asChild>
                <Link href="/auth">
                  Get Started Free
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" asChild>
                <Link href="#features">
                  Learn More
                </Link>
              </Button>
            </div>
          </div>

          {/* Features Grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
            {features.map((feature, index) => {
              const Icon = feature.icon
              return (
                <Card key={index} className="text-center">
                  <CardHeader>
                    <div className="mx-auto w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                      <Icon className="h-6 w-6 text-primary" />
                    </div>
                    <CardTitle className="text-lg">{feature.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <CardDescription>{feature.description}</CardDescription>
                  </CardContent>
                </Card>
              )
            })}
          </div>

          {/* Benefits Section */}
          <div className="grid lg:grid-cols-2 gap-12 items-center mb-16">
            <div>
              <h2 className="text-3xl font-bold mb-6">
                Why Choose Our Platform?
              </h2>
              <p className="text-lg text-muted-foreground mb-8">
                Our AI-powered platform combines cutting-edge technology with 
                user-friendly design to help you create exceptional content.
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {benefits.map((benefit, index) => (
                  <div key={index} className="flex items-center space-x-3">
                    <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0" />
                    <span className="text-sm">{benefit}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="relative">
              <Card className="p-8">
                <div className="text-center">
                  <Target className="h-16 w-16 text-primary mx-auto mb-4" />
                  <h3 className="text-2xl font-bold mb-4">Ready to Start?</h3>
                  <p className="text-muted-foreground mb-6">
                    Join thousands of content creators who are already using our platform
                  </p>
                  <Button size="lg" asChild>
                    <Link href="/auth">
                      Create Your Account
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Link>
                  </Button>
                </div>
              </Card>
            </div>
          </div>

          {/* CTA Section */}
          <div className="text-center bg-primary/5 rounded-2xl p-12">
            <h2 className="text-3xl font-bold mb-4">
              Start Your AI-Powered Blogging Journey Today
            </h2>
            <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
              No credit card required. Get started in minutes and experience 
              the future of content creation.
            </p>
            <Button size="lg" asChild>
              <Link href="/auth">
                Get Started Now
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
