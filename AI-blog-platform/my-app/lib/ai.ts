export interface AIResponse {
  success: boolean
  data?: unknown
  error?: string
}

export interface TitleSuggestion {
  title: string
  reason: string
}

export interface ContentSummary {
  summary: string
  keyPoints: string[]
}

export interface SEOKeywords {
  keywords: string[]
  metaDescription: string
}

const GEMINI_API_KEY = process.env.GEMINI_API_KEY || "your-gemini-api-key-here"
const GEMINI_API_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent"

async function callGeminiAPI(prompt: string): Promise<string> {
  try {
    const response = await fetch(`${GEMINI_API_URL}?key=${GEMINI_API_KEY}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              {
                text: prompt,
              },
            ],
          },
        ],
        generationConfig: {
          temperature: 0.7,
          topK: 40,
          topP: 0.95,
          maxOutputTokens: 1024,
        },
      }),
    })

    if (!response.ok) {
      throw new Error(`Gemini API error: ${response.status}`)
    }

    const data = await response.json()
    let text = data.candidates[0]?.content?.parts[0]?.text || ""
    
    // Clean up markdown code blocks if present
    if (text.includes("```json")) {
      text = text.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim()
    }
    
    return text
  } catch (error) {
    console.error("Gemini API call failed:", error)
    throw error
  }
}

export async function generateTitleSuggestions(content: string, category?: string): Promise<TitleSuggestion[]> {
  const prompt = `Based on the following blog post content${
    category ? ` in the ${category} category` : ""
  }, suggest 5 compelling and SEO-friendly titles. For each title, provide a brief reason why it would be effective.

Content: "${content.substring(0, 1000)}..."

IMPORTANT: Respond ONLY with valid JSON in this exact format (no markdown, no code blocks):
{
  "suggestions": [
    {"title": "Example Title", "reason": "Why this title works"},
    {"title": "Another Title", "reason": "Why this works too"}
  ]
}`

  try {
    const response = await callGeminiAPI(prompt)
    const parsed = JSON.parse(response)
    return parsed.suggestions || []
  } catch (error) {
    console.error("Failed to generate title suggestions:", error)
    return []
  }
}

export async function generateContentSummary(content: string): Promise<ContentSummary> {
  const prompt = `Please summarize the following blog post content and extract key points:

Content: "${content}"

IMPORTANT: Respond ONLY with valid JSON in this exact format (no markdown, no code blocks):
{
  "summary": "A concise summary of the content",
  "keyPoints": ["Key point 1", "Key point 2", "Key point 3"]
}`

  try {
    const response = await callGeminiAPI(prompt)
    const parsed = JSON.parse(response)
    return {
      summary: parsed.summary || "",
      keyPoints: parsed.keyPoints || [],
    }
  } catch (error) {
    console.error("Failed to generate content summary:", error)
    return {
      summary: "",
      keyPoints: [],
    }
  }
}

export async function generateSEOKeywords(title: string, content: string, category?: string): Promise<SEOKeywords> {
  const prompt = `Based on the following blog post, generate SEO keywords and a meta description:

Title: "${title}"
Category: ${category || "General"}
Content: "${content.substring(0, 1500)}..."

IMPORTANT: Respond ONLY with valid JSON in this exact format (no markdown, no code blocks):
{
  "keywords": ["keyword1", "keyword2", "keyword3", "keyword4", "keyword5"],
  "metaDescription": "A compelling 150-160 character meta description for SEO"
}`

  try {
    const response = await callGeminiAPI(prompt)
    const parsed = JSON.parse(response)
    return {
      keywords: parsed.keywords || [],
      metaDescription: parsed.metaDescription || "",
    }
  } catch (error) {
    console.error("Failed to generate SEO keywords:", error)
    return {
      keywords: [],
      metaDescription: "",
    }
  }
}

export async function improveContent(
  content: string,
  improvementType: "grammar" | "clarity" | "engagement",
): Promise<string> {
  const improvements = {
    grammar: "Fix grammar, spelling, and punctuation errors while maintaining the original tone and meaning.",
    clarity: "Improve clarity and readability by simplifying complex sentences and organizing ideas better.",
    engagement:
      "Make the content more engaging by adding compelling hooks, better transitions, and more dynamic language.",
  }

  const prompt = `Please improve the following blog post content by focusing on ${improvementType}:

${improvements[improvementType]}

Original content:
"${content}"

Please respond with only the improved content, maintaining the same structure and format.`

  try {
    const response = await callGeminiAPI(prompt)
    return response.trim()
  } catch (error) {
    console.error("Failed to improve content:", error)
    return content
  }
}
