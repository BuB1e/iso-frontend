import { useLoaderData } from "react-router";
import { useState, useEffect } from "react";
import type { LoaderFunctionArgs } from "react-router";
import { ControlItem } from "~/components/ui/controlItem";
import { ControlStatus, ControlsType, UserRole, Domains } from "~/types";
import {
  ControlService,
  AssessmentControlService,
  IsoAssessmentService,
} from "~/services";
import type { ControlResponseDto } from "~/dto";
import { useYearStore } from "~/stores/yearStore";
import { useUserStore } from "~/stores/userStore";
import { useAdminStore } from "~/stores/adminStore";

// Map domain number to ControlsType
const domainNumberToType: Record<string, ControlsType> = {
  A5: ControlsType.ORGANIZATION,
  A6: ControlsType.PEOPLE,
  A7: ControlsType.PHYSICAL,
  A8: ControlsType.TECHNOLOGICAL,
};

// Extended interface for component compatibility
interface DomainControl extends ControlResponseDto {
  [key: string]: unknown;
}

// Loader - fetch controls by domain
export async function loader({ params }: LoaderFunctionArgs) {
  const domainNumber = params.domainNumber || "A5";

  // Extract domain number directly from string (e.g., "A7" -> 7)
  const domainNum = parseInt(domainNumber.replace("A", ""), 10) || 5;
  const domainType =
    domainNumberToType[domainNumber] || ControlsType.ORGANIZATION;

  // Fetch all data for filtering
  const [allControls, assessmentControls, isoAssessments] = await Promise.all([
    ControlService.getAllControl(),
    AssessmentControlService.getAllAssessmentControl(),
    IsoAssessmentService.getAllIsoAssessment(),
  ]);

  // Filter by domain code prefix (A.5, A.6, A.7, A.8)
  const controls = allControls.filter((c: ControlResponseDto) =>
    c.code.startsWith(`A.${domainNum}`),
  );

  return {
    controls: controls as DomainControl[],
    assessmentControls,
    isoAssessments,
    domainNumber,
    domainType,
  };
}

export default function DomainDetail() {
  const {
    controls,
    assessmentControls,
    isoAssessments,
    domainNumber,
    domainType,
  } = useLoaderData<typeof loader>();
  const { currentYear } = useYearStore();
  const currentUser = useUserStore((state) => state.currentUser);
  const [statusFilter, setStatusFilter] = useState<string>("ALL");

  // Determine effective company filter
  const { selectedCompanyId } = useAdminStore();
  const targetCompanyId =
    currentUser?.role === UserRole.ADMIN
      ? selectedCompanyId
      : currentUser?.companyId;

  // Filter controls by current year AND user's company
  // 1. Find assessments for current year
  const activeAssessments = isoAssessments.filter((a) => {
    if (a.year !== currentYear) return false;

    // If no target company (Global Admin View), show all
    if (!targetCompanyId) return true;

    // Otherwise, filter by specific company
    return a.companyId === targetCompanyId;
  });
  const activeAssessmentIds = activeAssessments.map((a) => a.id);

  // Map domain number to type string
  const domainTypeMap: Record<string, string> = {
    A5: "ORGANIZATION",
    A6: "PEOPLE",
    A7: "PHYSICAL",
    A8: "TECHNOLOGICAL",
  };
  const expectedType = domainTypeMap[domainNumber] || "ORGANIZATION";

  // 2. Find assessment controls linked to active assessments AND matching domain type
  const activeAssessmentControls = assessmentControls.filter(
    (ac) =>
      activeAssessmentIds.includes(ac.isoAssessmentId) &&
      String(ac.type) === expectedType,
  );
  const activeAssessmentControlIds = activeAssessmentControls.map(
    (ac) => ac.id,
  );

  // 3. Filter controls linked to active assessment controls AND sort by code (natural sort)
  const filteredControls = controls
    .filter((c) => activeAssessmentControlIds.includes(c.assessmentControlId))
    .sort((a, b) =>
      a.code.localeCompare(b.code, undefined, {
        numeric: true,
        sensitivity: "base",
      }),
    );

  // Get domain info directly from Domains constant using domainNumber string
  const domainInfo = Domains[domainNumber];
  const domainName = domainInfo?.name || "Unknown Domain";
  const domainNum = domainInfo?.number || 5;

  // Set page title
  useEffect(() => {
    document.title = `${domainNum} ${domainName} | ISO Portal`;
    return () => {
      document.title = "ISO Portal";
    };
  }, [domainNum, domainName]);

  // Calculate progress stats based on filtered controls
  const implemented = filteredControls.filter(
    (c) => c.status === ControlStatus.IMPLEMENTED,
  ).length;

  // Create assessment control context for the ControlItem component (for current year)
  // We need the assessment control object for the item type.
  // We pick the first one matching the type for this year as they are redundant by type per assessment
  // We need the assessment control object for the item type.
  // We pick the first one matching the type for this year as they are redundant by type per assessment
  const currentAssessmentControl =
    activeAssessmentControls.find((ac) => String(ac.type) === expectedType) ||
    ({
      id: 0,
      assessmentId: 0,
      type: expectedType, // Use string type matching expectation (e.g. "PHYSICAL")
      count: implemented,
      maxCount: filteredControls.length,
      description: domainName,
    } as any); // Fallback or partial mock if no year match

  // But ControlItem needs SPECIFIC assessment control for each item?
  // Actually ControlItem uses assessmentControl.type mostly.
  // And links.

  return (
    <div className="flex flex-col gap-6 w-full">
      {/* Header */}
      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-3">
          <span className="px-2 py-1 bg-main-blue/10 text-main-blue font-bold rounded text-sm">
            A.{domainNum}
          </span>
          <h1 className="text-xl font-bold text-slate-800">{domainName}</h1>
        </div>
        <p className="text-slate-500 text-sm">
          Review and assess the implementation status of each control in this
          domain for {currentYear}.
        </p>

        {/* Progress Summary and Filter */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4 mt-2">
          <div className="flex gap-4">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-green-500"></span>
              <span className="text-sm text-slate-600">
                {implemented} Implemented
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-yellow-500"></span>
              <span className="text-sm text-slate-600">
                {
                  filteredControls.filter(
                    (c) => c.status === ControlStatus.PARTIALLY,
                  ).length
                }{" "}
                Partially
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-gray-300"></span>
              <span className="text-sm text-slate-600">
                {
                  filteredControls.filter(
                    (c) => c.status === ControlStatus.NOT_IMPLEMENTED,
                  ).length
                }{" "}
                Not Implemented
              </span>
            </div>
          </div>

          {/* Filter Dropdown */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 border border-slate-200 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-main-blue/20"
          >
            <option value="ALL">All Status</option>
            <option value={ControlStatus.IMPLEMENTED}>Implemented</option>
            <option value={ControlStatus.PARTIALLY}>
              Partially Implemented
            </option>
            <option value={ControlStatus.NOT_IMPLEMENTED}>
              Not Implemented
            </option>
          </select>
        </div>
      </div>

      {/* Controls List */}
      <div className="flex flex-col gap-3">
        {filteredControls.filter(
          (c) => statusFilter === "ALL" || c.status === statusFilter,
        ).length > 0 ? (
          filteredControls
            .filter((c) => statusFilter === "ALL" || c.status === statusFilter)
            .map((control) => (
              <ControlItem
                key={control.id} // Use ID as key, not code, since codes assume uniqueness but filtering ensures one per year
                control={control}
                assessmentControl={currentAssessmentControl}
              />
            ))
        ) : (
          <div className="p-8 text-center border border-dashed border-slate-300 rounded-xl">
            <p className="text-slate-500">
              No controls found for {currentYear}.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
