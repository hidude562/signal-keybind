import type { Filters } from "../types"

interface FilterPanelProps {
  filters: Filters
  onChange: (filters: Filters) => void
  onSearch: () => void
}

function Checkbox({
  checked,
  onChange,
  label,
}: {
  checked: boolean
  onChange: (v: boolean) => void
  label: string
}) {
  return (
    <label className="filter-check">
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
      />
      <span className="box" />
      {label}
    </label>
  )
}

export function FilterPanel({ filters, onChange, onSearch }: FilterPanelProps) {
  const wealthLabel =
    filters.minNetWorth >= 100
      ? `$${(filters.minNetWorth / 100).toFixed(0)}B+`
      : `$${filters.minNetWorth}M+`

  return (
    <div className="filters-panel">
      <div className="filter-title">Filters</div>

      <div className="filter-group">
        <div className="filter-label">Minimum Net Worth</div>
        <div className="filter-range">
          <input
            type="range"
            min="1"
            max="200"
            value={filters.minNetWorth}
            onChange={(e) =>
              onChange({
                ...filters,
                minNetWorth: parseInt(e.target.value),
              })
            }
          />
          <div className="filter-value">{wealthLabel}</div>
        </div>
      </div>

      <div className="filter-group">
        <div className="filter-label">Age Range</div>
        <div className="filter-range">
          <input
            type="range"
            min="21"
            max="80"
            value={filters.ageMin}
            onChange={(e) =>
              onChange({
                ...filters,
                ageMin: parseInt(e.target.value),
              })
            }
          />
          <input
            type="range"
            min="21"
            max="80"
            value={filters.ageMax}
            onChange={(e) =>
              onChange({
                ...filters,
                ageMax: parseInt(e.target.value),
              })
            }
          />
          <div className="filter-value">
            {filters.ageMin}&ndash;{filters.ageMax}
          </div>
        </div>
      </div>

      <div className="filter-group">
        <div className="filter-label">Confidence Level</div>
        <div className="filter-checks">
          <Checkbox
            checked={filters.confidenceHigh}
            onChange={(v) =>
              onChange({ ...filters, confidenceHigh: v })
            }
            label="High (>80%)"
          />
          <Checkbox
            checked={filters.confidenceMedium}
            onChange={(v) =>
              onChange({ ...filters, confidenceMedium: v })
            }
            label="Medium (50-80%)"
          />
          <Checkbox
            checked={filters.confidenceLow}
            onChange={(v) =>
              onChange({ ...filters, confidenceLow: v })
            }
            label="Low (<50%)"
          />
        </div>
      </div>

      <div className="filter-group">
        <div className="filter-label">Wealth Source</div>
        <div className="filter-checks">
          <Checkbox
            checked={filters.wealthSources.tech}
            onChange={(v) =>
              onChange({
                ...filters,
                wealthSources: { ...filters.wealthSources, tech: v },
              })
            }
            label="Tech / Startups"
          />
          <Checkbox
            checked={filters.wealthSources.finance}
            onChange={(v) =>
              onChange({
                ...filters,
                wealthSources: { ...filters.wealthSources, finance: v },
              })
            }
            label="Finance / Investing"
          />
          <Checkbox
            checked={filters.wealthSources.realEstate}
            onChange={(v) =>
              onChange({
                ...filters,
                wealthSources: {
                  ...filters.wealthSources,
                  realEstate: v,
                },
              })
            }
            label="Real Estate"
          />
          <Checkbox
            checked={filters.wealthSources.entertainment}
            onChange={(v) =>
              onChange({
                ...filters,
                wealthSources: {
                  ...filters.wealthSources,
                  entertainment: v,
                },
              })
            }
            label="Entertainment"
          />
        </div>
      </div>

      <div className="filter-group">
        <div className="filter-label">Single Signal Source</div>
        <div className="filter-checks">
          <Checkbox
            checked={filters.singleSignals.wikipedia}
            onChange={(v) =>
              onChange({
                ...filters,
                singleSignals: {
                  ...filters.singleSignals,
                  wikipedia: v,
                },
              })
            }
            label="Wikipedia (no spouse)"
          />
          <Checkbox
            checked={filters.singleSignals.news}
            onChange={(v) =>
              onChange({
                ...filters,
                singleSignals: { ...filters.singleSignals, news: v },
              })
            }
            label="News (divorce/breakup)"
          />
          <Checkbox
            checked={filters.singleSignals.social}
            onChange={(v) =>
              onChange({
                ...filters,
                singleSignals: {
                  ...filters.singleSignals,
                  social: v,
                },
              })
            }
            label="Social media bio"
          />
          <Checkbox
            checked={filters.singleSignals.property}
            onChange={(v) =>
              onChange({
                ...filters,
                singleSignals: {
                  ...filters.singleSignals,
                  property: v,
                },
              })
            }
            label="Property (sole owner)"
          />
        </div>
      </div>

      <button className="btn-search" onClick={onSearch}>
        Run Discovery
      </button>
    </div>
  )
}
