import { API_V1 } from "@/lib/api";
"use client"

import React, { useState, useRef } from "react"
import { X, CloudUpload, Loader2, FileCheck, Trash2 } from "lucide-react"
import { useMutation } from "@tanstack/react-query"
import axios from "axios"

type AddNewAssetModalProps = {
  isOpen: boolean;
  onClose: () => void;
}

export default function AddNewAssetModal({ isOpen, onClose }: AddNewAssetModalProps) {
  const [dragActive, setDragActive] = useState(false)



  const fileInputRef = useRef<HTMLInputElement>(null)
  const [uploadedFile, setUploadedFile] = useState<any>(null)

  const uploadMutation = useMutation({
    mutationFn: async (file: File) => {
      const formData = new FormData()
      formData.append("file", file)
      formData.append("folder", "assets")
      
      const response = await axios.post(`${API_V1}/file-uploads`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
        withCredentials: true,
      })
      return response.data
    },
    onSuccess: (data) => {
      setUploadedFile(data?.data)
    },
    onError: (error) => {
      console.error("Failed to upload file:", error)
      alert("Failed to upload file. Please try again.")
    }
  })

  const processFile = (file: File) => {
    if (file.size > 10 * 1024 * 1024) {
      alert("File size exceeds 10MB limit.")
      return
    }
    uploadMutation.mutate(file)
  }

  if (!isOpen) return null;

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true)
    } else if (e.type === "dragleave") {
      setDragActive(false)
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFile(e.dataTransfer.files[0])
    }
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      processFile(e.target.files[0])
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#111827]/40 backdrop-blur-sm px-4">
      <div 
        className="w-full max-w-[400px] max-h-[90vh] rounded-[16px] bg-white shadow-2xl flex flex-col overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-start justify-between px-6 pt-5 pb-3">
          <div>
            <h2 className="text-[17px] font-extrabold tracking-tight text-[#111827]">Add New Asset</h2>
            <p className="text-[12px] font-medium text-[#6B7280] mt-0.5">Enter details for the new inventory item.</p>
          </div>
          <button 
            onClick={onClose}
            className="text-[#6B7280] hover:bg-gray-100 p-1.5 rounded-full transition-colors"
          >
            <X className="h-4 w-4" strokeWidth={2.5} />
          </button>
        </div>

        {/* Form Body - Scrollable */}
        <div className="px-6 py-1 overflow-y-auto flex-1">
          <form className="flex flex-col gap-3">
            {/* Row 1 */}
            <div className="grid grid-cols-2 gap-3">
              <div className="flex flex-col gap-1.5">
                <label className="text-[12px] font-bold text-[#111827]">Asset Type</label>
                <div className="relative">
                  <select className="h-9 w-full appearance-none rounded-[8px] border border-[#E5E7EB] bg-[#F9FAFB] px-3 text-[12px] font-medium text-[#111827] outline-none focus:border-[#3B5BDB] focus:bg-white focus:ring-1 focus:ring-[#3B5BDB] cursor-pointer">
                    <option>Current Asset: Cash/Supplies</option>
                    <option>Non-Current Asset</option>
                  </select>
                  <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-gray-500">
                    <svg width="10" height="6" viewBox="0 0 10 6" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M1 1L5 5L9 1" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </div>
                </div>
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-[12px] font-bold text-[#111827]">Category</label>
                <div className="relative">
                  <select className="h-9 w-full appearance-none rounded-[8px] border border-[#E5E7EB] bg-[#F9FAFB] px-3 text-[12px] font-medium text-[#6B7280] outline-none focus:border-[#3B5BDB] focus:bg-white focus:ring-1 focus:ring-[#3B5BDB] cursor-pointer">
                    <option>Select Category...</option>
                    <option>Motor Vehicle</option>
                    <option>IT Equipment</option>
                    <option>Furniture</option>
                  </select>
                  <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-gray-500">
                    <svg width="10" height="6" viewBox="0 0 10 6" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M1 1L5 5L9 1" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </div>
                </div>
              </div>
            </div>

            {/* Row 2 */}
            <div className="flex flex-col gap-1.5">
              <label className="text-[12px] font-bold text-[#111827]">Asset Name / Description</label>
              <input 
                type="text" 
                placeholder="e.g. MacBook Pro 16-inch M2" 
                className="h-9 w-full rounded-[8px] border border-[#E5E7EB] bg-[#F9FAFB] px-3 text-[12px] font-medium text-[#111827] placeholder:text-[#9CA3AF] outline-none focus:border-[#3B5BDB] focus:bg-white focus:ring-1 focus:ring-[#3B5BDB]"
              />
            </div>

            {/* Row 3 */}
            <div className="flex flex-col gap-1.5">
              <label className="text-[12px] font-bold text-[#111827]">Serial Number</label>
              <input 
                type="text" 
                className="h-9 w-full rounded-[8px] border border-[#E5E7EB] bg-[#F9FAFB] px-3 text-[12px] font-medium text-[#111827] outline-none focus:border-[#3B5BDB] focus:bg-white focus:ring-1 focus:ring-[#3B5BDB]"
              />
            </div>

            {/* Row 4 */}
            <div className="flex flex-col gap-1.5">
              <label className="text-[12px] font-bold text-[#111827]">Technical Specifications</label>
              <textarea 
                rows={2}
                className="w-full rounded-[8px] border border-[#E5E7EB] bg-[#F9FAFB] p-3 text-[12px] font-medium text-[#111827] outline-none focus:border-[#3B5BDB] focus:bg-white focus:ring-1 focus:ring-[#3B5BDB] resize-none"
              ></textarea>
            </div>

            {/* Row 5 */}
            <div className="flex flex-col gap-1.5">
              <label className="text-[12px] font-bold text-[#111827]">Responsible</label>
              <input 
                type="text" 
                placeholder="who is responsible for this asset?" 
                className="h-9 w-full rounded-[8px] border border-[#E5E7EB] bg-[#F9FAFB] px-3 text-[12px] font-medium text-[#111827] placeholder:text-[#9CA3AF] outline-none focus:border-[#3B5BDB] focus:bg-white focus:ring-1 focus:ring-[#3B5BDB]"
              />
            </div>

            {/* Row 6 */}
            <div className="grid grid-cols-[1.5fr_1fr_1.5fr] gap-3">
              <div className="flex flex-col gap-1.5">
                <label className="text-[12px] font-bold text-[#111827]">Acquisition Date</label>
                <div className="relative">
                  <input 
                    type="date" 
                    className="h-9 w-full rounded-[8px] border border-[#E5E7EB] bg-[#F9FAFB] px-3 pr-8 text-[12px] font-medium text-[#6B7280] outline-none focus:border-[#3B5BDB] focus:bg-white focus:ring-1 focus:ring-[#3B5BDB]"
                  />
                </div>
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-[12px] font-bold text-[#111827]">Cost (₦)</label>
                <input 
                  type="text" 
                  className="h-9 w-full rounded-[8px] border border-[#E5E7EB] bg-[#F9FAFB] px-3 text-[12px] font-medium text-[#111827] outline-none focus:border-[#3B5BDB] focus:bg-white focus:ring-1 focus:ring-[#3B5BDB]"
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-[12px] font-bold text-[#111827]">Initial Condition</label>
                <div className="relative">
                  <select className="h-9 w-full appearance-none rounded-[8px] border border-[#E5E7EB] bg-[#F9FAFB] px-3 text-[12px] font-bold text-[#111827] outline-none focus:border-[#3B5BDB] focus:bg-white focus:ring-1 focus:ring-[#3B5BDB] cursor-pointer">
                    <option>Brand New</option>
                    <option>Good</option>
                    <option>Fair</option>
                    <option>Poor</option>
                  </select>
                  <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-gray-500">
                    <svg width="10" height="6" viewBox="0 0 10 6" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M1 1L5 5L9 1" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </div>
                </div>
              </div>
            </div>

            {/* Row 7 - File Upload */}
            <div className="flex flex-col gap-1.5 mt-1 mb-1">
              <label className="text-[12px] font-bold text-[#111827]">Receipt / Proof of Purchase</label>
              
              <input 
                type="file" 
                ref={fileInputRef} 
                className="hidden" 
                onChange={handleFileChange}
                accept=".svg,.png,.jpg,.jpeg,.gif"
              />

              {uploadedFile ? (
                <div className="flex items-center justify-between rounded-[8px] border border-[#E5E7EB] bg-[#F9FAFB] p-3">
                  <div className="flex items-center gap-3">
                    <div className="rounded-full bg-green-100 p-1.5 border border-green-200">
                      <FileCheck className="h-4 w-4 text-green-600" />
                    </div>
                    <div className="flex flex-col">
                      <span className="text-[12px] font-bold text-[#111827] line-clamp-1">{uploadedFile.fileName || "Uploaded File"}</span>
                      <span className="text-[10px] text-[#6B7280]">
                        {(uploadedFile.size / 1024).toFixed(1)} KB
                      </span>
                    </div>
                  </div>
                  <button 
                    type="button"
                    onClick={() => setUploadedFile(null)}
                    className="p-1.5 text-red-500 hover:bg-red-50 rounded-md transition-colors"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              ) : uploadMutation.isPending ? (
                <div className="flex flex-col items-center justify-center rounded-[12px] border-2 border-dashed border-[#D1D5DB] bg-[#FAFBFF] p-4 py-6">
                  <Loader2 className="h-6 w-6 text-[#3B5BDB] animate-spin mb-2" />
                  <p className="text-[12px] font-medium text-[#4B5563]">Uploading file...</p>
                </div>
              ) : (
                <div 
                  onDragEnter={handleDrag}
                  onDragLeave={handleDrag}
                  onDragOver={handleDrag}
                  onDrop={handleDrop}
                  className={`flex flex-col items-center justify-center rounded-[12px] border-2 border-dashed p-4 transition-colors ${
                    dragActive ? 'border-[#3B5BDB] bg-blue-50' : 'border-[#D1D5DB] bg-[#FAFBFF]'
                  }`}
                >
                  <div className="mb-2 rounded-full bg-white p-2 shadow-sm border border-[#E5E7EB]">
                    <CloudUpload className="h-4 w-4 text-[#3B5BDB]" strokeWidth={2} />
                  </div>
                  <p className="text-[12px] font-medium text-[#4B5563]">
                    <span 
                      className="text-[#3B5BDB] font-bold cursor-pointer hover:underline"
                      onClick={() => fileInputRef.current?.click()}
                    >
                      Click to upload
                    </span> or drag and drop
                  </p>
                  <p className="text-[10px] font-medium text-[#9CA3AF] mt-0.5">
                    SVG, PNG, JPG or GIF (max. 10MB)
                  </p>
                </div>
              )}
            </div>
          </form>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 px-6 py-3 mt-1 border-t border-[#EEF1F6]">
          <button 
            onClick={onClose}
            className="text-[12px] font-bold text-[#4B5563] hover:text-[#111827] transition-colors px-2"
          >
            Cancel
          </button>
          <button className="rounded-[8px] bg-[#2563EB] px-5 py-2 text-[12px] font-bold text-white shadow-sm hover:bg-[#1D4ED8] transition-colors">
            Save Asset
          </button>
        </div>
      </div>
    </div>
  )
}
