"use client";

import Link from "next/link";
import { ArrowRight, Loader2 } from "lucide-react";
import { useProjects } from "@/lib/client/hooks";

export function ProjectList() {
  const projects = useProjects();

  if (projects.isLoading) {
    return <div className="flex items-center gap-2 text-sm text-neutral-600"><Loader2 className="animate-spin" size={16} /> Loading projects</div>;
  }

  if (projects.isError) {
    return <div className="rounded-md border border-tomato/30 bg-tomato/10 p-4 text-sm text-tomato">{projects.error.message}</div>;
  }

  if (!projects.data?.projects.length) {
    return <div className="rounded-md border border-line bg-white p-6 text-sm text-neutral-600">No projects are available for this demo user.</div>;
  }

  return (
    <div className="grid gap-4 md:grid-cols-2">
      {projects.data.projects.map((project) => (
        <Link key={project._id} href={`/projects/${project.slug}`} className="group rounded-md border border-line bg-white p-5 shadow-soft">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h2 className="break-words text-xl font-semibold">{project.name}</h2>
              <p className="mt-2 break-words text-sm text-neutral-600">{project.description}</p>
              <p className="mt-4 break-words text-xs uppercase tracking-wide text-moss">{project.slug}</p>
            </div>
            <ArrowRight className="mt-1 transition group-hover:translate-x-1" size={20} />
          </div>
        </Link>
      ))}
    </div>
  );
}
