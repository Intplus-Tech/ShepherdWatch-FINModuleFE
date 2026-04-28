"use client"

import { useAssetConfig } from "@/components/hooks/useAssetConfig"

export default function Page() {
  const { assetConfig, loading, error, refresh } = useAssetConfig()

  return (
    <main className="p-6">
      <h1 className="text-2xl font-bold">Asset Settings</h1>
      <p className="mt-1 text-sm text-gray-600">Manage default depreciation settings and asset classes.</p>
      <div className="mt-6 rounded border bg-white p-4">
        {loading ? <p>Loading...</p> : null}
        {error ? <p className="text-rose-600">{error}</p> : null}
        {!loading && !error ? (
          <>
            <p>
              <strong>Depreciation Method:</strong> {assetConfig?.depreciationMethod ?? "Not configured"}
            </p>
            <p>
              <strong>Default Useful Life:</strong> {assetConfig?.defaultUsefulLifeYears ?? "Not configured"}
            </p>
            <p>
              <strong>Capitalization Threshold:</strong> {assetConfig?.capitalizationThreshold ?? "Not configured"}
            </p>
            <button className="mt-4 rounded bg-blue-600 px-4 py-2 text-white" onClick={refresh}>
              Refresh
            </button>
          </>
        ) : null}
      </div>
    </main>
  )
}
