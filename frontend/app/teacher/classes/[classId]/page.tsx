"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { DashboardHeader } from "@/components/teacher/dashboard/DashboardHeader";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { ArrowLeft, Copy, UserPlus, Mail, Calendar, Activity } from "lucide-react";
import { classApi, ClassDetailsDto } from "@/lib/api/classes";
import Link from "next/link";

export default function ClassDetailsPage() {
  const params = useParams();
  const classId = params.classId as string;

  const [classDetails, setClassDetails] = useState<ClassDetailsDto | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadClassDetails();
  }, [classId]);

  const loadClassDetails = async () => {
    try {
      const data = await classApi.getDetails(classId);
      setClassDetails(data);
    } catch (err: any) {
      console.error('Failed to load class details:', err);
      setError(err.response?.data?.message || 'Failed to load class details');
    } finally {
      setLoading(false);
    }
  };

  const copyClassCode = (code: string) => {
    navigator.clipboard.writeText(code);
    alert(`Class code ${code} copied to clipboard!`);
  };

  if (loading) {
    return (
      <ProtectedRoute requiredRole="TEACHER">
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
          <DashboardHeader />
          <div className="flex items-center justify-center h-96">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-gray-600 dark:text-gray-400">Loading class details...</p>
            </div>
          </div>
        </div>
      </ProtectedRoute>
    );
  }

  if (error || !classDetails) {
    return (
      <ProtectedRoute requiredRole="TEACHER">
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
          <DashboardHeader />
          <div className="max-w-7xl mx-auto px-8 py-8">
            <Card className="p-12 text-center">
              <div className="text-6xl mb-4">😞</div>
              <h2 className="font-merriweather text-2xl font-bold text-gray-900 dark:text-white mb-2">
                {error || 'Class not found'}
              </h2>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                The class you're looking for doesn't exist or you don't have access to it.
              </p>
              <Link href="/teacher/classes">
                <Button variant="primary">
                  <ArrowLeft className="w-5 h-5 mr-2" />
                  Back to My Classes
                </Button>
              </Link>
            </Card>
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
          <div className="mb-8">
            <Link
              href="/teacher/classes"
              className="inline-flex items-center text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white mb-4"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to My Classes
            </Link>

            <div className="flex items-start justify-between">
              <div>
                <h1 className="font-merriweather text-3xl font-bold text-gray-900 dark:text-white">
                  {classDetails.name}
                </h1>
                <p className="text-gray-600 dark:text-gray-400 mt-1">
                  {classDetails.gradeLevel === 0 ? 'Kindergarten' : `Grade ${classDetails.gradeLevel}`}
                </p>
              </div>
            </div>
          </div>

          <Card className="p-6 mb-8">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-white mb-1">
                  Class Code
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Share this code with students to join
                </p>
              </div>
              <div className="flex items-center gap-4">
                <div className="text-4xl font-bold text-blue-600 dark:text-blue-400 tracking-wider">
                  {classDetails.classCode}
                </div>
                <Button
                  variant="secondary"
                  onClick={() => copyClassCode(classDetails.classCode)}
                >
                  <Copy className="w-5 h-5 mr-2" />
                  Copy
                </Button>
              </div>
            </div>
          </Card>

          <div className="mb-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="font-merriweather text-2xl font-bold text-gray-900 dark:text-white">
                Students ({classDetails.students?.length || 0})
              </h2>
              <Button variant="primary">
                <UserPlus className="w-5 h-5 mr-2" />
                Add Students
              </Button>
            </div>

            {!classDetails.students || classDetails.students.length === 0 ? (
              <Card className="p-12 text-center">
                <div className="text-6xl mb-4">👥</div>
                <h3 className="font-merriweather text-xl font-bold text-gray-900 dark:text-white mb-2">
                  No Students Yet
                </h3>
                <p className="text-gray-600 dark:text-gray-400 mb-6">
                  Share the class code <strong>{classDetails.classCode}</strong> with your students
                </p>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {classDetails.students.map((student) => (
                  <Card key={student.uid} className="p-4">
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 rounded-full bg-purple-600 text-white flex items-center justify-center font-semibold text-lg">
                        {student.displayName.charAt(0)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-gray-900 dark:text-white truncate">
                          {student.displayName}
                        </h3>
                        <div className="flex items-center gap-1 text-sm text-gray-600 dark:text-gray-400 mt-1">
                          <Mail className="w-3 h-3" />
                          <span className="truncate">{student.email}</span>
                        </div>
                        <div className="flex items-center gap-4 mt-2 text-xs text-gray-500 dark:text-gray-500">
                          <div className="flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            <span>Joined {new Date(student.enrolledAt).toLocaleDateString()}</span>
                          </div>
                          {student.lastActive && (
                            <div className="flex items-center gap-1">
                              <Activity className="w-3 h-3" />
                              <span>Active {new Date(student.lastActive).toLocaleDateString()}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </main>
      </div>
    </ProtectedRoute>
  );
}
