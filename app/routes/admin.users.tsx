import { useEffect, useState } from "react";
import {
  useLoaderData,
  useActionData,
  Form,
  useNavigation,
} from "react-router";
import type { ActionFunctionArgs } from "react-router";
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
import { UserService } from "~/services/UserService";
import { CompanyService } from "~/services/CompanyService";
import type { UserResponseDto, CompanyResponseDto } from "~/dto";
import { useUserFormStore, useUserStore } from "~/stores";
import { UserRole } from "~/types";

// Extended interface for DataTable compatibility
interface AdminUser extends UserResponseDto {
  [key: string]: unknown;
  companyName?: string | null;
}

// Loader - fetch users and companies
export async function loader() {
  const [users, companies] = await Promise.all([
    UserService.getAllUser(),
    CompanyService.getAllCompany(),
  ]);

  // Enrich users with company names
  const companyMap = new Map(companies.map((c) => [c.id, c.name]));
  const enrichedUsers: AdminUser[] = (users || []).map((user) => ({
    ...user,
    companyName: user.companyId ? companyMap.get(user.companyId) || null : null,
  }));

  return { users: enrichedUsers, companies };
}

// Action - handle form submissions
export async function action({ request }: ActionFunctionArgs) {
  const formData = await request.formData();
  const intent = formData.get("intent") as string;

  try {
    if (intent === "update") {
      const result = await UserService.updateUserById({
        id: formData.get("id") as string,
        role: formData.get("role") as UserRole,
        companyId: formData.get("companyId")
          ? Number(formData.get("companyId"))
          : undefined,
      });
      return { success: !!result, intent };
    }

    if (intent === "delete") {
      const result = await UserService.deleteUserById(
        formData.get("id") as string,
      );
      return { success: result, intent };
    }

    return { success: false, error: "Unknown intent" };
  } catch (error) {
    return { success: false, error: String(error) };
  }
}

type FilterType = "all" | "unassigned" | "assigned";

export default function AdminUsers() {
  const { users, companies } = useLoaderData<typeof loader>();
  const actionData = useActionData<typeof action>();
  const navigation = useNavigation();
  const isSubmitting = navigation.state === "submitting";

  // Zustand form store
  const { role, companyId, editingId, setField, startEdit, reset } =
    useUserFormStore();
  const loggedInUser = useUserStore((state) => state.currentUser);

  // Filter state
  const [filter, setFilter] = useState<FilterType>("all");

  // Clear form after successful action
  useEffect(() => {
    if (actionData?.success) {
      reset();
    }
  }, [actionData, reset]);

  // Modal state
  const isModalOpen = editingId !== null;

  const openEditModal = (user: AdminUser) => {
    startEdit(user.id, user.role, user.companyId || null);
  };

  // Filter users based on logged-in user's company scope
  const scopedUsers = users.filter((user) => {
    // 1. Admin sees all users
    if (loggedInUser?.role === UserRole.ADMIN) return true;
    // 2. Company Users see only users from same company
    if (loggedInUser?.companyId)
      return user.companyId === loggedInUser.companyId;
    // 3. Unassigned users see nothing
    return false;
  });

  // Apply UI filters to the scoped list
  const filteredUsers = scopedUsers.filter((user) => {
    if (filter === "unassigned") return user.companyId === null;
    if (filter === "assigned") return user.companyId !== null;
    return true;
  });

  // Stats
  const unassignedCount = users.filter((u) => u.companyId === null).length;
  const assignedCount = users.filter((u) => u.companyId !== null).length;

  const columns: Column<AdminUser>[] = [
    {
      key: "name",
      header: "User",
      render: (user) => (
        <div className="flex flex-col">
          <span className="font-medium text-slate-800">
            {user.firstName} {user.lastName}
          </span>
          <span className="text-xs text-slate-500">{user.email}</span>
        </div>
      ),
    },
    {
      key: "role",
      header: "Role",
      render: (user) => {
        const roleConfig: Record<
          string,
          { label: string; variant: BadgeVariant }
        > = {
          ADMIN: { label: "Admin", variant: "info" },
          INTERNAL_EXPERT: { label: "Internal Expert", variant: "default" },
          EXTERNAL_EXPERT: { label: "External Expert", variant: "success" },
        };
        const config = roleConfig[user.role] || roleConfig.INTERNAL_EXPERT;
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
      render: (user) => (
        <span className="text-sm text-slate-500">
          {new Date(user.createdAt).toLocaleDateString()}
        </span>
      ),
    },
    {
      key: "actions",
      header: "",
      render: (user) => (
        <div className="flex items-center gap-2">
          <button
            onClick={() => openEditModal(user)}
            className="p-2 hover:bg-slate-100 rounded-lg text-slate-400 hover:text-main-blue"
          >
            <Edit className="w-4 h-4" />
          </button>
          <Form method="post">
            <input type="hidden" name="intent" value="delete" />
            <input type="hidden" name="id" value={user.id} />
            <button
              type="submit"
              className="p-2 hover:bg-red-50 rounded-lg text-slate-400 hover:text-red-500"
              onClick={(e) => {
                if (!confirm("Delete this user?")) e.preventDefault();
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
      <Modal open={isModalOpen} onOpenChange={(open) => !open && reset()}>
        <ModalContent size="md">
          <ModalHeader>
            <ModalTitle>Edit User</ModalTitle>
            <ModalDescription>
              Assign company and role to this user
            </ModalDescription>
          </ModalHeader>

          <Form method="post">
            <input type="hidden" name="intent" value="update" />
            <input type="hidden" name="id" value={editingId || ""} />

            <div className="flex flex-col gap-4 py-4">
              {/* Role */}
              <div className="flex flex-col gap-2">
                <label className="text-sm font-medium text-slate-700">
                  Role
                </label>
                <select
                  name="role"
                  value={role}
                  onChange={(e) => setField("role", e.target.value as UserRole)}
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
                  name="companyId"
                  value={companyId ?? ""}
                  onChange={(e) =>
                    setField(
                      "companyId",
                      e.target.value ? Number(e.target.value) : null,
                    )
                  }
                  className="px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-main-blue/20 focus:border-main-blue"
                >
                  <option value="">-- No Company --</option>
                  {companies.map((company: CompanyResponseDto) => (
                    <option key={company.id} value={company.id}>
                      {company.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <ModalFooter>
              <button
                type="button"
                onClick={reset}
                className="px-4 py-2 border border-slate-200 rounded-lg text-slate-600 hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-4 py-2 bg-main-blue text-white rounded-lg hover:bg-main-blue/90 disabled:opacity-50"
              >
                {isSubmitting ? "Saving..." : "Save Changes"}
              </button>
            </ModalFooter>
          </Form>
        </ModalContent>
      </Modal>
    </div>
  );
}
