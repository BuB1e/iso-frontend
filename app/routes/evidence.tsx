import { useState, useMemo } from "react";
import {
  useLoaderData,
  useActionData,
  Form,
  useNavigation,
} from "react-router";
import type { ActionFunctionArgs } from "react-router";
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
import { EvidenceService } from "~/services/EvidenceService";
import type { EvidenceResponseDto } from "~/dto";

// Extended interface
interface Evidence extends EvidenceResponseDto {
  [key: string]: unknown;
}

const ITEMS_PER_PAGE = 5;

// Loader - fetch evidence from API
export async function loader() {
  const evidences = await EvidenceService.getAllEvidence();
  return { evidences: evidences as Evidence[] };
}

// Action - handle delete
export async function action({ request }: ActionFunctionArgs) {
  const formData = await request.formData();
  const intent = formData.get("intent") as string;

  if (intent === "delete") {
    const id = Number(formData.get("id"));
    const result = await EvidenceService.deleteEvidenceById(id);
    return { success: result, intent };
  }

  return { success: false };
}

// File icon component
function FileIcon({ filename }: { filename: string }) {
  const ext = filename.split(".").pop()?.toLowerCase();
  if (ext === "xlsx" || ext === "xls") {
    return <FileSpreadsheet className="w-5 h-5 text-green-600" />;
  }
  return <FileText className="w-5 h-5 text-red-500" />;
}

export default function Evidence() {
  const { evidences } = useLoaderData<typeof loader>();
  const actionData = useActionData<typeof action>();
  const navigation = useNavigation();
  const isDeleting = navigation.state === "submitting";

  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  // Filter evidence based on search query
  const filteredEvidence = useMemo(() => {
    if (!searchQuery.trim()) return evidences;
    const query = searchQuery.toLowerCase();
    return evidences.filter((evidence) =>
      evidence.fileName.toLowerCase().includes(query),
    );
  }, [searchQuery, evidences]);

  // Pagination calculations
  const totalPages = Math.ceil(filteredEvidence.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const paginatedEvidence = filteredEvidence.slice(
    startIndex,
    startIndex + ITEMS_PER_PAGE,
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
          placeholder="Search by filename..."
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
                Control ID
              </TableHead>
              <TableHead className="text-xs font-semibold text-slate-500 uppercase tracking-wider py-4 px-6">
                Date Uploaded
              </TableHead>
              <TableHead className="text-xs font-semibold text-slate-500 uppercase tracking-wider py-4 px-6 text-right">
                Actions
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody className="min-h-[340px]">
            {paginatedEvidence.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={4}
                  className="h-[340px] text-center text-slate-500"
                >
                  {evidences.length === 0
                    ? "No evidence uploaded yet."
                    : "No evidence found matching your search."}
                </TableCell>
              </TableRow>
            ) : (
              paginatedEvidence.map((evidence) => (
                <TableRow
                  key={evidence.id}
                  className="hover:bg-slate-50/50 transition-colors"
                >
                  <TableCell className="py-4 px-6">
                    <div className="flex items-center gap-3">
                      <FileIcon filename={evidence.fileName} />
                      <div>
                        <p className="font-medium text-slate-800">
                          {evidence.fileName}
                        </p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="py-4 px-6">
                    <span className="text-sm text-slate-500">
                      Control #{evidence.controlId}
                    </span>
                  </TableCell>
                  <TableCell className="py-4 px-6">
                    <span className="text-sm text-slate-500">
                      {new Date(evidence.createdAt).toLocaleDateString()}
                    </span>
                  </TableCell>
                  <TableCell className="py-4 px-6">
                    <div className="flex items-center justify-end gap-2">
                      <a
                        href={evidence.filePath}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-2 hover:bg-slate-100 rounded-lg text-slate-400 hover:text-slate-600 transition-colors"
                        title="Download"
                      >
                        <Download className="w-4 h-4" />
                      </a>
                      <Form method="post">
                        <input type="hidden" name="intent" value="delete" />
                        <input type="hidden" name="id" value={evidence.id} />
                        <button
                          type="submit"
                          disabled={isDeleting}
                          className="p-2 hover:bg-red-50 rounded-lg text-slate-400 hover:text-red-500 transition-colors disabled:opacity-50"
                          title="Delete"
                          onClick={(e) => {
                            if (!confirm("Delete this evidence?"))
                              e.preventDefault();
                          }}
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </Form>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-6 py-4 border-t border-slate-200 bg-slate-50/50">
            <p className="text-sm text-slate-500">
              Showing {startIndex + 1} to{" "}
              {Math.min(startIndex + ITEMS_PER_PAGE, filteredEvidence.length)}{" "}
              of {filteredEvidence.length} results
            </p>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="p-2 rounded-lg border border-slate-200 hover:bg-slate-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <span className="text-sm text-slate-600 min-w-[100px] text-center">
                Page {currentPage} of {totalPages}
              </span>
              <button
                onClick={() =>
                  setCurrentPage((p) => Math.min(totalPages, p + 1))
                }
                disabled={currentPage === totalPages}
                className="p-2 rounded-lg border border-slate-200 hover:bg-slate-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
