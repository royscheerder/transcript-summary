import { ChangeEvent } from 'react'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

interface PromptInputProps {
  onPromptChange: (prompt: string) => void
}

export function PromptInput({ onPromptChange }: PromptInputProps) {
  const handlePromptChange = (event: ChangeEvent<HTMLInputElement>) => {
    onPromptChange(event.target.value)
  }

  return (
    <div className="mb-4">
      <Label htmlFor="prompt-input" className="block text-sm font-medium text-gray-700">
        Enter your summary prompt
      </Label>
      <Input
        id="prompt-input"
        type="text"
        placeholder="E.g., Summarize for a business meeting"
        onChange={handlePromptChange}
        className="mt-1"
      />
    </div>
  )
}

