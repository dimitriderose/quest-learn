"use client";

import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import Link from "next/link";

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

interface ProjectCardProps {
  project: Project;
}

export function ProjectCard({ project }: ProjectCardProps) {
  const isLocked = project.status === "locked";
  const isCompleted = project.status === "completed";
  const isInProgress = project.status === "in-progress";

  const typeColors: Record<string, string> = {
    foundation: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300",
    skill: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300",
    investigation: "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300",
    analysis: "bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300",
    opinion: "bg-pink-100 text-pink-800 dark:bg-pink-900/30 dark:text-pink-300",
    capstone: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300",
  };

  return (
    <Card
      hover={!isLocked}
      className={`p-6 relative ${
        isLocked ? "opacity-60" : ""
      } ${project.isFinal ? "border-2 border-yellow-600" : ""}`}
    >
      {isLocked && (
        <div className="absolute top-4 right-4 text-2xl opacity-50">
          🔒
        </div>
      )}

      <div className="mb-4">
        <div className="flex items-center gap-2 mb-2">
          <span className={`text-xs font-semibold px-2 py-1 rounded ${typeColors[project.type] || typeColors.foundation}`}>
            {project.type.toUpperCase()}
          </span>
          {project.isFinal && (
            <span className="text-xs bg-yellow-600 text-white px-2 py-1 rounded">
              CAPSTONE
            </span>
          )}
        </div>
        <h3 className="font-merriweather text-xl font-bold text-gray-900 dark:text-white">
          {project.title}
        </h3>
      </div>

      <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
        {project.description}
      </p>

      {isCompleted && (
        <div className="space-y-3">
          <div className="flex items-center justify-between bg-gray-50 dark:bg-gray-800 rounded-lg p-3">
            <span className="text-sm text-gray-600 dark:text-gray-400">Grade</span>
            <span className="text-2xl font-bold text-gray-900 dark:text-white">
              {project.grade}
            </span>
          </div>
          {project.feedback && (
            <div className="text-xs bg-blue-50 dark:bg-blue-900/20 p-3 rounded border border-blue-200 dark:border-blue-800 text-gray-700 dark:text-gray-300">
              💬 {project.feedback}
            </div>
          )}
          <div className="text-xs text-gray-500 dark:text-gray-400 text-center">
            {project.artifactCount} artifact{project.artifactCount !== 1 ? "s" : ""} in portfolio
          </div>
          <Link href={`/student/high/project/${project.id}`}>
            <Button variant="secondary" className="w-full">
              View Project
            </Button>
          </Link>
        </div>
      )}

      {isInProgress && (
        <div className="space-y-3">
          <div>
            <div className="flex items-center justify-between text-sm mb-2">
              <span className="text-gray-600 dark:text-gray-400">Progress</span>
              <span className="font-semibold text-gray-900 dark:text-white">
                {project.progress}%
              </span>
            </div>
            <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-blue-600 to-purple-600 transition-all"
                style={{ width: `${project.progress}%` }}
              />
            </div>
          </div>
          <div className="flex items-center justify-between text-xs">
            <span className="text-gray-600 dark:text-gray-400">
              {project.draftStatus}
            </span>
            <span className="text-orange-600 dark:text-orange-400 font-semibold">
              Due in {project.deadline}
            </span>
          </div>
          <Link href={`/student/high/project/${project.id}`}>
            <Button variant="hero" className="w-full">
              Continue Project
            </Button>
          </Link>
        </div>
      )}

      {isLocked && (
        <div className="text-center text-sm text-gray-500 dark:text-gray-400">
          Complete prerequisite projects to unlock
        </div>
      )}
    </Card>
  );
}
