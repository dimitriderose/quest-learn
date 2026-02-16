"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/contexts/AuthContext";
import { DashboardHeader } from "@/components/teacher/dashboard/DashboardHeader";
import { StudentGrid } from "@/components/teacher/dashboard/StudentGrid";
import { CreateCurriculumFAB } from "@/components/teacher/dashboard/CreateCurriculumFAB";
import { Card } from "@/components/ui/Card";
import {
  teacherDashboardApi,
  TeacherDashboardResponse,
  ActionRequiredStudent,
} from "@/lib/api/teacherDashboard";
import {
  AlertTriangle,
  Clock,
  AlertCircle,
  CheckCircle,
  BookOpen,
  Award,
  Users,
  Map,
  TrendingUp,
  Bell,
} from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function formatRelativeTime(timestamp: string): string {
  const now = new Date();
  const date = new Date(timestamp);
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffMins < 1) return "Just now";
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays === 1) return "Yesterday";
  if (diffDays < 30) return `${diffDays}d ago`;
  return date.toLocaleDateString();
}

function activityIcon(type: string) {
  switch (type) {
    case "QUEST_COMPLETED":
      return <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />;
    case "TUTORIAL_STARTED":
      return <BookOpen className="w-4 h-4 text-blue-500 flex-shrink-0" />;
    case "TUTORIAL_COMPLETED":
      return <Award className="w-4 h-4 text-purple-500 flex-shrink-0" />;
    default:
      return <CheckCircle className="w-4 h-4 text-gray-400 flex-shrink-0" />;
  }
}

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------

function QuickStats({
  totalStudents,
  activeQuests,
  overallAverage,
  needAttention,
}: {
  totalStudents: number;
  activeQuests: number;
  overallAverage: number;
  needAttention: number;
}) {
  const cards = [
    {
      label: "Total Students",
      value: totalStudents,
      icon: <Users className="w-6 h-6 text-teal-600" />,
      color: "bg-teal-50 dark:bg-teal-900/20",
    },
    {
      label: "Active Quests",
      value: activeQuests,
      icon: <Map className="w-6 h-6 text-blue-600" />,
      color: "bg-blue-50 dark:bg-blue-900/20",
    },
    {
      label: "Overall Average",
      value: `${overallAverage}%`,
      icon: <TrendingUp className="w-6 h-6 text-green-600" />,
      color: "bg-green-50 dark:bg-green-900/20",
    },
    {
      label: "Need Attention",
      value: needAttention,
      icon: <Bell className="w-6 h-6 text-amber-600" />,
      color: "bg-amber-50 dark:bg-amber-900/20",
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {cards.map((c) => (
        <Card key={c.label} className={`flex items-center gap-4 ${c.color}`}>
          <div className="p-3 rounded-lg bg-white/60 dark:bg-gray-800/60">
            {c.icon}
          </div>
          <div>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {c.label}
            </p>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">
              {c.value}
            </p>
          </div>
        </Card>
      ))}
    </div>
  );
}

// ---------------------------------------------------------------------------

function ActionRequiredItem({
  item,
  variant,
  onView,
}: {
  item: ActionRequiredStudent;
  variant: "tutorial" | "inactive" | "stuck";
  onView: (studentId: string) => void;
}) {
  const icons = {
    tutorial: <AlertTriangle className="w-4 h-4 text-amber-600 flex-shrink-0" />,
    inactive: <Clock className="w-4 h-4 text-amber-600 flex-shrink-0" />,
    stuck: <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0" />,
  };

  return (
    <div className="flex items-center justify-between py-2">
      <div className="flex items-center gap-2 min-w-0">
        {icons[variant]}
        <span className="font-medium text-gray-900 dark:text-white truncate">
          {item.studentName}
        </span>
        <span className="text-sm text-gray-500 dark:text-gray-400 truncate hidden sm:inline">
          &mdash; {item.reason}
        </span>
      </div>
      <button
        onClick={() => onView(item.studentId)}
        className="text-sm font-medium text-teal-600 hover:text-teal-700 dark:text-teal-400 dark:hover:text-teal-300 flex-shrink-0 ml-2"
      >
        View
      </button>
    </div>
  );
}

function ActionRequiredSection({
  actionRequired,
  onViewStudent,
}: {
  actionRequired: TeacherDashboardResponse["actionRequired"];
  onViewStudent: (studentId: string) => void;
}) {
  const [expanded, setExpanded] = useState(false);

  type TaggedItem = { item: ActionRequiredStudent; variant: "tutorial" | "inactive" | "stuck" };

  const allItems: TaggedItem[] = [
    ...actionRequired.studentsNeedingTutorials.map(
      (item) => ({ item, variant: "tutorial" as const })
    ),
    ...actionRequired.inactiveStudents.map(
      (item) => ({ item, variant: "inactive" as const })
    ),
    ...actionRequired.stuckStudents.map(
      (item) => ({ item, variant: "stuck" as const })
    ),
  ];

  if (allItems.length === 0) {
    return (
      <div className="rounded-lg border border-green-200 bg-green-50 dark:bg-green-900/20 dark:border-green-800 p-4 flex items-center gap-3">
        <CheckCircle className="w-5 h-5 text-green-600" />
        <span className="text-green-800 dark:text-green-300 font-medium">
          All caught up! No students need attention right now.
        </span>
      </div>
    );
  }

  const hasStuck = actionRequired.stuckStudents.length > 0;
  const visibleItems = expanded ? allItems : allItems.slice(0, 3);

  return (
    <div
      className={`rounded-lg border p-4 ${
        hasStuck
          ? "border-red-200 bg-red-50 dark:bg-red-900/20 dark:border-red-800"
          : "border-amber-200 bg-amber-50 dark:bg-amber-900/20 dark:border-amber-800"
      }`}
    >
      <h3
        className={`text-sm font-semibold uppercase tracking-wide mb-2 ${
          hasStuck
            ? "text-red-700 dark:text-red-400"
            : "text-amber-700 dark:text-amber-400"
        }`}
      >
        Action Required ({allItems.length})
      </h3>

      <div className="divide-y divide-gray-200 dark:divide-gray-700">
        {visibleItems.map((tagged, idx) => (
          <ActionRequiredItem
            key={`${tagged.variant}-${tagged.item.studentId}-${idx}`}
            item={tagged.item}
            variant={tagged.variant}
            onView={onViewStudent}
          />
        ))}
      </div>

      {allItems.length > 3 && (
        <button
          onClick={() => setExpanded(!expanded)}
          className={`mt-2 text-sm font-medium ${
            hasStuck
              ? "text-red-600 hover:text-red-700 dark:text-red-400"
              : "text-amber-600 hover:text-amber-700 dark:text-amber-400"
          }`}
        >
          {expanded ? "Show less" : `Show all (${allItems.length})`}
        </button>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------

function ProgressDistributionChart({
  buckets,
}: {
  buckets: TeacherDashboardResponse["progressDistribution"]["buckets"];
}) {
  const data = buckets.map((b) => ({
    name: b.label,
    students: b.count,
  }));

  return (
    <Card className="flex-1">
      <h3 className="font-merriweather text-lg font-bold text-gray-900 dark:text-white mb-4">
        Progress Distribution
      </h3>
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data}>
            <XAxis
              dataKey="name"
              tick={{ fontSize: 12 }}
              stroke="#9ca3af"
            />
            <YAxis
              allowDecimals={false}
              tick={{ fontSize: 12 }}
              stroke="#9ca3af"
            />
            <Tooltip
              contentStyle={{
                backgroundColor: "var(--color-bg, #fff)",
                border: "1px solid #e5e7eb",
                borderRadius: "0.5rem",
              }}
            />
            <Bar
              dataKey="students"
              fill="#0d9488"
              radius={[4, 4, 0, 0]}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
}

// ---------------------------------------------------------------------------

function ActivityFeed({
  activities,
}: {
  activities: TeacherDashboardResponse["recentActivity"];
}) {
  const visible = activities.slice(0, 20);

  return (
    <Card className="flex-1">
      <h3 className="font-merriweather text-lg font-bold text-gray-900 dark:text-white mb-4">
        Recent Activity
      </h3>
      <div className="overflow-y-auto max-h-80 -mr-2 pr-2">
        {visible.length === 0 ? (
          <p className="text-gray-400 dark:text-gray-500 text-sm py-4 text-center">
            No recent activity
          </p>
        ) : (
          <ul className="space-y-3">
            {visible.map((a, idx) => (
              <li key={`${a.studentId}-${a.timestamp}-${idx}`} className="flex items-start gap-3">
                {activityIcon(a.type)}
                <div className="min-w-0 flex-1">
                  <p className="text-sm text-gray-800 dark:text-gray-200 leading-snug">
                    {a.description}
                  </p>
                  <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">
                    {formatRelativeTime(a.timestamp)}
                  </p>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </Card>
  );
}

// ---------------------------------------------------------------------------
// Main Page
// ---------------------------------------------------------------------------

export default function TeacherDashboard() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [timeoutError, setTimeoutError] = useState(false);
  const [dashboard, setDashboard] = useState<TeacherDashboardResponse | null>(null);

  // Timeout if user doesn't load within 5 seconds when token exists
  useEffect(() => {
    if (typeof window === "undefined") return;

    const hasToken = localStorage.getItem("auth_token");

    if (hasToken && !user && !authLoading) {
      const timer = setTimeout(() => {
        setTimeoutError(true);
      }, 5000);

      return () => clearTimeout(timer);
    }
  }, [user, authLoading]);

  // Single batched API call
  useEffect(() => {
    async function loadDashboardData() {
      if (authLoading) return;

      if (!user) {
        setLoading(false);
        return;
      }

      try {
        setError(null);
        const data = await teacherDashboardApi.getDashboard(user.uid);

        if (!data) {
          setError("Failed to load dashboard data");
          return;
        }

        setDashboard(data);
      } catch (err: any) {
        console.error("Error loading dashboard data:", err);
        setError(err.message || "Failed to load dashboard data");
      } finally {
        setLoading(false);
      }
    }

    loadDashboardData();
  }, [user, authLoading]);

  // ---- Navigate to student detail ----
  function handleStudentClick(studentId: string) {
    router.push(`/teacher/dashboard/student/${studentId}`);
  }

  // ---- Render states ----

  // Timeout error
  if (timeoutError) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center max-w-md">
          <div className="text-red-600 text-6xl mb-4">&#9888;&#65039;</div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            Authentication Timeout
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            Failed to load user information. This might be due to a network
            issue or expired session.
          </p>
          <div className="space-y-3">
            <button
              onClick={() => window.location.reload()}
              className="w-full px-6 py-3 bg-teacher-teal text-white rounded-lg hover:bg-teal-600 transition"
            >
              Retry
            </button>
            <button
              onClick={() => {
                localStorage.clear();
                window.location.href = "/login";
              }}
              className="w-full px-6 py-3 bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition"
            >
              Back to Login
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Loading spinner
  const hasToken =
    typeof window !== "undefined" && localStorage.getItem("auth_token");
  if (authLoading || (hasToken && !user) || loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-teacher-teal mx-auto mb-4" />
          <p className="text-gray-600 dark:text-gray-400">
            Loading dashboard...
          </p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-600 mb-4">Error loading dashboard</div>
          <p className="text-gray-600 dark:text-gray-400">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="mt-4 px-4 py-2 bg-teacher-teal text-white rounded-lg"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  // ---- Derive values from dashboard data ----

  const stats = dashboard?.stats ?? {
    totalStudents: 0,
    totalClasses: 0,
    overallAverage: 0,
    unreadAlerts: 0,
  };

  const students = dashboard?.students ?? [];
  const actionRequired = dashboard?.actionRequired ?? {
    studentsNeedingTutorials: [],
    inactiveStudents: [],
    stuckStudents: [],
  };
  const recentActivity = dashboard?.recentActivity ?? [];
  const progressDistribution = dashboard?.progressDistribution ?? {
    buckets: [],
  };

  // Count active quests: students whose currentQuest is not empty / not a
  // "no quest" placeholder
  const activeQuestsCount = students.filter(
    (s) =>
      s.currentQuest &&
      s.currentQuest !== "No quest assigned" &&
      s.currentQuest !== "All quests complete!"
  ).length;

  // Need attention = total items across all action-required buckets
  const needAttentionCount =
    actionRequired.studentsNeedingTutorials.length +
    actionRequired.inactiveStudents.length +
    actionRequired.stuckStudents.length;

  // Map DashboardStudent to the shape StudentGrid expects
  const gridStudents = students.map((s) => ({
    id: s.id,
    name: s.name,
    avatar: s.avatar,
    currentQuest: s.currentQuest,
    progress: s.progress,
    status: s.status,
    lastActive: s.lastActive ?? "Never",
    tutorialStatus: s.tutorialStatus,
  }));

  // ---- Main layout ----

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <DashboardHeader />

      <main className="max-w-7xl mx-auto px-8 py-8">
        {/* Page heading */}
        <div className="mb-8">
          <h1 className="font-merriweather text-4xl font-bold text-gray-900 dark:text-white">
            Dashboard
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            {stats.totalClasses}{" "}
            {stats.totalClasses === 1 ? "class" : "classes"} &bull;{" "}
            {stats.totalStudents}{" "}
            {stats.totalStudents === 1 ? "student" : "students"}
          </p>
        </div>

        {/* Quick Stats */}
        <QuickStats
          totalStudents={stats.totalStudents}
          activeQuests={activeQuestsCount}
          overallAverage={stats.overallAverage}
          needAttention={needAttentionCount}
        />

        {/* Action Required */}
        <div className="mt-8">
          <ActionRequiredSection
            actionRequired={actionRequired}
            onViewStudent={handleStudentClick}
          />
        </div>

        {/* Two-column: Progress Distribution + Activity Feed */}
        <div className="mt-8 grid grid-cols-1 lg:grid-cols-2 gap-6">
          <ProgressDistributionChart buckets={progressDistribution.buckets} />
          <ActivityFeed activities={recentActivity} />
        </div>

        {/* Student Grid */}
        <div className="mt-8">
          {gridStudents.length > 0 ? (
            <StudentGrid
              students={gridStudents}
              onStudentClick={handleStudentClick}
            />
          ) : (
            <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-lg">
              <p className="text-gray-500 dark:text-gray-400 mb-4">
                No students enrolled yet
              </p>
              <p className="text-sm text-gray-400">
                Students will appear here when they join your classes
              </p>
            </div>
          )}
        </div>
      </main>

      <CreateCurriculumFAB />
    </div>
  );
}
