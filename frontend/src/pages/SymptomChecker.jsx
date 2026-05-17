import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { checkSymptoms } from '../services/api';
import toast from 'react-hot-toast';
import {
  Stethoscope, AlertCircle, CheckCircle2, ArrowRight,
  Activity, ShieldAlert, Clock, ClipboardList, Info,
  Hospital, RotateCcw,
} from 'lucide-react';

const URGENCY_CONFIG = {
  Emergency: { color: 'text-red-600 dark:text-red-400', bg: 'bg-red-100 dark:bg-red-900/30', border: 'border-red-400', dot: 'bg-red-500', label: '🚨 Emergency' },
  Urgent: { color: 'text-orange-600 dark:text-orange-400', bg: 'bg-orange-100 dark:bg-orange-900/30', border: 'border-orange-400', dot: 'bg-orange-500', label: '⚠️ Urgent' },
  Soon: { color: 'text-amber-600 dark:text-amber-400', bg: 'bg-amber-100 dark:bg-amber-900/30', border: 'border-amber-400', dot: 'bg-amber-500', label: '📋 See Doctor Soon' },
  Routine: { color: 'text-green-600 dark:text-green-400', bg: 'bg-green-100 dark:bg-green-900/30', border: 'border-green-400', dot: 'bg-green-500', label: '✅ Routine' },
};

const EXAMPLE_SYMPTOMS = [
  'I have a high fever (103°F) with severe headache and stiff neck for 2 days',
  'Persistent dry cough, mild chest tightness, and shortness of breath for a week',
  'Sudden sharp chest pain radiating to left arm, sweating, nausea',
  'Red itchy rash on arm after using new detergent, no fever',
  'Blurry vision in right eye that started yesterday, no pain',
  'Lower back pain for 3 days after lifting heavy boxes',
];

export default function SymptomChecker() {
  const navigate = useNavigate();
  const [symptoms, setSymptoms] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const charLeft = 1000 - symptoms.length;

  const check = async () => {
    if (!symptoms.trim()) { toast.error('Please describe your symptoms.'); return; }
    setLoading(true); setResult(null); setError(null);
    try {
      const data = await checkSymptoms(symptoms);
      setResult(data);
      toast.success('Symptom analysis complete!');
    } catch (err) {
      const msg = err?.response?.data?.error || 'Failed to check symptoms. Is the backend running?';
      setError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  const urgency = result ? (URGENCY_CONFIG[result.urgency] || URGENCY_CONFIG.Routine) : null;
  const specialist = result?.recommended_specialist || result?.specialist;
  const nextSteps = result?.next_steps || result?.self_care_tips || [];

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 pt-24 pb-16 px-4">
      <div className="max-w-5xl mx-auto">

        {/* Header */}
        <div className="text-center mb-12 animate-fade-in">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-accent-100 dark:bg-accent-900/30 text-accent-600 dark:text-accent-400 text-sm font-semibold mb-4">
            <Stethoscope className="w-4 h-4" /> AI Symptom Checker
          </div>
          <h1 className="text-4xl md:text-5xl font-black text-slate-900 dark:text-white mb-4">
            Describe Your <span className="text-gradient">Symptoms</span>
          </h1>
          <p className="text-lg text-slate-500 dark:text-slate-400 max-w-2xl mx-auto">
            Our AI analyses your symptoms, estimates urgency, identifies possible conditions,
            and tells you what to do next — all in seconds.
          </p>
          {/* Medical-only warning */}
          <div className="mt-6 inline-block bg-amber-50 dark:bg-amber-950/40 border border-amber-300 dark:border-amber-600 rounded-lg px-4 py-2.5 max-w-2xl mx-auto">
            <p className="text-sm font-semibold text-amber-800 dark:text-amber-200">⚕️ Medical Queries Only</p>
            <p className="text-xs text-amber-700 dark:text-amber-300 mt-0.5">This tool only analyzes health and medical symptoms. Non-medical questions will be rejected.</p>
          </div>
        </div>

        <div className="grid lg:grid-cols-5 gap-8">

          {/* Input Panel (3 cols) */}
          <div className="lg:col-span-3 space-y-5">

            {/* Symptom input */}
            <div className="card p-6 animate-slide-up space-y-4">
              <h2 className="font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <ClipboardList className="w-5 h-5 text-accent-500" /> Describe your symptoms
              </h2>
              <div className="relative">
                <textarea
                  id="symptom-input"
                  value={symptoms}
                  onChange={e => setSymptoms(e.target.value.slice(0, 1000))}
                  placeholder="e.g. I have had a high fever (102°F) with a severe headache and stiff neck for the past 2 days. I also feel nauseated..."
                  rows={6}
                  className="w-full px-4 py-3 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-slate-200 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-accent-400 transition-all resize-none"
                />
                <span className={`absolute bottom-3 right-3 text-xs ${charLeft < 100 ? 'text-amber-500' : 'text-slate-400'}`}>
                  {charLeft} chars left
                </span>
              </div>

              <button
                id="check-symptoms-btn"
                onClick={check}
                disabled={!symptoms.trim() || loading}
                className={`w-full flex items-center justify-center gap-3 py-4 rounded-xl font-bold text-base transition-all duration-200 ${!symptoms.trim() || loading
                    ? 'bg-slate-200 dark:bg-slate-700 text-slate-400 cursor-not-allowed'
                    : 'bg-gradient-to-r from-accent-500 to-accent-600 text-white hover:from-accent-600 hover:to-accent-700 shadow-lg hover:shadow-accent-500/30'
                  }`}
              >
                {loading ? (
                  <><div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Analysing Symptoms…</>
                ) : (
                  <><Activity className="w-5 h-5" /> Check Symptoms</>
                )}
              </button>

              {error && (
                <div className="flex gap-3 p-3 bg-red-50 dark:bg-red-900/20 rounded-xl border border-red-200 dark:border-red-800">
                  <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-red-700 dark:text-red-300">{error}</p>
                </div>
              )}
            </div>

            {/* Example prompts */}
            <div className="card p-5 animate-slide-up" style={{ animationDelay: '0.1s' }}>
              <h3 className="font-semibold text-slate-700 dark:text-slate-300 text-sm mb-3">💡 Example descriptions:</h3>
              <div className="space-y-2">
                {EXAMPLE_SYMPTOMS.map((s) => (
                  <button
                    key={s}
                    onClick={() => setSymptoms(s)}
                    className="w-full text-left text-xs text-slate-500 dark:text-slate-400 hover:text-accent-600 dark:hover:text-accent-400 hover:bg-accent-50 dark:hover:bg-accent-900/20 px-3 py-2 rounded-lg transition-all flex items-start gap-2"
                  >
                    <ArrowRight className="w-3 h-3 mt-0.5 flex-shrink-0" />
                    <span>{s}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Results Panel (2 cols) */}
          <div className="lg:col-span-2">
            <div className="card p-6 h-full animate-slide-up" style={{ animationDelay: '0.15s' }}>
              <h2 className="font-bold text-slate-900 dark:text-white mb-5 flex items-center gap-2">
                <ShieldAlert className="w-5 h-5 text-primary-500" /> Triage Report
              </h2>

              {/* Empty */}
              {!result && !loading && (
                <div className="flex flex-col items-center justify-center h-64 text-center gap-4">
                  <div className="w-20 h-20 rounded-3xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
                    <Stethoscope className="w-9 h-9 text-slate-300 dark:text-slate-600" />
                  </div>
                  <p className="text-slate-400 text-sm">Describe symptoms to see your AI triage report</p>
                </div>
              )}

              {/* Loading skeleton */}
              {loading && (
                <div className="space-y-4 animate-pulse">
                  <div className="h-16 bg-slate-100 dark:bg-slate-800 rounded-xl" />
                  <div className="h-24 bg-slate-100 dark:bg-slate-800 rounded-xl" />
                  <div className="h-24 bg-slate-100 dark:bg-slate-800 rounded-xl" />
                </div>
              )}

              {/* Results */}
              {result && !loading && (
                <div className="space-y-4 animate-fade-in">

                  {/* Blocked non-medical query */}
                  {result.blocked && (
                    <div className="rounded-xl border border-red-300 dark:border-red-700 bg-red-50 dark:bg-red-950/40 p-5">
                      <div className="flex items-start gap-3">
                        <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
                        <div>
                          <h4 className="font-bold text-red-700 dark:text-red-300 mb-1">Non-Medical Query Detected</h4>
                          <p className="text-sm text-red-600 dark:text-red-400">{result.summary}</p>
                          <p className="text-xs text-red-500 dark:text-red-500 mt-2 italic">Please describe a medical or health-related symptom to receive analysis.</p>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Summary */}
                  {result.summary && !result.blocked && (
                    <div className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-4">
                      <h4 className="font-bold text-slate-800 dark:text-slate-200 text-sm mb-2">Summary</h4>
                      <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">{result.summary}</p>
                    </div>
                  )}

                  {/* Urgency */}
                  {!result.blocked && (
                    <div className={`rounded-xl border p-4 ${urgency.bg} ${urgency.border}`}>
                      <div className="flex items-center gap-2 mb-1">
                        <Clock className={`w-4 h-4 ${urgency.color}`} />
                        <p className={`font-black text-lg ${urgency.color}`}>{urgency.label}</p>
                      </div>
                      <p className={`text-xs ${urgency.color} opacity-80`}>Urgency level based on described symptoms</p>
                    </div>
                  )}

                  {/* Possible Conditions */}
                  {!result.blocked && result.possible_conditions?.length > 0 && (
                    <div className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-4">
                      <h4 className="font-bold text-slate-800 dark:text-slate-200 text-sm mb-3 flex items-center gap-2">
                        <ClipboardList className="w-4 h-4 text-primary-500" /> Possible Conditions
                      </h4>
                      <ul className="space-y-1.5">
                        {result.possible_conditions.map((c, i) => (
                          <li key={i} className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
                            <span className="w-5 h-5 rounded-full bg-primary-100 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400 flex items-center justify-center text-xs font-bold flex-shrink-0">{i + 1}</span>
                            {c}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Specialist */}
                  {!result.blocked && specialist && (
                    <div className="flex items-center gap-3 p-3 rounded-xl bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800">
                      <Hospital className="w-4 h-4 text-blue-500 flex-shrink-0" />
                      <div>
                        <p className="text-xs text-blue-500 font-medium">Recommended Specialist</p>
                        <p className="text-sm font-bold text-blue-700 dark:text-blue-300">{specialist}</p>
                      </div>
                    </div>
                  )}

                  {/* Findings */}
                  {!result.blocked && result.findings?.length > 0 && (
                    <div className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-4">
                      <h4 className="font-bold text-slate-800 dark:text-slate-200 text-sm mb-2 flex items-center gap-2">
                        <Info className="w-4 h-4 text-primary-500" /> Key Findings
                      </h4>
                      <ul className="space-y-1">
                        {result.findings.map((f, i) => (
                          <li key={i} className="text-xs text-slate-600 dark:text-slate-400 flex items-start gap-2">
                            <span className="mt-1 w-1.5 h-1.5 rounded-full bg-slate-400 flex-shrink-0" />{f}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Red Flags */}
                  {!result.blocked && result.red_flags?.length > 0 && (
                    <div className="rounded-xl border border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-900/20 p-4">
                      <h4 className="font-bold text-red-700 dark:text-red-400 text-sm mb-2 flex items-center gap-2">
                        <AlertCircle className="w-4 h-4" /> Warning Signs
                      </h4>
                      <ul className="space-y-1">
                        {result.red_flags.map((f, i) => (
                          <li key={i} className="text-xs text-red-600 dark:text-red-400 flex items-start gap-2">
                            <span className="mt-1 w-1.5 h-1.5 rounded-full bg-red-400 flex-shrink-0" />{f}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Next steps */}
                  {!result.blocked && nextSteps?.length > 0 && (
                    <div className="rounded-xl border border-green-200 dark:border-green-800 bg-green-50 dark:bg-green-900/20 p-4">
                      <h4 className="font-bold text-green-700 dark:text-green-400 text-sm mb-2 flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4" /> Next Steps
                      </h4>
                      <ul className="space-y-1">
                        {nextSteps.map((t, i) => (
                          <li key={i} className="text-xs text-green-600 dark:text-green-400 flex items-start gap-2">
                            <span className="mt-1 w-1.5 h-1.5 rounded-full bg-green-400 flex-shrink-0" />{t}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* OTC medication guidance */}
                  {!result.blocked && result.medications_common?.length > 0 && (
                    <div className="flex gap-3 p-3 bg-amber-50 dark:bg-amber-900/20 rounded-xl border border-amber-200 dark:border-amber-800">
                      <Info className="w-4 h-4 text-amber-500 flex-shrink-0 mt-0.5" />
                      <div className="space-y-1">
                        <p className="text-xs text-amber-700 dark:text-amber-300 font-semibold">Common OTC options</p>
                        {result.medications_common.map((m, i) => (
                          <p key={i} className="text-xs text-amber-700 dark:text-amber-300 leading-relaxed">• {m}</p>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Language used */}
                  {result.language_used && (
                    <p className="text-xs text-slate-500 dark:text-slate-400">Language detected: {result.language_used}</p>
                  )}

                  {/* Disclaimer */}
                  <div className="bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 rounded-lg p-3">
                    <p className="text-xs text-blue-700 dark:text-blue-300 leading-relaxed font-semibold italic">
                      ℹ️ {result.disclaimer}
                    </p>
                  </div>

                  {/* CTAs */}
                  {!result.blocked && (
                    <div className="flex gap-2 pt-1">
                      <button
                        onClick={() => navigate('/hospitals')}
                        className="flex-1 btn-primary justify-center py-2.5 text-sm"
                      >
                        <Hospital className="w-4 h-4" /> Find Specialists
                      </button>
                      <button
                        onClick={() => {
                          setResult(null);
                          setSymptoms('');
                        }}
                        className="btn-secondary py-2.5 px-3 text-sm"
                      >
                        <RotateCcw className="w-4 h-4" />
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
