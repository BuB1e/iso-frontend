import { useUserStore } from "~/stores/userStore";
import { UserRole, userRoleConfig } from "~/types";

/**
 * Role Switcher Component - Development tool for testing different user roles
 * Shows in topbar for easy role switching during development
 */
export function RoleSwitcher() {
  const { currentUser, setRole } = useUserStore();

  if (!currentUser) return null;

  const roleConfig = userRoleConfig[currentUser.role];

  return (
    <div className="flex items-center gap-3">
      <span className="text-xs text-slate-500">Testing as:</span>
      <select
        value={currentUser.role}
        onChange={(e) => setRole(e.target.value as UserRole)}
        className={`px-3 py-1.5 text-xs font-bold rounded-lg border-2 cursor-pointer transition-all
          ${roleConfig.bgColor} ${roleConfig.color} border-current
          hover:opacity-80 focus:outline-none focus:ring-2 focus:ring-offset-1`}
      >
        <option value={UserRole.ADMIN}>ADMIN</option>
        <option value={UserRole.INTERNAL_EXPERT}>INTERNAL EXPERT</option>
        <option value={UserRole.EXTERNAL_EXPERT}>EXTERNAL EXPERT</option>
      </select>
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
