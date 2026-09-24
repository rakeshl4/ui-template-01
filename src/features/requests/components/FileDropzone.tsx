import { useRef, useState, type DragEvent } from 'react'
import { File, Upload, X } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import type { RequestAttachment } from '@/features/requests/schema'

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

const MAX_SIZE_BYTES = 10 * 1024 * 1024

interface FileDropzoneProps {
  value: RequestAttachment[]
  onChange: (attachments: RequestAttachment[]) => void
}

export function FileDropzone({ value, onChange }: FileDropzoneProps) {
  const [isDragging, setIsDragging] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  function addFiles(fileList: FileList | null) {
    if (!fileList || fileList.length === 0) return
    if (fileList.length > 1) {
      setError('Only one PDF file can be uploaded.')
      return
    }
    const file = fileList[0]
    const isPdf = file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf')
    if (!isPdf) {
      setError('Only PDF files are allowed.')
      return
    }
    if (file.size > MAX_SIZE_BYTES) {
      setError('The file must be 10MB or smaller.')
      return
    }
    setError(null)
    onChange([{ name: file.name, size: file.size, file }])
  }

  function handleDrop(e: DragEvent<HTMLDivElement>) {
    e.preventDefault()
    setIsDragging(false)
    addFiles(e.dataTransfer.files)
  }

  function removeAt(index: number) {
    setError(null)
    onChange(value.filter((_, i) => i !== index))
  }

  return (
    <div className="space-y-3">
      {value.length === 0 && (
        <div
          role="button"
          tabIndex={0}
          onClick={() => inputRef.current?.click()}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') inputRef.current?.click()
          }}
          onDragOver={(e) => {
            e.preventDefault()
            setIsDragging(true)
          }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={handleDrop}
          className={cn(
            'flex cursor-pointer flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed px-6 py-8 text-center transition-colors',
            isDragging ? 'border-ring bg-accent' : 'border-input hover:bg-accent/50',
          )}
        >
          <Upload className="text-muted-foreground size-6" />
          <p className="text-foreground text-sm">
            <span className="text-primary font-medium">Click to upload</span> or drag and drop
          </p>
          <p className="text-muted-foreground text-xs">One PDF file, up to 10MB</p>
          <input
            ref={inputRef}
            type="file"
            accept="application/pdf,.pdf"
            className="sr-only"
            onChange={(e) => {
              addFiles(e.target.files)
              e.target.value = ''
            }}
          />
        </div>
      )}

      {error && (
        <p role="alert" className="text-destructive text-sm">
          {error}
        </p>
      )}

      {value.length > 0 && (
        <ul className="space-y-2">
          {value.map((file, index) => (
            <li
              key={`${file.name}-${index}`}
              className="bg-card flex items-center justify-between gap-2 rounded-md border px-3 py-2 text-sm"
            >
              <span className="flex min-w-0 items-center gap-2">
                <File className="text-muted-foreground size-4 shrink-0" />
                <span className="truncate">{file.name}</span>
                <span className="text-muted-foreground shrink-0 text-xs">
                  {formatBytes(file.size)}
                </span>
              </span>
              <Button
                type="button"
                variant="ghost"
                size="icon-sm"
                aria-label={`Remove ${file.name}`}
                onClick={() => removeAt(index)}
              >
                <X className="size-4" />
              </Button>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
