"use client";

import { useState, useEffect } from "react";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { DashboardHeader } from "@/components/teacher/dashboard/DashboardHeader";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Plus, Copy, RefreshCw, Users, Calendar } from "lucide-react";
import { classApi, ClassDto } from "@/lib/api/classes";
import Link from "next/link";

export default function TeacherClassesPage() {
  const [classes, setClasses] = useState<ClassDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);

  useEffect(() => {
    loadClasses();
  }, []);

  const loadClasses = async () => {
    try {
      const data = await classApi.getAll();
      setClasses(data);
    } catch (error) {
      console.error('Failed to load classes:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateClass = async (className: string, gradeLevel: number) => {
    try {
      await classApi.create({ className, gradeLevel });
      await loadClasses();
      setShowCreateForm(false);
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to create class');
    }
  };

  const copyClassCode = (code: string) => {
    navigator.clipboard.writeText(code);
    // TODO: Show toast notification
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
              <p className="text-gray-600 dark:text-gray-400">Loading classes...</p>
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
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="font-merriweather text-3xl font-bold text-gray-900 dark:text-white">
                My Classes
              </h1>
              <p className="text-gray-600 dark:text-gray-400 mt-1">
                Manage your classes and student rosters
              </p>
            </div>
            <Button variant="primary" onClick={() => setShowCreateForm(true)}>
              <Plus className="w-5 h-5 mr-2" />
              Create Class
            </Button>
          </div>

          {showCreateForm && (
            <CreateClassForm
              onSubmit={handleCreateClass}
              onCancel={() => setShowCreateForm(false)}
            />
          )}

          {classes.length === 0 && !showCreateForm ? (
            <EmptyState onCreateClick={() => setShowCreateForm(true)} />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {classes.map((cls) => (
                <ClassCard
                  key={cls.classId}
                  classData={cls}
                  onCopyCode={copyClassCode}
                />
              ))}
            </div>
          )}
        </main>
      </div>
    </ProtectedRoute>
  );
}

function CreateClassForm({ onSubmit, onCancel }: {
  onSubmit: (className: string, gradeLevel: number) => Promise<void>;
  onCancel: () => void;
}) {
  const [className, setClassName] = useState("");
  const [gradeLevel, setGradeLevel] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      await onSubmit(className, parseInt(gradeLevel));
    } catch (err: any) {
      setError(err.message);
      setLoading(false);
    }
  };

  return (
    <Card className="p-6 mb-8">
      <h2 className="font-merriweather text-xl font-bold text-gray-900 dark:text-white mb-4">
        Create New Class
      </h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
            Class Name
          </label>
          <input
            type="text"
            value={className}
            onChange={(e) => setClassName(e.target.value)}
            placeholder="e.g., Period 3 Science"
            className="w-full px-4 py-2 border-2 border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
            Grade Level
          </label>
          <select
            value={gradeLevel}
            onChange={(e) => setGradeLevel(e.target.value)}
            className="w-full px-4 py-2 border-2 border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
            required
          >
            <option value="">Select grade level</option>
            <option value="0">Kindergarten</option>
            {[...Array(12)].map((_, i) => (
              <option key={i + 1} value={i + 1}>
                Grade {i + 1}
              </option>
            ))}
          </select>
        </div>

        {error && (
          <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
            <p className="text-sm text-red-800 dark:text-red-200">{error}</p>
          </div>
        )}

        <div className="flex gap-3">
          <Button
            type="button"
            variant="secondary"
            onClick={onCancel}
            disabled={loading}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            variant="primary"
            disabled={loading}
          >
            {loading ? "Creating..." : "Create Class"}
          </Button>
        </div>
      </form>
    </Card>
  );
}

function ClassCard({ classData, onCopyCode }: {
  classData: ClassDto;
  onCopyCode: (code: string) => void;
}) {
  return (
    <Card className="p-6 hover:shadow-lg transition-shadow">
      <div className="flex items-start justify-between mb-4">
        <div>
          <h3 className="font-merriweather text-xl font-bold text-gray-900 dark:text-white">
            {classData.className}
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            {classData.gradeLevel === 0 ? 'Kindergarten' : `Grade ${classData.gradeLevel}`}
          </p>
        </div>
        <Link href={`/teacher/classes/${classData.classId}`}>
          <button className="p-2 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors">
            <Users className="w-5 h-5" />
          </button>
        </Link>
      </div>

      <div className="mb-4 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
        <div className="text-xs font-semibold text-blue-900 dark:text-blue-100 mb-1">
          CLASS CODE
        </div>
        <div className="flex items-center justify-between">
          <div className="text-3xl font-bold text-blue-600 dark:text-blue-400 tracking-wider">
            {classData.classCode}
          </div>
          <button
            onClick={() => onCopyCode(classData.classCode)}
            className="p-2 text-blue-600 hover:bg-blue-100 dark:hover:bg-blue-800 rounded-lg transition-colors"
            title="Copy class code"
          >
            <Copy className="w-5 h-5" />
          </button>
        </div>
      </div>

      <div className="flex items-center justify-between text-sm">
        <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
          <Users className="w-4 h-4" />
          <span>{classData.studentCount} students</span>
        </div>
        <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
          <Calendar className="w-4 h-4" />
          <span>{new Date(classData.createdAt).toLocaleDateString()}</span>
        </div>
      </div>
    </Card>
  );
}

function EmptyState({ onCreateClick }: { onCreateClick: () => void }) {
  return (
    <Card className="p-12 text-center">
      <div className="text-6xl mb-4">📚</div>
      <h3 className="font-merriweather text-xl font-bold text-gray-900 dark:text-white mb-2">
        No Classes Yet
      </h3>
      <p className="text-gray-600 dark:text-gray-400 mb-6">
        Create your first class to get started with QuestLearn
      </p>
      <Button variant="primary" onClick={onCreateClick}>
        <Plus className="w-5 h-5 mr-2" />
        Create Your First Class
      </Button>
    </Card>
  );
}
