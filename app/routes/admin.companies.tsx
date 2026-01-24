import { useEffect, useState } from "react";
import {
  useLoaderData,
  useActionData,
  Form,
  useNavigation,
} from "react-router";
import type { ActionFunctionArgs } from "react-router";
import { Building2, Plus, Edit, Trash2 } from "lucide-react";
import { PageHeader, SectionHeader } from "~/components/ui/pageHeader";
import { DataTable, type Column } from "~/components/ui/dataTable";
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalTitle,
  ModalDescription,
  ModalFooter,
} from "~/components/ui/modal";
import { CompanyService } from "~/services";
import type { CompanyResponseDto } from "~/dto";
import { useCompanyFormStore } from "~/stores";

// Extended interface for DataTable compatibility
interface Company extends CompanyResponseDto {
  [key: string]: unknown;
}

// Loader - fetch companies from API
export async function loader() {
  const companies = await CompanyService.getAllCompany();
  return { companies: companies as Company[] };
}

// Action - handle form submissions
export async function action({ request }: ActionFunctionArgs) {
  const formData = await request.formData();
  const intent = formData.get("intent") as string;

  try {
    if (intent === "create") {
      const result = await CompanyService.createCompany({
        code: formData.get("code") as string,
        name: formData.get("name") as string,
        details: formData.get("details") as string,
      });
      return { success: !!result, intent };
    }

    if (intent === "update") {
      const result = await CompanyService.updateCompanyById({
        id: Number(formData.get("id")),
        name: formData.get("name") as string,
        details: formData.get("details") as string,
      });
      return { success: !!result, intent };
    }

    if (intent === "delete") {
      const result = await CompanyService.deleteCompanyById(
        Number(formData.get("id")),
      );
      return { success: !!result, intent };
    }

    return { success: false, error: "Unknown intent" };
  } catch (error) {
    return { success: false, error: String(error) };
  }
}

export default function AdminCompanies() {
  const { companies } = useLoaderData<typeof loader>();
  const actionData = useActionData<typeof action>();
  const navigation = useNavigation();
  const isSubmitting = navigation.state === "submitting";

  // Zustand form store
  const {
    code,
    name,
    details,
    isEditing,
    editingId,
    setField,
    startEdit,
    reset,
  } = useCompanyFormStore();

  // Local state for create modal since store is form-data only
  const [isCreateOpen, setIsCreateOpen] = useState(false);

  // Clear form after successful action
  useEffect(() => {
    if (actionData?.success) {
      reset();
      setIsCreateOpen(false);
    }
  }, [actionData, reset]);

  // Modal state
  const isModalOpen = isCreateOpen || isEditing;

  const openCreateModal = () => {
    reset();
    setIsCreateOpen(true);
  };

  const handleCloseModal = () => {
    reset();
    setIsCreateOpen(false);
  };

  const openEditModal = (company: Company) => {
    startEdit(company.id, {
      code: company.code,
      name: company.name,
      details: company.details || "",
    });
  };

  const columns: Column<Company>[] = [
    {
      key: "code",
      header: "Code",
      render: (company) => (
        <span className="font-mono text-sm bg-slate-100 px-2 py-1 rounded">
          {company.code}
        </span>
      ),
    },
    {
      key: "name",
      header: "Company Name",
      render: (company) => (
        <span className="font-medium text-slate-800">{company.name}</span>
      ),
    },
    {
      key: "details",
      header: "Details",
      render: (company) => (
        <span className="text-slate-500 text-sm">{company.details || "-"}</span>
      ),
    },
    {
      key: "createdAt",
      header: "Created",
      render: (company) => (
        <span className="text-sm text-slate-500">
          {new Date(company.createdAt).toLocaleDateString()}
        </span>
      ),
    },
    {
      key: "actions",
      header: "",
      render: (company) => (
        <div className="flex items-center gap-2">
          <button
            onClick={() => openEditModal(company)}
            className="p-2 hover:bg-slate-100 rounded-lg text-slate-400 hover:text-main-blue"
          >
            <Edit className="w-4 h-4" />
          </button>
          <Form method="post">
            <input type="hidden" name="intent" value="delete" />
            <input type="hidden" name="id" value={company.id} />
            <button
              type="submit"
              className="p-2 hover:bg-red-50 rounded-lg text-slate-400 hover:text-red-500"
              onClick={(e) => {
                if (!confirm("Delete this company?")) e.preventDefault();
              }}
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </Form>
        </div>
      ),
      className: "w-24",
    },
  ];

  return (
    <div className="flex flex-col min-h-screen py-8 px-8 lg:px-16 bg-slate-50/50 gap-6">
      <PageHeader
        title="Company Management"
        description="Manage organizations and their assessments"
        icon={Building2}
        actions={
          <button
            onClick={openCreateModal}
            className="flex items-center gap-2 px-4 py-2 bg-main-blue text-white rounded-lg hover:bg-main-blue/90 transition-colors"
          >
            <Plus className="w-4 h-4" />
            Add Company
          </button>
        }
      />

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-white rounded-xl p-4 border border-slate-200">
          <p className="text-sm text-slate-500">Total Companies</p>
          <p className="text-2xl font-bold text-slate-800">
            {companies.length}
          </p>
        </div>
        <div className="bg-white rounded-xl p-4 border border-slate-200">
          <p className="text-sm text-slate-500">Active Assessments</p>
          <p className="text-2xl font-bold text-green-600">
            {companies.length}
          </p>
        </div>
      </div>

      {/* Companies Table */}
      <div className="bg-white rounded-xl p-6 border border-slate-200">
        <SectionHeader title="All Companies" />
        <DataTable
          data={companies}
          columns={columns}
          keyField="id"
          searchPlaceholder="Search companies..."
          searchFields={["name", "code"]}
          pageSize={10}
        />
      </div>

      {/* Create/Edit Modal */}
      <Modal
        open={isModalOpen}
        onOpenChange={(open) => !open && handleCloseModal()}
      >
        <ModalContent size="md">
          <ModalHeader>
            <ModalTitle>
              {isEditing ? "Edit Company" : "Add New Company"}
            </ModalTitle>
            <ModalDescription>
              {isEditing
                ? "Update company information"
                : "Create a new organization in the system"}
            </ModalDescription>
          </ModalHeader>

          <Form method="post">
            <input
              type="hidden"
              name="intent"
              value={isEditing ? "update" : "create"}
            />
            {isEditing && (
              <input type="hidden" name="id" value={editingId || ""} />
            )}

            <div className="flex flex-col gap-4 py-4">
              {/* Code - only for create */}
              {!isEditing && (
                <div className="flex flex-col gap-2">
                  <label className="text-sm font-medium text-slate-700">
                    Company Code
                  </label>
                  <input
                    type="text"
                    name="code"
                    value={code}
                    onChange={(e) => setField("code", e.target.value)}
                    className="px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-main-blue/20 focus:border-main-blue"
                    placeholder="ACME"
                    required
                  />
                </div>
              )}

              <div className="flex flex-col gap-2">
                <label className="text-sm font-medium text-slate-700">
                  Company Name
                </label>
                <input
                  type="text"
                  name="name"
                  value={name}
                  onChange={(e) => setField("name", e.target.value)}
                  className="px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-main-blue/20 focus:border-main-blue"
                  placeholder="Acme Corporation"
                  required
                />
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-sm font-medium text-slate-700">
                  Details
                </label>
                <textarea
                  name="details"
                  value={details}
                  onChange={(e) => setField("details", e.target.value)}
                  className="px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-main-blue/20 focus:border-main-blue resize-none"
                  placeholder="Additional information about the company"
                  rows={3}
                />
              </div>
            </div>

            <ModalFooter>
              <button
                type="button"
                onClick={handleCloseModal}
                className="px-4 py-2 border border-slate-200 rounded-lg text-slate-600 hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="flex items-center gap-2 px-4 py-2 bg-main-blue text-white rounded-lg hover:bg-main-blue/90 disabled:opacity-50"
              >
                {isSubmitting
                  ? "Saving..."
                  : isEditing
                    ? "Save Changes"
                    : "Create Company"}
              </button>
            </ModalFooter>
          </Form>
        </ModalContent>
      </Modal>
    </div>
  );
}
