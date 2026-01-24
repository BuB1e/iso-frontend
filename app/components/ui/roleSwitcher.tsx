import { useNavigate } from "react-router";
import { LogOut } from "lucide-react";
import { authClient } from "~/lib/auth-client";
import { useUserStore } from "~/stores/userStore";
import { userRoleConfig } from "~/types";

/**
 * User Profile Component
 * Shows current user info and logout button
 */
export function RoleSwitcher() {
  const { currentUser } = useUserStore();
  const navigate = useNavigate();

  if (!currentUser) return null;

  const roleConfig = userRoleConfig[currentUser.role];

  return (
    <div className="flex items-center gap-3">
      <div
        className={`px-2 py-1 text-xs font-bold rounded-lg border border-current ${roleConfig.bgColor} ${roleConfig.color}`}
      >
        {roleConfig.label}
      </div>
    </div>
  );
}

/**
 * User Avatar with name display
 */
export function UserAvatar({ showName = true }: { showName?: boolean }) {
  const currentUser = useUserStore((state) => state.currentUser);

  if (!currentUser) return null;

  const initials = `${currentUser.firstName[0]}${currentUser.lastName[0]}`;
  const fullName = `${currentUser.firstName} ${currentUser.lastName}`;

  return (
    <div className="flex items-center gap-3">
      <div className="w-10 h-10 rounded-full bg-main-blue/20 flex items-center justify-center">
        <span className="text-sm font-bold text-main-blue">{initials}</span>
      </div>
      {showName && (
        <div className="flex flex-col">
          <span className="text-sm font-medium text-slate-800">{fullName}</span>
          <span className="text-xs text-slate-500">
            {currentUser.role.replace("_", " ")}
          </span>
        </div>
      )}
    </div>
  );
}
