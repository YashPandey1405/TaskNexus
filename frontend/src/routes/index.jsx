import { createFileRoute } from "@tanstack/react-router";
import Navbar_AboutPage from "../../Components/Navbar_AboutPage";
import { authStore } from "../store/authStore";
import {
  Github,
  Linkedin,
  Code2,
  ExternalLink,
  FileText,
  Trophy,
  Cpu,
  Globe,
  ChevronRight,
  CheckCircle2,
} from "lucide-react";

export const Route = createFileRoute("/")({
  component: RouteComponent,
});

function RouteComponent() {
  const isLoggedInZustand = authStore((state) => state.isLoggedIn);

  return (
    <div className="min-h-screen bg-[#030303] text-zinc-200 selection:bg-indigo-500/30">
      {/* Background Glows */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-[10%] -left-[10%] h-[40%] w-[40%] rounded-full bg-indigo-500/10 blur-[120px]" />
        <div className="absolute top-[20%] -right-[10%] h-[50%] w-[50%] rounded-full bg-purple-500/5 blur-[120px]" />
      </div>

      <Navbar_AboutPage isLoggedIn={isLoggedInZustand} />

      <main className="relative z-10">
        {/* ================= HERO SECTION ================= */}
        <section className="mx-auto max-w-6xl px-6 pt-24 pb-20">
          <div className="relative overflow-hidden rounded-[2.5rem] border border-white/5 bg-zinc-900/40 p-12 backdrop-blur-md">
            <div className="flex flex-col items-center text-center">
              {/* Profile Image with Animated Ring */}
              <div className="relative mb-8">
                <div className="absolute -inset-1 rounded-full bg-linear-to-tr from-indigo-500 to-purple-600 opacity-75 blur-sm animate-pulse" />
                <img
                  src="https://res.cloudinary.com/dah7l8utl/image/upload/v1750844086/TaskNexus_MERN-Project/oo5qxmxyw0c4aspjakzs.jpg"
                  alt="Yash Pandey"
                  className="relative h-40 w-40 rounded-full border-2 border-black object-cover shadow-2xl"
                />
              </div>

              <div className="max-w-3xl">
                <h1 className="text-5xl font-extrabold tracking-tight text-white md:text-6xl">
                  Yash <span className="text-indigo-500">Pandey</span>
                </h1>
                <p className="mt-6 text-lg font-medium text-zinc-400 md:text-xl">
                  MERN Stack Developer{" "}
                  <span className="text-zinc-700 mx-2">|</span>
                  AI Explorer <span className="text-zinc-700 mx-2">|</span>
                  Web Architect
                </p>

                {/* Achievement Badge */}
                <div className="mt-4 inline-flex items-center gap-2 rounded-full border border-indigo-500/20 bg-indigo-500/5 px-4 py-1.5 text-sm font-semibold text-indigo-400">
                  <Trophy size={16} />
                  700+ LeetCode (Java)
                </div>
              </div>

              {/* Action Buttons */}
              <div className="mt-10 flex flex-wrap justify-center gap-4">
                {[
                  {
                    name: "LinkedIn",
                    icon: <Linkedin size={18} />,
                    href: "https://linkedin.com/in/yashpandey29/",
                    type: "outline",
                  },
                  {
                    name: "GitHub",
                    icon: <Github size={18} />,
                    href: "https://github.com/YashPandey1405/",
                    type: "outline",
                  },
                  {
                    name: "LeetCode",
                    icon: <Code2 size={18} />,
                    href: "https://leetcode.com/u/pandeyyash041/",
                    type: "outline",
                  },
                ].map((link) => (
                  <a
                    key={link.name}
                    href={link.href}
                    target="_blank"
                    className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-6 py-3 text-sm font-medium transition-all hover:border-white/20 hover:bg-white/10 hover:-translate-y-1"
                  >
                    {link.icon} {link.name}
                  </a>
                ))}

                <a
                  href="https://drive.google.com/drive/folders/1g9SM-mmxfu1C5_BDI5AUbNjQiQOWuVCT"
                  target="_blank"
                  className="group flex items-center gap-2 rounded-xl bg-indigo-600 px-8 py-3 text-sm font-bold text-white transition-all hover:bg-indigo-500 hover:shadow-[0_0_25px_rgba(79,70,229,0.4)]"
                >
                  <FileText size={18} />
                  View Resume
                  <ChevronRight
                    size={16}
                    className="transition-transform group-hover:translate-x-1"
                  />
                </a>
              </div>
            </div>
          </div>
        </section>

        {/* ================= SKILLS BENTO GRID ================= */}
        <section className="mx-auto max-w-6xl px-6 py-20">
          <div className="mb-12 flex flex-col items-center">
            <h2 className="text-3xl font-bold text-white">Engineering Stack</h2>
            <div className="mt-2 h-1 w-20 rounded-full bg-indigo-500" />
          </div>

          <div className="grid gap-6 md:grid-cols-3">
            {/* About Me Card */}
            <div className="md:col-span-2 rounded-3xl border border-white/5 bg-zinc-900/20 p-8 backdrop-blur-sm">
              <h3 className="flex items-center gap-2 text-xl font-semibold text-white mb-6">
                <Cpu className="text-indigo-400" /> Core Philosophy
              </h3>
              <p className="text-lg leading-relaxed text-zinc-400">
                I’m a 4th-year CSE student at MAIT, architecting
                production-ready web systems. My focus lies in building{" "}
                <span className="text-white">
                  scalable backend infrastructures{" "}
                </span>
                and seamless user experiences using the MERN stack.
              </p>
              <div className="mt-8 grid grid-cols-2 gap-4">
                {[
                  "DSA Mastery (Java)",
                  "DevOps & Infra",
                  "GenAI & NLP",
                  "Cloud Deployment",
                ].map((item) => (
                  <div
                    key={item}
                    className="flex items-center gap-3 text-sm text-zinc-300"
                  >
                    <div className="h-1.5 w-1.5 rounded-full bg-indigo-500" />{" "}
                    {item}
                  </div>
                ))}
              </div>
            </div>

            {/* Skills Snapshot */}
            <div className="rounded-3xl border border-white/5 bg-linear-to-b from-zinc-900/40 to-black p-8">
              <h3 className="text-xl font-semibold text-white mb-6">
                Expertise
              </h3>
              <div className="space-y-4">
                {[
                  { label: "Frontend", tech: "React, Next.js, TS" },
                  { label: "Backend", tech: "Node, Redis, Mongo" },
                  { label: "Tools", tech: "Docker, AWS, CI/CD" },
                ].map((skill) => (
                  <div key={skill.label}>
                    <p className="text-[10px] uppercase tracking-widest text-indigo-400 font-bold mb-1">
                      {skill.label}
                    </p>
                    <p className="text-sm text-zinc-300">{skill.tech}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* ================= PROJECT SECTION ================= */}
        <section className="mx-auto max-w-6xl px-6 py-20">
          <div className="relative overflow-hidden rounded-[3rem] border border-indigo-500/20 bg-indigo-500/2 p-12">
            <div className="grid md:grid-cols-2 gap-12 items-center">
              <div>
                <span className="text-xs font-bold uppercase tracking-[0.3em] text-indigo-500">
                  Featured Project
                </span>
                <h2 className="mt-4 text-4xl font-bold text-white">
                  TaskNexus
                </h2>
                <p className="mt-6 text-zinc-400 text-lg">
                  A high-performance Kanban management system engineered for
                  scale. Featuring multi-server patterns, real-time sync via
                  WebSockets, and heavy-duty caching with Redis.
                </p>
                <div className="mt-8 flex gap-3">
                  {["JWT", "Redis", "AWS S3", "WebSockets"].map((t) => (
                    <span
                      key={t}
                      className="rounded-md bg-zinc-800 px-3 py-1 text-xs font-medium text-zinc-300"
                    >
                      {t}
                    </span>
                  ))}
                </div>
                <a
                  href="https://github.com/YashPandey1405/TaskNexus"
                  target="_blank"
                  className="mt-10 inline-flex items-center gap-2 text-indigo-400 font-semibold hover:text-indigo-300 transition-colors"
                >
                  Explore Documentation <ExternalLink size={18} />
                </a>
              </div>

              <div className="grid gap-4">
                {[
                  "Drag-and-Drop Kanban",
                  "JWT + Role-Based Auth",
                  "Subtasks & Priorities",
                  "AWS EC2 Deployment",
                ].map((item) => (
                  <div
                    key={item}
                    className="flex items-center gap-4 rounded-2xl border border-white/5 bg-black/40 p-4 transition-transform hover:scale-[1.02]"
                  >
                    <CheckCircle2 className="text-indigo-500" size={20} />
                    <span className="font-medium text-zinc-200">{item}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className="mt-20 border-t border-white/5 py-12 text-center">
        <p className="text-sm text-zinc-500">
          Crafted with precision by{" "}
          <span className="text-zinc-300">Yash Pandey</span> © 2026
        </p>
      </footer>
    </div>
  );
}
