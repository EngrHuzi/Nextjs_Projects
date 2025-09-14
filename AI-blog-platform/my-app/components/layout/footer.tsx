"use client"

import { useAuth } from "@/contexts/auth-context"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { 
  Heart, 
  Github, 
  Twitter, 
  Linkedin, 
  Mail, 
  BookOpen, 
  Sparkles, 
  Shield,
  Crown
} from "lucide-react"

export function Footer() {
  const { isAuthenticated, user } = useAuth()

  const currentYear = new Date().getFullYear()

  const footerLinks = {
    product: [
      { name: "Features", href: "#features" },
      { name: "AI Assistant", href: "/blog" },
      { name: "Blog Management", href: "/blog" },
      { name: "Analytics", href: "#analytics" },
    ],
    company: [
      { name: "About Us", href: "#about" },
      { name: "Contact", href: "#contact" },
      { name: "Privacy Policy", href: "#privacy" },
      { name: "Terms of Service", href: "#terms" },
    ],
    resources: [
      { name: "Documentation", href: "#docs" },
      { name: "Help Center", href: "#help" },
      { name: "Tutorials", href: "#tutorials" },
      { name: "API Reference", href: "#api" },
    ],
    social: [
      { name: "GitHub", href: "https://github.com/EngrHuzi", icon: Github },
      { name: "Twitter", href: "https://x.com/engrhuzi?s=11", icon: Twitter },
      { name: "LinkedIn", href: "http://linkedin.com/in/muhammad-huzaifa-79ab1a2a1?utm_source=share&utm_campaign=share_via&utm_content=profile&utm_medium=ios_app", icon: Linkedin },
      { name: "Email", href: "mailto:muhammadhuzaifaai890@gmail.com", icon: Mail },
    ],
  }

  return (
    <footer className="bg-background border-t">
      <div className="container mx-auto px-4 py-8 md:py-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Brand Section */}
          <div className="space-y-4 text-center md:text-left">
            <div className="flex items-center justify-center md:justify-start space-x-2">
              <div className="p-2 bg-primary/10 rounded-lg">
                <BookOpen className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h3 className="font-bold text-lg">AI Blog Platform</h3>
                <p className="text-sm text-muted-foreground">Powered by AI</p>
              </div>
            </div>
            <p className="text-sm text-muted-foreground">
              Create, manage, and enhance your blog content with AI-powered tools. 
              Write better, publish faster, and grow your audience.
            </p>
            <div className="flex justify-center md:justify-start space-x-2">
              {footerLinks.social.map((social) => {
                const Icon = social.icon
                return (
                  <Button
                    key={social.name}
                    variant="ghost"
                    size="sm"
                    asChild
                    className="h-8 w-8 p-0"
                  >
                    <a href={social.href} target="_blank" rel="noopener noreferrer">
                      <Icon className="h-4 w-4" />
                      <span className="sr-only">{social.name}</span>
                    </a>
                  </Button>
                )
              })}
            </div>
          </div>

          {/* Product Links */}
          <div className="space-y-4 text-center md:text-left">
            <h4 className="font-semibold text-sm">Product</h4>
            <ul className="space-y-2">
              {footerLinks.product.map((link) => (
                <li key={link.name}>
                  <a
                    href={link.href}
                    className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {link.name}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Company Links */}
          <div className="space-y-4 text-center md:text-left">
            <h4 className="font-semibold text-sm">Company</h4>
            <ul className="space-y-2">
              {footerLinks.company.map((link) => (
                <li key={link.name}>
                  <a
                    href={link.href}
                    className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {link.name}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Resources Links */}
          <div className="space-y-4 text-center md:text-left">
            <h4 className="font-semibold text-sm">Resources</h4>
            <ul className="space-y-2">
              {footerLinks.resources.map((link) => (
                <li key={link.name}>
                  <a
                    href={link.href}
                    className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {link.name}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <Separator className="my-8" />

        {/* Bottom Section */}
        <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0 text-center md:text-left">
          <div className="flex items-center space-x-4 text-sm text-muted-foreground">
            <span>© {currentYear} AI Blog Platform. All rights reserved.</span>
            <span className="hidden md:inline">•</span>
            <span className="flex items-center">
              Made with <Heart className="h-4 w-4 mx-1 text-red-500" /> by Huzi
            </span>
          </div>

          {/* User Status */}
          <div className="flex items-center space-x-4">
            {isAuthenticated ? (
              <div className="flex items-center space-x-2 text-sm">
                <div className="flex items-center space-x-1">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span className="text-muted-foreground">Welcome, {user?.name}</span>
                </div>
                {user?.role === "ADMIN" && (
                  <div className="flex items-center space-x-1 text-primary">
                    <Crown className="h-4 w-4" />
                    <span className="text-xs font-medium">Admin</span>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
                <span>Not signed in</span>
              </div>
            )}
          </div>
        </div>

        {/* Quick Access for Authenticated Users */}
        {isAuthenticated && (
          <>
            <Separator className="my-6" />
            <div className="bg-muted/50 rounded-lg p-4">
              <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
                <div className="flex items-center space-x-2">
                  <Sparkles className="h-5 w-5 text-primary" />
                  <span className="font-medium">Quick Access</span>
                </div>
                <div className="flex flex-wrap justify-center md:justify-end gap-2">
                  <Button variant="outline" size="sm" asChild>
                    <a href="/blog">
                      <BookOpen className="h-4 w-4 mr-2" />
                      Manage Posts
                    </a>
                  </Button>
                  <Button variant="outline" size="sm" asChild>
                    <a href="/blog?mode=create">
                      <Sparkles className="h-4 w-4 mr-2" />
                      Create Post
                    </a>
                  </Button>
                  {user?.role === "ADMIN" && (
                    <Button variant="outline" size="sm" asChild>
                      <a href="/admin">
                        <Shield className="h-4 w-4 mr-2" />
                        Admin Dashboard
                      </a>
                    </Button>
                  )}
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </footer>
  )
}
