import { useEffect, useState } from "react";
import { Building2, ChevronsUpDown, Check } from "lucide-react";
import { useAdminStore, useUserStore } from "~/stores";
import { CompanyService } from "~/services/CompanyService";
import { UserRole } from "~/types";
import type { CompanyResponseDto } from "~/dto";

export function CompanySwitcher() {
  const currentUser = useUserStore((state) => state.currentUser);
  const { selectedCompanyId, setSelectedCompanyId } = useAdminStore();
  const [companies, setCompanies] = useState<CompanyResponseDto[]>([]);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    CompanyService.getAllCompany().then((data) => {
      if (data) {
        setCompanies(data);
        // Auto-select first company if none selected (Hybrid View requires selection)
        // Only if we don't have a selection already
        if (!selectedCompanyId && data.length > 0) {
          setSelectedCompanyId(data[0].id);
        }
      }
    });
  }, [selectedCompanyId, setSelectedCompanyId]);

  // Only Admins can switch companies
  if (!currentUser || currentUser.role !== UserRole.ADMIN) {
    return null;
  }

  const selectedCompany = companies.find((c) => c.id === selectedCompanyId);

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-2 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors min-w-[200px] justify-between"
      >
        <div className="flex items-center gap-2 truncate">
          <Building2 className="w-4 h-4 text-slate-500" />
          <span className="text-sm font-medium text-slate-700 truncate">
            {selectedCompany
              ? selectedCompany.name
              : "All Companies (Admin View)"}
          </span>
        </div>
        <ChevronsUpDown className="w-4 h-4 text-slate-400 shrink-0" />
      </button>

      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-40"
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute top-full right-0 mt-2 w-64 bg-white border border-slate-200 rounded-xl shadow-xl z-50 max-h-96 overflow-y-auto py-1">
            <div className="p-2 border-b border-slate-100">
              <p className="text-xs font-semibold text-slate-500 uppercase px-2 mb-1">
                Admin Context
              </p>
            </div>

            {/* Global option removed as per request */}

            <div className="border-t border-slate-100 my-1" />

            {companies.map((company) => (
              <button
                key={company.id}
                onClick={() => {
                  setSelectedCompanyId(company.id);
                  setIsOpen(false);
                }}
                className="w-full flex items-center justify-between px-4 py-2 text-sm text-left hover:bg-slate-50 transition-colors"
              >
                <span
                  className={`truncate ${
                    selectedCompanyId === company.id
                      ? "font-bold text-main-blue"
                      : "text-slate-700"
                  }`}
                >
                  {company.name}
                </span>
                {selectedCompanyId === company.id && (
                  <Check className="w-4 h-4 text-main-blue" />
                )}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
