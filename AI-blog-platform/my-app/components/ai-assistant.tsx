"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Separator } from "@/components/ui/separator"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Sparkles, Lightbulb, Search, Wand2, Loader2, Copy, Check } from "lucide-react"
import type { TitleSuggestion, ContentSummary, SEOKeywords } from "@/lib/ai"
import { useAuth } from "@/contexts/auth-context"

interface AIAssistantProps {
  title: string
  content: string
  category: string
  onTitleSelect: (title: string) => void
  onContentUpdate: (content: string) => void
  onTagsUpdate: (tags: string[]) => void
}

export function AIAssistant({
  title,
  content,
  category,
  onTitleSelect,
  onContentUpdate,
  onTagsUpdate,
}: AIAssistantProps) {
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(false)
  const [loadingAction, setLoadingAction] = useState<
    null | "titles" | "summary" | "seo" | "improve"
  >(null)
  const [titleSuggestions, setTitleSuggestions] = useState<TitleSuggestion[]>([])
  const [summary, setSummary] = useState<ContentSummary | null>(null)
  const [seoData, setSeoData] = useState<SEOKeywords | null>(null)
  const [error, setError] = useState<string | null>("")
  const [copiedStates, setCopiedStates] = useState<{ [key: string]: boolean }>({})
  const handleCopy = async (text: string, key: string) => {
    try {
      await navigator.clipboard.writeText(text)
      setCopiedStates({ ...copiedStates, [key]: true })
      setTimeout(() => {
        setCopiedStates({ ...copiedStates, [key]: false })
      }, 2000)
    } catch (err) {
      console.error("Failed to copy text:", err)
    }
  }


  if (!user) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            AI Assistant
          </CardTitle>
          <CardDescription>
            Please log in to use AI-powered blog features.
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  // Generate title suggestions using the dedicated API
  const generateTitleSuggestions = async () => {
    if (!content || content.length < 50) {
      setError("Please write at least 50 characters of content first")
      return
    }

    setIsLoading(true);
    setLoadingAction("titles");
    setError(null);
    try {
      const response = await fetch("/api/ai/suggest-titles", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content, category }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to generate title suggestions");
      }

      console.log("Title suggestions response:", data); // Debug log

      // Ensure we have suggestions array
      if (!data.suggestions || !Array.isArray(data.suggestions)) {
        throw new Error("Invalid response format from AI service");
      }

      // Format suggestions into the expected structure (TitleSuggestion has { title, reason })
      const formattedSuggestions: TitleSuggestion[] = data.suggestions.map(
        (suggestion: { title?: string; text?: string; reason?: string }) => ({
          title: suggestion.title || suggestion.text || "",
          reason: suggestion.reason || "",
        }),
      )
      
      console.log("Formatted suggestions:", formattedSuggestions); // Debug log
      setTitleSuggestions(formattedSuggestions);
    } catch (err) {
      console.error("Title suggestions error:", err);
      setError(err instanceof Error ? err.message : "Failed to generate title suggestions");
    } finally {
      setIsLoading(false);
      setLoadingAction(null);
    }
  }

  const generateSummary = async () => {
    if (!content || content.length < 100) {
      setError("Please write at least 100 characters of content first")
      return
    }

    setIsLoading(true)
    setLoadingAction("summary")
    setError("")

    try {
      const response = await fetch("/api/ai/summarize", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Failed to generate summary")
      }

      setSummary(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to generate summary")
    } finally {
      setIsLoading(false)
      setLoadingAction(null)
    }
  }

  const generateSEOKeywords = async () => {
    if (!title || !content) {
      setError("Please provide both title and content")
      return
    }

    setIsLoading(true)
    setLoadingAction("seo")
    setError("")

    try {
      const response = await fetch("/api/ai/seo-keywords", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, content, category }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Failed to generate SEO keywords")
      }

      setSeoData(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to generate SEO keywords")
    } finally {
      setIsLoading(false)
      setLoadingAction(null)
    }
  }

  const improveContent = async (improvementType: "grammar" | "clarity" | "engagement") => {
    if (!content || content.length < 50) {
      setError("Please write at least 50 characters of content first")
      return
    }

    setIsLoading(true)
    setLoadingAction("improve")
    setError("")

    try {
      const response = await fetch("/api/ai/improve-content", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content, improvementType }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Failed to improve content")
      }

      onContentUpdate(data.improvedContent)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to improve content")
    } finally {
      setIsLoading(false)
      setLoadingAction(null)
    }
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-base md:text-lg">
          <Sparkles className="h-4 w-4 md:h-5 md:w-5 text-primary" />
          AI Assistant
        </CardTitle>
        <CardDescription className="text-xs md:text-sm">Enhance your blog post with AI-powered suggestions</CardDescription>
      </CardHeader>
      <CardContent className="space-y-3 md:space-y-4">
        {error && (
          <Alert variant="destructive">
            <AlertDescription className="text-xs md:text-sm">{error}</AlertDescription>
          </Alert>
        )}

        <div className="grid grid-cols-2 lg:grid-cols-1 gap-2">
          <Button
            className="w-full justify-start gap-2 text-xs md:text-sm h-auto py-2.5 px-3"
            variant="outline"
            onClick={generateTitleSuggestions}
            disabled={isLoading && loadingAction !== "titles" ? true : loadingAction === "titles"}
          >
            {loadingAction === "titles" ? <Loader2 className="h-4 w-4 animate-spin shrink-0" /> : <Lightbulb className="h-4 w-4 shrink-0" />}
            <span className="truncate">Suggest Titles</span>
          </Button>

          <Button
            className="w-full justify-start gap-2 text-xs md:text-sm h-auto py-2.5 px-3"
            variant="outline"
            onClick={generateSummary}
            disabled={isLoading && loadingAction !== "summary" ? true : loadingAction === "summary"}
          >
            {loadingAction === "summary" ? <Loader2 className="h-4 w-4 animate-spin shrink-0" /> : <Search className="h-4 w-4 shrink-0" />}
            <span className="truncate">Summarize</span>
          </Button>

          <Button
            className="w-full justify-start gap-2 text-xs md:text-sm h-auto py-2.5 px-3"
            variant="outline"
            onClick={generateSEOKeywords}
            disabled={isLoading && loadingAction !== "seo" ? true : loadingAction === "seo"}
          >
            {loadingAction === "seo" ? <Loader2 className="h-4 w-4 animate-spin shrink-0" /> : <Search className="h-4 w-4 shrink-0" />}
            <span className="truncate">SEO Keywords</span>
          </Button>

          <Dialog>
            <DialogTrigger asChild>
              <Button
                className="w-full justify-start gap-2 text-xs md:text-sm h-auto py-2.5 px-3"
                variant="outline"
                disabled={isLoading && loadingAction !== "improve" ? true : loadingAction === "improve"}
              >
                <Wand2 className="h-4 w-4 shrink-0" />
                <span className="truncate">Improve Content</span>
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[480px]">
              <DialogHeader>
                <DialogTitle>Improve Content</DialogTitle>
                <DialogDescription>Choose how you&apos;d like to improve your content</DialogDescription>
              </DialogHeader>
              <div className="space-y-2">
                <Button
                  variant="outline"
                  className="w-full justify-start bg-transparent"
                  size="lg"
                  onClick={() => improveContent("grammar")}
                  disabled={isLoading}
                >
                  Fix Grammar &amp; Spelling
                </Button>
                <Button
                  variant="outline"
                  className="w-full justify-start bg-transparent"
                  size="lg"
                  onClick={() => improveContent("clarity")}
                  disabled={isLoading}
                >
                  Improve Clarity
                </Button>
                <Button
                  variant="outline"
                  className="w-full justify-start bg-transparent"
                  size="lg"
                  onClick={() => improveContent("engagement")}
                  disabled={isLoading}
                >
                  Make More Engaging
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {titleSuggestions.length > 0 && (
          <div className="space-y-2">
            <h4 className="font-medium text-sm md:text-base">Title Suggestions</h4>
            <ScrollArea className="h-40 md:h-48">
              <div className="space-y-2">
                {titleSuggestions.map((suggestion, index) => (
                  <div key={index} className="p-2 border rounded-lg">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                      <p className="font-bold text-xs md:text-sm flex-1 min-w-0 break-words">{suggestion.title}</p>
                      <div className="flex gap-1 flex-shrink-0">
                        <Button
                          size="sm"
                          variant="ghost"
                          className="h-7 w-7 p-0"
                          onClick={() => handleCopy(suggestion.title, `title-${index}`)}
                        >
                          {copiedStates[`title-${index}`] ? (
                            <Check className="h-3 w-3" />
                          ) : (
                            <Copy className="h-3 w-3" />
                          )}
                        </Button>
                        <Button size="sm" className="text-xs" onClick={() => {
                          console.log("Using title:", suggestion.title);
                          onTitleSelect(suggestion.title);
                        }}>
                          Use
                        </Button>
                      </div>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">{suggestion.reason}</p>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </div>
        )}

        {summary && (
          <div className="space-y-2">
            <h4 className="font-medium text-sm md:text-base">Content Summary</h4>
            <div className="p-2 md:p-3 bg-muted rounded-lg">
              <p className="text-xs md:text-sm mb-2">{summary.summary}</p>
              <Separator className="my-2" />
              <div className="space-y-1">
                <p className="text-xs font-medium">Key Points:</p>
                {summary.keyPoints.map((point, index) => (
                  <p key={index} className="text-xs text-muted-foreground">
                    • {point}
                  </p>
                ))}
              </div>
            </div>
          </div>
        )}

        {seoData && (
          <div className="space-y-2">
            <h4 className="font-medium text-sm md:text-base">SEO Suggestions</h4>
            <div className="p-2 md:p-3 bg-muted rounded-lg space-y-2">
              <div>
                <p className="text-xs font-medium mb-1">Keywords:</p>
                <div className="flex flex-wrap gap-1">
                  {seoData.keywords.map((keyword, index) => (
                    <Badge key={index} variant="secondary" className="text-xs">
                      {keyword}
                    </Badge>
                  ))}
                </div>
                <Button size="sm" variant="ghost" className="mt-1 text-xs h-7" onClick={() => onTagsUpdate(seoData.keywords)}>
                  Add as Tags
                </Button>
              </div>
              <Separator />
              <div>
                <p className="text-xs font-medium mb-1">Meta Description:</p>
                <p className="text-xs text-muted-foreground">{seoData.metaDescription}</p>
                <Button
                  size="sm"
                  variant="ghost"
                  className="mt-1"
                  onClick={() => handleCopy(seoData.metaDescription, "meta-desc")}
                >
                  {copiedStates["meta-desc"] ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
                  Copy
                </Button>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
