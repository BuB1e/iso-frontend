import { useState } from "react";
import { Settings, User, Save, Camera } from "lucide-react";
import { PageHeader, SectionHeader } from "~/components/ui/pageHeader";
import { useUserStore } from "~/stores/userStore";
import { userRoleConfig } from "~/types";

export default function SettingsPage() {
  const currentUser = useUserStore((state) => state.currentUser);

  if (!currentUser) {
    return <div>Loading...</div>;
  }

  return (
    <div className="flex flex-col min-h-screen py-8 px-8 lg:px-16 bg-slate-50/50 gap-6">
      <PageHeader
        title="Settings"
        description="Manage your account profile"
        icon={Settings}
      />

      {/* Profile Section */}
      <ProfileSettings user={currentUser} />
    </div>
  );
}

function ProfileSettings({
  user,
}: {
  user: {
    firstName: string;
    lastName: string;
    email: string;
    role: import("~/types").UserRole;
  };
}) {
  const [firstName, setFirstName] = useState(user.firstName);
  const [lastName, setLastName] = useState(user.lastName);
  const [email, setEmail] = useState(user.email);

  const roleConfig = userRoleConfig[user.role];

  const handleSave = () => {
    // TODO: API call to update profile
    console.log("Saving profile:", { firstName, lastName, email });
    alert("Profile updated successfully!");
  };

  return (
    <div className="bg-white rounded-xl p-6 border border-slate-200">
      <SectionHeader
        title="Profile Information"
        description="Update your personal details"
      />

      <div className="flex flex-col gap-6 mt-6">
        {/* Avatar */}
        <div className="flex items-center gap-6">
          <div className="relative">
            <img
              src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQ4YreOWfDX3kK-QLAbAL4ufCPc84ol2MA8Xg&s"
              alt="Profile"
              className="w-24 h-24 rounded-full"
            />
            <button className="absolute bottom-0 right-0 p-2 bg-main-blue text-white rounded-full shadow-lg hover:bg-main-blue/90">
              <Camera className="w-4 h-4" />
            </button>
          </div>
          <div>
            <h3 className="text-lg font-semibold text-slate-800">
              {user.firstName} {user.lastName}
            </h3>
            <span
              className={`inline-block px-2 py-1 rounded text-xs font-medium mt-1 ${roleConfig.bgColor} ${roleConfig.color}`}
            >
              {roleConfig.label}
            </span>
          </div>
        </div>

        {/* Form */}
        <div className="grid grid-cols-2 gap-4">
          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium text-slate-700">
              First Name
            </label>
            <input
              type="text"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              className="px-4 py-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-main-blue/20 focus:border-main-blue"
            />
          </div>
          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium text-slate-700">
              Last Name
            </label>
            <input
              type="text"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              className="px-4 py-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-main-blue/20 focus:border-main-blue"
            />
          </div>
        </div>

        <div className="flex flex-col gap-2">
          <label className="text-sm font-medium text-slate-700">Email</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="px-4 py-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-main-blue/20 focus:border-main-blue"
          />
        </div>

        <div className="flex justify-end">
          <button
            onClick={handleSave}
            className="flex items-center gap-2 px-6 py-2.5 bg-main-blue text-white rounded-lg hover:bg-main-blue/90 transition-colors"
          >
            <Save className="w-4 h-4" />
            Save Changes
          </button>
        </div>
      </div>
    </div>
  );
}
