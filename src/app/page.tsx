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
import { redirect } from "next/navigation";
import { useRouter } from "next/navigation";


const slides = [

  {
    icon: Rocket,
    title: "Welcome to ManageHub",
    description:
      "A modern workspace designed to help your team manage projects, tasks, people, and workflows from one place.",
  },
  {
    icon: LayoutDashboard,
    title: "Manage projects easily",
    description:
      "Create projects, organize tasks, track progress, and keep your entire team aligned with a clear project overview.",
  },
  {
    icon: Users,
    title: "Work together as a team",
    description:
      "Developers, testers, and managers can work together while everyone gets access to the tools and information they need.",
  },
  {
    icon: ClipboardCheck,
    title: "Track tasks and progress",
    description:
      "Assign tasks, update their status, set priorities, and monitor project progress without losing track of important work.",
  },
  {
    icon: ShieldCheck,
    title: "Role-based access",
    description:
      "Every member has a specific role and permissions, helping keep your organization's data and workflows secure.",
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
    <main className="min-h-screen bg-slate-950 text-white">

      {/* NAVBAR */}
      <nav className="flex items-center justify-between border-b border-slate-800 px-6 py-5 lg:px-12">

        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-600">
            <Code2 size={21} />
          </div>

          <div>
            <h1 className="font-bold">ManageHub</h1>
            <p className="text-xs text-slate-500">
              Team Management
            </p>
          </div>
        </div>

        <button
          onClick={skipIntro}
          className="text-sm text-slate-400 transition hover:text-white"
        >
          Skip
        </button>
      </nav>

      {/* MAIN */}
      <section className="flex min-h-[calc(100vh-81px)] items-center justify-center px-6 py-12">

        <div className="w-full max-w-6xl">

          <div className="grid items-center gap-16 lg:grid-cols-2">

            {/* LEFT CONTENT */}
            <div>

              <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-indigo-500/20 bg-indigo-500/10 px-4 py-2 text-sm text-indigo-300">
                <CheckCircle2 size={16} />
                Your team's new workspace
              </div>

              <h2 className="text-4xl font-bold leading-tight sm:text-5xl lg:text-6xl">
                Everything your
                <span className="block text-indigo-500">
                  team needs.
                </span>
              </h2>

              <p className="mt-6 max-w-xl text-base leading-8 text-slate-400 sm:text-lg">
                Manage projects, organize tasks, collaborate
                with your team, and monitor progress through
                one simple and powerful management platform.
              </p>

              {/* FEATURES */}
              <div className="mt-8 grid gap-4 sm:grid-cols-2">

                <Feature
                  icon={LayoutDashboard}
                  title="Project Management"
                />

                <Feature
                  icon={ClipboardCheck}
                  title="Task Tracking"
                />

                <Feature
                  icon={Users}
                  title="Team Collaboration"
                />

                <Feature
                  icon={ShieldCheck}
                  title="Secure Access"
                />

              </div>
            </div>

            {/* RIGHT CARD */}
            <div className="relative">

              <div className="absolute -inset-10 rounded-full bg-indigo-600/10 blur-3xl" />

              <div className="relative rounded-3xl border border-slate-800 bg-slate-900 p-7 shadow-2xl sm:p-10">

                {/* PROGRESS */}
                <div className="mb-8 flex gap-2">
                  {slides.map((_, index) => (
                    <div
                      key={index}
                      className={`h-1.5 flex-1 rounded-full transition ${index <= current
                        ? "bg-indigo-500"
                        : "bg-slate-800"
                        }`}
                    />
                  ))}
                </div>

                {/* ICON */}
                <div className="mb-8 flex h-20 w-20 items-center justify-center rounded-2xl bg-indigo-500/10 text-indigo-400">
                  <Icon size={38} />
                </div>

                <p className="mb-3 text-sm font-medium text-indigo-400">
                  STEP {current + 1} OF {slides.length}
                </p>

                <h3 className="text-3xl font-bold">
                  {slide.title}
                </h3>

                <p className="mt-5 min-h-[100px] leading-7 text-slate-400">
                  {slide.description}
                </p>

                {/* BUTTONS */}
                <div className="mt-8 flex gap-3">

                  {current === slides.length - 1 ? (
                    <button
                      onClick={getStarted}
                      className="group flex flex-1 items-center justify-center gap-2 rounded-xl bg-indigo-600 px-5 py-3.5 font-semibold transition hover:bg-indigo-500"
                    >
                      Get Started

                      <ArrowRight
                        size={18}
                        className="transition-transform group-hover:translate-x-1"
                      />
                    </button>
                  ) : (
                    <button
                      onClick={nextSlide}
                      className="group flex flex-1 items-center justify-center gap-2 rounded-xl bg-indigo-600 px-5 py-3.5 font-semibold transition hover:bg-indigo-500"
                    >
                      Continue

                      <ArrowRight
                        size={18}
                        className="transition-transform group-hover:translate-x-1"
                      />
                    </button>
                  )}

                  <button
                    onClick={skipIntro}
                    className="rounded-xl border border-slate-700 px-5 py-3.5 text-sm font-medium text-slate-300 transition hover:bg-slate-800"
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


/* =========================
   FEATURE COMPONENT
========================= */

function Feature({
  icon: Icon,
  title,
}: {
  icon: React.ElementType;
  title: string;
}) {
  return (
    <div className="flex items-center gap-3 rounded-xl border border-slate-800 bg-slate-900/50 p-3">
      <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-slate-800 text-indigo-400">
        <Icon size={18} />
      </div>

      <span className="text-sm font-medium text-slate-300">
        {title}
      </span>
    </div>
  );
}