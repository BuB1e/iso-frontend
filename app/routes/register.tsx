import { useState } from "react";
import { useNavigate, Link } from "react-router";
import { authClient } from "~/lib/auth-client";
import { Loader2, Lock, Mail, User } from "lucide-react";
import { UserRole } from "~/types";

export default function Register() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    await authClient.signUp.email(
      {
        email,
        password,
        name: firstName,
		role: UserRole.EXTERNAL_EXPERT,
        lastName,
      } as any,
      {
        onSuccess: () => {
          navigate("/dashboard");
        },
        onError: (ctx) => {
          setError(ctx.error.message);
          setIsLoading(false);
        },
      },
    );
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <h2 className="mt-6 text-center text-3xl font-extrabold text-slate-900">
          Create your account
        </h2>
        <p className="mt-2 text-center text-sm text-slate-600">
          Already have an account?{" "}
          <Link
            to="/login"
            className="font-medium text-main-blue hover:text-main-blue/90"
          >
            Sign in
          </Link>
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10 border border-slate-200">
          <form className="space-y-6" onSubmit={handleRegister}>
            <div className="flex gap-4">
              <div className="flex-1">
                <label
                  htmlFor="firstName"
                  className="block text-sm font-medium text-slate-700"
                >
                  First Name
                </label>
                <div className="mt-1 relative rounded-md shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <User className="h-5 w-5 text-slate-400" />
                  </div>
                  <input
                    id="firstName"
                    name="firstName"
                    type="text"
                    required
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    className="block w-full pl-10 sm:text-sm border-slate-300 rounded-md focus:ring-main-blue focus:border-main-blue p-2 border"
                    placeholder="John"
                  />
                </div>
              </div>

              <div className="flex-1">
                <label
                  htmlFor="lastName"
                  className="block text-sm font-medium text-slate-700"
                >
                  Last Name
                </label>
                <div className="mt-1 relative rounded-md shadow-sm">
                  <input
                    id="lastName"
                    name="lastName"
                    type="text"
                    required
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    className="block w-full sm:text-sm border-slate-300 rounded-md focus:ring-main-blue focus:border-main-blue p-2 border"
                    placeholder="Doe"
                  />
                </div>
              </div>
            </div>

            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-slate-700"
              >
                Email address
              </label>
              <div className="mt-1 relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-slate-400" />
                </div>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="block w-full pl-10 sm:text-sm border-slate-300 rounded-md focus:ring-main-blue focus:border-main-blue p-2 border"
                  placeholder="you@example.com"
                />
              </div>
            </div>

            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium text-slate-700"
              >
                Password
              </label>
              <div className="mt-1 relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-slate-400" />
                </div>
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="new-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="block w-full pl-10 sm:text-sm border-slate-300 rounded-md focus:ring-main-blue focus:border-main-blue p-2 border"
                  minLength={8}
                />
              </div>
            </div>

            {error && (
              <div className="rounded-md bg-red-50 p-4">
                <div className="flex">
                  <div className="ml-3">
                    <h3 className="text-sm font-medium text-red-800">
                      Registration failed
                    </h3>
                    <div className="mt-2 text-sm text-red-700">
                      <p>{error}</p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            <div>
              <button
                type="submit"
                disabled={
                  isLoading || !firstName || !lastName || !email || !password
                }
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-main-blue hover:bg-main-blue/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-main-blue disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              >
                {isLoading ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  "Create Account"
                )}
              </button>
              {(!firstName || !lastName || !email || !password) && (
                <p className="text-xs text-center text-slate-400 mt-2">
                  Please fill all fields to continue
                </p>
              )}
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
