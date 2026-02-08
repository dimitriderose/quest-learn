"use client";

import { useState, useEffect } from "react";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { DashboardHeader } from "@/components/teacher/dashboard/DashboardHeader";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Search, Filter, BookOpen, Clock, Award, Users } from "lucide-react";
import { questApi, QuestDto } from "@/lib/api/quests";
import { classApi, ClassDto } from "@/lib/api/classes";

export default function TeacherCurriculaPage() {
  const [quests, setQuests] = useState<QuestDto[]>([]);
  const [classes, setClasses] = useState<ClassDto[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [questsData, classesData] = await Promise.all([
        questApi.getAll(),
        classApi.getAll(),
      ]);
      setQuests(questsData);
      setClasses(classesData);
    } catch (error) {
      console.error("Failed to load data:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <ProtectedRoute requiredRole="TEACHER">
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
          <DashboardHeader />
          <div className="flex items-center justify-center h-96">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-gray-600 dark:text-gray-400">Loading...</p>
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
          <h1 className="font-merriweather text-3xl font-bold text-gray-900 dark:text-white mb-8">
            Quest Library
          </h1>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {quests.map((quest) => (
              <Card key={quest.questId} className="p-6">
                <h3 className="font-bold text-lg mb-2">{quest.title}</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                  {quest.description}
                </p>
                <Button variant="primary" className="w-full">
                  Assign
                </Button>
              </Card>
            ))}
          </div>
        </main>
      </div>
    </ProtectedRoute>
  );
}
