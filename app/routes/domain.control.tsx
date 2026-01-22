import { useState, useEffect, useCallback, useMemo } from "react";
import { Link, useParams } from "react-router";
import {
  ArrowLeft,
  Save,
  Upload,
  FileText,
  FileSpreadsheet,
  Download,
  Trash2,
  Sparkles,
  Clock,
  CheckCircle,
  XCircle,
  ExternalLink,
  AlertTriangle,
  CheckCircle2,
} from "lucide-react";
import {
  ControlStatus,
  controlStatusConfig,
  type TControl,
  UserRole,
  userRoleConfig,
} from "~/types";
import {
  useUserStore,
  useCanEditImplementation,
  useCanSubmitReview,
} from "~/stores/userStore";
import {
  useFormCacheStore,
  type ControlFormData,
} from "~/stores/formCacheStore";

// Review status enum
enum ReviewStatus {
  WAITING = "WAITING",
  APPROVED = "APPROVED",
  NOT_PASS = "NOT_PASS",
}

// Tab enum
enum Tab {
  Implementation = "Implementation",
  Evidence = "Evidence",
  AIAnalysis = "AI Analysis",
  Review = "Review",
}

// Mock evidence data
interface Evidence {
  id: number;
  fileName: string;
  fileSize: string;
  uploadedAt: string;
  fileType: "pdf" | "excel" | "doc" | "image";
}

// Mock AI analysis data
interface AIAnalysis {
  maturityScore: number;
  maxScore: number;
  gaps: string[];
  recommendedActions: string[];
}

// Mock control data - memoized outside component for performance
const MOCK_DATA = {
  control: {
    id: 1,
    code: "A.5.1",
    name: "Policies for information security",
    description:
      "Information security policy and topic-specific policies shall be defined, approved by management, published, communicated to and acknowledged by relevant personnel.",
    currentPractice:
      "We have a central policy portal hosted on SharePoint. All employees are required to sign off on the information security policy during onboarding. Annual re-acknowledgment is required.",
    status: ControlStatus.IMPLEMENTED,
    assessmentControlId: 1,
  } as TControl,
  guidance:
    "Ensure that you have documented policies and procedures. For this control, auditors typically look for evidence of approval, communication to relevant staff, and periodic review.",
  evidenceDescription:
    "Link to SharePoint policy library. All sign-off records available in HR system.",
  context:
    "Small startup environment (~50 employees), but policies are formalized and regularly reviewed. Last policy review was conducted in Q3 2025.",
  auditTrail: {
    lastUpdated: "11/25/2025",
    updatedBy: "Alex Security",
    version: "1.2",
  },
  reviewStatus: ReviewStatus.APPROVED,
  reviewerComments:
    "Excellent implementation of information security policies. The organization has demonstrated strong policy governance with proper documentation and employee acknowledgment processes. Recommend continuing annual reviews and considering automation for sign-off tracking.",
  evidences: [
    {
      id: 1,
      fileName: "InfoSec_Policy_v2.pdf",
      fileSize: "2.4 MB",
      uploadedAt: "11/20/2025",
      fileType: "pdf",
    },
    {
      id: 2,
      fileName: "Employee_Signoff_Records.xlsx",
      fileSize: "1.1 MB",
      uploadedAt: "11/22/2025",
      fileType: "excel",
    },
  ] as Evidence[],
  aiAnalysis: {
    maturityScore: 4,
    maxScore: 5,
    gaps: [
      "Strong foundation with centralized policy management",
      "The organization demonstrates good policy governance with regular reviews and employee acknowledgment tracking",
      "Minor gap identified in automated sign-off tracking.",
    ],
    recommendedActions: [
      "Schedule annual policy review for Q4 2025",
      "Implement automated sign-off tracking system",
      "Add version control to policy documents",
      "Consider topic-specific policies for remote work",
    ],
  } as AIAnalysis,
};

export default function DomainControl() {
  const { domainNumber, controlNumber } = useParams();
  const [activeTab, setActiveTab] = useState<Tab>(Tab.Implementation);

  // User & permissions from Zustand store
  const currentUser = useUserStore((state) => state.currentUser);
  const canEdit = useCanEditImplementation();
  const canReview = useCanSubmitReview();

  // Form cache store
  const { getFormData, saveFormData, clearFormData, hasUnsavedChanges } =
    useFormCacheStore();

  // Get control code from URL or default
  const controlCode = controlNumber || MOCK_DATA.control.code;

  // Initialize form state - check cache first
  const cachedData = useMemo(
    () => getFormData(controlCode),
    [controlCode, getFormData],
  );

  const [status, setStatus] = useState<ControlStatus>(
    cachedData?.status || MOCK_DATA.control.status,
  );
  const [currentPractice, setCurrentPractice] = useState(
    cachedData?.currentPractice || MOCK_DATA.control.currentPractice,
  );
  const [evidenceDescription, setEvidenceDescription] = useState(
    cachedData?.evidenceDescription || MOCK_DATA.evidenceDescription,
  );
  const [context, setContext] = useState(
    cachedData?.context || MOCK_DATA.context,
  );
  const [reviewStatus, setReviewStatus] = useState(MOCK_DATA.reviewStatus);
  const [reviewerComments, setReviewerComments] = useState(
    cachedData?.reviewerComments || MOCK_DATA.reviewerComments,
  );
  const [evidences, setEvidences] = useState(MOCK_DATA.evidences);

  // Track if form has been modified from original
  const [isDirty, setIsDirty] = useState(hasUnsavedChanges(controlCode));

  // Auto-save to cache when form changes (debounced)
  useEffect(() => {
    if (!canEdit && !canReview) return;

    const timeoutId = setTimeout(() => {
      const formData: ControlFormData = {
        controlCode,
        status,
        currentPractice,
        evidenceDescription,
        context,
        reviewerComments,
        lastModified: Date.now(),
      };

      // Check if anything changed from original
      const hasChanges =
        status !== MOCK_DATA.control.status ||
        currentPractice !== MOCK_DATA.control.currentPractice ||
        evidenceDescription !== MOCK_DATA.evidenceDescription ||
        context !== MOCK_DATA.context ||
        reviewerComments !== MOCK_DATA.reviewerComments;

      if (hasChanges) {
        saveFormData(formData);
        setIsDirty(true);
      }
    }, 500); // Debounce 500ms

    return () => clearTimeout(timeoutId);
  }, [
    status,
    currentPractice,
    evidenceDescription,
    context,
    reviewerComments,
    controlCode,
    canEdit,
    canReview,
    saveFormData,
  ]);

  // Handle save
  const handleSave = useCallback(() => {
    // TODO: API call to save
    console.log("Saving form data...", {
      controlCode,
      status,
      currentPractice,
      evidenceDescription,
      context,
      reviewerComments,
    });

    // Clear cache after successful save
    clearFormData(controlCode);
    setIsDirty(false);
    alert("Changes saved successfully!");
  }, [
    controlCode,
    status,
    currentPractice,
    evidenceDescription,
    context,
    reviewerComments,
    clearFormData,
  ]);

  // Handle cancel - restore original data
  const handleCancel = useCallback(() => {
    setStatus(MOCK_DATA.control.status);
    setCurrentPractice(MOCK_DATA.control.currentPractice);
    setEvidenceDescription(MOCK_DATA.evidenceDescription);
    setContext(MOCK_DATA.context);
    setReviewerComments(MOCK_DATA.reviewerComments);
    clearFormData(controlCode);
    setIsDirty(false);
  }, [controlCode, clearFormData]);

  if (!currentUser) {
    return <div>Loading...</div>;
  }

  return (
    <div className="flex flex-col min-h-screen bg-slate-50/50">
      {/* Header */}
      <Header
        control={MOCK_DATA.control}
        status={status}
        reviewStatus={reviewStatus}
        domainNumber={domainNumber || "A5"}
        isDirty={isDirty}
        onSave={handleSave}
        onCancel={handleCancel}
      />

      {/* Main Content */}
      <div className="flex flex-row gap-6 px-8 lg:px-16 py-6">
        {/* Left Content (3/4) */}
        <div className="flex flex-col gap-6 w-3/4">
          {/* Control Guidance */}
          <ControlGuidanceSection
            description={MOCK_DATA.control.description}
            guidance={MOCK_DATA.guidance}
          />

          {/* Tabs */}
          <TabNavigation activeTab={activeTab} setActiveTab={setActiveTab} />

          {/* Tab Content */}
          <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
            {activeTab === Tab.Implementation && (
              <ImplementationSection
                status={status}
                setStatus={setStatus}
                currentPractice={currentPractice}
                setCurrentPractice={setCurrentPractice}
                evidenceDescription={evidenceDescription}
                setEvidenceDescription={setEvidenceDescription}
                context={context}
                setContext={setContext}
                canEdit={canEdit}
                onSave={handleSave}
              />
            )}
            {activeTab === Tab.Evidence && (
              <EvidenceSection evidences={evidences} canEdit={canEdit} />
            )}
            {activeTab === Tab.AIAnalysis && (
              <AIAnalysisSection analysis={MOCK_DATA.aiAnalysis} />
            )}
            {activeTab === Tab.Review && (
              <ReviewSection
                reviewStatus={reviewStatus}
                setReviewStatus={setReviewStatus}
                reviewerComments={reviewerComments}
                setReviewerComments={setReviewerComments}
                canReview={canReview}
              />
            )}
          </div>
        </div>

        {/* Right Sidebar (1/4) */}
        <div className="flex flex-col gap-4 w-1/4">
          <AuditTrailSection auditTrail={MOCK_DATA.auditTrail} />
          <YourRoleSection role={currentUser.role} />
        </div>
      </div>
    </div>
  );
}

// ============ HEADER ============
function Header({
  control,
  status,
  reviewStatus,
  domainNumber,
  isDirty,
  onSave,
  onCancel,
}: {
  control: TControl;
  status: ControlStatus;
  reviewStatus: ReviewStatus;
  domainNumber: string;
  isDirty: boolean;
  onSave: () => void;
  onCancel: () => void;
}) {
  const statusConfig = controlStatusConfig[status];

  return (
    <div className="flex flex-row items-center justify-between px-8 lg:px-16 py-4 bg-white border-b border-slate-200">
      <div className="flex flex-row items-center gap-4">
        <Link
          to={`/assessment/domain/${domainNumber}`}
          className="flex items-center gap-1 text-slate-600 hover:text-main-blue transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span className="text-sm">Back</span>
        </Link>

        <div className="flex flex-col">
          <div className="flex items-center gap-3">
            <h1 className="text-xl font-bold text-slate-800">{control.code}</h1>
            <span
              className={`px-2 py-0.5 rounded text-xs font-medium ${statusConfig.bgColor} ${statusConfig.color}`}
            >
              {statusConfig.label.toUpperCase()}
            </span>
            {reviewStatus === ReviewStatus.APPROVED && (
              <span className="px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-700">
                Approved
              </span>
            )}
            {isDirty && (
              <span className="px-2 py-0.5 rounded text-xs font-medium bg-yellow-100 text-yellow-700">
                Unsaved
              </span>
            )}
          </div>
          <p className="text-slate-500 text-sm">{control.name}</p>
        </div>
      </div>

      {/*<div className="flex items-center gap-3">
        <button
          onClick={onCancel}
          className="px-4 py-2 border border-slate-300 rounded-lg text-slate-600 hover:bg-slate-50 transition-colors"
        >
          Cancel
        </button>
        <button
          onClick={onSave}
          disabled={!isDirty}
          className="flex items-center gap-2 px-4 py-2 bg-main-blue text-white rounded-lg hover:bg-main-blue/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Save className="w-4 h-4" />
          Save Changes
        </button>
      </div>*/}
    </div>
  );
}

// ============ CONTROL GUIDANCE ============
function ControlGuidanceSection({
  description,
  guidance,
}: {
  description: string;
  guidance: string;
}) {
  return (
    <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
      <h2 className="text-lg font-semibold text-slate-800 mb-3">
        Control Guidance
      </h2>
      <p className="text-slate-600 text-sm mb-4">{description}</p>

      <div className="bg-blue-50 border-l-4 border-main-blue p-4 rounded-r-lg">
        <div className="flex items-center gap-2 mb-2">
          <ExternalLink className="w-4 h-4 text-main-blue" />
          <span className="text-sm font-semibold text-main-blue">
            Implementation Guidance
          </span>
        </div>
        <p className="text-sm text-slate-600">{guidance}</p>
      </div>
    </div>
  );
}

// ============ TAB NAVIGATION ============
function TabNavigation({
  activeTab,
  setActiveTab,
}: {
  activeTab: Tab;
  setActiveTab: (tab: Tab) => void;
}) {
  //const tabs = [Tab.Implementation, Tab.Evidence, Tab.AIAnalysis, Tab.Review];
  const tabs = [Tab.Implementation, Tab.Evidence, Tab.AIAnalysis];

  return (
    <div className="flex border-b border-slate-200">
      {tabs.map((tab) => (
        <button
          key={tab}
          onClick={() => setActiveTab(tab)}
          className={`px-4 py-3 text-sm font-medium transition-colors relative ${
            activeTab === tab
              ? "text-main-blue"
              : "text-slate-500 hover:text-slate-700"
          }`}
        >
          {tab}
          {activeTab === tab && (
            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-main-blue" />
          )}
        </button>
      ))}
    </div>
  );
}

// ============ IMPLEMENTATION SECTION ============
function ImplementationSection({
  status,
  setStatus,
  currentPractice,
  setCurrentPractice,
  evidenceDescription,
  setEvidenceDescription,
  context,
  setContext,
  canEdit,
  onSave,
}: {
  status: ControlStatus;
  setStatus: (status: ControlStatus) => void;
  currentPractice: string;
  setCurrentPractice: (value: string) => void;
  evidenceDescription: string;
  setEvidenceDescription: (value: string) => void;
  context: string;
  setContext: (value: string) => void;
  canEdit: boolean;
  onSave: () => void;
}) {
  return (
    <div className="flex flex-col gap-6">
      {/* Implementation Status */}
      <div className="flex flex-col gap-2">
        <label className="text-sm font-medium text-slate-700">
          Implementation Status
        </label>
        <select
          value={status}
          onChange={(e) => setStatus(e.target.value as ControlStatus)}
          disabled={!canEdit}
          className="w-full px-4 py-2.5 border border-slate-200 rounded-lg bg-white text-slate-800 focus:outline-none focus:ring-2 focus:ring-main-blue/20 focus:border-main-blue disabled:bg-slate-100 disabled:cursor-not-allowed"
        >
          <option value={ControlStatus.NOT_IMPLEMENTED}>Not Implemented</option>
          <option value={ControlStatus.PARTIALLY}>Partially Implemented</option>
          <option value={ControlStatus.IMPLEMENTED}>Implemented</option>
        </select>
      </div>

      {/* Current Practice */}
      <div className="flex flex-col gap-2">
        <label className="text-sm font-medium text-slate-700">
          Current Practice
        </label>
        <textarea
          value={currentPractice}
          onChange={(e) => setCurrentPractice(e.target.value)}
          disabled={!canEdit}
          rows={4}
          className="w-full px-4 py-3 border border-slate-200 rounded-lg bg-white text-slate-800 resize-y focus:outline-none focus:ring-2 focus:ring-main-blue/20 focus:border-main-blue disabled:bg-slate-100 disabled:cursor-not-allowed"
          placeholder="Describe your current implementation..."
        />
      </div>

      {/* Evidence Description */}
      <div className="flex flex-col gap-2">
        <label className="text-sm font-medium text-slate-700">
          Evidence Description
        </label>
        <textarea
          value={evidenceDescription}
          onChange={(e) => setEvidenceDescription(e.target.value)}
          disabled={!canEdit}
          rows={2}
          className="w-full px-4 py-3 border border-slate-200 rounded-lg bg-white text-slate-800 resize-y focus:outline-none focus:ring-2 focus:ring-main-blue/20 focus:border-main-blue disabled:bg-slate-100 disabled:cursor-not-allowed"
          placeholder="Describe where evidence can be found..."
        />
      </div>

      {/* Context / Notes */}
      <div className="flex flex-col gap-2">
        <label className="text-sm font-medium text-slate-700">
          Context / Notes
        </label>
        <textarea
          value={context}
          onChange={(e) => setContext(e.target.value)}
          disabled={!canEdit}
          rows={3}
          className="w-full px-4 py-3 border border-slate-200 rounded-lg bg-white text-slate-800 resize-y focus:outline-none focus:ring-2 focus:ring-main-blue/20 focus:border-main-blue disabled:bg-slate-100 disabled:cursor-not-allowed"
          placeholder="Add any additional context or notes..."
        />
      </div>

      {/* Save Button */}
      {canEdit && (
        <div className="flex justify-center">
          <button
            onClick={onSave}
            className="flex items-center gap-2 px-6 py-2.5 bg-main-blue text-white rounded-lg hover:bg-main-blue/90 transition-colors"
          >
            <Save className="w-4 h-4" />
            Save Changes
          </button>
        </div>
      )}
    </div>
  );
}

// ============ EVIDENCE SECTION ============
function EvidenceSection({
  evidences,
  canEdit,
}: {
  evidences: Evidence[];
  canEdit: boolean;
}) {
  const getFileIcon = (fileType: string) => {
    switch (fileType) {
      case "excel":
        return <FileSpreadsheet className="w-5 h-5 text-green-600" />;
      default:
        return <FileText className="w-5 h-5 text-red-500" />;
    }
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Upload Area */}
      {canEdit && (
        <div className="border-2 border-dashed border-slate-300 rounded-xl p-8 flex flex-col items-center justify-center gap-3 hover:border-main-blue hover:bg-main-blue/5 transition-colors cursor-pointer">
          <Upload className="w-10 h-10 text-slate-400" />
          <p className="text-slate-600 font-medium">
            Click to upload or drag and drop
          </p>
          <p className="text-slate-400 text-sm">
            PDF, PNG, JPG, DOCX up to 10MB
          </p>
        </div>
      )}

      {/* Uploaded Files */}
      <div className="flex flex-col gap-3">
        <h3 className="text-sm font-semibold text-slate-700">Uploaded Files</h3>
        {evidences.map((evidence) => (
          <div
            key={evidence.id}
            className="flex items-center justify-between p-4 bg-slate-50 rounded-lg border border-slate-200"
          >
            <div className="flex items-center gap-3">
              {getFileIcon(evidence.fileType)}
              <div>
                <p className="text-sm font-medium text-slate-800">
                  {evidence.fileName}
                </p>
                <p className="text-xs text-slate-500">
                  {evidence.fileSize} • {evidence.uploadedAt}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button className="p-2 hover:bg-slate-200 rounded-lg transition-colors text-slate-400 hover:text-slate-600">
                <Download className="w-4 h-4" />
              </button>
              {canEdit && (
                <button className="p-2 hover:bg-red-50 rounded-lg transition-colors text-slate-400 hover:text-red-500">
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ============ AI ANALYSIS SECTION ============
function AIAnalysisSection({ analysis }: { analysis: AIAnalysis }) {
  return (
    <div className="flex flex-col gap-6">
      {/* AI Gap Analysis Header */}
      <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-6 border border-blue-100">
        <div className="flex items-start gap-4">
          <div className="p-3 bg-white rounded-xl shadow-sm">
            <Sparkles className="w-6 h-6 text-main-blue" />
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-slate-800">
              AI Gap Analysis
            </h3>
            <p className="text-sm text-slate-600 mt-1">
              Our AI analyzes your current practice description against ISO
              27001 requirements to identify gaps.
            </p>
            <button className="mt-3 px-4 py-2 bg-main-blue text-white text-sm font-medium rounded-lg hover:bg-main-blue/90 transition-colors">
              Run Analysis
            </button>
          </div>
        </div>
      </div>

      {/* Analysis Results */}
      <div className="bg-white rounded-xl border border-slate-200 p-6">
        <h3 className="text-lg font-semibold text-slate-800 mb-4">
          Analysis Results
        </h3>

        {/* Maturity Score */}
        <div className="flex items-center justify-between p-4 bg-slate-50 rounded-lg mb-6">
          <span className="text-slate-600 font-medium">Maturity Score</span>
          <span className="px-3 py-1 bg-green-100 text-green-700 font-bold rounded-full">
            {analysis.maturityScore}/{analysis.maxScore}
          </span>
        </div>

        {/* Identified Gaps */}
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-3">
            <AlertTriangle className="w-4 h-4 text-yellow-600" />
            <h4 className="font-semibold text-slate-800">Identified Gaps</h4>
          </div>
          <ul className="space-y-2">
            {analysis.gaps.map((gap, index) => (
              <li
                key={index}
                className="flex items-start gap-2 text-sm text-slate-600"
              >
                <span className="text-slate-400 mt-1">•</span>
                <span>{gap}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Recommended Actions */}
        <div>
          <div className="flex items-center gap-2 mb-3">
            <CheckCircle2 className="w-4 h-4 text-green-600" />
            <h4 className="font-semibold text-slate-800">
              Recommended Actions
            </h4>
          </div>
          <ul className="space-y-2">
            {analysis.recommendedActions.map((action, index) => (
              <li
                key={index}
                className="flex items-start gap-2 text-sm text-slate-600"
              >
                <span className="text-slate-400 mt-1">•</span>
                <span>{action}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}

// ============ REVIEW SECTION ============
function ReviewSection({
  reviewStatus,
  setReviewStatus,
  reviewerComments,
  setReviewerComments,
  canReview,
}: {
  reviewStatus: ReviewStatus;
  setReviewStatus: (status: ReviewStatus) => void;
  reviewerComments: string;
  setReviewerComments: (value: string) => void;
  canReview: boolean;
}) {
  const reviewOptions = [
    {
      status: ReviewStatus.WAITING,
      label: "Waiting",
      icon: Clock,
      color: "text-slate-500",
      bgColor: "bg-slate-50",
      borderColor: "border-slate-200",
    },
    {
      status: ReviewStatus.APPROVED,
      label: "Approved",
      icon: CheckCircle,
      color: "text-green-600",
      bgColor: "bg-green-50",
      borderColor: "border-green-500",
    },
    {
      status: ReviewStatus.NOT_PASS,
      label: "Not Pass",
      icon: XCircle,
      color: "text-red-500",
      bgColor: "bg-red-50",
      borderColor: "border-red-500",
    },
  ];

  return (
    <div className="flex flex-col gap-6">
      {/* Review Status */}
      <div className="flex flex-col gap-3">
        <label className="text-sm font-semibold text-slate-700">
          Review Status
        </label>
        <div className="grid grid-cols-3 gap-4">
          {reviewOptions.map((option) => {
            const Icon = option.icon;
            const isSelected = reviewStatus === option.status;
            return (
              <button
                key={option.status}
                onClick={() => canReview && setReviewStatus(option.status)}
                disabled={!canReview}
                className={`flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all ${
                  isSelected
                    ? `${option.bgColor} ${option.borderColor}`
                    : "bg-white border-slate-200 hover:border-slate-300"
                } ${!canReview ? "cursor-not-allowed opacity-60" : "cursor-pointer"}`}
              >
                <Icon
                  className={`w-6 h-6 ${isSelected ? option.color : "text-slate-400"}`}
                />
                <span
                  className={`text-sm font-medium ${isSelected ? option.color : "text-slate-500"}`}
                >
                  {option.label}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Reviewer Comments */}
      <div className="flex flex-col gap-2">
        <label className="text-sm font-semibold text-slate-700">
          Reviewer Comments
        </label>
        <textarea
          value={reviewerComments}
          onChange={(e) => setReviewerComments(e.target.value)}
          disabled={!canReview}
          rows={5}
          className="w-full px-4 py-3 border border-slate-200 rounded-lg bg-white text-slate-800 resize-y focus:outline-none focus:ring-2 focus:ring-main-blue/20 focus:border-main-blue disabled:bg-slate-100 disabled:cursor-not-allowed"
          placeholder="Add your review comments..."
        />
      </div>

      {/* Permission Notice */}
      {!canReview && (
        <div className="p-4 bg-slate-50 rounded-lg border border-slate-200">
          <p className="text-sm text-slate-500 text-center">
            Only External Experts and Administrators can submit reviews.
          </p>
        </div>
      )}
    </div>
  );
}

// ============ AUDIT TRAIL SECTION ============
function AuditTrailSection({
  auditTrail,
}: {
  auditTrail: { lastUpdated: string; updatedBy: string; version: string };
}) {
  return (
    <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
      <h3 className="text-sm font-semibold text-slate-800 mb-4">Audit Trail</h3>
      <div className="flex flex-col gap-3">
        <div className="flex justify-between">
          <span className="text-sm text-slate-500">Last Updated</span>
          <span className="text-sm font-medium text-slate-800">
            {auditTrail.lastUpdated}
          </span>
        </div>
        <div className="flex justify-between">
          <span className="text-sm text-slate-500">Updated By</span>
          <span className="text-sm font-medium text-slate-800">
            {auditTrail.updatedBy}
          </span>
        </div>
        <div className="flex justify-between">
          <span className="text-sm text-slate-500">Version</span>
          <span className="text-sm font-medium text-slate-800">
            {auditTrail.version}
          </span>
        </div>
      </div>
    </div>
  );
}

// ============ YOUR ROLE SECTION ============
function YourRoleSection({ role }: { role: UserRole }) {
  const config = userRoleConfig[role];
  return (
    <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
      <h3 className="text-sm font-semibold text-slate-800 mb-4">Your Role</h3>
      <div className={`p-3 rounded-lg ${config.bgColor}`}>
        <p className={`text-sm font-bold ${config.color}`}>{config.label}</p>
        <p className="text-xs text-slate-500 mt-1">{config.description}</p>
      </div>
    </div>
  );
}
