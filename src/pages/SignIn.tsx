import { useAuthActions } from "@convex-dev/auth/react";
import { useState } from "react";
import { Mail, Lock, Sparkles, ArrowRight, User } from "lucide-react";

export default function SignIn() {
  const { signIn } = useAuthActions();
  const [flow, setFlow] = useState<"signIn" | "signUp">("signIn");
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (flow === "signUp" && password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);
    try {
      await signIn("password", { email, password, flow, name });
    } catch {
      setError("Invalid credentials. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex bg-slate-50 overflow-hidden">
      {/* Left Side: Brand & Visuals (Flat Dark Theme) */}
      <div className="hidden lg:flex lg:w-1/2 relative bg-slate-950 items-center justify-center p-12 overflow-hidden border-r border-slate-900 shadow-2xl">
        <div className="relative z-10 max-w-lg text-center">
          <div className="flex items-center gap-3 mb-10 justify-center">
            <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center shadow-lg shadow-primary/20">
              <Sparkles className="w-6 h-6 text-white" />
            </div>
            <span className="text-2xl font-black text-white tracking-tight">Trackply</span>
          </div>
          
          <h1 className="text-4xl xl:text-5xl font-black text-white mb-6 leading-[1.1] tracking-tight">
            The intelligent center for your <span className="text-primary italic font-serif">career growth.</span>
          </h1>
          <p className="text-lg text-slate-400 leading-relaxed font-medium">
            Manage your professional journey with integrated AI tools in one clean workspace.
          </p>
        </div>
      </div>

      {/* Right Side: Auth Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8">
        <div className="w-full max-w-[400px] animate-in fade-in slide-in-from-right-4 duration-700">
          <div className="mb-10 text-center lg:text-left">
            <div className="lg:hidden flex items-center gap-2 mb-8 justify-center">
              <Sparkles className="w-8 h-8 text-primary" />
              <span className="text-xl font-black text-text-primary tracking-tighter">Trackply</span>
            </div>
            <h2 className="text-3xl font-black text-text-primary tracking-tight mb-2">
              {flow === "signIn" ? "Welcome Back" : "Start your journey"}
            </h2>
            <p className="text-sm text-text-secondary font-medium">
              {flow === "signIn" 
                ? "Sign in to access your professional workspace." 
                : "Create an account to begin tracking your career."}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-4">
              {flow === "signUp" && (
                <div className="relative group animate-in slide-in-from-top-2 duration-300">
                  <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted group-focus-within:text-primary transition-colors" />
                  <input
                    type="text"
                    placeholder="Full Name"
                    value={name}
                    onChange={e => setName(e.target.value)}
                    className="w-full pl-11 pr-4 py-3 bg-white border border-slate-200 rounded-xl text-sm font-medium outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-text-primary placeholder:text-text-muted/60 shadow-sm"
                    required
                  />
                </div>
              )}
              <div className="relative group">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted group-focus-within:text-primary transition-colors" />
                <input
                  type="email"
                  placeholder="Email Address"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  className="w-full pl-11 pr-4 py-3 bg-white border border-slate-200 rounded-xl text-sm font-medium outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-text-primary placeholder:text-text-muted/60 shadow-sm"
                  required
                />
              </div>
              <div className="relative group">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted group-focus-within:text-primary transition-colors" />
                <input
                  type="password"
                  placeholder="Password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  className="w-full pl-11 pr-4 py-3 bg-white border border-slate-200 rounded-xl text-sm font-medium outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-text-primary placeholder:text-text-muted/60 shadow-sm"
                  required
                />
              </div>
              {flow === "signUp" && (
                <div className="relative group animate-in slide-in-from-top-2 duration-300">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted group-focus-within:text-primary transition-colors" />
                  <input
                    type="password"
                    placeholder="Confirm Password"
                    value={confirmPassword}
                    onChange={e => setConfirmPassword(e.target.value)}
                    className="w-full pl-11 pr-4 py-3 bg-white border border-slate-200 rounded-xl text-sm font-medium outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-text-primary placeholder:text-text-muted/60 shadow-sm"
                    required
                  />
                </div>
              )}
            </div>

            {error && (
              <div className="p-3 bg-red-50 rounded-lg border border-red-100 text-red-600 text-xs font-bold flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-red-500" />
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-slate-900 text-white rounded-xl py-3.5 text-sm font-bold shadow-xl shadow-slate-900/10 hover:bg-slate-800 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  {flow === "signIn" ? "Sign In to Workspace" : "Create My Account"}
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          <p className="mt-8 text-center text-xs text-text-secondary font-semibold leading-relaxed">
            {flow === "signIn" ? "New to Trackply?" : "Already a member?"}{" "}
            <button
              onClick={() => {
                setFlow(flow === "signIn" ? "signUp" : "signIn");
                setError("");
              }}
              className="text-primary hover:underline underline-offset-4 font-bold"
            >
              {flow === "signIn" ? "Get started for free" : "Sign in instead"}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}