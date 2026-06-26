import { NextResponse } from "next/server"
import { requireAuth, fail } from "@/lib/api-helpers"
import { generateCompletion } from "@/services/ai"
import { YoutubeTranscript } from "youtube-transcript"

function extractVideoId(url: string): string | null {
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/|youtube\.com\/v\/)([^&?#\s]{11})/,
    /^([a-zA-Z0-9_-]{11})$/,
  ]
  for (const p of patterns) {
    const m = url.match(p)
    if (m) return m[1]
  }
  return null
}

export async function POST(req: Request) {
  const auth = await requireAuth()
  if (auth.unauthorized) return auth.unauthorized

  try {
    const { url } = await req.json() as { url: string }
    if (!url) return fail("YouTube URL is required", 400)

    const videoId = extractVideoId(url.trim())
    if (!videoId) return fail("Invalid YouTube URL", 400)

    let transcript: string
    try {
      const segments = await YoutubeTranscript.fetchTranscript(videoId)
      transcript = segments.map((s) => s.text).join(" ")
      if (!transcript || transcript.trim().length < 50) {
        return fail("No transcript available for this video. Try a video with captions enabled.", 400)
      }
    } catch {
      return fail("Could not fetch transcript. The video may not have captions enabled.", 400)
    }

    // Truncate to ~8000 chars to fit in context
    const truncated = transcript.length > 8000 ? transcript.slice(0, 8000) + "..." : transcript

    const content = await generateCompletion({
      messages: [
        {
          role: "system",
          content: "You are an expert academic assistant that converts video lecture transcripts into structured study notes. Extract the main learning content clearly and concisely.",
        },
        {
          role: "user",
          content: `Convert this video transcript into structured study notes. Include: a brief summary (2-3 sentences), key topics as a numbered list, key concepts explained, and important takeaways.\n\nTranscript:\n${truncated}`,
        },
      ],
      maxTokens: 2000,
    })

    // Also extract metadata via a quick JSON call
    const metaJson = await generateCompletion({
      messages: [
        {
          role: "system",
          content: "Extract metadata from the following study notes. Return valid JSON only.",
        },
        {
          role: "user",
          content: `From these study notes, extract: { "title": "inferred lecture title", "topics": ["topic1", "topic2", "topic3"] }\n\nNotes:\n${content.slice(0, 1000)}`,
        },
      ],
      maxTokens: 200,
      responseFormat: "json",
    })

    let meta = { title: `YouTube Lecture ${videoId}`, topics: [] as string[] }
    try {
      meta = JSON.parse(metaJson)
    } catch {
      // use defaults
    }

    return NextResponse.json({
      content,
      title: meta.title,
      topics: meta.topics ?? [],
      video_id: videoId,
      url: `https://www.youtube.com/watch?v=${videoId}`,
    })
  } catch (err) {
    console.error("process-youtube error:", err)
    return fail("Failed to process YouTube video")
  }
}
