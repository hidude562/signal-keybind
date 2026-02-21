import { useState } from "react"
import { useDiscovery } from "../hooks/useDiscovery"
import { DEFAULT_FILTERS, type Filters } from "../types"
import { FilterPanel } from "./FilterPanel"
import { ResultCard } from "./ResultCard"

export function DemoSection() {
  const [filters, setFilters] = useState<Filters>(DEFAULT_FILTERS)
  const { results, loading, hasSearched, runDiscovery } = useDiscovery()

  const handleSearch = () => {
    runDiscovery(filters)
  }

  return (
    <div className="section">
      <h2 className="section-title">Interactive Demo</h2>
      <p className="section-desc">
        A live dashboard powered by Wikidata&rsquo;s SPARQL endpoint. Filter by
        wealth range, data source confidence, and relationship status signals.
        Click &ldquo;Run Discovery&rdquo; to query real public data.
      </p>

      <div className="demo-grid">
        <FilterPanel
          filters={filters}
          onChange={setFilters}
          onSearch={handleSearch}
        />

        <div className="results-panel">
          <div className="results-header">
            <div className="results-count">
              Showing <span>{results.length}</span> results
            </div>
          </div>

          {loading && (
            <div className="loading-state">
              {"\u23f3"} Querying Wikidata SPARQL endpoint...
            </div>
          )}

          {!loading && !hasSearched && (
            <div className="empty-state">
              Configure filters and click{" "}
              <strong>Run Discovery</strong> to see results
            </div>
          )}

          {!loading && hasSearched && results.length === 0 && (
            <div className="empty-state">
              No results found matching your filters. Try adjusting
              the minimum net worth or age range.
            </div>
          )}

          {!loading &&
            results.map((person, i) => (
              <ResultCard key={person.id} person={person} index={i} />
            ))}
        </div>
      </div>
    </div>
  )
}
