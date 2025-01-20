"use client"

import { useState, type FormEvent } from "react"
import { FileSelector } from "./components/FileSelector"
import { PromptInput } from "./components/PromptInput"
import { SummaryOutput } from "./components/SummaryOutput"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

export default function TranscriptSummaryApp() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [prompt, setPrompt] = useState("")
  const [summary, setSummary] = useState("")
  const [isProcessing, setIsProcessing] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleFileSelect = (file: File) => {
    setSelectedFile(file)
    setError(null)
  }

  const handlePromptChange = (newPrompt: string) => {
    setPrompt(newPrompt)
    setError(null)
  }

  const handleGenerateSummary = async (e: FormEvent) => {
    e.preventDefault()
    if (!selectedFile || !prompt) {
      setError("Please select a file and enter a prompt.")
      return
    }

    setIsProcessing(true)
    setError(null)
    setSummary("")

    const formData = new FormData()
    formData.append("file", selectedFile)
    formData.append("prompt", prompt)

    try {
      console.log("Sending request to /api/summarize")
      console.log(
        "FormData contents:",
        Array.from(formData.entries()).map(([key, value]) => `${key}: ${value instanceof File ? value.name : value}`),
      )

      const response = await fetch("/api/summarize", {
        method: "POST",
        body: formData,
      })

      console.log("Response received:", response.status, response.statusText)

      const responseText = await response.text()
      console.log("Response text:", responseText)

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}. Response: ${responseText}`)
      }

      let data
      try {
        data = JSON.parse(responseText)
      } catch (e) {
        console.error("Error parsing JSON:", e)
        throw new Error(`Failed to parse server response: ${responseText}`)
      }

      console.log("Data received:", data)

      if (data.summary) {
        setSummary(data.summary)
      } else if (data.error) {
        throw new Error(data.error)
      } else {
        throw new Error("No summary or error returned from the server")
      }
    } catch (error) {
      console.error("Error:", error)
      setError(
        `An error occurred while generating the summary: ${error instanceof Error ? error.message : JSON.stringify(error)}`,
      )
    } finally {
      setIsProcessing(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-100 py-8 px-4 sm:px-6 lg:px-8">
      <Card className="max-w-4xl mx-auto">
        <CardContent className="p-6">
          <h1 className="text-2xl font-bold mb-6">Transcript Summary Application</h1>
          {error && (
            <Alert variant="destructive" className="mb-4">
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          <form onSubmit={handleGenerateSummary}>
            <FileSelector onFileSelect={handleFileSelect} />
            <PromptInput onPromptChange={handlePromptChange} />
            <Button type="submit" disabled={!selectedFile || !prompt || isProcessing} className="mt-4 w-full">
              {isProcessing ? "Processing..." : "Generate Summary"}
            </Button>
          </form>
          <SummaryOutput summary={summary} />
        </CardContent>
      </Card>
    </div>
  )
}

