"use client";

import { MiddleSchoolHeader } from "@/components/student/middle/MiddleSchoolHeader";
import { SkillProgressCard } from "@/components/student/middle/SkillProgressCard";
import { ChallengeGrid } from "@/components/student/middle/ChallengeGrid";
import { LeaderboardCard } from "@/components/student/middle/LeaderboardCard";

// Mock student data
const mockStudent = {
  name: "Jordan",
  level: 12,
  currentXP: 2450,
  xpToNextLevel: 3000,
  rank: 3,
  classSize: 28,
  avatar: "🎯",
};

const mockChallenges = [
  {
    id: "1",
    number: 1,
    title: "Forge Setup",
    description: "Master the basics of fraction operations",
    icon: "🔨",
    status: "completed" as const,
    score: 92,
    mastery: 95,
    xpEarned: 200,
  },
  {
    id: "2",
    number: 2,
    title: "Metal Analysis",
    description: "Compare and order fractions",
    icon: "🔍",
    status: "completed" as const,
    score: 88,
    mastery: 90,
    xpEarned: 200,
  },
  {
    id: "3",
    number: 3,
    title: "Alloy Creation",
    description: "Add and subtract fractions with different denominators",
    icon: "⚗️",
    status: "in-progress" as const,
    progress: 65,
    currentMastery: 70,
  },
  {
    id: "4",
    number: 4,
    title: "Advanced Forging",
    description: "Multiply and divide fractions",
    icon: "🔥",
    status: "locked" as const,
  },
  {
    id: "5",
    number: 5,
    title: "Master Craftsman",
    description: "Solve complex fraction problems",
    icon: "⚔️",
    status: "locked" as const,
  },
  {
    id: "6",
    number: 6,
    title: "Final Commission",
    description: "Real-world fraction applications",
    icon: "🏆",
    status: "locked" as const,
    isFinal: true,
  },
];

export default function MiddleSchoolDashboard() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors">
      <MiddleSchoolHeader student={mockStudent} />
      
      <main className="max-w-7xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          <div className="lg:col-span-2">
            <SkillProgressCard student={mockStudent} />
          </div>
          <div>
            <LeaderboardCard student={mockStudent} />
          </div>
        </div>

        <div>
          <h2 className="font-merriweather text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Blacksmith Academy Challenges
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            Master fractions through precision metalworking
          </p>
          
          <ChallengeGrid challenges={mockChallenges} />
        </div>
      </main>
    </div>
  );
}
