"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import {
  StudentCurriculumDto,
  StudentCurriculumDayDto,
  StudentQuestDto,
  StudentTutorialDto,
} from "@/lib/api/studentQuests";

type Variant = "elementary" | "middle" | "high";

interface CurriculumSectionProps {
  curriculum: StudentCurriculumDto;
  variant: Variant;
}

const variantConfig = {
  elementary: {
    sectionLabel: "Your Adventure",
    dayLabel: (n: number) => `Day ${n}`,
    dayEmojis: ["🌟", "🚀", "🎯", "🌈", "⚡", "🔥", "💫", "🎨", "🌊", "🏆", "✨", "🎪", "🌸", "🎭"],
    questLabel: "Quest",
    startLabel: "Start Quest!",
    continueLabel: "Continue!",
    completedLabel: "Completed!",
    lockedLabel: "Keep going to unlock!",
    progressLabel: "Progress",
    fontClass: "font-fredoka",
    textClass: "font-nunito",
    bgGradient: "from-purple-500/20 via-blue-500/20 to-teal-500/20",
    headerBg: "bg-gradient-to-r from-purple-500 to-indigo-600",
    dayAvailableBg: "bg-gradient-to-r from-indigo-500/10 to-purple-500/10 border-indigo-400/30",
    dayCompletedBg: "bg-gradient-to-r from-green-500/10 to-emerald-500/10 border-green-400/30",
    dayLockedBg: "bg-gray-500/5 border-gray-400/20",
    progressBarColor: "bg-gradient-to-r from-purple-500 to-indigo-500",
    questCardBg: "bg-gradient-to-br from-indigo-500 to-purple-600",
    questCompletedBg: "bg-gradient-to-br from-green-400 to-emerald-600",
  },
  middle: {
    sectionLabel: "Learning Path",
    dayLabel: (n: number) => `Day ${n}`,
    dayEmojis: [],
    questLabel: "Challenge",
    startLabel: "Start Challenge",
    continueLabel: "Continue",
    completedLabel: "Completed",
    lockedLabel: "Complete previous day to unlock",
    progressLabel: "Progress",
    fontClass: "font-merriweather",
    textClass: "font-sans",
    bgGradient: "from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900",
    headerBg: "bg-gradient-to-r from-indigo-600 to-blue-700",
    dayAvailableBg: "bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-700",
    dayCompletedBg: "bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-700",
    dayLockedBg: "bg-gray-50 dark:bg-gray-800/50 border-gray-200 dark:border-gray-700",
    progressBarColor: "bg-gradient-to-r from-indigo-500 to-blue-600",
    questCardBg: "bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700",
    questCompletedBg: "bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-700",
  },
  high: {
    sectionLabel: "Course Module",
    dayLabel: (n: number) => `Module ${n}`,
    dayEmojis: [],
    questLabel: "Project",
    startLabel: "Begin",
    continueLabel: "Continue",
    completedLabel: "Submitted",
    lockedLabel: "Complete previous module to unlock",
    progressLabel: "Completion",
    fontClass: "font-merriweather",
    textClass: "font-sans",
    bgGradient: "from-white to-gray-50 dark:from-gray-900 dark:to-gray-800",
    headerBg: "bg-gradient-to-r from-gray-800 to-gray-900 dark:from-gray-700 dark:to-gray-800",
    dayAvailableBg: "bg-white dark:bg-gray-800 border-blue-200 dark:border-blue-800",
    dayCompletedBg: "bg-white dark:bg-gray-800 border-green-200 dark:border-green-800",
    dayLockedBg: "bg-gray-50 dark:bg-gray-900 border-gray-200 dark:border-gray-700",
    progressBarColor: "bg-blue-600",
    questCardBg: "bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700",
    questCompletedBg: "bg-white dark:bg-gray-800 border border-green-200 dark:border-green-700",
  },
};

function getIconForSubject(subject: string): string {
  const icons: Record<string, string> = {
    Science: "🔬",
    Math: "🔢",
    "English Language Arts": "📚",
    "Social Studies": "🌍",
    History: "📜",
    Geography: "🗺️",
    Art: "🎨",
    Music: "🎵",
    "Physical Education": "⚽",
  };
  return icons[subject] || "📖";
}

function DaySection({
  day,
  variant,
  config,
  defaultExpanded,
}: {
  day: StudentCurriculumDayDto;
  variant: Variant;
  config: (typeof variantConfig)[Variant];
  defaultExpanded: boolean;
}) {
  const [expanded, setExpanded] = useState(defaultExpanded);
  const router = useRouter();

  const isCompleted = day.status === "completed";
  const isAvailable = day.status === "available";
  const isLocked = day.status === "locked";

  const dayBg = isCompleted
    ? config.dayCompletedBg
    : isAvailable
    ? config.dayAvailableBg
    : config.dayLockedBg;

  const emoji =
    variant === "elementary" && config.dayEmojis.length > 0
      ? ` ${config.dayEmojis[(day.dayNumber - 1) % config.dayEmojis.length]}`
      : "";

  const statusIcon = isCompleted ? "✅" : isAvailable ? "📖" : "🔒";
  const isDiagnostic = day.isDiagnostic === true;
  const dayTitle = isDiagnostic
    ? `${config.dayLabel(day.dayNumber)}: Diagnostic Assessment`
    : day.title
    ? `${config.dayLabel(day.dayNumber)}: ${day.title}`
    : config.dayLabel(day.dayNumber);

  const handleStartQuest = (quest: StudentQuestDto) => {
    const url = quest.classId
      ? `/student/quest/${quest.questId}?classId=${quest.classId}`
      : `/student/quest/${quest.questId}`;
    router.push(url);
  };

  return (
    <div className={`rounded-xl border ${dayBg} overflow-hidden transition-all duration-200`}>
      <button
        onClick={() => !isLocked && setExpanded(!expanded)}
        className={`w-full flex items-center justify-between p-4 text-left ${
          isLocked ? "cursor-default opacity-60" : "cursor-pointer hover:bg-black/5 dark:hover:bg-white/5"
        }`}
        disabled={isLocked}
      >
        <div className="flex items-center gap-3">
          <span className="text-xl">{statusIcon}</span>
          <div>
            <h4
              className={`${config.fontClass} font-bold ${
                variant === "elementary"
                  ? "text-white text-lg"
                  : "text-gray-900 dark:text-white text-base"
              }`}
            >
              {dayTitle}
              {emoji}
            </h4>
            {!isLocked && day.quests.length > 0 && (
              <p
                className={`${config.textClass} text-sm ${
                  variant === "elementary"
                    ? "text-white/70"
                    : "text-gray-500 dark:text-gray-400"
                }`}
              >
                {day.quests.length} {day.quests.length === 1 ? config.questLabel.toLowerCase() : config.questLabel.toLowerCase() + "s"}
                {isCompleted && " - All complete!"}
              </p>
            )}
            {isLocked && (
              <p
                className={`${config.textClass} text-sm ${
                  variant === "elementary"
                    ? "text-white/50"
                    : "text-gray-400 dark:text-gray-500"
                }`}
              >
                {config.lockedLabel}
              </p>
            )}
          </div>
        </div>
        {!isLocked && (
          <span
            className={`text-lg transition-transform duration-200 ${
              expanded ? "rotate-180" : ""
            } ${
              variant === "elementary"
                ? "text-white/70"
                : "text-gray-400 dark:text-gray-500"
            }`}
          >
            ▼
          </span>
        )}
      </button>

      {expanded && !isLocked && (day.quests.length > 0 || (day.tutorials && day.tutorials.length > 0)) && (
        <div className="px-4 pb-4 space-y-3">
          {day.quests.map((quest) => (
            <QuestItem
              key={quest.questId}
              quest={quest}
              variant={variant}
              config={config}
              onStart={() => handleStartQuest(quest)}
            />
          ))}

          {/* Tutorial cards */}
          {day.tutorials && day.tutorials.length > 0 && (
            <div className="mt-2 space-y-2">
              <p className={`text-xs font-semibold uppercase tracking-wide ${
                variant === "elementary" ? "text-white/60" : "text-gray-500 dark:text-gray-400"
              }`}>
                Review Tutorials
              </p>
              {day.tutorials.map((tutorial) => (
                <TutorialItem
                  key={tutorial.tutorialQuestId}
                  tutorial={tutorial}
                  variant={variant}
                  onStart={() => {
                    router.push(`/student/quest/${tutorial.tutorialQuestId}`);
                  }}
                />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function QuestItem({
  quest,
  variant,
  config,
  onStart,
}: {
  quest: StudentQuestDto;
  variant: Variant;
  config: (typeof variantConfig)[Variant];
  onStart: () => void;
}) {
  const icon = getIconForSubject(quest.subject);

  if (variant === "elementary") {
    return (
      <div
        className={`${config.questCardBg} rounded-xl p-4 text-white cursor-pointer hover:scale-[1.02] transition-transform`}
        onClick={onStart}
      >
        <div className="flex items-start gap-3">
          <span className="text-3xl">{icon}</span>
          <div className="flex-1 min-w-0">
            <h5 className="font-fredoka font-bold text-lg truncate">{quest.title}</h5>
            <p className="font-nunito text-white/80 text-sm line-clamp-2">
              {quest.description}
            </p>
            <div className="flex items-center gap-3 mt-2">
              {quest.xpReward > 0 && (
                <span className="font-fredoka text-sm font-bold">
                  ⭐ +{quest.xpReward} XP
                </span>
              )}
              {quest.dueDate && (
                <span className="font-nunito text-xs text-white/60">
                  Due: {new Date(quest.dueDate).toLocaleDateString()}
                </span>
              )}
            </div>
          </div>
          <Button
            variant="hero"
            className="shrink-0 font-fredoka text-sm px-4 py-2"
            onClick={(e) => {
              e.stopPropagation();
              onStart();
            }}
          >
            ▶️ {config.startLabel}
          </Button>
        </div>
      </div>
    );
  }

  // Middle and High school styles
  return (
    <div
      className={`${config.questCardBg} rounded-lg p-4 cursor-pointer hover:shadow-md transition-shadow`}
      onClick={onStart}
    >
      <div className="flex items-center gap-4">
        <span className="text-2xl">{icon}</span>
        <div className="flex-1 min-w-0">
          <h5
            className={`font-semibold text-gray-900 dark:text-white truncate`}
          >
            {quest.title}
          </h5>
          <p className="text-sm text-gray-500 dark:text-gray-400 line-clamp-1">
            {quest.description}
          </p>
          <div className="flex items-center gap-3 mt-1">
            {quest.xpReward > 0 && (
              <span className="text-xs text-indigo-600 dark:text-indigo-400 font-medium">
                +{quest.xpReward} XP
              </span>
            )}
            {quest.durationMinutes > 0 && (
              <span className="text-xs text-gray-400 dark:text-gray-500">
                ~{quest.durationMinutes} min
              </span>
            )}
            {quest.dueDate && (
              <span className="text-xs text-gray-400 dark:text-gray-500">
                Due: {new Date(quest.dueDate).toLocaleDateString()}
              </span>
            )}
          </div>
        </div>
        <Button
          variant={variant === "high" ? "secondary" : "primary"}
          className="shrink-0 text-sm px-4 py-2"
          onClick={(e) => {
            e.stopPropagation();
            onStart();
          }}
        >
          {config.startLabel}
        </Button>
      </div>
    </div>
  );
}

function TutorialItem({
  tutorial,
  variant,
  onStart,
}: {
  tutorial: StudentTutorialDto;
  variant: Variant;
  onStart: () => void;
}) {
  if (tutorial.completed) {
    return (
      <div className={`rounded-lg p-3 border ${
        variant === "elementary"
          ? "bg-green-500/20 border-green-400/30"
          : "bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-700"
      }`}>
        <div className="flex items-center gap-3">
          <span className="text-lg">✅</span>
          <span className={`text-sm font-medium ${
            variant === "elementary" ? "text-white/80" : "text-green-700 dark:text-green-400"
          }`}>
            Tutorial completed
          </span>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`rounded-lg p-3 border cursor-pointer transition-all hover:scale-[1.01] ${
        variant === "elementary"
          ? "bg-amber-500/20 border-amber-400/30"
          : "bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-700"
      }`}
      onClick={onStart}
    >
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <span className="text-lg">📝</span>
          <div>
            <span className={`text-sm font-semibold ${
              variant === "elementary" ? "text-white" : "text-amber-800 dark:text-amber-300"
            }`}>
              Review Tutorial
            </span>
            <p className={`text-xs ${
              variant === "elementary" ? "text-white/60" : "text-amber-600 dark:text-amber-400"
            }`}>
              Complete this review before moving to the next day
            </p>
          </div>
        </div>
        <Button
          variant={variant === "elementary" ? "hero" : "secondary"}
          className="shrink-0 text-sm px-3 py-1.5"
          onClick={(e) => {
            e.stopPropagation();
            onStart();
          }}
        >
          Start Review
        </Button>
      </div>
    </div>
  );
}

function getTrackDisplayName(track: string, variant: Variant): string {
  if (variant === "elementary") {
    switch (track) {
      case "ADVANCED": return "Star Explorer";
      case "GRADE_LEVEL": return "Learning Path";
      case "FOUNDATIONAL": return "Growing Path";
      default: return track;
    }
  }
  if (variant === "middle") {
    switch (track) {
      case "ADVANCED": return "Advanced Track";
      case "GRADE_LEVEL": return "Grade Level Track";
      case "FOUNDATIONAL": return "Foundational Track";
      default: return track;
    }
  }
  // high
  switch (track) {
    case "ADVANCED": return "Advanced Path";
    case "GRADE_LEVEL": return "Grade Level Path";
    case "FOUNDATIONAL": return "Foundational Path";
    default: return track;
  }
}

export function CurriculumSection({ curriculum, variant }: CurriculumSectionProps) {
  const config = variantConfig[variant];
  const progressPercent = curriculum.progressPercentage;

  return (
    <div className="mb-8">
      {/* Curriculum Header */}
      <div className={`${config.headerBg} rounded-t-2xl px-6 py-4`}>
        <div className="flex items-center justify-between">
          <div>
            <h3 className={`${config.fontClass} text-xl font-bold text-white`}>
              {curriculum.title}
            </h3>
            <div className="flex items-center gap-3 mt-1">
              <span className="text-white/80 text-sm">
                {getIconForSubject(curriculum.subject)} {curriculum.subject}
              </span>
              {curriculum.gradeLevel && (
                <span className="text-white/80 text-sm">
                  Grade {curriculum.gradeLevel}
                </span>
              )}
              <span className="text-white/60 text-sm">
                {curriculum.totalDays} {variant === "high" ? "modules" : "days"}
              </span>
              {curriculum.isAdaptive && curriculum.studentTrack && (
                <span className={`px-2 py-0.5 rounded text-xs font-bold ${
                  curriculum.studentTrack === "ADVANCED"
                    ? "bg-purple-200/30 text-purple-100"
                    : curriculum.studentTrack === "FOUNDATIONAL"
                    ? "bg-orange-200/30 text-orange-100"
                    : "bg-blue-200/30 text-blue-100"
                }`}>
                  {getTrackDisplayName(curriculum.studentTrack, variant)}
                </span>
              )}
            </div>
          </div>
          <div className="text-right">
            <span className={`${config.fontClass} text-2xl font-bold text-white`}>
              {Math.round(progressPercent)}%
            </span>
            <p className="text-white/70 text-xs">{config.progressLabel}</p>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="mt-3 bg-white/20 rounded-full h-2.5 overflow-hidden">
          <div
            className={`h-full ${config.progressBarColor} rounded-full transition-all duration-500`}
            style={{ width: `${progressPercent}%` }}
          />
        </div>
        <div className="flex justify-between mt-1">
          <span className="text-white/60 text-xs">
            {variant === "high" ? "Module" : "Day"} {curriculum.currentDay} of{" "}
            {curriculum.totalDays}
          </span>
          <span className="text-white/60 text-xs">
            {Math.round(progressPercent)}% complete
          </span>
        </div>
      </div>

      {/* Adaptive state messages */}
      {curriculum.isAdaptive && !curriculum.diagnosticCompleted && (
        <div className={`px-6 py-3 text-center text-sm font-medium ${
          variant === "elementary"
            ? "bg-purple-500/20 text-purple-200"
            : "bg-purple-50 dark:bg-purple-900/20 text-purple-700 dark:text-purple-300"
        }`}>
          {variant === "elementary"
            ? "Complete the Diagnostic Assessment to start your adventure!"
            : variant === "middle"
            ? "Complete the diagnostic assessment to get placed on your learning path."
            : "Complete the diagnostic to receive your personalized learning track."}
        </div>
      )}
      {curriculum.isAdaptive && curriculum.diagnosticCompleted && !curriculum.studentTrack && (
        <div className={`px-6 py-3 text-center text-sm font-medium ${
          variant === "elementary"
            ? "bg-amber-500/20 text-amber-200"
            : "bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-300"
        }`}>
          {variant === "elementary"
            ? "Your teacher is setting up your adventure path..."
            : "Your teacher is reviewing results and assigning tracks..."}
        </div>
      )}

      {/* Day Timeline */}
      <div
        className={`bg-gradient-to-b ${config.bgGradient} rounded-b-2xl border border-t-0 ${
          variant === "elementary"
            ? "border-purple-500/20"
            : "border-gray-200 dark:border-gray-700"
        } p-4 space-y-3`}
      >
        {curriculum.days.map((day) => (
          <DaySection
            key={day.dayNumber}
            day={day}
            variant={variant}
            config={config}
            defaultExpanded={day.status === "available"}
          />
        ))}
      </div>
    </div>
  );
}
