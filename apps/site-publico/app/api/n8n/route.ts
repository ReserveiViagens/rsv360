import { type NextRequest, NextResponse } from "next/server"

const N8N_WEBHOOK_URL = process.env.N8N_WEBHOOK_URL
const N8N_API_KEY = process.env.N8N_API_KEY

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    if (!N8N_WEBHOOK_URL) {
      return NextResponse.json({ error: "N8N webhook not configured" }, { status: 500 })
    }

    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 10000)

    const response = await fetch(N8N_WEBHOOK_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(N8N_API_KEY && { Authorization: `Bearer ${N8N_API_KEY}` }),
      },
      body: JSON.stringify(body),
      signal: controller.signal,
    })

    clearTimeout(timeoutId)

    if (response.ok) {
      const data = await response.json()
      return NextResponse.json(data)
    } else {
      return NextResponse.json({ error: "N8N request failed" }, { status: response.status })
    }
  } catch (error) {
    console.error("N8N API error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function GET() {
  try {
    if (!N8N_WEBHOOK_URL) {
      return NextResponse.json({ status: "disconnected" })
    }

    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 5000)

    const response = await fetch(`${N8N_WEBHOOK_URL}/status`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        ...(N8N_API_KEY && { Authorization: `Bearer ${N8N_API_KEY}` }),
      },
      signal: controller.signal,
    })

    clearTimeout(timeoutId)

    if (response.ok) {
      const data = await response.json()
      return NextResponse.json({ status: data.status || "connected" })
    } else {
      return NextResponse.json({ status: "error" })
    }
  } catch (error) {
    return NextResponse.json({ status: "offline" })
  }
}
