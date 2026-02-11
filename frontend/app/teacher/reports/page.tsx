"use client";

import { useState, useEffect } from "react";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { DashboardHeader } from "@/components/teacher/dashboard/DashboardHeader";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { classApi, ClassDto } from "@/lib/api/classes";
import { progressApi, StudentProgress } from "@/lib/api/progress";
import { 
  BarChart3, 
  TrendingUp, 
  Users, 
  Award, 
  CheckCircle2, 
  Clock,
  Download,
  Filter,
  Trophy
} from "lucide-react";
import Link from "next/link";

interface StudentWithProgress {
  studentId: string;
  studentName: string;
  studentEmail: string;
  progress: StudentProgress[];
  averageScore: number;
  completedQuests: number;
  totalXP: number;
}

/**
 * Calculate overall average across all curricula/subjects.
 * Each subject weighted equally regardless of quest count.
 */
function calculateAverageScore(allProgress: StudentProgress[]): number {
  if (allProgress.length === 0) return 0;
  
  const curriculumAverages: number[] = [];
  
  allProgress.forEach(progress => {
    if (progress.questCompletions.length === 0) return;
    
    const bestScores = new Map<string, number>();
    progress.questCompletions.forEach(completion => {
      const currentBest = bestScores.get(completion.questId) || 0;
      if (completion.score > currentBest) {
        bestScores.set(completion.questId, completion.score);
      }
    });
    
    const scores = Array.from(bestScores.values());
    const curriculumAvg = scores.reduce((sum, score) => sum + score, 0) / scores.length;
    curriculumAverages.push(curriculumAvg);
  });
  
  if (curriculumAverages.length === 0) return 0;
  
  const overallAvg = curriculumAverages.reduce((sum, avg) => sum + avg, 0) / curriculumAverages.length;
  return Math.round(overallAvg);
}

function getScoreBadgeColor(score: number): string {
  if (score >= 90) return "bg-green-500";
  if (score >= 75) return "bg-blue-500";
  if (score >= 60) return "bg-yellow-500";
  return "bg-orange-500";
}

export default function TeacherReportsPage() {
  const [classes, setClasses] = useState<ClassDto[]>([]);
  const [selectedClass, setSelectedClass] = useState<string>("");
  const [studentsWithProgress, setStudentsWithProgress] = useState<StudentWithProgress[]>([]);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState<string>("week");

  useEffect(() => {
    loadClasses();
  }, []);

  useEffect(() => {
    if (selectedClass) {
      loadStudentProgress();
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

  const loadStudentProgress = async () => {
    try {
      const classDetails = await classApi.getDetails(selectedClass);
      
      if (!classDetails.students || classDetails.students.length === 0) {
        setStudentsWithProgress([]);
        return;
      }

      const studentsData = await Promise.all(
        classDetails.students.map(async (student) => {
          try {
            const progress = await progressApi.getAllProgress(student.uid);
            
            const averageScore = calculateAverageScore(progress);
            
            const completedQuests = progress.reduce((sum, p) => {
              const uniqueQuests = new Set(p.questCompletions.map(c => c.questId));
              return sum + uniqueQuests.size;
            }, 0);
            
            const totalXP = progress.reduce((sum, p) => sum + (p.totalXP || 0), 0);
            
            return {
              studentId: student.uid,
              studentName: student.displayName,
              studentEmail: student.email,
              progress,
              averageScore,
              completedQuests,
              totalXP
            };
          } catch (err) {
            console.error(`Failed to load progress for student ${student.uid}:`, err);
            return {
              studentId: student.uid,
              studentName: student.displayName,
              studentEmail: student.email,
              progress: [],
              averageScore: 0,
              completedQuests: 0,
              totalXP: 0
            };
          }
        })
      );
      
      // Sort by average score descending
      studentsData.sort((a, b) => b.averageScore - a.averageScore);
      setStudentsWithProgress(studentsData);
      
    } catch (error) {
      console.error('Failed to load student progress:', error);
      setStudentsWithProgress([]);
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

  const selectedClassData = classes.find(c => c.id === selectedClass);
  
  // Calculate class-wide statistics (only students who completed at least one quest)
  const studentsWithQuests = studentsWithProgress.filter(s => s.completedQuests > 0);
  const classAverage = studentsWithQuests.length > 0
    ? Math.round(studentsWithQuests.reduce((sum, s) => sum + s.averageScore, 0) / studentsWithQuests.length)
    : 0;
  const totalCompletedQuests = studentsWithProgress.reduce((sum, s) => sum + s.completedQuests, 0);
  const totalXP = studentsWithProgress.reduce((sum, s) => sum + s.totalXP, 0);

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
              value={selectedClassData?.studentCount || 0}
              iconColor="text-blue-600"
              bgColor="bg-blue-50 dark:bg-blue-900/20"
            />
            <StatCard
              icon={Trophy}
              label="Class Average"
              value={classAverage > 0 ? `${classAverage}%` : "--"}
              subtext={studentsWithProgress.length > 0 ? "Across all subjects" : "No data yet"}
              iconColor="text-green-600"
              bgColor="bg-green-50 dark:bg-green-900/20"
            />
            <StatCard
              icon={CheckCircle2}
              label="Quests Completed"
              value={totalCompletedQuests || "--"}
              subtext={totalCompletedQuests > 0 ? "By all students" : "No data yet"}
              iconColor="text-purple-600"
              bgColor="bg-purple-50 dark:bg-purple-900/20"
            />
            <StatCard
              icon={Award}
              label="Total XP Earned"
              value={totalXP > 0 ? totalXP.toLocaleString() : "--"}
              subtext={totalXP > 0 ? "By all students" : "No data yet"}
              iconColor="text-yellow-600"
              bgColor="bg-yellow-50 dark:bg-yellow-900/20"
            />
          </div>

          {/* Student Performance Table */}
          <Card className="p-6">
            <h2 className="font-merriweather text-xl font-bold text-gray-900 dark:text-white mb-6">
              Student Performance
            </h2>

            {studentsWithProgress.length === 0 ? (
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
                    {studentsWithProgress.map((student, index) => (
                      <tr
                        key={student.studentId}
                        className="border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/50"
                      >
                        <td className="py-4 px-4">
                          <div className="flex items-center gap-2">
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
                          {student.averageScore > 0 ? (
                            <div className="inline-flex items-center gap-2">
                              <div
                                className={`${getScoreBadgeColor(student.averageScore)} text-white px-3 py-1 rounded-full font-bold`}
                              >
                                {student.averageScore}%
                              </div>
                            </div>
                          ) : (
                            <span className="text-gray-400 dark:text-gray-600">--</span>
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
                      </tr>
                    ))}
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
