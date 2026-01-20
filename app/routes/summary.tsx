import { Printer, FileText, AlertTriangle, CheckCircle } from "lucide-react";
import { useUserStore } from "~/stores/userStore";

// Domain data interface
interface DomainSummary {
  code: string;
  name: string;
  description: string;
  implemented: number;
  total: number;
}

// Mock summary data
const mockSummaryData = {
  assessmentScope: "Q4 2025 ISO 27001 Audit",
  organization: "Entire Organization",
  author: "System Generated",
  dateGenerated: new Date().toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  }),
  executiveSummary:
    "The organization has improved its compliance posture significantly since the last audit. Key controls in A.5 (Organizational) and A.8 (Technological) are effectively implemented. Focus is now needed on A.7 (Physical) controls for remote workers.",
  overallScore: 35,
  implemented: 29,
  inProgress: 15,
  notStarted: 49,
  totalControls: 93,
  domains: [
    {
      code: "A.5",
      name: "Organizational Controls",
      description: "Policies, roles, responsibilities and asset management",
      implemented: 12,
      total: 37,
    },
    {
      code: "A.6",
      name: "People Controls",
      description: "HR security, awareness and training",
      implemented: 3,
      total: 8,
    },
    {
      code: "A.7",
      name: "Physical Controls",
      description: "Physical security and equipment protection",
      implemented: 5,
      total: 14,
    },
    {
      code: "A.8",
      name: "Technological Controls",
      description: "Access control, cryptography and operations",
      implemented: 10,
      total: 34,
    },
  ] as DomainSummary[],
  findings: [
    {
      type: "observation",
      title: "Physical Security",
      description:
        "Remote work policies for physical security (A.7) are drafted but not widely distributed. Recommended to schedule a training session.",
    },
    {
      type: "strength",
      title: "Access Control",
      description:
        "RBAC (A.8.3) is well implemented across all cloud infrastructure with 100% coverage.",
    },
  ],
};

export default function SummaryPage() {
  const currentUser = useUserStore((state) => state.currentUser);
  const data = mockSummaryData;

  const handlePrint = () => {
    window.print();
  };

  return (
    <>
      {/* Print Button - Hidden on print */}
      <div className="print:hidden fixed top-24 right-8 z-50">
        <button
          onClick={handlePrint}
          className="flex items-center gap-2 px-4 py-2 bg-main-blue text-white rounded-lg hover:bg-main-blue/90 shadow-lg"
        >
          <Printer className="w-4 h-4" />
          Print Report
        </button>
      </div>

      {/* A4 Print Layout */}
      <div className="flex flex-col min-h-screen py-8 px-8 lg:px-16 bg-slate-50/50 print:bg-white print:p-0 print:m-0">
        <div className="max-w-4xl mx-auto w-full bg-white rounded-xl border border-slate-200 print:border-0 print:shadow-none print:rounded-none">
          {/* Report Content */}
          <div className="p-8 print:p-12 space-y-8">
            {/* Header */}
            <header className="border-b border-slate-200 pb-6">
              <div className="flex justify-between items-start">
                <div>
                  <h1 className="text-2xl font-bold text-slate-800">
                    ISO 27001 Assessment Report
                  </h1>
                  <p className="text-sm text-slate-500 mt-1">
                    Confidential • Internal Use Only
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-slate-400">Date Generated</p>
                  <p className="text-sm font-medium text-slate-700">
                    {data.dateGenerated}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-8 mt-6">
                <div>
                  <p className="text-xs text-slate-400 uppercase tracking-wide">
                    Assessment Scope
                  </p>
                  <p className="font-medium text-slate-800">
                    {data.assessmentScope}
                  </p>
                  <p className="text-sm text-main-blue">{data.organization}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-400 uppercase tracking-wide">
                    Author
                  </p>
                  <p className="font-medium text-slate-800">{data.author}</p>
                </div>
              </div>
            </header>

            {/* 1. Executive Summary */}
            <section>
              <h2 className="text-lg font-bold text-slate-800 mb-3">
                1. Executive Summary
              </h2>
              <p className="text-slate-600 leading-relaxed">
                {data.executiveSummary}
              </p>
            </section>

            {/* 2. Compliance Overview */}
            <section>
              <h2 className="text-lg font-bold text-slate-800 mb-4">
                2. Compliance Overview
              </h2>
              <div className="grid grid-cols-4 gap-4">
                <StatCard
                  label="Overall Score"
                  value={`${data.overallScore}%`}
                  color="blue"
                />
                <StatCard
                  label="Implemented"
                  value={data.implemented.toString()}
                  color="green"
                />
                <StatCard
                  label="In Progress"
                  value={data.inProgress.toString()}
                  color="yellow"
                />
                <StatCard
                  label="Not Started"
                  value={data.notStarted.toString()}
                  color="gray"
                />
              </div>
            </section>

            {/* 3. Domain Analysis */}
            <section>
              <h2 className="text-lg font-bold text-slate-800 mb-4">
                3. Domain Analysis
              </h2>
              <div className="space-y-5">
                {data.domains.map((domain) => (
                  <DomainCard key={domain.code} domain={domain} />
                ))}
              </div>
            </section>

            {/* 4. Key Findings & Recommendations */}
            <section>
              <h2 className="text-lg font-bold text-slate-800 mb-4">
                4. Key Findings & Recommendations
              </h2>
              <div className="space-y-3">
                {data.findings.map((finding, index) => (
                  <FindingCard key={index} finding={finding} />
                ))}
              </div>
            </section>
          </div>
        </div>
      </div>

      {/* Print Styles */}
      <style>{`
        @media print {
          @page {
            size: A4;
            margin: 15mm;
          }
          body {
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
          .print\\:hidden {
            display: none !important;
          }
        }
      `}</style>
    </>
  );
}

function StatCard({
  label,
  value,
  color,
}: {
  label: string;
  value: string;
  color: "blue" | "green" | "yellow" | "gray";
}) {
  const colors = {
    blue: "text-blue-600 border-l-blue-500",
    green: "text-green-600 border-l-green-500",
    yellow: "text-yellow-600 border-l-yellow-500",
    gray: "text-slate-600 border-l-slate-400",
  };

  return (
    <div
      className={`bg-slate-50 p-4 border-l-4 ${colors[color]} print:bg-slate-50`}
    >
      <p className={`text-xs ${colors[color].split(" ")[0]}`}>{label}</p>
      <p className="text-2xl font-bold text-slate-800 mt-1">{value}</p>
    </div>
  );
}

function DomainCard({ domain }: { domain: DomainSummary }) {
  const percentage = Math.round((domain.implemented / domain.total) * 100);

  return (
    <div className="border-b border-slate-100 pb-4 last:border-0">
      <div className="flex justify-between items-start mb-2">
        <div>
          <h3 className="font-semibold text-slate-800">
            {domain.code} {domain.name}
          </h3>
          <p className="text-sm text-slate-500">{domain.description}</p>
        </div>
        <span className="text-sm font-medium text-main-blue">
          {percentage}% Compliant
        </span>
      </div>

      {/* Progress Bar */}
      <div className="h-2 bg-slate-100 rounded-full overflow-hidden mt-2">
        <div
          className="h-full bg-main-blue rounded-full transition-all"
          style={{ width: `${percentage}%` }}
        />
      </div>
      <p className="text-xs text-slate-400 mt-1">
        {domain.implemented} / {domain.total} Controls Authorized
      </p>
    </div>
  );
}

function FindingCard({
  finding,
}: {
  finding: { type: string; title: string; description: string };
}) {
  const isObservation = finding.type === "observation";

  return (
    <div
      className={`p-4 rounded-lg border-l-4 ${
        isObservation
          ? "bg-yellow-50 border-l-yellow-400"
          : "bg-green-50 border-l-green-400"
      }`}
    >
      <div className="flex items-center gap-2 mb-1">
        {isObservation ? (
          <AlertTriangle className="w-4 h-4 text-yellow-600" />
        ) : (
          <CheckCircle className="w-4 h-4 text-green-600" />
        )}
        <span
          className={`text-sm font-semibold ${
            isObservation ? "text-yellow-800" : "text-green-800"
          }`}
        >
          {isObservation ? "Observation" : "Strength"}: {finding.title}
        </span>
      </div>
      <p
        className={`text-sm ${
          isObservation ? "text-yellow-700" : "text-green-700"
        }`}
      >
        {finding.description}
      </p>
    </div>
  );
}
