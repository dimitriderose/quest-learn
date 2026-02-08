"use client";

import { useRef, useState } from "react";

interface QuestPlayerProps {
  questId: string;
  filename: string;
}

export function QuestPlayer({ questId, filename }: QuestPlayerProps) {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  return (
    <div className="w-full h-full relative">
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-900">
          <div className="text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-student-purple mx-auto mb-4" />
            <p className="text-white font-fredoka text-xl">Loading Quest...</p>
          </div>
        </div>
      )}

      {error && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-900">
          <div className="text-center max-w-md mx-4">
            <div className="text-6xl mb-4">😞</div>
            <h2 className="text-white font-fredoka text-2xl mb-2">Oops!</h2>
            <p className="text-white/80 mb-4">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="px-6 py-3 bg-student-purple text-white rounded-lg font-semibold"
            >
              Try Again
            </button>
          </div>
        </div>
      )}

      <iframe
        ref={iframeRef}
        src={`/quests/${filename}`}
        className="w-full h-full border-0"
        onLoad={() => setIsLoading(false)}
        onError={() => {
          setIsLoading(false);
          setError("Failed to load quest. Please try again.");
        }}
        title={`Quest ${questId}`}
        sandbox="allow-scripts allow-same-origin allow-forms"
      />
    </div>
  );
}
