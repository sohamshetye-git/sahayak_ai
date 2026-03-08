import { useState } from 'react';
import { useParams, useNavigate } from 'react-router';
import {
  ArrowLeft, CheckCircle, Circle, FileText, Download, AlertTriangle,
  Globe, MapPin, Phone, Clock, ChevronRight, CheckSquare, Square,
  Navigation, ExternalLink, Loader2, PartyPopper,
} from 'lucide-react';
import { schemes } from '../data/schemes';
import { useAppContext } from '../context/AppContext';
import { motion, AnimatePresence } from 'motion/react';

/* ─── Mock Service Centers ─── */
const serviceCenters = [
  { id: 'c1', name: 'CSC Centre, Virar East', type: 'Common Service Centre', address: 'Shop No.12, Sai Plaza, Station Rd, Virar East', phone: '+91 98765 43210', hours: 'Mon–Sat, 9AM–6PM', distance: '2.3 km', },
  { id: 'c2', name: 'Block Development Office, Vasai', type: 'Government Office', address: 'Near Tahsil Office, Vasai Road West', phone: '0250 234 5678', hours: 'Mon–Fri, 10AM–5PM', distance: '4.5 km', },
  { id: 'c3', name: 'State Bank of India, Virar', type: 'Bank Partner', address: 'Main Road, Virar West, Palghar', phone: '+91 22 4567 8901', hours: 'Mon–Fri, 10AM–4PM', distance: '3.1 km', },
];

type Tab = 'overview' | 'documents' | 'apply';

function uid() { return Math.random().toString(36).slice(2, 10).toUpperCase(); }

export default function SchemeDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { addApplication } = useAppContext();

  const scheme = schemes.find((s) => s.id === id);

  const [activeTab, setActiveTab] = useState<Tab>('overview');
  const [checkedDocs, setCheckedDocs] = useState<Set<string>>(new Set());
  const [appMethod, setAppMethod] = useState<'online' | 'center' | null>(null);
  const [selectedCenter, setSelectedCenter] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  if (!scheme) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center">
        <p className="text-gray-500">Scheme not found.</p>
        <button onClick={() => navigate('/explore')} className="mt-4 text-blue-600 hover:underline">← Back to Schemes</button>
      </div>
    );
  }

  const toggleDoc = (name: string) => {
    setCheckedDocs((prev) => {
      const next = new Set(prev);
      if (next.has(name)) next.delete(name);
      else next.add(name);
      return next;
    });
  };

  const requiredDocs = scheme.documents.filter((d) => !d.optional);
  const allRequiredChecked = requiredDocs.every((d) => checkedDocs.has(d.name));
  const docProgress = scheme.documents.filter((d) => checkedDocs.has(d.name)).length;

  const canApply = appMethod === 'online' || (appMethod === 'center' && selectedCenter !== null);

  const handleSubmit = () => {
    setSubmitting(true);
    setTimeout(() => {
      const appId = `${scheme.id.toUpperCase().slice(0, 3)}-${uid()}`;
      const center = serviceCenters.find((c) => c.id === selectedCenter);
      addApplication({
        id: uid(),
        schemeId: scheme.id,
        schemeName: scheme.name,
        schemeIcon: scheme.icon,
        schemeColor: scheme.color,
        appId,
        status: 'In Progress',
        method: appMethod!,
        centerId: selectedCenter ?? undefined,
        centerName: center?.name,
        centerAddress: center?.address,
        appliedDate: new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }),
        progress: 25,
        checkedDocs: Array.from(checkedDocs),
        steps: [
          { label: 'Application Submitted', done: true },
          { label: appMethod === 'online' ? 'Online Verification' : 'Visit Service Center', done: false, active: true },
          { label: 'Document Verification', done: false },
          { label: 'Approval & Disbursement', done: false },
        ],
      });
      setSubmitting(false);
      setSubmitted(true);
    }, 2000);
  };

  const tabs: { key: Tab; label: string; icon: React.ReactNode }[] = [
    { key: 'overview', label: 'Overview', icon: <Circle size={14} /> },
    { key: 'documents', label: 'Documents', icon: <FileText size={14} /> },
    { key: 'apply', label: 'Apply', icon: <ChevronRight size={14} /> },
  ];

  return (
    <div className="max-w-5xl mx-auto px-4 py-6">
      {/* Back */}
      <button onClick={() => navigate(-1)}
        className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700 mb-5 transition-colors">
        <ArrowLeft size={16} /> Back
      </button>

      {/* Scheme Header Banner */}
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
        className="rounded-2xl p-5 mb-5 flex flex-col sm:flex-row sm:items-center gap-4"
        style={{ background: `linear-gradient(135deg, ${scheme.color}18, ${scheme.color}08)`, border: `1.5px solid ${scheme.color}30` }}>
        <div className="w-14 h-14 rounded-2xl flex items-center justify-center text-3xl shrink-0" style={{ backgroundColor: scheme.color + '20' }}>
          {scheme.icon}
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-2 flex-wrap mb-1">
            <span className="text-xs px-2 py-0.5 rounded-full" style={{ backgroundColor: scheme.color + '25', color: scheme.color }}>
              {scheme.category}
            </span>
            <span className="text-xs text-green-600 bg-green-50 border border-green-200 px-2 py-0.5 rounded-full">✓ Open</span>
          </div>
          <h1 className="text-xl text-gray-900 mb-0.5">{scheme.name}</h1>
          <p className="text-xs text-gray-500">Deadline: {scheme.deadline}</p>
        </div>
        <div className="shrink-0 text-right">
          <p className="text-xs text-gray-500">Benefit</p>
          <p className="text-base" style={{ color: scheme.color }}>{scheme.benefit}</p>
        </div>
      </motion.div>

      {/* Tabs */}
      <div className="flex gap-1 bg-gray-100 rounded-xl p-1 mb-6">
        {tabs.map((tab) => (
          <button key={tab.key} onClick={() => setActiveTab(tab.key)}
            className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-lg text-sm transition-all ${
              activeTab === tab.key ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'
            }`}>
            {tab.icon} {tab.label}
            {tab.key === 'documents' && docProgress > 0 && (
              <span className="text-xs px-1.5 py-0.5 rounded-full text-white ml-1" style={{ backgroundColor: scheme.color, fontSize: '10px' }}>
                {docProgress}/{scheme.documents.length}
              </span>
            )}
          </button>
        ))}
      </div>

      <AnimatePresence mode="wait">

        {/* ── OVERVIEW TAB ── */}
        {activeTab === 'overview' && (
          <motion.div key="overview" initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 10 }}
            className="grid grid-cols-1 md:grid-cols-2 gap-4">

            {/* Description */}
            <div className="bg-white rounded-2xl border border-gray-200 p-5 shadow-sm">
              <h2 className="text-sm text-gray-800 mb-3">About this Scheme</h2>
              <p className="text-sm text-gray-600 leading-relaxed mb-4">{scheme.description}</p>
              <div className="flex items-center gap-2 p-3 bg-orange-50 rounded-xl border border-orange-100">
                <AlertTriangle size={14} className="text-orange-500 shrink-0" />
                <span className="text-xs text-orange-700">Deadline: {scheme.deadline}</span>
              </div>
            </div>

            {/* Eligibility */}
            <div className="bg-white rounded-2xl border border-gray-200 p-5 shadow-sm">
              <h2 className="text-sm text-gray-800 mb-3">Eligibility Criteria</h2>
              <div className="space-y-2.5">
                {scheme.eligibility.map((item, i) => (
                  <div key={i} className="flex items-start gap-2.5">
                    <div className="w-5 h-5 rounded-full flex items-center justify-center shrink-0 mt-0.5" style={{ backgroundColor: scheme.color + '20' }}>
                      <CheckCircle size={13} style={{ color: scheme.color }} />
                    </div>
                    <span className="text-sm text-gray-700">{item}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Application Process (at center) */}
            <div className="bg-white rounded-2xl border border-gray-200 p-5 shadow-sm">
              <h2 className="text-sm text-gray-800 mb-3">🏢 In-Person Application Steps</h2>
              <div className="space-y-3">
                {scheme.applicationSteps.map((step, i) => (
                  <div key={i} className="flex gap-3">
                    <div className="w-6 h-6 rounded-full flex items-center justify-center text-xs text-white shrink-0 mt-0.5" style={{ backgroundColor: scheme.color }}>
                      {i + 1}
                    </div>
                    <div>
                      <p className="text-sm text-gray-800">{step.title}</p>
                      <p className="text-xs text-gray-500 leading-relaxed">{step.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Online Process */}
            {scheme.onlineSteps && (
              <div className="bg-white rounded-2xl border border-gray-200 p-5 shadow-sm">
                <h2 className="text-sm text-gray-800 mb-3">🌐 Online Application Steps</h2>
                <div className="space-y-3">
                  {scheme.onlineSteps.map((step, i) => (
                    <div key={i} className="flex gap-3">
                      <div className="w-6 h-6 rounded-full flex items-center justify-center text-xs text-white shrink-0 mt-0.5" style={{ backgroundColor: '#2563eb' }}>
                        {i + 1}
                      </div>
                      <div>
                        <p className="text-sm text-gray-800">{step.title}</p>
                        <p className="text-xs text-gray-500 leading-relaxed">{step.description}</p>
                        {step.link && (
                          <a href={step.link} target="_blank" rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 text-xs text-blue-600 hover:underline mt-0.5">
                            <ExternalLink size={10} /> {step.link}
                          </a>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* CTA */}
            <div className="md:col-span-2 flex gap-3">
              <button onClick={() => setActiveTab('documents')}
                className="flex-1 py-3 rounded-xl text-white text-sm transition-colors hover:opacity-90"
                style={{ backgroundColor: scheme.color }}>
                Check Documents Required →
              </button>
            </div>
          </motion.div>
        )}

        {/* ── DOCUMENTS TAB ── */}
        {activeTab === 'documents' && (
          <motion.div key="documents" initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 10 }}>

            {/* Progress Header */}
            <div className="bg-white rounded-2xl border border-gray-200 p-4 mb-4 shadow-sm">
              <div className="flex items-center justify-between mb-2">
                <div>
                  <p className="text-sm text-gray-800">Document Checklist</p>
                  <p className="text-xs text-gray-500">Tick each document you have ready</p>
                </div>
                <span className="text-xs px-3 py-1 rounded-full" style={{ backgroundColor: scheme.color + '18', color: scheme.color }}>
                  {docProgress} / {scheme.documents.length} ready
                </span>
              </div>
              <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                <motion.div className="h-full rounded-full"
                  style={{ backgroundColor: scheme.color }}
                  animate={{ width: `${(docProgress / scheme.documents.length) * 100}%` }}
                  transition={{ duration: 0.4 }} />
              </div>
            </div>

            {/* Document Cards */}
            <div className="space-y-3 mb-4">
              {scheme.documents.map((doc, i) => {
                const isChecked = checkedDocs.has(doc.name);
                return (
                  <motion.div key={i} layout
                    className={`bg-white rounded-2xl border p-4 shadow-sm cursor-pointer transition-all ${
                      isChecked ? 'border-green-300 bg-green-50/50' : 'border-gray-200 hover:border-gray-300'
                    }`}
                    onClick={() => toggleDoc(doc.name)}>
                    <div className="flex gap-3">
                      {/* Checkbox */}
                      <div className={`w-6 h-6 rounded-md border-2 flex items-center justify-center shrink-0 mt-0.5 transition-all ${
                        isChecked ? 'border-green-500 bg-green-500' : 'border-gray-300'
                      }`}>
                        {isChecked && <CheckCircle size={14} className="text-white" />}
                      </div>

                      {/* Content */}
                      <div className="flex-1">
                        <div className="flex items-center gap-2 flex-wrap mb-1">
                          <p className={`text-sm ${isChecked ? 'text-green-800' : 'text-gray-900'}`}>{doc.name}</p>
                          {doc.optional ? (
                            <span className="text-xs px-1.5 py-0.5 rounded-full bg-blue-50 text-blue-600 border border-blue-100">Optional</span>
                          ) : (
                            <span className="text-xs px-1.5 py-0.5 rounded-full bg-red-50 text-red-600 border border-red-100">Required</span>
                          )}
                        </div>
                        <p className="text-xs text-gray-500 leading-relaxed">{doc.info}</p>
                      </div>

                      {/* Download */}
                      <button
                        onClick={(e) => { e.stopPropagation(); }}
                        className="flex items-center gap-1 text-xs text-gray-400 hover:text-gray-600 shrink-0 mt-0.5 px-2 py-1 rounded-lg hover:bg-gray-100 transition-colors">
                        <Download size={12} />
                        <span className="hidden sm:inline">Sample</span>
                      </button>
                    </div>
                  </motion.div>
                );
              })}
            </div>

            {/* Status message */}
            {allRequiredChecked && (
              <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
                className="flex items-center gap-3 p-4 bg-green-50 border border-green-200 rounded-2xl mb-4">
                <CheckCircle size={18} className="text-green-600 shrink-0" />
                <div>
                  <p className="text-sm text-green-800">All required documents ready!</p>
                  <p className="text-xs text-green-600">You can now proceed to apply for this scheme.</p>
                </div>
              </motion.div>
            )}
            {!allRequiredChecked && (
              <div className="flex items-center gap-3 p-4 bg-amber-50 border border-amber-200 rounded-2xl mb-4">
                <AlertTriangle size={18} className="text-amber-500 shrink-0" />
                <div>
                  <p className="text-sm text-amber-800">
                    {requiredDocs.filter((d) => !checkedDocs.has(d.name)).length} required document(s) pending
                  </p>
                  <p className="text-xs text-amber-600">Collect all required documents before applying.</p>
                </div>
              </div>
            )}

            <button onClick={() => setActiveTab('apply')}
              className="w-full py-3 rounded-xl text-white text-sm transition-colors hover:opacity-90"
              style={{ backgroundColor: scheme.color }}>
              Proceed to Apply →
            </button>
          </motion.div>
        )}

        {/* ── APPLY TAB ── */}
        {activeTab === 'apply' && !submitted && (
          <motion.div key="apply" initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 10 }}
            className="space-y-4">

            {/* Doc Summary */}
            <div className="bg-white rounded-2xl border border-gray-200 p-4 shadow-sm">
              <div className="flex items-center justify-between">
                <p className="text-sm text-gray-800">Documents Ready</p>
                <span className="text-xs" style={{ color: scheme.color }}>{docProgress}/{scheme.documents.length} checked</span>
              </div>
              <div className="flex flex-wrap gap-1.5 mt-2">
                {scheme.documents.map((doc) => (
                  <span key={doc.name} className={`text-xs px-2 py-1 rounded-full flex items-center gap-1 ${
                    checkedDocs.has(doc.name) ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-gray-50 text-gray-400 border border-gray-100'
                  }`}>
                    {checkedDocs.has(doc.name) ? '✓' : '○'} {doc.name}
                  </span>
                ))}
              </div>
              <button onClick={() => setActiveTab('documents')}
                className="mt-2 text-xs text-blue-600 hover:underline">
                ← Back to Documents
              </button>
            </div>

            {/* Choose Method */}
            <div className="bg-white rounded-2xl border border-gray-200 p-5 shadow-sm">
              <p className="text-sm text-gray-800 mb-4">Choose Application Method</p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* Online */}
                <button onClick={() => { setAppMethod('online'); setSelectedCenter(null); }}
                  className={`relative p-4 rounded-xl border-2 text-left transition-all ${
                    appMethod === 'online' ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-blue-200'
                  }`}>
                  {appMethod === 'online' && (
                    <div className="absolute top-2 right-2 w-4 h-4 rounded-full bg-blue-500 flex items-center justify-center">
                      <CheckCircle size={12} className="text-white" />
                    </div>
                  )}
                  <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center mb-3">
                    <Globe size={20} className="text-blue-600" />
                  </div>
                  <p className="text-sm text-gray-900 mb-0.5">Apply Online</p>
                  <p className="text-xs text-gray-500">Apply from anywhere via the official government portal</p>
                  {scheme.officialUrl && (
                    <p className="text-xs text-blue-500 mt-1 truncate">{scheme.officialUrl}</p>
                  )}
                </button>

                {/* At Center */}
                <button onClick={() => setAppMethod('center')}
                  className={`relative p-4 rounded-xl border-2 text-left transition-all ${
                    appMethod === 'center' ? 'border-green-500 bg-green-50' : 'border-gray-200 hover:border-green-200'
                  }`}>
                  {appMethod === 'center' && (
                    <div className="absolute top-2 right-2 w-4 h-4 rounded-full bg-green-500 flex items-center justify-center">
                      <CheckCircle size={12} className="text-white" />
                    </div>
                  )}
                  <div className="w-10 h-10 rounded-xl bg-green-100 flex items-center justify-center mb-3">
                    <MapPin size={20} className="text-green-600" />
                  </div>
                  <p className="text-sm text-gray-900 mb-0.5">Visit Nearest Center</p>
                  <p className="text-xs text-gray-500">Apply in-person at your nearest CSC, bank, or government office</p>
                </button>
              </div>
            </div>

            {/* Online Details */}
            <AnimatePresence>
              {appMethod === 'online' && scheme.onlineSteps && (
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
                  className="bg-white rounded-2xl border border-blue-100 p-5 shadow-sm">
                  <div className="flex items-center gap-2 mb-4">
                    <Globe size={16} className="text-blue-600" />
                    <p className="text-sm text-gray-800">Online Application Process</p>
                  </div>
                  <div className="space-y-3 mb-4">
                    {scheme.onlineSteps.map((step, i) => (
                      <div key={i} className="flex gap-3">
                        <div className="w-6 h-6 rounded-full flex items-center justify-center text-xs text-white shrink-0 mt-0.5 bg-blue-500">
                          {i + 1}
                        </div>
                        <div>
                          <p className="text-sm text-gray-800">{step.title}</p>
                          <p className="text-xs text-gray-500">{step.description}</p>
                          {step.link && (
                            <a href={step.link} target="_blank" rel="noopener noreferrer"
                              className="inline-flex items-center gap-1 text-xs text-blue-600 hover:underline mt-0.5">
                              <ExternalLink size={10} /> Open Portal
                            </a>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                  {scheme.officialUrl && (
                    <a href={scheme.officialUrl} target="_blank" rel="noopener noreferrer"
                      className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl border-2 border-blue-500 text-blue-600 text-sm hover:bg-blue-50 transition-colors">
                      <ExternalLink size={14} /> Open Official Portal
                    </a>
                  )}
                </motion.div>
              )}
            </AnimatePresence>

            {/* Service Center Selection */}
            <AnimatePresence>
              {appMethod === 'center' && (
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
                  className="bg-white rounded-2xl border border-green-100 p-5 shadow-sm">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <MapPin size={16} className="text-green-600" />
                      <p className="text-sm text-gray-800">Select Nearest Center</p>
                    </div>
                    <button onClick={() => navigate('/service-center')}
                      className="text-xs text-blue-600 hover:underline flex items-center gap-1">
                      View Map <ChevronRight size={11} />
                    </button>
                  </div>
                  <div className="space-y-3">
                    {serviceCenters.map((center) => {
                      const isSelected = selectedCenter === center.id;
                      return (
                        <div key={center.id}
                          onClick={() => setSelectedCenter(center.id)}
                          className={`p-4 rounded-xl border-2 cursor-pointer transition-all ${
                            isSelected ? 'border-green-500 bg-green-50' : 'border-gray-100 hover:border-green-200 bg-gray-50'
                          }`}>
                          <div className="flex items-start justify-between gap-2">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1 flex-wrap">
                                <p className="text-sm text-gray-900">{center.name}</p>
                                <span className="text-xs px-1.5 py-0.5 rounded-full bg-gray-100 text-gray-500">{center.type}</span>
                              </div>
                              <p className="text-xs text-gray-500 flex items-start gap-1 mb-1">
                                <MapPin size={11} className="shrink-0 mt-0.5" /> {center.address}
                              </p>
                              <div className="flex items-center gap-3">
                                <span className="text-xs text-blue-600 flex items-center gap-0.5">
                                  <Phone size={10} /> {center.phone}
                                </span>
                                <span className="text-xs text-gray-400 flex items-center gap-0.5">
                                  <Clock size={10} /> {center.hours}
                                </span>
                              </div>
                            </div>
                            <div className="flex flex-col items-end gap-2 shrink-0">
                              <span className="text-xs text-green-600">{center.distance}</span>
                              <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${
                                isSelected ? 'border-green-500 bg-green-500' : 'border-gray-300'
                              }`}>
                                {isSelected && <CheckCircle size={12} className="text-white" />}
                              </div>
                            </div>
                          </div>
                          {isSelected && (
                            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }}
                              className="mt-3 pt-3 border-t border-green-200 flex gap-2">
                              <button className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-green-400 text-green-700 text-xs rounded-lg hover:bg-green-50 transition-colors">
                                <Navigation size={11} /> Get Directions
                              </button>
                              <a href={`tel:${center.phone}`}
                                className="flex items-center gap-1.5 px-3 py-1.5 bg-green-600 text-white text-xs rounded-lg hover:bg-green-700 transition-colors">
                                <Phone size={11} /> Call Center
                              </a>
                            </motion.div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Submit Button */}
            {appMethod && (
              <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
                {!allRequiredChecked && (
                  <div className="flex items-center gap-2 p-3 bg-amber-50 border border-amber-200 rounded-xl mb-3">
                    <AlertTriangle size={14} className="text-amber-500 shrink-0" />
                    <p className="text-xs text-amber-700">
                      Some required documents are unchecked. You can still submit but make sure to carry them.
                    </p>
                  </div>
                )}

                <button
                  onClick={handleSubmit}
                  disabled={!canApply || submitting}
                  className="w-full flex items-center justify-center gap-2 py-4 rounded-2xl text-white text-sm transition-all disabled:opacity-50 hover:opacity-90 shadow-lg"
                  style={{ background: `linear-gradient(135deg, ${scheme.color}, ${scheme.color}cc)` }}>
                  {submitting ? (
                    <><Loader2 size={18} className="animate-spin" /> Submitting Application...</>
                  ) : (
                    <>Submit Application {appMethod === 'online' ? '🌐' : '🏢'}</>
                  )}
                </button>
                <p className="text-xs text-gray-400 text-center mt-2">
                  By submitting, you confirm the details provided are accurate.
                </p>
              </motion.div>
            )}
          </motion.div>
        )}

        {/* ── SUCCESS STATE ── */}
        {activeTab === 'apply' && submitted && (
          <motion.div key="success" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
            className="flex flex-col items-center text-center py-10">
            <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', delay: 0.1 }}
              className="w-20 h-20 rounded-full flex items-center justify-center text-4xl mb-5 shadow-lg"
              style={{ background: `linear-gradient(135deg, ${scheme.color}40, ${scheme.color}20)`, border: `3px solid ${scheme.color}60` }}>
              🎉
            </motion.div>

            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
              <h2 className="text-xl text-gray-900 mb-2">Application Submitted!</h2>
              <p className="text-sm text-gray-600 mb-1">
                Your application for <span style={{ color: scheme.color }}>{scheme.name}</span> has been submitted successfully.
              </p>
              {appMethod === 'center' && selectedCenter && (
                <p className="text-xs text-gray-500 mb-1">
                  Visit: {serviceCenters.find((c) => c.id === selectedCenter)?.name}
                </p>
              )}
              {appMethod === 'online' && (
                <p className="text-xs text-gray-500 mb-1">Complete the process at the official portal.</p>
              )}
              <p className="text-xs text-gray-400 mb-6">You'll receive updates via SMS / WhatsApp.</p>
            </motion.div>

            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}
              className="flex flex-col sm:flex-row gap-3 w-full max-w-sm">
              <button onClick={() => navigate('/my-applications')}
                className="flex-1 py-3 rounded-xl text-white text-sm shadow-md hover:opacity-90 transition-opacity"
                style={{ backgroundColor: scheme.color }}>
                📂 My Applications
              </button>
              <button onClick={() => navigate('/explore')}
                className="flex-1 py-3 rounded-xl border border-gray-300 text-gray-700 text-sm hover:bg-gray-50 transition-colors">
                Explore More
              </button>
            </motion.div>
          </motion.div>
        )}

      </AnimatePresence>
    </div>
  );
}
