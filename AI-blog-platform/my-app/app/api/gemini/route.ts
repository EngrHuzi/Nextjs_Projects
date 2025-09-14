import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    // Extract user info from JWT or session (for demo, use userId from body)
    const { userId, prompt } = await request.json();
    if (!userId || !prompt) {
      return NextResponse.json({ error: "Missing user info or prompt" }, { status: 400 });
    }
    // Call Gemini API (now free for all users)
    const geminiRes = await fetch("https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=" + process.env.GEMINI_API_KEY, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] })
    });
    const geminiData = await geminiRes.json();
    return NextResponse.json(geminiData);
  } catch (error) {
    console.error("Gemini error:", error);
    return NextResponse.json({ error: "Gemini error", details: error instanceof Error ? error.message : error }, { status: 500 });
  }
}

