"use client"

import React, { useCallback, useEffect, useRef, useState } from "react"
import { CloudUpload, File, X, CheckCircle2, Loader2, Image as ImageIcon } from "lucide-react"
import { useFileUpload, FileUploadResponse } from "../hooks/useFileUpload"

interface FileUploadDropzoneProps {
  onUploadComplete?: (data: FileUploadResponse) => void
  onClear?: () => void
  folder?: string
  branchId?: string
  fileId?: string
  allowReplace?: boolean
  maxSizeMB?: number
  acceptedTypes?: string // e.g. "image/*,application/pdf"
  label?: string
  className?: string
  initialData?: FileUploadResponse | null
}

export default function FileUploadDropzone({
  onUploadComplete,
  onClear,
  folder = "general",
  branchId,
  fileId,
  allowReplace = true,
  maxSizeMB = 10,
  acceptedTypes = "image/jpeg,image/png,image/gif,application/pdf",
  label = "Upload a file",
  className = "",
  initialData = null,
}: FileUploadDropzoneProps) {
  const [isDragActive, setIsDragActive] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)
  const [resolvedFile, setResolvedFile] = useState<FileUploadResponse | null>(null)
  
  const { uploadFile, getFileById, updateFile, deleteFile, uploading, error, data, reset } = useFileUpload()
  
  // Track successful upload metadata or initial existing file metadata
  const activeFile = data || resolvedFile || initialData

  useEffect(() => {
    let isMounted = true
    if (!fileId) {
      setResolvedFile(null)
      return
    }

    getFileById(fileId)
      .then((file) => {
        if (isMounted) setResolvedFile(file)
      })
      .catch((err) => {
        console.error("Unable to resolve file by id", err)
        if (isMounted) setResolvedFile(null)
      })

    return () => {
      isMounted = false
    }
  }, [fileId, getFileById])

  const handleFile = async (file: File) => {
    // Validate size
    if (file.size > maxSizeMB * 1024 * 1024) {
      alert(`File size exceeds ${maxSizeMB}MB limit.`)
      return
    }

    try {
      const targetId = fileId || activeFile?._id
      const res = targetId && allowReplace
        ? await updateFile(targetId, file)
        : await uploadFile(file, folder, branchId)
      if (onUploadComplete) {
        onUploadComplete(res)
      }
    } catch (err) {
      console.error("Upload failed", err)
    }
  }

  const onDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragActive(true)
  }, [])

  const onDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragActive(false)
  }, [])

  const onDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault()
      e.stopPropagation()
      setIsDragActive(false)
      if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
        handleFile(e.dataTransfer.files[0])
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [uploadFile, folder, branchId, maxSizeMB]
  )

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      handleFile(e.target.files[0])
    }
  }

  const handleClear = async (e: React.MouseEvent) => {
    e.stopPropagation() // Prevent triggering the click to upload
    
    // Soft-delete if the file exists structurally
    if (activeFile && activeFile._id) {
      try {
        await deleteFile(activeFile._id)
      } catch (err) {
        console.error("Soft-deletion failed:", err)
      }
    }

    reset()
    if (inputRef.current) inputRef.current.value = ""
    setResolvedFile(null)
    if (onClear) onClear()
  }

  // Active uploaded state
  if (activeFile) {
    const isImage = activeFile.mimeType?.startsWith("image/")

    return (
      <div className={`relative border border-[#EEF1F6] rounded-[10px] p-4 bg-white flex items-center justify-between ${className}`}>
        <input
          ref={inputRef}
          type="file"
          accept={acceptedTypes}
          className="hidden"
          onChange={handleInputChange}
          disabled={uploading}
        />
        <div className="flex items-center gap-4 overflow-hidden">
          <div className="h-10 w-10 shrink-0 bg-[#F3F5F9] rounded-lg flex items-center justify-center">
            {isImage ? (
              <img src={activeFile.url} alt={activeFile.fileName} className="h-full w-full object-cover rounded-lg" />
            ) : (
              <File className="h-5 w-5 text-[#3B5BDB]" />
            )}
          </div>
          <div className="flex flex-col truncate">
            <span className="text-[14px] font-[600] text-[#111827] truncate">
              {activeFile.fileName || "Uploaded File"}
            </span>
            <div className="flex items-center gap-2 mt-0.5">
              <CheckCircle2 className="h-3 w-3 text-emerald-500" />
              <span className="text-[11px] text-[#6B7280]">
                {(activeFile.size / 1024 / 1024).toFixed(2)} MB • {activeFile.mimeType || "File"}
              </span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          {allowReplace && (
            <button
              type="button"
              onClick={() => inputRef.current?.click()}
              className="h-8 px-3 rounded-[8px] border border-[#E5E7EB] bg-white text-[11.5px] font-[700] text-[#4B5563] hover:bg-gray-50 transition-colors"
              disabled={uploading}
            >
              Replace
            </button>
          )}
          <button
            type="button"
            onClick={handleClear}
            className="p-2 h-8 w-8 ml-1 flex items-center justify-center rounded-full hover:bg-rose-50 text-[#9CA3AF] hover:text-rose-600 transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className={`flex flex-col gap-1.5 ${className}`}>
      <div
        onClick={() => inputRef.current?.click()}
        onDragOver={onDragOver}
        onDragLeave={onDragLeave}
        onDrop={onDrop}
        className={`border-2 border-dashed rounded-[10px] flex flex-col items-center justify-center py-7 sm:py-8 transition-all cursor-pointer group ${
          isDragActive 
            ? "border-[#3B5BDB] bg-[#F8FAFC]" 
            : error 
              ? "border-rose-300 bg-rose-50 hover:bg-rose-100" 
              : "border-[#CBD5E1] bg-white hover:bg-gray-50/50"
        }`}
      >
        <input
          ref={inputRef}
          type="file"
          accept={acceptedTypes}
          className="hidden"
          onChange={handleInputChange}
          disabled={uploading}
        />

        {uploading ? (
          <div className="flex flex-col items-center">
            <Loader2 className="h-7 w-7 sm:h-8 sm:w-8 text-[#3B5BDB] mb-3 animate-spin" />
            <div className="text-[#3B5BDB] text-[14px] font-[600]">Uploading...</div>
          </div>
        ) : (
          <>
            <CloudUpload 
              className={`h-7 w-7 sm:h-8 sm:w-8 mb-3 transition-colors stroke-[2px] ${
               isDragActive ? "text-[#3B5BDB]" : error ? "text-rose-400" : "text-[#9CA3AF] group-hover:text-[#6B7280]"
              }`} 
            />
            <div className={`text-[14.5px] font-[500] ${error ? "text-rose-600" : "text-[#4B5563]"}`}>
              {error ? "Upload failed. Try again." : (
                <>
                  <span className="text-[#2563EB] font-[700]">{label}</span> or drag and drop
                </>
              )}
            </div>
            <div className={`text-[12px] sm:text-[12.5px] font-[500] mt-1 tracking-wide ${error ? "text-rose-500" : "text-[#9CA3AF]"}`}>
               Up to {maxSizeMB}MB
            </div>
          </>
        )}
      </div>
      {error && <span className="text-rose-600 text-[12px] font-[600]">{error}</span>}
    </div>
  )
}
