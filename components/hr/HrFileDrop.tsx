"use client"

import { useRef, useState } from "react"
import { FileText, Loader2, UploadCloud, X } from "lucide-react"

import { useFileUpload } from "@/components/hooks/useFileUpload"
import { cn } from "@/lib/utils"

export type UploadedFile = {
  id: string
  name: string
  url: string
  size: number
  mimeType: string
}

const MAX_BYTES = 5 * 1024 * 1024

/**
 * Drag-and-drop uploader that returns hosted file URLs.
 *
 * The HR write endpoints store URLs, not bytes (`supportingDocumentUrls`,
 * `fileUrl`, leave `attachments`), so files go through `/file-uploads` first and
 * only the resulting URL is submitted with the form.
 */
export function HrFileDrop({
  files,
  onChange,
  folder = "hr",
  branchId,
  accept = ".pdf,.png,.jpg,.jpeg",
  hint = "PDF, PNG, or JPG (Max 5MB)",
  disabled,
}: {
  files: UploadedFile[]
  onChange: (files: UploadedFile[]) => void
  folder?: string
  branchId?: string
  accept?: string
  hint?: string
  disabled?: boolean
}) {
  const inputRef = useRef<HTMLInputElement>(null)
  const { uploadFile, uploading } = useFileUpload()
  const [dragging, setDragging] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleFiles(list: FileList | null) {
    if (!list || list.length === 0) return
    setError(null)

    const next: UploadedFile[] = []
    for (const file of Array.from(list)) {
      if (file.size > MAX_BYTES) {
        setError(`${file.name} is larger than 5MB.`)
        continue
      }
      try {
        const uploaded = await uploadFile(file, folder, branchId)
        next.push({
          id: uploaded._id,
          name: uploaded.fileName || file.name,
          url: uploaded.url,
          size: uploaded.size ?? file.size,
          mimeType: uploaded.mimeType ?? file.type,
        })
      } catch (err) {
        setError(err instanceof Error ? err.message : `Couldn't upload ${file.name}.`)
      }
    }

    if (next.length > 0) onChange([...files, ...next])
  }

  return (
    <div>
      <div
        onDragOver={(e) => {
          e.preventDefault()
          if (!disabled) setDragging(true)
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={(e) => {
          e.preventDefault()
          setDragging(false)
          if (!disabled) handleFiles(e.dataTransfer.files)
        }}
        onClick={() => !disabled && inputRef.current?.click()}
        className={cn(
          "mt-1.5 flex cursor-pointer flex-col items-center rounded-xl border-2 border-dashed px-6 py-8 text-center transition-colors",
          dragging ? "border-[#2563EB] bg-[#EFF6FF]" : "border-[#D1D5DB] bg-[#F9FAFB]",
          disabled && "cursor-not-allowed opacity-60",
        )}
      >
        {uploading ? (
          <Loader2 className="h-9 w-9 animate-spin text-[#2563EB]" />
        ) : (
          <UploadCloud className="h-9 w-9 text-[#9CA3AF]" />
        )}
        <div className="mt-3 text-[14px] font-semibold text-[#111827]">
          {uploading ? "Uploading…" : "Drag & drop files or browse"}
        </div>
        <div className="text-[12px] text-[#6B7280]">{hint}</div>
        <input
          ref={inputRef}
          type="file"
          multiple
          accept={accept}
          disabled={disabled}
          onChange={(e) => {
            handleFiles(e.target.files)
            e.target.value = ""
          }}
          className="hidden"
        />
      </div>

      {error && <p className="mt-2 text-[12px] font-medium text-red-600">{error}</p>}

      {files.length > 0 && (
        <ul className="mt-3 space-y-2">
          {files.map((file) => (
            <li
              key={file.id}
              className="flex items-center gap-3 rounded-md border border-[#EEF1F6] bg-white px-3 py-2"
            >
              <FileText className="h-4 w-4 shrink-0 text-[#6B7280]" />
              <span className="min-w-0 flex-1 truncate text-[12px] text-[#111827]">
                {file.name}
              </span>
              <span className="shrink-0 text-[11px] text-[#9CA3AF]">
                {(file.size / 1024).toFixed(0)} KB
              </span>
              <button
                type="button"
                onClick={() => onChange(files.filter((f) => f.id !== file.id))}
                aria-label={`Remove ${file.name}`}
                className="flex h-6 w-6 shrink-0 items-center justify-center rounded text-[#9CA3AF] hover:bg-gray-100 hover:text-[#111827]"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
