export default function Home() {
  return (
    <main className="min-h-screen flex items-center justify-center bg-gradient-to-br from-orange-50 to-blue-50">
      <div className="text-center space-y-6 p-8">
        <h1 className="text-6xl font-bold text-gray-900">
          QuestLearn
        </h1>
        <p className="text-2xl text-gray-600">
          AI-Powered Gamified Learning Platform
        </p>
        <p className="text-lg text-gray-500 max-w-2xl mx-auto">
          Transform traditional K-12 curriculum into quest-based learning adventures.
          <br />
          <span className="font-semibold text-orange-600">Next.js 14 Frontend - Coming Soon!</span>
        </p>
        <div className="flex gap-4 justify-center mt-8">
          <div className="px-6 py-3 bg-orange-100 rounded-lg">
            <div className="text-sm text-gray-600">Backend</div>
            <div className="text-lg font-bold text-green-600">✓ Ready</div>
          </div>
          <div className="px-6 py-3 bg-blue-100 rounded-lg">
            <div className="text-sm text-gray-600">Frontend</div>
            <div className="text-lg font-bold text-orange-600">In Progress</div>
          </div>
        </div>
      </div>
    </main>
  );
}
