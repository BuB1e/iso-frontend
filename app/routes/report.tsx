import { useState, useMemo } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "~/components/ui/table";
import {
  FileText,
  Download,
  Search,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

// TODO: Background and text color is not same theme color
// Sample report data - expanded for pagination demo
const reportData = [
  {
    id: 1,
    name: "Full Compliance Report",
    type: "PDF",
    generatedDate: "2025-12-01",
    size: "2.4 MB",
    status: "READY",
  },
  {
    id: 2,
    name: "Gap Analysis Export",
    type: "CSV",
    generatedDate: "2025-11-28",
    size: "156 KB",
    status: "READY",
  },
  {
    id: 3,
    name: "Evidence Archive",
    type: "ZIP",
    generatedDate: "2025-11-15",
    size: "45.2 MB",
    status: "READY",
  },
  {
    id: 4,
    name: "Executive Summary",
    type: "PPTX",
    generatedDate: "2025-11-10",
    size: "5.1 MB",
    status: "ARCHIVED",
  },
  {
    id: 5,
    name: "Risk Assessment Report",
    type: "PDF",
    generatedDate: "2025-11-05",
    size: "3.8 MB",
    status: "READY",
  },
  {
    id: 6,
    name: "Audit Trail Export",
    type: "CSV",
    generatedDate: "2025-10-28",
    size: "890 KB",
    status: "READY",
  },
  {
    id: 7,
    name: "Control Implementation Status",
    type: "PDF",
    generatedDate: "2025-10-20",
    size: "1.2 MB",
    status: "ARCHIVED",
  },
  {
    id: 8,
    name: "Vendor Compliance Summary",
    type: "PDF",
    generatedDate: "2025-10-15",
    size: "2.1 MB",
    status: "READY",
  },
];

const ITEMS_PER_PAGE = 5;

// Status badge component
function StatusBadge({ status }: { status: string }) {
  const isReady = status === "READY";
  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded text-xs font-medium ${
        isReady ? "bg-green-100 text-green-700" : "bg-slate-100 text-slate-600"
      }`}
    >
      {status}
    </span>
  );
}

export default function Report() {
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  // Filter reports based on search query
  const filteredReports = useMemo(() => {
    if (!searchQuery.trim()) return reportData;
    const query = searchQuery.toLowerCase();
    return reportData.filter(
      (report) =>
        report.name.toLowerCase().includes(query) ||
        report.type.toLowerCase().includes(query) ||
        report.status.toLowerCase().includes(query)
    );
  }, [searchQuery]);

  // Pagination calculations
  const totalPages = Math.ceil(filteredReports.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const paginatedReports = filteredReports.slice(
    startIndex,
    startIndex + ITEMS_PER_PAGE
  );

  // Reset to page 1 when search changes
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
    setCurrentPage(1);
  };

  return (
    <div className="flex flex-col min-h-screen py-8 px-8 lg:px-16 bg-slate-50/50">
      {/* Header Section */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-800">Reports</h1>
        <p className="text-slate-500 text-sm mt-1">
          Generate and manage compliance documentation
        </p>
      </div>

      {/* Search Bar */}
      <div className="relative mb-6">
        <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
        <input
          type="text"
          value={searchQuery}
          onChange={handleSearchChange}
          placeholder="Search by report name or type..."
          className="w-full max-w-md pl-11 pr-4 py-2.5 border border-slate-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-sm"
        />
      </div>

      {/* Recent Reports Section */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
        <div className="px-6 py-4 border-b border-slate-100">
          <h2 className="text-lg font-semibold text-slate-800">
            Recent Reports
          </h2>
        </div>

        <Table>
          <TableHeader>
            <TableRow className="bg-slate-50/80 hover:bg-slate-50/80">
              <TableHead className="text-xs font-semibold text-slate-500 uppercase tracking-wider py-4 px-6">
                Report Name
              </TableHead>
              <TableHead className="text-xs font-semibold text-slate-500 uppercase tracking-wider py-4 px-6">
                Type
              </TableHead>
              <TableHead className="text-xs font-semibold text-slate-500 uppercase tracking-wider py-4 px-6">
                Generated Date
              </TableHead>
              <TableHead className="text-xs font-semibold text-slate-500 uppercase tracking-wider py-4 px-6">
                Size
              </TableHead>
              <TableHead className="text-xs font-semibold text-slate-500 uppercase tracking-wider py-4 px-6">
                Status
              </TableHead>
              <TableHead className="text-xs font-semibold text-slate-500 uppercase tracking-wider py-4 px-6 text-right">
                {/* Actions column */}
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody className="min-h-[340px]">
            {paginatedReports.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={6}
                  className="h-[340px] text-center text-slate-500"
                >
                  No reports found matching your search.
                </TableCell>
              </TableRow>
            ) : (
              <>
                {paginatedReports.map((report) => (
                  <TableRow
                    key={report.id}
                    className="hover:bg-slate-50/50 border-b border-slate-100 h-[68px]"
                  >
                    {/* Report Name with icon */}
                    <TableCell className="py-4 px-6">
                      <div className="flex items-center gap-3 max-w-[250px]">
                        <FileText className="w-5 h-5 text-slate-400 flex-shrink-0" />
                        <span
                          className="font-medium text-slate-800 text-sm truncate"
                          title={report.name}
                        >
                          {report.name}
                        </span>
                      </div>
                    </TableCell>

                    {/* Type */}
                    <TableCell className="py-4 px-6 text-sm text-slate-600">
                      {report.type}
                    </TableCell>

                    {/* Generated Date */}
                    <TableCell className="py-4 px-6 text-sm text-slate-600">
                      {report.generatedDate}
                    </TableCell>

                    {/* Size */}
                    <TableCell className="py-4 px-6 text-sm text-slate-600">
                      {report.size}
                    </TableCell>

                    {/* Status */}
                    <TableCell className="py-4 px-6">
                      <StatusBadge status={report.status} />
                    </TableCell>

                    {/* Actions */}
                    <TableCell className="py-4 px-6">
                      <div className="flex items-center justify-end gap-3">
                        <button className="text-blue-600 hover:text-blue-700 text-sm font-medium transition-colors">
                          View
                        </button>
                        <button className="p-2 hover:bg-slate-100 rounded-lg transition-colors text-slate-400 hover:text-slate-600">
                          <Download className="w-4 h-4" />
                        </button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
                {/* Empty rows to maintain consistent table height */}
                {Array.from({
                  length: ITEMS_PER_PAGE - paginatedReports.length,
                }).map((_, i) => (
                  <TableRow
                    key={`empty-${i}`}
                    className="h-[68px] border-b border-slate-100"
                  >
                    <TableCell colSpan={6}>&nbsp;</TableCell>
                  </TableRow>
                ))}
              </>
            )}
          </TableBody>
        </Table>

        {/* Pagination - Always visible for consistent layout */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-slate-100">
          <p className="text-sm text-slate-500">
            Showing {startIndex + 1} to{" "}
            {Math.min(startIndex + ITEMS_PER_PAGE, filteredReports.length)} of{" "}
            {filteredReports.length} results
          </p>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="p-2 rounded-lg border border-slate-200 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronLeft className="w-4 h-4 text-slate-600" />
            </button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
              <button
                key={page}
                onClick={() => setCurrentPage(page)}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                  currentPage === page
                    ? "bg-blue-600 text-white"
                    : "hover:bg-slate-50 text-slate-600"
                }`}
              >
                {page}
              </button>
            ))}
            <button
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="p-2 rounded-lg border border-slate-200 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronRight className="w-4 h-4 text-slate-600" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
