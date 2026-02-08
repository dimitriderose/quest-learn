"use client";

import { useState } from "react";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { DashboardHeader } from "@/components/teacher/dashboard/DashboardHeader";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { useAuth } from "@/lib/contexts/AuthContext";
import { 
  User, 
  Bell, 
  Shield, 
  Palette,
  Mail,
  Globe,
  Save,
  Trash2
} from "lucide-react";

export default function TeacherSettingsPage() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState("profile");
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [weeklyReports, setWeeklyReports] = useState(true);
  const [studentUpdates, setStudentUpdates] = useState(false);

  const tabs = [
    { id: "profile", label: "Profile", icon: User },
    { id: "notifications", label: "Notifications", icon: Bell },
    { id: "privacy", label: "Privacy & Security", icon: Shield },
    { id: "appearance", label: "Appearance", icon: Palette },
  ];

  const handleSave = () => {
    alert('Settings saved! (Backend integration pending)');
  };

  return (
    <ProtectedRoute requiredRole="TEACHER">
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <DashboardHeader />

        <main className="max-w-7xl mx-auto px-8 py-8">
          {/* Header */}
          <div className="mb-8">
            <h1 className="font-merriweather text-3xl font-bold text-gray-900 dark:text-white">
              Settings
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              Manage your account preferences
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            {/* Tabs Sidebar */}
            <div className="lg:col-span-1">
              <Card className="p-4">
                <nav className="space-y-1">
                  {tabs.map((tab) => {
                    const Icon = tab.icon;
                    return (
                      <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                          activeTab === tab.id
                            ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 font-semibold'
                            : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800'
                        }`}
                      >
                        <Icon className="w-5 h-5" />
                        <span>{tab.label}</span>
                      </button>
                    );
                  })}
                </nav>
              </Card>
            </div>

            {/* Content Area */}
            <div className="lg:col-span-3">
              {activeTab === "profile" && (
                <Card className="p-6">
                  <h2 className="font-merriweather text-xl font-bold text-gray-900 dark:text-white mb-6">
                    Profile Information
                  </h2>

                  <div className="space-y-6">
                    {/* Profile Photo */}
                    <div className="flex items-center gap-6">
                      <div className="w-24 h-24 rounded-full bg-blue-600 text-white flex items-center justify-center text-3xl font-bold">
                        {user?.displayName?.charAt(0) || "T"}
                      </div>
                      <div>
                        <Button variant="secondary" size="sm">
                          Change Photo
                        </Button>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                          JPG or PNG. Max size 2MB.
                        </p>
                      </div>
                    </div>

                    {/* Full Name */}
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                        Full Name
                      </label>
                      <input
                        type="text"
                        defaultValue={user?.displayName || ""}
                        className="w-full px-4 py-2 border-2 border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                      />
                    </div>

                    {/* Email */}
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                        Email Address
                      </label>
                      <input
                        type="email"
                        defaultValue={user?.email || ""}
                        disabled
                        className="w-full px-4 py-2 border-2 border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-500 dark:text-gray-400 cursor-not-allowed"
                      />
                      <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                        Email cannot be changed. Managed by Google Workspace.
                      </p>
                    </div>

                    {/* School/District */}
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                        School/District
                      </label>
                      <input
                        type="text"
                        placeholder="Enter your school or district name"
                        className="w-full px-4 py-2 border-2 border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                      />
                    </div>

                    {/* Bio */}
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                        Bio
                      </label>
                      <textarea
                        rows={4}
                        placeholder="Tell students a bit about yourself..."
                        className="w-full px-4 py-2 border-2 border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                      />
                    </div>

                    <div className="flex justify-end">
                      <Button variant="primary" onClick={handleSave}>
                        <Save className="w-5 h-5 mr-2" />
                        Save Changes
                      </Button>
                    </div>
                  </div>
                </Card>
              )}

              {activeTab === "notifications" && (
                <Card className="p-6">
                  <h2 className="font-merriweather text-xl font-bold text-gray-900 dark:text-white mb-6">
                    Notification Preferences
                  </h2>

                  <div className="space-y-6">
                    {/* Email Notifications */}
                    <div className="flex items-start justify-between pb-6 border-b border-gray-200 dark:border-gray-700">
                      <div className="flex items-start gap-3">
                        <Mail className="w-5 h-5 text-gray-600 dark:text-gray-400 mt-1" />
                        <div>
                          <h3 className="font-semibold text-gray-900 dark:text-white">
                            Email Notifications
                          </h3>
                          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                            Receive notifications via email
                          </p>
                        </div>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={emailNotifications}
                          onChange={(e) => setEmailNotifications(e.target.checked)}
                          className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
                      </label>
                    </div>

                    {/* Weekly Reports */}
                    <div className="flex items-start justify-between pb-6 border-b border-gray-200 dark:border-gray-700">
                      <div>
                        <h3 className="font-semibold text-gray-900 dark:text-white">
                          Weekly Progress Reports
                        </h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                          Receive a summary of class progress every week
                        </p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={weeklyReports}
                          onChange={(e) => setWeeklyReports(e.target.checked)}
                          className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
                      </label>
                    </div>

                    {/* Student Updates */}
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="font-semibold text-gray-900 dark:text-white">
                          Student Achievement Updates
                        </h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                          Get notified when students complete quests
                        </p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={studentUpdates}
                          onChange={(e) => setStudentUpdates(e.target.checked)}
                          className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
                      </label>
                    </div>

                    <div className="flex justify-end pt-6">
                      <Button variant="primary" onClick={handleSave}>
                        <Save className="w-5 h-5 mr-2" />
                        Save Preferences
                      </Button>
                    </div>
                  </div>
                </Card>
              )}

              {activeTab === "privacy" && (
                <Card className="p-6">
                  <h2 className="font-merriweather text-xl font-bold text-gray-900 dark:text-white mb-6">
                    Privacy & Security
                  </h2>

                  <div className="space-y-6">
                    {/* Account Info */}
                    <div className="pb-6 border-b border-gray-200 dark:border-gray-700">
                      <h3 className="font-semibold text-gray-900 dark:text-white mb-4">
                        Account Information
                      </h3>
                      <div className="space-y-3 text-sm">
                        <div className="flex justify-between">
                          <span className="text-gray-600 dark:text-gray-400">Account Type:</span>
                          <span className="font-semibold text-gray-900 dark:text-white">Teacher</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600 dark:text-gray-400">Login Method:</span>
                          <span className="font-semibold text-gray-900 dark:text-white">Google OAuth</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600 dark:text-gray-400">Account Created:</span>
                          <span className="font-semibold text-gray-900 dark:text-white">January 2026</span>
                        </div>
                      </div>
                    </div>

                    {/* Data Export */}
                    <div className="pb-6 border-b border-gray-200 dark:border-gray-700">
                      <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
                        Export Your Data
                      </h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                        Download a copy of your classes, students, and quest data
                      </p>
                      <Button variant="secondary">
                        Request Data Export
                      </Button>
                    </div>

                    {/* Delete Account */}
                    <div>
                      <h3 className="font-semibold text-red-600 dark:text-red-400 mb-2">
                        Delete Account
                      </h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                        Permanently delete your account and all associated data. This action cannot be undone.
                      </p>
                      <Button variant="secondary" className="text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20">
                        <Trash2 className="w-5 h-5 mr-2" />
                        Delete Account
                      </Button>
                    </div>
                  </div>
                </Card>
              )}

              {activeTab === "appearance" && (
                <Card className="p-6">
                  <h2 className="font-merriweather text-xl font-bold text-gray-900 dark:text-white mb-6">
                    Appearance
                  </h2>

                  <div className="space-y-6">
                    {/* Theme */}
                    <div>
                      <h3 className="font-semibold text-gray-900 dark:text-white mb-4">
                        Theme Preference
                      </h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                        Use the theme toggle in the header to switch between light and dark modes
                      </p>
                    </div>

                    {/* Language */}
                    <div>
                      <h3 className="font-semibold text-gray-900 dark:text-white mb-4">
                        Language
                      </h3>
                      <div className="flex items-center gap-3">
                        <Globe className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                        <select className="px-4 py-2 border-2 border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white">
                          <option value="en">English</option>
                          <option value="es">Spanish</option>
                          <option value="fr">French</option>
                        </select>
                      </div>
                    </div>
                  </div>
                </Card>
              )}
            </div>
          </div>
        </main>
      </div>
    </ProtectedRoute>
  );
}
