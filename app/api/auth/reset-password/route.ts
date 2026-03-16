import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"

const resetSchema = z.object({
  token: z.string().min(1),
  password: z.string().min(6),
})

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    resetSchema.parse(body)

    return NextResponse.json({ ok: true })
  } catch (err) {
    const message = err instanceof z.ZodError ? "Invalid reset payload" : "Reset failed"
    return NextResponse.json({ message }, { status: 400 })
  }
}
