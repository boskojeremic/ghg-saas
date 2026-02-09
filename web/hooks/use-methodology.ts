"use client"

import { useEffect, useState } from "react"
import type { Methodology } from "@/lib/methodology"

const KEY = "ghg_methodology"

export function useMethodology() {
  const [method, setMethod] = useState<Methodology>("ISO")

  useEffect(() => {
    const saved = (localStorage.getItem(KEY) as Methodology | null) ?? "ISO"
    setMethod(saved)

    // sluša promenu iz drugog taba/prozora
    const onStorage = (e: StorageEvent) => {
      if (e.key === KEY && e.newValue) setMethod(e.newValue as Methodology)
    }
    window.addEventListener("storage", onStorage)

    // custom event za promenu u ISTOM tabu
    const onCustom = () => {
      const v = (localStorage.getItem(KEY) as Methodology | null) ?? "ISO"
      setMethod(v)
    }
    window.addEventListener("ghg_methodology_changed", onCustom)

    return () => {
      window.removeEventListener("storage", onStorage)
      window.removeEventListener("ghg_methodology_changed", onCustom)
    }
  }, [])

  return method
}
