import { useLoaderData } from "react-router";
import { useState, useEffect } from "react";
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
import { Loader2 } from "lucide-react";
import type { ControlResponseDto } from "~/dto";

export async function loader() {
  // Only fetch assessments list
  const isoAssessments = await IsoAssessmentService.getAllIsoAssessment();
  return { isoAssessments };
}

export default function AssessmentOverview() {
  const { isoAssessments } = useLoaderData<typeof loader>();
  const { currentYear } = useYearStore();
  const currentUser = useUserStore((state) => state.currentUser);
  const { selectedCompanyId } = useAdminStore();

  const [loading, setLoading] = useState(true);
  const [controls, setControls] = useState<ControlResponseDto[]>([]);

  // Fetch Data Effect
  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      try {
        // 1. Determine target company
        const targetCompanyId =
          currentUser?.role === UserRole.ADMIN
            ? selectedCompanyId
            : currentUser?.companyId;

        // 2. Find active assessment
        const activeAssessment = isoAssessments.find((a) => {
          if (a.year !== currentYear) return false;
          if (!targetCompanyId) {
            // Admin Global View: Show all (or first?)
            // Logic in original was: if (!targetCompanyId) -> if Admin return true -> filter keeps all.
            // Here we need ONE active assessment to fetch controls for?
            // If Admin sees ALL companies, aggregating stats across companies is complex.
            // Original: `const activeAssessments = isoAssessments.filter(...)`
            // Then `activeAssessmentIds` map.
            // Then `activeAssessmentControls` filter (IN ids).
            // If so, we must support multiple assessments.
            return currentUser?.role === UserRole.ADMIN;
          }
          return a.companyId === targetCompanyId;
        });

        // Wait, original logic supported MULTIPLE assessments (e.g. if Admin views global).
        // Let's replicate this support.
        const activeAssessments = isoAssessments.filter((a) => {
          if (a.year !== currentYear) return false;
          if (!targetCompanyId) {
            if (currentUser?.role === UserRole.ADMIN) return true;
            return false;
          }
          return a.companyId === targetCompanyId;
        });

        if (activeAssessments.length === 0) {
          setControls([]);
          return;
        }

        // 3. Fetch AssessmentControls for ALL active assessments
        // Optimized: Fetch parallel
        const allAcs = await Promise.all(
          activeAssessments.map((a) =>
            AssessmentControlService.getAllByIsoAssessmentId(a.id),
          ),
        );
        const flattenedAcs = allAcs.flat();

        // 4. Fetch Controls for ALL assessment controls
        // This might be many requests if Admin view. But for single company (User view), it's just 4 requests.
        const allControls = await Promise.all(
          flattenedAcs.map((ac) =>
            ControlService.getAllByAssessmentControlId(ac.id),
          ),
        );

        setControls(allControls.flat());
      } catch (error) {
        console.error("Error fetching overview data", error);
        setControls([]);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, [currentYear, currentUser, selectedCompanyId, isoAssessments]);

  // Aggregate stats per domain using filtered controls
  const domainsStats = Object.entries(Domains).map(([key, domain]) => {
    const domainPrefix = `A.${domain.number}`;
    const domainControls = controls.filter((c) =>
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

  if (loading && controls.length === 0) {
    return (
      <div className="flex justify-center items-center h-full py-20 w-full">
        <Loader2 className="w-8 h-8 animate-spin text-main-blue opacity-50" />
      </div>
    );
  }

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
