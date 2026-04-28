import { useState, useCallback } from "react"

export type ExchangeRate = {
  _id: string
  fromCurrency: "NGN" | "USD" | "GBP" | "EUR" | string
  toCurrency: "NGN" | "USD" | "GBP" | "EUR" | string
  rate: number
  effectiveDate: string
  createdBy?: string
}

export type CreateExchangeRatePayload = {
  fromCurrency: string
  toCurrency: string
  rate: number
  effectiveDate: string
}

export function useExchangeRates() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const createRate = useCallback(async (payload: CreateExchangeRatePayload) => {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch("/api/v1/core/exchange-rates", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })
      const data = await res.json().catch(() => null)
      if (!res.ok) {
        throw new Error(data?.message || "Failed to create exchange rate.")
      }
      return data?.data as ExchangeRate
    } catch (err: any) {
      setError(err.message || "An error occurred creating exchange rate.")
      throw err
    } finally {
      setLoading(false)
    }
  }, [])

  const getLatestRate = useCallback(async (fromCurrency: string, toCurrency: string) => {
    setLoading(true)
    setError(null)
    try {
      const qs = new URLSearchParams()
      if (fromCurrency) qs.set("fromCurrency", fromCurrency)
      if (toCurrency) qs.set("toCurrency", toCurrency)

      const res = await fetch(`/api/v1/core/exchange-rates/latest?${qs.toString()}`)
      const data = await res.json().catch(() => null)
      if (!res.ok) {
        throw new Error(data?.message || "Failed to fetch latest exchange rate.")
      }
      return data?.data as ExchangeRate
    } catch (err: any) {
      setError(err.message || "An error occurred fetching latest exchange rate.")
      throw err
    } finally {
      setLoading(false)
    }
  }, [])

  const listRates = useCallback(async (params: { page?: number; limit?: number; fromCurrency?: string; toCurrency?: string } = {}) => {
    setLoading(true)
    setError(null)
    try {
      const qs = new URLSearchParams()
      if (params.page !== undefined) qs.set("page", String(params.page))
      if (params.limit !== undefined) qs.set("limit", String(params.limit))
      if (params.fromCurrency) qs.set("fromCurrency", params.fromCurrency)
      if (params.toCurrency) qs.set("toCurrency", params.toCurrency)

      const res = await fetch(`/api/v1/core/exchange-rates?${qs.toString()}`)
      const data = await res.json().catch(() => null)
      if (!res.ok) {
        throw new Error(data?.message || "Failed to list exchange rates.")
      }
      return {
        data: data?.data as ExchangeRate[],
        pagination: data?.pagination as { total: number, page: number, limit: number, pages: number }
      }
    } catch (err: any) {
      setError(err.message || "An error occurred listing exchange rates.")
      throw err
    } finally {
      setLoading(false)
    }
  }, [])

  return { loading, error, createRate, getLatestRate, listRates }
}
