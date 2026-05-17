import { useState, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { analyzeImage } from '../services/api';
import toast from 'react-hot-toast';
import {
  Upload, X, ImagePlus, AlertCircle, CheckCircle2,
  Microscope, Percent, Activity, Building2, RotateCcw,
  ShieldAlert, ListChecks, Stethoscope, Info, Zap, ArrowRight,
} from 'lucide-react';

const CATEGORY_COLORS = {
  Dermatology:   'from-pink-500 to-rose-500',
  Pulmonology:   'from-blue-500 to-cyan-500',
  Ophthalmology: 'from-purple-500 to-violet-500',
  Neurology:     'from-orange-500 to-amber-500',
  Orthopedics:   'from-green-500 to-teal-500',
  Oncology:      'from-red-500 to-orange-500',
  Cardiology:    'from-rose-500 to-pink-600',
  General:       'from-slate-500 to-slate-600',
};

const SEVERITY_CONFIG = {
  Normal:   { color: 'text-green-600 dark:text-green-400',  bg: 'bg-green-100 dark:bg-green-900/30',  border: 'border-green-300 dark:border-green-700',  dot: 'bg-green-500' },
  Low:      { color: 'text-green-600 dark:text-green-400',  bg: 'bg-green-100 dark:bg-green-900/30',  border: 'border-green-300 dark:border-green-700',  dot: 'bg-green-500' },
  Moderate: { color: 'text-amber-600 dark:text-amber-400',  bg: 'bg-amber-100 dark:bg-amber-900/30',  border: 'border-amber-300 dark:border-amber-700',  dot: 'bg-amber-500' },
  High:     { color: 'text-orange-600 dark:text-orange-400',bg: 'bg-orange-100 dark:bg-orange-900/30',border: 'border-orange-300 dark:border-orange-700',dot: 'bg-orange-500' },
  Critical: { color: 'text-red-600 dark:text-red-400',      bg: 'bg-red-100 dark:bg-red-900/30',      border: 'border-red-300 dark:border-red-700',      dot: 'bg-red-500' },
  Unknown:  { color: 'text-slate-500',                       bg: 'bg-slate-100 dark:bg-slate-800',     border: 'border-slate-300 dark:border-slate-700',  dot: 'bg-slate-400' },
};

export default function Dashboard() {
  const navigate = useNavigate();

  const [file,       setFile]      = useState(null);
  const [preview,    setPreview]   = useState(null);
  const [isDragging, setIsDrag]    = useState(false);
  const [loading,    setLoading]   = useState(false);
  const [result,     setResult]    = useState(null);
  const [error,      setError]     = useState(null);
  const [progress,   setProgress]  = useState(0);

  const inputRef = useRef(null);

  /* ── file helpers ─────────────────────────── */
  const handleFile = useCallback((f) => {
    if (!f || !f.type.startsWith('image/')) { toast.error('Please upload a valid image file.'); return; }
    if (f.size > 10 * 1024 * 1024)          { toast.error('File size must be less than 10 MB.'); return; }
    setFile(f);
    setResult(null);
    setError(null);
    setPreview(URL.createObjectURL(f));
  }, []);

  const onDrop      = useCallback((e) => { e.preventDefault(); setIsDrag(false); const f = e.dataTransfer.files?.[0]; if (f) handleFile(f); }, [handleFile]);
  const onDragOver  = (e) => { e.preventDefault(); setIsDrag(true);  };
  const onDragLeave = () => setIsDrag(false);

  const clearImage = () => {
    setFile(null); setPreview(null); setResult(null); setError(null); setProgress(0);
    if (inputRef.current) inputRef.current.value = '';
  };

  /* ── analyse ──────────────────────────────── */
  const analyze = async () => {
    if (!file) { toast.error('Please upload an image first.'); return; }
    setLoading(true); setError(null); setResult(null); setProgress(0);

    const interval = setInterval(() => {
      setProgress(p => { if (p >= 85) { clearInterval(interval); return p; } return p + Math.random() * 10; });
    }, 300);

    try {
      const data = await analyzeImage(file);
      clearInterval(interval);
      setProgress(100);
      setResult(data);

      // Save latest analysis for chatbot context-aware follow-up.
      const chatContext = {
        disease: data?.disease || 'Unknown',
        confidence: data?.confidence ?? null,
        category: data?.category || 'General',
        severity: data?.severity || 'Unknown',
        findings: Array.isArray(data?.findings) ? data.findings.slice(0, 5) : [],
        recommendations: Array.isArray(data?.recommendations) ? data.recommendations.slice(0, 5) : [],
        next_steps: data?.next_steps || '',
        image_quality: data?.image_quality || 'Unknown',
        analyzed_at: new Date().toISOString(),
      };
      localStorage.setItem('medivision:lastAnalysis', JSON.stringify(chatContext));

      toast.success('Analysis complete! You can now ask the chatbot about this report.');
    } catch (err) {
      clearInterval(interval);
      setProgress(0);
      const msg = err?.response?.data?.error || 'Failed to analyse image. Is the backend running?';
      setError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  /* ── derived values ───────────────────────── */
  const gradient = result ? (CATEGORY_COLORS[result.category] || 'from-primary-500 to-accent-500') : '';
  const severity = result ? (SEVERITY_CONFIG[result.severity] || SEVERITY_CONFIG.Unknown) : null;

  /* ════════════════════════════════════════════ */
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 pt-24 pb-16 px-4">
      <div className="max-w-6xl mx-auto">

        {/* ── Header ── */}
        <div className="text-center mb-12 animate-fade-in">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary-100 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400 text-sm font-semibold mb-4">
            <Activity className="w-4 h-4" /> AI Diagnostic Dashboard
          </div>
          <h1 className="text-4xl md:text-5xl font-black text-slate-900 dark:text-white mb-4">
            Medical Image <span className="text-gradient">Analyzer</span>
          </h1>
          <p className="text-lg text-slate-500 dark:text-slate-400 max-w-2xl mx-auto">
            Upload any medical image — X-ray, MRI, CT, skin photo — and receive an AI-powered
            analysis with <strong>findings, severity, and clinical recommendations</strong>.
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">

          {/* ── Upload Card ── */}
          <div className="card p-6 animate-slide-up space-y-5">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <ImagePlus className="w-5 h-5 text-primary-500" /> Upload Image
              </h2>
              {file && (
                <button onClick={clearImage} className="p-1.5 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all">
                  <RotateCcw className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* Drop Zone */}
            <div
              id="drop-zone"
              onDrop={onDrop}
              onDragOver={onDragOver}
              onDragLeave={onDragLeave}
              onClick={() => !file && inputRef.current?.click()}
              className={`relative rounded-2xl border-2 border-dashed transition-all duration-300 overflow-hidden ${
                isDragging  ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20 scale-[1.02]'
                : file      ? 'border-accent-400 bg-accent-50/30 dark:bg-accent-900/10'
                            : 'border-slate-200 dark:border-slate-700 hover:border-primary-400 hover:bg-primary-50 dark:hover:bg-primary-900/10 cursor-pointer'
              }`}
              style={{ minHeight: 260 }}
            >
              {preview ? (
                <>
                  <img src={preview} alt="Medical image preview" className="w-full h-64 object-contain rounded-xl" />
                  <button
                    onClick={(e) => { e.stopPropagation(); clearImage(); }}
                    className="absolute top-3 right-3 w-8 h-8 rounded-full bg-red-500 text-white flex items-center justify-center hover:bg-red-600 transition-all shadow-lg"
                    aria-label="Remove image"
                  >
                    <X className="w-4 h-4" />
                  </button>
                  <div className="absolute bottom-3 left-3 right-3">
                    <div className="bg-black/60 backdrop-blur-sm rounded-lg px-3 py-2">
                      <p className="text-white text-xs truncate">{file.name}</p>
                      <p className="text-slate-300 text-xs">{(file.size / 1024).toFixed(1)} KB</p>
                    </div>
                  </div>
                </>
              ) : (
                <div className="flex flex-col items-center justify-center h-64 gap-4 p-6">
                  <div className={`w-20 h-20 rounded-2xl flex items-center justify-center transition-all duration-300 ${isDragging ? 'bg-primary-500 scale-110' : 'bg-slate-100 dark:bg-slate-800'}`}>
                    <Upload className={`w-8 h-8 ${isDragging ? 'text-white' : 'text-slate-400'}`} />
                  </div>
                  <div className="text-center">
                    <p className="text-slate-700 dark:text-slate-300 font-semibold">
                      {isDragging ? 'Drop your image here' : 'Drag & drop your medical image'}
                    </p>
                    <p className="text-slate-400 text-sm mt-1">or click to browse files</p>
                    <p className="text-slate-300 dark:text-slate-600 text-xs mt-2">PNG, JPG, JPEG, BMP, WebP • Max 10 MB</p>
                  </div>
                </div>
              )}
            </div>

            <input ref={inputRef} id="image-file-input" type="file" accept="image/*" className="hidden"
              onChange={e => handleFile(e.target.files?.[0])} />

            {!file && (
              <button id="browse-btn" onClick={() => inputRef.current?.click()} className="btn-secondary w-full justify-center py-3">
                <ImagePlus className="w-4 h-4" /> Browse Files
              </button>
            )}

            {/* Progress */}
            {loading && (
              <div className="animate-fade-in">
                <div className="flex justify-between text-xs font-medium text-slate-500 mb-2">
                  <span>Analysing image with Gemini AI…</span>
                  <span>{Math.min(100, Math.round(progress))}%</span>
                </div>
                <div className="h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-primary-500 to-accent-400 rounded-full transition-all duration-300"
                    style={{ width: `${Math.min(100, progress)}%` }} />
                </div>
                <div className="flex items-center gap-2 mt-3 text-sm text-slate-500">
                  <Activity className="w-4 h-4 text-primary-500 animate-spin-slow" />
                  Processing medical image with AI…
                </div>
              </div>
            )}

            {/* Analyse Button */}
            <button
              id="analyze-btn"
              onClick={analyze}
              disabled={!file || loading}
              className={`w-full flex items-center justify-center gap-3 py-4 rounded-xl font-bold text-base transition-all duration-200 ${
                !file || loading
                  ? 'bg-slate-200 dark:bg-slate-700 text-slate-400 cursor-not-allowed'
                  : 'btn-primary shadow-glow'
              }`}
            >
              {loading ? (
                <><div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Analysing…</>
              ) : (
                <><Microscope className="w-5 h-5" /> Analyse Image</>
              )}
            </button>

            {/* Tips */}
            <div className="grid grid-cols-3 gap-2 pt-1">
              {[
                { emoji: '📸', tip: 'Min 256×256 px for best results' },
                { emoji: '💡', tip: 'Good lighting for skin images' },
                { emoji: '🩻', tip: 'Export DICOM as PNG/JPEG first' },
              ].map(({ emoji, tip }) => (
                <div key={tip} className="flex flex-col items-center gap-1 p-2 rounded-xl bg-slate-50 dark:bg-slate-800/60 text-center">
                  <span className="text-lg">{emoji}</span>
                  <p className="text-xs text-slate-500 dark:text-slate-400 leading-snug">{tip}</p>
                </div>
              ))}
            </div>
          </div>

          {/* ── Results Card ── */}
          <div className="card p-6 animate-slide-up flex flex-col" style={{ animationDelay: '0.1s' }}>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-5 flex items-center gap-2">
              <Microscope className="w-5 h-5 text-primary-500" /> Analysis Results
            </h2>

            {/* Empty state */}
            {!result && !error && !loading && (
              <div className="flex flex-col items-center justify-center flex-1 text-center gap-4 py-16">
                <div className="w-24 h-24 rounded-3xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
                  <Microscope className="w-10 h-10 text-slate-300 dark:text-slate-600" />
                </div>
                <div>
                  <p className="text-slate-400 font-medium">No results yet</p>
                  <p className="text-slate-300 dark:text-slate-600 text-sm mt-1">Upload and analyse an image to see the AI report here</p>
                </div>
              </div>
            )}

            {/* Skeleton */}
            {loading && (
              <div className="space-y-4 animate-pulse">
                <div className="h-32 bg-slate-100 dark:bg-slate-800 rounded-2xl" />
                <div className="h-6 bg-slate-100 dark:bg-slate-800 rounded-lg w-3/4" />
                <div className="h-4 bg-slate-100 dark:bg-slate-800 rounded w-1/2" />
                <div className="h-24 bg-slate-100 dark:bg-slate-800 rounded-xl" />
                <div className="h-10 bg-slate-100 dark:bg-slate-800 rounded-xl" />
              </div>
            )}

            {/* Error */}
            {error && !loading && (
              <div className="flex flex-col items-center justify-center flex-1 text-center gap-4 animate-fade-in py-16">
                <div className="w-20 h-20 rounded-full bg-red-100 dark:bg-red-900/20 flex items-center justify-center">
                  <AlertCircle className="w-10 h-10 text-red-500" />
                </div>
                <div>
                  <p className="font-semibold text-red-600 dark:text-red-400">Analysis Failed</p>
                  <p className="text-slate-500 text-sm mt-1 max-w-xs">{error}</p>
                </div>
                <button onClick={analyze} className="btn-secondary text-sm py-2 px-4">
                  <RotateCcw className="w-4 h-4" /> Try Again
                </button>
              </div>
            )}

            {/* ── Rich Results ── */}
            {result && !loading && (
              <div className="space-y-4 animate-fade-in overflow-y-auto">

                {/* Condition banner */}
                <div className={`bg-gradient-to-br ${gradient} rounded-2xl p-5 text-white`}>
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <p className="text-white/70 text-xs font-medium mb-0.5">Detected Condition</p>
                      <h3 className="text-2xl font-black leading-tight">{result.disease}</h3>
                    </div>
                    <CheckCircle2 className="w-7 h-7 text-white/80 flex-shrink-0" />
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <span className="px-3 py-1 rounded-full bg-white/20 text-xs font-medium">{result.category}</span>
                    {result.image_quality && (
                      <span className="px-3 py-1 rounded-full bg-white/20 text-xs font-medium">
                        Image Quality: {result.image_quality}
                      </span>
                    )}
                    {result.mode === 'ai' && (
                      <span className="px-3 py-1 rounded-full bg-white/20 text-xs font-medium flex items-center gap-1">
                        <Zap className="w-3 h-3" /> Powered by Gemini
                      </span>
                    )}
                  </div>
                </div>

                {/* Severity + Confidence */}
                <div className="grid grid-cols-2 gap-3">
                  {/* Severity */}
                  <div className={`rounded-xl border p-3 ${severity.bg} ${severity.border}`}>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mb-1 flex items-center gap-1">
                      <ShieldAlert className="w-3 h-3" /> Severity
                    </p>
                    <div className="flex items-center gap-2">
                      <span className={`w-2.5 h-2.5 rounded-full ${severity.dot}`} />
                      <span className={`font-bold text-sm ${severity.color}`}>{result.severity || 'Unknown'}</span>
                    </div>
                  </div>

                  {/* Confidence */}
                  <div className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-3">
                    <p className="text-xs text-slate-500 dark:text-slate-400 mb-1 flex items-center gap-1">
                      <Percent className="w-3 h-3" /> AI Confidence
                    </p>
                    <p className="font-black text-lg text-primary-600 dark:text-primary-400">{result.confidence}%</p>
                    <div className="h-1.5 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden mt-1">
                      <div className={`h-full bg-gradient-to-r ${gradient} rounded-full transition-all duration-1000`}
                        style={{ width: `${result.confidence}%` }} />
                    </div>
                  </div>
                </div>

                {/* Key Findings */}
                {result.findings?.length > 0 && (
                  <div className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-4">
                    <h4 className="font-bold text-slate-800 dark:text-slate-200 text-sm mb-3 flex items-center gap-2">
                      <ListChecks className="w-4 h-4 text-primary-500" /> Key Findings
                    </h4>
                    <ul className="space-y-2">
                      {result.findings.map((f, i) => (
                        <li key={i} className="flex items-start gap-2 text-sm text-slate-600 dark:text-slate-400">
                          <span className="mt-1 w-1.5 h-1.5 rounded-full bg-primary-400 flex-shrink-0" />
                          {f}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Recommendations */}
                {result.recommendations?.length > 0 && (
                  <div className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-4">
                    <h4 className="font-bold text-slate-800 dark:text-slate-200 text-sm mb-3 flex items-center gap-2">
                      <Stethoscope className="w-4 h-4 text-accent-500" /> Recommendations
                    </h4>
                    <ul className="space-y-2">
                      {result.recommendations.map((r, i) => (
                        <li key={i} className="flex items-start gap-2 text-sm text-slate-600 dark:text-slate-400">
                          <ArrowRight className="w-3.5 h-3.5 mt-0.5 text-accent-400 flex-shrink-0" />
                          {r}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Next Steps */}
                {result.next_steps && (
                  <div className="flex gap-3 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-xl border border-blue-200 dark:border-blue-800">
                    <Info className="w-4 h-4 text-blue-500 flex-shrink-0 mt-0.5" />
                    <p className="text-sm text-blue-700 dark:text-blue-300 leading-relaxed font-medium">{result.next_steps}</p>
                  </div>
                )}

                {/* Disclaimer */}
                <div className="flex gap-3 p-3 bg-amber-50 dark:bg-amber-900/20 rounded-xl border border-amber-200 dark:border-amber-800">
                  <AlertCircle className="w-4 h-4 text-amber-500 flex-shrink-0 mt-0.5" />
                  <p className="text-xs text-amber-700 dark:text-amber-300 leading-relaxed">
                    {result.disclaimer || 'This is an AI-generated result for informational purposes only. Always consult a qualified physician.'}
                  </p>
                </div>

                {/* CTA */}
                <button
                  id="find-hospitals-btn"
                  onClick={() => navigate('/hospitals')}
                  className="w-full btn-primary justify-center py-3.5"
                >
                  <Building2 className="w-5 h-5" /> Find {result.category} Specialists
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
