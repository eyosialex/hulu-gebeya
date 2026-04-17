import Link from "next/link";

export default function SignupPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-linear-to-br from-[#F3FCEF] via-[#E8F5E9] to-[#DCFCE7] px-6 py-12 font-sans relative overflow-hidden isolate">
      <div className="absolute top-1/4 -left-10 w-72 h-72 bg-green-500/20 rounded-full blur-[80px] pointer-events-none -z-10 animate-pulse"></div>
      <div className="absolute bottom-1/4 -right-10 w-96 h-96 bg-blue-500/20 rounded-full blur-[100px] pointer-events-none -z-10"></div>

      <div className="w-full max-w-md bg-white rounded-3xl p-8 sm:p-10 shadow-[0_20px_50px_-12px_rgba(0,0,0,0.1)] border border-white/50 backdrop-blur-sm relative z-10">
        <div className="text-center mb-8">
          <div className="w-14 h-14 bg-linear-to-br from-[#006E2F] to-[#22C55E] text-white rounded-2xl flex items-center justify-center text-2xl mb-4 mx-auto shadow-lg shadow-green-500/30">
            🗺️
          </div>
          <h2 className="text-3xl font-extrabold text-zinc-900 tracking-tight">
            Create Account
          </h2>
          <p className="text-zinc-500 font-medium mt-2">
            Join Smart Map to explore, play, and earn.
          </p>
        </div>

        <form className="flex flex-col gap-5">
          <div className="relative group">
            <label className="text-sm font-semibold text-zinc-700 mb-1 block">
              Full Name
            </label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400 group-focus-within:text-green-600 transition-colors">
                👤
              </span>
              <input
                type="text"
                placeholder="Your name"
                className="w-full bg-zinc-50 border border-zinc-200 text-zinc-900 rounded-xl px-11 py-3.5 focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-500 transition-all font-medium placeholder:text-zinc-400"
                required
              />
            </div>
          </div>

          <div className="relative group">
            <label className="text-sm font-semibold text-zinc-700 mb-1 block">
              Email
            </label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400 group-focus-within:text-green-600 transition-colors">
                ✉️
              </span>
              <input
                type="email"
                placeholder="you@example.com"
                className="w-full bg-zinc-50 border border-zinc-200 text-zinc-900 rounded-xl px-11 py-3.5 focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-500 transition-all font-medium placeholder:text-zinc-400"
                required
              />
            </div>
          </div>

          <div className="relative group">
            <label className="text-sm font-semibold text-zinc-700 mb-1 block">
              Password
            </label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400 group-focus-within:text-green-600 transition-colors">
                🔒
              </span>
              <input
                type="password"
                placeholder="Create a password"
                className="w-full bg-zinc-50 border border-zinc-200 text-zinc-900 rounded-xl px-11 py-3.5 focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-500 transition-all font-medium placeholder:text-zinc-400"
                required
              />
            </div>
          </div>

          <div className="relative group">
            <label className="text-sm font-semibold text-zinc-700 mb-1 block">
              Confirm Password
            </label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400 group-focus-within:text-green-600 transition-colors">
                🔁
              </span>
              <input
                type="password"
                placeholder="Repeat password"
                className="w-full bg-zinc-50 border border-zinc-200 text-zinc-900 rounded-xl px-11 py-3.5 focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-500 transition-all font-medium placeholder:text-zinc-400"
                required
              />
            </div>
          </div>

          <button
            type="submit"
            className="w-full bg-linear-to-r from-[#006E2F] to-[#16A34A] text-white font-bold rounded-xl py-4 hover:shadow-[0_8px_20px_rgba(22,163,74,0.3)] hover:-translate-y-0.5 transition-all active:translate-y-0 mt-2"
          >
            Sign Up
          </button>
        </form>

        <div className="mt-8 pt-6 border-t border-zinc-100 text-center">
          <p className="text-zinc-500 font-medium">
            Already have an account?{" "}
            <Link
              href="/login"
              className="text-green-600 font-bold hover:underline underline-offset-4"
            >
              Sign in
            </Link>
          </p>
        </div>

        <div className="mt-6 text-center">
          <Link
            href="/"
            className="text-sm text-zinc-400 font-semibold hover:text-zinc-600 transition flex items-center justify-center gap-1"
          >
            <span>←</span> Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
}
