export type ConfidenceLevel = "high" | "medium" | "low"

export type RelationshipStatus =
  | "single"
  | "married"
  | "divorced"
  | "dating"
  | "widowed"
  | "unknown"

export interface Person {
  id: string
  name: string
  initials: string
  age: number | null
  netWorth: number
  netWorthFormatted: string
  occupation: string
  citizenship: string
  imageUrl: string | null
  relationshipStatus: RelationshipStatus
  statusDetail: string
  confidence: number
  confidenceLevel: ConfidenceLevel
  sources: string[]
  wikidataId: string
}

export interface Filters {
  minNetWorth: number
  ageMin: number
  ageMax: number
  confidenceHigh: boolean
  confidenceMedium: boolean
  confidenceLow: boolean
  wealthSources: {
    tech: boolean
    finance: boolean
    realEstate: boolean
    entertainment: boolean
  }
  singleSignals: {
    wikipedia: boolean
    news: boolean
    social: boolean
    property: boolean
  }
}

export const DEFAULT_FILTERS: Filters = {
  minNetWorth: 10,
  ageMin: 25,
  ageMax: 65,
  confidenceHigh: true,
  confidenceMedium: true,
  confidenceLow: false,
  wealthSources: {
    tech: true,
    finance: true,
    realEstate: true,
    entertainment: true,
  },
  singleSignals: {
    wikipedia: true,
    news: true,
    social: true,
    property: true,
  },
}
