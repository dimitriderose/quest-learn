"use client";

import { useState, useEffect } from "react";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { DashboardHeader } from "@/components/teacher/dashboard/DashboardHeader";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { classApi, ClassDto } from "@/lib/api/classes";
import { questApi } from "@/lib/api/quests";
import { 
  BarChart3, 
  TrendingUp, 
  Users, 
  Award, 
  CheckCircle2, 
  Clock,
  Download,
  Filter
} from "lucide-react";
import Link from "next/link";

interface ClassProgress {
  classId: string;
  className: string;
  totalStudents: number;
  activeStudents: number;
  averageCompletion: number;
  totalXP: number;
}

export default function TeacherReportsPage() {
  const [classes, setClasses] = useState<ClassDto[]>([]);
  const [selectedClass, setSelectedClass] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState<string>("week");

  useEffect(() => {
    loadClasses();
  }, []);

  const loadClasses = async () => {
    try {
      const data = await classApi.getAll();
      setClasses(data);
      if (data.length > 0) {
        setSelectedClass(data[0].classId);
      }
    } catch (error) {
      console.error('Failed to load classes:', error);
    } finally {
      setLoading(false);
    }
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

  const selectedClassData = classes.find(c => c.classId === selectedClass);

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
                <option key={cls.classId} value={cls.classId}>
                  {cls.className}
                </option>
              ))}
            </select>

            <select
              value={timeRange}
              onChange={(e) => setTimeRange(e.target.value)}
              className="px-4 py-2 border-2 border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
            >
              <option value="today">Today</option>
              <option value="week">This Week</option>
              <option value="month">This Month</option>
              <option value="quarter">This Quarter</option>
              <option value="year">This Year</option>
            </select>
          </div>

          {/* Stats Overview */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <StatCard
              icon={Users}
              label="Total Students"
              value={selectedClassData?.studentCount || 0}
              iconColor="text-blue-600"
              bgColor="bg-blue-50 dark:bg-blue-900/20"
            />
            <StatCard
              icon={Clock}
              label="Active This Week"
              value="--"
              subtext="No data yet"
              iconColor="text-green-600"
              bgColor="bg-green-50 dark:bg-green-900/20"
            />
            <StatCard
              icon={CheckCircle2}
              label="Avg Completion"
              value="--%"
              subtext="No data yet"
              iconColor="text-purple-600"
              bgColor="bg-purple-50 dark:bg-purple-900/20"
            />
            <StatCard
              icon={Award}
              label="Total XP Earned"
              value="--"
              subtext="No data yet"
              iconColor="text-yellow-600"
              bgColor="bg-yellow-50 dark:bg-yellow-900/20"
            />
          </div>

          {/* Progress by Quest */}
          <Card className="p-6 mb-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="font-merriweather text-xl font-bold text-gray-900 dark:text-white">
                Quest Progress
              </h2>
              <Link href="/teacher/curricula">
                <Button variant="secondary" size="sm">
                  Assign New Quest
                </Button>
              </Link>
            </div>

            {/* Empty State */}
            <div className="text-center py-12">
              <BarChart3 className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
                No Quest Data Yet
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                Assign quests to {selectedClassData?.className} to see student progress
              </p>
            </div>
          </Card>

          {/* Student Performance */}
          <Card className="p-6">
            <h2 className="font-merriweather text-xl font-bold text-gray-900 dark:text-white mb-6">
              Student Performance
            </h2>

            {selectedClassData && selectedClassData.studentCount > 0 ? (
              <div className="text-center py-12">
                <TrendingUp className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
                  Students Enrolled
                </h3>
                <p className="text-gray-600 dark:text-gray-400">
                  {selectedClassData.studentCount} students are ready to start learning!
                  <br />
                  Assign quests to begin tracking their progress.
                </p>
              </div>
            ) : (
              <div className="text-center py-12">
                <Users className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
                  No Students Enrolled
                </h3>
                <p className="text-gray-600 dark:text-gray-400 mb-4">
                  Share class code <strong>{selectedClassData?.classCode}</strong> with students
                </p>
                <Link href={`/teacher/classes/${selectedClass}`}>
                  <Button variant="primary">View Class Details</Button>
                </Link>
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
