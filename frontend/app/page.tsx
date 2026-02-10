"use client";

import { ThemeToggle } from "@/components/ThemeToggle";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import Link from "next/link";

export default function LandingPage() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-landing-orange via-landing-blue to-landing-green dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <ThemeToggle />
      
      {/* Hero Section */}
      <section className="max-w-6xl mx-auto px-8 py-24">
        <div className="text-center space-y-8">
          <h1 className="font-merriweather text-7xl font-black text-white leading-tight">
            Transform Learning Into
            <span className="block bg-gradient-to-r from-white to-landing-cream bg-clip-text text-transparent">
              Epic Quests
            </span>
          </h1>
          
          <p className="text-2xl text-white/90 max-w-3xl mx-auto leading-relaxed">
            AI-powered gamified curriculum that saves teachers <span className="font-bold text-landing-cream">10+ hours per week</span> while boosting student engagement by <span className="font-bold text-landing-cream">85%</span>
          </p>

          <div className="flex gap-4 justify-center flex-wrap">
            <Link href="/login">
              <Button variant="hero" className="text-xl px-12 py-6">
                Start Free Trial
              </Button>
            </Link>
            <a href="https://youtu.be/SunbRWpNIJQ" target="_blank" rel="noopener noreferrer">
              <Button variant="secondary" className="text-xl px-12 py-6">
                Watch Demo
              </Button>
            </a>
          </div>

          <p className="text-white/70 text-sm">
            ✓ Free for 30 days  ✓ No credit card required  ✓ 100% standards-aligned
          </p>
        </div>
      </section>

      {/* Problem/Solution Section */}
      <section className="max-w-6xl mx-auto px-8 py-16">
        <div className="grid md:grid-cols-2 gap-12">
          <Card className="p-10 bg-white/95 dark:bg-gray-800/95">
            <h2 className="font-merriweather text-3xl font-bold text-red-600 dark:text-red-400 mb-6">
              The Teacher Crisis
            </h2>
            <ul className="space-y-4 text-gray-700 dark:text-gray-300">
              <li className="flex items-start gap-3">
                <span className="text-red-500 text-2xl">✗</span>
                <span>8-12 hours/week on lesson planning, grading, differentiation</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-red-500 text-2xl">✗</span>
                <span>30+ students at different learning levels in one classroom</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-red-500 text-2xl">✗</span>
                <span>Students disengaged with traditional worksheets</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-red-500 text-2xl">✗</span>
                <span>50% teacher burnout rate nationwide</span>
              </li>
            </ul>
          </Card>

          <Card className="p-10 bg-gradient-to-br from-green-50 to-blue-50 dark:from-green-900/20 dark:to-blue-900/20">
            <h2 className="font-merriweather text-3xl font-bold text-green-700 dark:text-green-400 mb-6">
              The QuestLearn Solution
            </h2>
            <ul className="space-y-4 text-gray-800 dark:text-gray-200">
              <li className="flex items-start gap-3">
                <span className="text-green-500 text-2xl">✓</span>
                <span>Generate complete curriculum in 8 minutes with AI</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-green-500 text-2xl">✓</span>
                <span>Automatic differentiation for all 3 learning tracks</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-green-500 text-2xl">✓</span>
                <span>85%+ student engagement through gamification</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-green-500 text-2xl">✓</span>
                <span>Save 10+ hours per week on planning & grading</span>
              </li>
            </ul>
          </Card>
        </div>
      </section>

      {/* How It Works */}
      <section className="max-w-6xl mx-auto px-8 py-16">
        <h2 className="font-merriweather text-5xl font-bold text-white text-center mb-16">
          How It Works
        </h2>

        <div className="grid md:grid-cols-3 gap-8">
          <Card hover className="p-8 text-center">
            <div className="text-6xl mb-4">📝</div>
            <h3 className="font-fredoka text-2xl font-bold mb-4 text-gray-900 dark:text-white">
              1. Teacher Creates
            </h3>
            <p className="text-gray-600 dark:text-gray-300">
              Enter a topic, grade level, and duration. AI generates complete quest-based curriculum in 8 minutes.
            </p>
          </Card>

          <Card hover className="p-8 text-center">
            <div className="text-6xl mb-4">🎮</div>
            <h3 className="font-fredoka text-2xl font-bold mb-4 text-gray-900 dark:text-white">
              2. Students Play
            </h3>
            <p className="text-gray-600 dark:text-gray-300">
              Students complete interactive quests with adaptive AI hints. XP, achievements, and storylines keep them engaged.
            </p>
          </Card>

          <Card hover className="p-8 text-center">
            <div className="text-6xl mb-4">📊</div>
            <h3 className="font-fredoka text-2xl font-bold mb-4 text-gray-900 dark:text-white">
              3. AI Analyzes
            </h3>
            <p className="text-gray-600 dark:text-gray-300">
              Real-time progress tracking, automated grading, and AI insights show exactly where each student needs help.
            </p>
          </Card>
        </div>
      </section>

      {/* Features Grid */}
      <section className="max-w-6xl mx-auto px-8 py-16">
        <h2 className="font-merriweather text-5xl font-bold text-white text-center mb-16">
          Features Teachers Love
        </h2>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[
            { icon: "🤖", title: "AI Curriculum Generation", desc: "Complete 2-week curriculum in 8 minutes" },
            { icon: "🎯", title: "Standards Aligned", desc: "Auto-tagged with NGSS, Common Core, state standards" },
            { icon: "📈", title: "Adaptive Differentiation", desc: "3 learning tracks: Enrichment, Standard, Scaffolded" },
            { icon: "💡", title: "Smart Hints", desc: "AI provides personalized help when students are stuck" },
            { icon: "⚡", title: "Instant Grading", desc: "Automatic scoring and progress tracking" },
            { icon: "👨‍👩‍👧", title: "Parent Portal", desc: "Automated progress reports for families" },
          ].map((feature, i) => (
            <Card key={i} hover className="p-6">
              <div className="text-4xl mb-3">{feature.icon}</div>
              <h3 className="font-fredoka text-xl font-bold mb-2 text-gray-900 dark:text-white">
                {feature.title}
              </h3>
              <p className="text-gray-600 dark:text-gray-300 text-sm">
                {feature.desc}
              </p>
            </Card>
          ))}
        </div>
      </section>

      {/* Social Proof */}
      <section className="max-w-6xl mx-auto px-8 py-16">
        <Card className="p-12 bg-gradient-to-r from-teacher-primary to-teacher-accent text-white">
          <h2 className="font-merriweather text-4xl font-bold text-center mb-12">
            Trusted by Teachers Nationwide
          </h2>
          
          <div className="grid md:grid-cols-3 gap-12 text-center">
            <div>
              <div className="text-5xl font-black mb-2">85%</div>
              <div className="text-lg opacity-90">Higher Student Engagement</div>
            </div>
            <div>
              <div className="text-5xl font-black mb-2">10 hrs</div>
              <div className="text-lg opacity-90">Saved Per Week</div>
            </div>
            <div>
              <div className="text-5xl font-black mb-2">90%</div>
              <div className="text-lg opacity-90">Standards Proficiency</div>
            </div>
          </div>
        </Card>
      </section>

      {/* Final CTA */}
      <section className="max-w-4xl mx-auto px-8 py-24 text-center">
        <h2 className="font-merriweather text-5xl font-bold text-white mb-8">
          Ready to Transform Your Classroom?
        </h2>
        <p className="text-2xl text-white/90 mb-12">
          Join hundreds of teachers saving time and boosting engagement
        </p>
        
        <Link href="/login">
          <Button variant="hero" className="text-2xl px-16 py-8">
            Start Free Trial →
          </Button>
        </Link>
        
        <p className="text-white/60 mt-6">
          Free for 30 days • Cancel anytime • No credit card required
        </p>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/20 mt-24 py-12">
        <div className="max-w-6xl mx-auto px-8">
          <div className="grid md:grid-cols-4 gap-8 text-white/80">
            <div>
              <h3 className="font-fredoka font-bold text-white mb-4">QuestLearn</h3>
              <p className="text-sm">AI-powered gamified learning platform for K-12 educators</p>
            </div>
            <div>
              <h4 className="font-semibold mb-3">Product</h4>
              <ul className="space-y-2 text-sm">
                <li><Link href="/features" className="hover:text-white">Features</Link></li>
                <li><Link href="/pricing" className="hover:text-white">Pricing</Link></li>
                <li><a href="https://youtu.be/SunbRWpNIJQ" target="_blank" rel="noopener noreferrer" className="hover:text-white">Demo</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-3">Resources</h4>
              <ul className="space-y-2 text-sm">
                <li><Link href="/docs" className="hover:text-white">Documentation</Link></li>
                <li><Link href="/blog" className="hover:text-white">Blog</Link></li>
                <li><Link href="/help" className="hover:text-white">Help Center</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-3">Company</h4>
              <ul className="space-y-2 text-sm">
                <li><Link href="/about" className="hover:text-white">About</Link></li>
                <li><Link href="/privacy" className="hover:text-white">Privacy</Link></li>
                <li><Link href="/terms" className="hover:text-white">Terms</Link></li>
              </ul>
            </div>
          </div>
          <div className="mt-12 pt-8 border-t border-white/20 text-center text-white/60 text-sm">
            © 2026 QuestLearn. Built with ❤️ for teachers. Powered by Gemini 3.
          </div>
        </div>
      </footer>
    </main>
  );
}
