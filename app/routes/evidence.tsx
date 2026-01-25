import { useState, useMemo, useRef } from "react";
import {
  useLoaderData,
  useActionData,
  Form,
  useNavigation,
  useRevalidator,
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
  Eye,
  X,
  FileImage,
  Loader2,
} from "lucide-react";
import {
  EvidenceService,
  ControlService,
  AssessmentControlService,
  IsoAssessmentService,
} from "~/services";
import type { EvidenceResponseDto } from "~/dto";
import { useUserStore } from "~/stores/userStore";
import { useAdminStore } from "~/stores/adminStore";
import { useYearStore } from "~/stores/yearStore";
import { UserRole } from "~/types";
import { uploadToSupabase, deleteFromSupabase } from "~/lib/supabase";

// Extended interface
interface Evidence extends EvidenceResponseDto {
  [key: string]: unknown;
}

const ITEMS_PER_PAGE = 5;

// Loader - fetch evidence and relations
export async function loader() {
  const [evidences, controls, assessmentControls, isoAssessments] =
    await Promise.all([
      EvidenceService.getAllEvidence(),
      ControlService.getAllControl(),
      AssessmentControlService.getAllAssessmentControl(),
      IsoAssessmentService.getAllIsoAssessment(),
    ]);
  return {
    evidences: evidences as Evidence[],
    controls,
    assessmentControls,
    isoAssessments,
  };
}

// Action - handle delete
export async function action({ request }: ActionFunctionArgs) {
  const formData = await request.formData();
  const intent = formData.get("intent") as string;

  if (intent === "delete") {
    const id = Number(formData.get("id"));
    const filePath = formData.get("filePath") as string;

    // 1. Delete from Supabase storage (if it's a Supabase URL)
    if (filePath && filePath.includes("supabase.co")) {
      await deleteFromSupabase(filePath, "evidence");
    }

    // 2. Delete from backend database
    const result = await EvidenceService.deleteEvidenceById(id);
    return { success: result, intent };
  }

  return { success: false };
}

// Helper to check if file is previewable
function isPreviewable(filename: string): boolean {
  const ext = filename.split(".").pop()?.toLowerCase();
  return ["jpg", "jpeg", "png", "gif", "webp", "pdf"].includes(ext || "");
}

function isImageFile(filename: string): boolean {
  const ext = filename.split(".").pop()?.toLowerCase();
  return ["jpg", "jpeg", "png", "gif", "webp", "svg"].includes(ext || "");
}

// File icon component
function FileIcon({ filename }: { filename: string }) {
  const ext = filename.split(".").pop()?.toLowerCase();
  if (ext === "xlsx" || ext === "xls") {
    return <FileSpreadsheet className="w-5 h-5 text-green-600" />;
  }
  if (["jpg", "jpeg", "png", "gif", "webp", "svg"].includes(ext || "")) {
    return <FileImage className="w-5 h-5 text-purple-500" />;
  }
  if (ext === "pdf") {
    return <FileText className="w-5 h-5 text-red-500" />;
  }
  return <FileText className="w-5 h-5 text-slate-500" />;
}

export default function Evidence() {
  const { evidences, controls, assessmentControls, isoAssessments } =
    useLoaderData<typeof loader>();
  const actionData = useActionData<typeof action>();
  const navigation = useNavigation();
  const isDeleting = navigation.state === "submitting";

  const { currentYear } = useYearStore();
  const currentUser = useUserStore((state) => state.currentUser);
  const { selectedCompanyId } = useAdminStore();

  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [previewEvidence, setPreviewEvidence] = useState<Evidence | null>(null);

  // Upload modal state
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [uploadControlId, setUploadControlId] = useState<number | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const revalidator = useRevalidator();

  // Handle file upload to Supabase then save to backend
  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !uploadControlId) return;

    setIsUploading(true);
    setUploadError(null);

    try {
      // Rename file to include controlId
      const parts = file.name.split(".");
      const ext = parts.length > 1 ? `.${parts.pop()}` : "";
      const baseName = parts.join(".");
      const newFileName = `${baseName}_${uploadControlId}${ext}`;
      const renamedFile = new File([file], newFileName, { type: file.type });

      // 1. Upload to Supabase
      const result = await uploadToSupabase(renamedFile, "evidence");
      if (!result) {
        throw new Error("Failed to upload file to storage");
      }

      // 2. Save metadata to backend
      const evidence = await EvidenceService.createEvidence({
        fileName: newFileName,
        filePath: result.url,
        controlId: uploadControlId,
      });

      if (!evidence) {
        throw new Error("Failed to save evidence metadata");
      }

      // 3. Close modal and refresh data
      setIsUploadModalOpen(false);
      setUploadControlId(null);
      revalidator.revalidate();
    } catch (err) {
      console.error("Upload error:", err);
      setUploadError(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  // 1. Filter Evidence by Admin Context / User Company
  const scopedEvidence = useMemo(() => {
    // Determine effective company filter
    const targetCompanyId =
      currentUser?.role === UserRole.ADMIN
        ? selectedCompanyId
        : currentUser?.companyId;

    // Admin Global View: Show all (or filter by nothing)
    // But conceptually simpler to just show all if no target
    if (currentUser?.role === UserRole.ADMIN && !targetCompanyId) {
      // Show ALL evidence across ALL companies?
      // Yes, Global Admin View
      return evidences;
    }

    if (!targetCompanyId) return []; // Unassigned user sees nothing

    // Build allowed chain
    // 1. Assessments for company & year (optional year filter? User asked "Assessment... Summary, Evidence (has company filter)")
    // Assuming Year Filter applies too for consistency with other pages
    const activeAssessments = isoAssessments.filter(
      (a) => a.companyId === targetCompanyId && a.year === currentYear,
    );
    const activeAssessmentIds = activeAssessments.map((a) => a.id);

    // 2. Assessment Controls
    const activeAssessmentControls = assessmentControls.filter((ac) =>
      activeAssessmentIds.includes(ac.isoAssessmentId),
    );
    const activeAssessmentControlIds = activeAssessmentControls.map(
      (ac) => ac.id,
    );

    // 3. Controls
    const activeControlIds = controls
      .filter((c) => activeAssessmentControlIds.includes(c.assessmentControlId))
      .map((c) => c.id);

    // 4. Evidence
    return evidences.filter((e) => activeControlIds.includes(e.controlId));
  }, [
    evidences,
    controls,
    assessmentControls,
    isoAssessments,
    currentUser,
    selectedCompanyId,
    currentYear, // Added year dependence
  ]);

  // Filter controls for upload dropdown (same logic as scopedEvidence)
  const scopedControls = useMemo(() => {
    const targetCompanyId =
      currentUser?.role === UserRole.ADMIN
        ? selectedCompanyId
        : currentUser?.companyId;

    // Admin Global View: Show all
    if (currentUser?.role === UserRole.ADMIN && !targetCompanyId) {
      return controls;
    }

    if (!targetCompanyId) return [];

    // Filter by company & year
    const activeAssessments = isoAssessments.filter(
      (a) => a.companyId === targetCompanyId && a.year === currentYear,
    );
    const activeAssessmentIds = activeAssessments.map((a) => a.id);

    const activeAssessmentControls = assessmentControls.filter((ac) =>
      activeAssessmentIds.includes(ac.isoAssessmentId),
    );
    const activeAssessmentControlIds = activeAssessmentControls.map(
      (ac) => ac.id,
    );

    return controls.filter((c) =>
      activeAssessmentControlIds.includes(c.assessmentControlId),
    );
  }, [
    controls,
    assessmentControls,
    isoAssessments,
    currentUser,
    selectedCompanyId,
    currentYear,
  ]);

  // 2. Apply Search Filter
  const filteredEvidence = useMemo(() => {
    if (!searchQuery.trim()) return scopedEvidence;
    const query = searchQuery.toLowerCase();
    return scopedEvidence.filter((evidence) =>
      evidence.fileName.toLowerCase().includes(query),
    );
  }, [searchQuery, scopedEvidence]);

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
        <button
          onClick={() => setIsUploadModalOpen(true)}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 rounded-lg font-medium transition-colors shadow-sm"
        >
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
                    <div className="flex items-center justify-end gap-1">
                      {/* Preview button - only for images and PDFs */}
                      {isPreviewable(evidence.fileName) && (
                        <button
                          onClick={() => setPreviewEvidence(evidence)}
                          className="p-2 hover:bg-purple-50 rounded-lg text-slate-400 hover:text-purple-600 transition-colors"
                          title="Preview"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                      )}
                      <a
                        href={evidence.filePath}
                        download={evidence.fileName}
                        className="p-2 hover:bg-blue-50 rounded-lg text-slate-400 hover:text-blue-600 transition-colors"
                        title="Download"
                      >
                        <Download className="w-4 h-4" />
                      </a>
                      <Form method="post">
                        <input type="hidden" name="intent" value="delete" />
                        <input type="hidden" name="id" value={evidence.id} />
                        <input
                          type="hidden"
                          name="filePath"
                          value={evidence.filePath}
                        />
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

      {/* Preview Modal */}
      {previewEvidence && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
          onClick={() => setPreviewEvidence(null)}
        >
          <div
            className="relative bg-white rounded-2xl shadow-2xl max-w-4xl max-h-[90vh] w-full mx-4 overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200">
              <div className="flex items-center gap-3">
                <FileIcon filename={previewEvidence.fileName} />
                <div>
                  <h3 className="font-semibold text-slate-800">
                    {previewEvidence.fileName}
                  </h3>
                  <p className="text-xs text-slate-500">
                    Uploaded{" "}
                    {new Date(previewEvidence.createdAt).toLocaleDateString()}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <a
                  href={previewEvidence.filePath}
                  download={previewEvidence.fileName}
                  className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                >
                  <Download className="w-4 h-4" />
                  Download
                </a>
                <button
                  onClick={() => setPreviewEvidence(null)}
                  className="p-2 hover:bg-slate-100 rounded-lg text-slate-400 hover:text-slate-600 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Modal Content */}
            <div className="p-6 max-h-[calc(90vh-80px)] overflow-auto flex items-center justify-center bg-slate-50">
              {isImageFile(previewEvidence.fileName) ? (
                <img
                  src={previewEvidence.filePath}
                  alt={previewEvidence.fileName}
                  className="max-w-full max-h-[70vh] object-contain rounded-lg shadow-sm"
                />
              ) : (
                <iframe
                  src={previewEvidence.filePath}
                  title={previewEvidence.fileName}
                  className="w-full h-[70vh] rounded-lg border border-slate-200"
                />
              )}
            </div>
          </div>
        </div>
      )}

      {/* Upload Modal */}
      {isUploadModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
          onClick={() => {
            if (!isUploading) {
              setIsUploadModalOpen(false);
              setUploadControlId(null);
              setUploadError(null);
            }
          }}
        >
          <div
            className="relative bg-white rounded-2xl shadow-2xl max-w-lg w-full mx-4 p-6"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-lg font-semibold text-slate-800">
                  Upload Evidence
                </h3>
                <p className="text-sm text-slate-500 mt-0.5">
                  Upload a file and link it to a control
                </p>
              </div>
              <button
                onClick={() => {
                  if (!isUploading) {
                    setIsUploadModalOpen(false);
                    setUploadControlId(null);
                    setUploadError(null);
                  }
                }}
                disabled={isUploading}
                className="p-2 hover:bg-slate-100 rounded-lg text-slate-400 hover:text-slate-600 transition-colors disabled:opacity-50"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Control Selector */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Select Control
              </label>
              <select
                value={uploadControlId || ""}
                onChange={(e) =>
                  setUploadControlId(Number(e.target.value) || null)
                }
                disabled={isUploading}
                className="w-full px-4 py-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-sm disabled:opacity-50"
              >
                <option value="">Choose a control...</option>
                {scopedControls
                  .sort((a, b) =>
                    a.code.localeCompare(b.code, undefined, { numeric: true }),
                  )
                  .map((control) => (
                    <option key={control.id} value={control.id}>
                      [{control.id}] {control.code} - {control.name}
                    </option>
                  ))}
              </select>
            </div>

            {/* File Input */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Select File
              </label>
              <div className="relative">
                <input
                  ref={fileInputRef}
                  type="file"
                  onChange={handleUpload}
                  disabled={!uploadControlId || isUploading}
                  accept=".pdf,.doc,.docx,.xls,.xlsx,.png,.jpg,.jpeg,.gif,.webp"
                  className="w-full px-4 py-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-sm disabled:opacity-50 file:mr-4 file:py-1 file:px-3 file:rounded file:border-0 file:text-sm file:font-medium file:bg-blue-50 file:text-blue-600 hover:file:bg-blue-100"
                />
              </div>
              {!uploadControlId && (
                <p className="text-xs text-amber-600 mt-1">
                  Please select a control first
                </p>
              )}
            </div>

            {/* Upload Progress */}
            {isUploading && (
              <div className="flex items-center gap-3 p-4 bg-blue-50 rounded-lg">
                <Loader2 className="w-5 h-5 text-blue-600 animate-spin" />
                <span className="text-sm text-blue-700">Uploading...</span>
              </div>
            )}

            {/* Error Message */}
            {uploadError && (
              <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-sm text-red-600">{uploadError}</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
