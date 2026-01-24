import {
  PanelRightOpen,
  PanelLeftOpen,
  LayoutDashboard,
  Settings,
  File,
  FileText,
  ShieldCheck,
  LogOut,
  ClipboardList,
  Users,
  Building2,
  ChevronDown,
  ChevronRight,
} from "lucide-react";
import { Link, useNavigate } from "react-router";
import { useCompanyFormStore, useSidebarStore, useUserStore } from "~/stores";
import { authClient } from "~/lib/auth-client";
import { ESidebarPage, UserRole } from "~/types";
import { useState, useEffect } from "react";
import { CompanyService } from "~/services/CompanyService";

interface SidebarItemsProps {
  isOpen: boolean;
  style: { text: string; icon: string; button: string };
  currentPage: ESidebarPage;
  setCurrentPage: (currentPage: ESidebarPage) => void;
}

export default function Sidebar() {
  const { isOpen, currentPage, toggleOpen, setCurrentPage } = useSidebarStore();
  const style = {
    text: "text-main-blue font-bold lg:text-lg text-sm truncate",
    icon: "lg:w-5 lg:h-5 w-4 h-4 font-bold",
    button:
      "rounded-md hover:bg-main-gray shadow-lg transition-colors duration-150",
  };

  return (
    <div
      className={`
      bg-linear-to-r from-main-brown to-secondary-brown
      border-r border-main-brown
      ${isOpen ? "w-64" : "w-20"}
      transition-all duration-300 ease-in-out
      h-screen overflow-hidden py-8
      ${isOpen ? "px-6" : "px-3"}
      sticky top-0 z-50
    `}
    >
      <SidebarOpenButton isOpen={isOpen} setIsOpen={toggleOpen} style={style} />
      <SidebarAvatar isOpen={isOpen} />
      <SidebarItems
        isOpen={isOpen}
        style={style}
        currentPage={currentPage}
        setCurrentPage={setCurrentPage}
      />
      <SignOut isOpen={isOpen} style={style} />
    </div>
  );
}

function SidebarOpenButton({
  isOpen,
  setIsOpen,
  style,
}: {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  style: { text: string; icon: string };
}) {
  return (
    <div className="flex justify-end pb-4">
      {isOpen ? (
        <PanelRightOpen
          className={`${isOpen ? "w-[20%]" : "w-full"} text-main-blue cursor-pointer`}
          onClick={() => setIsOpen(!isOpen)}
        />
      ) : (
        <PanelLeftOpen
          className={`${isOpen ? "w-[20%]" : "w-full"} text-main-blue cursor-pointer`}
          onClick={() => setIsOpen(!isOpen)}
        />
      )}
    </div>
  );
}

function SidebarAvatar({ isOpen }: { isOpen: boolean }) {
  const currentUser = useUserStore((state) => state.currentUser);
  const [companyName, setCompanyName] = useState<string>("");

  useEffect(() => {
    if (currentUser?.companyId) {
      CompanyService.getCompanyById(currentUser.companyId).then((company) => {
        if (company) setCompanyName(company.name);
      });
    } else {
      setCompanyName("");
    }
  }, [currentUser]);

  if (!currentUser) return null;

  const fullName = `${currentUser.firstName} ${currentUser.lastName}`;
  const roleLabel = currentUser.role.replace(/_/g, " ");

  return (
    <div className="w-full border-b-2 border-secondary-brown pb-4">
      <div className="flex items-center justify-center gap-4">
        <img
          src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQ4YreOWfDX3kK-QLAbAL4ufCPc84ol2MA8Xg&s"
          alt="user_avatar"
          className="w-12 h-12 rounded-full border-2 border-white/50 shadow-sm"
        />
        <div className={`flex flex-col text-main-blue ${!isOpen && "hidden"}`}>
          <span className="font-medium">{fullName}</span>
          <span className="text-xs opacity-80">{roleLabel}</span>
          {companyName && (
            <span
              className="text-xs font-semibold mt-0.5 truncate max-w-[140px]"
              title={companyName}
            >
              {companyName}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

function SignOut({
  isOpen,
  style,
}: {
  isOpen: boolean;
  style: { text: string; icon: string; button: string };
}) {
  const navigate = useNavigate();

  const handleLogout = async () => {
    // 1. Clear server session
    await authClient.signOut({
      fetchOptions: {
        onSuccess: () => {
          // 2. Clear client store (optional if store is derived from session, but good for immediate feedback)
          // useUserStore.getState().logout(); // If you want to force clear, but navigation usually handles it

          // 3. Redirect
          navigate("/login");
        },
      },
    });
  };

  return (
    <div className="py-4">
      <button
        onClick={handleLogout}
        className={`flex flex-row ${!isOpen ? "w-fit p-4" : "p-2"} justify-center items-center gap-4
          ${style.text} ${style.button} bg-light-brown w-full cursor-pointer border-none outline-none`}
      >
        <LogOut className={style.icon} />
        <span className={`${!isOpen && "hidden"}`}>Sign Out</span>
      </button>
    </div>
  );
}

function SidebarItems({
  isOpen,
  style,
  currentPage,
  setCurrentPage,
}: SidebarItemsProps) {
  const currentUser = useUserStore((state) => state.currentUser);
  const isAdmin = currentUser?.role === UserRole.ADMIN;
  const [adminExpanded, setAdminExpanded] = useState(false);

  const mainItems = [
    {
      title: "Dashboard",
      url: ESidebarPage.Dashboard,
      icon: LayoutDashboard,
    },
    {
      title: "Assessment",
      url: ESidebarPage.Assessment,
      icon: ShieldCheck,
    },
    {
      title: "Evidence",
      url: ESidebarPage.Evidence,
      icon: File,
    },
    {
      title: "Summary",
      url: ESidebarPage.Summary,
      icon: ClipboardList,
    },
    {
      title: "Settings",
      url: ESidebarPage.Settings,
      icon: Settings,
    },
  ].filter((item) => {
    // Admin sees everything
    if (isAdmin) return true;

    // Users with company see everything
    if (currentUser?.companyId) return true;

    // Unassigned users only see Dashboard and Settings
    return (
      item.url === ESidebarPage.Dashboard || item.url === ESidebarPage.Settings
    );
  });

  const adminItems = [
    {
      title: "Users",
      url: "/admin/users" as ESidebarPage,
      icon: Users,
    },
    {
      title: "Companies",
      url: "/admin/companies" as ESidebarPage,
      icon: Building2,
    },
  ];

  return (
    <div
      className={`flex flex-col h-[80%] justify-start gap-2 py-4 border-b-2 border-secondary-brown pb-4 overflow-y-auto overflow-x-hidden`}
    >
      {/* Main Navigation Items */}
      {mainItems.map((item, index) => (
        <Link
          to={item.url}
          key={index}
          className={`flex items-center justify-center p-3 ${style.button} ${currentPage == item.url ? "bg-main-gray" : "bg-secondary-brown/70"}`}
          onClick={() => setCurrentPage(item.url)}
        >
          <div
            className={`flex items-center ${isOpen ? "justify-start w-full" : "justify-center"} gap-4 ${style.text}`}
          >
            <item.icon className={style.icon} />
            {isOpen && <span className="hidden lg:inline">{item.title}</span>}
          </div>
        </Link>
      ))}

      {/* Admin Section (ADMIN only) */}
      {isAdmin && (
        <>
          {/* Admin Header */}
          <button
            onClick={() => setAdminExpanded(!adminExpanded)}
            className={`flex items-center justify-center p-3 w-full ${style.button} bg-purple-100/50 mt-2`}
          >
            <div
              className={`flex items-center ${isOpen ? "justify-start w-full" : "justify-center"} gap-4 ${style.text} text-purple-700`}
            >
              <Settings className={style.icon} />
              {isOpen && <span className="hidden lg:inline">Admin</span>}
            </div>
            {isOpen &&
              (adminExpanded ? (
                <ChevronDown className="w-4 h-4 text-purple-700" />
              ) : (
                <ChevronRight className="w-4 h-4 text-purple-700" />
              ))}
          </button>

          {/* Admin Sub-items */}
          {adminExpanded &&
            adminItems.map((item, index) => (
              <Link
                to={item.url}
                key={`admin-${index}`}
                className={`flex items-center justify-center p-3 ${isOpen ? "pl-6" : ""} ${style.button} ${currentPage === item.url ? "bg-purple-100" : "bg-purple-50/50"}`}
                onClick={() => setCurrentPage(item.url)}
              >
                <div
                  className={`flex items-center ${isOpen ? "justify-start w-full" : "justify-center"} gap-4 text-purple-700 font-medium text-sm`}
                >
                  <item.icon className={style.icon} />
                  {isOpen && (
                    <span className="hidden lg:inline">{item.title}</span>
                  )}
                </div>
              </Link>
            ))}
        </>
      )}
    </div>
  );
}
