import { useLoaderData } from "react-router";
import { Domains, type TDomain, ControlStatus } from "~/types";
import { DomainCard, type DomainStats } from "~/components/ui/domainCard";
import { ControlService } from "~/services/ControlService";
import { AssessmentControlService } from "~/services/AssessmentControlService";
import { IsoAssessmentService } from "~/services/IsoAssessmentService";
import { useYearStore } from "~/stores/yearStore";
import { useUserStore } from "~/stores/userStore";

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

  // Filter controls by current year AND user's company
  // 1. Find assessments for current year
  const activeAssessments = isoAssessments.filter(
    (a) =>
      a.year === currentYear &&
      (currentUser?.companyId ? a.companyId === currentUser.companyId : true),
  );
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
