import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'

interface SummaryOutputProps {
  summary: string
}

export function SummaryOutput({ summary }: SummaryOutputProps) {
  const handleCopy = () => {
    navigator.clipboard.writeText(summary)
    alert('Summary copied to clipboard!')
  }

  const handleSave = () => {
    const blob = new Blob([summary], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'summary.txt'
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="mt-6">
      <h2 className="text-lg font-semibold mb-2">Generated Summary</h2>
      <Textarea
        value={summary}
        readOnly
        className="w-full h-40 mb-2"
      />
      <div className="flex justify-end space-x-2">
        <Button onClick={handleCopy} disabled={!summary}>
          Copy to Clipboard
        </Button>
        <Button onClick={handleSave} disabled={!summary}>
          Save as .md
        </Button>
      </div>
    </div>
  )
}

