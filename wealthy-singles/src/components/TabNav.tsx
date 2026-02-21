const TABS = [
  { id: "approaches", label: "Approaches" },
  { id: "pipeline", label: "Data Pipeline" },
  { id: "code", label: "Implementation" },
  { id: "demo", label: "Live Demo" },
] as const

export type TabId = (typeof TABS)[number]["id"]

interface TabNavProps {
  activeTab: TabId
  onTabChange: (tab: TabId) => void
}

export function TabNav({ activeTab, onTabChange }: TabNavProps) {
  return (
    <div className="tabs">
      {TABS.map((tab) => (
        <button
          key={tab.id}
          className={`tab ${activeTab === tab.id ? "active" : ""}`}
          onClick={() => onTabChange(tab.id)}
        >
          {tab.label}
        </button>
      ))}
    </div>
  )
}
