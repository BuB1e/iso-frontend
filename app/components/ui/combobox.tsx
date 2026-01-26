import * as React from "react";
import { CheckIcon, ChevronsUpDownIcon } from "lucide-react";

import { cn } from "~/lib/utils";
import { Button } from "~/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "~/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "~/components/ui/popover";
import { useYearStore } from "~/stores/yearStore";

import { useNavigate, useRevalidator } from "react-router";
import { Plus } from "lucide-react";
import { IsoAssessmentService } from "~/services";
import { useUserStore } from "~/stores/userStore";
import { useAdminStore } from "~/stores/adminStore";
import { UserRole } from "~/types";

export function TopbarYearCombobox() {
  const { currentYear, setCurrentYear, allYears } = useYearStore();
  const [open, setOpen] = React.useState(false);
  const revalidator = useRevalidator();
  const navigate = useNavigate();

  const currentUser = useUserStore((state) => state.currentUser);
  const { selectedCompanyId } = useAdminStore();

  // Determine target company ID
  const targetCompanyId =
    currentUser?.role === UserRole.ADMIN
      ? selectedCompanyId
      : currentUser?.companyId;

  // Calculate next year
  const nextYear =
    allYears.length > 0 ? Math.max(...allYears) + 1 : new Date().getFullYear();

  const handleCreateYear = async () => {
    if (!targetCompanyId) return;

    const newAssessment = await IsoAssessmentService.createIsoAssessment({
      name: `ISO 27001:2022 Assessment ${nextYear}`,
      year: nextYear,
      companyId: targetCompanyId,
    });

    if (newAssessment) {
      // Refresh data to update store and UI
      await revalidator.revalidate();
      setCurrentYear(nextYear);
      setOpen(false);
    }
  };

  // Use dynamic years from store
  const displayYears =
    allYears.length > 0
      ? allYears.map((y) => ({ value: y, label: y.toString() }))
      : [];
  // If empty, we show no options (or current year if added to store)

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-[200px] justify-between"
        >
          {currentYear
            ? displayYears.find((year) => year.value === currentYear)?.label ||
              currentYear.toString()
            : "Select year..."}
          <ChevronsUpDownIcon className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[200px] p-0">
        <Command>
          <CommandInput placeholder="Search year..." />
          <CommandList>
            <CommandEmpty>No year found.</CommandEmpty>
            <CommandGroup>
              {displayYears.map((year) => (
                <CommandItem
                  key={year.value}
                  value={year.value.toString()}
                  onSelect={(currentValue) => {
                    // CommandItem value is always lowercase string?
                    // Use the original year value from mapping
                    setCurrentYear(year.value);
                    setOpen(false);
                  }}
                >
                  <CheckIcon
                    className={cn(
                      "mr-2 h-4 w-4",
                      currentYear === year.value ? "opacity-100" : "opacity-0",
                    )}
                  />
                  {year.label}
                </CommandItem>
              ))}
            </CommandGroup>
            {/* Create New Year Button - Hide for External Experts */}
            {targetCompanyId &&
              currentUser?.role !== UserRole.EXTERNAL_EXPERT && (
                <>
                  <div className="h-px bg-slate-200 my-1" />
                  <CommandGroup>
                    <CommandItem
                      value={`create-${nextYear}`}
                      onSelect={handleCreateYear}
                      className="text-main-blue font-medium cursor-pointer"
                    >
                      <Plus className="mr-2 h-4 w-4" />
                      Create {nextYear}
                    </CommandItem>
                  </CommandGroup>
                </>
              )}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
