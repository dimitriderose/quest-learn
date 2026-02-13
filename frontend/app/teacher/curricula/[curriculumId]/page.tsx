"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { DashboardHeader } from "@/components/teacher/dashboard/DashboardHeader";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import {
  ArrowLeft,
  Trash2,
  Send,
  X,
  Search,
  Clock,
  BookOpen,
  Calendar,
  Plus,
  AlertTriangle,
  CheckCircle,
  GraduationCap,
  Sparkles,
  Users,
  Brain,
  TrendingUp,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import {
  getCurriculumDetail,
  deleteCurriculum,
  publishCurriculum,
  addQuestToCurriculum,
  removeQuestFromCurriculum,
  CurriculumDetailResponse,
  QuestSummaryDto,
  CurriculumDay,
} from "@/lib/api/curricula";
import { classApi, ClassDto } from "@/lib/api/classes";
import { questApi, QuestMetadata } from "@/lib/api/quests";
import {
  adaptiveApi,
  DiagnosticStatusResponse,
  CurriculumTracksResponse,
  GenerateTrackQuestsRequest,
} from "@/lib/api/adaptive";

export default function CurriculumDetailPage({
  params,
}: {
  params: Promise<{ curriculumId: string }>;
}) {
  const { curriculumId } = React.use(params);
  const router = useRouter();

  const [detail, setDetail] = useState<CurriculumDetailResponse | null>(null);
  const [classes, setClasses] = useState<ClassDto[]>([]);
  const [allQuests, setAllQuests] = useState<QuestMetadata[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Add quest panel state
  const [addQuestDayNumber, setAddQuestDayNumber] = useState<number | null>(null);
  const [questSearchQuery, setQuestSearchQuery] = useState("");

  // Delete confirmation
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleting, setDeleting] = useState(false);

  // Publishing
  const [publishing, setPublishing] = useState(false);

  // Assign to class dropdown
  const [showAssignDropdown, setShowAssignDropdown] = useState(false);

  // Track which classes have this curriculum assigned (local state since ClassDto does not expose it)
  const [assignedClassIds, setAssignedClassIds] = useState<Set<string>>(new Set());

  // Adaptive state
  const [diagnosticStatus, setDiagnosticStatus] = useState<DiagnosticStatusResponse | null>(null);
  const [tracksData, setTracksData] = useState<CurriculumTracksResponse | null>(null);
  const [generatingDiagnostic, setGeneratingDiagnostic] = useState(false);
  const [assessing, setAssessing] = useState(false);
  const [generatingDayQuests, setGeneratingDayQuests] = useState<number | null>(null);
  const [dayTopics, setDayTopics] = useState<Record<number, string>>({});
  const [showTracksPanel, setShowTracksPanel] = useState(false);
  const [overridingTrack, setOverridingTrack] = useState<string | null>(null);

  const loadData = useCallback(async () => {
    try {
      const userStr = localStorage.getItem("user");
      const user = userStr ? JSON.parse(userStr) : null;
      const teacherId = user?.uid;

      const [detailData, classesData, questsData] = await Promise.all([
        getCurriculumDetail(curriculumId),
        classApi.getAll(),
        teacherId ? questApi.list({ teacherId }) : questApi.list(),
      ]);

      if (!detailData) {
        setError("Curriculum not found");
        return;
      }

      setDetail(detailData);
      setClasses(classesData);
      setAllQuests(questsData);
    } catch (err: any) {
      console.error("Failed to load curriculum detail:", err);
      setError(err.response?.data?.message || "Failed to load curriculum");
    } finally {
      setLoading(false);
    }
  }, [curriculumId]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const isAdaptive = detail?.curriculum.curriculumType === "ADAPTIVE";

  // Load adaptive data when we have detail
  const loadAdaptiveData = useCallback(async () => {
    if (!detail || detail.curriculum.curriculumType !== "ADAPTIVE") return;
    try {
      const tracks = await adaptiveApi.getTracks(curriculumId);
      setTracksData(tracks);
    } catch (err) {
      // Tracks may not exist yet if curriculum was just created
      console.debug("No tracks data yet:", err);
    }
  }, [detail, curriculumId]);

  useEffect(() => {
    loadAdaptiveData();
  }, [loadAdaptiveData]);

  const handleInitializeAdaptive = async () => {
    try {
      await adaptiveApi.initialize(curriculumId);
      await loadData();
    } catch (err: any) {
      console.error("Failed to initialize adaptive:", err);
      alert(err.message || "Failed to initialize adaptive curriculum");
    }
  };

  const handleGenerateDiagnostic = async () => {
    setGeneratingDiagnostic(true);
    try {
      await adaptiveApi.generateDiagnostic(curriculumId);
      await loadData();
      alert("Diagnostic quest generated and added to Day 1!");
    } catch (err: any) {
      console.error("Failed to generate diagnostic:", err);
      alert(err.message || "Failed to generate diagnostic");
    } finally {
      setGeneratingDiagnostic(false);
    }
  };

  const handleLoadDiagnosticStatus = async (classId: string) => {
    try {
      const status = await adaptiveApi.getDiagnosticStatus(curriculumId, classId);
      setDiagnosticStatus(status);
    } catch (err: any) {
      console.error("Failed to load diagnostic status:", err);
    }
  };

  const handleBulkAssess = async (classId: string) => {
    setAssessing(true);
    try {
      const result = await adaptiveApi.assessStudents(curriculumId, classId);
      alert(`${result.assessedCount} students assessed and assigned to tracks!`);
      await loadAdaptiveData();
      setDiagnosticStatus(null);
    } catch (err: any) {
      console.error("Failed to assess students:", err);
      alert(err.message || "Failed to assess students");
    } finally {
      setAssessing(false);
    }
  };

  const handleGenerateDayQuests = async (dayNumber: number) => {
    const topic = dayTopics[dayNumber];
    if (!topic?.trim()) {
      alert("Please enter a topic for this day");
      return;
    }
    setGeneratingDayQuests(dayNumber);
    try {
      const request: GenerateTrackQuestsRequest = {
        topic: topic.trim(),
        subject: detail?.curriculum.subject,
        gradeLevel: detail?.curriculum.gradeLevel ? parseInt(detail.curriculum.gradeLevel) : undefined,
      };
      await adaptiveApi.generateDayQuests(curriculumId, dayNumber, request);
      await loadData();
      alert(`3 track-specific quests generated for Day ${dayNumber}!`);
    } catch (err: any) {
      console.error("Failed to generate day quests:", err);
      alert(err.message || "Failed to generate quests for this day");
    } finally {
      setGeneratingDayQuests(null);
    }
  };

  const handleOverrideTrack = async (studentId: string, track: string) => {
    setOverridingTrack(studentId);
    try {
      await adaptiveApi.overrideTrack(curriculumId, studentId, track);
      await loadAdaptiveData();
    } catch (err: any) {
      console.error("Failed to override track:", err);
      alert(err.message || "Failed to override track");
    } finally {
      setOverridingTrack(null);
    }
  };

  const handlePublish = async () => {
    setPublishing(true);
    try {
      await publishCurriculum(curriculumId);
      await loadData();
    } catch (err: any) {
      console.error("Failed to publish curriculum:", err);
      alert(err.message || "Failed to publish curriculum");
    } finally {
      setPublishing(false);
    }
  };

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await deleteCurriculum(curriculumId);
      router.push("/teacher/curricula");
    } catch (err: any) {
      console.error("Failed to delete curriculum:", err);
      alert(err.message || "Failed to delete curriculum");
      setDeleting(false);
    }
  };

  const handleAddQuestToDay = async (questId: string, dayNumber: number) => {
    try {
      await addQuestToCurriculum(curriculumId, questId, dayNumber);
      setAddQuestDayNumber(null);
      setQuestSearchQuery("");
      await loadData();
    } catch (err: any) {
      console.error("Failed to add quest:", err);
      alert(err.response?.data?.message || "Failed to add quest to day");
    }
  };

  const handleRemoveQuestFromDay = async (questId: string, dayNumber: number) => {
    try {
      await removeQuestFromCurriculum(curriculumId, questId, dayNumber);
      await loadData();
    } catch (err: any) {
      console.error("Failed to remove quest:", err);
      alert(err.response?.data?.message || "Failed to remove quest from day");
    }
  };

  const handleRemoveUnscheduledQuest = async (questId: string) => {
    try {
      await removeQuestFromCurriculum(curriculumId, questId);
      await loadData();
    } catch (err: any) {
      console.error("Failed to remove quest:", err);
      alert(err.response?.data?.message || "Failed to remove quest");
    }
  };

  const handleAssignToClass = async (classId: string) => {
    try {
      await classApi.assignCurriculum(classId, curriculumId);
      setAssignedClassIds((prev) => new Set([...prev, classId]));
      setShowAssignDropdown(false);
    } catch (err: any) {
      console.error("Failed to assign curriculum to class:", err);
      alert(err.response?.data?.message || "Failed to assign curriculum");
    }
  };

  const handleUnassignFromClass = async (classId: string) => {
    try {
      await classApi.unassignCurriculum(classId, curriculumId);
      setAssignedClassIds((prev) => {
        const next = new Set(prev);
        next.delete(classId);
        return next;
      });
    } catch (err: any) {
      console.error("Failed to unassign curriculum from class:", err);
      alert(err.response?.data?.message || "Failed to unassign curriculum");
    }
  };

  // Helper: build a map of questId -> QuestSummaryDto for fast lookup
  const questMap = new Map<string, QuestSummaryDto>();
  if (detail) {
    for (const q of detail.quests) {
      questMap.set(q.id, q);
    }
  }

  // Helper: get all quest IDs that appear in any day
  const scheduledQuestIds = new Set<string>();
  if (detail) {
    for (const day of detail.days) {
      for (const qid of day.questIds) {
        scheduledQuestIds.add(qid);
      }
    }
  }

  // Unscheduled quests: in curriculum.questIds but not in any day
  const unscheduledQuests: QuestSummaryDto[] = [];
  if (detail) {
    for (const qid of detail.curriculum.questIds) {
      if (!scheduledQuestIds.has(qid) && questMap.has(qid)) {
        unscheduledQuests.push(questMap.get(qid)!);
      }
    }
  }

  // Filter available quests for the Add Quest panel
  const filteredAvailableQuests = allQuests.filter((q) =>
    q.title.toLowerCase().includes(questSearchQuery.toLowerCase())
  );

  // Status badge styling
  const statusStyles: Record<string, string> = {
    DRAFT:
      "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400",
    PUBLISHED:
      "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400",
    ARCHIVED:
      "bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400",
  };

  if (loading) {
    return (
      <ProtectedRoute requiredRole="TEACHER">
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
          <DashboardHeader />
          <div className="flex items-center justify-center h-96">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-gray-600 dark:text-gray-400">
                Loading curriculum...
              </p>
            </div>
          </div>
        </div>
      </ProtectedRoute>
    );
  }

  if (error || !detail) {
    return (
      <ProtectedRoute requiredRole="TEACHER">
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
          <DashboardHeader />
          <div className="max-w-7xl mx-auto px-8 py-8">
            <Card className="p-12 text-center">
              <AlertTriangle className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h2 className="font-merriweather text-2xl font-bold text-gray-900 dark:text-white mb-2">
                {error || "Curriculum not found"}
              </h2>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                The curriculum you are looking for does not exist or you do not
                have access to it.
              </p>
              <Link href="/teacher/curricula">
                <Button variant="primary">
                  <ArrowLeft className="w-5 h-5 mr-2 inline" />
                  Back to Curricula
                </Button>
              </Link>
            </Card>
          </div>
        </div>
      </ProtectedRoute>
    );
  }

  const { curriculum, days } = detail;

  // Build day map for quick lookup (dayNumber -> CurriculumDay)
  const dayMap = new Map<number, CurriculumDay>();
  for (const d of days) {
    dayMap.set(d.dayNumber, d);
  }

  return (
    <ProtectedRoute requiredRole="TEACHER">
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <DashboardHeader />
        <main className="max-w-7xl mx-auto px-8 py-8">
          {/* Back link */}
          <Link
            href="/teacher/curricula"
            className="inline-flex items-center text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white mb-6"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Curricula
          </Link>

          {/* Header section */}
          <div className="mb-8">
            <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-3">
                  <h1 className="font-merriweather text-3xl font-bold text-gray-900 dark:text-white">
                    {curriculum.title}
                  </h1>
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide ${
                      statusStyles[curriculum.status] || statusStyles.DRAFT
                    }`}
                  >
                    {curriculum.status}
                  </span>
                </div>

                {curriculum.description && (
                  <p className="text-gray-600 dark:text-gray-400 mb-4">
                    {curriculum.description}
                  </p>
                )}

                <div className="flex flex-wrap items-center gap-2">
                  {curriculum.subject && (
                    <span className="px-3 py-1 bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400 rounded-full text-xs font-semibold">
                      {curriculum.subject}
                    </span>
                  )}
                  {curriculum.gradeLevel && (
                    <span className="px-3 py-1 bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-400 rounded-full text-xs font-semibold">
                      <GraduationCap className="w-3 h-3 inline mr-1" />
                      {curriculum.gradeLevel}
                    </span>
                  )}
                  <span className="px-3 py-1 bg-indigo-100 text-indigo-800 dark:bg-indigo-900/20 dark:text-indigo-400 rounded-full text-xs font-semibold">
                    <Calendar className="w-3 h-3 inline mr-1" />
                    {curriculum.durationDays} days
                  </span>
                  {isAdaptive && (
                    <span className="px-3 py-1 bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-400 rounded-full text-xs font-semibold">
                      <Brain className="w-3 h-3 inline mr-1" />
                      Adaptive
                    </span>
                  )}
                </div>
              </div>

              {/* Action buttons */}
              <div className="flex flex-wrap items-center gap-3">
                {curriculum.status === "DRAFT" && (
                  <Button
                    variant="primary"
                    onClick={handlePublish}
                    disabled={publishing}
                    className="flex items-center gap-2"
                  >
                    {publishing ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                        Publishing...
                      </>
                    ) : (
                      <>
                        <Send className="w-4 h-4" />
                        Publish
                      </>
                    )}
                  </Button>
                )}

                {/* Assign to Class dropdown */}
                <div className="relative">
                  <Button
                    variant="secondary"
                    onClick={() => setShowAssignDropdown(!showAssignDropdown)}
                    className="flex items-center gap-2"
                  >
                    <BookOpen className="w-4 h-4" />
                    Assign to Class
                  </Button>
                  {showAssignDropdown && (
                    <div className="absolute right-0 top-full mt-2 w-64 bg-white dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-700 rounded-lg shadow-lg z-20 max-h-64 overflow-y-auto">
                      {classes.length === 0 ? (
                        <div className="p-4 text-center text-sm text-gray-600 dark:text-gray-400">
                          No classes yet. Create a class first.
                        </div>
                      ) : (
                        classes.map((cls) => {
                          const isAssigned = assignedClassIds.has(cls.id);
                          return (
                            <button
                              key={cls.id}
                              onClick={() =>
                                isAssigned
                                  ? handleUnassignFromClass(cls.id)
                                  : handleAssignToClass(cls.id)
                              }
                              className="w-full px-4 py-3 text-left hover:bg-gray-100 dark:hover:bg-gray-700 text-sm border-b border-gray-200 dark:border-gray-700 last:border-0 flex items-center justify-between"
                            >
                              <span className="text-gray-900 dark:text-white font-medium">
                                {cls.name}
                              </span>
                              {isAssigned && (
                                <CheckCircle className="w-4 h-4 text-green-500" />
                              )}
                            </button>
                          );
                        })
                      )}
                    </div>
                  )}
                </div>

                {/* Delete button */}
                <Button
                  variant="secondary"
                  onClick={() => setShowDeleteConfirm(true)}
                  className="flex items-center gap-2 !text-red-600 !border-red-300 hover:!bg-red-50 dark:!text-red-400 dark:!border-red-800 dark:hover:!bg-red-900/20"
                >
                  <Trash2 className="w-4 h-4" />
                  Delete
                </Button>
              </div>
            </div>
          </div>

          {/* Adaptive Panels */}
          {isAdaptive && (
            <div className="mb-8 space-y-6">
              {/* Diagnostic Setup Panel */}
              <Card className="p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                    <Brain className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                      Diagnostic Assessment
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Day 1 diagnostic to place students into learning tracks
                    </p>
                  </div>
                </div>

                {(() => {
                  const day1 = dayMap.get(1);
                  const hasDiagnostic = day1?.isDiagnosticDay;
                  const day1Quests = day1?.questIds || [];

                  if (!hasDiagnostic) {
                    return (
                      <div className="flex items-center gap-3">
                        <Button
                          variant="secondary"
                          onClick={handleInitializeAdaptive}
                          className="flex items-center gap-2"
                        >
                          <Plus className="w-4 h-4" />
                          Mark Day 1 as Diagnostic
                        </Button>
                        <span className="text-sm text-gray-500 dark:text-gray-400">
                          Step 1: Set up Day 1 as the diagnostic day
                        </span>
                      </div>
                    );
                  }

                  if (day1Quests.length === 0) {
                    return (
                      <div className="flex items-center gap-3">
                        <Button
                          variant="primary"
                          onClick={handleGenerateDiagnostic}
                          disabled={generatingDiagnostic}
                          className="flex items-center gap-2"
                        >
                          {generatingDiagnostic ? (
                            <>
                              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                              Generating...
                            </>
                          ) : (
                            <>
                              <Sparkles className="w-4 h-4" />
                              Generate Diagnostic Quest
                            </>
                          )}
                        </Button>
                        <span className="text-sm text-gray-500 dark:text-gray-400">
                          Step 2: AI generates a multi-tier assessment
                        </span>
                      </div>
                    );
                  }

                  return (
                    <div className="space-y-3">
                      <div className="flex items-center gap-2 text-green-600 dark:text-green-400">
                        <CheckCircle className="w-5 h-5" />
                        <span className="font-semibold">Diagnostic quest is ready</span>
                      </div>

                      {/* Diagnostic status per class */}
                      {classes.length > 0 && (
                        <div className="mt-4 space-y-3">
                          <p className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                            Check student completion & assess:
                          </p>
                          <div className="flex flex-wrap gap-2">
                            {classes.map((cls) => (
                              <Button
                                key={cls.id}
                                variant="secondary"
                                className="text-sm flex items-center gap-2"
                                onClick={() => handleLoadDiagnosticStatus(cls.id)}
                              >
                                <Users className="w-4 h-4" />
                                {cls.name}
                              </Button>
                            ))}
                          </div>

                          {diagnosticStatus && (
                            <div className="mt-3 p-4 bg-gray-50 dark:bg-gray-700/30 rounded-lg border border-gray-200 dark:border-gray-700">
                              <div className="flex items-center justify-between mb-3">
                                <span className="font-semibold text-gray-900 dark:text-white">
                                  {diagnosticStatus.completedCount}/{diagnosticStatus.totalStudents} completed
                                </span>
                                <Button
                                  variant="primary"
                                  onClick={() => {
                                    const classId = assignedClassIds.size > 0
                                      ? Array.from(assignedClassIds)[0]
                                      : classes[0]?.id;
                                    if (classId) handleBulkAssess(classId);
                                  }}
                                  disabled={assessing || diagnosticStatus.completedCount === 0}
                                  className="text-sm flex items-center gap-2"
                                >
                                  {assessing ? (
                                    <>
                                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                                      Assessing...
                                    </>
                                  ) : (
                                    <>
                                      <TrendingUp className="w-4 h-4" />
                                      Assess & Assign Tracks
                                    </>
                                  )}
                                </Button>
                              </div>
                              <div className="space-y-1 max-h-40 overflow-y-auto">
                                {diagnosticStatus.students.map((s) => (
                                  <div
                                    key={s.studentId}
                                    className="flex items-center justify-between text-sm py-1"
                                  >
                                    <span className="text-gray-700 dark:text-gray-300">
                                      {s.studentName}
                                    </span>
                                    <div className="flex items-center gap-2">
                                      {s.completed ? (
                                        <>
                                          <span className="text-green-600 dark:text-green-400 font-medium">
                                            {s.score}%
                                          </span>
                                          {s.assignedTrack && (
                                            <TrackBadge track={s.assignedTrack} />
                                          )}
                                        </>
                                      ) : (
                                        <span className="text-gray-400 italic">Pending</span>
                                      )}
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })()}
              </Card>

              {/* Track Distribution Panel */}
              {tracksData && (
                <Card className="p-6">
                  <button
                    onClick={() => setShowTracksPanel(!showTracksPanel)}
                    className="w-full flex items-center justify-between"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-500 to-teal-500 flex items-center justify-center">
                        <Users className="w-5 h-5 text-white" />
                      </div>
                      <div className="text-left">
                        <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                          Student Tracks
                        </h3>
                        <div className="flex items-center gap-3 text-sm">
                          <span className="text-purple-600 dark:text-purple-400 font-medium">
                            {tracksData.summary.advancedCount} Advanced
                          </span>
                          <span className="text-blue-600 dark:text-blue-400 font-medium">
                            {tracksData.summary.gradeLevelCount} Grade Level
                          </span>
                          <span className="text-orange-600 dark:text-orange-400 font-medium">
                            {tracksData.summary.foundationalCount} Foundational
                          </span>
                          {tracksData.summary.unassignedCount > 0 && (
                            <span className="text-gray-500 font-medium">
                              {tracksData.summary.unassignedCount} Unassigned
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                    {showTracksPanel ? (
                      <ChevronUp className="w-5 h-5 text-gray-400" />
                    ) : (
                      <ChevronDown className="w-5 h-5 text-gray-400" />
                    )}
                  </button>

                  {showTracksPanel && (
                    <div className="mt-4 space-y-2">
                      {tracksData.students.map((student) => (
                        <div
                          key={student.studentId}
                          className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/30 rounded-lg"
                        >
                          <div>
                            <p className="font-medium text-gray-900 dark:text-white">
                              {student.studentName}
                            </p>
                            <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                              {student.diagnosticScore != null && (
                                <span>Diag: {student.diagnosticScore}%</span>
                              )}
                              {student.currentAverageScore != null && (
                                <span>Avg: {Math.round(student.currentAverageScore)}%</span>
                              )}
                              <span className="capitalize">by {student.assignedBy.toLowerCase()}</span>
                              {student.suggestedTrack && student.suggestedTrack !== student.currentTrack && (
                                <span className="text-amber-600 dark:text-amber-400 font-medium">
                                  Suggested: {formatTrackName(student.suggestedTrack)}
                                </span>
                              )}
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <TrackBadge track={student.currentTrack} />
                            <select
                              value={student.currentTrack}
                              onChange={(e) => handleOverrideTrack(student.studentId, e.target.value)}
                              disabled={overridingTrack === student.studentId}
                              className="text-xs px-2 py-1 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300"
                            >
                              <option value="ADVANCED">Advanced</option>
                              <option value="GRADE_LEVEL">Grade Level</option>
                              <option value="FOUNDATIONAL">Foundational</option>
                            </select>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </Card>
              )}
            </div>
          )}

          {/* Day-by-day timeline */}
          <div className="mb-12">
            <h2 className="font-merriweather text-2xl font-bold text-gray-900 dark:text-white mb-6">
              Day-by-Day Quest Plan
            </h2>

            <div className="space-y-4">
              {Array.from({ length: curriculum.durationDays }, (_, i) => i + 1).map(
                (dayNumber) => {
                  const day = dayMap.get(dayNumber);
                  const dayQuestIds = day?.questIds || [];
                  const dayQuests = dayQuestIds
                    .map((qid) => questMap.get(qid))
                    .filter(Boolean) as QuestSummaryDto[];

                  return (
                    <Card key={dayNumber} className="p-0 overflow-hidden">
                      {/* Day header */}
                      <div className="px-6 py-4 bg-gray-50 dark:bg-gray-700/50 border-b border-gray-200 dark:border-gray-700">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <span className={`inline-flex items-center justify-center w-8 h-8 rounded-full text-white text-sm font-bold ${
                              isAdaptive && day?.isDiagnosticDay ? "bg-purple-600" : "bg-blue-600"
                            }`}>
                              {dayNumber}
                            </span>
                            <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                              Day {dayNumber}
                            </h3>
                            {isAdaptive && day?.isDiagnosticDay && (
                              <span className="px-2 py-0.5 bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-400 rounded text-xs font-semibold">
                                Diagnostic
                              </span>
                            )}
                            {day?.title && (
                              <span className="text-gray-600 dark:text-gray-400">
                                &mdash; {day.title}
                              </span>
                            )}
                          </div>
                          <span className="text-sm text-gray-500 dark:text-gray-400">
                            {dayQuests.length}{" "}
                            {dayQuests.length === 1 ? "quest" : "quests"}
                          </span>
                        </div>
                      </div>

                      {/* Quest list for this day */}
                      <div className="px-6 py-4">
                        {dayQuests.length === 0 ? (
                          <p className="text-sm text-gray-400 dark:text-gray-500 italic py-2">
                            No quests scheduled
                          </p>
                        ) : (
                          <div className="space-y-3 mb-4">
                            {dayQuests.map((quest) => (
                              <div
                                key={quest.id}
                                className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/30 rounded-lg border border-gray-200 dark:border-gray-700"
                              >
                                <div className="flex items-center gap-3 min-w-0 flex-1">
                                  <BookOpen className="w-4 h-4 text-blue-500 flex-shrink-0" />
                                  <div className="min-w-0">
                                    <p className="font-semibold text-gray-900 dark:text-white truncate">
                                      {quest.title}
                                    </p>
                                    <div className="flex flex-wrap items-center gap-2 mt-1">
                                      {quest.topic && (
                                        <span className="text-xs text-gray-500 dark:text-gray-400">
                                          {quest.topic}
                                        </span>
                                      )}
                                      {quest.subject && (
                                        <span className="px-2 py-0.5 bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400 rounded text-xs font-semibold">
                                          {quest.subject}
                                        </span>
                                      )}
                                      <span className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400">
                                        <Clock className="w-3 h-3" />
                                        {quest.durationMinutes} min
                                      </span>
                                    </div>
                                  </div>
                                </div>
                                <button
                                  onClick={() =>
                                    handleRemoveQuestFromDay(quest.id, dayNumber)
                                  }
                                  className="ml-3 p-1.5 text-gray-400 hover:text-red-500 dark:hover:text-red-400 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors flex-shrink-0"
                                  title="Remove from this day"
                                >
                                  <X className="w-4 h-4" />
                                </button>
                              </div>
                            ))}
                          </div>
                        )}

                        {/* Adaptive: Generate Track Quests for this day */}
                        {isAdaptive && dayNumber > 1 && !day?.isDiagnosticDay && (
                          <div className="mt-3 p-3 border border-purple-200 dark:border-purple-800 rounded-lg bg-purple-50/50 dark:bg-purple-900/10">
                            <div className="flex items-center gap-3">
                              <input
                                type="text"
                                value={dayTopics[dayNumber] || ""}
                                onChange={(e) =>
                                  setDayTopics((prev) => ({ ...prev, [dayNumber]: e.target.value }))
                                }
                                placeholder={`Topic for Day ${dayNumber}...`}
                                className="flex-1 px-3 py-1.5 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                              />
                              <Button
                                variant="primary"
                                onClick={() => handleGenerateDayQuests(dayNumber)}
                                disabled={generatingDayQuests === dayNumber}
                                className="text-sm flex items-center gap-2 whitespace-nowrap"
                              >
                                {generatingDayQuests === dayNumber ? (
                                  <>
                                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                                    Generating...
                                  </>
                                ) : (
                                  <>
                                    <Sparkles className="w-4 h-4" />
                                    Generate 3 Track Quests
                                  </>
                                )}
                              </Button>
                            </div>
                            {dayQuests.length > 0 && (
                              <div className="mt-2 flex flex-wrap gap-1">
                                {dayQuests.map((q) => {
                                  const trackMatch = q.title.match(/\[(ADVANCED|GRADE.LEVEL|FOUNDATIONAL)\]/i);
                                  return trackMatch ? (
                                    <span key={q.id} className="text-xs text-purple-600 dark:text-purple-400">
                                      {trackMatch[1].replace("_", " ")}
                                    </span>
                                  ) : null;
                                })}
                              </div>
                            )}
                          </div>
                        )}

                        {/* Add Quest button / inline panel */}
                        {addQuestDayNumber === dayNumber ? (
                          <div className="mt-3 p-4 border-2 border-blue-200 dark:border-blue-800 rounded-lg bg-blue-50/50 dark:bg-blue-900/10">
                            <div className="flex items-center justify-between mb-3">
                              <h4 className="font-semibold text-gray-900 dark:text-white text-sm">
                                Add Quest to Day {dayNumber}
                              </h4>
                              <button
                                onClick={() => {
                                  setAddQuestDayNumber(null);
                                  setQuestSearchQuery("");
                                }}
                                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                              >
                                <X className="w-4 h-4" />
                              </button>
                            </div>
                            <div className="relative mb-3">
                              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                              <input
                                type="text"
                                value={questSearchQuery}
                                onChange={(e) =>
                                  setQuestSearchQuery(e.target.value)
                                }
                                placeholder="Search quests by title..."
                                className="w-full pl-9 pr-4 py-2 text-sm border-2 border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                                autoFocus
                              />
                            </div>
                            <div className="max-h-48 overflow-y-auto space-y-1">
                              {filteredAvailableQuests.length === 0 ? (
                                <p className="text-sm text-gray-500 dark:text-gray-400 py-2 text-center">
                                  No quests found
                                </p>
                              ) : (
                                filteredAvailableQuests.map((quest) => (
                                  <button
                                    key={quest.id}
                                    onClick={() =>
                                      handleAddQuestToDay(quest.id, dayNumber)
                                    }
                                    className="w-full text-left p-2.5 rounded-lg hover:bg-white dark:hover:bg-gray-700 transition-colors border border-transparent hover:border-gray-200 dark:hover:border-gray-600"
                                  >
                                    <p className="font-medium text-sm text-gray-900 dark:text-white">
                                      {quest.title}
                                    </p>
                                    <div className="flex items-center gap-2 mt-1">
                                      {quest.subject && (
                                        <span className="px-2 py-0.5 bg-blue-100 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400 rounded text-xs">
                                          {quest.subject}
                                        </span>
                                      )}
                                      <span className="text-xs text-gray-500 dark:text-gray-400">
                                        {quest.durationMinutes} min
                                      </span>
                                      {quest.topic && (
                                        <span className="text-xs text-gray-500 dark:text-gray-400">
                                          {quest.topic}
                                        </span>
                                      )}
                                    </div>
                                  </button>
                                ))
                              )}
                            </div>
                          </div>
                        ) : (
                          <button
                            onClick={() => setAddQuestDayNumber(dayNumber)}
                            className="inline-flex items-center gap-1.5 text-sm font-medium text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition-colors mt-1"
                          >
                            <Plus className="w-4 h-4" />
                            Add Quest
                          </button>
                        )}
                      </div>
                    </Card>
                  );
                }
              )}
            </div>
          </div>

          {/* Unscheduled Quests Section */}
          {unscheduledQuests.length > 0 && (
            <div className="mb-12">
              <h2 className="font-merriweather text-2xl font-bold text-gray-900 dark:text-white mb-4">
                Unscheduled Quests
              </h2>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                These quests are part of this curriculum but have not been
                assigned to any day.
              </p>
              <div className="space-y-3">
                {unscheduledQuests.map((quest) => (
                  <Card
                    key={quest.id}
                    className="!p-4 flex items-center justify-between"
                  >
                    <div className="flex items-center gap-3 min-w-0 flex-1">
                      <BookOpen className="w-4 h-4 text-gray-400 flex-shrink-0" />
                      <div className="min-w-0">
                        <p className="font-semibold text-gray-900 dark:text-white truncate">
                          {quest.title}
                        </p>
                        {quest.topic && (
                          <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                            {quest.topic}
                          </p>
                        )}
                      </div>
                    </div>
                    <button
                      onClick={() => handleRemoveUnscheduledQuest(quest.id)}
                      className="ml-3 p-1.5 text-gray-400 hover:text-red-500 dark:hover:text-red-400 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors flex-shrink-0"
                      title="Remove from curriculum"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {/* Class Assignment Section */}
          <div className="mb-12">
            <h2 className="font-merriweather text-2xl font-bold text-gray-900 dark:text-white mb-4">
              Class Assignments
            </h2>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
              Assign or unassign this curriculum to your classes.
            </p>
            {classes.length === 0 ? (
              <Card className="p-8 text-center">
                <p className="text-gray-500 dark:text-gray-400">
                  You have no classes yet. Create a class to assign this
                  curriculum.
                </p>
                <Link href="/teacher/classes" className="inline-block mt-4">
                  <Button variant="secondary">Go to Classes</Button>
                </Link>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {classes.map((cls) => {
                  const isAssigned = assignedClassIds.has(cls.id);
                  return (
                    <Card
                      key={cls.id}
                      className={`!p-4 flex items-center justify-between border-2 ${
                        isAssigned
                          ? "!border-green-300 dark:!border-green-700"
                          : "!border-transparent"
                      }`}
                    >
                      <div className="min-w-0 flex-1">
                        <p className="font-semibold text-gray-900 dark:text-white truncate">
                          {cls.name}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                          {cls.studentCount}{" "}
                          {cls.studentCount === 1 ? "student" : "students"}
                        </p>
                      </div>
                      <button
                        onClick={() =>
                          isAssigned
                            ? handleUnassignFromClass(cls.id)
                            : handleAssignToClass(cls.id)
                        }
                        className={`ml-3 px-4 py-2 rounded-lg text-sm font-semibold transition-colors ${
                          isAssigned
                            ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400 hover:bg-red-100 hover:text-red-700 dark:hover:bg-red-900/30 dark:hover:text-red-400"
                            : "bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300 hover:bg-blue-100 hover:text-blue-700 dark:hover:bg-blue-900/30 dark:hover:text-blue-400"
                        }`}
                      >
                        {isAssigned ? "Assigned" : "Assign"}
                      </button>
                    </Card>
                  );
                })}
              </div>
            )}
          </div>
        </main>

        {/* Delete confirmation modal */}
        {showDeleteConfirm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <Card className="w-full max-w-md p-8 relative">
              <div className="text-center">
                <div className="w-16 h-16 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center mx-auto mb-4">
                  <AlertTriangle className="w-8 h-8 text-red-600 dark:text-red-400" />
                </div>
                <h3 className="font-merriweather text-xl font-bold text-gray-900 dark:text-white mb-2">
                  Delete Curriculum
                </h3>
                <p className="text-gray-600 dark:text-gray-400 mb-6">
                  Are you sure you want to delete &ldquo;{curriculum.title}
                  &rdquo;? This action cannot be undone.
                </p>
                <div className="flex gap-3">
                  <Button
                    variant="secondary"
                    onClick={() => setShowDeleteConfirm(false)}
                    disabled={deleting}
                    className="flex-1"
                  >
                    Cancel
                  </Button>
                  <button
                    onClick={handleDelete}
                    disabled={deleting}
                    className="flex-1 px-6 py-3 rounded-xl font-semibold transition-all bg-red-600 hover:bg-red-700 text-white shadow-lg hover:shadow-xl disabled:opacity-50"
                  >
                    {deleting ? "Deleting..." : "Delete"}
                  </button>
                </div>
              </div>
            </Card>
          </div>
        )}
      </div>
    </ProtectedRoute>
  );
}

// =============================================================================
// Helper Components
// =============================================================================

function TrackBadge({ track }: { track: string }) {
  const styles: Record<string, string> = {
    ADVANCED: "bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-400",
    GRADE_LEVEL: "bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400",
    FOUNDATIONAL: "bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-400",
  };
  return (
    <span className={`px-2 py-0.5 rounded text-xs font-semibold ${styles[track] || styles.GRADE_LEVEL}`}>
      {formatTrackName(track)}
    </span>
  );
}

function formatTrackName(track: string): string {
  switch (track) {
    case "ADVANCED": return "Advanced";
    case "GRADE_LEVEL": return "Grade Level";
    case "FOUNDATIONAL": return "Foundational";
    default: return track;
  }
}
