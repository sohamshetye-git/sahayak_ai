/**
 * Application Tracker Screen
 * Displays user's scheme applications with status and progress
 */

'use client';

import { useRouter } from 'next/navigation';
import { useLanguage } from '@/lib/context/language-context';
import { useLocalApplications } from '@/lib/hooks/use-local-applications';
import { ApplicationCard } from '../components/ApplicationCard';
import { 
  FileText, 
  Clock, 
  CheckCircle, 
  AlertCircle,
  MessageCircle,
  Bell,
  Plus,
  Home
} from 'lucide-react';

export default function ApplicationsPage() {
  const router = useRouter();
  const { language } = useLanguage();
  
  const { applications, isLoading, updateApplicationStatus } = useLocalApplications();

  // Calculate stats
  const stats = {
    total: applications.length,
    inProgress: applications.filter(a => 
      a.status === 'intent_to_apply' || 
      a.status === 'submitted_self_reported' || 
      a.status === 'under_review'
    ).length,
    completed: applications.filter(a => a.status === 'approved').length,
    pendingDocs: applications.filter(a => a.status === 'intent_to_apply').length,
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">{language === 'hi' ? 'लोड हो रहा है...' : 'Loading...'}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{ background: 'linear-gradient(160deg, #dbeafe 0%, #eff6ff 40%, #e0f2fe 70%, #f0fdf4 100%)' }}>
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-sm shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          {/* Back to Home Button */}
          <button
            onClick={() => router.push('/')}
            className="mb-3 text-blue-600 hover:text-blue-700 font-semibold transition-colors flex items-center gap-2"
          >
            <Home size={20} />
            {language === 'hi' ? 'होम' : 'Home'}
          </button>
          
          <h1 className="text-3xl font-bold text-gray-900">
            {language === 'en' ? 'My Applications' : 'मेरे आवेदन'}
          </h1>
          <p className="mt-1 text-gray-600">
            {language === 'en' 
              ? 'Track and manage your government scheme applications'
              : 'अपने सरकारी योजना आवेदनों को ट्रैक और प्रबंधित करें'
            }
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Summary Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard
            icon={<FileText className="w-6 h-6" />}
            label={language === 'en' ? 'Total Applied' : 'कुल आवेदन'}
            count={stats.total}
            color="blue"
          />
          <StatCard
            icon={<Clock className="w-6 h-6" />}
            label={language === 'en' ? 'In Progress' : 'प्रगति में'}
            count={stats.inProgress}
            color="yellow"
          />
          <StatCard
            icon={<CheckCircle className="w-6 h-6" />}
            label={language === 'en' ? 'Completed' : 'पूर्ण'}
            count={stats.completed}
            color="green"
          />
          <StatCard
            icon={<AlertCircle className="w-6 h-6" />}
            label={language === 'en' ? 'Pending Docs' : 'लंबित दस्तावेज़'}
            count={stats.pendingDocs}
            color="red"
          />
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Applications List */}
          <div className="lg:col-span-2 space-y-6">
            {applications.length === 0 ? (
              <div className="bg-white rounded-2xl shadow-sm p-12 text-center">
                <div className="text-gray-400 text-6xl mb-4">📋</div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  {language === 'en' ? 'No applications yet' : 'अभी तक कोई आवेदन नहीं'}
                </h3>
                <p className="text-gray-600 mb-6">
                  {language === 'en' 
                    ? 'Start by browsing available schemes and apply to the ones you are eligible for.'
                    : 'उपलब्ध योजनाओं को ब्राउज़ करके शुरू करें।'
                  }
                </p>
                <button
                  onClick={() => router.push('/schemes')}
                  className="px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-all font-semibold"
                >
                  {language === 'en' ? 'Browse Schemes' : 'योजनाएं ब्राउज़ करें'}
                </button>
              </div>
            ) : (
              applications.map((application) => (
                <ApplicationCard
                  key={application.application_id}
                  application={application}
                  language={language}
                  onStatusUpdate={updateApplicationStatus}
                />
              ))
            )}

            {/* Find More Schemes Button */}
            {applications.length > 0 && (
              <div className="flex justify-center pt-4">
                <button
                  onClick={() => router.push('/schemes')}
                  className="px-8 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-2xl hover:from-blue-700 hover:to-indigo-700 transition-all font-semibold shadow-lg hover:shadow-xl text-lg flex items-center gap-2"
                >
                  <Plus size={24} />
                  {language === 'en' ? 'Find More Schemes' : 'अधिक योजनाएं खोजें'}
                </button>
              </div>
            )}
          </div>

          {/* Right Sidebar */}
          <div className="space-y-6">
            {/* Notifications */}
            <div className="bg-white rounded-2xl shadow-sm p-6">
              <div className="flex items-center gap-2 mb-4">
                <Bell className="w-5 h-5 text-gray-700" />
                <h3 className="text-lg font-bold text-gray-900">
                  {language === 'en' ? 'Notifications' : 'सूचनाएं'}
                </h3>
              </div>
              <div className="space-y-3">
                {applications.filter(a => a.status === 'approved').slice(0, 2).length > 0 ? (
                  applications.filter(a => a.status === 'approved').slice(0, 2).map((app) => (
                    <div key={app.application_id} className="bg-green-50 border border-green-200 rounded-xl p-4">
                      <div className="flex items-start gap-3">
                        <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                        <div className="flex-1">
                          <p className="text-sm font-semibold text-green-900">
                            {language === 'en' ? 'Application Approved!' : 'आवेदन स्वीकृत!'}
                          </p>
                          <p className="text-xs text-green-700 mt-1">
                            {app.scheme_id}
                          </p>
                          <p className="text-xs text-green-600 mt-1">
                            {new Date(app.updated_at || app.created_at).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-gray-500 text-center py-4">
                    {language === 'en' ? 'No new notifications' : 'कोई नई सूचना नहीं'}
                  </p>
                )}
              </div>
            </div>

            {/* Need Help */}
            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl shadow-sm p-6 border border-blue-100">
              <div className="flex items-center gap-2 mb-3">
                <MessageCircle className="w-5 h-5 text-blue-600" />
                <h3 className="text-lg font-bold text-gray-900">
                  {language === 'en' ? 'Need Help?' : 'मदद चाहिए?'}
                </h3>
              </div>
              <p className="text-sm text-gray-700 mb-4">
                {language === 'en' 
                  ? 'Get instant assistance with your applications from our AI assistant.'
                  : 'हमारे AI सहायक से अपने आवेदनों में तुरंत सहायता प्राप्त करें।'
                }
              </p>
              <button
                onClick={() => router.push('/chat')}
                className="block w-full px-4 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-center rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-all font-semibold shadow-sm"
              >
                {language === 'en' ? 'Ask Sahayak AI' : 'सहायक AI से पूछें'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * Stat Card Component
 */
function StatCard({ 
  icon, 
  label, 
  count, 
  color 
}: { 
  icon: React.ReactNode; 
  label: string; 
  count: number; 
  color: 'blue' | 'yellow' | 'green' | 'red';
}) {
  const colorClasses = {
    blue: 'bg-blue-100 text-blue-600',
    yellow: 'bg-yellow-100 text-yellow-600',
    green: 'bg-green-100 text-green-600',
    red: 'bg-red-100 text-red-600',
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm p-6 border border-gray-100 hover:shadow-md transition-shadow">
      <div className="flex items-center gap-4">
        <div className={`w-12 h-12 rounded-full flex items-center justify-center ${colorClasses[color]}`}>
          {icon}
        </div>
        <div>
          <p className="text-sm font-medium text-gray-600">{label}</p>
          <p className="text-3xl font-bold text-gray-900">{count}</p>
        </div>
      </div>
    </div>
  );
}
