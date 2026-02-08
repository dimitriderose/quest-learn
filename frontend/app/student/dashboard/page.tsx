"use client";

import { StudentHeader } from "@/components/student/dashboard/StudentHeader";
import { XPTracker } from "@/components/student/dashboard/XPTracker";
import { QuestGrid } from "@/components/student/dashboard/QuestGrid";
import { AchievementBanner } from "@/components/student/dashboard/AchievementBanner";

// Mock student data - will connect to backend later
const mockStudent = {
  name: "Alex",
  level: 5,
  currentXP: 350,
  xpToNextLevel: 500,
  totalXP: 2350,
  streak: 7,
  avatar: "🌟",
};

const mockQuests = [
  {
    id: "1",
    number: 1,
    title: "The Mystery Begins",
    description: "Discover what plants need to survive!",
    icon: "🔍",
    status: "completed" as const,
    score: 95,
    stars: 3,
    xpEarned: 100,
  },
  {
    id: "2",
    number: 2,
    title: "The Three Ingredients",
    description: "Build the photosynthesis equation",
    icon: "🧪",
    status: "completed" as const,
    score: 88,
    stars: 3,
    xpEarned: 100,
  },
  {
    id: "3",
    number: 3,
    title: "The Green Machine",
    description: "Explore inside a leaf with your microscope!",
    icon: "🔬",
    status: "in-progress" as const,
    progress: 60,
    attempts: 2,
  },
  {
    id: "4",
    number: 4,
    title: "What Do Plants Make?",
    description: "Discover glucose and oxygen",
    icon: "🌿",
    status: "locked" as const,
  },
  {
    id: "5",
    number: 5,
    title: "Energy Detective",
    description: "Trace energy from sun to you!",
    icon: "☀️",
    status: "locked" as const,
  },
  {
    id: "6",
    number: 6,
    title: "Real-World Plant Doctor",
    description: "Solve real plant problems",
    icon: "🏥",
    status: "locked" as const,
  },
  {
    id: "7",
    number: 7,
    title: "Save the Forest!",
    description: "Final mission - use all your knowledge!",
    icon: "🏆",
    status: "locked" as const,
    isFinal: true,
  },
];

export default function StudentDashboard() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-student-purple via-student-teal to-student-yellow">
      <StudentHeader student={mockStudent} />
      
      <main className="max-w-6xl mx-auto px-6 py-8">
        <AchievementBanner />
        
        <XPTracker student={mockStudent} />
        
        <div className="mt-8">
          <h2 className="font-fredoka text-4xl font-bold text-white mb-2 text-center">
            🌳 Forest Rescue Quests
          </h2>
          <p className="font-nunito text-xl text-white/90 text-center mb-8">
            Complete quests to save the forest and become a photosynthesis expert!
          </p>
          
          <QuestGrid quests={mockQuests} />
        </div>
      </main>
    </div>
  );
}
