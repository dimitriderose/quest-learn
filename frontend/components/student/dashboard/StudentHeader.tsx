"use client";

interface Student {
  name: string;
  level: number;
  avatar: string;
}

interface StudentHeaderProps {
  student: Student;
}

export function StudentHeader({ student }: StudentHeaderProps) {
  return (
    <header className="bg-white/10 backdrop-blur-md border-b border-white/20">
      <div className="max-w-6xl mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-full bg-gradient-to-br from-yellow-300 to-orange-400 flex items-center justify-center text-3xl shadow-lg">
              {student.avatar}
            </div>
            <div>
              <h1 className="font-fredoka text-2xl font-bold text-white">
                Hi, {student.name}! 👋
              </h1>
              <p className="font-nunito text-white/80">
                Level {student.level} Scientist
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="hidden md:flex items-center gap-2 bg-white/20 rounded-full px-4 py-2">
              <span className="text-2xl">🔥</span>
              <div className="text-white">
                <div className="font-fredoka text-sm">Streak</div>
                <div className="font-bold">7 days</div>
              </div>
            </div>
            
            <button className="bg-white/20 hover:bg-white/30 rounded-full p-3 transition-colors">
              <span className="text-2xl">⚙️</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
