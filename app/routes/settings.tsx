import { useEffect } from "react";
import { useActionData, Form, useNavigation } from "react-router";
import type { ActionFunctionArgs } from "react-router";
import { Settings, User, Save, Camera } from "lucide-react";
import { PageHeader, SectionHeader } from "~/components/ui/pageHeader";
import { UserService } from "~/services";
import { useUserStore } from "~/stores/userStore";
import { useProfileFormStore } from "~/stores";
import { userRoleConfig, UserRole } from "~/types";

// Action - handle profile update
export async function action({ request }: ActionFunctionArgs) {
  const formData = await request.formData();
  const intent = formData.get("intent") as string;

  if (intent === "updateProfile") {
    const id = formData.get("id") as string;
    const firstName = formData.get("firstName") as string;
    const lastName = formData.get("lastName") as string;
    const email = formData.get("email") as string;

    const result = await UserService.updateUserById({
      id,
      firstName,
      lastName,
      email,
    });

    return { success: !!result, intent };
  }

  return { success: false };
}

export default function SettingsPage() {
  const currentUser = useUserStore((state) => state.currentUser);
  const actionData = useActionData<typeof action>();
  const navigation = useNavigation();
  const isSubmitting = navigation.state === "submitting";

  // Zustand form store
  const { firstName, lastName, email, isDirty, setField, loadProfile, reset } =
    useProfileFormStore();

  // Load profile into form when user changes
  useEffect(() => {
    if (currentUser) {
      loadProfile({
        firstName: currentUser.firstName,
        lastName: currentUser.lastName,
        email: currentUser.email,
      });
    }
  }, [currentUser, loadProfile]);

  // Reset form after successful save
  useEffect(() => {
    if (actionData?.success) {
      reset();
      if (currentUser) {
        loadProfile({
          firstName: currentUser.firstName,
          lastName: currentUser.lastName,
          email: currentUser.email,
        });
      }
    }
  }, [actionData, reset, currentUser, loadProfile]);

  // Set page title
  useEffect(() => {
    document.title = "Settings | ISO Portal";
    return () => {
      document.title = "ISO Portal";
    };
  }, []);

  if (!currentUser) {
    return <div>Loading...</div>;
  }

  const roleConfig = userRoleConfig[currentUser.role as UserRole];

  return (
    <div className="flex flex-col min-h-screen py-8 px-8 lg:px-16 bg-slate-50/50 gap-6">
      <PageHeader
        title="Settings"
        description="Manage your account profile"
        icon={Settings}
      />

      {/* Profile Section */}
      <div className="bg-white rounded-xl p-6 border border-slate-200">
        <SectionHeader
          title="Profile Information"
          description="Update your personal details"
        />

        <Form method="post" className="flex flex-col gap-6 mt-6">
          <input type="hidden" name="intent" value="updateProfile" />
          <input type="hidden" name="id" value={currentUser.id} />

          {/* Avatar */}
          <div className="flex items-center gap-6">
            <div className="relative">
              <img
                src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQ4YreOWfDX3kK-QLAbAL4ufCPc84ol2MA8Xg&s"
                alt="Profile"
                className="w-24 h-24 rounded-full"
              />
              <button
                type="button"
                className="absolute bottom-0 right-0 p-2 bg-main-blue text-white rounded-full shadow-lg hover:bg-main-blue/90"
              >
                <Camera className="w-4 h-4" />
              </button>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-slate-800">
                {currentUser.firstName} {currentUser.lastName}
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
                name="firstName"
                value={firstName}
                onChange={(e) => setField("firstName", e.target.value)}
                className="px-4 py-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-main-blue/20 focus:border-main-blue"
              />
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium text-slate-700">
                Last Name
              </label>
              <input
                type="text"
                name="lastName"
                value={lastName}
                onChange={(e) => setField("lastName", e.target.value)}
                className="px-4 py-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-main-blue/20 focus:border-main-blue"
              />
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium text-slate-700">
              Email (Cannot be changed)
            </label>
            <input
              type="email"
              name="email"
              disabled={true}
              value={email}
              onChange={(e) => setField("email", e.target.value)}
              className="px-4 py-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-main-blue/20 focus:border-main-blue"
            />
          </div>

          <div className="flex justify-end">
            <button
              type="submit"
              disabled={isSubmitting || !isDirty}
              className="flex items-center gap-2 px-6 py-2.5 bg-main-blue text-white rounded-lg hover:bg-main-blue/90 transition-colors disabled:opacity-50"
            >
              <Save className="w-4 h-4" />
              {isSubmitting ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </Form>
      </div>
    </div>
  );
}
