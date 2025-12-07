"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Facebook, Twitter, Linkedin, Link2, Check, MessageCircle, Mail, Send } from "lucide-react"
import { FaReddit, FaWhatsapp } from "react-icons/fa"

interface ShareButtonsProps {
  title: string
  slug: string
}

export function ShareButtons({ title, slug }: ShareButtonsProps) {
  const [copied, setCopied] = useState(false)

  // Construct the full URL for the blog post
  const url = typeof window !== 'undefined'
    ? `${window.location.origin}/blog?view=${slug}`
    : `https://aiblogify.vercel.app/blog?view=${slug}`

  const encodedUrl = encodeURIComponent(url)
  const encodedTitle = encodeURIComponent(title)

  const shareLinks = {
    twitter: `https://twitter.com/intent/tweet?text=${encodedTitle}&url=${encodedUrl}`,
    facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}&quote=${encodedTitle}`,
    linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`,
    whatsapp: `https://wa.me/?text=${encodedTitle}%20${encodedUrl}`,
    reddit: `https://reddit.com/submit?url=${encodedUrl}&title=${encodedTitle}`,
    telegram: `https://t.me/share/url?url=${encodedUrl}&text=${encodedTitle}`,
    email: `mailto:?subject=${encodedTitle}&body=Check out this post: ${encodedUrl}`,
  }

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(url)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      console.error('Failed to copy:', err)
    }
  }

  const handleShare = (platform: string) => {
    if (typeof window === 'undefined') return

    const link = shareLinks[platform as keyof typeof shareLinks]
    if (platform === 'email') {
      window.location.href = link
    } else {
      window.open(link, '_blank', 'noopener,noreferrer,width=600,height=600')
    }
  }

  return (
    <div className="flex flex-col gap-3">
      <h3 className="text-sm font-semibold text-muted-foreground">Share this post</h3>
      <div className="flex flex-wrap gap-2">
        {/* Twitter/X */}
        <Button
          variant="outline"
          size="sm"
          onClick={() => handleShare('twitter')}
          className="gap-2"
          title="Share on X (Twitter)"
        >
          <Twitter className="h-4 w-4" />
          <span className="hidden sm:inline">X</span>
        </Button>

        {/* Facebook */}
        <Button
          variant="outline"
          size="sm"
          onClick={() => handleShare('facebook')}
          className="gap-2"
          title="Share on Facebook"
        >
          <Facebook className="h-4 w-4" />
          <span className="hidden sm:inline">Facebook</span>
        </Button>

        {/* WhatsApp */}
        <Button
          variant="outline"
          size="sm"
          onClick={() => handleShare('whatsapp')}
          className="gap-2"
          title="Share on WhatsApp"
        >
          <FaWhatsapp className="h-4 w-4" />
          <span className="hidden sm:inline">WhatsApp</span>
        </Button>

        {/* LinkedIn */}
        <Button
          variant="outline"
          size="sm"
          onClick={() => handleShare('linkedin')}
          className="gap-2"
          title="Share on LinkedIn"
        >
          <Linkedin className="h-4 w-4" />
          <span className="hidden sm:inline">LinkedIn</span>
        </Button>

        {/* Reddit */}
        <Button
          variant="outline"
          size="sm"
          onClick={() => handleShare('reddit')}
          className="gap-2"
          title="Share on Reddit"
        >
          <FaReddit className="h-4 w-4" />
          <span className="hidden sm:inline">Reddit</span>
        </Button>

        {/* Telegram */}
        <Button
          variant="outline"
          size="sm"
          onClick={() => handleShare('telegram')}
          className="gap-2"
          title="Share on Telegram"
        >
          <Send className="h-4 w-4" />
          <span className="hidden sm:inline">Telegram</span>
        </Button>

        {/* Email */}
        <Button
          variant="outline"
          size="sm"
          onClick={() => handleShare('email')}
          className="gap-2"
          title="Share via Email"
        >
          <Mail className="h-4 w-4" />
          <span className="hidden sm:inline">Email</span>
        </Button>

        {/* Copy Link */}
        <Button
          variant="outline"
          size="sm"
          onClick={copyToClipboard}
          className="gap-2"
          title="Copy link to clipboard"
        >
          {copied ? (
            <>
              <Check className="h-4 w-4" />
              <span className="hidden sm:inline">Copied!</span>
            </>
          ) : (
            <>
              <Link2 className="h-4 w-4" />
              <span className="hidden sm:inline">Copy Link</span>
            </>
          )}
        </Button>
      </div>
    </div>
  )
}
