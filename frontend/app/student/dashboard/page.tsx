"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/lib/contexts/AuthContext";
import { StudentHeader } from "@/components/student/dashboard/StudentHeader";
import { XPTracker } from "@/components/student/dashboard/XPTracker";
import { QuestGrid } from "@/components/student/dashboard/QuestGrid";
import { AchievementBanner } from "@/components/student/dashboard/AchievementBanner";
import { getMyQuests, StudentQuestDto } from "@/lib/api/studentQuests";

// Helper function to convert StudentQuestDto to Quest format for QuestGrid
function convertToQuestFormat(quests: StudentQuestDto[]) {
  return quests.map((quest, index) => ({
    id: quest.questId,
    number: index + 1,
    title: quest.title,
    description: quest.description,
    icon: getIconForSubject(quest.subject),
    status: "available" as const,
    className: quest.className,
    subject: quest.subject,
    gradeLevel: quest.gradeLevel,
    dueDate: quest.dueDate,
    xpReward: quest.xpReward,
    playUrl: quest.playUrl,
  }));
}

function getIconForSubject(subject: string): string {
  const icons: Record<string, string> = {
    Science: "🔬",
    Math: "🔢",
    "English Language Arts": "📚",
    "Social Studies": "🌍",
    History: "📜",
    Geography: "🗺️",
    Art: "🎨",
    Music: "🎵",
    "Physical Education": "⚽",
  };
  return icons[subject] || "📖";
}

export default function StudentDashboard() {
  const { user } = useAuth();
  const [quests, setQuests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Create student object from auth user
  const student = user ? {
    name: user.displayName || user.email?.split('@')[0] || "Student",
    level: 5,
    currentXP: 350,
    xpToNextLevel: 500,
    totalXP: 2350,
    streak: 7,
    avatar: "🌟",
  } : {
    name: "Student",
    level: 1,
    currentXP: 0,
    xpToNextLevel: 100,
    totalXP: 0,
    streak: 0,
    avatar: "🌟",
  };

  useEffect(() => {
    async function loadQuests() {
      try {
        const assignedQuests = await getMyQuests();
        const formattedQuests = convertToQuestFormat(assignedQuests);
        setQuests(formattedQuests);
      } catch (error) {
        console.error("Error loading quests:", error);
        setQuests([]);
      } finally {
        setLoading(false);
      }
    }

    loadQuests();
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-student-purple via-student-teal to-student-yellow dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 transition-colors">
      <StudentHeader student={student} />
      
      <main className="max-w-6xl mx-auto px-6 py-8">
        <AchievementBanner />
        
        <XPTracker student={student} />
        
        <div className="mt-8">
          <h2 className="font-fredoka text-4xl font-bold text-white mb-2 text-center">
            🎯 My Assigned Quests
          </h2>
          <p className="font-nunito text-xl text-white/90 text-center mb-8">
            Complete your assigned quests to earn XP and level up!
          </p>
          
          {loading ? (
            <div className="text-center text-white py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
              <p className="font-nunito">Loading your quests...</p>
            </div>
          ) : quests.length === 0 ? (
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 text-center">
              <p className="font-nunito text-xl text-white mb-2">
                No quests assigned yet! 📚
              </p>
              <p className="font-nunito text-white/80">
                Ask your teacher to assign you some learning adventures!
              </p>
            </div>
          ) : (
            <QuestGrid quests={quests} />
          )}
        </div>
      </main>
    </div>
  );
}
