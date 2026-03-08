import { useState, useRef, useEffect, useCallback, Fragment } from 'react';
import {
  Mic, MicOff, Send, ChevronRight, CheckCircle, Star, ArrowLeft,
  FileText, MapPin, Globe, ExternalLink, ChevronDown, Sparkles, User,
  BookOpen,
} from 'lucide-react';
import { useNavigate } from 'react-router';
import { motion, AnimatePresence } from 'motion/react';
import { schemes, Scheme } from '../data/schemes';

/* ═══════════════════ THEME CONSTANTS ═══════════════════ */
const C = {
  indigo: '#3730a3',
  indigoMid: '#4338ca',
  green: '#15803d',
  greenLight: '#f0fdf4',
  greenBorder: '#bbf7d0',
  aiBubbleBg: '#ffffff',
  aiBubbleBorder: '#e0e7ff',
  aiBubbleAccent: '#15803d', // left border
  userBubble: '#3730a3',
  chipBg: '#eef2ff',
  chipText: '#3730a3',
  chipBorder: '#c7d2fe',
  bg: 'linear-gradient(160deg, #eef2ff 0%, #f8fafc 50%, #f0fdf4 100%)',
};

/* ═══════════════════ SCHEME IMAGES ═══════════════════ */
const schemeImages: Record<string, string> = {
  Agriculture: 'https://images.unsplash.com/photo-1770892123242-c876a0a343f5?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=400',
  Health: 'https://images.unsplash.com/photo-1659353888906-adb3e0041693?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=400',
  'Social Welfare': 'https://images.unsplash.com/photo-1724301964759-374723c8ee7d?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=400',
};

/* ═══════════════════ SOURCES MAP ═══════════════════ */
const schemeSources: Record<string, { label: string; url: string }[]> = {
  Agriculture: [
    { label: 'Ministry of Agriculture & Farmers Welfare, GoI', url: 'https://agricoop.nic.in' },
    { label: 'PM-KISAN Official Portal', url: 'https://pmkisan.gov.in' },
  ],
  Health: [
    { label: 'Ministry of Health & Family Welfare, GoI', url: 'https://mohfw.gov.in' },
    { label: 'Ayushman Bharat PM-JAY', url: 'https://pmjay.gov.in' },
  ],
  'Social Welfare': [
    { label: 'Ministry of Rural Development, GoI', url: 'https://rural.nic.in' },
    { label: 'National Social Assistance Programme', url: 'https://nsap.nic.in' },
  ],
};
const defaultSources = [{ label: 'MyScheme Portal, Government of India', url: 'https://myscheme.gov.in' }];

/* ═══════════════════ TYPES ═══════════════════ */
interface Option { label: string; value: string }

interface MatchedScheme extends Scheme { matchPct: number; reasons: string[] }

type Payload =
  | { type: 'options'; options: Option[] }
  | { type: 'schemes'; schemes: MatchedScheme[] }
  | { type: 'doc-list'; scheme: MatchedScheme }
  | { type: 'scheme-info'; scheme: MatchedScheme };

interface Message {
  id: string;
  role: 'ai' | 'user';
  text: string;
  payload?: Payload;
  sources?: { label: string; url: string }[];
}

interface UserProfile {
  name?: string;
  age?: string;
  occupation?: string;
  income?: string;
  category?: string;
  state?: string;
}

/* ═══════════════════ PROFILE QUESTIONS ═══════════════════ */
const QUESTIONS = [
  {
    key: 'name',
    ask: (_p: UserProfile) =>
      'Hello! 🙏 I am **Sahayak AI** — your personal government scheme assistant.\n\nI help you discover, understand, and apply for welfare schemes in your language — all in simple steps.\n\nMay I know your **name** first?',
    inputType: 'text' as const,
  },
  {
    key: 'age',
    ask: (p: UserProfile) => `Namaste, **${p.name}**! 😊\n\nHow old are you? I'll use this to match age-specific schemes for you.`,
    inputType: 'options' as const,
    options: [
      { label: '🧒 Below 18 years', value: 'below18' },
      { label: '🧑 18 – 35 years', value: '18-35' },
      { label: '👨 36 – 59 years', value: '36-59' },
      { label: '👴 60+ years (Senior Citizen)', value: '60+' },
    ],
  },
  {
    key: 'occupation',
    ask: (_p: UserProfile) => 'What is your main **occupation**?',
    inputType: 'options' as const,
    options: [
      { label: '🌾 Farmer / Agricultural Worker', value: 'farmer' },
      { label: '🏗️ Daily Wage / Labourer', value: 'labour' },
      { label: '🏠 Homemaker', value: 'homemaker' },
      { label: '💼 Self-Employed / Small Business', value: 'selfemployed' },
      { label: '🧑‍🎓 Student', value: 'student' },
      { label: '👴 Retired / Senior Citizen', value: 'retired' },
      { label: '💻 Government / Private Job', value: 'employed' },
    ],
  },
  {
    key: 'income',
    ask: (_p: UserProfile) => 'What is your **annual household income**?\n\nThis helps match income-based schemes and subsidies.',
    inputType: 'options' as const,
    options: [
      { label: '💰 Below ₹1 lakh', value: 'below1' },
      { label: '💰 ₹1 – 2 lakh', value: '1-2' },
      { label: '💰 ₹2 – 5 lakh', value: '2-5' },
      { label: '💰 Above ₹5 lakh', value: 'above5' },
    ],
  },
  {
    key: 'category',
    ask: (_p: UserProfile) => 'Do you belong to any of these **social categories**?\n\nThis helps find reserved-quota schemes and special benefits.',
    inputType: 'options' as const,
    options: [
      { label: '📋 General Category', value: 'general' },
      { label: '📛 SC / ST', value: 'scst' },
      { label: '📄 OBC', value: 'obc' },
      { label: '♿ Divyang / Person with Disability', value: 'divyang' },
      { label: '👩 Woman / Female Head of Household', value: 'woman' },
    ],
  },
  {
    key: 'state',
    ask: (_p: UserProfile) => 'Which **state** do you live in?\n\nSome schemes have state-specific eligibility rules.',
    inputType: 'options' as const,
    options: [
      { label: '🏙️ Maharashtra', value: 'maharashtra' },
      { label: '🌾 Uttar Pradesh', value: 'up' },
      { label: '🌾 Bihar', value: 'bihar' },
      { label: '🏜️ Rajasthan', value: 'rajasthan' },
      { label: '🌿 Madhya Pradesh', value: 'mp' },
      { label: '🏛️ Gujarat', value: 'gujarat' },
      { label: '🌴 Karnataka', value: 'karnataka' },
      { label: '🌊 Tamil Nadu', value: 'tamilnadu' },
      { label: '🐯 West Bengal', value: 'wb' },
      { label: '🗺️ Other State', value: 'other' },
    ],
  },
];

/* ═══════════════════ SCHEME MATCHER ═══════════════════ */
function matchSchemes(profile: UserProfile): MatchedScheme[] {
  return schemes
    .map((scheme) => {
      let score = 0;
      const reasons: string[] = [];
      if (scheme.category === 'Agriculture') {
        if (profile.occupation === 'farmer') { score += 40; reasons.push('You are a farmer — this scheme is designed for you'); }
        else score += 5;
        if (profile.income === 'below1' || profile.income === '1-2') { score += 20; reasons.push('Your income is within the eligibility range'); }
        if (profile.age === '18-35' || profile.age === '36-59') { score += 15; reasons.push('Your age qualifies (18–59 years)'); }
        if (scheme.id === 'pm-kisan' && (profile.income === 'below1' || profile.income === '1-2')) reasons.push('Annual income support available for your profile');
      }
      if (scheme.category === 'Health') {
        if (profile.income === 'below1' || profile.income === '1-2') { score += 35; reasons.push('BPL household qualifies for health coverage'); }
        if (profile.category === 'scst') { score += 20; reasons.push('SC/ST households are given priority'); }
        if (profile.occupation === 'labour' || profile.occupation === 'farmer') { score += 15; reasons.push('Your occupation qualifies for welfare coverage'); }
      }
      if (scheme.category === 'Social Welfare') {
        if (scheme.id === 'old-age-pension' && (profile.age === '60+' || profile.occupation === 'retired')) {
          score += 55; reasons.push('Senior citizens are directly eligible for monthly pension');
        }
        if (scheme.id === 'national-family' && profile.income === 'below1') { score += 35; reasons.push('BPL household is eligible for this family benefit'); }
        if (profile.occupation === 'labour') { score += 15; reasons.push('Daily wage workers are prioritised'); }
      }
      if (profile.income === 'below1') score += 10;
      return { ...scheme, matchPct: Math.min(95, score), reasons: reasons.slice(0, 3) };
    })
    .filter((s) => s.matchPct > 15)
    .sort((a, b) => b.matchPct - a.matchPct)
    .slice(0, 4);
}

/* ═══════════════════ AI BRAIN (follow-up) ═══════════════════ */
function generateAIReply(
  userText: string,
  profile: UserProfile,
  lastSchemes: MatchedScheme[],
): { text: string; payload?: Payload; suggestions: string[]; sources: { label: string; url: string }[] } {
  const lower = userText.toLowerCase();

  const mentionedScheme = lastSchemes.find((s) =>
    lower.includes(s.name.toLowerCase()) ||
    lower.includes(s.id.replace(/-/g, ' ')) ||
    (s.id === 'pm-kisan' && (lower.includes('pm kisan') || lower.includes('kisan'))) ||
    (s.id === 'ayushman-bharat' && (lower.includes('ayushman') || lower.includes('health'))) ||
    (s.id === 'fasal-bima' && (lower.includes('fasal') || lower.includes('bima'))) ||
    (s.id === 'kisan-credit' && (lower.includes('credit') || lower.includes('loan') || lower.includes('kcc'))) ||
    (s.id === 'old-age-pension' && (lower.includes('pension') || lower.includes('old age'))) ||
    (s.id === 'national-family' && (lower.includes('family') || lower.includes('death')))
  ) || lastSchemes[0];

  if (lower.includes('document') || lower.includes('papers') || lower.includes('proof') || lower.includes('what do i need')) {
    const s = mentionedScheme;
    if (!s) return { text: 'Which scheme\'s documents would you like to know? Please mention the scheme name.', suggestions: lastSchemes.map((s) => `Documents for ${s.name}`), sources: defaultSources };
    return { text: `Here are the documents required for **${s.name}**:`, payload: { type: 'doc-list', scheme: s }, suggestions: [`How to apply for ${s.name}?`, 'Find nearest service center', 'Apply online process'], sources: schemeSources[s.category] || defaultSources };
  }

  if (lower.includes('eligible') || lower.includes('qualify') || lower.includes('am i') || lower.includes('can i apply')) {
    const s = mentionedScheme;
    if (!s) return { text: 'Which scheme are you asking about? Please mention the scheme name.', suggestions: lastSchemes.map((s) => `Am I eligible for ${s.name}?`), sources: defaultSources };
    return { text: `**Eligibility check for ${s.name}:**\n\n${s.eligibility.map((e, i) => `${i + 1}. ${e}`).join('\n')}\n\n${s.reasons.length > 0 ? `✅ Your profile matches: ${s.reasons.join(', ')}.` : ''}`, suggestions: [`Documents for ${s.name}`, 'How to apply?', 'Find nearest center'], sources: schemeSources[s.category] || defaultSources };
  }

  if (lower.includes('apply') || lower.includes('process') || lower.includes('steps') || lower.includes('how to') || lower.includes('procedure')) {
    const s = mentionedScheme;
    if (!s) return { text: 'Which scheme would you like to apply for?', suggestions: lastSchemes.map((s) => `How to apply for ${s.name}?`), sources: defaultSources };
    return { text: `**Applying for ${s.name}** — You have two options:\n\n**Option 1 — Online:**\nVisit ${s.officialUrl || 'the official portal'} and complete the online form.\n\n**Option 2 — Visit Nearest Center:**\nCarry all required documents to your nearest CSC center or Block office.\n\nWould you like step-by-step guidance?`, payload: { type: 'scheme-info', scheme: s }, suggestions: [`Documents needed for ${s.name}`, 'Find nearest center', 'Apply online now'], sources: schemeSources[s.category] || defaultSources };
  }

  if (lower.includes('online') || lower.includes('website') || lower.includes('portal')) {
    const s = mentionedScheme;
    return { text: `**Online application for ${s?.name || 'this scheme'}:**\n\n${(s?.onlineSteps || []).slice(0, 4).map((step, i) => `${i + 1}. **${step.title}** — ${step.description}`).join('\n')}\n\n👉 Portal: ${s?.officialUrl || 'myscheme.gov.in'}`, suggestions: [`Open ${s?.name} detail page`, 'Documents needed', 'Find nearest center instead'], sources: schemeSources[s?.category || ''] || defaultSources };
  }

  if (lower.includes('center') || lower.includes('centre') || lower.includes('nearest') || lower.includes('csc') || lower.includes('office') || lower.includes('where')) {
    return { text: `**Finding your nearest service center:**\n\n1. Tap **"View & Apply"** on any scheme card and choose *"Visit Nearest Center"*\n2. Or open the **Service Center Finder** page for a full map view\n\nCommon centers include:\n- Common Service Centres (CSC)\n- Block Development Offices\n- Partner Bank Branches`, suggestions: ['Open Service Center Finder', 'Apply at a CSC center', 'Show my schemes again'], sources: [{ label: 'CSC Digital India', url: 'https://csc.gov.in' }] };
  }

  if (lower.includes('benefit') || lower.includes('money') || lower.includes('amount') || lower.includes('₹') || lower.includes('receive')) {
    return { text: `**Benefits you may receive:**\n\n${lastSchemes.map((s) => `- **${s.name}:** ${s.benefit}`).join('\n')}\n\nAll benefits are transferred directly to your bank account via DBT (Direct Benefit Transfer).`, suggestions: ['How to apply?', 'Documents needed', 'Check eligibility'], sources: [{ label: 'DBT Bharat Portal', url: 'https://dbtbharat.gov.in' }] };
  }

  if (lower.includes('show') || lower.includes('again') || lower.includes('list') || lower.includes('schemes')) {
    return { text: `Here are your top matching schemes based on your profile 👇`, payload: { type: 'schemes', schemes: lastSchemes }, suggestions: ['Documents needed?', 'How to apply?', 'Tell me about PM-KISAN'], sources: defaultSources };
  }

  if (lower.includes('thank') || lower.includes('thanks') || lower.includes('shukriya') || lower.includes('dhanyawaad')) {
    return { text: `You're most welcome, **${profile.name || 'friend'}**! 🙏\n\nI'm always here to help you navigate government schemes. Feel free to ask anything about:\n- 📄 Documents required\n- ✅ Eligibility check\n- 🚀 How to apply\n- 🏢 Nearest service centers`, suggestions: ['Show my schemes', 'Find nearest center', 'How to apply online?'], sources: defaultSources };
  }

  if (lower.includes('kisan') || lower.includes('pm kisan')) {
    const s = schemes.find((x) => x.id === 'pm-kisan');
    if (s) return { text: `**${s.name}**\n\n${s.description}\n\n- **Benefit:** ${s.benefit}\n- **Deadline:** ${s.deadline}\n\nYou receive ₹2,000 every 4 months (3 installments/year) directly in your bank account.`, suggestions: ['Documents for PM-KISAN', 'How to apply for PM-KISAN?', 'Am I eligible for PM-KISAN?'], sources: schemeSources['Agriculture'] };
  }

  if (lower.includes('ayushman') || lower.includes('health insurance')) {
    const s = schemes.find((x) => x.id === 'ayushman-bharat');
    if (s) return { text: `**${s.name}**\n\n${s.description}\n\n- **Benefit:** ${s.benefit}\n- Covers 1,500+ medical procedures\n- Completely **cashless** at empanelled hospitals`, suggestions: ['Documents for Ayushman Bharat', 'How to apply?', 'Find empanelled hospitals'], sources: schemeSources['Health'] };
  }

  if (lower.includes('pension')) {
    const s = schemes.find((x) => x.id === 'old-age-pension');
    if (s) return { text: `**${s.name}**\n\n${s.description}\n\n- **Benefit:** ${s.benefit}\n- Credited **monthly** to your bank account`, suggestions: ['Documents for Pension', 'How to apply for pension?', 'Eligibility check'], sources: schemeSources['Social Welfare'] };
  }

  const topScheme = lastSchemes[0];
  return {
    text: `I'm here to help! 😊 You can ask me about:\n\n- 📄 **Documents required** for any scheme\n- ✅ **Eligibility** — are you qualified?\n- 🚀 **How to apply** (online or at center)\n- 💰 **Benefits** you'll receive\n- 🏢 **Nearest service centers**\n\n${topScheme ? `You can also tap **"View & Apply"** on **${topScheme.name}** to start your application.` : ''}`,
    suggestions: topScheme
      ? [`Documents for ${topScheme.name}`, 'How to apply?', 'Find nearest center', 'Show schemes again']
      : ['Show my schemes', 'How to apply?', 'Find nearest center'],
    sources: defaultSources,
  };
}

/* ═══════════════════ HELPERS ═══════════════════ */
function uid() { return Math.random().toString(36).slice(2); }

/* ═══════════════════ MARKDOWN RENDERER ═══════════════════ */
function MarkdownRenderer({ text }: { text: string }) {
  const lines = text.split('\n');
  const elements: React.ReactNode[] = [];
  let listItems: React.ReactNode[] = [];
  let listType: 'ul' | 'ol' | null = null;

  function flushList() {
    if (listItems.length > 0) {
      if (listType === 'ul') {
        elements.push(<ul key={`ul-${elements.length}`} className="mt-1 mb-2 pl-4 space-y-1 list-none">{listItems}</ul>);
      } else {
        elements.push(<ol key={`ol-${elements.length}`} className="mt-1 mb-2 pl-4 space-y-1 list-decimal">{listItems}</ol>);
      }
      listItems = [];
      listType = null;
    }
  }

  function parseBold(str: string): React.ReactNode {
    const parts = str.split(/\*\*(.*?)\*\*/g);
    return parts.map((part, i) => i % 2 === 1 ? <strong key={i} className="text-indigo-900" style={{ fontWeight: 700 }}>{part}</strong> : part);
  }

  lines.forEach((line, idx) => {
    const trimmed = line.trim();

    if (!trimmed) {
      flushList();
      elements.push(<div key={`gap-${idx}`} className="h-1.5" />);
      return;
    }
    if (trimmed.startsWith('# ')) {
      flushList();
      elements.push(<h3 key={idx} className="text-sm mt-2 mb-1" style={{ color: C.indigo, fontWeight: 700 }}>{parseBold(trimmed.slice(2))}</h3>);
      return;
    }
    if (trimmed.startsWith('## ')) {
      flushList();
      elements.push(<h4 key={idx} className="text-xs mt-2 mb-0.5 uppercase tracking-wide" style={{ color: C.green, fontWeight: 700 }}>{parseBold(trimmed.slice(3))}</h4>);
      return;
    }
    if (trimmed.startsWith('- ') || trimmed.startsWith('• ')) {
      if (listType !== 'ul') { flushList(); listType = 'ul'; }
      listItems.push(
        <li key={idx} className="flex items-start gap-2 text-sm" style={{ color: '#374151', lineHeight: 1.65 }}>
          <span className="mt-1.5 w-1.5 h-1.5 rounded-full shrink-0" style={{ backgroundColor: C.green }} />
          <span>{parseBold(trimmed.slice(2))}</span>
        </li>
      );
      return;
    }
    const olMatch = trimmed.match(/^(\d+)\.\s(.+)/);
    if (olMatch) {
      if (listType !== 'ol') { flushList(); listType = 'ol'; }
      listItems.push(
        <li key={idx} className="flex items-start gap-2 text-sm" style={{ color: '#374151', lineHeight: 1.65 }}>
          <span className="shrink-0 w-5 h-5 rounded-full flex items-center justify-center text-xs text-white mt-0.5" style={{ backgroundColor: C.indigoMid, fontWeight: 700, fontSize: '10px' }}>{olMatch[1]}</span>
          <span>{parseBold(olMatch[2])}</span>
        </li>
      );
      return;
    }
    flushList();
    elements.push(<p key={idx} className="text-sm" style={{ color: '#374151', lineHeight: 1.65 }}>{parseBold(trimmed)}</p>);
  });
  flushList();
  return <div className="space-y-0.5">{elements}</div>;
}

/* ═══════════════════ WAVEFORM ANIMATION ═══════════════════ */
function Waveform() {
  const bars = [0.4, 0.8, 1, 0.7, 0.5, 0.9, 0.6];
  return (
    <div className="flex items-center gap-[3px]" aria-hidden="true">
      {bars.map((h, i) => (
        <motion.span
          key={i}
          className="rounded-full"
          style={{ width: 3, backgroundColor: 'white' }}
          animate={{ height: [6, 6 + h * 16, 6] }}
          transition={{ duration: 0.5 + h * 0.3, repeat: Infinity, delay: i * 0.08, ease: 'easeInOut' }}
        />
      ))}
    </div>
  );
}

/* ═══════════════════ TYPING INDICATOR ═══════════════════ */
function TypingDots() {
  return (
    <div className="flex items-center gap-1.5 px-4 py-3" role="status" aria-label="Sahayak AI is typing">
      {[0, 1, 2].map((i) => (
        <motion.div key={i} className="w-2 h-2 rounded-full" style={{ backgroundColor: C.green }}
          animate={{ y: [0, -6, 0], opacity: [0.5, 1, 0.5] }} transition={{ duration: 0.7, repeat: Infinity, delay: i * 0.18 }} />
      ))}
    </div>
  );
}

/* ═══════════════════ SOURCES FOOTER ═══════════════════ */
function SourcesCitation({ sources }: { sources: { label: string; url: string }[] }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="mt-2">
      <button onClick={() => setOpen((o) => !o)}
        className="flex items-center gap-1.5 text-xs transition-colors"
        style={{ color: open ? C.green : '#9ca3af' }}
        aria-expanded={open}
        aria-label="Toggle sources">
        <BookOpen size={11} />
        <span>Sources</span>
        <motion.span animate={{ rotate: open ? 180 : 0 }} transition={{ duration: 0.2 }}>
          <ChevronDown size={11} />
        </motion.span>
      </button>
      <AnimatePresence>
        {open && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.2 }}
            className="overflow-hidden mt-1.5"
            role="region" aria-label="Sources and citations">
            <ul className="space-y-1">
              {sources.map((src, i) => (
                <li key={i} className="flex items-center gap-1.5">
                  <span className="w-1 h-1 rounded-full shrink-0" style={{ backgroundColor: C.green }} />
                  <a href={src.url} target="_blank" rel="noopener noreferrer"
                    className="text-xs hover:underline flex items-center gap-1"
                    style={{ color: C.indigoMid }}>
                    {src.label} <ExternalLink size={9} />
                  </a>
                </li>
              ))}
            </ul>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/* ═══════════════════ DOC LIST PAYLOAD ═══════════════════ */
function DocListPayload({ scheme }: { scheme: MatchedScheme }) {
  const requiredDocs = scheme.documents.filter(doc => !doc.optional);
  
  return (
    <section aria-label={`Required documents for ${scheme.name}`} className="mt-2 bg-white rounded-2xl border overflow-hidden shadow-sm" style={{ borderColor: C.aiBubbleBorder }}>
      <header className="px-4 py-2.5 flex items-center gap-2 border-b" style={{ background: scheme.color + '0d', borderColor: C.aiBubbleBorder }}>
        <span className="text-base" aria-hidden="true">{scheme.icon}</span>
        <span className="text-xs" style={{ color: scheme.color, fontWeight: 600 }}>{scheme.name} — Required Documents</span>
      </header>
      <ul className="p-3 space-y-2.5" role="list">
        {requiredDocs.map((doc, i) => (
          <li key={i} className="flex gap-2.5 p-2.5 rounded-xl" style={{ backgroundColor: '#f9fafb', border: '1px solid #f3f4f6' }}>
            <div className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0" style={{ backgroundColor: scheme.color + '18' }}>
              <FileText size={13} style={{ color: scheme.color }} aria-hidden="true" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1.5 flex-wrap mb-0.5">
                <span className="text-xs" style={{ fontWeight: 600, color: '#111827' }}>{doc.name}</span>
                <span className="text-xs px-1.5 py-0.5 rounded-full bg-red-50 text-red-600"
                  aria-label="Required document">
                  Required
                </span>
              </div>
              <p className="text-xs leading-relaxed" style={{ color: '#6b7280' }}>{doc.info}</p>
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}

/* ═══════════════════ SCHEME INFO PAYLOAD ═══════════════════ */
function SchemeInfoPayload({ scheme }: { scheme: MatchedScheme }) {
  const navigate = useNavigate();
  return (
    <div className="mt-2 bg-white rounded-2xl border shadow-sm overflow-hidden" style={{ borderColor: C.aiBubbleBorder }}>
      <div className="flex gap-2 p-3">
        <button onClick={() => navigate(`/scheme/${scheme.id}`)}
          className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs text-white" style={{ backgroundColor: C.indigoMid }}
          aria-label={`Apply online for ${scheme.name}`}>
          <Globe size={12} aria-hidden="true" /> Apply Online
        </button>
        <button onClick={() => navigate(`/scheme/${scheme.id}`)}
          className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs border-2" style={{ borderColor: C.green, color: C.green }}
          aria-label={`Find nearest center for ${scheme.name}`}>
          <MapPin size={12} aria-hidden="true" /> Visit Center
        </button>
      </div>
      {scheme.officialUrl && (
        <div className="px-3 pb-3">
          <a href={scheme.officialUrl} target="_blank" rel="noopener noreferrer"
            className="flex items-center gap-1.5 text-xs hover:underline" style={{ color: C.indigoMid }}
            aria-label={`Open official portal for ${scheme.name}`}>
            <ExternalLink size={11} aria-hidden="true" /> {scheme.officialUrl}
          </a>
        </div>
      )}
    </div>
  );
}

/* ═══════════════════ SCHEME CARD ═══════════════════ */
function SchemeCard({ scheme, rank }: { scheme: MatchedScheme; rank: number }) {
  const navigate = useNavigate();
  const img = schemeImages[scheme.category];

  return (
    <motion.article
      initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
      transition={{ delay: rank * 0.1 }}
      className="bg-white rounded-2xl shadow-sm overflow-hidden"
      style={{ border: `1.5px solid ${C.aiBubbleBorder}` }}
      aria-label={`Scheme: ${scheme.name}, ${scheme.matchPct}% match`}>

      {/* Image banner */}
      {img && (
        <div className="relative h-20 overflow-hidden">
          <img src={img} alt={`${scheme.category} scheme`} className="w-full h-full object-cover" />
          <div className="absolute inset-0 flex items-center px-4 gap-3"
            style={{ background: `linear-gradient(90deg, ${scheme.color}e0 0%, ${scheme.color}80 60%, transparent 100%)` }}>
            <span className="text-2xl drop-shadow" aria-hidden="true">{scheme.icon}</span>
            <div>
              <p className="text-sm text-white leading-tight" style={{ fontWeight: 700, textShadow: '0 1px 2px rgba(0,0,0,0.3)' }}>{scheme.name}</p>
              <div className="flex items-center gap-1 mt-0.5">
                <Star size={10} className="fill-yellow-300 text-yellow-300" aria-hidden="true" />
                <span className="text-xs text-white/90">{scheme.matchPct}% match for your profile</span>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="p-3.5">
        {/* Match bar */}
        <div className="flex items-center gap-2 mb-2.5" role="progressbar" aria-valuenow={scheme.matchPct} aria-valuemin={0} aria-valuemax={100} aria-label={`${scheme.matchPct}% eligibility match`}>
          <div className="flex-1 h-1.5 rounded-full overflow-hidden" style={{ backgroundColor: '#e0e7ff' }}>
            <div className="h-full rounded-full" style={{ width: `${scheme.matchPct}%`, backgroundColor: scheme.color }} />
          </div>
          <span className="text-xs shrink-0" style={{ color: scheme.color, fontWeight: 600 }}>{scheme.matchPct}%</span>
        </div>

        {/* Benefit chip */}
        <div className="text-xs px-2.5 py-1.5 rounded-lg mb-2.5" style={{ backgroundColor: scheme.color + '12', color: scheme.color, fontWeight: 600 }}>
          💰 {scheme.benefit}
        </div>

        {/* Why you qualify */}
        {scheme.reasons.length > 0 && (
          <ul className="space-y-1 mb-3" aria-label="Why you qualify">
            {scheme.reasons.slice(0, 2).map((r, i) => (
              <li key={i} className="flex items-start gap-1.5">
                <CheckCircle size={10} className="shrink-0 mt-0.5" style={{ color: C.green }} aria-hidden="true" />
                <span className="text-xs" style={{ color: '#4b5563', lineHeight: 1.6 }}>{r}</span>
              </li>
            ))}
          </ul>
        )}

        {/* Action buttons */}
        <div className="flex gap-2">
          <button onClick={() => navigate(`/scheme/${scheme.id}`)}
            className="flex-1 flex items-center justify-center gap-1 py-2 rounded-xl text-xs transition-all hover:opacity-90"
            style={{ border: `1.5px solid ${scheme.color}60`, color: scheme.color, fontWeight: 600 }}
            aria-label={`View required documents for ${scheme.name}`}>
            <FileText size={11} aria-hidden="true" /> Documents
          </button>
          <button onClick={() => navigate(`/scheme/${scheme.id}`)}
            className="flex-1 flex items-center justify-center gap-1 py-2 rounded-xl text-xs text-white transition-all hover:opacity-90"
            style={{ backgroundColor: scheme.color, fontWeight: 600 }}
            aria-label={`View and apply for ${scheme.name}`}>
            View & Apply <ChevronRight size={11} aria-hidden="true" />
          </button>
        </div>
      </div>
    </motion.article>
  );
}

/* ═══════════════════ AI AVATAR ═══════════════════ */
function AIAvatar() {
  return (
    <div className="w-8 h-8 rounded-full flex items-center justify-center shrink-0 shadow-md"
      style={{ background: `linear-gradient(135deg, ${C.indigo}, ${C.green})` }}
      role="img" aria-label="Sahayak AI">
      <Sparkles size={15} className="text-white" aria-hidden="true" />
    </div>
  );
}

/* ═══════════════════ USER AVATAR ═══════════════════ */
function UserAvatar() {
  return (
    <div className="w-8 h-8 rounded-full flex items-center justify-center shrink-0"
      style={{ background: '#e0e7ff', border: `2px solid ${C.indigoMid}30` }}
      role="img" aria-label="You">
      <User size={15} style={{ color: C.indigoMid }} aria-hidden="true" />
    </div>
  );
}

/* ═══════════════════ MAIN CHAT PAGE ═══════════════════ */
export default function ChatPage() {
  const navigate = useNavigate();
  const [profile, setProfile] = useState<UserProfile>({});
  const [qIndex, setQIndex] = useState(0);
  const [profileDone, setProfileDone] = useState(false);
  const [matchedSchemes, setMatchedSchemes] = useState<MatchedScheme[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [listening, setListening] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const initialized = useRef(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const msgAreaRef = useRef<HTMLDivElement>(null);

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages, isTyping]);

  /* Boot */
  useEffect(() => {
    if (initialized.current) return;
    initialized.current = true;
    setIsTyping(true);
    setTimeout(() => {
      setIsTyping(false);
      const q = QUESTIONS[0];
      setMessages([{ id: uid(), role: 'ai', text: q.ask({}) }]);
    }, 700);
  }, []);

  const addAI = useCallback((text: string, payload?: Payload, newSuggestions?: string[], sources?: { label: string; url: string }[], delay = 950) => {
    setIsTyping(true);
    setTimeout(() => {
      setIsTyping(false);
      setMessages((prev) => [...prev, { id: uid(), role: 'ai', text, payload, sources }]);
      if (newSuggestions) setSuggestions(newSuggestions);
    }, delay);
  }, []);

  const handleProfileAnswer = useCallback((answer: string, label?: string) => {
    setMessages((prev) => [...prev, { id: uid(), role: 'user', text: label || answer }]);
    const q = QUESTIONS[qIndex];
    const updated: UserProfile = { ...profile, [q.key]: answer };
    setProfile(updated);
    const next = qIndex + 1;

    if (next < QUESTIONS.length) {
      setQIndex(next);
      const nq = QUESTIONS[next];
      addAI(
        nq.ask(updated),
        nq.inputType === 'options' ? { type: 'options', options: nq.options! } : undefined,
        undefined, undefined, 850,
      );
    } else {
      setProfileDone(true);
      const matched = matchSchemes(updated);
      setMatchedSchemes(matched);
      addAI(
        `**Great news, ${updated.name}!** 🎉\n\nBased on your profile, I found **${matched.length} government schemes** you may be eligible for.\n\nTap any scheme card to view documents and apply. You can also keep asking me anything!`,
        { type: 'schemes', schemes: matched },
        [
          `📄 Documents for ${matched[0]?.name || 'top scheme'}`,
          '✅ Am I eligible?',
          '🌐 How to apply online?',
          '🏢 Find nearest center',
          '💰 What benefits do I get?',
        ],
        defaultSources,
        1200,
      );
    }
  }, [profile, qIndex, addAI]);

  const handleFollowUp = useCallback((text: string) => {
    setMessages((prev) => [...prev, { id: uid(), role: 'user', text }]);
    setSuggestions([]);
    setIsTyping(true);
    setTimeout(() => {
      setIsTyping(false);
      const reply = generateAIReply(text, profile, matchedSchemes);
      setMessages((prev) => [...prev, {
        id: uid(), role: 'ai',
        text: reply.text,
        payload: reply.payload,
        sources: reply.sources,
      }]);
      if (reply.suggestions?.length) setSuggestions(reply.suggestions);
    }, 950);
  }, [profile, matchedSchemes]);

  const handleSend = useCallback((text?: string) => {
    const msg = (text ?? input).trim();
    if (!msg) return;
    setInput('');
    if (!profileDone) {
      const q = QUESTIONS[qIndex];
      if (q.inputType === 'text') handleProfileAnswer(msg);
      else handleFollowUp(msg);
    } else {
      handleFollowUp(msg);
    }
    setTimeout(() => inputRef.current?.focus(), 100);
  }, [input, profileDone, qIndex, handleProfileAnswer, handleFollowUp]);

  const currentQ = !profileDone ? QUESTIONS[qIndex] : null;
  const lastOptionsId = messages.filter((m) => m.role === 'ai' && m.payload?.type === 'options').slice(-1)[0]?.id;

  return (
    <main
      className="flex flex-col"
      style={{ height: 'calc(100dvh - 4rem)', background: C.bg }}
      aria-label="Sahayak AI Chat"
    >
      <div className="max-w-2xl mx-auto w-full flex flex-col h-full px-3 pt-3 pb-0">

        {/* ── HEADER ── */}
        <header className="flex items-center gap-3 mb-3 shrink-0">
          <button onClick={() => navigate('/home')}
            className="p-2 rounded-xl hover:bg-white/70 transition-all text-gray-500"
            aria-label="Go back to Home">
            <ArrowLeft size={17} aria-hidden="true" />
          </button>

          {/* AI Identity */}
          <div className="flex items-center gap-2.5">
            <div className="relative">
              <div className="w-10 h-10 rounded-full flex items-center justify-center shadow-md"
                style={{ background: `linear-gradient(135deg, ${C.indigo}, ${C.green})` }}>
                <Sparkles size={18} className="text-white" aria-hidden="true" />
              </div>
              <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full border-2 border-white animate-pulse" style={{ backgroundColor: '#22c55e' }} />
            </div>
            <div>
              <p className="text-sm" style={{ color: C.indigo, fontWeight: 700, lineHeight: 1.3 }}>Sahayak AI</p>
              <p className="text-xs" style={{ color: '#6b7280', lineHeight: 1.3 }}>Government Scheme Assistant · Online</p>
            </div>
          </div>

          {/* Profile progress */}
          {!profileDone ? (
            <div className="ml-auto flex items-center gap-2" aria-label={`Profile completion: ${qIndex} of ${QUESTIONS.length} questions`}>
              <div className="flex gap-1" aria-hidden="true">
                {QUESTIONS.map((_, i) => (
                  <div key={i} className="h-1.5 rounded-full transition-all duration-300"
                    style={{ width: i < qIndex ? 12 : i === qIndex ? 16 : 8, backgroundColor: i < qIndex ? C.green : i === qIndex ? C.indigoMid : '#d1d5db' }} />
                ))}
              </div>
              <span className="text-xs" style={{ color: '#9ca3af' }}>{qIndex}/{QUESTIONS.length}</span>
            </div>
          ) : (
            <nav className="ml-auto flex gap-2" aria-label="Quick navigation">
              <button onClick={() => navigate('/explore')}
                className="text-xs px-3 py-1.5 rounded-lg transition-colors"
                style={{ color: C.indigoMid, border: `1.5px solid ${C.indigoMid}40`, backgroundColor: '#eef2ff' }}>
                📋 All Schemes
              </button>
            </nav>
          )}
        </header>

        {/* ── CHAT AREA ── */}
        <div className="flex-1 bg-white/80 rounded-2xl shadow-sm flex flex-col overflow-hidden"
          style={{ backdropFilter: 'blur(12px)', border: `1.5px solid ${C.aiBubbleBorder}` }}>

          {/* Messages scroll area */}
          <div ref={msgAreaRef}
            className="flex-1 overflow-y-auto px-3 py-4 space-y-5"
            role="log" aria-live="polite" aria-label="Conversation">
            <AnimatePresence initial={false}>
              {messages.map((msg) => (
                <motion.div key={msg.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.22 }}
                  className={`flex gap-2.5 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>

                  {msg.role === 'ai' && <AIAvatar />}

                  <div className={`flex flex-col gap-1.5 ${msg.role === 'user' ? 'items-end' : 'items-start'} max-w-[88%]`}>
                    {/* Text bubble */}
                    {msg.text && (
                      msg.role === 'ai' ? (
                        <div className="rounded-2xl rounded-tl-sm px-4 py-3 shadow-sm"
                          style={{ backgroundColor: C.aiBubbleBg, border: `1px solid ${C.aiBubbleBorder}`, borderLeft: `3px solid ${C.aiBubbleAccent}` }}>
                          <MarkdownRenderer text={msg.text} />
                          {msg.sources && msg.sources.length > 0 && <SourcesCitation sources={msg.sources} />}
                        </div>
                      ) : (
                        <div className="rounded-2xl rounded-tr-sm px-4 py-3 shadow-sm"
                          style={{ backgroundColor: C.userBubble }}>
                          <p className="text-sm text-white" style={{ lineHeight: 1.65 }}>{msg.text}</p>
                        </div>
                      )
                    )}

                    {/* Option buttons — only show for last AI options message */}
                    {msg.payload?.type === 'options' && msg.id === lastOptionsId && (
                      <div className="flex flex-wrap gap-2 mt-1 max-w-sm" role="group"
                        aria-label={`Choose an option: ${(msg.payload as any).options.map((o: Option) => o.label).join(', ')}`}>
                        {(msg.payload as { type: 'options'; options: Option[] }).options.map((opt) => (
                          <motion.button key={opt.value}
                            whileHover={{ scale: 1.02, y: -1 }} whileTap={{ scale: 0.97 }}
                            onClick={() => handleProfileAnswer(opt.value, opt.label)}
                            className="px-3 py-2 rounded-xl text-xs text-left transition-all shadow-sm"
                            style={{ background: 'white', border: `1.5px solid ${C.chipBorder}`, color: C.chipText, fontWeight: 600 }}>
                            {opt.label}
                          </motion.button>
                        ))}
                      </div>
                    )}

                    {/* Scheme cards */}
                    {msg.payload?.type === 'schemes' && (
                      <div className="w-full space-y-3 mt-1">
                        <div className="flex items-center gap-2">
                          <span className="text-xs px-2.5 py-1 rounded-full"
                            style={{ backgroundColor: C.greenLight, color: C.green, border: `1px solid ${C.greenBorder}`, fontWeight: 600 }}>
                            🎯 {(msg.payload as any).schemes.length} matching schemes found
                          </span>
                        </div>
                        {(msg.payload as { type: 'schemes'; schemes: MatchedScheme[] }).schemes.map((s, i) => (
                          <SchemeCard key={s.id} scheme={s} rank={i} />
                        ))}
                      </div>
                    )}

                    {/* Doc list */}
                    {msg.payload?.type === 'doc-list' && (
                      <DocListPayload scheme={(msg.payload as any).scheme} />
                    )}

                    {/* Scheme info */}
                    {msg.payload?.type === 'scheme-info' && (
                      <SchemeInfoPayload scheme={(msg.payload as any).scheme} />
                    )}
                  </div>

                  {msg.role === 'user' && <UserAvatar />}
                </motion.div>
              ))}
            </AnimatePresence>

            {/* Typing indicator */}
            {isTyping && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex gap-2.5">
                <AIAvatar />
                <div className="rounded-2xl rounded-tl-sm shadow-sm"
                  style={{ backgroundColor: C.aiBubbleBg, border: `1px solid ${C.aiBubbleBorder}`, borderLeft: `3px solid ${C.aiBubbleAccent}` }}>
                  <TypingDots />
                </div>
              </motion.div>
            )}
            <div ref={bottomRef} />
          </div>

          {/* ── SUGGESTION CHIPS ── */}
          <AnimatePresence>
            {suggestions.length > 0 && !isTyping && (
              <motion.div initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 4 }} transition={{ duration: 0.2 }}
                className="px-3 pt-2 pb-1 flex gap-2 overflow-x-auto"
                style={{ borderTop: `1px solid ${C.aiBubbleBorder}`, scrollbarWidth: 'none' }}
                role="group" aria-label="Quick suggestions">
                {suggestions.map((s) => (
                  <button key={s} onClick={() => handleSend(s)}
                    className="shrink-0 text-xs px-3 py-1.5 rounded-full transition-colors whitespace-nowrap"
                    style={{ backgroundColor: C.chipBg, color: C.chipText, border: `1px solid ${C.chipBorder}`, fontWeight: 500 }}>
                    {s}
                  </button>
                ))}
              </motion.div>
            )}
          </AnimatePresence>

          {/* ── INPUT BAR ── */}
          <div className="shrink-0 px-3 py-3" style={{ borderTop: `1px solid ${C.aiBubbleBorder}` }}>
            <div className="flex gap-2.5 items-center">

              {/* ── LARGE MIC BUTTON ── */}
              <motion.button
                onClick={() => setListening((l) => !l)}
                whileTap={{ scale: 0.9 }}
                className="shrink-0 flex items-center justify-center rounded-full shadow-lg transition-all"
                style={{
                  width: listening ? 56 : 44,
                  height: listening ? 56 : 44,
                  background: listening
                    ? 'linear-gradient(135deg, #dc2626, #ef4444)'
                    : `linear-gradient(135deg, ${C.green}, #16a34a)`,
                  boxShadow: listening ? '0 0 0 6px rgba(220,38,38,0.2)' : '0 4px 12px rgba(21,128,61,0.35)',
                }}
                aria-label={listening ? 'Stop voice input — microphone active' : 'Start voice input — tap to speak'}
                aria-pressed={listening}>
                {listening ? (
                  <Waveform />
                ) : (
                  <Mic size={18} className="text-white" aria-hidden="true" />
                )}
              </motion.button>

              {/* Text input */}
              <input
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && handleSend()}
                placeholder={
                  !profileDone && currentQ?.inputType === 'text'
                    ? 'Type your name...'
                    : profileDone
                    ? 'Ask me anything about schemes, eligibility, documents...'
                    : 'Or type your answer here...'
                }
                className="flex-1 px-4 py-2.5 rounded-xl text-sm placeholder-gray-400 focus:outline-none transition-all"
                style={{
                  backgroundColor: '#f8f9ff',
                  border: `1.5px solid ${C.chipBorder}`,
                  color: '#1a1a2e',
                  lineHeight: 1.6,
                  fontFamily: "'Plus Jakarta Sans', sans-serif",
                }}
                aria-label="Type your message"
                autoComplete="off"
              />

              {/* Send button */}
              <motion.button
                onClick={() => handleSend()}
                disabled={!input.trim()}
                whileHover={input.trim() ? { scale: 1.05 } : {}}
                whileTap={input.trim() ? { scale: 0.95 } : {}}
                className="shrink-0 w-11 h-11 rounded-xl flex items-center justify-center transition-all"
                style={{
                  background: input.trim() ? `linear-gradient(135deg, ${C.indigoMid}, ${C.indigo})` : '#e5e7eb',
                  boxShadow: input.trim() ? '0 4px 12px rgba(67,56,202,0.35)' : 'none',
                }}
                aria-label="Send message">
                <Send size={16} className={input.trim() ? 'text-white' : 'text-gray-400'} aria-hidden="true" />
              </motion.button>
            </div>

            {profileDone && (
              <p className="text-center text-xs mt-2" style={{ color: '#9ca3af' }}>
                AI-assisted guidance · verify eligibility at official portals
              </p>
            )}
          </div>
        </div>
        <div className="h-3 shrink-0" />
      </div>
    </main>
  );
}
