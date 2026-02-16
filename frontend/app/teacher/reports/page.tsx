"use client";

import { useState, useEffect, useCallback } from "react";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { DashboardHeader } from "@/components/teacher/dashboard/DashboardHeader";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { classApi, ClassDto } from "@/lib/api/classes";
import {
  reportsApi,
  ClassReportResponse,
  CurriculumEffectivenessResponse,
  ClassComparisonResponse,
  StudentReportSummary,
  QuestAnalytics,
  ClassComparisonEntry,
} from "@/lib/api/reports";
import { useAuth } from "@/lib/contexts/AuthContext";
import apiClient from "@/lib/api/client";
import {
  BarChart3,
  TrendingUp,
  Users,
  Award,
  CheckCircle2,
  Clock,
  Download,
  Filter,
  Trophy,
} from "lucide-react";
import Link from "next/link";
import {
  ComposedChart,
  BarChart,
  Bar,
  Cell,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  ResponsiveContainer,
  CartesianGrid,
  ReferenceLine,
} from "recharts";

// ─── Types ───────────────────────────────────────────────────────────────────

type TabId = "class-progress" | "curriculum-effectiveness" | "class-comparison";

interface CurriculumOption {
  id: string;
  title: string;
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function getScoreBadgeColor(score: number): string {
  if (score >= 90) return "bg-green-500";
  if (score >= 75) return "bg-blue-500";
  if (score >= 60) return "bg-yellow-500";
  return "bg-orange-500";
}

function formatDate(dateStr: string | null): string {
  if (!dateStr) return "Never";
  const d = new Date(dateStr);
  return d.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

// ─── StatCard Component ──────────────────────────────────────────────────────

function StatCard({
  icon: Icon,
  label,
  value,
  subtext,
  iconColor,
  bgColor,
}: {
  icon: any;
  label: string;
  value: string | number;
  subtext?: string;
  iconColor: string;
  bgColor: string;
}) {
  return (
    <Card className="p-6">
      <div className="flex items-center gap-4">
        <div className={`p-3 rounded-lg ${bgColor}`}>
          <Icon className={`w-6 h-6 ${iconColor}`} />
        </div>
        <div className="flex-1">
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
            {label}
          </p>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">
            {value}
          </p>
          {subtext && (
            <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
              {subtext}
            </p>
          )}
        </div>
      </div>
    </Card>
  );
}

// ─── Main Page Component ─────────────────────────────────────────────────────

export default function TeacherReportsPage() {
  const { user } = useAuth();

  // Tab state
  const [activeTab, setActiveTab] = useState<TabId>("class-progress");

  // Shared data
  const [classes, setClasses] = useState<ClassDto[]>([]);
  const [loading, setLoading] = useState(true);

  // Tab 1: Class Progress
  const [selectedClassId, setSelectedClassId] = useState<string>("");
  const [timeRange, setTimeRange] = useState<string>("week");
  const [classReport, setClassReport] = useState<ClassReportResponse | null>(
    null
  );
  const [classReportLoading, setClassReportLoading] = useState(false);

  // Tab 2: Curriculum Effectiveness
  const [curricula, setCurricula] = useState<CurriculumOption[]>([]);
  const [selectedCurriculumId, setSelectedCurriculumId] = useState<string>("");
  const [curriculumReport, setCurriculumReport] =
    useState<CurriculumEffectivenessResponse | null>(null);
  const [curriculumReportLoading, setCurriculumReportLoading] = useState(false);

  // Tab 3: Class Comparison
  const [classComparison, setClassComparison] =
    useState<ClassComparisonResponse | null>(null);
  const [classComparisonLoading, setClassComparisonLoading] = useState(false);

  // ─── Load classes on mount ──────────────────────────────────────────────

  useEffect(() => {
    const loadClasses = async () => {
      try {
        const data = await classApi.getAll();
        setClasses(data);
        if (data.length > 0) {
          setSelectedClassId(data[0].id);
        }
      } catch (error) {
        console.error("Failed to load classes:", error);
      } finally {
        setLoading(false);
      }
    };
    loadClasses();
  }, []);

  // ─── Load curricula when tab 2 is selected ─────────────────────────────

  useEffect(() => {
    if (activeTab !== "curriculum-effectiveness" || !user?.uid) return;
    if (curricula.length > 0) return; // already loaded

    const loadCurricula = async () => {
      try {
        const response = await apiClient.get(
          `/api/v1/curricula/teacher/${user.uid}`
        );
        const data: any[] = response.data.data || [];
        const options: CurriculumOption[] = data.map((c: any) => ({
          id: c.id ?? c.curriculumId ?? c.curriculum?.id,
          title:
            c.title ?? c.curriculumTitle ?? c.curriculum?.title ?? "Untitled",
        }));
        setCurricula(options);
        if (options.length > 0 && !selectedCurriculumId) {
          setSelectedCurriculumId(options[0].id);
        }
      } catch (error) {
        console.error("Failed to load curricula:", error);
      }
    };
    loadCurricula();
  }, [activeTab, user?.uid, curricula.length, selectedCurriculumId]);

  // ─── Load class report when class or time range changes ─────────────────

  const loadClassReport = useCallback(async () => {
    if (!selectedClassId) return;
    setClassReportLoading(true);
    try {
      const data = await reportsApi.getClassReport(selectedClassId, timeRange);
      setClassReport(data);
    } catch (error) {
      console.error("Failed to load class report:", error);
      setClassReport(null);
    } finally {
      setClassReportLoading(false);
    }
  }, [selectedClassId, timeRange]);

  useEffect(() => {
    if (activeTab === "class-progress" && selectedClassId) {
      loadClassReport();
    }
  }, [activeTab, selectedClassId, timeRange, loadClassReport]);

  // ─── Load curriculum effectiveness ──────────────────────────────────────

  const loadCurriculumReport = useCallback(async () => {
    if (!selectedCurriculumId) return;
    setCurriculumReportLoading(true);
    try {
      const data = await reportsApi.getCurriculumEffectiveness(
        selectedCurriculumId
      );
      setCurriculumReport(data);
    } catch (error) {
      console.error("Failed to load curriculum effectiveness:", error);
      setCurriculumReport(null);
    } finally {
      setCurriculumReportLoading(false);
    }
  }, [selectedCurriculumId]);

  useEffect(() => {
    if (activeTab === "curriculum-effectiveness" && selectedCurriculumId) {
      loadCurriculumReport();
    }
  }, [activeTab, selectedCurriculumId, loadCurriculumReport]);

  // ─── Load class comparison ──────────────────────────────────────────────

  const loadClassComparison = useCallback(async () => {
    if (!user?.uid) return;
    setClassComparisonLoading(true);
    try {
      const data = await reportsApi.getClassComparison(user.uid);
      setClassComparison(data);
    } catch (error) {
      console.error("Failed to load class comparison:", error);
      setClassComparison(null);
    } finally {
      setClassComparisonLoading(false);
    }
  }, [user?.uid]);

  useEffect(() => {
    if (activeTab === "class-comparison") {
      loadClassComparison();
    }
  }, [activeTab, loadClassComparison]);

  // ─── Export handler ─────────────────────────────────────────────────────

  const handleExportCSV = async () => {
    if (!selectedClassId) return;
    await reportsApi.exportClassReport(selectedClassId);
  };

  // ─── Loading state ─────────────────────────────────────────────────────

  if (loading) {
    return (
      <ProtectedRoute requiredRole="TEACHER">
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
          <DashboardHeader />
          <div className="flex items-center justify-center h-96">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-gray-600 dark:text-gray-400">
                Loading reports...
              </p>
            </div>
          </div>
        </div>
      </ProtectedRoute>
    );
  }

  // ─── No classes state ──────────────────────────────────────────────────

  if (classes.length === 0) {
    return (
      <ProtectedRoute requiredRole="TEACHER">
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
          <DashboardHeader />
          <div className="max-w-7xl mx-auto px-8 py-8">
            <Card className="p-12 text-center">
              <BarChart3 className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="font-merriweather text-xl font-bold text-gray-900 dark:text-white mb-2">
                No Classes Yet
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                Create a class to start seeing student progress reports
              </p>
              <Link href="/teacher/classes">
                <Button variant="primary">Create Your First Class</Button>
              </Link>
            </Card>
          </div>
        </div>
      </ProtectedRoute>
    );
  }

  // ─── Tab definitions ───────────────────────────────────────────────────

  const tabs: { id: TabId; label: string }[] = [
    { id: "class-progress", label: "Class Progress" },
    { id: "curriculum-effectiveness", label: "Curriculum Effectiveness" },
    { id: "class-comparison", label: "Class Comparison" },
  ];

  // ─── Render ─────────────────────────────────────────────────────────────

  return (
    <ProtectedRoute requiredRole="TEACHER">
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <DashboardHeader />

        <main className="max-w-7xl mx-auto px-8 py-8">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="font-merriweather text-3xl font-bold text-gray-900 dark:text-white">
                Progress Reports
              </h1>
              <p className="text-gray-600 dark:text-gray-400 mt-1">
                Track student engagement and achievement
              </p>
            </div>
          </div>

          {/* Tab Buttons */}
          <div className="flex gap-1 mb-8 bg-gray-200 dark:bg-gray-700 p-1 rounded-lg w-fit">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-5 py-2.5 rounded-md text-sm font-semibold transition-all ${
                  activeTab === tab.id
                    ? "bg-blue-600 text-white shadow-sm"
                    : "bg-transparent text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Tab Content */}
          {activeTab === "class-progress" && (
            <ClassProgressTab
              classes={classes}
              selectedClassId={selectedClassId}
              onSelectClass={setSelectedClassId}
              timeRange={timeRange}
              onSelectTimeRange={setTimeRange}
              report={classReport}
              loading={classReportLoading}
              onExport={handleExportCSV}
            />
          )}

          {activeTab === "curriculum-effectiveness" && (
            <CurriculumEffectivenessTab
              curricula={curricula}
              selectedCurriculumId={selectedCurriculumId}
              onSelectCurriculum={setSelectedCurriculumId}
              report={curriculumReport}
              loading={curriculumReportLoading}
            />
          )}

          {activeTab === "class-comparison" && (
            <ClassComparisonTab
              report={classComparison}
              loading={classComparisonLoading}
            />
          )}
        </main>
      </div>
    </ProtectedRoute>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// Tab 1: Class Progress
// ═══════════════════════════════════════════════════════════════════════════════

function ClassProgressTab({
  classes,
  selectedClassId,
  onSelectClass,
  timeRange,
  onSelectTimeRange,
  report,
  loading,
  onExport,
}: {
  classes: ClassDto[];
  selectedClassId: string;
  onSelectClass: (id: string) => void;
  timeRange: string;
  onSelectTimeRange: (range: string) => void;
  report: ClassReportResponse | null;
  loading: boolean;
  onExport: () => void;
}) {
  const stats = report?.classStats;
  const timeSeries = report?.timeSeries || [];
  const students = report?.studentSummaries || [];

  // Sort students by average score descending
  const sortedStudents = [...students].sort(
    (a, b) => b.averageScore - a.averageScore
  );

  return (
    <>
      {/* Filters */}
      <div className="mb-8 flex flex-wrap gap-4 items-center">
        <div className="flex items-center gap-2">
          <Filter className="w-5 h-5 text-gray-600 dark:text-gray-400" />
          <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">
            View:
          </span>
        </div>

        <select
          value={selectedClassId}
          onChange={(e) => onSelectClass(e.target.value)}
          className="px-4 py-2 border-2 border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
        >
          {classes.map((cls) => (
            <option key={cls.id} value={cls.id}>
              {cls.name}
            </option>
          ))}
        </select>

        <select
          value={timeRange}
          onChange={(e) => onSelectTimeRange(e.target.value)}
          className="px-4 py-2 border-2 border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
        >
          <option value="week">This Week</option>
          <option value="month">This Month</option>
          <option value="quarter">This Quarter</option>
        </select>

        <div className="ml-auto">
          <Button variant="secondary" onClick={onExport}>
            <Download className="w-5 h-5 mr-2" />
            Export CSV
          </Button>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600 mx-auto mb-3"></div>
            <p className="text-gray-500 dark:text-gray-400">Loading report...</p>
          </div>
        </div>
      ) : (
        <>
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <StatCard
              icon={Users}
              label="Total Students"
              value={stats?.totalStudentCount ?? 0}
              subtext={`${stats?.activeStudentCount ?? 0} active`}
              iconColor="text-blue-600"
              bgColor="bg-blue-50 dark:bg-blue-900/20"
            />
            <StatCard
              icon={Trophy}
              label="Class Average"
              value={
                stats && stats.classAverageScore > 0
                  ? `${Math.round(stats.classAverageScore)}%`
                  : "--"
              }
              subtext="Across all quests"
              iconColor="text-green-600"
              bgColor="bg-green-50 dark:bg-green-900/20"
            />
            <StatCard
              icon={CheckCircle2}
              label="Quests Completed"
              value={stats?.totalQuestsCompleted ?? "--"}
              subtext="By all students"
              iconColor="text-purple-600"
              bgColor="bg-purple-50 dark:bg-purple-900/20"
            />
            <StatCard
              icon={Award}
              label="Total XP"
              value={
                stats && stats.totalXP > 0
                  ? stats.totalXP.toLocaleString()
                  : "--"
              }
              subtext="Earned this period"
              iconColor="text-yellow-600"
              bgColor="bg-yellow-50 dark:bg-yellow-900/20"
            />
          </div>

          {/* Time Series Chart */}
          {timeSeries.length > 0 && (
            <Card className="p-6 mb-8">
              <h2 className="font-merriweather text-xl font-bold text-gray-900 dark:text-white mb-6">
                Progress Over Time
              </h2>
              <ResponsiveContainer width="100%" height={350}>
                <ComposedChart data={timeSeries}>
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke="#e5e7eb"
                  />
                  <XAxis
                    dataKey="periodLabel"
                    tick={{ fontSize: 12, fill: "#6b7280" }}
                  />
                  <YAxis
                    yAxisId="left"
                    domain={[0, 100]}
                    tick={{ fontSize: 12, fill: "#6b7280" }}
                    label={{
                      value: "Average Score",
                      angle: -90,
                      position: "insideLeft",
                      style: { fill: "#6b7280", fontSize: 12 },
                    }}
                  />
                  <YAxis
                    yAxisId="right"
                    orientation="right"
                    tick={{ fontSize: 12, fill: "#6b7280" }}
                    label={{
                      value: "Quests Completed",
                      angle: 90,
                      position: "insideRight",
                      style: { fill: "#6b7280", fontSize: 12 },
                    }}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#1f2937",
                      border: "none",
                      borderRadius: "8px",
                      color: "#fff",
                    }}
                  />
                  <Legend />
                  <Bar
                    yAxisId="right"
                    dataKey="questsCompleted"
                    name="Quests Completed"
                    fill="#14b8a6"
                    radius={[4, 4, 0, 0]}
                    barSize={32}
                  />
                  <Line
                    yAxisId="left"
                    type="monotone"
                    dataKey="averageScore"
                    name="Average Score"
                    stroke="#3b82f6"
                    strokeWidth={3}
                    dot={{ fill: "#3b82f6", r: 5 }}
                    activeDot={{ r: 7 }}
                  />
                </ComposedChart>
              </ResponsiveContainer>
            </Card>
          )}

          {/* Student Performance Table */}
          <Card className="p-6">
            <h2 className="font-merriweather text-xl font-bold text-gray-900 dark:text-white mb-6">
              Student Performance
            </h2>

            {sortedStudents.length === 0 ? (
              <div className="text-center py-12">
                <TrendingUp className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
                  No Student Data Yet
                </h3>
                <p className="text-gray-600 dark:text-gray-400">
                  Students haven&apos;t completed any quests yet
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b-2 border-gray-200 dark:border-gray-700">
                      <th className="text-left py-3 px-4 font-semibold text-gray-700 dark:text-gray-300">
                        Rank
                      </th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-700 dark:text-gray-300">
                        Student
                      </th>
                      <th className="text-center py-3 px-4 font-semibold text-gray-700 dark:text-gray-300">
                        Average Score
                      </th>
                      <th className="text-center py-3 px-4 font-semibold text-gray-700 dark:text-gray-300">
                        Quests Completed
                      </th>
                      <th className="text-center py-3 px-4 font-semibold text-gray-700 dark:text-gray-300">
                        Total XP
                      </th>
                      <th className="text-center py-3 px-4 font-semibold text-gray-700 dark:text-gray-300">
                        Tutorials
                      </th>
                      <th className="text-center py-3 px-4 font-semibold text-gray-700 dark:text-gray-300">
                        Last Active
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {sortedStudents.map(
                      (student: StudentReportSummary, index: number) => (
                        <tr
                          key={student.studentId}
                          className="border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/50"
                        >
                          <td className="py-4 px-4">
                            <div className="flex items-center gap-2">
                              {index === 0 && (
                                <Trophy className="w-5 h-5 text-yellow-500" />
                              )}
                              {index === 1 && (
                                <Trophy className="w-5 h-5 text-gray-400" />
                              )}
                              {index === 2 && (
                                <Trophy className="w-5 h-5 text-amber-600" />
                              )}
                              <span className="font-semibold text-gray-900 dark:text-white">
                                #{index + 1}
                              </span>
                            </div>
                          </td>
                          <td className="py-4 px-4">
                            <div>
                              <div className="font-semibold text-gray-900 dark:text-white">
                                {student.studentName}
                              </div>
                              <div className="text-sm text-gray-500 dark:text-gray-400">
                                {student.email}
                              </div>
                            </div>
                          </td>
                          <td className="py-4 px-4 text-center">
                            {student.averageScore > 0 ? (
                              <span
                                className={`${getScoreBadgeColor(
                                  student.averageScore
                                )} text-white px-3 py-1 rounded-full font-bold text-sm`}
                              >
                                {Math.round(student.averageScore)}%
                              </span>
                            ) : (
                              <span className="text-gray-400 dark:text-gray-600">
                                --
                              </span>
                            )}
                          </td>
                          <td className="py-4 px-4 text-center">
                            <span className="font-semibold text-gray-900 dark:text-white">
                              {student.completedQuests}
                            </span>
                          </td>
                          <td className="py-4 px-4 text-center">
                            <span className="font-semibold text-gray-900 dark:text-white">
                              {student.totalXP.toLocaleString()}
                            </span>
                          </td>
                          <td className="py-4 px-4 text-center">
                            <span className="font-semibold text-gray-900 dark:text-white">
                              {student.tutorialCount}
                            </span>
                          </td>
                          <td className="py-4 px-4 text-center">
                            <span className="text-sm text-gray-500 dark:text-gray-400">
                              {formatDate(student.lastActiveAt)}
                            </span>
                          </td>
                        </tr>
                      )
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </Card>
        </>
      )}
    </>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// Tab 2: Curriculum Effectiveness
// ═══════════════════════════════════════════════════════════════════════════════

function CurriculumEffectivenessTab({
  curricula,
  selectedCurriculumId,
  onSelectCurriculum,
  report,
  loading,
}: {
  curricula: CurriculumOption[];
  selectedCurriculumId: string;
  onSelectCurriculum: (id: string) => void;
  report: CurriculumEffectivenessResponse | null;
  loading: boolean;
}) {
  const questAnalytics = report?.questAnalytics || [];

  // Sort by quest number for chart/table display
  const sortedQuests = [...questAnalytics].sort(
    (a, b) => a.questNumber - b.questNumber
  );

  // Prepare chart data with conditional coloring
  const chartData = sortedQuests.map((q) => ({
    questTitle: q.questTitle,
    averageScore: Math.round(q.averageScore),
    tutorialTriggerRate: q.tutorialTriggerRate,
    fill: q.tutorialTriggerRate > 50 ? "#ef4444" : "#3b82f6",
  }));

  if (curricula.length === 0 && !loading) {
    return (
      <Card className="p-12 text-center">
        <BarChart3 className="w-16 h-16 text-gray-400 mx-auto mb-4" />
        <h3 className="font-merriweather text-xl font-bold text-gray-900 dark:text-white mb-2">
          No Curricula Found
        </h3>
        <p className="text-gray-600 dark:text-gray-400 mb-6">
          Create a curriculum to see effectiveness reports
        </p>
        <Link href="/teacher/curricula">
          <Button variant="primary">Create Curriculum</Button>
        </Link>
      </Card>
    );
  }

  return (
    <>
      {/* Curriculum Selector */}
      <div className="mb-8 flex flex-wrap gap-4 items-center">
        <div className="flex items-center gap-2">
          <Filter className="w-5 h-5 text-gray-600 dark:text-gray-400" />
          <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">
            Curriculum:
          </span>
        </div>

        <select
          value={selectedCurriculumId}
          onChange={(e) => onSelectCurriculum(e.target.value)}
          className="px-4 py-2 border-2 border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
        >
          {curricula.map((c) => (
            <option key={c.id} value={c.id}>
              {c.title}
            </option>
          ))}
        </select>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600 mx-auto mb-3"></div>
            <p className="text-gray-500 dark:text-gray-400">
              Loading effectiveness report...
            </p>
          </div>
        </div>
      ) : report ? (
        <>
          {/* Overview Stats */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <StatCard
              icon={Users}
              label="Total Students"
              value={report.totalStudents}
              iconColor="text-blue-600"
              bgColor="bg-blue-50 dark:bg-blue-900/20"
            />
            <StatCard
              icon={TrendingUp}
              label="Average Score"
              value={
                report.overallAverageScore > 0
                  ? `${Math.round(report.overallAverageScore)}%`
                  : "--"
              }
              iconColor="text-green-600"
              bgColor="bg-green-50 dark:bg-green-900/20"
            />
            <StatCard
              icon={CheckCircle2}
              label="Completion Rate"
              value={
                report.completionRate > 0
                  ? `${Math.round(report.completionRate)}%`
                  : "--"
              }
              iconColor="text-purple-600"
              bgColor="bg-purple-50 dark:bg-purple-900/20"
            />
            <StatCard
              icon={Award}
              label="Avg Tutorials/Student"
              value={
                report.averageTutorialsPerStudent > 0
                  ? report.averageTutorialsPerStudent.toFixed(1)
                  : "--"
              }
              iconColor="text-yellow-600"
              bgColor="bg-yellow-50 dark:bg-yellow-900/20"
            />
          </div>

          {/* Quest Score Chart (Horizontal Bar) */}
          {chartData.length > 0 && (
            <Card className="p-6 mb-8">
              <h2 className="font-merriweather text-xl font-bold text-gray-900 dark:text-white mb-2">
                Quest Average Scores
              </h2>
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
                Red bars indicate quests where tutorial trigger rate exceeds 50%
              </p>
              <ResponsiveContainer
                width="100%"
                height={Math.max(300, chartData.length * 50)}
              >
                <BarChart data={chartData} layout="vertical">
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke="#e5e7eb"
                    horizontal={false}
                  />
                  <XAxis
                    type="number"
                    domain={[0, 100]}
                    tick={{ fontSize: 12, fill: "#6b7280" }}
                    label={{
                      value: "Average Score",
                      position: "insideBottom",
                      offset: -5,
                      style: { fill: "#6b7280", fontSize: 12 },
                    }}
                  />
                  <YAxis
                    type="category"
                    dataKey="questTitle"
                    width={180}
                    tick={{ fontSize: 12, fill: "#6b7280" }}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#1f2937",
                      border: "none",
                      borderRadius: "8px",
                      color: "#fff",
                    }}
                    formatter={(value: any) => [`${value}%`, "Average Score"]}
                  />
                  <ReferenceLine
                    x={70}
                    stroke="#9ca3af"
                    strokeDasharray="3 3"
                    label={{
                      value: "Target (70%)",
                      position: "top",
                      fill: "#9ca3af",
                      fontSize: 11,
                    }}
                  />
                  <Bar
                    dataKey="averageScore"
                    name="Average Score"
                    radius={[0, 4, 4, 0]}
                    barSize={24}
                  >
                    {chartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.fill} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </Card>
          )}

          {/* Quest Details Table */}
          <Card className="p-6">
            <h2 className="font-merriweather text-xl font-bold text-gray-900 dark:text-white mb-6">
              Quest Details
            </h2>

            {sortedQuests.length === 0 ? (
              <div className="text-center py-12">
                <BarChart3 className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600 dark:text-gray-400">
                  No quest analytics available yet
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b-2 border-gray-200 dark:border-gray-700">
                      <th className="text-left py-3 px-4 font-semibold text-gray-700 dark:text-gray-300">
                        Quest Title
                      </th>
                      <th className="text-center py-3 px-4 font-semibold text-gray-700 dark:text-gray-300">
                        Avg Score
                      </th>
                      <th className="text-center py-3 px-4 font-semibold text-gray-700 dark:text-gray-300">
                        Completions
                      </th>
                      <th className="text-center py-3 px-4 font-semibold text-gray-700 dark:text-gray-300">
                        Avg Time
                      </th>
                      <th className="text-center py-3 px-4 font-semibold text-gray-700 dark:text-gray-300">
                        Tutorial Rate
                      </th>
                      <th className="text-center py-3 px-4 font-semibold text-gray-700 dark:text-gray-300">
                        Avg Hints
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {sortedQuests.map((quest: QuestAnalytics) => (
                      <tr
                        key={quest.questId}
                        className="border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/50"
                      >
                        <td className="py-4 px-4">
                          <div className="font-semibold text-gray-900 dark:text-white">
                            {quest.questTitle}
                          </div>
                          <div className="text-sm text-gray-500 dark:text-gray-400">
                            Quest #{quest.questNumber}
                          </div>
                        </td>
                        <td className="py-4 px-4 text-center">
                          {quest.averageScore > 0 ? (
                            <span
                              className={`${getScoreBadgeColor(
                                quest.averageScore
                              )} text-white px-3 py-1 rounded-full font-bold text-sm`}
                            >
                              {Math.round(quest.averageScore)}%
                            </span>
                          ) : (
                            <span className="text-gray-400 dark:text-gray-600">
                              --
                            </span>
                          )}
                        </td>
                        <td className="py-4 px-4 text-center">
                          <span className="font-semibold text-gray-900 dark:text-white">
                            {quest.completionCount}
                          </span>
                        </td>
                        <td className="py-4 px-4 text-center">
                          <div className="flex items-center justify-center gap-1">
                            <Clock className="w-4 h-4 text-gray-400" />
                            <span className="text-gray-900 dark:text-white">
                              {quest.averageTimeMinutes > 0
                                ? `${Math.round(quest.averageTimeMinutes)}m`
                                : "--"}
                            </span>
                          </div>
                        </td>
                        <td className="py-4 px-4 text-center">
                          <span
                            className={`px-3 py-1 rounded-full font-bold text-sm ${
                              quest.tutorialTriggerRate > 50
                                ? "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
                                : "bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300"
                            }`}
                          >
                            {Math.round(quest.tutorialTriggerRate)}%
                          </span>
                        </td>
                        <td className="py-4 px-4 text-center">
                          <span className="font-semibold text-gray-900 dark:text-white">
                            {quest.averageHintsUsed > 0
                              ? quest.averageHintsUsed.toFixed(1)
                              : "--"}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </Card>
        </>
      ) : (
        <Card className="p-12 text-center">
          <BarChart3 className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600 dark:text-gray-400">
            No effectiveness data available for this curriculum
          </p>
        </Card>
      )}
    </>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// Tab 3: Class Comparison
// ═══════════════════════════════════════════════════════════════════════════════

function ClassComparisonTab({
  report,
  loading,
}: {
  report: ClassComparisonResponse | null;
  loading: boolean;
}) {
  const entries = report?.classes || [];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600 mx-auto mb-3"></div>
          <p className="text-gray-500 dark:text-gray-400">
            Loading comparison...
          </p>
        </div>
      </div>
    );
  }

  if (entries.length === 0) {
    return (
      <Card className="p-12 text-center">
        <BarChart3 className="w-16 h-16 text-gray-400 mx-auto mb-4" />
        <h3 className="font-merriweather text-xl font-bold text-gray-900 dark:text-white mb-2">
          No Comparison Data
        </h3>
        <p className="text-gray-600 dark:text-gray-400">
          Class comparison data will appear once students are active
        </p>
      </Card>
    );
  }

  const chartData = entries.map((entry) => ({
    className: entry.className,
    averageScore: Math.round(entry.averageScore),
    averageProgress: Math.round(entry.averageProgress),
  }));

  return (
    <>
      {/* Grouped Bar Chart */}
      <Card className="p-6 mb-8">
        <h2 className="font-merriweather text-xl font-bold text-gray-900 dark:text-white mb-6">
          Class Comparison
        </h2>
        <ResponsiveContainer width="100%" height={400}>
          <BarChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
            <XAxis
              dataKey="className"
              tick={{ fontSize: 12, fill: "#6b7280" }}
            />
            <YAxis
              domain={[0, 100]}
              tick={{ fontSize: 12, fill: "#6b7280" }}
              label={{
                value: "Percentage",
                angle: -90,
                position: "insideLeft",
                style: { fill: "#6b7280", fontSize: 12 },
              }}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: "#1f2937",
                border: "none",
                borderRadius: "8px",
                color: "#fff",
              }}
              formatter={(value: any) => [`${value}%`]}
            />
            <Legend />
            <Bar
              dataKey="averageScore"
              name="Average Score"
              fill="#3b82f6"
              radius={[4, 4, 0, 0]}
              barSize={36}
            />
            <Bar
              dataKey="averageProgress"
              name="Average Progress"
              fill="#14b8a6"
              radius={[4, 4, 0, 0]}
              barSize={36}
            />
          </BarChart>
        </ResponsiveContainer>
      </Card>

      {/* Summary Table */}
      <Card className="p-6">
        <h2 className="font-merriweather text-xl font-bold text-gray-900 dark:text-white mb-6">
          Class Summary
        </h2>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b-2 border-gray-200 dark:border-gray-700">
                <th className="text-left py-3 px-4 font-semibold text-gray-700 dark:text-gray-300">
                  Class Name
                </th>
                <th className="text-center py-3 px-4 font-semibold text-gray-700 dark:text-gray-300">
                  Students
                </th>
                <th className="text-center py-3 px-4 font-semibold text-gray-700 dark:text-gray-300">
                  Avg Score
                </th>
                <th className="text-center py-3 px-4 font-semibold text-gray-700 dark:text-gray-300">
                  Avg Progress
                </th>
                <th className="text-center py-3 px-4 font-semibold text-gray-700 dark:text-gray-300">
                  Attention Needed
                </th>
                <th className="text-center py-3 px-4 font-semibold text-gray-700 dark:text-gray-300">
                  Tutorials
                </th>
              </tr>
            </thead>
            <tbody>
              {entries.map((entry: ClassComparisonEntry) => (
                <tr
                  key={entry.classId}
                  className="border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/50"
                >
                  <td className="py-4 px-4">
                    <span className="font-semibold text-gray-900 dark:text-white">
                      {entry.className}
                    </span>
                  </td>
                  <td className="py-4 px-4 text-center">
                    <span className="font-semibold text-gray-900 dark:text-white">
                      {entry.studentCount}
                    </span>
                  </td>
                  <td className="py-4 px-4 text-center">
                    {entry.averageScore > 0 ? (
                      <span
                        className={`${getScoreBadgeColor(
                          entry.averageScore
                        )} text-white px-3 py-1 rounded-full font-bold text-sm`}
                      >
                        {Math.round(entry.averageScore)}%
                      </span>
                    ) : (
                      <span className="text-gray-400 dark:text-gray-600">
                        --
                      </span>
                    )}
                  </td>
                  <td className="py-4 px-4 text-center">
                    <div className="flex items-center justify-center gap-2">
                      <div className="w-24 bg-gray-200 dark:bg-gray-700 rounded-full h-2.5">
                        <div
                          className="bg-teal-500 h-2.5 rounded-full"
                          style={{
                            width: `${Math.min(
                              100,
                              Math.round(entry.averageProgress)
                            )}%`,
                          }}
                        ></div>
                      </div>
                      <span className="text-sm font-semibold text-gray-900 dark:text-white">
                        {Math.round(entry.averageProgress)}%
                      </span>
                    </div>
                  </td>
                  <td className="py-4 px-4 text-center">
                    {entry.attentionNeededCount > 0 ? (
                      <span className="bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400 px-3 py-1 rounded-full font-bold text-sm">
                        {entry.attentionNeededCount}
                      </span>
                    ) : (
                      <span className="bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 px-3 py-1 rounded-full font-bold text-sm">
                        0
                      </span>
                    )}
                  </td>
                  <td className="py-4 px-4 text-center">
                    <span className="font-semibold text-gray-900 dark:text-white">
                      {entry.tutorialCount}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </>
  );
}
