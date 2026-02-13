"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { DashboardHeader } from "@/components/teacher/dashboard/DashboardHeader";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import {
  Search,
  Filter,
  BookOpen,
  Clock,
  Sparkles,
  X,
  User,
  Users,
  Plus,
  Trash2,
  Library,
  CalendarDays,
  GraduationCap,
  ListChecks,
} from "lucide-react";
import { questApi, QuestMetadata } from "@/lib/api/quests";
import { classApi, ClassDto } from "@/lib/api/classes";
import {
  listCurricula,
  createCurriculum,
  deleteCurriculum,
  addQuestToCurriculum,
  Curriculum,
} from "@/lib/api/curricula";

type TabKey = "my-curricula" | "quest-library";

export default function TeacherCurriculaPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<TabKey>("my-curricula");

  // Shared state
  const [classes, setClasses] = useState<ClassDto[]>([]);
  const [currentUser, setCurrentUser] = useState<{ uid: string; displayName: string } | null>(null);

  // My Curricula state
  const [curricula, setCurricula] = useState<Curriculum[]>([]);
  const [curriculaLoading, setCurriculaLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);

  // Quest Library state
  const [quests, setQuests] = useState<QuestMetadata[]>([]);
  const [questsLoading, setQuestsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedSubject, setSelectedSubject] = useState("all");
  const [selectedGrade, setSelectedGrade] = useState("all");
  const [showOnlyMine, setShowOnlyMine] = useState(true);
  const [showGenerateModal, setShowGenerateModal] = useState(false);

  const subjects = ["Math", "Science", "ELA", "Social Studies", "History", "Art", "Music", "PE", "Other"];
  const grades = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];

  useEffect(() => {
    const userStr = localStorage.getItem("user");
    const user = userStr ? JSON.parse(userStr) : null;
    setCurrentUser(user);
  }, []);

  useEffect(() => {
    if (currentUser) {
      loadCurricula();
      loadQuestData();
    }
  }, [currentUser]);

  useEffect(() => {
    if (currentUser) {
      loadQuestData();
    }
  }, [selectedSubject, selectedGrade, showOnlyMine]);

  const loadCurricula = async () => {
    if (!currentUser) return;
    setCurriculaLoading(true);
    try {
      const data = await listCurricula({ teacherId: currentUser.uid });
      setCurricula(data);
    } catch (error) {
      console.error("Failed to load curricula:", error);
    } finally {
      setCurriculaLoading(false);
    }
  };

  const loadQuestData = async () => {
    if (!currentUser) return;
    setQuestsLoading(true);
    try {
      const filters: any = {};
      if (showOnlyMine) filters.teacherId = currentUser.uid;
      if (selectedSubject !== "all") filters.subject = selectedSubject;
      if (selectedGrade !== "all") filters.gradeLevel = selectedGrade;

      const [questsData, classesData] = await Promise.all([
        questApi.list(filters),
        classApi.getAll(),
      ]);
      setQuests(questsData);
      setClasses(classesData);
    } catch (error) {
      console.error("Failed to load quest data:", error);
    } finally {
      setQuestsLoading(false);
    }
  };

  const filteredQuests = quests.filter((quest) => {
    const matchesSearch =
      quest.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      quest.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesSearch;
  });

  const handleAssignQuest = async (questId: string, classId: string) => {
    try {
      await questApi.assign({ questId, classId });
      alert("Quest assigned successfully!");
    } catch (error: any) {
      console.error("Failed to assign quest:", error);
      alert(error.response?.data?.message || "Failed to assign quest");
    }
  };

  const handleDeleteQuest = async (questId: string) => {
    if (!window.confirm("Are you sure you want to delete this quest? This action cannot be undone.")) return;
    try {
      await questApi.delete(questId);
      setQuests((prev) => prev.filter((q) => q.id !== questId));
    } catch (error: any) {
      console.error("Failed to delete quest:", error);
      alert(error.response?.data?.message || "Failed to delete quest");
    }
  };

  const handleDeleteCurriculum = async (id: string) => {
    if (!window.confirm("Are you sure you want to delete this curriculum? This action cannot be undone.")) return;
    try {
      await deleteCurriculum(id);
      setCurricula((prev) => prev.filter((c) => c.id !== id));
    } catch (error: any) {
      console.error("Failed to delete curriculum:", error);
      alert(error.response?.data?.message || "Failed to delete curriculum");
    }
  };

  const handleAddQuestToCurriculum = async (curriculumId: string, questId: string) => {
    try {
      await addQuestToCurriculum(curriculumId, questId);
      alert("Quest added to curriculum!");
      loadCurricula();
    } catch (error: any) {
      console.error("Failed to add quest to curriculum:", error);
      alert(error.response?.data?.message || "Failed to add quest to curriculum");
    }
  };

  const clearFilters = () => {
    setSearchQuery("");
    setSelectedSubject("all");
    setSelectedGrade("all");
    setShowOnlyMine(false);
  };

  const loading = activeTab === "my-curricula" ? curriculaLoading : questsLoading;

  if (!currentUser || loading) {
    return (
      <ProtectedRoute requiredRole="TEACHER">
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
          <DashboardHeader />
          <div className="flex items-center justify-center h-96">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-gray-600 dark:text-gray-400">
                {activeTab === "my-curricula" ? "Loading curricula..." : "Loading quest library..."}
              </p>
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
          {/* Page Header */}
          <div className="mb-8">
            <h1 className="font-merriweather text-3xl font-bold text-gray-900 dark:text-white">
              Curricula & Quests
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              Manage your curricula and browse the quest library
            </p>
          </div>

          {/* Tab Navigation */}
          <div className="mb-8 border-b-2 border-gray-200 dark:border-gray-700">
            <div className="flex gap-0">
              <button
                onClick={() => setActiveTab("my-curricula")}
                className={`px-6 py-3 font-semibold text-sm transition-colors border-b-2 -mb-[2px] flex items-center gap-2 ${
                  activeTab === "my-curricula"
                    ? "border-blue-500 text-blue-600 dark:text-blue-400"
                    : "border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
                }`}
              >
                <Library className="w-4 h-4" />
                My Curricula
              </button>
              <button
                onClick={() => setActiveTab("quest-library")}
                className={`px-6 py-3 font-semibold text-sm transition-colors border-b-2 -mb-[2px] flex items-center gap-2 ${
                  activeTab === "quest-library"
                    ? "border-blue-500 text-blue-600 dark:text-blue-400"
                    : "border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
                }`}
              >
                <BookOpen className="w-4 h-4" />
                Quest Library
              </button>
            </div>
          </div>

          {/* Tab Content */}
          {activeTab === "my-curricula" ? (
            <MyCurriculaTab
              curricula={curricula}
              onDelete={handleDeleteCurriculum}
              onCreateClick={() => setShowCreateModal(true)}
              router={router}
            />
          ) : (
            <QuestLibraryTab
              quests={filteredQuests}
              totalQuests={quests.length}
              classes={classes}
              curricula={curricula}
              currentUser={currentUser}
              searchQuery={searchQuery}
              selectedSubject={selectedSubject}
              selectedGrade={selectedGrade}
              showOnlyMine={showOnlyMine}
              subjects={subjects}
              grades={grades}
              onSearchChange={setSearchQuery}
              onSubjectChange={setSelectedSubject}
              onGradeChange={setSelectedGrade}
              onToggleMine={setShowOnlyMine}
              onClearFilters={clearFilters}
              onAssign={handleAssignQuest}
              onDeleteQuest={handleDeleteQuest}
              onAddToCurriculum={handleAddQuestToCurriculum}
              onGenerateClick={() => setShowGenerateModal(true)}
            />
          )}
        </main>

        {/* Create Curriculum Modal */}
        {showCreateModal && (
          <CreateCurriculumModal
            currentUser={currentUser}
            onClose={() => setShowCreateModal(false)}
            onSuccess={(newCurriculum) => {
              setShowCreateModal(false);
              router.push(`/teacher/curricula/${newCurriculum.id}`);
            }}
          />
        )}

        {/* Generate Quest Modal */}
        {showGenerateModal && (
          <GenerateQuestModal
            onClose={() => setShowGenerateModal(false)}
            onSuccess={() => {
              setShowGenerateModal(false);
              loadQuestData();
            }}
          />
        )}
      </div>
    </ProtectedRoute>
  );
}

// =============================================================================
// My Curricula Tab
// =============================================================================

function MyCurriculaTab({
  curricula,
  onDelete,
  onCreateClick,
  router,
}: {
  curricula: Curriculum[];
  onDelete: (id: string) => void;
  onCreateClick: () => void;
  router: ReturnType<typeof import("next/navigation").useRouter>;
}) {
  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <p className="text-sm text-gray-600 dark:text-gray-400">
          {curricula.length} {curricula.length === 1 ? "curriculum" : "curricula"}
        </p>
        <Button
          variant="primary"
          onClick={onCreateClick}
          className="flex items-center gap-2"
        >
          <Plus className="w-5 h-5" />
          Create Curriculum
        </Button>
      </div>

      {curricula.length === 0 ? (
        <Card className="p-12 text-center">
          <div className="w-16 h-16 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center mx-auto mb-4">
            <Library className="w-8 h-8 text-gray-400" />
          </div>
          <h3 className="font-merriweather text-xl font-bold text-gray-900 dark:text-white mb-2">
            No Curricula Yet
          </h3>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            Create your first curriculum to organize quests into a structured learning plan.
          </p>
          <Button
            variant="primary"
            onClick={onCreateClick}
            className="inline-flex items-center gap-2"
          >
            <Plus className="w-5 h-5" />
            Create Curriculum
          </Button>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {curricula.map((curriculum) => (
            <CurriculumCard
              key={curriculum.id}
              curriculum={curriculum}
              onClick={() => router.push(`/teacher/curricula/${curriculum.id}`)}
              onDelete={() => onDelete(curriculum.id)}
            />
          ))}
        </div>
      )}
    </div>
  );
}

// =============================================================================
// Curriculum Card
// =============================================================================

function CurriculumCard({
  curriculum,
  onClick,
  onDelete,
}: {
  curriculum: Curriculum;
  onClick: () => void;
  onDelete: () => void;
}) {
  const statusColors: Record<string, string> = {
    DRAFT: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400",
    PUBLISHED: "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400",
    ARCHIVED: "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-400",
  };

  return (
    <Card className="p-6 hover:shadow-lg transition-shadow relative group">
      {/* Subject badge */}
      <div className="absolute top-4 right-4 flex items-center gap-2">
        <span className="px-3 py-1 bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400 rounded-full text-xs font-semibold">
          {curriculum.subject}
        </span>
      </div>

      {/* Clickable area */}
      <div className="cursor-pointer" onClick={onClick}>
        <div className="mb-4">
          <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center">
            <Library className="w-6 h-6 text-white" />
          </div>
        </div>

        <h3 className="font-merriweather text-lg font-bold text-gray-900 dark:text-white mb-2 pr-20">
          {curriculum.title}
        </h3>
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-4 line-clamp-2">
          {curriculum.description || "No description provided."}
        </p>

        <div className="flex flex-wrap gap-2 mb-4">
          <span className={`px-2 py-1 rounded text-xs font-semibold ${statusColors[curriculum.status] || statusColors.DRAFT}`}>
            {curriculum.status}
          </span>
          {curriculum.curriculumType === "ADAPTIVE" && (
            <span className="px-2 py-1 bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-400 rounded text-xs font-semibold">
              Adaptive
            </span>
          )}
          <span className="px-2 py-1 bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300 rounded text-xs font-semibold">
            <GraduationCap className="w-3 h-3 inline mr-1" />
            Grade {curriculum.gradeLevel}
          </span>
        </div>

        <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
          <span className="flex items-center gap-1">
            <CalendarDays className="w-4 h-4" />
            {curriculum.durationDays} days
          </span>
          <span className="flex items-center gap-1">
            <ListChecks className="w-4 h-4" />
            {curriculum.totalQuests} {curriculum.totalQuests === 1 ? "quest" : "quests"}
          </span>
        </div>
      </div>

      {/* Delete button */}
      <button
        onClick={(e) => {
          e.stopPropagation();
          onDelete();
        }}
        className="absolute bottom-4 right-4 p-2 text-gray-400 hover:text-red-500 dark:hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity"
        title="Delete curriculum"
      >
        <Trash2 className="w-4 h-4" />
      </button>
    </Card>
  );
}

// =============================================================================
// Create Curriculum Modal
// =============================================================================

function CreateCurriculumModal({
  currentUser,
  onClose,
  onSuccess,
}: {
  currentUser: { uid: string; displayName: string };
  onClose: () => void;
  onSuccess: (curriculum: Curriculum) => void;
}) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [subject, setSubject] = useState("Math");
  const [gradeLevel, setGradeLevel] = useState("5");
  const [durationDays, setDurationDays] = useState(10);
  const [startDate, setStartDate] = useState("");
  const [curriculumType, setCurriculumType] = useState<"STANDARD" | "ADAPTIVE">("STANDARD");
  const [submitting, setSubmitting] = useState(false);

  const subjects = ["Math", "Science", "ELA", "Social Studies", "History", "Art", "Music", "PE", "Other"];

  const handleSubmit = async () => {
    if (!title.trim()) {
      alert("Please enter a title");
      return;
    }

    setSubmitting(true);
    try {
      const data: any = {
        teacherId: currentUser.uid,
        teacherName: currentUser.displayName,
        title: title.trim(),
        description: description.trim(),
        subject,
        gradeLevel,
        durationDays,
        curriculumType,
      };
      if (startDate) {
        data.startDate = startDate;
      }

      const newCurriculum = await createCurriculum(data);
      onSuccess(newCurriculum);
    } catch (error: any) {
      console.error("Failed to create curriculum:", error);
      alert(error.response?.data?.message || "Failed to create curriculum");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-2xl p-8 relative max-h-[90vh] overflow-y-auto">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
        >
          <X className="w-6 h-6" />
        </button>

        <div className="mb-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center">
              <Library className="w-6 h-6 text-white" />
            </div>
            <h2 className="font-merriweather text-2xl font-bold text-gray-900 dark:text-white">
              Create Curriculum
            </h2>
          </div>
          <p className="text-gray-600 dark:text-gray-400">
            Set up a new curriculum to organize quests into a structured learning plan
          </p>
        </div>

        <div className="space-y-4">
          {/* Curriculum Type Toggle */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
              Curriculum Type
            </label>
            <div className="flex gap-3">
              <button
                onClick={() => setCurriculumType("STANDARD")}
                className={`flex-1 px-4 py-3 rounded-lg border-2 font-semibold transition-colors text-left ${
                  curriculumType === "STANDARD"
                    ? "bg-blue-500 text-white border-blue-500"
                    : "bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border-gray-300 dark:border-gray-600 hover:border-blue-500"
                }`}
              >
                <div className="font-bold">Standard</div>
                <div className="text-xs mt-1 opacity-75">Same quests for all students</div>
              </button>
              <button
                onClick={() => {
                  setCurriculumType("ADAPTIVE");
                  if (durationDays < 5) setDurationDays(10);
                }}
                className={`flex-1 px-4 py-3 rounded-lg border-2 font-semibold transition-colors text-left ${
                  curriculumType === "ADAPTIVE"
                    ? "bg-purple-500 text-white border-purple-500"
                    : "bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border-gray-300 dark:border-gray-600 hover:border-purple-500"
                }`}
              >
                <div className="font-bold">Adaptive</div>
                <div className="text-xs mt-1 opacity-75">3 tracks based on diagnostic</div>
              </button>
            </div>
            {curriculumType === "ADAPTIVE" && (
              <div className="mt-3 p-3 bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800 rounded-lg">
                <p className="text-sm text-purple-800 dark:text-purple-300">
                  <strong>How it works:</strong> Day 1 is a diagnostic assessment. Based on results,
                  students are placed into Advanced, Grade Level, or Foundational tracks.
                  Days 2+ have tailored quests per track. Students who struggle get
                  auto-generated review tutorials.
                </p>
              </div>
            )}
          </div>

          {/* Title */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
              Title *
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g., Introduction to Fractions"
              className="w-full px-4 py-2 border-2 border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
              Description
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe what students will learn in this curriculum..."
              rows={3}
              className="w-full px-4 py-2 border-2 border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
            />
          </div>

          {/* Subject and Grade Level row */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                Subject
              </label>
              <select
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                className="w-full px-4 py-2 border-2 border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
              >
                {subjects.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                Grade Level
              </label>
              <select
                value={gradeLevel}
                onChange={(e) => setGradeLevel(e.target.value)}
                className="w-full px-4 py-2 border-2 border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
              >
                {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map((grade) => (
                  <option key={grade} value={String(grade)}>
                    Grade {grade}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Duration and Start Date row */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                Duration (days)
              </label>
              <input
                type="number"
                value={durationDays}
                onChange={(e) => setDurationDays(Number(e.target.value))}
                min={curriculumType === "ADAPTIVE" ? 5 : 1}
                className="w-full px-4 py-2 border-2 border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                Start Date (optional)
              </label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full px-4 py-2 border-2 border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
        </div>

        <div className="flex gap-4 mt-8">
          <Button variant="secondary" onClick={onClose} className="flex-1">
            Cancel
          </Button>
          <Button
            variant="primary"
            onClick={handleSubmit}
            disabled={submitting}
            className="flex-1 flex items-center justify-center gap-2"
          >
            {submitting ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                Creating...
              </>
            ) : (
              <>
                <Plus className="w-5 h-5" />
                Create Curriculum
              </>
            )}
          </Button>
        </div>
      </Card>
    </div>
  );
}

// =============================================================================
// Quest Library Tab
// =============================================================================

function QuestLibraryTab({
  quests,
  totalQuests,
  classes,
  curricula,
  currentUser,
  searchQuery,
  selectedSubject,
  selectedGrade,
  showOnlyMine,
  subjects,
  grades,
  onSearchChange,
  onSubjectChange,
  onGradeChange,
  onToggleMine,
  onClearFilters,
  onAssign,
  onDeleteQuest,
  onAddToCurriculum,
  onGenerateClick,
}: {
  quests: QuestMetadata[];
  totalQuests: number;
  classes: ClassDto[];
  curricula: Curriculum[];
  currentUser: { uid: string; displayName: string };
  searchQuery: string;
  selectedSubject: string;
  selectedGrade: string;
  showOnlyMine: boolean;
  subjects: string[];
  grades: number[];
  onSearchChange: (value: string) => void;
  onSubjectChange: (value: string) => void;
  onGradeChange: (value: string) => void;
  onToggleMine: (value: boolean) => void;
  onClearFilters: () => void;
  onAssign: (questId: string, classId: string) => void;
  onDeleteQuest: (questId: string) => void;
  onAddToCurriculum: (curriculumId: string, questId: string) => void;
  onGenerateClick: () => void;
}) {
  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <p className="text-gray-600 dark:text-gray-400">
            Browse and assign engaging quests to your classes
          </p>
        </div>
        <Button
          variant="primary"
          onClick={onGenerateClick}
          className="flex items-center gap-2"
        >
          <Sparkles className="w-5 h-5" />
          Generate Quest with AI
        </Button>
      </div>

      {/* Filters */}
      <div className="mb-6 space-y-4">
        <div className="flex items-center gap-3 p-3 bg-white dark:bg-gray-800 rounded-lg border-2 border-gray-200 dark:border-gray-700">
          <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">View:</span>
          <div className="flex gap-2">
            <button
              onClick={() => onToggleMine(true)}
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
              onClick={() => onToggleMine(false)}
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
            onChange={(e) => onSearchChange(e.target.value)}
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
            onChange={(e) => onSubjectChange(e.target.value)}
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
            onChange={(e) => onGradeChange(e.target.value)}
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
              onClick={onClearFilters}
              className="text-sm text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
            >
              Clear all filters
            </button>
          )}
        </div>
      </div>

      <div className="mb-6">
        <p className="text-sm text-gray-600 dark:text-gray-400">
          Showing {quests.length} of {totalQuests} quests
          {showOnlyMine && " (your quests)"}
        </p>
      </div>

      {quests.length === 0 ? (
        <Card className="p-12 text-center">
          <div className="w-16 h-16 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center mx-auto mb-4">
            <Search className="w-8 h-8 text-gray-400" />
          </div>
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
          {quests.map((quest) => (
            <QuestCard
              key={quest.id}
              quest={quest}
              classes={classes}
              curricula={curricula}
              currentUser={currentUser}
              onAssign={onAssign}
              onDelete={onDeleteQuest}
              onAddToCurriculum={onAddToCurriculum}
            />
          ))}
        </div>
      )}
    </div>
  );
}

// =============================================================================
// Quest Card
// =============================================================================

function QuestCard({
  quest,
  classes,
  curricula,
  currentUser,
  onAssign,
  onDelete,
  onAddToCurriculum,
}: {
  quest: QuestMetadata;
  classes: ClassDto[];
  curricula: Curriculum[];
  currentUser: { uid: string; displayName: string };
  onAssign: (questId: string, classId: string) => void;
  onDelete: (questId: string) => void;
  onAddToCurriculum: (curriculumId: string, questId: string) => void;
}) {
  const [showAssignMenu, setShowAssignMenu] = useState(false);
  const [showCurriculumMenu, setShowCurriculumMenu] = useState(false);

  const isOwner = quest.createdBy === currentUser.uid;

  return (
    <Card className="p-6 hover:shadow-lg transition-shadow relative">
      <div className="absolute top-4 right-4 flex items-center gap-2">
        <span className="px-3 py-1 bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400 rounded-full text-xs font-semibold">
          {quest.subject}
        </span>
        {isOwner && (
          <button
            onClick={() => onDelete(quest.id)}
            className="p-1 text-gray-400 hover:text-red-500 dark:hover:text-red-400 transition-colors"
            title="Delete quest"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        )}
      </div>

      <div className="mb-4">
        <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center">
          <BookOpen className="w-6 h-6 text-white" />
        </div>
      </div>

      <h3 className="font-merriweather text-lg font-bold text-gray-900 dark:text-white mb-2 pr-20">
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

      <div className="flex gap-2">
        {/* Assign to Class */}
        <div className="relative flex-1">
          <Button
            variant="primary"
            className="w-full text-sm"
            onClick={() => {
              setShowAssignMenu(!showAssignMenu);
              setShowCurriculumMenu(false);
            }}
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

        {/* Add to Curriculum */}
        <div className="relative">
          <Button
            variant="secondary"
            className="text-sm px-3"
            onClick={() => {
              setShowCurriculumMenu(!showCurriculumMenu);
              setShowAssignMenu(false);
            }}
            title="Add to Curriculum"
          >
            <Plus className="w-4 h-4" />
          </Button>

          {showCurriculumMenu && (
            <div className="absolute bottom-full right-0 mb-2 bg-white dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-700 rounded-lg shadow-lg max-h-48 overflow-y-auto z-10 w-56">
              <div className="px-4 py-2 border-b border-gray-200 dark:border-gray-700">
                <span className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">
                  Add to Curriculum
                </span>
              </div>
              {curricula.length === 0 ? (
                <div className="p-4 text-center text-sm text-gray-600 dark:text-gray-400">
                  No curricula yet. Create one first!
                </div>
              ) : (
                curricula.map((curriculum) => (
                  <button
                    key={curriculum.id}
                    onClick={() => {
                      onAddToCurriculum(curriculum.id, quest.id);
                      setShowCurriculumMenu(false);
                    }}
                    className="w-full px-4 py-2 text-left hover:bg-gray-100 dark:hover:bg-gray-700 text-sm text-gray-900 dark:text-white border-b border-gray-200 dark:border-gray-700 last:border-0"
                  >
                    {curriculum.title}
                  </button>
                ))
              )}
            </div>
          )}
        </div>
      </div>
    </Card>
  );
}

// =============================================================================
// Generate Quest Modal
// =============================================================================

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
  const [difficulty, setDifficulty] = useState<"advanced" | "grade-level" | "foundational">("grade-level");
  const [generating, setGenerating] = useState(false);

  const difficultyOptions = [
    { value: "advanced", label: "Advanced", description: "For high-achieving students" },
    { value: "grade-level", label: "Grade-Level", description: "Standard curriculum" },
    { value: "foundational", label: "Foundational", description: "With additional support" },
  ];

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
              <option value="Math">Math</option>
              <option value="Science">Science</option>
              <option value="ELA">English Language Arts</option>
              <option value="Social Studies">Social Studies</option>
              <option value="History">History</option>
              <option value="Art">Art</option>
              <option value="Music">Music</option>
              <option value="PE">Physical Education</option>
              <option value="Other">Other</option>
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
              Difficulty Level
            </label>
            <div className="flex gap-3">
              {difficultyOptions.map((option) => (
                <button
                  key={option.value}
                  onClick={() => setDifficulty(option.value as any)}
                  className={`flex-1 px-4 py-3 rounded-lg border-2 font-semibold transition-colors ${
                    difficulty === option.value
                      ? "bg-blue-500 text-white border-blue-500"
                      : "bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border-gray-300 dark:border-gray-600 hover:border-blue-500"
                  }`}
                >
                  <div className="font-bold">{option.label}</div>
                  <div className="text-xs mt-1 opacity-75">{option.description}</div>
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
