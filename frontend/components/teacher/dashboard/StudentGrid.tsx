"use client";

import { StudentCard } from "./StudentCard";

interface Student {
  id: string;
  name: string;
  avatar: string;
  currentQuest: string;
  progress: number;
  status: "on-track" | "struggling" | "excelling";
  lastActive: string;
}

interface StudentGridProps {
  students: Student[];
  onStudentClick: (studentId: string) => void;
}

export function StudentGrid({ students, onStudentClick }: StudentGridProps) {
  return (
    <div>
      <h2 className="font-merriweather text-2xl font-bold text-gray-900 dark:text-white mb-6">
        Student Progress
      </h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {students.map((student) => (
          <StudentCard
            key={student.id}
            student={student}
            onClick={() => onStudentClick(student.id)}
          />
        ))}
      </div>
    </div>
  );
}
