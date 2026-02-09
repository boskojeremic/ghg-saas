export type MethodologyKey =
  | "API"
  | "ISO"
  | "GOST"
  | "IPCC"
  | "CUSTOM";

export const METHODOLOGIES: Record<
  MethodologyKey,
  {
    label: string;
    factor: number;
    description: string;
  }
> = {
  API: {
    label: "API RP / API Compendium",
    factor: 1.0,
    description: "Baseline – API recommended practices",
  },
  ISO: {
    label: "ISO 14064 / ISO 14067",
    factor: 1.05,
    description: "ISO methodology (+5%)",
  },
  GOST: {
    label: "GOST / RF Norms",
    factor: 0.97,
    description: "GOST methodology (-3%)",
  },
  IPCC: {
    label: "IPCC Guidelines",
    factor: 1.08,
    description: "IPCC default factors (+8%)",
  },
  CUSTOM: {
    label: "Custom / Contractual",
    factor: 1.02,
    description: "Project-specific adjustment",
  },
};
