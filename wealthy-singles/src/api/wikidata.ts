import type { ConfidenceLevel, Person, RelationshipStatus } from "../types"

const SPARQL_ENDPOINT = "https://query.wikidata.org/sparql"

interface WikidataBinding {
  person: { value: string }
  personLabel: { value: string }
  networth: { value: string }
  dob?: { value: string }
  spouse?: { value: string }
  spouseLabel?: { value: string }
  image?: { value: string }
  occupationLabel?: { value: string }
  citizenshipLabel?: { value: string }
}

interface WikidataResponse {
  results: {
    bindings: WikidataBinding[]
  }
}

function buildSparqlQuery(minNetWorth: number, limit: number): string {
  return `
SELECT DISTINCT ?person ?personLabel ?networth ?dob ?spouse ?spouseLabel ?image ?occupationLabel ?citizenshipLabel WHERE {
  ?person wdt:P2218 ?networth .
  ?person wdt:P31 wd:Q5 .
  FILTER(?networth >= ${minNetWorth})
  OPTIONAL { ?person wdt:P26 ?spouse }
  OPTIONAL { ?person wdt:P569 ?dob }
  OPTIONAL { ?person wdt:P18 ?image }
  OPTIONAL { ?person wdt:P106 ?occupation }
  OPTIONAL { ?person wdt:P27 ?citizenship }
  SERVICE wikibase:label { bd:serviceParam wikibase:language "en" }
}
ORDER BY DESC(?networth)
LIMIT ${limit}
  `.trim()
}

function calculateAge(dob: string): number | null {
  try {
    const birthDate = new Date(dob)
    if (isNaN(birthDate.getTime())) return null
    const today = new Date()
    let age = today.getFullYear() - birthDate.getFullYear()
    const monthDiff = today.getMonth() - birthDate.getMonth()
    if (
      monthDiff < 0 ||
      (monthDiff === 0 && today.getDate() < birthDate.getDate())
    ) {
      age--
    }
    return age
  } catch {
    return null
  }
}

function formatNetWorth(value: number): string {
  if (value >= 1e9) {
    const b = value / 1e9
    return b >= 10 ? `$${Math.round(b)}B` : `$${b.toFixed(1)}B`
  }
  if (value >= 1e6) {
    const m = value / 1e6
    return m >= 10 ? `$${Math.round(m)}M` : `$${m.toFixed(1)}M`
  }
  return `$${Math.round(value).toLocaleString()}`
}

function getInitials(name: string): string {
  return name
    .split(" ")
    .filter((p) => p.length > 0)
    .map((p) => p[0])
    .slice(0, 2)
    .join("")
    .toUpperCase()
}

function extractWikidataId(uri: string): string {
  return uri.split("/").pop() || ""
}

function classifyOccupation(occupation: string): string {
  const lower = occupation.toLowerCase()
  if (
    lower.includes("entrepreneur") ||
    lower.includes("programmer") ||
    lower.includes("software") ||
    lower.includes("engineer")
  )
    return "Tech"
  if (
    lower.includes("investor") ||
    lower.includes("banker") ||
    lower.includes("financ") ||
    lower.includes("hedge")
  )
    return "Finance"
  if (lower.includes("real estate") || lower.includes("property"))
    return "Real Estate"
  if (
    lower.includes("actor") ||
    lower.includes("singer") ||
    lower.includes("musician") ||
    lower.includes("entertainer") ||
    lower.includes("athlete")
  )
    return "Entertainment"
  if (
    lower.includes("business") ||
    lower.includes("executive") ||
    lower.includes("chief")
  )
    return "Business"
  return occupation || "Business"
}

function determineRelationshipStatus(
  binding: WikidataBinding,
): { status: RelationshipStatus; detail: string } {
  if (binding.spouse && binding.spouseLabel) {
    return { status: "married", detail: `Spouse: ${binding.spouseLabel.value}` }
  }
  return { status: "single", detail: "No spouse listed" }
}

function calculateConfidence(
  binding: WikidataBinding,
): { score: number; level: ConfidenceLevel } {
  let score = 50

  // Has net worth data
  if (binding.networth) score += 15
  // Has DOB
  if (binding.dob) score += 10
  // Has occupation
  if (binding.occupationLabel) score += 5
  // Has citizenship
  if (binding.citizenshipLabel) score += 5
  // Has image (well-known person)
  if (binding.image) score += 10
  // Explicit spouse data (either present or absent) is a signal
  // If no spouse field at all, slightly less confident about "single" status
  if (!binding.spouse) score -= 5

  score = Math.min(97, Math.max(30, score))

  const level: ConfidenceLevel =
    score >= 80 ? "high" : score >= 50 ? "medium" : "low"

  return { score, level }
}

function determineSources(binding: WikidataBinding): string[] {
  const sources: string[] = ["Wikidata"]
  if (binding.image) sources.push("Wikipedia")
  if (binding.occupationLabel) sources.push("Structured Data")
  if (!binding.spouse) sources.push("No Spouse Record")
  else sources.push("Spouse on Record")
  return sources
}

function deduplicateByName(bindings: WikidataBinding[]): WikidataBinding[] {
  const seen = new Map<string, WikidataBinding>()
  for (const b of bindings) {
    const name = b.personLabel.value
    if (!seen.has(name)) {
      seen.set(name, b)
    }
  }
  return Array.from(seen.values())
}

export async function fetchWealthyIndividuals(
  minNetWorthMillions: number = 100,
  limit: number = 300,
): Promise<Person[]> {
  const minNetWorth = minNetWorthMillions * 1_000_000
  const query = buildSparqlQuery(minNetWorth, limit)

  const response = await fetch(SPARQL_ENDPOINT, {
    method: "POST",
    headers: {
      Accept: "application/sparql-results+json",
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: `query=${encodeURIComponent(query)}`,
  })

  if (!response.ok) {
    throw new Error(`Wikidata query failed: ${response.status}`)
  }

  const data: WikidataResponse = await response.json()
  const deduplicated = deduplicateByName(data.results.bindings)

  return deduplicated.map((binding) => {
    const { status, detail } = determineRelationshipStatus(binding)
    const { score, level } = calculateConfidence(binding)
    const netWorthNum = parseFloat(binding.networth.value)

    return {
      id: extractWikidataId(binding.person.value),
      name: binding.personLabel.value,
      initials: getInitials(binding.personLabel.value),
      age: binding.dob ? calculateAge(binding.dob.value) : null,
      netWorth: netWorthNum,
      netWorthFormatted: formatNetWorth(netWorthNum),
      occupation: binding.occupationLabel
        ? classifyOccupation(binding.occupationLabel.value)
        : "Business",
      citizenship: binding.citizenshipLabel?.value || "Unknown",
      imageUrl: binding.image?.value || null,
      relationshipStatus: status,
      statusDetail: detail,
      confidence: score,
      confidenceLevel: level,
      sources: determineSources(binding),
      wikidataId: extractWikidataId(binding.person.value),
    }
  })
}
