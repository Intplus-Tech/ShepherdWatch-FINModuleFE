import { useState, useCallback } from 'react'

export type FileUploadResponse = {
  _id: string
  url: string
  publicId: string
  fileName: string
  mimeType: string
  size: number
  folder?: string
  uploadedBy?: string
  isDeleted: boolean
}

export type FileUploadsListPayload = {
  data: FileUploadResponse[]
  total: number
  page: number
  limit: number
  pages: number
}

export type ListFilesParams = {
  page?: number
  limit?: number
  branchId?: string
  mimeType?: string
  folder?: string
}

interface UseFileUploadReturn {
  uploading: boolean
  error: string | null
  data: FileUploadResponse | null
  uploadFile: (file: File, folder?: string, branchId?: string) => Promise<FileUploadResponse>
  listFiles: (params?: ListFilesParams) => Promise<FileUploadsListPayload>
  getFileById: (id: string) => Promise<FileUploadResponse>
  updateFile: (id: string, file: File) => Promise<FileUploadResponse>
  deleteFile: (id: string) => Promise<boolean>
  reset: () => void
}

export function useFileUpload(): UseFileUploadReturn {
  const [uploading, setUploading] = useState<boolean>(false)
  const [error, setError] = useState<string | null>(null)
  const [data, setData] = useState<FileUploadResponse | null>(null)

  const uploadFile = useCallback(
    async (file: File, folder?: string, branchId?: string): Promise<FileUploadResponse> => {
      setUploading(true)
      setError(null)
      try {
        const formData = new FormData()
        formData.append("file", file)
        if (folder) formData.append("folder", folder)
        if (branchId) formData.append("branchId", branchId)

        const res = await fetch("/api/v1/core/file-uploads", {
          method: "POST",
          body: formData,
        })

        const resData = await res.json().catch(() => null)

        if (!res.ok) {
          throw new Error(resData?.message || "Failed to upload file")
        }

        const successData: FileUploadResponse = resData.data
        setData(successData)
        return successData
      } catch (err: any) {
        setError(err.message || "An error occurred during file upload.")
        throw err
      } finally {
        setUploading(false)
      }
    },
    []
  )

  const listFiles = useCallback(async (params: ListFilesParams = {}): Promise<FileUploadsListPayload> => {
    setError(null)
    const searchParams = new URLSearchParams()
    if (params.page) searchParams.set("page", String(params.page))
    if (params.limit) searchParams.set("limit", String(params.limit))
    if (params.branchId) searchParams.set("branchId", params.branchId)
    if (params.mimeType) searchParams.set("mimeType", params.mimeType)
    if (params.folder) searchParams.set("folder", params.folder)

    const query = searchParams.toString()
    const res = await fetch(`/api/v1/core/file-uploads${query ? `?${query}` : ""}`, {
      method: "GET",
    })

    const resData = await res.json().catch(() => null)

    if (!res.ok) {
      const message = resData?.message || "Failed to fetch files"
      setError(message)
      throw new Error(message)
    }

    return resData.data as FileUploadsListPayload
  }, [])

  const getFileById = useCallback(async (id: string): Promise<FileUploadResponse> => {
    setError(null)
    const res = await fetch(`/api/v1/core/file-uploads/${encodeURIComponent(id)}`, {
      method: "GET",
    })

    const resData = await res.json().catch(() => null)

    if (!res.ok) {
      const message = resData?.message || "Failed to fetch file"
      setError(message)
      throw new Error(message)
    }

    return resData.data as FileUploadResponse
  }, [])

  const updateFile = useCallback(async (id: string, file: File): Promise<FileUploadResponse> => {
    setUploading(true)
    setError(null)
    try {
      const formData = new FormData()
      formData.append("file", file)

      const res = await fetch(`/api/v1/core/file-uploads/${encodeURIComponent(id)}`, {
        method: "PATCH",
        body: formData,
      })

      const resData = await res.json().catch(() => null)

      if (!res.ok) {
        throw new Error(resData?.message || "Failed to update file")
      }

      const successData: FileUploadResponse = resData.data
      setData(successData)
      return successData
    } catch (err: any) {
      setError(err.message || "An error occurred during file update.")
      throw err
    } finally {
      setUploading(false)
    }
  }, [])

  const deleteFile = useCallback(async (id: string): Promise<boolean> => {
    setUploading(true)
    setError(null)
    try {
      const res = await fetch(`/api/v1/core/file-uploads/${encodeURIComponent(id)}`, {
        method: "DELETE",
      })

      const resData = await res.json().catch(() => null)

      if (!res.ok) {
        throw new Error(resData?.message || "Failed to delete file")
      }

      if (data?._id === id) {
        setData(null)
      }
      return true
    } catch (err: any) {
      setError(err.message || "An error occurred during file deletion.")
      throw err
    } finally {
      setUploading(false)
    }
  }, [data])

  const reset = useCallback(() => {
    setData(null)
    setError(null)
    setUploading(false)
  }, [])

  return { uploadFile, listFiles, getFileById, updateFile, deleteFile, uploading, error, data, reset }
}
