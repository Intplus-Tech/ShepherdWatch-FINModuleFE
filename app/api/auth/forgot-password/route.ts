import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"

const forgotSchema = z.object({
  email: z.string().email(),
})

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    forgotSchema.parse(body)

    return NextResponse.json({ ok: true })
  } catch (err) {
    const message = err instanceof z.ZodError ? "Invalid email" : "Request failed"
    return NextResponse.json({ message }, { status: 400 })
  }
}
