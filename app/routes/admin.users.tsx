import { useState } from "react";
import { Users, Edit, Trash2, AlertCircle, Building2 } from "lucide-react";
import { PageHeader, SectionHeader } from "~/components/ui/pageHeader";
import { DataTable, type Column } from "~/components/ui/dataTable";
import { StatusBadge, type BadgeVariant } from "~/components/ui/statusBadge";
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalTitle,
  ModalDescription,
  ModalFooter,
} from "~/components/ui/modal";
import { UserRole } from "~/types";

// User interface for admin management
interface AdminUser {
  [key: string]: unknown; // Index signature for DataTable compatibility
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: UserRole;
  companyId: number | null;
  companyName: string | null;
  emailVerified: boolean;
  createdAt: string;
}

// Mock data - users who have signed up
const mockUsers: AdminUser[] = [
  {
    id: "1",
    firstName: "John",
    lastName: "Doe",
    email: "john.doe@example.com",
    role: UserRole.INTERNAL_EXPERT,
    companyId: 1,
    companyName: "Acme Corp",
    emailVerified: true,
    createdAt: "2025-10-15",
  },
  {
    id: "2",
    firstName: "Jane",
    lastName: "Smith",
    email: "jane.smith@auditor.com",
    role: UserRole.EXTERNAL_EXPERT,
    companyId: 3,
    companyName: "Security Auditors Ltd",
    emailVerified: true,
    createdAt: "2025-11-01",
  },
  {
    id: "3",
    firstName: "Bob",
    lastName: "Wilson",
    email: "bob.wilson@example.com",
    role: UserRole.INTERNAL_EXPERT,
    companyId: null, // Unassigned
    companyName: null,
    emailVerified: true,
    createdAt: "2025-12-10",
  },
  {
    id: "4",
    firstName: "Alice",
    lastName: "Brown",
    email: "alice.brown@gmail.com",
    role: UserRole.INTERNAL_EXPERT,
    companyId: null, // Unassigned
    companyName: null,
    emailVerified: false,
    createdAt: "2025-12-18",
  },
  {
    id: "5",
    firstName: "Charlie",
    lastName: "Davis",
    email: "charlie@techstart.com",
    role: UserRole.INTERNAL_EXPERT,
    companyId: 2,
    companyName: "TechStart Inc",
    emailVerified: true,
    createdAt: "2025-12-15",
  },
];

// Mock companies for dropdown
const mockCompanies = [
  { id: 1, name: "Acme Corp" },
  { id: 2, name: "TechStart Inc" },
  { id: 3, name: "Security Auditors Ltd" },
  { id: 4, name: "Audit Co" },
];

type FilterType = "all" | "unassigned" | "assigned";

export default function AdminUsers() {
  const [users, setUsers] = useState(mockUsers);
  const [filter, setFilter] = useState<FilterType>("all");
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<AdminUser | null>(null);
  const [editForm, setEditForm] = useState({
    role: UserRole.INTERNAL_EXPERT as UserRole,
    companyId: null as number | null,
  });

  // Filter users
  const filteredUsers = users.filter((user) => {
    if (filter === "unassigned") return user.companyId === null;
    if (filter === "assigned") return user.companyId !== null;
    return true;
  });

  // Stats
  const unassignedCount = users.filter((u) => u.companyId === null).length;
  const assignedCount = users.filter((u) => u.companyId !== null).length;

  const openEditModal = (user: AdminUser) => {
    setSelectedUser(user);
    setEditForm({
      role: user.role,
      companyId: user.companyId,
    });
    setIsEditModalOpen(true);
  };

  const openDeleteModal = (user: AdminUser) => {
    setSelectedUser(user);
    setIsDeleteModalOpen(true);
  };

  const handleSaveUser = () => {
    if (!selectedUser) return;

    // TODO: API call to update user
    console.log("Updating user:", selectedUser.id, editForm);

    // Update local state
    setUsers(
      users.map((u) =>
        u.id === selectedUser.id
          ? {
              ...u,
              role: editForm.role,
              companyId: editForm.companyId,
              companyName:
                mockCompanies.find((c) => c.id === editForm.companyId)?.name ||
                null,
            }
          : u,
      ),
    );

    setIsEditModalOpen(false);
    setSelectedUser(null);
  };

  const handleDeleteUser = () => {
    if (!selectedUser) return;

    // TODO: API call to delete user
    console.log("Deleting user:", selectedUser.id);

    setUsers(users.filter((u) => u.id !== selectedUser.id));
    setIsDeleteModalOpen(false);
    setSelectedUser(null);
  };

  const columns: Column<AdminUser>[] = [
    {
      key: "name",
      header: "User",
      render: (user) => (
        <div className="flex flex-col">
          <div className="flex items-center gap-2">
            <span className="font-medium text-slate-800">
              {user.firstName} {user.lastName}
            </span>
            {!user.emailVerified && (
              <span className="px-1.5 py-0.5 bg-yellow-100 text-yellow-700 text-xs rounded">
                Unverified
              </span>
            )}
          </div>
          <span className="text-xs text-slate-500">{user.email}</span>
        </div>
      ),
    },
    {
      key: "role",
      header: "Role",
      render: (user) => {
        const roleConfig: Record<
          UserRole,
          { label: string; variant: BadgeVariant }
        > = {
          [UserRole.ADMIN]: { label: "Admin", variant: "info" },
          [UserRole.INTERNAL_EXPERT]: {
            label: "Internal Expert",
            variant: "default",
          },
          [UserRole.EXTERNAL_EXPERT]: {
            label: "External Expert",
            variant: "success",
          },
        };
        const config = roleConfig[user.role];
        return <StatusBadge label={config.label} variant={config.variant} />;
      },
    },
    {
      key: "companyName",
      header: "Company",
      render: (user) =>
        user.companyName ? (
          <div className="flex items-center gap-2">
            <Building2 className="w-4 h-4 text-slate-400" />
            <span>{user.companyName}</span>
          </div>
        ) : (
          <span className="text-orange-500 flex items-center gap-1">
            <AlertCircle className="w-4 h-4" />
            Unassigned
          </span>
        ),
    },
    {
      key: "createdAt",
      header: "Registered",
    },
    {
      key: "actions",
      header: "",
      render: (user) => (
        <div className="flex items-center gap-2">
          <button
            onClick={() => openEditModal(user)}
            className="p-2 hover:bg-slate-100 rounded-lg text-slate-400 hover:text-main-blue"
            title="Edit user"
          >
            <Edit className="w-4 h-4" />
          </button>
          <button
            onClick={() => openDeleteModal(user)}
            className="p-2 hover:bg-red-50 rounded-lg text-slate-400 hover:text-red-500"
            title="Delete user"
          >
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
        title="User Management"
        description="View and assign companies to registered users"
        icon={Users}
      />

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-white rounded-xl p-4 border border-slate-200">
          <p className="text-sm text-slate-500">Total Users</p>
          <p className="text-2xl font-bold text-slate-800">{users.length}</p>
        </div>
        <div className="bg-white rounded-xl p-4 border border-slate-200">
          <p className="text-sm text-slate-500">Assigned</p>
          <p className="text-2xl font-bold text-green-600">{assignedCount}</p>
        </div>
        <div className="bg-white rounded-xl p-4 border border-slate-200">
          <p className="text-sm text-slate-500">Unassigned</p>
          <p className="text-2xl font-bold text-orange-500">
            {unassignedCount}
          </p>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-2">
        {(["all", "unassigned", "assigned"] as FilterType[]).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              filter === f
                ? "bg-main-blue text-white"
                : "bg-white border border-slate-200 text-slate-600 hover:bg-slate-50"
            }`}
          >
            {f === "all" && `All (${users.length})`}
            {f === "unassigned" && `Unassigned (${unassignedCount})`}
            {f === "assigned" && `Assigned (${assignedCount})`}
          </button>
        ))}
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-xl p-6 border border-slate-200">
        <SectionHeader title="Registered Users" />
        <DataTable
          data={filteredUsers}
          columns={columns}
          keyField="id"
          searchPlaceholder="Search users..."
          searchFields={["firstName", "lastName", "email", "companyName"]}
          pageSize={10}
          emptyMessage="No users found"
        />
      </div>

      {/* Edit User Modal */}
      <Modal open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
        <ModalContent size="md">
          <ModalHeader>
            <ModalTitle>Edit User</ModalTitle>
            <ModalDescription>
              Assign company and role to{" "}
              <strong>
                {selectedUser?.firstName} {selectedUser?.lastName}
              </strong>
            </ModalDescription>
          </ModalHeader>

          <div className="flex flex-col gap-4 py-4">
            {/* Role */}
            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium text-slate-700">Role</label>
              <select
                value={editForm.role}
                onChange={(e) =>
                  setEditForm({ ...editForm, role: e.target.value as UserRole })
                }
                className="px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-main-blue/20 focus:border-main-blue"
              >
                <option value={UserRole.INTERNAL_EXPERT}>
                  Internal Expert
                </option>
                <option value={UserRole.EXTERNAL_EXPERT}>
                  External Expert
                </option>
                <option value={UserRole.ADMIN}>Admin</option>
              </select>
            </div>

            {/* Company */}
            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium text-slate-700">
                Assign Company
              </label>
              <select
                value={editForm.companyId ?? ""}
                onChange={(e) =>
                  setEditForm({
                    ...editForm,
                    companyId: e.target.value ? Number(e.target.value) : null,
                  })
                }
                className="px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-main-blue/20 focus:border-main-blue"
              >
                <option value="">-- No Company --</option>
                {mockCompanies.map((company) => (
                  <option key={company.id} value={company.id}>
                    {company.name}
                  </option>
                ))}
              </select>
              <p className="text-xs text-slate-500">
                Internal Experts belong to one company. External Experts audit
                assigned companies.
              </p>
            </div>
          </div>

          <ModalFooter>
            <button
              onClick={() => setIsEditModalOpen(false)}
              className="px-4 py-2 border border-slate-200 rounded-lg text-slate-600 hover:bg-slate-50"
            >
              Cancel
            </button>
            <button
              onClick={handleSaveUser}
              className="px-4 py-2 bg-main-blue text-white rounded-lg hover:bg-main-blue/90"
            >
              Save Changes
            </button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal open={isDeleteModalOpen} onOpenChange={setIsDeleteModalOpen}>
        <ModalContent size="sm">
          <ModalHeader>
            <ModalTitle>Delete User</ModalTitle>
            <ModalDescription>
              Are you sure you want to delete{" "}
              <strong>
                {selectedUser?.firstName} {selectedUser?.lastName}
              </strong>
              ? This action cannot be undone.
            </ModalDescription>
          </ModalHeader>

          <ModalFooter>
            <button
              onClick={() => setIsDeleteModalOpen(false)}
              className="px-4 py-2 border border-slate-200 rounded-lg text-slate-600 hover:bg-slate-50"
            >
              Cancel
            </button>
            <button
              onClick={handleDeleteUser}
              className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600"
            >
              Delete
            </button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </div>
  );
}
