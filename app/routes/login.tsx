import { useState } from "react";
import { useNavigate } from "react-router";
import { Mail, Lock, User, Eye, EyeOff, ArrowRight, ShieldCheck } from "lucide-react";

export default function AuthPage() {
	const [isLogin, setIsLogin] = useState<boolean>(true);
	const [showPassword, setShowPassword] = useState<boolean>(false);
	const [isLoading, setIsLoading] = useState<boolean>(false);
	const navigate = useNavigate();

	// Form state
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const [name, setName] = useState("");

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setIsLoading(true);

		try {
			// Better Auth API endpoint
			const endpoint = isLogin ? "/api/auth/sign-in/email" : "/api/auth/sign-up/email";

			const body = isLogin
				? { email, password }
				: { email, password, name };

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

					{/* Form */}
					<div className="p-8">
						<form onSubmit={handleSubmit} className="space-y-5">
							{/* Name field - only for registration */}
							{!isLogin && (
								<div className="space-y-2">
									<label className="text-sm font-medium text-main-blue">Full Name</label>
									<div className="relative group">
										<User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-secondary-blue group-focus-within:text-main-blue transition-colors" />
										<input
											type="text"
											value={name}
											onChange={(e) => setName(e.target.value)}
											placeholder="John Doe"
											required={!isLogin}
											className="w-full pl-12 pr-4 py-3.5 bg-light-brown/50 border border-secondary-brown rounded-xl text-main-blue placeholder:text-secondary-blue/60 focus:outline-none focus:ring-2 focus:ring-main-blue/20 focus:border-main-blue transition-all duration-200"
										/>
									</div>
								</div>
							)}

							{/* Email field */}
							<div className="space-y-2">
								<label className="text-sm font-medium text-main-blue">Email Address</label>
								<div className="relative group">
									<Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-secondary-blue group-focus-within:text-main-blue transition-colors" />
									<input
										type="email"
										value={email}
										onChange={(e) => setEmail(e.target.value)}
										placeholder="you@company.com"
										required
										className="w-full pl-12 pr-4 py-3.5 bg-light-brown/50 border border-secondary-brown rounded-xl text-main-blue placeholder:text-secondary-blue/60 focus:outline-none focus:ring-2 focus:ring-main-blue/20 focus:border-main-blue transition-all duration-200"
									/>
								</div>
							</div>

							{/* Password field */}
							<div className="space-y-2">
								<label className="text-sm font-medium text-main-blue">Password</label>
								<div className="relative group">
									<Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-secondary-blue group-focus-within:text-main-blue transition-colors" />
									<input
										type={showPassword ? "text" : "password"}
										value={password}
										onChange={(e) => setPassword(e.target.value)}
										placeholder="••••••••"
										required
										className="w-full pl-12 pr-12 py-3.5 bg-light-brown/50 border border-secondary-brown rounded-xl text-main-blue placeholder:text-secondary-blue/60 focus:outline-none focus:ring-2 focus:ring-main-blue/20 focus:border-main-blue transition-all duration-200"
									/>
									<button
										type="button"
										onClick={() => setShowPassword(!showPassword)}
										className="absolute right-4 top-1/2 -translate-y-1/2 text-secondary-blue hover:text-main-blue transition-colors"
									>
										{showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
									</button>
								</div>
							</div>

							{/* Forgot password link - only for login */}
							{isLogin && (
								<div className="text-right">
									<a href="/forgot-password" className="text-sm text-secondary-blue hover:text-main-blue transition-colors">
										Forgot password?
									</a>
								</div>
							)}

							{/* Submit button */}
							<button
								type="submit"
								disabled={isLoading}
								className="w-full py-3.5 bg-gradient-to-r from-main-blue to-secondary-blue text-white font-semibold rounded-xl shadow-lg shadow-main-blue/25 hover:shadow-xl hover:shadow-main-blue/30 hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed disabled:hover:scale-100"
							>
								{isLoading ? (
									<div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
								) : (
									<>
										{isLogin ? "Sign In" : "Create Account"}
										<ArrowRight className="w-5 h-5" />
									</>
								)}
							</button>
						</form>

						{/* Divider */}
						<div className="flex items-center gap-4 my-6">
							<div className="flex-1 h-px bg-gradient-to-r from-transparent via-secondary-brown to-transparent" />
							<span className="text-sm text-secondary-blue">or continue with</span>
							<div className="flex-1 h-px bg-gradient-to-r from-transparent via-secondary-brown to-transparent" />
						</div>

						{/* Social auth buttons */}
						<div className="grid grid-cols-2 gap-3">
							<button
								type="button"
								onClick={() => handleSocialAuth("google")}
								className="flex items-center justify-center gap-2 py-3 bg-light-brown/50 border border-secondary-brown rounded-xl hover:bg-secondary-brown/50 hover:border-main-brown transition-all duration-200"
							>
								<svg className="w-5 h-5" viewBox="0 0 24 24">
									<path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
									<path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
									<path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
									<path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
								</svg>
								<span className="text-sm font-medium text-main-blue">Google</span>
							</button>
							<button
								type="button"
								onClick={() => handleSocialAuth("github")}
								className="flex items-center justify-center gap-2 py-3 bg-light-brown/50 border border-secondary-brown rounded-xl hover:bg-secondary-brown/50 hover:border-main-brown transition-all duration-200"
							>
								<svg className="w-5 h-5" fill="#1A2A80" viewBox="0 0 24 24">
									<path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
								</svg>
								<span className="text-sm font-medium text-main-blue">GitHub</span>
							</button>
						</div>

						{/* Toggle auth mode */}
						<p className="text-center mt-6 text-secondary-blue">
							{isLogin ? "Don't have an account?" : "Already have an account?"}
							<button
								type="button"
								onClick={() => setIsLogin(!isLogin)}
								className="ml-1 font-semibold text-main-blue hover:underline"
							>
								{isLogin ? "Sign up" : "Sign in"}
							</button>
						</p>
					</div>
				</div>

				{/* Footer text */}
				<p className="text-center mt-6 text-sm text-main-blue/60">
					Protected by enterprise-grade security
				</p>
			</div>
		</div>
	);
}
