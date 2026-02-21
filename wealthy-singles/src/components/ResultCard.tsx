import type { Person } from "../types"

interface ResultCardProps {
  person: Person
  index: number
}

export function ResultCard({ person, index }: ResultCardProps) {
  const confClass =
    person.confidenceLevel === "high"
      ? "conf-high"
      : person.confidenceLevel === "medium"
        ? "conf-med"
        : "conf-low"

  return (
    <div
      className="result-card"
      style={{
        animation: `fadeIn 0.4s ease ${index * 0.06}s both`,
      }}
    >
      <div className="result-avatar">{person.initials}</div>
      <div className="result-info">
        <h3>{person.name}</h3>
        <div className="result-meta">
          {person.age && <span>{"\ud83c\udf82"} {person.age}</span>}
          <span>{"\ud83d\udcbc"} {person.occupation}</span>
          <span>{"\ud83d\udc8d"} {person.statusDetail}</span>
        </div>
        <div className="source-tags">
          {person.sources.map((s) => (
            <span key={s} className="source-tag">
              {s}
            </span>
          ))}
        </div>
      </div>
      <div className="result-signals">
        <div className="result-networth">{person.netWorthFormatted}</div>
        <div className={`confidence-bar ${confClass}`}>
          <div className="conf-fill">
            <div
              className="conf-fill-inner"
              style={{ width: `${person.confidence}%` }}
            />
          </div>
          {person.confidence}%
        </div>
      </div>
    </div>
  )
}
