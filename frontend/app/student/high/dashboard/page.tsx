"use client";

import { HighSchoolHeader } from "@/components/student/high/HighSchoolHeader";
import { PortfolioCard } from "@/components/student/high/PortfolioCard";
import { ProjectGrid } from "@/components/student/high/ProjectGrid";
import { ImpactMetrics } from "@/components/student/high/ImpactMetrics";

// Mock student data
const mockStudent = {
  name: "Taylor",
  role: "Investigative Journalist",
  portfolioPieces: 4,
  articlesPublished: 3,
  avgReadership: 247,
  avatar: "📰",
};

const mockProjects = [
  {
    id: "1",
    number: 1,
    title: "Journalism Fundamentals",
    description: "Master the 5 W's and inverted pyramid structure",
    type: "foundation",
    status: "completed" as const,
    grade: "A-",
    feedback: "Strong lead writing, excellent source attribution",
    artifactCount: 1,
  },
  {
    id: "2",
    number: 2,
    title: "Interview Techniques",
    description: "Conduct effective interviews and verify sources",
    type: "skill",
    status: "completed" as const,
    grade: "A",
    feedback: "Exceptional questioning strategy",
    artifactCount: 2,
  },
  {
    id: "3",
    number: 3,
    title: "Investigative Reporting",
    description: "Uncover the truth behind local water quality issues",
    type: "investigation",
    status: "in-progress" as const,
    progress: 70,
    draftStatus: "Second revision",
    deadline: "3 days",
  },
  {
    id: "4",
    number: 4,
    title: "Data Journalism",
    description: "Analyze statistical data and create visualizations",
    type: "analysis",
    status: "locked" as const,
  },
  {
    id: "5",
    number: 5,
    title: "Editorial Writing",
    description: "Craft persuasive opinion pieces backed by evidence",
    type: "opinion",
    status: "locked" as const,
  },
  {
    id: "6",
    number: 6,
    title: "Capstone Investigation",
    description: "Original investigative piece for publication",
    type: "capstone",
    status: "locked" as const,
    isFinal: true,
  },
];

export default function HighSchoolDashboard() {
  return (
    <div className="min-h-screen bg-white dark:bg-gray-900 transition-colors">
      <HighSchoolHeader student={mockStudent} />
      
      <main className="max-w-7xl mx-auto px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mb-8">
          <div className="lg:col-span-3">
            <PortfolioCard student={mockStudent} />
          </div>
          <div>
            <ImpactMetrics student={mockStudent} />
          </div>
        </div>

        <div>
          <h2 className="font-merriweather text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Journalism Academy Projects
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            Build your portfolio through real-world reporting
          </p>
          
          <ProjectGrid projects={mockProjects} />
        </div>
      </main>
    </div>
  );
}
