import React from 'react';
import { DashboardLayout } from '../../components/dashboard/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Settings as SettingsIcon, User, Shield, Bell } from 'lucide-react';

export function Settings() {
  return (
    <DashboardLayout>
      <div className="space-y-8">
        {/* Header */}
        <div className="mb-12">
          <h1 className="text-4xl font-bold text-white dark:text-white light:text-gray-900 mb-2">
            Settings
          </h1>
          <p className="text-gray-400 dark:text-gray-400 light:text-gray-600 text-lg">
            Manage your account preferences and platform settings
          </p>
        </div>

        {/* Settings Categories */}
        <div className="grid gap-6">
          <Card className="bg-gray-800/50 dark:bg-gray-800/50 light:bg-white border-gray-700 dark:border-gray-700 light:border-gray-200">
            <CardHeader>
              <CardTitle className="flex items-center gap-3 text-white dark:text-white light:text-gray-900">
                <User className="w-5 h-5 text-amber-400" />
                Profile Settings
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-400 dark:text-gray-400 light:text-gray-600 mb-4">
                Update your profile information and preferences
              </p>
              <Button 
                onClick={() => window.location.href = '/dashboard/profile'}
                className="bg-amber-500 hover:bg-amber-600 text-black"
              >
                Go to Profile
              </Button>
            </CardContent>
          </Card>

          <Card className="bg-gray-800/50 dark:bg-gray-800/50 light:bg-white border-gray-700 dark:border-gray-700 light:border-gray-200">
            <CardHeader>
              <CardTitle className="flex items-center gap-3 text-white dark:text-white light:text-gray-900">
                <Shield className="w-5 h-5 text-blue-400" />
                Security Settings
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-400 dark:text-gray-400 light:text-gray-600 mb-4">
                Manage your account security and privacy settings
              </p>
              <Button 
                variant="outline" 
                className="border-gray-600 text-gray-300 hover:bg-gray-700 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700 light:border-gray-300 light:text-gray-600 light:hover:bg-gray-100"
              >
                Coming Soon
              </Button>
            </CardContent>
          </Card>

          <Card className="bg-gray-800/50 dark:bg-gray-800/50 light:bg-white border-gray-700 dark:border-gray-700 light:border-gray-200">
            <CardHeader>
              <CardTitle className="flex items-center gap-3 text-white dark:text-white light:text-gray-900">
                <Bell className="w-5 h-5 text-green-400" />
                Notification Settings
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-400 dark:text-gray-400 light:text-gray-600 mb-4">
                Configure how you receive notifications
              </p>
              <Button 
                variant="outline" 
                className="border-gray-600 text-gray-300 hover:bg-gray-700 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700 light:border-gray-300 light:text-gray-600 light:hover:bg-gray-100"
              >
                Coming Soon
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
} 