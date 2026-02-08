"use client";

import { useState, useEffect } from "react";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { DashboardHeader } from "@/components/teacher/dashboard/DashboardHeader";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Search, Filter, BookOpen, Clock, Sparkles, X, User, Users } from "lucide-react";
import { questApi, QuestMetadata } from "@/lib/api/quests";
import { classApi, ClassDto } from "@/lib/api/classes";

export default function TeacherCurriculaPage() {
  const [quests, setQuests] = useState<QuestMetadata[]>([]);
  const [classes, setClasses] = useState<ClassDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedSubject, setSelectedSubject] = useState("all");
  const [selectedGrade, setSelectedGrade] = useState("all");
  const [showOnlyMine, setShowOnlyMine] = useState(true); // Default to My Quests
  const [showGenerateModal, setShowGenerateModal] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    loadData();
  }, [selectedSubject, selectedGrade, showOnlyMine]);

  const loadData = async () => {
    setLoading(true);
    try {
      const userStr = localStorage.getItem('user');
      const user = userStr ? JSON.parse(userStr) : null;
      const teacherId = user?.uid; // Changed from user.id to user.uid

      const filters: any = {};
      if (showOnlyMine && teacherId) filters.teacherId = teacherId;
      if (selectedSubject !== "all") filters.subject = selectedSubject;
      if (selectedGrade !== "all") filters.gradeLevel = selectedGrade;

      const [questsData, classesData] = await Promise.all([
        questApi.list(filters),
        classApi.getAll(),
      ]);
      setQuests(questsData);
      setClasses(classesData);
    } catch (error) {
      console.error("Failed to load data:", error);
    } finally {
      setLoading(false);
    }
  };

  const filteredQuests = quests.filter((quest) => {
    const matchesSearch =
      quest.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      quest.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesSearch;
  });

  const subjects = ["Science", "Math", "English", "History"];
  const grades = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];

  const handleAssignQuest = async (questId: string, classId: string) => {
    try {
      await questApi.assign({ questId, classId });
      alert("Quest assigned successfully!");
    } catch (error: any) {
      console.error("Failed to assign quest:", error);
      alert(error.response?.data?.message || "Failed to assign quest");
    }
  };

  const clearFilters = () => {
    setSearchQuery("");
    setSelectedSubject("all");
    setSelectedGrade("all");
    setShowOnlyMine(false);
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
          <div className="mb-8 flex items-center justify-between">
            <div>
              <h1 className="font-merriweather text-3xl font-bold text-gray-900 dark:text-white">
                Quest Library
              </h1>
              <p className="text-gray-600 dark:text-gray-400 mt-1">
                Browse and assign engaging quests to your classes
              </p>
            </div>
            <Button
              variant="primary"
              onClick={() => setShowGenerateModal(true)}
              className="flex items-center gap-2"
            >
              <Sparkles className="w-5 h-5" />
              Generate Quest with AI
            </Button>
          </div>

          <div className="mb-6 space-y-4">
            <div className="flex items-center gap-3 p-3 bg-white dark:bg-gray-800 rounded-lg border-2 border-gray-200 dark:border-gray-700">
              <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">View:</span>
              <div className="flex gap-2">
                <button
                  onClick={() => setShowOnlyMine(true)}
                  className={`px-4 py-2 rounded-lg font-semibold transition-colors flex items-center gap-2 ${
                    showOnlyMine
                      ? "bg-blue-500 text-white"
                      : "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600"
                  }`}
                >
                  <User className="w-4 h-4" />
                  My Quests
                </button>
                <button
                  onClick={() => setShowOnlyMine(false)}
                  className={`px-4 py-2 rounded-lg font-semibold transition-colors flex items-center gap-2 ${
                    !showOnlyMine
                      ? "bg-blue-500 text-white"
                      : "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600"
                  }`}
                >
                  <Users className="w-4 h-4" />
                  All Quests
                </button>
              </div>
            </div>

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
                {subjects.map((subject) => (
                  <option key={subject} value={subject}>
                    {subject}
                  </option>
                ))}
              </select>

              <select
                value={selectedGrade}
                onChange={(e) => setSelectedGrade(e.target.value)}
                className="px-4 py-2 border-2 border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
              >
                <option value="all">All Grades</option>
                {grades.map((grade) => (
                  <option key={grade} value={grade}>
                    Grade {grade}
                  </option>
                ))}
              </select>

              {(searchQuery || selectedSubject !== "all" || selectedGrade !== "all" || showOnlyMine) && (
                <button
                  onClick={clearFilters}
                  className="text-sm text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
                >
                  Clear all filters
                </button>
              )}
            </div>
          </div>

          <div className="mb-6">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Showing {filteredQuests.length} of {quests.length} quests
              {showOnlyMine && " (your quests)"}
            </p>
          </div>

          {filteredQuests.length === 0 ? (
            <Card className="p-12 text-center">
              <div className="text-6xl mb-4">🔍</div>
              <h3 className="font-merriweather text-xl font-bold text-gray-900 dark:text-white mb-2">
                No Quests Found
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                {showOnlyMine
                  ? "You haven't created any quests yet. Generate your first quest!"
                  : "Try adjusting your filters or generate a new quest!"}
              </p>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredQuests.map((quest) => (
                <QuestCard
                  key={quest.id}
                  quest={quest}
                  classes={classes}
                  onAssign={handleAssignQuest}
                />
              ))}
            </div>
          )}
        </main>

        {showGenerateModal && (
          <GenerateQuestModal
            onClose={() => setShowGenerateModal(false)}
            onSuccess={() => {
              setShowGenerateModal(false);
              loadData();
            }}
          />
        )}
      </div>
    </ProtectedRoute>
  );
}

function GenerateQuestModal({
  onClose,
  onSuccess,
}: {
  onClose: () => void;
  onSuccess: () => void;
}) {
  const [subject, setSubject] = useState("Science");
  const [gradeLevel, setGradeLevel] = useState(5);
  const [topic, setTopic] = useState("");
  const [difficulty, setDifficulty] = useState<"enrichment" | "standard" | "scaffolded">("standard");
  const [generating, setGenerating] = useState(false);

  const handleGenerate = async () => {
    if (!topic.trim()) {
      alert("Please enter a topic");
      return;
    }

    setGenerating(true);
    try {
      await questApi.generate({
        subject,
        gradeLevel,
        topic: topic.trim(),
        difficulty,
        durationMinutes: 30,
      });
      alert("Quest generated successfully!");
      onSuccess();
    } catch (error: any) {
      console.error("Failed to generate quest:", error);
      alert(error.response?.data?.message || "Failed to generate quest");
    } finally {
      setGenerating(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-2xl p-8 relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
        >
          <X className="w-6 h-6" />
        </button>

        <div className="mb-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center">
              <Sparkles className="w-6 h-6 text-white" />
            </div>
            <h2 className="font-merriweather text-2xl font-bold text-gray-900 dark:text-white">
              Generate Quest with AI
            </h2>
          </div>
          <p className="text-gray-600 dark:text-gray-400">
            Our AI will create a complete, engaging quest tailored to your specifications
          </p>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
              Subject
            </label>
            <select
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              className="w-full px-4 py-2 border-2 border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
            >
              <option value="Science">Science</option>
              <option value="Math">Math</option>
              <option value="English">English</option>
              <option value="History">History</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
              Grade Level
            </label>
            <select
              value={gradeLevel}
              onChange={(e) => setGradeLevel(Number(e.target.value))}
              className="w-full px-4 py-2 border-2 border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
            >
              {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map((grade) => (
                <option key={grade} value={grade}>
                  Grade {grade}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
              Topic *
            </label>
            <input
              type="text"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              placeholder="e.g., Photosynthesis, Fractions"
              className="w-full px-4 py-2 border-2 border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
              Difficulty
            </label>
            <div className="flex gap-3">
              {["enrichment", "standard", "scaffolded"].map((level) => (
                <button
                  key={level}
                  onClick={() => setDifficulty(level as any)}
                  className={`flex-1 px-4 py-2 rounded-lg border-2 font-semibold transition-colors ${
                    difficulty === level
                      ? "bg-blue-500 text-white border-blue-500"
                      : "bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border-gray-300 dark:border-gray-600 hover:border-blue-500"
                  }`}
                >
                  {level.charAt(0).toUpperCase() + level.slice(1)}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="flex gap-4 mt-8">
          <Button variant="secondary" onClick={onClose} className="flex-1">
            Cancel
          </Button>
          <Button
            variant="primary"
            onClick={handleGenerate}
            disabled={generating}
            className="flex-1 flex items-center justify-center gap-2"
          >
            {generating ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                Generating...
              </>
            ) : (
              <>
                <Sparkles className="w-5 h-5" />
                Generate Quest
              </>
            )}
          </Button>
        </div>
      </Card>
    </div>
  );
}

function QuestCard({
  quest,
  classes,
  onAssign,
}: {
  quest: QuestMetadata;
  classes: ClassDto[];
  onAssign: (questId: string, classId: string) => void;
}) {
  const [showAssignMenu, setShowAssignMenu] = useState(false);

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
        <span className="px-2 py-1 bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300 rounded text-xs font-semibold">
          {quest.gradeLevel === "0" ? "K" : `Grade ${quest.gradeLevel}`}
        </span>
      </div>

      <div className="flex items-center text-sm text-gray-600 dark:text-gray-400 mb-4">
        <Clock className="w-4 h-4 mr-1" />
        <span>{quest.durationMinutes} min</span>
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
                  key={cls.id}
                  onClick={() => {
                    onAssign(quest.id, cls.id);
                    setShowAssignMenu(false);
                  }}
                  className="w-full px-4 py-2 text-left hover:bg-gray-100 dark:hover:bg-gray-700 text-sm text-gray-900 dark:text-white border-b border-gray-200 dark:border-gray-700 last:border-0"
                >
                  {cls.name}
                </button>
              ))
            )}
          </div>
        )}
      </div>
    </Card>
  );
}
