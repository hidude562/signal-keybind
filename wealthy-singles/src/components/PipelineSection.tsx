const PIPELINE_STEPS = [
  {
    num: "01",
    label: "Seed List",
    detail:
      "Scrape Forbes, Bloomberg rich lists. Query SEC for execs with stock grants > $10M. Pull Crunchbase founders with funding > $50M.",
  },
  {
    num: "02",
    label: "Wealth Scoring",
    detail:
      "Aggregate net worth signals: insider holdings, property records, funding rounds, compensation filings. Calculate estimated wealth range.",
  },
  {
    num: "03",
    label: "Enrichment",
    detail:
      "Run each person through PeopleDataLabs / Clearbit for structured data. Pull Wikipedia, LinkedIn, social profiles. Extract biographical details.",
  },
  {
    num: "04",
    label: "Status Detection",
    detail:
      'NLP pipeline scans for relationship indicators: Wikipedia "spouse" field, social bios, news articles about divorces/dating. Classify: single / married / unknown.',
  },
  {
    num: "05",
    label: "Confidence Score",
    detail:
      "Weight signals by recency and reliability. Multiple concordant signals = high confidence. Single old source = low confidence. Flag stale data.",
  },
  {
    num: "06",
    label: "Dashboard",
    detail:
      "Present ranked results with filters. Show source provenance for each claim. Enable alerts for status changes via news monitoring.",
  },
]

const STATS = [
  { value: "8", label: "Data Sources" },
  { value: "~72%", label: "Coverage Rate" },
  { value: "~85%", label: "Status Accuracy" },
  { value: "$200", label: "Monthly API Cost" },
]

export function PipelineSection() {
  return (
    <div className="section">
      <h2 className="section-title">Recommended Data Pipeline</h2>
      <p className="section-desc">
        The optimal approach combines multiple data sources in a pipeline.
        Here&rsquo;s the architecture that gives the best coverage and accuracy
        while remaining practical to implement.
      </p>

      <div className="pipeline">
        {PIPELINE_STEPS.map((step) => (
          <div className="pipeline-step" key={step.num}>
            <div className="pipeline-num">{step.num}</div>
            <div className="pipeline-label">{step.label}</div>
            <div className="pipeline-detail">{step.detail}</div>
          </div>
        ))}
      </div>

      <div className="stats-bar">
        {STATS.map((stat) => (
          <div className="stat-card" key={stat.label}>
            <div className="stat-value">{stat.value}</div>
            <div className="stat-label">{stat.label}</div>
          </div>
        ))}
      </div>

      <div className="ethics-banner">
        <div className="ethics-icon">{"\u26a0\ufe0f"}</div>
        <div className="ethics-text">
          <strong>Privacy &amp; Ethics Note:</strong> This tool only uses
          publicly available data sources. However, aggregating personal
          information raises ethical and legal considerations. Always comply with
          GDPR, CCPA, and applicable privacy laws. Respect individuals&rsquo;
          right to privacy. This POC is for educational and research purposes
          &mdash; building a production system targeting individuals&rsquo;
          relationship status may have legal implications depending on
          jurisdiction and use case.
        </div>
      </div>
    </div>
  )
}
