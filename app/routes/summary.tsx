import { useLoaderData } from "react-router";
import { Printer } from "lucide-react";
import {
  ControlStatus,
  ControlsType,
  type TControl,
  type TAssessmentControl,
  UserRole,
} from "~/types";
import { IsoAssessmentService } from "~/services/IsoAssessmentService";
import { ControlService } from "~/services/ControlService";
import { AssessmentControlService } from "~/services/AssessmentControlService";
import type { SummaryItemDto, DomainSummary } from "~/dto";
import { useYearStore } from "~/stores/yearStore";
import { useUserStore } from "~/stores/userStore";
import { useAdminStore } from "~/stores/adminStore";

// Map backend type to display info
const typeConfig: Record<
  ControlsType,
  { code: string; name: string; description: string }
> = {
  [ControlsType.ORGANIZATION]: {
    code: "A.5",
    name: "Organizational Controls",
    description: "Policies, roles, responsibilities and asset management",
  },
  [ControlsType.PEOPLE]: {
    code: "A.6",
    name: "People Controls",
    description: "HR security, awareness and training",
  },
  [ControlsType.PHYSICAL]: {
    code: "A.7",
    name: "Physical Controls",
    description: "Physical security and equipment protection",
  },
  [ControlsType.TECHNOLOGICAL]: {
    code: "A.8",
    name: "Technological Controls",
    description: "Access control, cryptography and operations",
  },
};

// Process controls into domain summaries
function processSummaryData(
  controls: TControl[],
  assessmentControls: TAssessmentControl[],
): {
  domains: DomainSummary[];
  totals: {
    implemented: number;
    partially: number;
    notImplemented: number;
    total: number;
  };
} {
  const domainMap = new Map<
    ControlsType,
    { notImplemented: number; partially: number; implemented: number }
  >();

  // Initialize only valid domain types present in config
  // Object.keys returns strings, so cast to Number for Enum keys
  // typeConfig keys are 0, 1, 2, 3 (ControlsType values)
  for (const key of Object.keys(typeConfig)) {
    const type = Number(key) as ControlsType;
    domainMap.set(type, { notImplemented: 0, partially: 0, implemented: 0 });
  }

  // Aggregate counts
  for (const control of controls) {
    const ac = assessmentControls.find(
      (a) => a.id === control.assessmentControlId,
    );
    if (ac) {
      // Resolve backend type (which might be string "ORGANIZATION") to Enum Value (2)
      // If ac.type is already number, use it. If string, look it up in Enum.
      let type = ac.type;
      if (typeof type === "string") {
        // @ts-ignore - access enum by string key
        type = ControlsType[type];
      }

      const existing = domainMap.get(type);
      if (existing) {
        if (control.status === ControlStatus.NOT_IMPLEMENTED) {
          existing.notImplemented++;
        } else if (control.status === ControlStatus.PARTIALLY) {
          existing.partially++;
        } else if (control.status === ControlStatus.IMPLEMENTED) {
          existing.implemented++;
        }
      }
    }
  }

  // Convert to DomainSummary
  const domains: DomainSummary[] = [];
  let totalImplemented = 0;
  let totalPartially = 0;
  let totalNotImplemented = 0;

  for (const [type, counts] of domainMap) {
    const config = typeConfig[type];
    // Config should exist because we initialized map from typeConfig keys
    if (!config) continue;

    const total = counts.notImplemented + counts.partially + counts.implemented;
    const percentage =
      total > 0 ? Math.round((counts.implemented / total) * 100) : 0;

    totalImplemented += counts.implemented;
    totalPartially += counts.partially;
    totalNotImplemented += counts.notImplemented;

    domains.push({
      type,
      ...config,
      notImplemented: counts.notImplemented,
      partially: counts.partially,
      implemented: counts.implemented,
      total,
      percentage,
    });
  }

  return {
    domains,
    totals: {
      implemented: totalImplemented,
      partially: totalPartially,
      notImplemented: totalNotImplemented,
      total: totalImplemented + totalPartially + totalNotImplemented,
    },
  };
}

// Loader - fetch all data
export async function loader() {
  const [controls, assessmentControls, isoAssessments] = await Promise.all([
    ControlService.getAllControl(),
    AssessmentControlService.getAllAssessmentControl(),
    IsoAssessmentService.getAllIsoAssessment(),
  ]);

  return {
    controls,
    assessmentControls,
    isoAssessments,
    dateGenerated: new Date().toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    }),
  };
}

export default function SummaryPage() {
  const { controls, assessmentControls, isoAssessments, dateGenerated } =
    useLoaderData<typeof loader>();
  const { currentYear } = useYearStore();
  const currentUser = useUserStore((state) => state.currentUser);

  // Determine effective company filter
  const { selectedCompanyId } = useAdminStore();
  const targetCompanyId =
    currentUser?.role === UserRole.ADMIN
      ? selectedCompanyId
      : currentUser?.companyId;

  // Filter by year AND user's company
  const activeAssessments = isoAssessments.filter((a) => {
    if (a.year !== currentYear) return false;

    // If no target company...
    if (!targetCompanyId) {
      // Admin Global View: Show all
      if (currentUser?.role === UserRole.ADMIN) return true;
      // Unassigned User: Show nothing
      return false;
    }

    // Otherwise, filter by specific company
    return Number(a.companyId) === Number(targetCompanyId);
  });
  const activeAssessmentIds = activeAssessments.map((a) => a.id);
  const activeAssessmentControls = assessmentControls.filter((ac) =>
    activeAssessmentIds.includes(ac.isoAssessmentId),
  );
  const activeAssessmentControlIds = activeAssessmentControls.map(
    (ac) => ac.id,
  );

  const filteredControls = controls.filter((c) =>
    activeAssessmentControlIds.includes(c.assessmentControlId),
  );

  // Process filtered data
  const { domains, totals } = processSummaryData(
    filteredControls,
    activeAssessmentControls as unknown as TAssessmentControl[],
  );

  const overallPercentage =
    totals.total > 0
      ? Math.round((totals.implemented / totals.total) * 100)
      : 0;

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
                    {dateGenerated}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-8 mt-6">
                <div>
                  <p className="text-xs text-slate-400 uppercase tracking-wide">
                    Assessment Scope
                  </p>
                  <p className="font-medium text-slate-800">
                    {currentYear} ISO 27001 Audit
                  </p>
                  <p className="text-sm text-main-blue">Entire Organization</p>
                </div>
                <div>
                  <p className="text-xs text-slate-400 uppercase tracking-wide">
                    Author
                  </p>
                  <p className="font-medium text-slate-800">System Generated</p>
                </div>
              </div>

              {/* Debug Info - Remove in production */}
              {filteredControls.length === 0 && (
                <div className="p-4 bg-orange-50 border border-orange-200 rounded mt-4 text-xs font-mono text-orange-800 print:hidden">
                  <p>
                    <strong>Debug: No Data Found</strong>
                  </p>
                  <p>Target Company ID: {targetCompanyId}</p>
                  <p>Current Year: {currentYear}</p>
                  <p>Active Assessments: {activeAssessments.length}</p>
                  <p>
                    Active Assessment Controls:{" "}
                    {activeAssessmentControls.length}
                  </p>
                  <p>Total Controls Fetched: {controls.length}</p>
                </div>
              )}
            </header>

            {/* 1. Compliance Overview */}
            <section>
              <h2 className="text-lg font-bold text-slate-800 mb-4">
                1. Compliance Overview
              </h2>
              <div className="grid grid-cols-4 gap-4">
                <StatCard
                  label="Overall Score"
                  value={`${overallPercentage}%`}
                  color="blue"
                />
                <StatCard
                  label="Implemented"
                  value={totals.implemented.toString()}
                  color="green"
                />
                <StatCard
                  label="In Progress"
                  value={totals.partially.toString()}
                  color="yellow"
                />
                <StatCard
                  label="Not Started"
                  value={totals.notImplemented.toString()}
                  color="gray"
                />
              </div>
            </section>

            {/* 2. Domain Analysis */}
            <section>
              <h2 className="text-lg font-bold text-slate-800 mb-4">
                2. Domain Analysis
              </h2>
              <div className="space-y-5">
                {domains.map((domain) => (
                  <DomainCard key={domain.type} domain={domain} />
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
          {domain.percentage}% Compliant
        </span>
      </div>

      {/* Progress Bar */}
      <div className="h-2 bg-slate-100 rounded-full overflow-hidden mt-2">
        <div
          className="h-full bg-main-blue rounded-full transition-all"
          style={{ width: `${domain.percentage}%` }}
        />
      </div>
      <p className="text-xs text-slate-400 mt-1">
        {domain.implemented} / {domain.total} Controls Authorized
      </p>
    </div>
  );
}
