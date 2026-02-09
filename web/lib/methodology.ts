export type Methodology = "ISO" | "IPCC" | "API" | "GOST" | "CUSTOM"

export const METH_LABEL: Record<Methodology, string> = {
  ISO: "ISO (14064/14067)",
  IPCC: "IPCC (2006)",
  API: "API (Oil & Gas)",
  GOST: "GOST",
  CUSTOM: "Custom",
}

// Pilot multipliers (posle zamenimo realnim faktorima po gasu / GWP setu / EF bazi)
export const METH_MULTIPLIER: Record<Methodology, number> = {
  ISO: 1.0,
  IPCC: 1.03,
  API: 0.98,
  GOST: 1.06,
  CUSTOM: 1.1,
}

// helper: format 12,450
export function formatInt(n: number) {
  return new Intl.NumberFormat("en-US", { maximumFractionDigits: 0 }).format(n)
}

