import { useState } from "react"
import { ApproachesSection } from "./components/ApproachesSection"
import { CodeSection } from "./components/CodeSection"
import { DemoSection } from "./components/DemoSection"
import { Header } from "./components/Header"
import { PipelineSection } from "./components/PipelineSection"
import { TabNav, type TabId } from "./components/TabNav"

export function App() {
  const [activeTab, setActiveTab] = useState<TabId>("approaches")

  return (
    <>
      <div className="ambient-glow glow-1" />
      <div className="ambient-glow glow-2" />

      <div className="container">
        <Header />
        <TabNav activeTab={activeTab} onTabChange={setActiveTab} />

        {activeTab === "approaches" && <ApproachesSection />}
        {activeTab === "pipeline" && <PipelineSection />}
        {activeTab === "code" && <CodeSection />}
        {activeTab === "demo" && <DemoSection />}
      </div>
    </>
  )
}
