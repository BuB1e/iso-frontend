import { useState } from "react";
import { Building2, Plus, Edit, Trash2, Users, FileText } from "lucide-react";
import { PageHeader, SectionHeader } from "~/components/ui/pageHeader";
import { DataTable, type Column } from "~/components/ui/dataTable";
import { StatusBadge } from "~/components/ui/statusBadge";
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalTitle,
  ModalDescription,
  ModalFooter,
} from "~/components/ui/modal";

// Company interface
interface Company {
  [key: string]: unknown; // Index signature for DataTable compatibility
  id: number;
  code: string;
  name: string;
  details: string;
  usersCount: number;
  assessmentsCount: number;
  status: "active" | "inactive";
  createdAt: string;
}

// Mock data
const mockCompanies: Company[] = [
  {
    id: 1,
    code: "ACME",
    name: "Acme Corp",
    details: "Technology solutions provider",
    usersCount: 5,
    assessmentsCount: 3,
    status: "active",
    createdAt: "2025-01-15",
  },
  {
    id: 2,
    code: "TECH",
    name: "TechStart Inc",
    details: "Startup accelerator",
    usersCount: 3,
    assessmentsCount: 1,
    status: "active",
    createdAt: "2025-06-01",
  },
  {
    id: 3,
    code: "SEC",
    name: "SecureData Ltd",
    details: "Data security specialists",
    usersCount: 8,
    assessmentsCount: 4,
    status: "active",
    createdAt: "2024-11-20",
  },
  {
    id: 4,
    code: "OLD",
    name: "Legacy Systems",
    details: "Legacy system maintenance",
    usersCount: 2,
    assessmentsCount: 1,
    status: "inactive",
    createdAt: "2024-03-10",
  },
];

export default function AdminCompanies() {
  const [companies, setCompanies] = useState(mockCompanies);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [companyForm, setCompanyForm] = useState({
    code: "",
    name: "",
    details: "",
  });

  const handleAddCompany = () => {
    // TODO: API call to add company
    console.log("Adding company:", companyForm);
    setIsAddModalOpen(false);
    setCompanyForm({ code: "", name: "", details: "" });
    alert("Company added successfully!");
  };

  const columns: Column<Company>[] = [
    {
      key: "code",
      header: "Code",
      render: (company) => (
        <span className="px-2 py-1 bg-slate-100 text-slate-700 font-mono text-sm rounded">
          {company.code}
        </span>
      ),
      className: "w-24",
    },
    {
      key: "name",
      header: "Company Name",
      render: (company) => (
        <div className="flex flex-col">
          <span className="font-medium text-slate-800">{company.name}</span>
          <span className="text-xs text-slate-500">{company.details}</span>
        </div>
      ),
    },
    {
      key: "usersCount",
      header: "Users",
      render: (company) => (
        <div className="flex items-center gap-2">
          <Users className="w-4 h-4 text-slate-400" />
          <span>{company.usersCount}</span>
        </div>
      ),
      className: "w-24",
    },
    {
      key: "assessmentsCount",
      header: "Assessments",
      render: (company) => (
        <div className="flex items-center gap-2">
          <FileText className="w-4 h-4 text-slate-400" />
          <span>{company.assessmentsCount}</span>
        </div>
      ),
      className: "w-32",
    },
    {
      key: "status",
      header: "Status",
      render: (company) => (
        <StatusBadge
          label={company.status === "active" ? "Active" : "Inactive"}
          variant={company.status === "active" ? "success" : "default"}
        />
      ),
      className: "w-24",
    },
    {
      key: "createdAt",
      header: "Created",
      className: "w-28",
    },
    {
      key: "actions",
      header: "",
      render: (company) => (
        <div className="flex items-center gap-2">
          <button className="p-2 hover:bg-slate-100 rounded-lg text-slate-400 hover:text-main-blue">
            <Edit className="w-4 h-4" />
          </button>
          <button className="p-2 hover:bg-red-50 rounded-lg text-slate-400 hover:text-red-500">
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      ),
      className: "w-24",
    },
  ];

  return (
    <div className="flex flex-col min-h-screen py-8 px-8 lg:px-16 bg-slate-50/50 gap-6">
      <PageHeader
        title="Company Management"
        description="Manage companies and their ISO 27001 assessments"
        icon={Building2}
        actions={
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2 bg-main-blue text-white rounded-lg hover:bg-main-blue/90 transition-colors"
          >
            <Plus className="w-4 h-4" />
            Add Company
          </button>
        }
      />

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-white rounded-xl p-4 border border-slate-200">
          <p className="text-sm text-slate-500">Total Companies</p>
          <p className="text-2xl font-bold text-slate-800">
            {companies.length}
          </p>
        </div>
        <div className="bg-white rounded-xl p-4 border border-slate-200">
          <p className="text-sm text-slate-500">Active Companies</p>
          <p className="text-2xl font-bold text-slate-800">
            {companies.filter((c) => c.status === "active").length}
          </p>
        </div>
        <div className="bg-white rounded-xl p-4 border border-slate-200">
          <p className="text-sm text-slate-500">Total Assessments</p>
          <p className="text-2xl font-bold text-slate-800">
            {companies.reduce((acc, c) => acc + c.assessmentsCount, 0)}
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
          searchFields={["code", "name", "details"]}
          pageSize={10}
        />
      </div>

      {/* Add Company Modal */}
      <Modal open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
        <ModalContent size="md">
          <ModalHeader>
            <ModalTitle>Add New Company</ModalTitle>
            <ModalDescription>
              Create a new company to manage their ISO 27001 assessments.
            </ModalDescription>
          </ModalHeader>

          <div className="flex flex-col gap-4 py-4">
            {/* Company Code */}
            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium text-slate-700">
                Company Code
              </label>
              <input
                type="text"
                value={companyForm.code}
                onChange={(e) =>
                  setCompanyForm({
                    ...companyForm,
                    code: e.target.value.toUpperCase(),
                  })
                }
                className="px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-main-blue/20 focus:border-main-blue font-mono"
                placeholder="ACME"
                maxLength={10}
              />
              <p className="text-xs text-slate-500">
                Unique identifier for the company (max 10 characters)
              </p>
            </div>

            {/* Company Name */}
            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium text-slate-700">
                Company Name
              </label>
              <input
                type="text"
                value={companyForm.name}
                onChange={(e) =>
                  setCompanyForm({ ...companyForm, name: e.target.value })
                }
                className="px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-main-blue/20 focus:border-main-blue"
                placeholder="Acme Corporation"
              />
            </div>

            {/* Details */}
            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium text-slate-700">
                Details
              </label>
              <textarea
                value={companyForm.details}
                onChange={(e) =>
                  setCompanyForm({ ...companyForm, details: e.target.value })
                }
                rows={3}
                className="px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-main-blue/20 focus:border-main-blue resize-none"
                placeholder="Brief description of the company..."
              />
            </div>
          </div>

          <ModalFooter>
            <button
              onClick={() => setIsAddModalOpen(false)}
              className="px-4 py-2 border border-slate-200 rounded-lg text-slate-600 hover:bg-slate-50"
            >
              Cancel
            </button>
            <button
              onClick={handleAddCompany}
              className="flex items-center gap-2 px-4 py-2 bg-main-blue text-white rounded-lg hover:bg-main-blue/90"
            >
              <Plus className="w-4 h-4" />
              Add Company
            </button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </div>
  );
}
