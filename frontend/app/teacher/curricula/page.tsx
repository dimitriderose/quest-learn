"use client";

import { useState, useEffect } from "react";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { DashboardHeader } from "@/components/teacher/dashboard/DashboardHeader";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Search, Filter, BookOpen, Clock, Award, Users } from "lucide-react";
import { questApi, QuestDto } from "@/lib/api/quests";
import { classApi, ClassDto } from "@/lib/api/classes";

interface QuestCardProps {
  quest: QuestDto;
  classes: ClassDto[];
  onAssign: (questId: string, classId: string) => void;
}

export default function TeacherCurriculaPage() {
  const [quests, setQuests] = useState<QuestDto[]>([]);
  const [classes, setClasses] = useState<ClassDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedSubject, setSelectedSubject] = useState<string>("all");
  const [selectedGrade, setSelectedGrade] = useState<string>("all");
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>("all");

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [questsData, classesData] = await Promise.all([
        questApi.getAll(),
        classApi.getAll(),
      ]);
      setQuests(questsData);
      setClasses(classesData);
    } catch (error) {
      console.error('Failed to load data:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredQuests = quests.filter((quest) => {
    const matchesSearch = quest.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          quest.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesSubject = selectedSubject === "all" || quest.subject === selectedSubject;
    const matchesGrade = selectedGrade === "all" || quest.gradeLevel.toString() === selectedGrade;
    const matchesDifficulty = selectedDifficulty === "all" || quest.difficulty === selectedDifficulty;

    return matchesSearch && matchesSubject && matchesGrade && matchesDifficulty;
  });

  const subjects = Array.from(new Set(quests.map(q => q.subject)));
  const grades = Array.from(new Set(quests.map(q => q.gradeLevel))).sort((a, b) => a - b);

  const handleAssignQuest = async (questId: string, classId: string) => {
    try {
      await questApi.assign({ questId, classId });
      alert('Quest assigned successfully!');
    } catch (error: any) {
      console.error('Failed to assign quest:', error);
      alert(error.response?.data?.message || 'Failed to assign quest');
    }
  };

  if (loading) {
    return (
      <ProtectedRoute requiredRole="TEACHER">
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
          <DashboardHeader />
          <div className="flex items-center justify-center h-96">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-gray-600 dark:text-gray-400">Loading quest library...</p>
            </div>
          </div>
        </div>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute requiredRole="TEACHER">
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <DashboardHeader />

        <main className="max-w-7xl mx-auto px-8 py-8">
          <div className="mb-8">
            <h1 className="font-merriweather text-3xl font-bold text-gray-900 dark:text-white">
              Quest Library
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              Browse and assign engaging quests to your classes
            </p>
          </div>

          <div className="mb-6 space-y-4">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search quests by title or description..."
                className="w-full pl-12 pr-4 py-3 border-2 border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
              />
            </div>

            <div className="flex flex-wrap gap-4">
              <div className="flex items-center gap-2">
                <Filter className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">Filters:</span>
              </div>

              <select
                value={selectedSubject}
                onChange={(e) => setSelectedSubject(e.target.value)}
                className="px-4 py-2 border-2 border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
              >
                <option value="all">All Subjects</option>
                {subjects.map(subject => (
                  <option key={subject} value={subject}>{subject}</option>
                ))}
              </select>

              <select
                value={selectedGrade}
                onChange={(e) => setSelectedGrade(e.target.value)}
                className="px-4 py-2 border-2 border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
              >
                <option value="all">All Grades</option>
                {grades.map(grade => (
                  <option key={grade} value={grade}>
                    {grade === 0 ? 'Kindergarten' : `Grade ${grade}`}
                  </option>
                ))}
              </select>

              <select
                value={selectedDifficulty}
                onChange={(e) => setSelectedDifficulty(e.target.value)}
                className="px-4 py-2 border-2 border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
              >
                <option value="all">All Difficulties</option>
                <option value="easy">Easy</option>
                <option value="medium">Medium</option>
                <option value="hard">Hard</option>
              </select>

              {(searchQuery || selectedSubject !== "all" || selectedGrade !== "all" || selectedDifficulty !== "all") && (
                <button
                  onClick={() => {
                    setSearchQuery("");
                    setSelectedSubject("all");
                    setSelectedGrade("all");
                    setSelectedDifficulty("all");
                  }}
                  className="text-sm text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
                >
                  Clear filters
                </button>
              )}
            </div>
          </div>

          <div className="mb-6">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Showing {filteredQuests.length} of {quests.length} quests
            </p>
          </div>

          {filteredQuests.length === 0 ? (
            <Card className="p-12 text-center">
              <div className="text-6xl mb-4">🔍</div>
              <h3 className="font-merriweather text-xl font-bold text-gray-900 dark:text-white mb-2">
                No Quests Found
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                Try adjusting your filters or search terms
              </p>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredQuests.map((quest) => (
                <QuestCard
                  key={quest.questId}
                  quest={quest}
                  classes={classes}
                  onAssign={handleAssignQuest}
                />
              ))}
            </div>
          )}
        </main>
      </div>
    </ProtectedRoute>
  );
}

function QuestCard(props: QuestCardProps) {
  const { quest, classes, onAssign } = props;
  const [showAssignMenu, setShowAssignMenu] = useState(false);

  const difficultyColors = {
    easy: 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400',
    medium: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400',
    hard: 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400',
  };

  return (
    <Card className="p-6 hover:shadow-lg transition-shadow relative">
      <div className="absolute top-4 right-4">
        <span className="px-3 py-1 bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400 rounded-full text-xs font-semibold">
          {quest.subject}
        </span>
      </div>

      <div className="mb-4">
        <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center">
          <BookOpen className="w-6 h-6 text-white" />
        </div>
      </div>

      <h3 className="font-merriweather text-lg font-bold text-gray-900 dark:text-white mb-2 pr-16">
        {quest.title}
      </h3>
      <p className="text-sm text-gray-600 dark:text-gray-400 mb-4 line-clamp-2">
        {quest.description}
      </p>

      <div className="flex flex-wrap gap-2 mb-4">
        <span className={`px-2 py-1 rounded text-xs font-semibold ${difficultyColors[quest.difficulty]}`}>
          {quest.difficulty.charAt(0).toUpperCase() + quest.difficulty.slice(1)}
        </span>
        <span className="px-2 py-1 bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300 rounded text-xs font-semibold">
          {quest.gradeLevel === 0 ? 'K' : `Grade ${quest.gradeLevel}`}
        </span>
      </div>

      <div className="flex items-center justify-between text-sm text-gray-600 dark:text-gray-400 mb-4">
        <div className="flex items-center gap-1">
          <Clock className="w-4 h-4" />
          <span>{quest.estimatedMinutes} min</span>
        </div>
        <div className="flex items-center gap-1">
          <Award className="w-4 h-4" />
          <span>{quest.xpReward} XP</span>
        </div>
        <div className="flex items-center gap-1">
          <Users className="w-4 h-4" />
          <span>{quest.totalChallenges} tasks</span>
        </div>
      </div>

      <div className="relative">
        <Button
          variant="primary"
          className="w-full"
          onClick={() => setShowAssignMenu(!showAssignMenu)}
        >
          Assign to Class
        </Button>

        {showAssignMenu && (
          <div className="absolute bottom-full left-0 right-0 mb-2 bg-white dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-700 rounded-lg shadow-lg max-h-48 overflow-y-auto z-10">
            {classes.length === 0 ? (
              <div className="p-4 text-center text-sm text-gray-600 dark:text-gray-400">
                No classes yet. Create a class first!
              </div>
            ) : (
              classes.map((cls) => (
                <button
                  key={cls.classId}
                  onClick={() => {
                    onAssign(quest.questId, cls.classId);
                    setShowAssignMenu(false);
                  }}
                  className="w-full px-4 py-2 text-left hover:bg-gray-100 dark:hover:bg-gray-700 text-sm text-gray-900 dark:text-white border-b border-gray-200 dark:border-gray-700 last:border-0"
                >
                  {cls.className}
                </button>
              ))}
            )}
          </div>
        )}
      </div>
    </Card>
  );
}
