"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/lib/contexts/AuthContext";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { DashboardHeader } from "@/components/teacher/dashboard/DashboardHeader";
import { Card } from "@/components/ui/Card";
import {
  teacherDashboardApi,
  StudentDetailResponse,
  StudentCurriculumDetail,
  QuestCompletionDetail,
} from "@/lib/api/teacherDashboard";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  ReferenceLine,
} from "recharts";
import {
  ArrowLeft,
  Award,
  BookOpen,
  Clock,
  AlertTriangle,
  CheckCircle,
  ChevronDown,
  ChevronUp,
} from "lucide-react";

// ─── Helpers ────────────────────────────────────────────────────────────────

function formatDate(dateStr: string | null): string {
  if (!dateStr) return "—";
  return new Date(dateStr).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function formatDateTime(dateStr: string | null): string {
  if (!dateStr) return "—";
  return new Date(dateStr).toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

function statusBadge(status: string) {
  const map: Record<string, string> = {
    COMPLETED:
      "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400",
    IN_PROGRESS:
      "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400",
    NOT_STARTED:
      "bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400",
  };
  const cls =
    map[status] ||
    "bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400";
  return (
    <span
      className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium ${cls}`}
    >
      {status.replace("_", " ")}
    </span>
  );
}

function severityColor(severity: string): string {
  switch (severity.toUpperCase()) {
    case "HIGH":
    case "CRITICAL":
      return "border-l-red-500";
    case "MEDIUM":
      return "border-l-yellow-500";
    case "LOW":
      return "border-l-blue-500";
    default:
      return "border-l-gray-400";
  }
}

function severityIcon(severity: string) {
  switch (severity.toUpperCase()) {
    case "HIGH":
    case "CRITICAL":
      return <AlertTriangle className="w-5 h-5 text-red-500" />;
    case "MEDIUM":
      return <AlertTriangle className="w-5 h-5 text-yellow-500" />;
    case "LOW":
      return <Clock className="w-5 h-5 text-blue-500" />;
    default:
      return <Clock className="w-5 h-5 text-gray-400" />;
  }
}

// ─── Chart Tooltip ──────────────────────────────────────────────────────────

function ScoreTooltip({ active, payload }: any) {
  if (!active || !payload?.length) return null;
  const d = payload[0].payload;
  return (
    <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg p-3 text-sm">
      <p className="font-semibold text-gray-900 dark:text-white">{d.questTitle}</p>
      <p className="text-gray-600 dark:text-gray-400">
        Score: <span className="font-medium text-blue-600">{d.score}</span>
      </p>
      <p className="text-gray-500 dark:text-gray-500 text-xs">{d.date}</p>
    </div>
  );
}

// ─── Curriculum Accordion ───────────────────────────────────────────────────

function CurriculumAccordion({
  curriculum,
}: {
  curriculum: StudentCurriculumDetail;
}) {
  const [open, setOpen] = useState(false);

  return (
    <Card className="overflow-hidden">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between gap-4 text-left"
      >
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-3 flex-wrap">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white truncate">
              {curriculum.curriculumTitle}
            </h3>
            {statusBadge(curriculum.status)}
          </div>

          <div className="mt-2 flex items-center gap-6 text-sm text-gray-600 dark:text-gray-400">
            <span>
              {curriculum.completedQuests}/{curriculum.totalQuests} quests
            </span>
            <span>Avg score: {Math.round(curriculum.averageScore)}%</span>
            <span>{curriculum.totalXP} XP</span>
          </div>

          {/* Progress bar */}
          <div className="mt-3 w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
            <div
              className="bg-blue-500 h-2 rounded-full transition-all"
              style={{ width: `${Math.min(curriculum.progressPercentage, 100)}%` }}
            />
          </div>
        </div>

        <div className="flex-shrink-0 text-gray-400">
          {open ? (
            <ChevronUp className="w-5 h-5" />
          ) : (
            <ChevronDown className="w-5 h-5" />
          )}
        </div>
      </button>

      {open && (
        <div className="mt-4 -mx-6 -mb-6">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 dark:bg-gray-900/50 text-left text-gray-500 dark:text-gray-400">
                  <th className="px-6 py-3 font-medium">Quest</th>
                  <th className="px-6 py-3 font-medium">Score</th>
                  <th className="px-6 py-3 font-medium">Attempts</th>
                  <th className="px-6 py-3 font-medium">Time</th>
                  <th className="px-6 py-3 font-medium">Hints</th>
                  <th className="px-6 py-3 font-medium">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                {curriculum.questCompletions.length === 0 ? (
                  <tr>
                    <td
                      colSpan={6}
                      className="px-6 py-4 text-center text-gray-400 dark:text-gray-500"
                    >
                      No quest completions yet
                    </td>
                  </tr>
                ) : (
                  curriculum.questCompletions
                    .slice()
                    .sort((a, b) => a.questNumber - b.questNumber)
                    .map((q: QuestCompletionDetail) => (
                      <tr
                        key={`${q.questId}-${q.completedAt}`}
                        className="hover:bg-gray-50 dark:hover:bg-gray-800/50"
                      >
                        <td className="px-6 py-3 text-gray-900 dark:text-white font-medium">
                          {q.questNumber}. {q.questTitle}
                        </td>
                        <td className="px-6 py-3">
                          <span
                            className={
                              q.score >= 85
                                ? "text-green-600 font-semibold"
                                : q.score >= 60
                                  ? "text-blue-600 font-semibold"
                                  : "text-red-600 font-semibold"
                            }
                          >
                            {q.score}%
                          </span>
                        </td>
                        <td className="px-6 py-3 text-gray-600 dark:text-gray-400">
                          {q.attempts}
                        </td>
                        <td className="px-6 py-3 text-gray-600 dark:text-gray-400">
                          {q.timeSpentMinutes}m
                        </td>
                        <td className="px-6 py-3 text-gray-600 dark:text-gray-400">
                          {q.hintsUsed}
                        </td>
                        <td className="px-6 py-3 text-gray-500 dark:text-gray-500">
                          {formatDate(q.completedAt)}
                        </td>
                      </tr>
                    ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </Card>
  );
}

// ─── Main Page ──────────────────────────────────────────────────────────────

function StudentDetailContent() {
  const { studentId } = useParams<{ studentId: string }>();
  const { user } = useAuth();

  const [data, setData] = useState<StudentDetailResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchDetail() {
      if (!user?.uid || !studentId) return;
      try {
        setError(null);
        const result = await teacherDashboardApi.getStudentDetail(
          user.uid,
          studentId
        );
        if (!result) {
          setError("Student not found or you do not have access.");
        }
        setData(result);
      } catch (err: any) {
        console.error("Failed to load student detail:", err);
        setError(err.message || "Failed to load student detail.");
      } finally {
        setLoading(false);
      }
    }
    fetchDetail();
  }, [user?.uid, studentId]);

  // ── Loading ────────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <DashboardHeader />
        <div className="flex items-center justify-center py-32">
          <div className="text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600 mx-auto mb-4" />
            <p className="text-gray-600 dark:text-gray-400">
              Loading student details...
            </p>
          </div>
        </div>
      </div>
    );
  }

  // ── Error ──────────────────────────────────────────────────────────────
  if (error || !data) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <DashboardHeader />
        <div className="flex items-center justify-center py-32">
          <div className="text-center max-w-md">
            <AlertTriangle className="w-12 h-12 text-red-500 mx-auto mb-4" />
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
              Error Loading Student
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              {error || "An unexpected error occurred."}
            </p>
            <Link
              href="/teacher/dashboard"
              className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Dashboard
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // ── Prepare chart data ─────────────────────────────────────────────────
  const allCompletions: (QuestCompletionDetail & { date: string })[] = [];
  data.curricula.forEach((c) => {
    c.questCompletions.forEach((q) => {
      allCompletions.push({
        ...q,
        date: formatDate(q.completedAt),
      });
    });
  });
  allCompletions.sort(
    (a, b) =>
      new Date(a.completedAt).getTime() - new Date(b.completedAt).getTime()
  );

  const chartData = allCompletions.map((q, idx) => ({
    index: idx + 1,
    score: q.score,
    questTitle: q.questTitle,
    date: q.date,
  }));

  const stats = data.overallStats;

  // ── Render ─────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <DashboardHeader />

      <main className="max-w-7xl mx-auto px-8 py-8">
        {/* Back link */}
        <Link
          href="/teacher/dashboard"
          className="inline-flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors mb-6"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Dashboard
        </Link>

        {/* ── Header ─────────────────────────────────────────────────── */}
        <Card className="mb-8">
          <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                {data.studentName}
              </h1>
              <p className="text-gray-500 dark:text-gray-400 mt-1">
                {data.email}
              </p>

              {data.classes.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-3">
                  {data.classes.map((c) => (
                    <span
                      key={c.classId}
                      className="inline-block px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400"
                    >
                      {c.className}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Stats row */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-yellow-100 dark:bg-yellow-900/30">
                <Award className="w-5 h-5 text-yellow-600 dark:text-yellow-400" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {stats.totalXP.toLocaleString()}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Total XP
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-blue-100 dark:bg-blue-900/30">
                <BookOpen className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {Math.round(stats.overallAverageScore)}%
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Avg Score
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-green-100 dark:bg-green-900/30">
                <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {stats.totalCompletedQuests}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Quests Completed
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-purple-100 dark:bg-purple-900/30">
                <Clock className="w-5 h-5 text-purple-600 dark:text-purple-400" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {stats.completedTutorials}/{stats.totalTutorials}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Tutorials
                </p>
              </div>
            </div>
          </div>
        </Card>

        {/* ── Score Trajectory Chart ─────────────────────────────────── */}
        <Card className="mb-8">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
            Score Trajectory
          </h2>
          {chartData.length === 0 ? (
            <p className="text-gray-400 dark:text-gray-500 text-center py-12">
              No quest completions yet to display.
            </p>
          ) : (
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart
                  data={chartData}
                  margin={{ top: 10, right: 20, bottom: 10, left: 0 }}
                >
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke="#e5e7eb"
                    className="dark:opacity-20"
                  />
                  <XAxis
                    dataKey="index"
                    tick={{ fontSize: 12, fill: "#9ca3af" }}
                    axisLine={{ stroke: "#d1d5db" }}
                    tickLine={false}
                    label={{
                      value: "Quest Completion #",
                      position: "insideBottom",
                      offset: -5,
                      fontSize: 12,
                      fill: "#9ca3af",
                    }}
                  />
                  <YAxis
                    domain={[0, 100]}
                    tick={{ fontSize: 12, fill: "#9ca3af" }}
                    axisLine={{ stroke: "#d1d5db" }}
                    tickLine={false}
                    label={{
                      value: "Score",
                      angle: -90,
                      position: "insideLeft",
                      fontSize: 12,
                      fill: "#9ca3af",
                    }}
                  />
                  <Tooltip content={<ScoreTooltip />} />
                  <ReferenceLine
                    y={60}
                    stroke="#ef4444"
                    strokeDasharray="6 4"
                    label={{
                      value: "Struggling (60)",
                      position: "insideTopRight",
                      fontSize: 11,
                      fill: "#ef4444",
                    }}
                  />
                  <Line
                    type="monotone"
                    dataKey="score"
                    stroke="#3b82f6"
                    strokeWidth={2}
                    dot={{ r: 4, fill: "#3b82f6", stroke: "#fff", strokeWidth: 2 }}
                    activeDot={{ r: 6, fill: "#3b82f6", stroke: "#fff", strokeWidth: 2 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          )}
        </Card>

        {/* ── Per-Curriculum Accordions ──────────────────────────────── */}
        <div className="mb-8">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
            Curricula
          </h2>
          {data.curricula.length === 0 ? (
            <Card>
              <p className="text-gray-400 dark:text-gray-500 text-center py-8">
                No curricula enrolled.
              </p>
            </Card>
          ) : (
            <div className="space-y-4">
              {data.curricula.map((c) => (
                <CurriculumAccordion key={c.curriculumId} curriculum={c} />
              ))}
            </div>
          )}
        </div>

        {/* ── Tutorial History ───────────────────────────────────────── */}
        <Card className="mb-8">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
            Tutorial History
          </h2>
          {data.tutorials.length === 0 ? (
            <p className="text-gray-400 dark:text-gray-500 text-center py-8">
              No tutorials recorded.
            </p>
          ) : (
            <div className="overflow-x-auto -mx-6 -mb-6">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-gray-50 dark:bg-gray-900/50 text-left text-gray-500 dark:text-gray-400">
                    <th className="px-6 py-3 font-medium">Day</th>
                    <th className="px-6 py-3 font-medium">Score on Quest</th>
                    <th className="px-6 py-3 font-medium">Status</th>
                    <th className="px-6 py-3 font-medium">Attempt #</th>
                    <th className="px-6 py-3 font-medium">Completed</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                  {data.tutorials.map((t) => (
                    <tr
                      key={t.id}
                      className="hover:bg-gray-50 dark:hover:bg-gray-800/50"
                    >
                      <td className="px-6 py-3 text-gray-900 dark:text-white font-medium">
                        Day {t.dayNumber}
                      </td>
                      <td className="px-6 py-3">
                        <span
                          className={
                            t.scoreOnQuest >= 85
                              ? "text-green-600 font-semibold"
                              : t.scoreOnQuest >= 60
                                ? "text-blue-600 font-semibold"
                                : "text-red-600 font-semibold"
                          }
                        >
                          {t.scoreOnQuest}%
                        </span>
                      </td>
                      <td className="px-6 py-3">{statusBadge(t.status)}</td>
                      <td className="px-6 py-3 text-gray-600 dark:text-gray-400">
                        {t.attemptNumber}
                      </td>
                      <td className="px-6 py-3 text-gray-500 dark:text-gray-500">
                        {t.completed ? (
                          <span className="inline-flex items-center gap-1 text-green-600">
                            <CheckCircle className="w-4 h-4" />
                            {formatDate(t.completedAt)}
                          </span>
                        ) : (
                          <span className="text-gray-400">—</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>

        {/* ── Recent Alerts ──────────────────────────────────────────── */}
        <div className="mb-8">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
            Recent Alerts
          </h2>
          {data.recentAlerts.length === 0 ? (
            <Card>
              <p className="text-gray-400 dark:text-gray-500 text-center py-8">
                No recent alerts.
              </p>
            </Card>
          ) : (
            <div className="space-y-3">
              {data.recentAlerts.map((alert) => (
                <Card
                  key={alert.id}
                  className={`border-l-4 ${severityColor(alert.severity)} ${
                    !alert.isRead
                      ? "bg-white dark:bg-gray-800"
                      : "bg-gray-50 dark:bg-gray-800/60"
                  }`}
                >
                  <div className="flex items-start gap-3">
                    {severityIcon(alert.severity)}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xs font-medium uppercase text-gray-500 dark:text-gray-400">
                          {alert.type.replace(/_/g, " ")}
                        </span>
                        {!alert.isRead && (
                          <span className="inline-block w-2 h-2 rounded-full bg-blue-500" />
                        )}
                      </div>
                      <p className="text-sm text-gray-900 dark:text-white">
                        {alert.message}
                      </p>
                      <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                        {formatDateTime(alert.createdAt)}
                      </p>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

// ─── Exported Page (wrapped with ProtectedRoute) ────────────────────────────

export default function StudentDetailPage() {
  return (
    <ProtectedRoute requiredRole="TEACHER">
      <StudentDetailContent />
    </ProtectedRoute>
  );
}
