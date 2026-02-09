"use client";

import { StudentProgress, QuestCompletion } from "@/lib/api/progress";

interface QuestHistoryProps {
  progressData: StudentProgress[];
}

export function QuestHistory({ progressData }: QuestHistoryProps) {
  // Flatten all quest completions from all curricula
  const allCompletions: (QuestCompletion & { curriculumTitle: string })[] = [];
  
  progressData.forEach(progress => {
    progress.questCompletions.forEach(completion => {
      allCompletions.push({
        ...completion,
        curriculumTitle: progress.curriculumTitle
      });
    });
  });

  // Sort by completion date (most recent first)
  allCompletions.sort((a, b) => 
    new Date(b.completedAt).getTime() - new Date(a.completedAt).getTime()
  );

  if (allCompletions.length === 0) {
    return (
      <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 text-center">
        <div className="text-6xl mb-4">📚</div>
        <p className="font-nunito text-xl text-white">
          No completed quests yet!
        </p>
        <p className="font-nunito text-white/80 mt-2">
          Start your first quest to see your progress here.
        </p>
      </div>
    );
  }

  return (
    <div className="grid gap-4 md:grid-cols-2">
      {allCompletions.map((quest, index) => (
        <div 
          key={`${quest.questId}-${index}`}
          className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 hover:bg-white/20 transition-all shadow-lg"
        >
          {/* Header */}
          <div className="flex items-start justify-between mb-4">
            <div className="flex-1">
              <h3 className="font-fredoka text-2xl font-bold text-white mb-1">
                Quest {quest.questNumber}: {quest.questTitle}
              </h3>
              <p className="font-nunito text-white/80 text-sm">
                {quest.curriculumTitle}
              </p>
            </div>
            <div className="ml-4">
              <ScoreBadge score={quest.score} />
            </div>
          </div>

          {/* XP Earned */}
          <div className="flex items-center gap-2 mb-4">
            <span className="text-3xl">⭐</span>
            <span className="font-fredoka text-2xl text-yellow-300 font-bold">
              +{quest.score * 2} XP
            </span>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 gap-3 text-sm">
            <StatItem 
              icon="🎯" 
              label="Attempts" 
              value={quest.attempts.toString()} 
            />
            <StatItem 
              icon="💡" 
              label="Hints" 
              value={quest.hintsUsed.toString()} 
            />
            <StatItem 
              icon="⏱️" 
              label="Time" 
              value={`${quest.timeSpentMinutes} min`} 
            />
            <StatItem 
              icon="📖" 
              label="Tutorials" 
              value={(quest.tutorialsViewed?.length || 0).toString()} 
            />
          </div>

          {/* Completed Date */}
          <div className="mt-4 pt-4 border-t border-white/20">
            <p className="font-nunito text-white/60 text-xs">
              Completed {formatDate(quest.completedAt)}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}

function ScoreBadge({ score }: { score: number }) {
  const getBadgeColor = (score: number) => {
    if (score >= 90) return "bg-green-500";
    if (score >= 75) return "bg-blue-500";
    if (score >= 60) return "bg-yellow-500";
    return "bg-orange-500";
  };

  return (
    <div className={`${getBadgeColor(score)} rounded-full w-16 h-16 flex items-center justify-center shadow-lg`}>
      <span className="font-fredoka text-2xl font-bold text-white">
        {score}%
      </span>
    </div>
  );
}

function StatItem({ icon, label, value }: { icon: string; label: string; value: string | number }) {
  return (
    <div className="flex items-center gap-2 bg-white/5 rounded-lg p-2">
      <span className="text-xl">{icon}</span>
      <div>
        <div className="font-nunito text-white/60 text-xs">{label}</div>
        <div className="font-nunito text-white font-semibold">{value}</div>
      </div>
    </div>
  );
}

function formatDate(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return "today";
  if (diffDays === 1) return "yesterday";
  if (diffDays < 7) return `${diffDays} days ago`;
  if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
  
  return date.toLocaleDateString('en-US', { 
    month: 'short', 
    day: 'numeric', 
    year: 'numeric' 
  });
}
