import { useLoaderData } from "react-router";
import { Domains, type TDomain, ControlStatus, UserRole } from "~/types";
import { DomainCard, type DomainStats } from "~/components/ui/domainCard";
import {
  ControlService,
  AssessmentControlService,
  IsoAssessmentService,
} from "~/services";
import { useYearStore } from "~/stores/yearStore";
import { useUserStore } from "~/stores/userStore";
import { useAdminStore } from "~/stores/adminStore";

export async function loader() {
  // Fetch all necessary data to filter by year
  const [controls, assessmentControls, isoAssessments] = await Promise.all([
    ControlService.getAllControl(),
    AssessmentControlService.getAllAssessmentControl(),
    IsoAssessmentService.getAllIsoAssessment(),
  ]);

  return { controls, assessmentControls, isoAssessments };
}

export default function AssessmentOverview() {
  const { controls, assessmentControls, isoAssessments } =
    useLoaderData<typeof loader>();
  const { currentYear } = useYearStore();
  const currentUser = useUserStore((state) => state.currentUser);

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

    // If no target company...
    if (!targetCompanyId) {
      // Admin Global View: Show all
      if (currentUser?.role === UserRole.ADMIN) return true;
      // Unassigned User: Show nothing
      return false;
    }

    // Otherwise, filter by specific company
    return a.companyId === targetCompanyId;
  });
  const activeAssessmentIds = activeAssessments.map((a) => a.id);

  // 2. Find assessment controls linked to active assessments
  const activeAssessmentControls = assessmentControls.filter((ac) =>
    activeAssessmentIds.includes(ac.isoAssessmentId),
  );
  const activeAssessmentControlIds = activeAssessmentControls.map(
    (ac) => ac.id,
  );

  // 3. Filter controls linked to active assessment controls
  const filteredControls = controls.filter((c) =>
    activeAssessmentControlIds.includes(c.assessmentControlId),
  );

  // Aggregate stats per domain using filtered controls
  // Return keys to avoid serialization issues
  const domainsStats = Object.entries(Domains).map(([key, domain]) => {
    const domainPrefix = `A.${domain.number}`;
    const domainControls = filteredControls.filter((c) =>
      c.code.startsWith(domainPrefix),
    );

    const stats: DomainStats = {
      todo: domainControls.filter(
        (c) => c.status === ControlStatus.NOT_IMPLEMENTED,
      ).length,
      inProgress: domainControls.filter(
        (c) => c.status === ControlStatus.PARTIALLY,
      ).length,
      done: domainControls.filter((c) => c.status === ControlStatus.IMPLEMENTED)
        .length,
      total: domainControls.length,
    };

    return {
      domainKey: key,
      stats,
    };
  });

  return (
    <div className="flex flex-col w-full h-full justify-center items-center gap-4 py-8">
      {domainsStats.map(({ domainKey, stats }) => {
        const domain = Domains[domainKey];
        if (!domain) return null;

        return <DomainCard key={domainKey} domain={domain} stats={stats} />;
      })}
    </div>
  );
}
