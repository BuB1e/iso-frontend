import { useState, useEffect, useRef } from "react";
import {
  useLoaderData,
  useActionData,
  useSubmit,
  useNavigation,
  useFetcher,
  Form,
  Link,
  useParams,
} from "react-router";
import type { LoaderFunctionArgs, ActionFunctionArgs } from "react-router";
import {
  ArrowLeft,
  Save,
  Upload,
  ExternalLink,
  FileText,
  FileSpreadsheet,
  Download,
  Trash2,
  Sparkles,
  AlertTriangle,
  CheckCircle2,
  Clock,
  CheckCircle,
  XCircle,
  ChevronRight,
  Loader2,
  Copy,
  Check,
} from "lucide-react";
import Markdown from "react-markdown";

import { PageHeader } from "~/components/ui/pageHeader";
import { StatusBadge } from "~/components/ui/statusBadge";
import {
  ControlStatus,
  ControlsType,
  controlStatusConfig,
  controlsTypeColorMap,
  controlsTypeDomainMap,
  UserRole,
} from "~/types";
import {
  useUserStore,
  useCanEditImplementation,
  useCanSubmitReview,
} from "~/stores/userStore";
import { useAdminStore } from "~/stores/adminStore";
import { useYearStore } from "~/stores/yearStore";
import {
  ControlService,
  EvidenceService,
  SuggestionService,
  AssessmentControlService,
  IsoAssessmentService,
} from "~/services";
import { uploadToSupabase } from "~/lib/supabase";
import type {
  EvidenceResponseDto,
  SuggestionResponseDto,
  LlmSuggestRequest,
} from "~/dto";

// Enums
enum Tab {
  Implementation = "Implementation",
  Evidence = "Evidence",
  AIAnalysis = "AI Analysis",
  Review = "Review",
}

enum ReviewStatus {
  WAITING = "WAITING",
  APPROVED = "APPROVED",
  NOT_PASS = "NOT_PASS",
}

// Interfaces
interface AIAnalysis {
  maturityScore: number;
  maxScore: number;
  gaps: string[];
  recommendedActions: string[];
}

// Helper
function simpleDate(dateStr: string | Date | undefined) {
  if (!dateStr) return "";
  return new Date(dateStr).toLocaleDateString();
}

// Loader
export async function loader({ params }: LoaderFunctionArgs) {
  const { controlNumber } = params;

  // Fetch all necessary data to handle year filtering client-side
  const [allControls, allEvidence, assessmentControls, isoAssessments] =
    await Promise.all([
      ControlService.getAllControl(),
      EvidenceService.getAllEvidence(),
      AssessmentControlService.getAllAssessmentControl(),
      IsoAssessmentService.getAllIsoAssessment(),
    ]);

  // Candidates: all controls matching this code (e.g. A.5.1 for 2025, 2026)
  const candidates = allControls.filter((c) => c.code === controlNumber);

  if (candidates.length === 0) {
    throw new Response("Control Not Found", { status: 404 });
  }

  // Domain controls: fetch all controls in this domain prefix (e.g. A.5) to calculate stats client-side
  // We use the first candidate to determine prefix
  const prefix = candidates[0].code.split(".").slice(0, 2).join(".");
  const domainControls = allControls.filter((c) => c.code.startsWith(prefix));

  // Fetch suggestions for candidates
  const suggestions = await Promise.all(
    candidates.map(async (c) => ({
      controlId: c.id,
      suggestion: await SuggestionService.getSuggestionByControlId(c.id),
    })),
  );

  return {
    candidates,
    domainControls,
    allEvidence,
    assessmentControls,
    isoAssessments,
    suggestions,
  };
}

// Action
export async function action({ request }: ActionFunctionArgs) {
  const formData = await request.formData();
  const intent = formData.get("intent") as string;
  const controlId = Number(formData.get("controlId"));

  if (intent === "save") {
    const status = formData.get("status") as ControlStatus;
    const currentPractice = formData.get("currentPractice") as string;
    const evidenceDescription = formData.get("evidenceDescription") as string;
    const context = formData.get("context") as string;

    const result = await ControlService.updateControlById({
      id: controlId,
      status,
      currentPractice,
      evidenceDescription,
      userContext: context,
    });
    return {
      success: !!result,
      intent,
      message: "Control updated successfully",
    };
  }

  if (intent === "analyze") {
    const status = formData.get("status") as ControlStatus;
    const currentPractice = formData.get("currentPractice") as string;
    const evidenceDescription = formData.get("evidenceDescription") as string;
    const context = formData.get("context") as string;

    // 1. Save Changes
    await ControlService.updateControlById({
      id: controlId,
      status,
      currentPractice,
      evidenceDescription,
      userContext: context, // Ensure field name matches DTO
    });

    // 2. Trigger Analysis using ID (Backend reads updated data)
    const result = await ControlService.suggestControlById(controlId);

    if (!result) {
      return {
        success: false,
        intent,
        message: "Analysis failed. Check server logs.",
      };
    }

    return {
      success: true,
      intent,
      message: "Analysis generated",
      suggestion: result,
    };
  }

  if (intent === "upload") {
    // Simulating upload since we don't have binary upload endpoint
    // Create query param or body
    const fileName =
      (formData.get("file") as File)?.name || "uploaded_evidence.pdf";
    // Mock path
    const filePath = "/uploads/" + fileName;

    // Create record
    const result = await EvidenceService.createEvidence({
      controlId,
      fileName,
      filePath,
    });
    return { success: !!result, intent, message: "Evidence uploaded" };
  }

  if (intent === "delete-evidence") {
    const evidenceId = Number(formData.get("evidenceId"));
    const result = await EvidenceService.deleteEvidenceById(evidenceId);
    return { success: result, intent, message: "Evidence deleted" };
  }

  return { success: false };
}

export default function DomainControl() {
  const {
    candidates,
    domainControls,
    allEvidence,
    assessmentControls,
    isoAssessments,
    suggestions,
  } = useLoaderData<typeof loader>();
  const actionData = useActionData<typeof action>();
  const submit = useSubmit();
  const navigation = useNavigation();
  const isSubmitting = navigation.state === "submitting";
  const suggestionFetcher = useFetcher<{
    suggestion: SuggestionResponseDto | null;
  }>();

  const { currentYear } = useYearStore();
  const params = useParams();
  const currentUser = useUserStore((state) => state.currentUser);
  const canEdit = useCanEditImplementation();
  const canReview = useCanSubmitReview();

  // Helper to map status to badge variant
  const getStatusVariant = (s: ControlStatus) => {
    switch (s) {
      case ControlStatus.IMPLEMENTED:
        return "success";
      case ControlStatus.PARTIALLY:
        return "warning";
      case ControlStatus.NOT_IMPLEMENTED:
        return "error";
      default:
        return "default";
    }
  };

  // Determine effective company filter
  const { selectedCompanyId } = useAdminStore();
  const targetCompanyId =
    currentUser?.role === UserRole.ADMIN
      ? selectedCompanyId
      : currentUser?.companyId;

  // Determine active control based on current year AND user's company
  const activeAssessments = isoAssessments.filter((a) => {
    if (a.year !== currentYear) return false;

    // If no target company (Global Admin View), show all
    if (!targetCompanyId) return true;

    // Otherwise, filter by specific company
    return a.companyId === targetCompanyId;
  });
  const activeAssessmentIds = activeAssessments.map((a) => a.id);
  const activeAssessmentControls = assessmentControls.filter((ac) =>
    activeAssessmentIds.includes(ac.isoAssessmentId),
  );
  const activeAssessmentControlIds = activeAssessmentControls.map(
    (ac) => ac.id,
  );

  // Find the candidate that belongs to the active assessment controls
  // Fallback to first candidate if not found (e.g. year filter mismatch or data hole)
  const control =
    candidates.find((c) =>
      activeAssessmentControlIds.includes(c.assessmentControlId),
    ) || candidates[0];

  // Calculate stats for CURRENT YEAR controls
  // Filter domainControls by current year context
  const currentYearDomainControls = domainControls.filter((c) =>
    activeAssessmentControlIds.includes(c.assessmentControlId),
  );

  const stats = {
    total: currentYearDomainControls.length,
    implemented: currentYearDomainControls.filter(
      (c) => c.status === ControlStatus.IMPLEMENTED,
    ).length,
    percentage: 0,
  };
  stats.percentage =
    stats.total > 0 ? Math.round((stats.implemented / stats.total) * 100) : 0;

  // Link related data to the active control
  const evidences = allEvidence.filter((e) => e.controlId === control.id);
  const suggestionEntry = suggestions.find((s) => s.controlId === control.id);
  const suggestion = suggestionEntry?.suggestion || null;

  // Determine effective suggestion (Action > Fetcher > Loader)
  // Check if actionData has suggestion AND it matches current control (to avoid stale data from prev action if we didn't nav away? unlikely but safe)
  const actionSuggestion = (actionData as any)?.suggestion;
  const activeSuggestion =
    (actionSuggestion && actionSuggestion.controlId === control.id
      ? actionSuggestion
      : null) ||
    suggestionFetcher.data?.suggestion ||
    suggestion;

  // Parse AI Analysis
  let aiAnalysis: AIAnalysis | null = null;
  let rawAnalysis: string | null = null;

  if (activeSuggestion && activeSuggestion.content) {
    try {
      aiAnalysis = JSON.parse(activeSuggestion.content);
    } catch (e) {
      rawAnalysis = activeSuggestion.content;
    }
  }

  const [activeTab, setActiveTab] = useState<Tab>(Tab.Implementation);
  const [isDirty, setIsDirty] = useState(false);

  // Fetch suggestion when AI Analysis tab is opened
  useEffect(() => {
    if (
      activeTab === Tab.AIAnalysis &&
      suggestionFetcher.state === "idle" &&
      !suggestionFetcher.data &&
      control?.id
    ) {
      suggestionFetcher.load(`/api/suggestion/${control.id}`);
    }
  }, [activeTab, control.id, suggestionFetcher]);

  // Local state for form fields to support "dirty" check
  const [status, setStatus] = useState(control.status);
  const [currentPractice, setCurrentPractice] = useState(
    control.currentPractice || "",
  );
  const [evidenceDescription, setEvidenceDescription] = useState(
    control.evidenceDescription || "",
  );
  const [context, setContext] = useState(control.userContext || "");

  // Review state (local only, not persisted to backend)
  const [reviewStatus, setReviewStatus] = useState<ReviewStatus>(
    ReviewStatus.WAITING,
  );
  const [reviewerComments, setReviewerComments] = useState("");

  // Copy to clipboard state
  const [copied, setCopied] = useState(false);

  const handleCopyAnalysis = async () => {
    const textToCopy =
      rawAnalysis || (aiAnalysis ? JSON.stringify(aiAnalysis, null, 2) : "");
    if (!textToCopy) return;

    try {
      await navigator.clipboard.writeText(textToCopy);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy:", err);
    }
  };

  // Keyboard shortcut: Ctrl+S to save
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "s") {
        e.preventDefault();
        if (canEdit && isDirty && !isSubmitting) {
          handleSave();
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [canEdit, isDirty, isSubmitting]);

  // Update local state when active control changes (year change or navigation)
  useEffect(() => {
    setStatus(control.status);
    setCurrentPractice(control.currentPractice || "");
    setEvidenceDescription(control.evidenceDescription || "");
    setContext(control.userContext || "");
    setIsDirty(false);
  }, [control]);

  // Check for dirty state
  useEffect(() => {
    const isChanged =
      status !== control.status ||
      currentPractice !== (control.currentPractice || "") ||
      evidenceDescription !== (control.evidenceDescription || "") ||
      context !== (control.userContext || "");
    setIsDirty(isChanged);
  }, [status, currentPractice, evidenceDescription, context, control]);

  // Set dynamic page title
  useEffect(() => {
    document.title = `${control.code} ${control.name} | ISO Portal`;
    return () => {
      document.title = "ISO Portal";
    };
  }, [control.code, control.name]);

  const handleSave = () => {
    const formData = new FormData();
    formData.append("intent", "save");
    formData.append("controlId", control.id.toString());
    formData.append("status", status);
    formData.append("currentPractice", currentPractice);
    formData.append("evidenceDescription", evidenceDescription);
    formData.append("context", context);
    submit(formData, { method: "post" });
  };

  const handleRunAnalysis = () => {
    const formData = new FormData();
    formData.append("intent", "analyze");
    formData.append("controlId", control.id.toString());
    formData.append("controlCode", control.code);
    formData.append("name", control.name);
    formData.append("description", control.description);
    formData.append("guidance", control.guidance);
    formData.append("status", status);
    formData.append("currentPractice", currentPractice);
    formData.append("evidenceDescription", evidenceDescription);
    formData.append("context", context);
    submit(formData, { method: "post" });
  };

  // Upload state
  const [isUploading, setIsUploading] = useState(false);
  const evidenceInputRef = useRef<HTMLInputElement>(null);
  const evidenceFetcher = useFetcher();

  const handleUploadEvidence = async (
    e: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    try {
      // 1. Upload to Supabase
      const result = await uploadToSupabase(file, "evidence");
      if (!result) {
        throw new Error("Failed to upload file to storage");
      }

      // 2. Save metadata to backend
      const evidence = await EvidenceService.createEvidence({
        fileName: file.name,
        filePath: result.url,
        controlId: control.id,
      });

      if (!evidence) {
        throw new Error("Failed to save evidence metadata");
      }

      // 3. Reload page to show new evidence
      window.location.reload();
    } catch (err) {
      console.error("Upload error:", err);
      alert(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setIsUploading(false);
      if (evidenceInputRef.current) {
        evidenceInputRef.current.value = "";
      }
    }
  };

  const handleDeleteEvidence = async (evidence: EvidenceResponseDto) => {
    if (!confirm("Delete this evidence?")) return;

    try {
      // 1. Delete from Supabase storage (if it's a Supabase URL)
      if (evidence.filePath && evidence.filePath.includes("supabase.co")) {
        const { deleteFromSupabase } = await import("~/lib/supabase");
        await deleteFromSupabase(evidence.filePath, "evidence");
      }

      // 2. Delete from backend database
      await EvidenceService.deleteEvidenceById(evidence.id);

      // 3. Reload page to refresh evidence list
      window.location.reload();
    } catch (err) {
      console.error("Delete error:", err);
      alert("Failed to delete evidence");
    }
  };

  return (
    <div className="flex flex-col gap-6 w-full">
      {/* Header */}
      <div className="flex flex-col gap-4">
        <Link
          to={`/assessment/domain/A${control.code.split(".")[1]}`}
          className="flex items-center text-slate-500 hover:text-slate-800 transition-colors w-fit"
        >
          <ArrowLeft className="w-4 h-4 mr-1" />
          Back to Domain
        </Link>
        <PageHeader
          title={`${control.code} ${control.name} (ID: ${control.id})`}
          description={control.description}
          icon={FileText}
        >
          <div className="flex items-center gap-3 mt-2">
            <StatusBadge
              label={
                controlStatusConfig[control.status]?.label || control.status
              }
              variant={getStatusVariant(control.status)}
            />
            <div className="h-4 w-px bg-slate-200"></div>
            <span className="text-sm text-slate-500">
              {stats.percentage}% Implemented (Domain Average)
            </span>
            <div className="h-4 w-px bg-slate-200"></div>
            <span className="text-sm text-slate-500 font-medium">
              Year: {currentYear}
            </span>
          </div>
        </PageHeader>
      </div>

      {actionData?.message && (
        <div
          className={`p-4 rounded-lg flex items-center gap-2 ${
            actionData.success
              ? "bg-green-50 text-green-700 border border-green-200"
              : "bg-red-50 text-red-700 border border-red-200"
          }`}
        >
          {actionData.success ? (
            <CheckCircle className="w-5 h-5" />
          ) : (
            <AlertTriangle className="w-5 h-5" />
          )}
          {actionData.message}
        </div>
      )}

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column - Details */}
        <div className="lg:col-span-2 flex flex-col gap-6">
          {/* Tabs */}
          <div className="flex border-b border-slate-200">
            {Object.values(Tab)
              .filter((tab) => tab !== Tab.Review)
              .map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`px-6 py-3 text-sm font-medium transition-colors relative ${
                    activeTab === tab
                      ? "text-main-blue"
                      : "text-slate-500 hover:text-slate-700"
                  }`}
                >
                  {tab}
                  {activeTab === tab && (
                    <div className="absolute bottom-0 left-0 w-full h-0.5 bg-main-blue rounded-t-full" />
                  )}
                </button>
              ))}
          </div>

          <div className="bg-white rounded-xl border border-slate-200 shadow-sm min-h-[400px]">
            {activeTab === Tab.Implementation && (
              <div className="p-6 flex flex-col gap-6">
                <div>
                  <h3 className="text-lg font-semibold text-slate-800 mb-4 flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-main-blue" />
                    Implementation Guidance
                  </h3>
                  <div className="prose prose-slate max-w-none text-sm bg-slate-50 p-4 rounded-lg border border-slate-100">
                    <p>{control.guidance}</p>
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-slate-800">
                    Current Practice
                  </h3>
                  <textarea
                    disabled={!canEdit}
                    value={currentPractice}
                    onChange={(e) => setCurrentPractice(e.target.value)}
                    placeholder="Describe your current implementation..."
                    className="w-full h-32 p-3 rounded-lg border border-slate-200 focus:border-main-blue focus:ring-1 focus:ring-main-blue outline-none transition-all resize-none"
                  />
                </div>

                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-slate-800">
                    Evidence Description
                  </h3>
                  <textarea
                    disabled={!canEdit}
                    value={evidenceDescription}
                    onChange={(e) => setEvidenceDescription(e.target.value)}
                    placeholder="Describe the evidence you have..."
                    className="w-full h-24 p-3 rounded-lg border border-slate-200 focus:border-main-blue focus:ring-1 focus:ring-main-blue outline-none transition-all resize-none"
                  />
                </div>

                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-slate-800">
                    Context / Notes
                  </h3>
                  <textarea
                    disabled={!canEdit}
                    value={context}
                    onChange={(e) => setContext(e.target.value)}
                    placeholder="Add internal notes or context..."
                    className="w-full h-24 p-3 rounded-lg border border-slate-200 focus:border-main-blue focus:ring-1 focus:ring-main-blue outline-none transition-all resize-none"
                  />
                </div>
              </div>
            )}

            {activeTab === Tab.Evidence && (
              <div className="p-6 flex flex-col gap-6">
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-semibold text-slate-800">
                    Supporting Documents
                  </h3>
                  {canEdit && (
                    <div className="relative">
                      <input
                        ref={evidenceInputRef}
                        type="file"
                        id="evidence-upload"
                        className="hidden"
                        onChange={handleUploadEvidence}
                        disabled={isUploading}
                        accept=".pdf,.doc,.docx,.xls,.xlsx,.png,.jpg,.jpeg,.gif,.webp"
                      />
                      <label
                        htmlFor="evidence-upload"
                        className={`flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors ${isUploading ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}`}
                      >
                        {isUploading ? (
                          <>
                            <Loader2 className="w-4 h-4 animate-spin" />
                            Uploading...
                          </>
                        ) : (
                          <>
                            <Upload className="w-4 h-4" />
                            Upload File
                          </>
                        )}
                      </label>
                    </div>
                  )}
                </div>

                {evidences.length > 0 ? (
                  <div className="space-y-3">
                    {evidences.map((evidence) => (
                      <div
                        key={evidence.id}
                        className="flex items-center justify-between p-3 rounded-lg border border-slate-100 hover:border-main-blue/30 transition-colors group"
                      >
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-blue-50 text-main-blue rounded-lg">
                            <FileText className="w-5 h-5" />
                          </div>
                          <div>
                            <p className="text-sm font-medium text-slate-800">
                              {evidence.fileName}
                            </p>
                            <p className="text-xs text-slate-500">
                              Uploaded on {simpleDate(evidence.createdAt)}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <a
                            href={evidence.filePath}
                            target="_blank"
                            rel="noreferrer"
                            className="p-2 text-slate-400 hover:text-main-blue transition-colors"
                          >
                            <Download className="w-4 h-4" />
                          </a>
                          {canEdit && (
                            <button
                              onClick={() => handleDeleteEvidence(evidence)}
                              className="p-2 text-slate-400 hover:text-red-500 transition-colors"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12 border-2 border-dashed border-slate-200 rounded-xl">
                    <Upload className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                    <p className="text-slate-500 font-medium">
                      No evidence uploaded yet
                    </p>
                    <p className="text-sm text-slate-400 mt-1">
                      Upload documents to support your implementation
                    </p>
                  </div>
                )}
              </div>
            )}

            {activeTab === Tab.AIAnalysis && (
              <div className="p-6 flex flex-col gap-6">
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-semibold text-slate-800 flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-purple-600" />
                    AI Maturity Analysis
                  </h3>
                  {canEdit && (
                    <button
                      onClick={handleRunAnalysis}
                      disabled={isSubmitting}
                      className="flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-sm font-medium transition-colors disabled:opacity-50"
                    >
                      {isSubmitting ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <Sparkles className="w-4 h-4" />
                      )}
                      Run Analysis
                    </button>
                  )}
                </div>

                {aiAnalysis ? (
                  <div className="space-y-6 animate-in fade-in duration-500">
                    {/* Score */}
                    <div className="flex items-center gap-4 p-4 bg-purple-50 rounded-xl border border-purple-100">
                      <div className="relative w-16 h-16 flex items-center justify-center">
                        <svg className="w-full h-full transform -rotate-90">
                          <circle
                            cx="32"
                            cy="32"
                            r="28"
                            stroke="currentColor"
                            strokeWidth="4"
                            fill="none"
                            className="text-purple-200"
                          />
                          <circle
                            cx="32"
                            cy="32"
                            r="28"
                            stroke="currentColor"
                            strokeWidth="4"
                            fill="none"
                            strokeDasharray={175.93}
                            strokeDashoffset={
                              175.93 *
                              (1 -
                                aiAnalysis.maturityScore / aiAnalysis.maxScore)
                            }
                            className="text-purple-600 transition-all duration-1000 ease-out"
                          />
                        </svg>
                        <span className="absolute text-sm font-bold text-purple-700">
                          {aiAnalysis.maturityScore}/{aiAnalysis.maxScore}
                        </span>
                      </div>
                      <div>
                        <h4 className="font-bold text-purple-900">
                          Maturity Score
                        </h4>
                        <p className="text-sm text-purple-700">
                          Based on current practice & evidence
                        </p>
                      </div>
                    </div>

                    {/* Gaps */}
                    <div>
                      <h4 className="text-sm font-bold text-slate-700 uppercase tracking-wide mb-3">
                        Identified Gaps
                      </h4>
                      <ul className="space-y-2">
                        {aiAnalysis.gaps.map((gap, i) => (
                          <li
                            key={i}
                            className="flex items-start gap-2 text-sm text-slate-600 bg-red-50 p-3 rounded-lg border border-red-100"
                          >
                            <XCircle className="w-4 h-4 text-red-500 mt-0.5 shrink-0" />
                            {gap}
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* Recommendations */}
                    <div>
                      <h4 className="text-sm font-bold text-slate-700 uppercase tracking-wide mb-3">
                        Recommended Actions
                      </h4>
                      <ul className="space-y-2">
                        {aiAnalysis.recommendedActions.map((action, i) => (
                          <li
                            key={i}
                            className="flex items-start gap-2 text-sm text-slate-600 bg-green-50 p-3 rounded-lg border border-green-100"
                          >
                            <CheckCircle2 className="w-4 h-4 text-green-500 mt-0.5 shrink-0" />
                            {action}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                ) : rawAnalysis ? (
                  <div className="space-y-6 animate-in fade-in duration-500">
                    <div className="relative">
                      <button
                        onClick={handleCopyAnalysis}
                        className="absolute top-3 right-3 p-2 rounded-lg bg-white border border-slate-200 hover:bg-slate-100 transition-colors"
                        title="Copy to clipboard"
                      >
                        {copied ? (
                          <Check className="w-4 h-4 text-green-500" />
                        ) : (
                          <Copy className="w-4 h-4 text-slate-500" />
                        )}
                      </button>
                      <div className="p-6 pr-14 bg-slate-50 rounded-xl border border-slate-200">
                        <div className="prose prose-sm prose-slate max-w-none prose-headings:text-slate-800 prose-p:text-slate-600 prose-li:text-slate-600 prose-strong:text-slate-800 prose-code:text-main-blue prose-code:bg-blue-50 prose-code:px-1 prose-code:rounded prose-code:before:content-none prose-code:after:content-none">
                          <Markdown>{rawAnalysis}</Markdown>
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-12 border-2 border-dashed border-slate-200 rounded-xl">
                    <Sparkles className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                    <p className="text-slate-500 font-medium">
                      No analysis generated yet
                    </p>
                    <p className="text-sm text-slate-400 mt-1">
                      Run AI analysis to evaluate your implementation maturity
                    </p>
                  </div>
                )}
              </div>
            )}

            {activeTab === Tab.Review && (
              <div className="p-6 flex flex-col gap-6">
                {/* Independent Review UI - mocked for now as per dashboard */}
                <div className="text-center py-12 border-2 border-dashed border-slate-200 rounded-xl">
                  <p className="text-slate-500">
                    Review workflow integration pending.
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right Column - Context & Actions */}
        <div className="flex flex-col gap-6">
          {/* Status Card */}
          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
            <h3 className="font-semibold text-slate-800 mb-4">Status</h3>
            <div className="space-y-4">
              <div className="flex flex-col gap-2">
                <label className="text-sm font-medium text-slate-700">
                  Implementation Status
                </label>
                <select
                  disabled={!canEdit}
                  value={status}
                  onChange={(e) => setStatus(e.target.value as ControlStatus)}
                  className="w-full p-2.5 rounded-lg border border-slate-200 bg-slate-50 focus:border-main-blue outline-none transition-all"
                >
                  {Object.values(ControlStatus).map((s) => (
                    <option key={s} value={s}>
                      {controlStatusConfig[s].label}
                    </option>
                  ))}
                </select>
              </div>

              {canEdit && (
                <button
                  onClick={handleSave}
                  disabled={!isDirty || isSubmitting}
                  className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-main-blue hover:bg-main-blue/90 text-white rounded-lg font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-sm hover:shadow-md"
                >
                  {isSubmitting ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Save className="w-4 h-4" />
                  )}
                  Save Changes
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
