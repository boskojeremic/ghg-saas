"use client"

import * as React from "react"

export type MethodologyOption = { label: string; factor: number }

const OPTIONS: MethodologyOption[] = [
  { label: "ISO 14064 / ISO 14067", factor: 1.05 },
  { label: "GOST (Method)", factor: 0.98 },
  { label: "API RP / API Compendium", factor: 1.03 },
]

export function MethodologySwitcher({
  value,
  onChange,
}: {
  value: string
  onChange: (m: MethodologyOption) => void
}) {
  return (
    <select
      className="h-9 w-full rounded-md border border-white/10 bg-white/5 px-3 text-sm text-foreground outline-none focus:ring-2 focus:ring-emerald-400/30"
      value={value}
      onChange={(e) => {
        const next = OPTIONS.find((o) => o.label === e.target.value) ?? OPTIONS[0]
        onChange(next)
      }}
    >
      {OPTIONS.map((o) => (
        <option key={o.label} value={o.label}>
          {o.label}
        </option>
      ))}
    </select>
  )
}
