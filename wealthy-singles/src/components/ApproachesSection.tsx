interface Approach {
  icon: string
  iconBg: string
  iconColor: string
  title: string
  body: string
  tags: { label: string; type: "default" | "api" | "scrape" | "ml" }[]
  difficulty: number
}

const APPROACHES: Approach[] = [
  {
    icon: "\ud83d\udccb",
    iconBg: "rgba(96,165,250,0.1)",
    iconColor: "var(--accent-blue)",
    title: "1. Public Wealth Lists + Social Media Cross-Ref",
    body: "Scrape Forbes Billionaires, Bloomberg Billionaires Index, and Rich List data programmatically. Then cross-reference each person against social media profiles (Instagram, LinkedIn) looking for relationship status indicators \u2014 no spouse tagged, no \u201cmarried\u201d in bio, single-oriented posts. Wikipedia pages also often list marital status.",
    tags: [
      { label: "web scraping", type: "scrape" },
      { label: "wikipedia api", type: "api" },
      { label: "nlp analysis", type: "ml" },
    ],
    difficulty: 2,
  },
  {
    icon: "\ud83c\udfdb\ufe0f",
    iconBg: "rgba(167,139,250,0.1)",
    iconColor: "var(--accent-purple)",
    title: "2. SEC / Corporate Filings Analysis",
    body: "Use the SEC EDGAR API to find executives and major shareholders (via DEF 14A proxy statements, Forms 3/4 insider ownership). These filings sometimes note beneficial ownership structures. Cross-reference with public divorce records (PACER) and county court records to detect marital status changes.",
    tags: [
      { label: "sec edgar api", type: "api" },
      { label: "pacer api", type: "api" },
      { label: "court records", type: "scrape" },
    ],
    difficulty: 3,
  },
  {
    icon: "\ud83c\udfe0",
    iconBg: "rgba(201,168,76,0.1)",
    iconColor: "var(--gold)",
    title: "3. Property Records + Deed Analysis",
    body: "Query county assessor APIs and property aggregators (Zillow API, ATTOM Data) for high-value property owners. Deed records show if property is held individually vs. jointly \u2014 individual ownership of expensive property is a strong \u201csingle\u201d signal. Cross-reference with tax records where available.",
    tags: [
      { label: "attom data api", type: "api" },
      { label: "zillow api", type: "api" },
      { label: "county records", type: "scrape" },
    ],
    difficulty: 3,
  },
  {
    icon: "\ud83d\udcbc",
    iconBg: "rgba(74,222,128,0.1)",
    iconColor: "var(--accent-green)",
    title: "4. LinkedIn + Crunchbase Enrichment",
    body: "Use the Crunchbase API to find founders/CEOs of funded startups (Series B+). Use LinkedIn\u2019s profile data (via proxycurl or similar enrichment APIs) to check relationship status fields. Founders of well-funded startups have a high probability of being wealthy but may not appear on traditional rich lists.",
    tags: [
      { label: "crunchbase api", type: "api" },
      { label: "proxycurl", type: "api" },
      { label: "linkedin data", type: "api" },
    ],
    difficulty: 2,
  },
  {
    icon: "\ud83d\udcf0",
    iconBg: "rgba(248,113,113,0.1)",
    iconColor: "var(--accent-red)",
    title: "5. News & Gossip NLP Pipeline",
    body: 'Build an NLP pipeline using NewsAPI or GDELT to monitor news articles for wealthy individuals. Use named entity recognition (NER) to extract people, then sentiment/context analysis to detect relationship events \u2014 "dating," "divorce," "breakup," "single," "newly separated." Maintain a real-time relationship status tracker.',
    tags: [
      { label: "newsapi", type: "api" },
      { label: "spaCy NER", type: "ml" },
      { label: "sentiment analysis", type: "ml" },
    ],
    difficulty: 4,
  },
  {
    icon: "\ud83c\udf89",
    iconBg: "rgba(96,165,250,0.1)",
    iconColor: "var(--accent-blue)",
    title: "6. Charity / Donor Records Mining",
    body: 'Wealthy people are listed in charity donor databases (ProPublica Nonprofit Explorer, FEC donation records). FEC data is fully public API-accessible and shows large donors. Charity gala attendee lists often note "+1" or "and guest" vs. couple names. Cross-reference donor names against relationship databases.',
    tags: [
      { label: "fec api", type: "api" },
      { label: "propublica api", type: "api" },
      { label: "gala lists", type: "scrape" },
    ],
    difficulty: 3,
  },
  {
    icon: "\ud83d\udd0d",
    iconBg: "rgba(167,139,250,0.1)",
    iconColor: "var(--accent-purple)",
    title: "7. People Data Enrichment APIs",
    body: "Commercial people-data APIs like Clearbit, FullContact, Pipl, or PeopleDataLabs can return structured data including estimated wealth/income level and marital status when given a name or email. These aggregate data from hundreds of public sources. Often the fastest approach, but costs money per lookup.",
    tags: [
      { label: "clearbit", type: "api" },
      { label: "peopledatalabs", type: "api" },
      { label: "fullcontact", type: "api" },
    ],
    difficulty: 1,
  },
  {
    icon: "\ud83e\udd16",
    iconBg: "rgba(74,222,128,0.1)",
    iconColor: "var(--accent-green)",
    title: "8. LLM-Powered Knowledge Extraction",
    body: 'Use an LLM with web search (like Claude with search) to iteratively query for wealthy individuals and their relationship statuses. Feed the LLM structured prompts: "List billionaires who divorced after 2020" or "Tech founders under 40 who are single." Validate results against primary sources, then build a structured database.',
    tags: [
      { label: "claude api", type: "ml" },
      { label: "web search", type: "ml" },
      { label: "structured output", type: "api" },
    ],
    difficulty: 2,
  },
]

function DifficultyDots({ level }: { level: number }) {
  return (
    <div className="difficulty">
      Difficulty:{" "}
      {[1, 2, 3, 4, 5].map((i) => (
        <span key={i} className={`diff-dot ${i <= level ? "on" : ""}`} />
      ))}
    </div>
  )
}

export function ApproachesSection() {
  return (
    <div className="section">
      <h2 className="section-title">Discovery Approaches</h2>
      <p className="section-desc">
        There is no single &ldquo;rich singles API,&rdquo; so the key insight is
        to triangulate wealth signals from one set of sources and relationship
        status signals from another, then cross-reference them. Here are eight
        programmatic strategies ranked by feasibility.
      </p>

      <div className="approaches-grid">
        {APPROACHES.map((a, i) => (
          <div className="approach-card" key={i}>
            <div className="approach-header">
              <div
                className="approach-icon"
                style={{ background: a.iconBg, color: a.iconColor }}
              >
                {a.icon}
              </div>
              <div className="approach-title">{a.title}</div>
            </div>
            <div className="approach-body">{a.body}</div>
            <div className="approach-tags">
              {a.tags.map((t, j) => (
                <span key={j} className={`tag ${t.type}`}>
                  {t.label}
                </span>
              ))}
            </div>
            <DifficultyDots level={a.difficulty} />
          </div>
        ))}
      </div>
    </div>
  )
}
