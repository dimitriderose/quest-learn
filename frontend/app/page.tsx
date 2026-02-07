"use client";

import { ThemeToggle } from "@/components/ThemeToggle";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";

export default function Home() {
  return (
    <main className="min-h-screen bg-landing-cream dark:bg-landing-cream-dark transition-colors">
      <ThemeToggle />
      
      <div className="max-w-4xl mx-auto px-8 py-16 space-y-12">
        <div className="text-center space-y-6">
          <h1 className="font-merriweather text-6xl font-black text-gray-900 dark:text-white">
            Quest<span className="bg-gradient-to-r from-landing-orange to-landing-blue bg-clip-text text-transparent">Learn</span>
          </h1>
          <p className="font-source-sans text-2xl text-gray-600 dark:text-gray-300">
            AI-Powered Gamified Learning Platform
          </p>
          <p className="text-lg text-gray-500 dark:text-gray-400 max-w-2xl mx-auto">
            Transform traditional K-12 curriculum into quest-based learning adventures.
          </p>
        </div>

        <div className="space-y-6">
          <h2 className="font-merriweather text-3xl font-bold text-gray-900 dark:text-white">
            Design System Ready
          </h2>
          
          <div className="flex gap-4 flex-wrap">
            <Button variant="primary">Primary Button</Button>
            <Button variant="secondary">Secondary Button</Button>
            <Button variant="hero">Hero Button</Button>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Card>
              <div className="w-12 h-12 rounded-full bg-landing-orange mb-2" />
              <p className="text-sm font-semibold">Landing Orange</p>
            </Card>
            <Card>
              <div className="w-12 h-12 rounded-full bg-landing-blue mb-2" />
              <p className="text-sm font-semibold">Landing Blue</p>
            </Card>
            <Card>
              <div className="w-12 h-12 rounded-full bg-student-purple mb-2" />
              <p className="text-sm font-semibold">Student Purple</p>
            </Card>
            <Card>
              <div className="w-12 h-12 rounded-full bg-teacher-primary mb-2" />
              <p className="text-sm font-semibold">Teacher Primary</p>
            </Card>
          </div>

          <Card>
            <div className="space-y-4">
              <p className="font-merriweather text-2xl font-bold">Merriweather - Headlines</p>
              <p className="font-fredoka text-xl">Fredoka - Elementary Headers</p>
              <p className="font-nunito text-lg">Nunito - Elementary Body</p>
              <p className="font-inter">Inter - Default Body Text</p>
              <p className="font-jetbrains text-sm">JetBrains Mono - Code</p>
            </div>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card hover>
              <h3 className="font-bold text-lg mb-2">Backend</h3>
              <p className="text-green-600 font-semibold">✓ Running on localhost:8080</p>
            </Card>
            <Card hover>
              <h3 className="font-bold text-lg mb-2">Design System</h3>
              <p className="text-green-600 font-semibold">✓ Tailwind + Fonts Ready</p>
            </Card>
          </div>
        </div>
      </div>
    </main>
  );
}
