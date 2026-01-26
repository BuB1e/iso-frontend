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
import type {
  ControlResponseDto,
  AssessmentControlResponseDto,
  IsoAssessmentResponseDto,
} from "~/dto";
import { useYearStore } from "~/stores/yearStore";
import { useUserStore } from "~/stores/userStore";
import { useAdminStore } from "~/stores/adminStore";
import { Loader2 } from "lucide-react";

// Map domain number to ControlsType
const domainNumberToType: Record<string, ControlsType> = {
  A5: ControlsType.ORGANIZATION,
  A6: ControlsType.PEOPLE,
  A7: ControlsType.PHYSICAL,
  A8: ControlsType.TECHNOLOGICAL,
};

// Loader - only fetch lightweight assessment list
export async function loader({ params }: LoaderFunctionArgs) {
  const domainNumber = params.domainNumber || "A5";

  // Fetch all assessments (lightweight) to determine context
  const isoAssessments = await IsoAssessmentService.getAllIsoAssessment();

  return {
    isoAssessments,
    domainNumber,
  };
}

export default function DomainDetail() {
  const { isoAssessments, domainNumber } = useLoaderData<typeof loader>();
  const { currentYear } = useYearStore();
  const currentUser = useUserStore((state) => state.currentUser);
  const { selectedCompanyId } = useAdminStore();

  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [loading, setLoading] = useState(true);
  const [controls, setControls] = useState<ControlResponseDto[]>([]);
  const [currentAssessmentControl, setCurrentAssessmentControl] =
    useState<AssessmentControlResponseDto | null>(null);

  // Extract domain info
  const domainInfo = Domains[domainNumber];
  const domainName = domainInfo?.name || "Unknown Domain";
  const domainNum = domainInfo?.number || 5;

  // Map domain number to type string
  const domainTypeMap: Record<string, string> = {
    A5: "ORGANIZATION",
    A6: "PEOPLE",
    A7: "PHYSICAL",
    A8: "TECHNOLOGICAL",
  };
  const expectedType = domainTypeMap[domainNumber] || "ORGANIZATION";

  // Effect to fetch specific data when context (year/company) changes
  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      try {
        // 1. Determine target company
        const targetCompanyId =
          currentUser?.role === UserRole.ADMIN
            ? selectedCompanyId
            : currentUser?.companyId;

        // 2. Find active assessment for this year & company
        const activeAssessment = isoAssessments.find((a) => {
          if (a.year !== currentYear) return false;
          if (!targetCompanyId) return true; // Global admin view (might default to first found?)
          return a.companyId === targetCompanyId;
        });

        if (!activeAssessment) {
          setControls([]);
          setCurrentAssessmentControl(null);
          return;
        }

        // 3. Fetch AssessmentControls for this assessment
        const acs = await AssessmentControlService.getAllByIsoAssessmentId(
          activeAssessment.id,
        );

        // 4. Find the specific AssessmentControl for this domain
        const targetAc = acs.find((ac) => String(ac.type) === expectedType);

        if (targetAc) {
          setCurrentAssessmentControl(targetAc);
          // 5. Fetch Controls for this AssessmentControl
          const fetchedControls =
            await ControlService.getAllByAssessmentControlId(targetAc.id);

          // Sort naturally
          fetchedControls.sort((a, b) =>
            a.code.localeCompare(b.code, undefined, {
              numeric: true,
              sensitivity: "base",
            }),
          );
          setControls(fetchedControls);
        } else {
          setControls([]);
          setCurrentAssessmentControl(null);
        }
      } catch (error) {
        console.error("Failed to fetch domain data", error);
        setControls([]);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, [
    currentYear,
    currentUser,
    selectedCompanyId,
    isoAssessments,
    expectedType,
  ]);

  // Set page title
  useEffect(() => {
    document.title = `${domainNum} ${domainName} | ISO Portal`;
    return () => {
      document.title = "ISO Portal";
    };
  }, [domainNum, domainName]);

  // Calculate stats
  const implemented = controls.filter(
    (c) => c.status === ControlStatus.IMPLEMENTED,
  ).length;

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
                  controls.filter((c) => c.status === ControlStatus.PARTIALLY)
                    .length
                }{" "}
                Partially
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-gray-300"></span>
              <span className="text-sm text-slate-600">
                {
                  controls.filter(
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
        {loading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-main-blue opacity-50" />
          </div>
        ) : controls.length > 0 ? (
          controls
            .filter((c) => statusFilter === "ALL" || c.status === statusFilter)
            .map((control) => (
              <ControlItem
                key={control.id}
                control={control}
                assessmentControl={
                  currentAssessmentControl ||
                  ({
                    type: expectedType, // Fallback for color mapping
                  } as any)
                }
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
