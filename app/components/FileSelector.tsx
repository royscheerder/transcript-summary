import { ChangeEvent } from 'react'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

interface FileSelectorProps {
  onFileSelect: (file: File) => void
}

export function FileSelector({ onFileSelect }: FileSelectorProps) {
  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file && file.name.endsWith('.docx')) {
      onFileSelect(file)
    } else {
      alert('Please select a valid .docx file.')
    }
  }

  return (
    <div className="mb-4">
      <Label htmlFor="file-upload" className="block text-sm font-medium text-gray-700">
        Select a .docx file
      </Label>
      <Input
        id="file-upload"
        type="file"
        accept=".docx"
        onChange={handleFileChange}
        className="mt-1"
      />
    </div>
  )
}

