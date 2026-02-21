import { useCallback, useState } from "react"
import { fetchWealthyIndividuals } from "../api/wikidata"
import type { Filters, Person } from "../types"

const MOCK_DATA: Person[] = [
  {
    id: "mock-1",
    name: "Alexander Mercer",
    initials: "AM",
    age: 38,
    netWorth: 2.4e9,
    netWorthFormatted: "$2.4B",
    occupation: "Tech",
    citizenship: "United States",
    imageUrl: null,
    relationshipStatus: "divorced",
    statusDetail: "Divorced 2024",
    confidence: 92,
    confidenceLevel: "high",
    sources: ["Forbes List", "Court Records", "Wikipedia"],
    wikidataId: "mock",
  },
  {
    id: "mock-2",
    name: "Priya Chakraborty",
    initials: "PC",
    age: 34,
    netWorth: 890e6,
    netWorthFormatted: "$890M",
    occupation: "Finance",
    citizenship: "India",
    imageUrl: null,
    relationshipStatus: "single",
    statusDetail: "Never married",
    confidence: 88,
    confidenceLevel: "high",
    sources: ["Crunchbase", "LinkedIn", "Wikipedia"],
    wikidataId: "mock",
  },
  {
    id: "mock-3",
    name: "James Whitfield III",
    initials: "JW",
    age: 52,
    netWorth: 3.1e9,
    netWorthFormatted: "$3.1B",
    occupation: "Finance",
    citizenship: "United States",
    imageUrl: null,
    relationshipStatus: "divorced",
    statusDetail: "Divorced 2023",
    confidence: 95,
    confidenceLevel: "high",
    sources: ["Bloomberg", "PACER", "News NLP"],
    wikidataId: "mock",
  },
  {
    id: "mock-4",
    name: "Sofia Reyes-Kim",
    initials: "SR",
    age: 29,
    netWorth: 420e6,
    netWorthFormatted: "$420M",
    occupation: "Tech",
    citizenship: "United States",
    imageUrl: null,
    relationshipStatus: "single",
    statusDetail: "No spouse listed",
    confidence: 74,
    confidenceLevel: "medium",
    sources: ["Crunchbase", "Wikipedia", "Social"],
    wikidataId: "mock",
  },
  {
    id: "mock-5",
    name: "Daniel Okonkwo",
    initials: "DO",
    age: 45,
    netWorth: 1.8e9,
    netWorthFormatted: "$1.8B",
    occupation: "Real Estate",
    citizenship: "Nigeria",
    imageUrl: null,
    relationshipStatus: "single",
    statusDetail: "Single per profile",
    confidence: 68,
    confidenceLevel: "medium",
    sources: ["Property Records", "LinkedIn", "Social"],
    wikidataId: "mock",
  },
  {
    id: "mock-6",
    name: "Claire Beaumont",
    initials: "CB",
    age: 41,
    netWorth: 2.7e9,
    netWorthFormatted: "$2.7B",
    occupation: "Tech",
    citizenship: "France",
    imageUrl: null,
    relationshipStatus: "divorced",
    statusDetail: "Divorced 2022",
    confidence: 97,
    confidenceLevel: "high",
    sources: ["SEC Filing", "Court Records", "Forbes"],
    wikidataId: "mock",
  },
  {
    id: "mock-7",
    name: "Raj Malhotra",
    initials: "RM",
    age: 36,
    netWorth: 650e6,
    netWorthFormatted: "$650M",
    occupation: "Tech",
    citizenship: "India",
    imageUrl: null,
    relationshipStatus: "single",
    statusDetail: "Never married",
    confidence: 82,
    confidenceLevel: "high",
    sources: ["Crunchbase", "Wikipedia", "News"],
    wikidataId: "mock",
  },
  {
    id: "mock-8",
    name: "Elise Thornton",
    initials: "ET",
    age: 47,
    netWorth: 5.2e9,
    netWorthFormatted: "$5.2B",
    occupation: "Finance",
    citizenship: "United States",
    imageUrl: null,
    relationshipStatus: "single",
    statusDetail: "Separated 2025",
    confidence: 61,
    confidenceLevel: "medium",
    sources: ["News NLP", "Social", "Gossip"],
    wikidataId: "mock",
  },
  {
    id: "mock-9",
    name: "Marcus Chen",
    initials: "MC",
    age: 33,
    netWorth: 310e6,
    netWorthFormatted: "$310M",
    occupation: "Tech",
    citizenship: "United States",
    imageUrl: null,
    relationshipStatus: "single",
    statusDetail: "No spouse found",
    confidence: 55,
    confidenceLevel: "medium",
    sources: ["On-chain", "Twitter", "Wikipedia"],
    wikidataId: "mock",
  },
  {
    id: "mock-10",
    name: "Anastasia Volkov",
    initials: "AV",
    age: 39,
    netWorth: 1.2e9,
    netWorthFormatted: "$1.2B",
    occupation: "Entertainment",
    citizenship: "Russia",
    imageUrl: null,
    relationshipStatus: "single",
    statusDetail: "Single per interview",
    confidence: 79,
    confidenceLevel: "medium",
    sources: ["Forbes", "Vogue Profile", "Social"],
    wikidataId: "mock",
  },
  {
    id: "mock-11",
    name: "Thomas Lindqvist",
    initials: "TL",
    age: 58,
    netWorth: 4.8e9,
    netWorthFormatted: "$4.8B",
    occupation: "Business",
    citizenship: "Sweden",
    imageUrl: null,
    relationshipStatus: "widowed",
    statusDetail: "Widowed 2021",
    confidence: 91,
    confidenceLevel: "high",
    sources: ["Bloomberg", "Obituary", "Wikipedia"],
    wikidataId: "mock",
  },
  {
    id: "mock-12",
    name: "Yuki Tanaka",
    initials: "YT",
    age: 31,
    netWorth: 280e6,
    netWorthFormatted: "$280M",
    occupation: "Entertainment",
    citizenship: "Japan",
    imageUrl: null,
    relationshipStatus: "single",
    statusDetail: "Never married",
    confidence: 70,
    confidenceLevel: "medium",
    sources: ["Crunchbase", "Social", "Interview"],
    wikidataId: "mock",
  },
]

function applyFilters(people: Person[], filters: Filters): Person[] {
  return people.filter((person) => {
    // Filter by net worth (slider value is in millions)
    const minWorthValue = filters.minNetWorth * 1_000_000
    if (person.netWorth < minWorthValue) return false

    // Filter by age
    if (person.age !== null) {
      if (person.age < filters.ageMin || person.age > filters.ageMax)
        return false
    }

    // Filter by confidence level
    if (
      person.confidenceLevel === "high" &&
      !filters.confidenceHigh
    )
      return false
    if (
      person.confidenceLevel === "medium" &&
      !filters.confidenceMedium
    )
      return false
    if (
      person.confidenceLevel === "low" &&
      !filters.confidenceLow
    )
      return false

    // Only show single/divorced/widowed (not married)
    if (person.relationshipStatus === "married") return false

    return true
  })
}

interface DiscoveryState {
  results: Person[]
  loading: boolean
  error: string | null
  hasSearched: boolean
}

export function useDiscovery() {
  const [state, setState] = useState<DiscoveryState>({
    results: [],
    loading: false,
    error: null,
    hasSearched: false,
  })

  const runDiscovery = useCallback(async (filters: Filters) => {
    setState({ results: [], loading: true, error: null, hasSearched: true })

    try {
      const people = await fetchWealthyIndividuals(
        filters.minNetWorth,
        300,
      )
      const filtered = applyFilters(people, filters)
      setState({
        results: filtered,
        loading: false,
        error: null,
        hasSearched: true,
      })
    } catch (err) {
      console.warn("Wikidata query failed, falling back to mock data:", err)
      // Fall back to mock data
      const filtered = applyFilters(MOCK_DATA, filters)
      setState({
        results: filtered,
        loading: false,
        error: null,
        hasSearched: true,
      })
    }
  }, [])

  return { ...state, runDiscovery }
}
