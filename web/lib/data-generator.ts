export type Granularity = "daily" | "weekly" | "monthly" | "yearly"

export type SeriesPoint = {
  date: string
  fuel: number
  flaring: number
  venting: number
  fugitive: number
  total: number
}

type Args = {
  from: Date
  to: Date
  granularity: Granularity
  factor: number
}

/** Deterministic pseudo-random (stable for same date) */
function mulberry32(seed: number) {
  return function () {
    let t = (seed += 0x6d2b79f5)
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

function dateKey(d: Date) {
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, "0")
  const day = String(d.getDate()).padStart(2, "0")
  return `${y}-${m}-${day}`
}

function clampStartOfDay(d: Date) {
  const x = new Date(d)
  x.setHours(0, 0, 0, 0)
  return x
}

function addDays(d: Date, days: number) {
  const x = new Date(d)
  x.setDate(x.getDate() + days)
  return x
}

function startOfWeek(d: Date) {
  const x = clampStartOfDay(d)
  const wd = (x.getDay() + 6) % 7 // Mon=0
  return addDays(x, -wd)
}

function startOfMonth(d: Date) {
  const x = clampStartOfDay(d)
  x.setDate(1)
  return x
}

function startOfYear(d: Date) {
  const x = clampStartOfDay(d)
  x.setMonth(0, 1)
  return x
}

function nextBucket(d: Date, g: Granularity) {
  const x = new Date(d)
  if (g === "daily") return addDays(x, 1)
  if (g === "weekly") return addDays(x, 7)
  if (g === "monthly") {
    x.setMonth(x.getMonth() + 1, 1)
    x.setHours(0, 0, 0, 0)
    return x
  }
  x.setFullYear(x.getFullYear() + 1, 0, 1)
  x.setHours(0, 0, 0, 0)
  return x
}

function bucketStart(d: Date, g: Granularity) {
  if (g === "daily") return clampStartOfDay(d)
  if (g === "weekly") return startOfWeek(d)
  if (g === "monthly") return startOfMonth(d)
  return startOfYear(d)
}

/** Core generator: creates DAILY baseline then aggregates */
function generateDaily(from: Date, to: Date, factor: number): SeriesPoint[] {
  const a = clampStartOfDay(from)
  const b = clampStartOfDay(to)
  const out: SeriesPoint[] = []

  for (let d = new Date(a); d <= b; d = addDays(d, 1)) {
    const key = dateKey(d)
    const seed = Number(key.replaceAll("-", "")) // YYYYMMDD
    const rnd = mulberry32(seed)

    // base load varies by weekday + season-like wave
    const wd = (d.getDay() + 6) % 7
    const seasonal = 0.9 + 0.2 * Math.sin((seed % 365) / 365 * Math.PI * 2)
    const weekday = wd <= 4 ? 1.0 : 0.85

    const fuel = (900 + 250 * rnd()) * seasonal * weekday
    const flaring = (220 + 120 * rnd()) * (0.9 + 0.3 * rnd())
    const venting = (120 + 80 * rnd()) * (0.9 + 0.25 * rnd())
    const fugitive = (140 + 110 * rnd()) * (0.9 + 0.25 * rnd())

    const scaledFuel = fuel * factor
    const scaledFlaring = flaring * factor
    const scaledVenting = venting * factor
    const scaledFugitive = fugitive * factor

    const total = scaledFuel + scaledFlaring + scaledVenting + scaledFugitive

    out.push({
      date: key,
      fuel: Math.round(scaledFuel),
      flaring: Math.round(scaledFlaring),
      venting: Math.round(scaledVenting),
      fugitive: Math.round(scaledFugitive),
      total: Math.round(total),
    })
  }
  return out
}

function aggregate(daily: SeriesPoint[], g: Granularity): SeriesPoint[] {
  if (g === "daily") return daily

  const map = new Map<string, SeriesPoint>()
  for (const p of daily) {
    const ds = new Date(p.date + "T00:00:00")
    const b = bucketStart(ds, g)
    const k = dateKey(b)

    const prev = map.get(k)
    if (!prev) {
      map.set(k, { date: k, fuel: 0, flaring: 0, venting: 0, fugitive: 0, total: 0 })
    }
    const cur = map.get(k)!
    cur.fuel += p.fuel
    cur.flaring += p.flaring
    cur.venting += p.venting
    cur.fugitive += p.fugitive
    cur.total += p.total
  }

  const sorted = Array.from(map.values()).sort((a, b) => a.date.localeCompare(b.date))
  return sorted
}

export function generateEmissionsSeries(args: Args): SeriesPoint[] {
  const from = args.from > args.to ? args.to : args.from
  const to = args.from > args.to ? args.from : args.to

  const daily = generateDaily(from, to, args.factor)
  const agg = aggregate(daily, args.granularity)
  return agg
}
