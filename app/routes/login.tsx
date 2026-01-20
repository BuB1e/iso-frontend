import { useState } from "react";
import { useNavigate } from "react-router";
import {
  Mail,
  Lock,
  User,
  Eye,
  EyeOff,
  ArrowRight,
  ShieldCheck,
  TestTube,
} from "lucide-react";
import { useUserStore } from "~/stores/userStore";
import { UserRole } from "~/types";

export default function AuthPage() {
  const [isLogin, setIsLogin] = useState<boolean>(true);
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [showTestLogin, setShowTestLogin] = useState<boolean>(true); // Dev mode
  const navigate = useNavigate();
  const setRole = useUserStore((state) => state.setRole);

  // Form state
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // Better Auth API endpoint
      const endpoint = isLogin
        ? "/api/auth/sign-in/email"
        : "/api/auth/sign-up/email";

      const body = isLogin ? { email, password } : { email, password, name };

      const response = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
        credentials: "include",
      });

      if (response.ok) {
        navigate("/dashboard");
      } else {
        const data = await response.json();
        alert(data.message || "Authentication failed");
      }
    } catch (error) {
      console.error("Auth error:", error);
      alert("An error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSocialAuth = (provider: string) => {
    // Better Auth social authentication
    window.location.href = `/api/auth/sign-in/${provider}`;
  };

  // Test login with role selection
  const handleTestLogin = (role: UserRole) => {
    setRole(role);
    navigate("/dashboard");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-light-brown via-secondary-brown to-main-brown flex items-center justify-center p-4 relative overflow-hidden">
      {/* Decorative background elements */}
      <div className="absolute top-0 left-0 w-96 h-96 bg-main-blue/5 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2" />
      <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-secondary-blue/10 rounded-full blur-3xl translate-x-1/3 translate-y-1/3" />
      <div className="absolute top-1/2 left-1/4 w-64 h-64 bg-main-brown/20 rounded-full blur-2xl" />

      {/* Main card */}
      <div className="w-full max-w-md relative">
        {/* Glass card effect */}
        <div className="backdrop-blur-xl bg-main-gray/80 rounded-3xl shadow-2xl border border-white/20 overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-main-blue to-secondary-blue p-8 text-center relative overflow-hidden">
            {/* Decorative shapes in header */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2" />
            <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/5 rounded-full translate-y-1/2 -translate-x-1/2" />

            <div className="relative z-10">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-white/20 rounded-2xl mb-4 backdrop-blur-sm">
                <ShieldCheck className="w-8 h-8 text-white" />
              </div>
              <h1 className="text-2xl font-bold text-white mb-1">
                {isLogin ? "Welcome Back" : "Create Account"}
              </h1>
              <p className="text-white/80 text-sm">
                {isLogin
                  ? "Sign in to access your ISO 27001 dashboard"
                  : "Join us to manage your compliance journey"}
              </p>
            </div>
          </div>

          {/* Test Login Section - Dev Mode */}
          {showTestLogin && (
            <div className="p-4 bg-purple-50 border-b border-purple-100">
              <div className="flex items-center gap-2 mb-3">
                <TestTube className="w-4 h-4 text-purple-600" />
                <span className="text-sm font-medium text-purple-700">
                  Test Mode - Select Role
                </span>
              </div>
              <div className="grid grid-cols-3 gap-2">
                <button
                  onClick={() => handleTestLogin(UserRole.ADMIN)}
                  className="px-3 py-2 bg-purple-600 text-white rounded-lg text-sm font-medium hover:bg-purple-700 transition-colors"
                >
                  Admin
                </button>
                <button
                  onClick={() => handleTestLogin(UserRole.INTERNAL_EXPERT)}
                  className="px-3 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
                >
                  Internal
                </button>
                <button
                  onClick={() => handleTestLogin(UserRole.EXTERNAL_EXPERT)}
                  className="px-3 py-2 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-700 transition-colors"
                >
                  External
                </button>
              </div>
            </div>
          )}

          {/* Form */}
          <div className="p-8">
            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Name field - only for registration */}
              {!isLogin && (
                <div className="space-y-2">
                  <label className="text-sm font-medium text-main-blue">
                    Full Name
                  </label>
                  <div className="relative group">
                    <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-secondary-blue group-focus-within:text-main-blue transition-colors" />
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full pl-12 pr-4 py-3.5 bg-white/50 border border-secondary-brown/30 rounded-xl focus:outline-none focus:ring-2 focus:ring-main-blue/30 focus:border-main-blue transition-all duration-200 text-main-blue placeholder:text-secondary-blue/50"
                      placeholder="John Doe"
                      required={!isLogin}
                    />
                  </div>
                </div>
              )}

              {/* Email field */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-main-blue">
                  Email Address
                </label>
                <div className="relative group">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-secondary-blue group-focus-within:text-main-blue transition-colors" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-12 pr-4 py-3.5 bg-white/50 border border-secondary-brown/30 rounded-xl focus:outline-none focus:ring-2 focus:ring-main-blue/30 focus:border-main-blue transition-all duration-200 text-main-blue placeholder:text-secondary-blue/50"
                    placeholder="your@email.com"
                    required
                  />
                </div>
              </div>

              {/* Password field */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-main-blue">
                  Password
                </label>
                <div className="relative group">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-secondary-blue group-focus-within:text-main-blue transition-colors" />
                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-12 pr-12 py-3.5 bg-white/50 border border-secondary-brown/30 rounded-xl focus:outline-none focus:ring-2 focus:ring-main-blue/30 focus:border-main-blue transition-all duration-200 text-main-blue placeholder:text-secondary-blue/50"
                    placeholder="••••••••"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-secondary-blue hover:text-main-blue transition-colors"
                  >
                    {showPassword ? (
                      <EyeOff className="w-5 h-5" />
                    ) : (
                      <Eye className="w-5 h-5" />
                    )}
                  </button>
                </div>
              </div>

              {/* Forgot password link */}
              {isLogin && (
                <div className="text-right">
                  <a
                    href="#"
                    className="text-sm text-main-blue hover:text-secondary-blue transition-colors"
                  >
                    Forgot password?
                  </a>
                </div>
              )}

              {/* Submit button */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3.5 bg-gradient-to-r from-main-blue to-secondary-blue text-white font-semibold rounded-xl hover:shadow-lg hover:shadow-main-blue/25 transition-all duration-300 flex items-center justify-center gap-2 group disabled:opacity-70"
              >
                {isLoading ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    {isLogin ? "Sign In" : "Create Account"}
                    <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </>
                )}
              </button>
            </form>

            {/* Divider */}
            <div className="my-6 flex items-center gap-4">
              <div className="flex-1 h-px bg-secondary-brown/30" />
              <span className="text-sm text-secondary-blue">
                or continue with
              </span>
              <div className="flex-1 h-px bg-secondary-brown/30" />
            </div>

            {/* Social login buttons */}
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => handleSocialAuth("google")}
                className="flex items-center justify-center gap-2 py-3 bg-white/70 border border-secondary-brown/20 rounded-xl hover:bg-white hover:shadow-md transition-all duration-200"
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  />
                </svg>
                <span className="text-sm font-medium text-main-blue">
                  Google
                </span>
              </button>
              <button
                onClick={() => handleSocialAuth("github")}
                className="flex items-center justify-center gap-2 py-3 bg-white/70 border border-secondary-brown/20 rounded-xl hover:bg-white hover:shadow-md transition-all duration-200"
              >
                <svg className="w-5 h-5" fill="#1F2937" viewBox="0 0 24 24">
                  <path
                    fillRule="evenodd"
                    d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"
                    clipRule="evenodd"
                  />
                </svg>
                <span className="text-sm font-medium text-main-blue">
                  GitHub
                </span>
              </button>
            </div>

            {/* Toggle login/register */}
            <p className="mt-6 text-center text-sm text-secondary-blue">
              {isLogin ? "Don't have an account?" : "Already have an account?"}{" "}
              <button
                onClick={() => setIsLogin(!isLogin)}
                className="text-main-blue font-semibold hover:underline"
              >
                {isLogin ? "Sign up" : "Sign in"}
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
