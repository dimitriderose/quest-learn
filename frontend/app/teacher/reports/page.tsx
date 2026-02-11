"use client";

import { useState, useEffect } from "react";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { DashboardHeader } from "@/components/teacher/dashboard/DashboardHeader";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { classApi, ClassDto } from "@/lib/api/classes";
import { progressApi, ClassReportResponse, StudentReportEntry, QuestCompletion } from "@/lib/api/progress";
import {
  TrendingUp,
  Users,
  Award,
  CheckCircle2,
  Download,
  Filter,
  Trophy,
  ChevronDown,
  ChevronRight
} from "lucide-react";
import Link from "next/link";

function getScoreBadgeColor(score: number): string {
  if (score >= 90) return "bg-green-500";
  if (score >= 75) return "bg-blue-500";
  if (score >= 60) return "bg-yellow-500";
  return "bg-orange-500";
}

/**
 * Deduplicate quest completions by questId, keeping best score, sorted by questNumber.
 */
function getBestQuestCompletions(completions: QuestCompletion[]): QuestCompletion[] {
  const bestByQuest = new Map<string, QuestCompletion>();
  completions.forEach(c => {
    const existing = bestByQuest.get(c.questId);
    if (!existing || c.score > existing.score) {
      bestByQuest.set(c.questId, c);
    }
  });
  return Array.from(bestByQuest.values()).sort((a, b) => a.questNumber - b.questNumber);
}

export default function TeacherReportsPage() {
  const [classes, setClasses] = useState<ClassDto[]>([]);
  const [selectedClass, setSelectedClass] = useState<string>("");
  const [report, setReport] = useState<ClassReportResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState<string>("week");
  const [expandedStudents, setExpandedStudents] = useState<Set<string>>(new Set());

  useEffect(() => {
    loadClasses();
  }, []);

  useEffect(() => {
    if (selectedClass) {
      setExpandedStudents(new Set());
      loadReport();
    }
  }, [selectedClass]);

  const loadClasses = async () => {
    try {
      const data = await classApi.getAll();
      setClasses(data);
      if (data.length > 0) {
        setSelectedClass(data[0].id);
      }
    } catch (error) {
      console.error('Failed to load classes:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadReport = async () => {
    try {
      const data = await progressApi.getClassReport(selectedClass);
      setReport(data);
    } catch (error) {
      console.error('Failed to load class report:', error);
      setReport(null);
    }
  };

  const toggleExpanded = (studentId: string) => {
    setExpandedStudents(prev => {
      const next = new Set(prev);
      if (next.has(studentId)) {
        next.delete(studentId);
      } else {
        next.add(studentId);
      }
      return next;
    });
  };

  const exportReport = () => {
    alert('Export functionality will download CSV with student progress data');
  };

  if (loading) {
    return (
      <ProtectedRoute requiredRole="TEACHER">
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
          <DashboardHeader />
          <div className="flex items-center justify-center h-96">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-gray-600 dark:text-gray-400">Loading reports...</p>
            </div>
          </div>
        </div>
      </ProtectedRoute>
    );
  }

  if (classes.length === 0) {
    return (
      <ProtectedRoute requiredRole="TEACHER">
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
          <DashboardHeader />
          <div className="max-w-7xl mx-auto px-8 py-8">
            <Card className="p-12 text-center">
              <div className="text-6xl mb-4">📊</div>
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

  const selectedClassData = classes.find(c => c.id === selectedClass);
  const students = report?.students ?? [];

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
            <Button variant="secondary" onClick={exportReport}>
              <Download className="w-5 h-5 mr-2" />
              Export Report
            </Button>
          </div>

          {/* Filters */}
          <div className="mb-8 flex flex-wrap gap-4">
            <div className="flex items-center gap-2">
              <Filter className="w-5 h-5 text-gray-600 dark:text-gray-400" />
              <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                View:
              </span>
            </div>

            <select
              value={selectedClass}
              onChange={(e) => setSelectedClass(e.target.value)}
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
              onChange={(e) => setTimeRange(e.target.value)}
              className="px-4 py-2 border-2 border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
            >
              <option key="today" value="today">Today</option>
              <option key="week" value="week">This Week</option>
              <option key="month" value="month">This Month</option>
              <option key="quarter" value="quarter">This Quarter</option>
              <option key="year" value="year">This Year</option>
            </select>
          </div>

          {/* Stats Overview */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <StatCard
              icon={Users}
              label="Total Students"
              value={report?.totalStudents ?? selectedClassData?.studentCount ?? 0}
              iconColor="text-blue-600"
              bgColor="bg-blue-50 dark:bg-blue-900/20"
            />
            <StatCard
              icon={Trophy}
              label="Class Average"
              value={report && report.classAverage > 0 ? `${report.classAverage}%` : "--"}
              subtext={students.length > 0 ? `In ${report?.className || 'this class'}` : "No data yet"}
              iconColor="text-green-600"
              bgColor="bg-green-50 dark:bg-green-900/20"
            />
            <StatCard
              icon={CheckCircle2}
              label="Quests Completed"
              value={report && report.totalCompletedQuests > 0 ? report.totalCompletedQuests : "--"}
              subtext={report && report.totalCompletedQuests > 0 ? `In ${report.className}` : "No data yet"}
              iconColor="text-purple-600"
              bgColor="bg-purple-50 dark:bg-purple-900/20"
            />
            <StatCard
              icon={Award}
              label="Total XP Earned"
              value={report && report.totalXP > 0 ? report.totalXP.toLocaleString() : "--"}
              subtext={report && report.totalXP > 0 ? `In ${report.className}` : "No data yet"}
              iconColor="text-yellow-600"
              bgColor="bg-yellow-50 dark:bg-yellow-900/20"
            />
          </div>

          {/* Student Performance Table */}
          <Card className="p-6">
            <h2 className="font-merriweather text-xl font-bold text-gray-900 dark:text-white mb-6">
              Student Performance
            </h2>

            {students.length === 0 ? (
              <div className="text-center py-12">
                <TrendingUp className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
                  No Student Data Yet
                </h3>
                <p className="text-gray-600 dark:text-gray-400">
                  {selectedClassData && selectedClassData.studentCount > 0
                    ? "Students haven't completed any quests yet"
                    : "No students enrolled in this class"}
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
                    </tr>
                  </thead>
                  <tbody>
                    {students.map((student, index) => {
                      const isExpanded = expandedStudents.has(student.studentId);
                      const questCompletions = getBestQuestCompletions(student.classQuestCompletions);

                      return (
                        <>
                          <tr
                            key={student.studentId}
                            onClick={() => toggleExpanded(student.studentId)}
                            className="border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/50 cursor-pointer"
                          >
                            <td className="py-4 px-4">
                              <div className="flex items-center gap-2">
                                {isExpanded
                                  ? <ChevronDown className="w-4 h-4 text-gray-400" />
                                  : <ChevronRight className="w-4 h-4 text-gray-400" />
                                }
                                {index === 0 && <Trophy className="w-5 h-5 text-yellow-500" />}
                                {index === 1 && <Trophy className="w-5 h-5 text-gray-400" />}
                                {index === 2 && <Trophy className="w-5 h-5 text-amber-600" />}
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
                                  {student.studentEmail}
                                </div>
                              </div>
                            </td>
                            <td className="py-4 px-4 text-center">
                              {student.classAverageScore > 0 ? (
                                <div className="flex flex-col items-center gap-1">
                                  <div
                                    className={`${getScoreBadgeColor(student.classAverageScore)} text-white px-3 py-1 rounded-full font-bold`}
                                  >
                                    {student.classAverageScore}%
                                  </div>
                                  {student.overallAverageScore !== student.classAverageScore && (
                                    <span className="text-xs text-gray-400 dark:text-gray-500">
                                      Overall: {student.overallAverageScore}%
                                    </span>
                                  )}
                                </div>
                              ) : (
                                <span className="text-gray-400 dark:text-gray-600">--</span>
                              )}
                            </td>
                            <td className="py-4 px-4 text-center">
                              <span className="font-semibold text-gray-900 dark:text-white">
                                {student.classCompletedQuests}
                              </span>
                              {student.overallCompletedQuests !== student.classCompletedQuests && (
                                <div className="text-xs text-gray-400 dark:text-gray-500">
                                  Overall: {student.overallCompletedQuests}
                                </div>
                              )}
                            </td>
                            <td className="py-4 px-4 text-center">
                              <span className="font-semibold text-gray-900 dark:text-white">
                                {student.classTotalXP.toLocaleString()}
                              </span>
                              {student.overallTotalXP !== student.classTotalXP && (
                                <div className="text-xs text-gray-400 dark:text-gray-500">
                                  Overall: {student.overallTotalXP.toLocaleString()}
                                </div>
                              )}
                            </td>
                          </tr>

                          {/* Expanded quest details */}
                          {isExpanded && (
                            <tr key={`${student.studentId}-detail`} className="bg-gray-50 dark:bg-gray-800/30">
                              <td colSpan={5} className="px-4 py-4">
                                {questCompletions.length === 0 ? (
                                  <p className="text-center text-sm text-gray-500 dark:text-gray-400 py-4">
                                    No quests completed in this class yet
                                  </p>
                                ) : (
                                  <div className="ml-8">
                                    <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
                                      Quest Scores
                                    </h4>
                                    <table className="w-full text-sm">
                                      <thead>
                                        <tr className="border-b border-gray-200 dark:border-gray-700">
                                          <th className="text-left py-2 px-3 font-medium text-gray-600 dark:text-gray-400">Quest</th>
                                          <th className="text-center py-2 px-3 font-medium text-gray-600 dark:text-gray-400">Score</th>
                                          <th className="text-center py-2 px-3 font-medium text-gray-600 dark:text-gray-400">Attempts</th>
                                          <th className="text-center py-2 px-3 font-medium text-gray-600 dark:text-gray-400">Time</th>
                                          <th className="text-center py-2 px-3 font-medium text-gray-600 dark:text-gray-400">Challenges</th>
                                          <th className="text-center py-2 px-3 font-medium text-gray-600 dark:text-gray-400">Completed</th>
                                        </tr>
                                      </thead>
                                      <tbody>
                                        {questCompletions.map((quest, idx) => (
                                          <tr key={quest.questId} className="border-b border-gray-100 dark:border-gray-700/50">
                                            <td className="py-2 px-3 text-gray-900 dark:text-white">
                                              {quest.questTitle && quest.questTitle !== 'Quest'
                                                ? quest.questTitle
                                                : `Quest ${idx + 1}`}
                                            </td>
                                            <td className="py-2 px-3 text-center">
                                              <span className={`${getScoreBadgeColor(quest.score)} text-white px-2 py-0.5 rounded-full text-xs font-bold`}>
                                                {quest.score}
                                              </span>
                                            </td>
                                            <td className="py-2 px-3 text-center text-gray-700 dark:text-gray-300">
                                              {quest.attempts}
                                            </td>
                                            <td className="py-2 px-3 text-center text-gray-700 dark:text-gray-300">
                                              {quest.timeSpentMinutes} min
                                            </td>
                                            <td className="py-2 px-3 text-center text-gray-700 dark:text-gray-300">
                                              {quest.completedChallenges}/{quest.totalChallenges}
                                            </td>
                                            <td className="py-2 px-3 text-center text-gray-700 dark:text-gray-300">
                                              {quest.completedAt ? new Date(quest.completedAt).toLocaleDateString() : "--"}
                                            </td>
                                          </tr>
                                        ))}
                                      </tbody>
                                    </table>
                                  </div>
                                )}
                              </td>
                            </tr>
                          )}
                        </>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </Card>
        </main>
      </div>
    </ProtectedRoute>
  );
}

function StatCard({
  icon: Icon,
  label,
  value,
  subtext,
  iconColor,
  bgColor
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
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">{label}</p>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">{value}</p>
          {subtext && (
            <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">{subtext}</p>
          )}
        </div>
      </div>
    </Card>
  );
}
