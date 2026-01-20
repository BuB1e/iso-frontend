import * as React from "react";
import { ChevronLeft, ChevronRight, Search } from "lucide-react";
import { cn } from "~/lib/utils";

// ============ DATA TABLE TYPES ============
export interface Column<T> {
  key: string;
  header: string;
  render?: (item: T) => React.ReactNode;
  className?: string;
  sortable?: boolean;
}

interface DataTableProps<T> {
  data: T[];
  columns: Column<T>[];
  keyField: keyof T;
  searchPlaceholder?: string;
  searchFields?: (keyof T)[];
  emptyMessage?: string;
  pageSize?: number;
  className?: string;
  onRowClick?: (item: T) => void;
}

// ============ DATA TABLE COMPONENT ============
export function DataTable<T extends Record<string, unknown>>({
  data,
  columns,
  keyField,
  searchPlaceholder = "Search...",
  searchFields,
  emptyMessage = "No data found",
  pageSize = 10,
  className,
  onRowClick,
}: DataTableProps<T>) {
  const [search, setSearch] = React.useState("");
  const [currentPage, setCurrentPage] = React.useState(1);

  // Filter data based on search
  const filteredData = React.useMemo(() => {
    if (!search || !searchFields?.length) return data;

    const searchLower = search.toLowerCase();
    return data.filter((item) =>
      searchFields.some((field) => {
        const value = item[field];
        return String(value).toLowerCase().includes(searchLower);
      }),
    );
  }, [data, search, searchFields]);

  // Pagination
  const totalPages = Math.ceil(filteredData.length / pageSize);
  const paginatedData = React.useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredData.slice(start, start + pageSize);
  }, [filteredData, currentPage, pageSize]);

  // Reset to page 1 when search changes
  React.useEffect(() => {
    setCurrentPage(1);
  }, [search]);

  return (
    <div className={cn("flex flex-col gap-4", className)}>
      {/* Search */}
      {searchFields && searchFields.length > 0 && (
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={searchPlaceholder}
            className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-lg bg-white text-slate-800 focus:outline-none focus:ring-2 focus:ring-main-blue/20 focus:border-main-blue"
          />
        </div>
      )}

      {/* Table */}
      <div className="overflow-x-auto rounded-lg border border-slate-200 bg-white">
        <table className="w-full">
          <thead className="bg-slate-50 border-b border-slate-200">
            <tr>
              {columns.map((column) => (
                <th
                  key={column.key}
                  className={cn(
                    "px-4 py-3 text-left text-sm font-semibold text-slate-700",
                    column.className,
                  )}
                >
                  {column.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {paginatedData.length === 0 ? (
              <tr>
                <td
                  colSpan={columns.length}
                  className="px-4 py-8 text-center text-slate-500"
                >
                  {emptyMessage}
                </td>
              </tr>
            ) : (
              paginatedData.map((item) => (
                <tr
                  key={String(item[keyField])}
                  onClick={() => onRowClick?.(item)}
                  className={cn(
                    "hover:bg-slate-50 transition-colors",
                    onRowClick && "cursor-pointer",
                  )}
                >
                  {columns.map((column) => (
                    <td
                      key={column.key}
                      className={cn(
                        "px-4 py-3 text-sm text-slate-700",
                        column.className,
                      )}
                    >
                      {column.render
                        ? column.render(item)
                        : String(item[column.key as keyof T] || "")}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between px-2">
          <span className="text-sm text-slate-500">
            Showing {(currentPage - 1) * pageSize + 1} to{" "}
            {Math.min(currentPage * pageSize, filteredData.length)} of{" "}
            {filteredData.length} results
          </span>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="p-2 rounded-lg border border-slate-200 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="text-sm text-slate-700 min-w-[80px] text-center">
              Page {currentPage} of {totalPages}
            </span>
            <button
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="p-2 rounded-lg border border-slate-200 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
