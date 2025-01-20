import { type NextRequest, NextResponse } from "next/server"

export async function POST(req: NextRequest) {
  console.log("API route: Received request")

  try {
    const formData = await req.formData()
    console.log(
      "API route: FormData received",
      Array.from(formData.entries()).map(([key, value]) => `${key}: ${value instanceof File ? value.name : value}`),
    )

    console.log("API route: Sending request to Flask backend")
    const flaskResponse = await fetch("http://localhost:5000/api/summarize", {
      method: "POST",
      body: formData,
    })

    console.log("API route: Received response from Flask backend", flaskResponse.status, flaskResponse.statusText)

    const responseText = await flaskResponse.text()
    console.log("API route: Response text from Flask backend:", responseText)

    if (!flaskResponse.ok) {
      return NextResponse.json({ error: `Flask backend error: ${responseText}` }, { status: flaskResponse.status })
    }

    let data
    try {
      data = JSON.parse(responseText)
    } catch (e) {
      console.error("API route: Error parsing JSON:", e)
      return NextResponse.json({ error: `Failed to parse Flask backend response: ${responseText}` }, { status: 500 })
    }

    console.log("API route: Parsed response data", data)

    if (!data.summary) {
      console.error("API route: No summary in response:", data)
      return NextResponse.json({ error: "No summary returned from the server" }, { status: 500 })
    }
    return NextResponse.json(data)
  } catch (error) {
    console.error("API route: Error:", error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "An unknown error occurred in the API route" },
      { status: 500 },
    )
  }
}

