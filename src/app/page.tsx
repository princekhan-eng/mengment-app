"use client";

import { useState } from "react";
import {
  ArrowRight,
  CheckCircle2,
  Code2,
  LayoutDashboard,
  Users,
  ShieldCheck,
  ClipboardCheck,
  Rocket,
} from "lucide-react";
import { useRouter } from "next/navigation";

const slides = [
  {
    icon: Rocket,
    title: "Welcome to ManageHub",
    description:
      "A modern, agile workspace designed to help your team manage projects, sprint tasks, developers, and QA verification from one unified hub.",
  },
  {
    icon: LayoutDashboard,
    title: "Manage projects effortlessly",
    description:
      "Create projects, organize sprint backlogs, track live progress, and keep cross-functional teams aligned with real-time department metrics.",
  },
  {
    icon: Users,
    title: "Connect developers & testers",
    description:
      "Developers, QA engineers, and managers collaborate seamlessly with direct role-based permissions, file attachments, and live team chat.",
  },
  {
    icon: ClipboardCheck,
    title: "Track tasks & progress",
    description:
      "Assign tasks with priorities and deadlines, update status milestones, and verify test builds without losing track of critical deliverables.",
  },
  {
    icon: ShieldCheck,
    title: "Role-based security",
    description:
      "Every member has designated access credentials and role boundaries, keeping organizational data and workflows safe and structured.",
  },
];

export default function IntroPage() {
  const [current, setCurrent] = useState(0);
  const router = useRouter();
  const slide = slides[current];
  const Icon = slide.icon;

  const nextSlide = () => {
    if (current < slides.length - 1) {
      setCurrent(current + 1);
    }
  };

  const skipIntro = () => {
    router.push("/auth/login");
  };

  const getStarted = () => {
    router.push("/auth/register");
  };

  return (
    <main className="min-h-screen bg-slate-50 text-slate-900 flex flex-col">
      {/* NAVBAR */}
      <nav className="sticky top-0 z-30 flex items-center justify-between border-b border-slate-200/80 bg-white/80 backdrop-blur-md px-6 py-4 lg:px-12">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-600 text-white shadow-xs">
            <Code2 size={21} />
          </div>

          <div>
            <h1 className="font-bold text-slate-900 text-base">ManageHub</h1>
            <p className="text-[10px] text-slate-400">Team Leadership & Engineering</p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <button
            onClick={() => router.push("/auth/login")}
            className="text-xs font-semibold text-slate-600 hover:text-indigo-600 transition"
          >
            Sign In
          </button>
          <button
            onClick={getStarted}
            className="px-3.5 py-1.5 rounded-xl bg-indigo-600 text-white text-xs font-semibold hover:bg-indigo-700 shadow-xs transition"
          >
            Get Started
          </button>
        </div>
      </nav>

      {/* MAIN */}
      <section className="flex flex-1 items-center justify-center px-6 py-12">
        <div className="w-full max-w-6xl">
          <div className="grid items-center gap-12 lg:grid-cols-2">
            {/* LEFT CONTENT */}
            <div>
              <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-indigo-200 bg-indigo-50 px-3.5 py-1.5 text-xs font-semibold text-indigo-700 shadow-xs">
                <CheckCircle2 size={15} />
                Next-Generation Team Management Platform
              </div>

              <h2 className="text-4xl font-extrabold leading-tight text-slate-900 sm:text-5xl lg:text-6xl tracking-tight">
                Everything your{" "}
                <span className="text-indigo-600">team needs.</span>
              </h2>

              <p className="mt-5 max-w-xl text-base leading-relaxed text-slate-600 sm:text-lg">
                Manage projects, organize sprint tasks, collaborate with your team, and monitor QA progress through one simple, beautiful workspace.
              </p>

              {/* FEATURES */}
              <div className="mt-8 grid gap-3 sm:grid-cols-2">
                <Feature icon={LayoutDashboard} title="Project Management" />
                <Feature icon={ClipboardCheck} title="Task Tracking" />
                <Feature icon={Users} title="Team Collaboration" />
                <Feature icon={ShieldCheck} title="Role-Based Access" />
              </div>
            </div>

            {/* RIGHT CARD */}
            <div className="relative">
              <div className="absolute -inset-4 rounded-3xl bg-indigo-200/40 blur-2xl" />

              <div className="relative rounded-3xl border border-slate-200/80 bg-white p-7 shadow-xl sm:p-10">
                {/* PROGRESS */}
                <div className="mb-8 flex gap-2">
                  {slides.map((_, index) => (
                    <div
                      key={index}
                      className={`h-1.5 flex-1 rounded-full transition-all duration-300 ${
                        index <= current ? "bg-indigo-600" : "bg-slate-100"
                      }`}
                    />
                  ))}
                </div>

                {/* ICON */}
                <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600 border border-indigo-100 shadow-xs">
                  <Icon size={32} />
                </div>

                <p className="mb-2 text-xs font-bold text-indigo-600 uppercase tracking-wider">
                  STEP {current + 1} OF {slides.length}
                </p>

                <h3 className="text-2xl font-bold text-slate-900">
                  {slide.title}
                </h3>

                <p className="mt-3 min-h-[90px] leading-relaxed text-slate-600 text-sm">
                  {slide.description}
                </p>

                {/* BUTTONS */}
                <div className="mt-8 flex gap-3">
                  {current === slides.length - 1 ? (
                    <button
                      onClick={getStarted}
                      className="group flex flex-1 items-center justify-center gap-2 rounded-xl bg-indigo-600 px-5 py-3 font-semibold text-white text-xs hover:bg-indigo-700 shadow-md shadow-indigo-600/20 transition"
                    >
                      Get Started Free
                      <ArrowRight size={16} className="transition-transform group-hover:translate-x-1" />
                    </button>
                  ) : (
                    <button
                      onClick={nextSlide}
                      className="group flex flex-1 items-center justify-center gap-2 rounded-xl bg-indigo-600 px-5 py-3 font-semibold text-white text-xs hover:bg-indigo-700 shadow-md shadow-indigo-600/20 transition"
                    >
                      Continue
                      <ArrowRight size={16} className="transition-transform group-hover:translate-x-1" />
                    </button>
                  )}

                  <button
                    onClick={skipIntro}
                    className="rounded-xl border border-slate-200 bg-white px-5 py-3 text-xs font-semibold text-slate-600 hover:bg-slate-50 transition shadow-xs"
                  >
                    Skip
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}

function Feature({
  icon: Icon,
  title,
}: {
  icon: React.ElementType;
  title: string;
}) {
  return (
    <div className="flex items-center gap-3 rounded-xl border border-slate-200/80 bg-white p-3.5 shadow-xs">
      <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600 border border-indigo-100/60">
        <Icon size={18} />
      </div>

      <span className="text-xs font-semibold text-slate-800">
        {title}
      </span>
    </div>
  );
}