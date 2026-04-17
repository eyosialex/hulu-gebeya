import React from "react";

export default function AuthPage() {
  return (
    <div className="flex h-screen bg-[#F3FCEF] items-center justify-center">
      <div className="w-full max-w-md bg-white p-8 rounded-3xl shadow-xl">
        <h2 className="text-3xl font-extrabold text-green-800 mb-2">
          Welcome Back
        </h2>
        <p className="text-zinc-500 mb-8">Login to explore, play, and earn.</p>

        <form className="flex flex-col gap-5">
          <div>
            <label className="text-sm font-bold text-zinc-700">
              Email Address
            </label>
            <input
              type="email"
              className="mt-1 w-full bg-zinc-50 border border-zinc-200 p-3 rounded-xl focus:ring-2 focus:ring-green-500 outline-none transition"
              placeholder="explorer@world.com"
            />
          </div>
          <div>
            <label className="text-sm font-bold text-zinc-700">Password</label>
            <input
              type="password"
              className="mt-1 w-full bg-zinc-50 border border-zinc-200 p-3 rounded-xl focus:ring-2 focus:ring-green-500 outline-none transition"
              placeholder="••••••••"
            />
          </div>

          <button className="mt-4 w-full bg-linear-to-r from-green-700 to-green-500 text-white font-bold py-3 rounded-full shadow-lg hover:shadow-green-500/25 transition-all outline-none">
            Login
          </button>
        </form>

        <p className="text-center text-sm font-bold text-zinc-500 mt-6">
          Don't have an account?{" "}
          <a href="#" className="text-green-700 hover:text-green-900 underline">
            Register here
          </a>
        </p>
      </div>
    </div>
  );
}
