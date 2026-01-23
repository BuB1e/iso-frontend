"use client";

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

const years = [
  {
    value: 2022,
    label: "2022",
  },
  {
    value: 2023,
    label: "2023",
  },
  {
    value: 2024,
    label: "2024",
  },
  {
    value: 2025,
    label: "2025",
  },
  {
    value: 2026,
    label: "2026",
  },
];

export function TopbarYearCombobox() {
  const { currentYear, setCurrentYear, allYears } = useYearStore();
  const [open, setOpen] = React.useState(false);

  // Use dynamic years from store, or fallback/default if empty
  // Assuming allYears is populated by the app (e.g. dashboard loader)
  // If empty, we might want to show at least current year or a default range
  const displayYears =
    allYears.length > 0
      ? allYears.map((y) => ({ value: y, label: y.toString() }))
      : [
          { value: 2024, label: "2024" },
          { value: 2025, label: "2025" },
          { value: 2026, label: "2026" },
        ];

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
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
