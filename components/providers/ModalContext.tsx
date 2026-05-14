"use client"

import React, { createContext, useCallback, useContext, useMemo, useState } from "react"

export type SelectedBudget = {
  id: string
  title: string
}

type ModalContextValue = {
  selectedBudget: SelectedBudget | null
  openBudget: (budget: SelectedBudget) => void
  closeBudget: () => void
}

const ModalContext = createContext<ModalContextValue | null>(null)

export function ModalProvider({ children }: { children: React.ReactNode }) {
  const [selectedBudget, setSelectedBudget] = useState<SelectedBudget | null>(null)

  const openBudget = useCallback((budget: SelectedBudget) => {
    setSelectedBudget(budget)
  }, [])

  const closeBudget = useCallback(() => {
    setSelectedBudget(null)
  }, [])

  const value = useMemo<ModalContextValue>(
    () => ({ selectedBudget, openBudget, closeBudget }),
    [selectedBudget, openBudget, closeBudget]
  )

  return <ModalContext.Provider value={value}>{children}</ModalContext.Provider>
}

export function useModal(): ModalContextValue {
  const ctx = useContext(ModalContext)
  if (!ctx) {
    throw new Error("useModal must be used within a ModalProvider")
  }
  return ctx
}
