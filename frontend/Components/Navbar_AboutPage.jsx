import { Link, useRouter } from "@tanstack/react-router";
import { LayoutGrid, ArrowRight, Zap } from "lucide-react";

const Navbar_AboutPage = ({ isLoggedIn = true }) => {
  const router = useRouter();

  const handleLoginRedirect = () => router.navigate({ to: "/login" });
  const handleHomePageRedirect = () => router.navigate({ to: "/home" });

  return (
    <nav className="sticky top-0 z-50 w-full border-b border-white/8 bg-black/60 backdrop-blur-xl">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-3">
        {/* Logo Section */}
        <Link
          to="/"
          className="group flex items-center gap-3 transition-all duration-300"
        >
          <div className="relative flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-600 text-white shadow-[0_0_20px_rgba(79,70,229,0.4)] group-hover:shadow-[0_0_30px_rgba(79,70,229,0.6)] group-hover:scale-110 transition-all">
            <Zap size={20} fill="currentColor" />
            <div className="absolute inset-0 rounded-xl bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity" />
          </div>

          <div className="flex flex-col justify-center">
            <span className="text-lg font-bold tracking-tight text-white">
              Task
              <span className="bg-linear-to-r from-indigo-400 to-cyan-400 bg-clip-text text-transparent">
                Nexus
              </span>
            </span>
            <span className="text-[10px] font-medium uppercase tracking-[0.2em] text-zinc-500">
              Orchestration Engine
            </span>
          </div>
        </Link>

        {/* Call to Action Buttons */}
        <div className="flex items-center gap-4">
          {!isLoggedIn ? (
            <>
              <button className="text-sm font-medium text-zinc-300 hover:text-white transition-colors">
                Sign in
              </button>
              <button
                onClick={handleLoginRedirect}
                className="relative inline-flex h-10 items-center justify-center rounded-full bg-white px-6 py-2 text-sm font-semibold text-black transition-all hover:bg-zinc-200 active:scale-95"
              >
                Get Started
              </button>
            </>
          ) : (
            <button
              onClick={handleHomePageRedirect}
              className="group relative flex items-center gap-2 overflow-hidden rounded-full border border-indigo-500/30 bg-indigo-500/10 px-6 py-2 text-sm font-medium text-indigo-300 transition-all hover:bg-indigo-500 hover:text-white"
            >
              <span className="relative z-10">View Projects</span>
              <ArrowRight
                size={16}
                className="relative z-10 transition-transform group-hover:translate-x-1"
              />
              <div className="absolute inset-0 -translate-x-full bg-linear-to-r from-indigo-600 to-purple-600 transition-transform duration-300 group-hover:translate-x-0" />
            </button>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar_AboutPage;
