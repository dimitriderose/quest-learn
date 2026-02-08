"use client";

import { ProjectCard } from "./ProjectCard";

interface Project {
  id: string;
  number: number;
  title: string;
  description: string;
  type: string;
  status: "completed" | "in-progress" | "locked";
  grade?: string;
  feedback?: string;
  artifactCount?: number;
  progress?: number;
  draftStatus?: string;
  deadline?: string;
  isFinal?: boolean;
}

interface ProjectGridProps {
  projects: Project[];
}

export function ProjectGrid({ projects }: ProjectGridProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {projects.map((project) => (
        <ProjectCard key={project.id} project={project} />
      ))}
    </div>
  );
}
