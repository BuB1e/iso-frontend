import { useState } from "react";

enum ETab {
  ImplementationSection = "Implementation",
  EvidenceSection = "Evidence",
  AIAnalysisSection = "AI Analysis",
  ReviewSection = "Review",
}

export default function DomainControl() {
  return (
    <div
      className="
			flex flex-col min-h-screen py-8 px-8 lg:px-16
			justify-center items-center bg-slate-50/50 scroll-auto gap-4
		"
    >
      <Header />
      <Content />
    </div>
  );
}

function Header() {
  return <div></div>;
}

function Content() {
  const [tabSelected, setTabSelected] = useState(ETab.ImplementationSection);

  return (
    <div className="flex flex-row gap-4 w-full">
      <div className="flex flex-col gap-4 w-3/4">
        <ControlGuidance />
        {tabSelected === ETab.ImplementationSection && <ImplementationSection />}
        {tabSelected === ETab.EvidenceSection && <EvidenceSection />}
        {tabSelected === ETab.AIAnalysisSection && <AIAnalysisSection />}
        {tabSelected === ETab.ReviewSection && <ReviewSection />}
      </div>
      <div className="flex flex-col gap-4 w-1/4">
        {/* Audit Trail */}

        {/* Your Role */}
      </div>
    </div>
  );
}

function ControlGuidance() {
  return (
    <div>
      <h2>Control Guidance</h2>
    </div>
  );
}

function ImplementationSection() {
  return (
    <div>
      <h2>Implementation Section</h2>
    </div>
  );
}
function EvidenceSection() {
  return (
    <div>
      <h2>Evidence Section</h2>
    </div>
  );
}

function AIAnalysisSection() {
  return (
    <div>
      <h2>AI Analysis Section</h2>
    </div>
  );
}

function ReviewSection() {
  return (
    <div>
      <h2>Review Section</h2>
    </div>
  );
}
