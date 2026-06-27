// @ts-nocheck
// Legacy route — superseded by academic OS modules
import { NextResponse } from "next/server"

export async function GET() {
  return NextResponse.json({ data: [] })
}

export async function POST() {
  return NextResponse.json(
    { error: "This feature has been replaced by the academic OS modules." },
    { status: 410 }
  )
}
