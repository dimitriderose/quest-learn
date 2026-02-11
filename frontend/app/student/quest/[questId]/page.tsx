"use client";

import { useParams, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { useAuth } from "@/lib/contexts/AuthContext";
import { QuestPlayer } from "@/components/student/quest/QuestPlayer";
import { questApi, QuestMetadata } from "@/lib/api/quests";

export default function QuestPage() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user } = useAuth();
  const [quest, setQuest] = useState<QuestMetadata | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const questId = params.questId as string;
  const classId = searchParams.get('classId') || '';
  const studentId = user?.uid || '';

  useEffect(() => {
    if (!user) {
      router.push('/auth/login');
      return;
    }

    const loadQuest = async () => {
      try {
        const questData = await questApi.getMetadata(questId);
        setQuest(questData);
      } catch (error) {
        console.error('Failed to load quest:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadQuest();
  }, [questId, user, router]);

  const handleQuestComplete = () => {
    router.push('/student/dashboard');
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-xl">Loading quest...</div>
      </div>
    );
  }

  if (!quest) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-xl text-red-600">Quest not found</div>
      </div>
    );
  }

  return (
    <div className="h-screen w-full">
      <QuestPlayer
        questId={questId}
        studentId={studentId}
        curriculumId={questId}
        classId={classId}
        questTitle={quest.title}
        onComplete={handleQuestComplete}
      />
    </div>
  );
}
