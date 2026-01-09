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
  Search,
  Upload,
  FileText,
  FileSpreadsheet,
  Download,
  Trash2,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

// Sample evidence data - expanded for pagination demo
const evidenceData = [
  {
    id: 1,
    filename: "InfoSec_Policy_v2.pdf",
    fileType: "PDF",
    controlId: "A.5.1",
    controlTitle: "Policies for information security",
    size: "2.4 MB",
    dateUploaded: "11/20/2025",
  },
  {
    id: 2,
    filename: "Employee_Signoff_Records.xlsx",
    fileType: "Excel",
    controlId: "A.5.1",
    controlTitle: "Policies for information security",
    size: "1.1 MB",
    dateUploaded: "11/22/2025",
  },
  {
    id: 3,
    filename: "Background_Check_Policy.pdf",
    fileType: "PDF",
    controlId: "A.6.1",
    controlTitle: "Screening",
    size: "1.2 MB",
    dateUploaded: "10/15/2025",
  },
  {
    id: 4,
    filename: "Access_Control_Matrix.xlsx",
    fileType: "Excel",
    controlId: "A.9.1",
    controlTitle: "Access control policy",
    size: "0.8 MB",
    dateUploaded: "10/10/2025",
  },
  {
    id: 5,
    filename: "Incident_Response_Plan.pdf",
    fileType: "PDF",
    controlId: "A.16.1",
    controlTitle: "Incident management",
    size: "3.2 MB",
    dateUploaded: "09/28/2025",
  },
  {
    id: 6,
    filename: "Risk_Assessment_2025.pdf",
    fileType: "PDF",
    controlId: "A.8.2",
    controlTitle: "Risk assessment",
    size: "5.1 MB",
    dateUploaded: "09/15/2025",
  },
  {
    id: 7,
    filename: "Training_Records_Q3.xlsx",
    fileType: "Excel",
    controlId: "A.7.2",
    controlTitle: "Information security awareness",
    size: "2.0 MB",
    dateUploaded: "09/01/2025",
  },
  {
    id: 8,
    filename: "Vendor_Security_Assessment.pdf",
    fileType: "PDF",
    controlId: "A.15.1",
    controlTitle: "Supplier relationships",
    size: "1.8 MB",
    dateUploaded: "08/20/2025",
  },
];

const ITEMS_PER_PAGE = 5;

// TODO: Background and text color is not same theme color
// File icon component
function FileIcon({ type }: { type: string }) {
  if (type === "Excel") {
    return <FileSpreadsheet className="w-5 h-5 text-green-600" />;
  }
  return <FileText className="w-5 h-5 text-red-500" />;
}

export default function Evidence() {
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  // Filter evidence based on search query
  const filteredEvidence = useMemo(() => {
    if (!searchQuery.trim()) return evidenceData;
    const query = searchQuery.toLowerCase();
    return evidenceData.filter(
      (evidence) =>
        evidence.filename.toLowerCase().includes(query) ||
        evidence.controlId.toLowerCase().includes(query) ||
        evidence.controlTitle.toLowerCase().includes(query)
    );
  }, [searchQuery]);

  // Pagination calculations
  const totalPages = Math.ceil(filteredEvidence.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const paginatedEvidence = filteredEvidence.slice(
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
      <div className="flex justify-between items-start mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">
            Evidence Library
          </h1>
          <p className="text-slate-500 text-sm mt-1">
            Central repository for all compliance evidence
          </p>
        </div>
		{/* TODO: make this button actually work */}
        <button className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 rounded-lg font-medium transition-colors shadow-sm">
          <Upload className="w-4 h-4" />
          Upload New Evidence
        </button>
      </div>

      {/* Search Bar */}
      <div className="relative mb-6">
        <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
        <input
          type="text"
          value={searchQuery}
          onChange={handleSearchChange}
          placeholder="Search by filename or control code..."
          className="w-full max-w-md pl-11 pr-4 py-2.5 border border-slate-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-sm"
        />
      </div>

      {/* Evidence Table */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
        <Table>
          <TableHeader>
            <TableRow className="bg-slate-50/80 hover:bg-slate-50/80">
              <TableHead className="text-xs font-semibold text-slate-500 uppercase tracking-wider py-4 px-6">
                Filename
              </TableHead>
              <TableHead className="text-xs font-semibold text-slate-500 uppercase tracking-wider py-4 px-6">
                Related Control
              </TableHead>
              <TableHead className="text-xs font-semibold text-slate-500 uppercase tracking-wider py-4 px-6">
                Size
              </TableHead>
              <TableHead className="text-xs font-semibold text-slate-500 uppercase tracking-wider py-4 px-6">
                Date Uploaded
              </TableHead>
              <TableHead className="text-xs font-semibold text-slate-500 uppercase tracking-wider py-4 px-6 text-right">
                {/* Actions column - no header text */}
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody className="min-h-[340px]">
            {paginatedEvidence.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={5}
                  className="h-[340px] text-center text-slate-500"
                >
                  No evidence found matching your search.
                </TableCell>
              </TableRow>
            ) : (
              <>
                {paginatedEvidence.map((evidence) => (
                  <TableRow
                    key={evidence.id}
                    className="hover:bg-slate-50/50 border-b border-slate-100 h-[68px]"
                  >
                    {/* Filename with icon */}
                    <TableCell className="py-4 px-6">
                      <div className="flex items-center gap-3 max-w-[250px]">
                        <FileIcon type={evidence.fileType} />
                        <div className="min-w-0 flex-1">
                          <p
                            className="font-medium text-slate-800 text-sm truncate"
                            title={evidence.filename}
                          >
                            {evidence.filename}
                          </p>
                          <p className="text-xs text-slate-400">
                            {evidence.fileType}
                          </p>
                        </div>
                      </div>
                    </TableCell>

                    {/* Related Control */}
                    <TableCell className="py-4 px-6">
                      <div className="flex items-center gap-3">
                        <span className="inline-flex items-center px-2 py-1 rounded text-xs font-mono bg-slate-100 text-slate-600 border border-slate-200">
                          {evidence.controlId}
                        </span>
                        <span
                          className="text-sm text-slate-600 truncate max-w-[180px]"
                          title={evidence.controlTitle}
                        >
                          {evidence.controlTitle}
                        </span>
                      </div>
                    </TableCell>

                    {/* Size */}
                    <TableCell className="py-4 px-6 text-sm text-slate-600">
                      {evidence.size}
                    </TableCell>

                    {/* Date Uploaded */}
                    <TableCell className="py-4 px-6 text-sm text-slate-600">
                      {evidence.dateUploaded}
                    </TableCell>

                    {/* Actions */}
                    <TableCell className="py-4 px-6">
                      <div className="flex items-center justify-end gap-2">
                        <button className="p-2 hover:bg-slate-100 rounded-lg transition-colors text-slate-400 hover:text-slate-600">
                          <Download className="w-4 h-4" />
                        </button>
                        <button className="p-2 hover:bg-red-50 rounded-lg transition-colors text-slate-400 hover:text-red-500">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
                {/* Empty rows to maintain consistent table height */}
                {Array.from({
                  length: ITEMS_PER_PAGE - paginatedEvidence.length,
                }).map((_, i) => (
                  <TableRow
                    key={`empty-${i}`}
                    className="h-[68px] border-b border-slate-100"
                  >
                    <TableCell colSpan={5}>&nbsp;</TableCell>
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
            {Math.min(startIndex + ITEMS_PER_PAGE, filteredEvidence.length)} of{" "}
            {filteredEvidence.length} results
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
