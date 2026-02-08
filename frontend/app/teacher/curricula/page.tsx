"use client";

import { useState, useEffect } from "react";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { DashboardHeader } from "@/components/teacher/dashboard/DashboardHeader";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Search, Filter, BookOpen, Clock, Award, Target } from "lucide-react";
import { questApi, QuestDto } from "@/lib/api/quests";
import Link from "next/link";

export default function TeacherCurriculaPage() {
  const [quests, setQuests] = useState<QuestDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedSubject, setSelectedSubject] = useState<string>("");
  const [selectedGrade, setSelectedGrade] = useState<string>("");
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>("");

  useEffect(() => {
    loadQuests();
  }, []);

  const loadQuests = async () => {
    try {
      const data = await questApi.getAll();
      setQuests(data);
    } catch (error) {
      console.error('Failed to load quests:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredQuests = quests.filter((quest) => {
    const matchesSearch = quest.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         quest.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesSubject = !selectedSubject || quest.subject === selectedSubject;
    const matchesGrade = !selectedGrade || quest.gradeLevel.toString() === selectedGrade;
    const matchesDifficulty = !selectedDifficulty || quest.difficulty === selectedDifficulty;
    
    return matchesSearch && matchesSubject && matchesGrade && matchesDifficulty;
  });

  const subjects = Array.from(new Set(quests.map(q => q.subject)));
  const grades = Array.from(new Set(quests.map(q => q.gradeLevel))).sort((a, b) => a - b);

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
          {/* Header */}
          <div className="mb-8">
            <h1 className="font-merriweather text-3xl font-bold text-gray-900 dark:text-white">
              Quest Library
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              Browse and assign quests to your classes
            </p>
          </div>

          {/* Search and Filters */}
          <div className="mb-8 space-y-4">
            {/* Search Bar */}
            <div className="relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search quests by title or description..."
                className="w-full pl-12 pr-4 py-3 border-2 border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
              />
            </div>

            {/* Filters */}
            <div className="flex flex-wrap gap-4">
              <div className="flex items-center gap-2">
                <Filter className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                  Filters:
                </span>
              </div>

              <select
                value={selectedSubject}
                onChange={(e) => setSelectedSubject(e.target.value)}
                className="px-4 py-2 border-2 border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm"
              >
                <option value="">All Subjects</option>
                {subjects.map((subject) => (
                  <option key={subject} value={subject}>
                    {subject}
                  </option>
                ))}
              </select>

              <select
                value={selectedGrade}
                onChange={(e) => setSelectedGrade(e.target.value)}
                className="px-4 py-2 border-2 border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm"
              >
                <option value="">All Grades</option>
                {grades.map((grade) => (
                  <option key={grade} value={grade}>
                    {grade === 0 ? 'Kindergarten' : `Grade ${grade}`}
                  </option>
                ))}
              </select>

              <select
                value={selectedDifficulty}
                onChange={(e) => setSelectedDifficulty(e.target.value)}
                className="px-4 py-2 border-2 border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm"
              >
                <option value="">All Difficulties</option>
                <option value="easy">Easy</option>
                <option value="medium">Medium</option>
                <option value="hard">Hard</option>
              </select>

              {(searchTerm || selectedSubject || selectedGrade || selectedDifficulty) && (
                <button
                  onClick={() => {
                    setSearchTerm("");
                    setSelectedSubject("");
                    setSelectedGrade("");
                    setSelectedDifficulty("");
                  }}
                  className="px-4 py-2 text-sm text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
                >
                  Clear Filters
                </button>
              )}
            </div>
          </div>

          {/* Results Count */}
          <div className="mb-4">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Showing {filteredQuests.length} of {quests.length} quests
            </p>
          </div>

          {/* Quest Grid */}
          {filteredQuests.length === 0 ? (
            <Card className="p-12 text-center">
              <div className="text-6xl mb-4">🔍</div>
              <h3 className="font-merriweather text-xl font-bold text-gray-900 dark:text-white mb-2">
                No Quests Found
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                Try adjusting your search or filters
              </p>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredQuests.map((quest) => (
                <QuestCard key={quest.questId} quest={quest} />
              ))}
            </div>
          )}
        </main>
      </div>
    </ProtectedRoute>
  );
}

function QuestCard({ quest }: { quest: QuestDto }) {
  const [showAssignModal, setShowAssignModal] = useState(false);

  const difficultyColors = {
    easy: 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300',
    medium: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-300',
    hard: 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-300',
  };

  return (
    <Card className="p-6 hover:shadow-lg transition-shadow flex flex-col">
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1">
          <h3 className="font-merriweather text-lg font-bold text-gray-900 dark:text-white mb-1">
            {quest.title}
          </h3>
          <div className="flex items-center gap-2 text-sm">
            <span className="text-blue-600 dark:text-blue-400 font-semibold">
              {quest.subject}
            </span>
            <span className="text-gray-400">•</span>
            <span className="text-gray-600 dark:text-gray-400">
              {quest.gradeLevel === 0 ? 'K' : `Grade ${quest.gradeLevel}`}
            </span>
          </div>
        </div>
        <span className={`px-2 py-1 rounded-full text-xs font-semibold capitalize ${difficultyColors[quest.difficulty]}`}>
          {quest.difficulty}
        </span>
      </div>

      <p className="text-sm text-gray-600 dark:text-gray-400 mb-4 line-clamp-3">
        {quest.description}
      </p>

      <div className="grid grid-cols-3 gap-4 mb-4 text-sm">
        <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
          <Clock className="w-4 h-4" />
          <span>{quest.estimatedMinutes}m</span>
        </div>
        <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
          <Target className="w-4 h-4" />
          <span>{quest.totalChallenges} tasks</span>
        </div>
        <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
          <Award className="w-4 h-4" />
          <span>{quest.xpReward} XP</span>
        </div>
      </div>

      <div className="mt-auto flex gap-2">
        <Link href={`/teacher/curricula/${quest.questId}`} className="flex-1">
          <Button variant="secondary" className="w-full">
            <BookOpen className="w-4 h-4 mr-2" />
            Preview
          </Button>
        </Link>
        <Button 
          variant="primary" 
          className="flex-1"
          onClick={() => setShowAssignModal(true)}
        >
          Assign
        </Button>
      </div>
    </Card>
  );
}
