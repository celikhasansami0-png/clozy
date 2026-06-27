import { NextResponse } from "next/server"
import { requireAuth, fail } from "@/lib/api-helpers"
import { createClient } from "@/lib/supabase/server"

type EmbeddableTable = "learning_materials" | "knowledge_notes" | "research_papers"

async function generateEmbedding(text: string): Promise<number[] | null> {
  const voyageKey = process.env.VOYAGE_API_KEY
  const openaiKey = process.env.OPENAI_API_KEY

  if (voyageKey) {
    const res = await fetch("https://api.voyageai.com/v1/embeddings", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${voyageKey}` },
      body: JSON.stringify({ input: text.slice(0, 32000), model: "voyage-large-2" }),
    })
    if (!res.ok) return null
    const data = await res.json()
    return data.data?.[0]?.embedding ?? null
  }

  if (openaiKey) {
    const res = await fetch("https://api.openai.com/v1/embeddings", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${openaiKey}` },
      body: JSON.stringify({ input: text.slice(0, 8000), model: "text-embedding-3-small" }),
    })
    if (!res.ok) return null
    const data = await res.json()
    return data.data?.[0]?.embedding ?? null
  }

  return null
}

export async function POST(req: Request) {
  const auth = await requireAuth()
  if (auth.unauthorized) return auth.unauthorized

  const { table, id, text } = await req.json() as { table: EmbeddableTable; id: string; text: string }
  if (!table || !id || !text) return fail("Missing required fields", 400)

  const embedding = await generateEmbedding(text)
  if (!embedding) {
    return NextResponse.json({ message: "No embedding provider available (set VOYAGE_API_KEY or OPENAI_API_KEY)", embedded: false })
  }

  const supabase = await createClient()
  const { error } = await supabase
    .from(table)
    .update({ embedding })
    .eq("id", id)

  if (error) return fail("Failed to save embedding")

  return NextResponse.json({ message: "Embedding generated and saved", embedded: true, dimensions: embedding.length })
}

// Batch: embed all un-embedded rows for a given table
export async function GET(req: Request) {
  const auth = await requireAuth()
  if (auth.unauthorized) return auth.unauthorized

  const { searchParams } = new URL(req.url)
  const table = (searchParams.get("table") ?? "knowledge_notes") as EmbeddableTable

  const supabase = await createClient()

  const textColumn = table === "research_papers" ? "abstract" : "content"
  const { data: rows } = await supabase
    .from(table)
    .select(`id, ${textColumn}`)
    .is("embedding", null)
    .limit(20)

  if (!rows?.length) return NextResponse.json({ message: "No rows need embedding", processed: 0 })

  let processed = 0
  for (const row of rows) {
    const text = (row as Record<string, string>)[textColumn]
    if (!text) continue
    const embedding = await generateEmbedding(text)
    if (!embedding) break
    await supabase.from(table).update({ embedding }).eq("id", row.id)
    processed++
  }

  return NextResponse.json({ message: `Embedded ${processed} rows in ${table}`, processed })
}
