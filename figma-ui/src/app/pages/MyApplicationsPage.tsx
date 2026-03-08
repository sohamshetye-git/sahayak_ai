import { useState } from 'react';
import {
  CheckCircle, Clock, FileText, Calendar, ChevronDown, ChevronUp,
  MapPin, Bell, AlertCircle, ExternalLink, Globe, Phone,
} from 'lucide-react';
import { useNavigate } from 'react-router';
import { motion, AnimatePresence } from 'motion/react';
import { useAppContext, ApplicationRecord } from '../context/AppContext';

/* ─── Static demo applications shown only if context is empty ─── */
const DEMO_APPS: ApplicationRecord[] = [
  {
    id: 'demo-1',
    schemeId: 'ayushman-bharat',
    schemeName: 'Ayushman Bharat',
    schemeIcon: '🏥',
    schemeColor: '#dc2626',
    appId: 'AB-98765432',
    status: 'Completed',
    method: 'center',
    centerId: 'c1',
    centerName: 'CSC Centre, Virar East',
    centerAddress: 'Shop No.12, Sai Plaza, Station Rd, Virar East',
    appliedDate: '12 Jan 2025',
    progress: 100,
    checkedDocs: ['Aadhaar Card', 'Ration Card', 'Income Certificate'],
    steps: [
      { label: 'Application Submitted', done: true },
      { label: 'Visit Service Center', done: true },
      { label: 'Document Verification', done: true },
      { label: 'Approval & Disbursement', done: true },
    ],
  },
];

const statusConfig = {
  'In Progress':       { bg: 'bg-yellow-50', text: 'text-yellow-700', border: 'border-yellow-200', dot: 'bg-yellow-500' },
  'Completed':         { bg: 'bg-green-50',  text: 'text-green-700',  border: 'border-green-200',  dot: 'bg-green-500'  },
  'Pending Documents': { bg: 'bg-red-50',    text: 'text-red-700',    border: 'border-red-200',    dot: 'bg-red-500'    },
};

function StatCard({ icon, label, value, color }: { icon: React.ReactNode; label: string; value: number; color: string }) {
  return (
    <div className="bg-white rounded-2xl border border-gray-200 p-4 shadow-sm flex items-center gap-3">
      <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${color}`}>{icon}</div>
      <div>
        <p className="text-xs text-gray-500">{label}</p>
        <p className="text-xl text-gray-900">{value}</p>
      </div>
    </div>
  );
}

function AppCard({ app }: { app: ApplicationRecord }) {
  const navigate = useNavigate();
  const [expanded, setExpanded] = useState(app.status === 'In Progress');
  const cfg = statusConfig[app.status];

  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">

      {/* Color strip */}
      <div className="h-1 w-full" style={{ backgroundColor: app.schemeColor }} />

      <div className="p-5">
        {/* Title row */}
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center text-lg shrink-0" style={{ backgroundColor: app.schemeColor + '18' }}>
              {app.schemeIcon}
            </div>
            <div>
              <p className="text-sm text-gray-900">{app.schemeName}</p>
              <p className="text-xs text-gray-400">ID: {app.appId} · Applied {app.appliedDate}</p>
            </div>
          </div>
          <span className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs border ${cfg.bg} ${cfg.text} ${cfg.border} shrink-0 ml-2`}>
            <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
            {app.status}
          </span>
        </div>

        {/* Progress bar */}
        <div className="mb-3">
          <div className="flex justify-between mb-1">
            <span className="text-xs text-gray-500">Progress</span>
            <span className="text-xs text-gray-700">{app.progress}% Complete</span>
          </div>
          <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
            <motion.div className="h-full rounded-full"
              style={{ backgroundColor: app.schemeColor }}
              initial={{ width: 0 }}
              animate={{ width: `${app.progress}%` }}
              transition={{ duration: 0.8, ease: 'easeOut' }} />
          </div>
        </div>

        {/* Steps timeline */}
        <div className="flex items-center gap-1 flex-wrap mb-3">
          {app.steps.map((step, i) => (
            <div key={i} className="flex items-center gap-1">
              <div className={`flex items-center gap-1 text-xs px-2 py-0.5 rounded-full ${
                step.done
                  ? 'text-green-700 bg-green-50 border border-green-200'
                  : step.active
                  ? 'text-blue-700 bg-blue-50 border border-blue-200'
                  : 'text-gray-400'
              }`}>
                {step.done
                  ? <CheckCircle size={10} className="text-green-600" />
                  : step.active
                  ? <div className="w-2 h-2 rounded-full border-2 border-blue-600" />
                  : <div className="w-2 h-2 rounded-full border border-gray-300" />}
                <span>{step.label}</span>
              </div>
              {i < app.steps.length - 1 && <span className="text-gray-300 text-xs">→</span>}
            </div>
          ))}
        </div>

        {/* Method badge */}
        <div className="flex items-center gap-2">
          {app.method === 'online' ? (
            <span className="flex items-center gap-1.5 text-xs text-blue-600 bg-blue-50 px-2.5 py-1 rounded-full border border-blue-100">
              <Globe size={11} /> Online Application
            </span>
          ) : (
            <span className="flex items-center gap-1.5 text-xs text-green-700 bg-green-50 px-2.5 py-1 rounded-full border border-green-100">
              <MapPin size={11} /> In-Person at Center
            </span>
          )}
        </div>
      </div>

      {/* Expandable Details */}
      <AnimatePresence>
        {expanded && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.2 }} className="overflow-hidden">
            <div className="px-5 pb-4 pt-1 border-t border-gray-100">

              {/* Documents checked */}
              {app.checkedDocs.length > 0 && (
                <div className="mb-3">
                  <p className="text-xs text-gray-500 mb-1.5">Documents Submitted:</p>
                  <div className="flex flex-wrap gap-1.5">
                    {app.checkedDocs.map((doc) => (
                      <span key={doc} className="flex items-center gap-1 text-xs px-2 py-0.5 rounded-full bg-green-50 text-green-700 border border-green-100">
                        ✓ {doc}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Center info */}
              {app.method === 'center' && app.centerName && (
                <div className="mb-3 p-3 bg-gray-50 rounded-xl border border-gray-100">
                  <p className="text-xs text-gray-500 mb-1">Visit Center:</p>
                  <p className="text-xs text-gray-800">{app.centerName}</p>
                  {app.centerAddress && <p className="text-xs text-gray-400">{app.centerAddress}</p>}
                </div>
              )}

              {/* Actions */}
              <div className="flex flex-wrap gap-2">
                {app.status !== 'Completed' && (
                  <button onClick={() => navigate(`/scheme/${app.schemeId}`)}
                    className="flex items-center gap-1.5 px-3 py-2 text-xs text-white rounded-lg transition-colors hover:opacity-90"
                    style={{ backgroundColor: app.schemeColor }}>
                    Continue Application
                  </button>
                )}
                <button onClick={() => navigate(`/scheme/${app.schemeId}`)}
                  className="flex items-center gap-1.5 px-3 py-2 border border-gray-300 text-gray-600 text-xs rounded-lg hover:bg-gray-50 transition-colors">
                  <ExternalLink size={11} /> View Scheme
                </button>
                {app.method === 'center' && (
                  <button onClick={() => navigate('/service-center')}
                    className="flex items-center gap-1.5 px-3 py-2 border border-green-200 text-green-700 text-xs rounded-lg hover:bg-green-50 transition-colors">
                    <MapPin size={11} /> Directions
                  </button>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <button onClick={() => setExpanded((e) => !e)}
        className="w-full flex items-center justify-center gap-1 py-2.5 text-xs text-gray-400 hover:text-gray-600 border-t border-gray-100 transition-colors">
        {expanded ? <><ChevronUp size={13} /> Hide Details</> : <><ChevronDown size={13} /> Show Details</>}
      </button>
    </motion.div>
  );
}

export default function MyApplicationsPage() {
  const navigate = useNavigate();
  const { applications } = useAppContext();
  const [reminderSet, setReminderSet] = useState(false);

  // Use real context applications; fall back to demo if empty
  const allApps = applications.length > 0 ? applications : DEMO_APPS;

  const active = allApps.filter((a) => a.status === 'In Progress').length;
  const completed = allApps.filter((a) => a.status === 'Completed').length;
  const pending = allApps.filter((a) => a.status === 'Pending Documents').length;

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="mb-6">
        <h1 className="text-2xl text-gray-900 mb-1">My Applications</h1>
        <p className="text-sm text-gray-500">Track and manage your government scheme applications</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
        <StatCard icon={<FileText size={18} className="text-blue-600" />} label="Total Applied" value={allApps.length} color="bg-blue-50" />
        <StatCard icon={<Clock size={18} className="text-yellow-500" />} label="In Progress" value={active} color="bg-yellow-50" />
        <StatCard icon={<CheckCircle size={18} className="text-green-600" />} label="Completed" value={completed} color="bg-green-50" />
        <StatCard icon={<AlertCircle size={18} className="text-orange-500" />} label="Pending Docs" value={pending} color="bg-orange-50" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Applications */}
        <div className="lg:col-span-2 flex flex-col gap-4">
          {allApps.length === 0 ? (
            <div className="bg-white rounded-2xl border border-gray-200 p-12 text-center">
              <p className="text-4xl mb-3">📂</p>
              <p className="text-gray-500 text-sm mb-4">No applications yet. Apply for a scheme to get started.</p>
              <button onClick={() => navigate('/chat')}
                className="px-5 py-2.5 bg-blue-600 text-white text-sm rounded-xl hover:bg-blue-700 transition-colors">
                🤖 Find My Schemes
              </button>
            </div>
          ) : (
            allApps.map((app) => <AppCard key={app.id} app={app} />)
          )}

          <div className="text-center mt-2">
            <button onClick={() => navigate('/chat')}
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded-xl transition-colors">
              + Find More Schemes
            </button>
          </div>
        </div>

        {/* Sidebar */}
        <div className="flex flex-col gap-4">
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }}
            className="bg-white rounded-2xl border border-gray-200 p-5 shadow-sm">
            <h3 className="text-sm text-gray-900 mb-3 flex items-center gap-2">
              <Calendar size={16} className="text-blue-600" /> Upcoming Reminder
            </h3>
            <p className="text-xs text-gray-600 mb-4">Visit Block Office before 25 Jan to complete your application.</p>
            <button onClick={() => setReminderSet(!reminderSet)}
              className={`w-full py-2 border text-sm rounded-lg transition-colors ${
                reminderSet ? 'bg-green-50 border-green-300 text-green-700' : 'border-gray-300 text-gray-700 hover:bg-gray-50'
              }`}>
              {reminderSet ? '✓ Reminder Set' : 'Set Reminder'}
            </button>
          </motion.div>

          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.3 }}
            className="bg-white rounded-2xl border border-gray-200 p-5 shadow-sm">
            <h3 className="text-sm text-gray-900 mb-3 flex items-center gap-2">
              <Bell size={16} className="text-blue-600" /> Notifications
            </h3>
            <div className="space-y-3">
              {allApps.filter((a) => a.status === 'In Progress').slice(0, 2).map((app) => (
                <div key={app.id} className="flex items-start gap-2 p-2.5 bg-yellow-50 rounded-xl border border-yellow-100">
                  <AlertCircle size={13} className="text-yellow-600 mt-0.5 shrink-0" />
                  <div>
                    <p className="text-xs text-gray-800">{app.schemeName}: Application in progress</p>
                    <p className="text-xs text-gray-400">Applied {app.appliedDate}</p>
                  </div>
                </div>
              ))}
              {allApps.filter((a) => a.status === 'Completed').slice(0, 1).map((app) => (
                <div key={app.id} className="flex items-start gap-2 p-2.5 bg-green-50 rounded-xl border border-green-100">
                  <CheckCircle size={13} className="text-green-600 mt-0.5 shrink-0" />
                  <div>
                    <p className="text-xs text-gray-800">{app.schemeName} application completed!</p>
                    <p className="text-xs text-gray-400">Applied {app.appliedDate}</p>
                  </div>
                </div>
              ))}
              {allApps.length === 0 && (
                <p className="text-xs text-gray-400 text-center py-2">No notifications yet</p>
              )}
            </div>
          </motion.div>

          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.4 }}
            className="bg-gradient-to-br from-blue-50 to-green-50 rounded-2xl border border-blue-100 p-5">
            <h3 className="text-sm text-gray-900 mb-1">Need Help?</h3>
            <p className="text-xs text-gray-500 mb-3">Talk to Sahayak AI for guidance on any application.</p>
            <button onClick={() => navigate('/chat')}
              className="w-full py-2.5 bg-green-600 hover:bg-green-700 text-white text-sm rounded-xl transition-colors">
              🤖 Ask Sahayak AI
            </button>
          </motion.div>
        </div>
      </div>

      <p className="text-center text-xs text-gray-400 mt-8">
        Application guidance is AI-assisted. Please verify details with official government authorities.
      </p>
    </div>
  );
}
