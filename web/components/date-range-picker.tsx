"use client"

import * as React from "react"

export type DateRangeValue = { from: Date; to: Date }

function toInputValue(d: Date) {
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, "0")
  const day = String(d.getDate()).padStart(2, "0")
  return `${y}-${m}-${day}`
}

function fromInputValue(s: string) {
  // expects YYYY-MM-DD
  const [y, m, d] = s.split("-").map(Number)
  const dt = new Date(y, (m ?? 1) - 1, d ?? 1)
  dt.setHours(0, 0, 0, 0)
  return dt
}

export function DateRangePicker({
  value,
  onChange,
}: {
  value: DateRangeValue
  onChange: (v: DateRangeValue) => void
}) {
  const fromStr = toInputValue(value.from)
  const toStr = toInputValue(value.to)

  return (
    <div className="flex flex-wrap items-end gap-2">
      <div className="min-w-[160px]">
        <div className="mb-1 text-xs font-medium text-foreground/70">From</div>
        <input
          type="date"
          value={fromStr}
          onChange={(e) => {
            const nextFrom = fromInputValue(e.target.value)
            const next = nextFrom > value.to ? { from: value.to, to: nextFrom } : { from: nextFrom, to: value.to }
            onChange(next)
          }}
          className="h-9 w-full rounded-md border border-white/10 bg-white/5 px-3 text-sm outline-none focus:ring-2 focus:ring-emerald-400/30"
        />
      </div>

      <div className="min-w-[160px]">
        <div className="mb-1 text-xs font-medium text-foreground/70">To</div>
        <input
          type="date"
          value={toStr}
          onChange={(e) => {
            const nextTo = fromInputValue(e.target.value)
            const next = value.from > nextTo ? { from: nextTo, to: value.from } : { from: value.from, to: nextTo }
            onChange(next)
          }}
          className="h-9 w-full rounded-md border border-white/10 bg-white/5 px-3 text-sm outline-none focus:ring-2 focus:ring-emerald-400/30"
        />
      </div>

      <button
        type="button"
        onClick={() => {
          const today = new Date()
          today.setHours(0, 0, 0, 0)
          const from = new Date(today)
          from.setDate(from.getDate() - 90)
          onChange({ from, to: today })
        }}
        className="h-9 rounded-md border border-white/10 bg-white/5 px-3 text-sm text-foreground hover:bg-white/10"
        title="Reset to last 90 days"
      >
        Reset
      </button>
    </div>
  )
}
