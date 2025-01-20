import { type NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  console.log("API route: Received request");

  try {
    // Ensure the environment variable is available
    const flaskUrl = process.env.FLASK_API_URL;
    if (!flaskUrl) {
      throw new Error("FLASK_API_URL is not defined in your environment variables.");
    }

    // Extract form data
    const formData = await req.formData();
    console.log(
      "API route: FormData received",
      Array.from(formData.entries()).map(([key, value]) =>
        `${key}: ${value instanceof File ? value.name : value}`
      )
    );

    console.log("API route: Sending request to Flask backend");

    // Make a request to the Flask API
    const flaskResponse = await fetch(`${flaskUrl}/api/summarize`, {
      method: "POST",
      body: formData,
    });

    console.log(
      "API route: Received response from Flask backend",
      flaskResponse.status,
      flaskResponse.statusText
    );

    // Read the response text
    const responseText = await flaskResponse.text();
    console.log("API route: Response text from Flask backend:", responseText);

    if (!flaskResponse.ok) {
      return NextResponse.json(
        { error: `Flask backend error: ${responseText}` },
        { status: flaskResponse.status }
      );
    }

    // Attempt to parse the Flask response as JSON
    let data;
    try {
      data = JSON.parse(responseText);
    } catch (e) {
      console.error("API route: Error parsing JSON:", e);
      return NextResponse.json(
        { error: `Failed to parse Flask backend response: ${responseText}` },
        { status: 500 }
      );
    }

    console.log("API route: Parsed response data", data);

    // Check for the expected property in the Flask response
    if (!data.summary) {
      console.error("API route: No summary in response:", data);
      return NextResponse.json(
        { error: "No summary returned from the server" },
        { status: 500 }
      );
    }

    // Return the successful response
    return NextResponse.json(data);
  } catch (error) {
    console.error("API route: Error:", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "An unknown error occurred in the API route",
      },
      { status: 500 }
    );
  }
}
