import { useNavigate } from 'react-router-dom';
import {
  ArrowRight, Upload, Zap, Shield, Brain, Activity,
  CheckCircle, Star, ChevronRight
} from 'lucide-react';

const FEATURES = [
  {
    icon: Brain,
    color: 'from-purple-500 to-pink-500',
    title: 'AI-Powered Analysis',
    desc: 'Deep learning models trained on millions of medical images deliver radiologist-level accuracy.',
  },
  {
    icon: Zap,
    color: 'from-primary-500 to-cyan-400',
    title: 'Instant Results',
    desc: 'Get your diagnosis in seconds — no waiting, no delays.',
  },
  {
    icon: Shield,
    color: 'from-green-500 to-teal-400',
    title: 'Secure & Private',
    desc: 'HIPAA-compliant storage. Your medical data never leaves without your consent.',
  },
];

const STATS = [
  { value: '98.7%', label: 'Accuracy Rate' },
  { value: '2.5s',  label: 'Avg. Analysis Time' },
  { value: '500K+', label: 'Images Analyzed' },
  { value: '120+',  label: 'Disease Categories' },
];

const STEPS = [
  { num: '01', title: 'Upload Image', desc: 'Drag & drop your X-ray, MRI, CT or skin image.' },
  { num: '02', title: 'AI Analyzes', desc: 'Our model processes and identifies patterns.' },
  { num: '03', title: 'Get Report', desc: 'Receive disease name, confidence score & next steps.' },
];

const TESTIMONIALS = [
  {
    name: 'Dr. Priya Sharma',
    role: 'Radiologist, Apollo Hospital',
    text: 'Medivision has transformed my workflow. I get preliminary screenings done in seconds, letting me focus on complex cases.',
    rating: 5,
  },
  {
    name: 'Dr. Rahul Verma',
    role: 'Dermatologist, Fortis Health',
    text: 'The skin disease detection is remarkably accurate. I use it as a second opinion tool for ambiguous cases.',
    rating: 5,
  },
  {
    name: 'Ananya Singh',
    role: 'Patient',
    text: 'I uploaded my chest X-ray and got results in 3 seconds. It guided me to see the right specialist immediately.',
    rating: 5,
  },
];

export default function Home() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen">

      {/* ═══ HERO ═══════════════════════════════════ */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-16">
        {/* Background */}
        <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-primary-950 to-slate-900" />
        <div className="absolute inset-0 bg-mesh opacity-60" />
        {/* Decorative blobs */}
        <div className="absolute top-20 left-10 w-72 h-72 bg-primary-600/20 rounded-full blur-3xl animate-pulse-slow" />
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-accent-500/15 rounded-full blur-3xl animate-pulse-slow" style={{ animationDelay: '1s' }} />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-primary-500/5 rounded-full blur-3xl" />

        <div className="relative z-10 text-center px-4 max-w-5xl mx-auto">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary-500/20 border border-primary-500/30 text-primary-300 text-sm font-medium mb-8 animate-fade-in">
            <Zap className="w-4 h-4" />
            AI-Powered Healthcare Platform
          </div>

          <h1 className="text-5xl sm:text-6xl md:text-7xl font-black text-white leading-tight mb-6 animate-slide-up">
            AI-Powered{' '}
            <span className="text-gradient">Medical</span>
            <br />
            Assistance
          </h1>

          <p className="text-xl sm:text-2xl text-slate-300 mb-10 max-w-2xl mx-auto animate-slide-up leading-relaxed" style={{ animationDelay: '0.1s' }}>
            Upload your medical image and get{' '}
            <span className="text-accent-400 font-semibold">instant analysis</span>{' '}
            powered by cutting-edge AI.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center animate-slide-up" style={{ animationDelay: '0.2s' }}>
            <button
              id="hero-cta"
              onClick={() => navigate('/dashboard')}
              className="btn-primary text-lg px-8 py-4 shadow-glow"
            >
              <Upload className="w-5 h-5" />
              Start Analyzing
              <ArrowRight className="w-5 h-5" />
            </button>
            <button
              onClick={() => navigate('/hospitals')}
              className="btn-secondary text-lg px-8 py-4 border-slate-600 text-slate-300 hover:bg-slate-800 hover:border-slate-500"
            >
              Find Hospitals
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>

          {/* Floating badges */}
          <div className="flex flex-wrap justify-center gap-3 mt-10 animate-fade-in" style={{ animationDelay: '0.4s' }}>
            {['Skin Disease', 'X-Ray Analysis', 'MRI Scan', 'CT Scan', 'Retinal Scan'].map(tag => (
              <span key={tag} className="px-3 py-1.5 rounded-full bg-white/10 border border-white/20 text-white/70 text-sm">
                {tag}
              </span>
            ))}
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-slate-400 animate-bounce">
          <span className="text-xs font-medium">Scroll to explore</span>
          <div className="w-5 h-8 rounded-full border-2 border-slate-500 flex justify-center pt-1.5">
            <div className="w-1 h-2 rounded-full bg-slate-400 animate-bounce" />
          </div>
        </div>
      </section>

      {/* ═══ STATS ══════════════════════════════════ */}
      <section className="py-16 bg-primary-600 dark:bg-primary-800">
        <div className="max-w-5xl mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {STATS.map(s => (
              <div key={s.label} className="text-center">
                <p className="text-4xl font-black text-white mb-1">{s.value}</p>
                <p className="text-primary-200 text-sm font-medium">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ FEATURES ═══════════════════════════════ */}
      <section className="py-24 bg-white dark:bg-slate-900">
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center mb-16">
            <span className="badge bg-primary-100 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400 mb-4">Why Medivision?</span>
            <h2 className="section-title">Healthcare meets <span className="text-gradient">Artificial Intelligence</span></h2>
            <p className="section-subtitle">Combining deep learning with clinical expertise to deliver unprecedented diagnostic accuracy.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {FEATURES.map(f => (
              <div key={f.title} className="card p-8 hover:shadow-xl transition-all duration-300 hover:-translate-y-1 group">
                <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${f.color} flex items-center justify-center mb-6 shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                  <f.icon className="w-7 h-7 text-white" />
                </div>
                <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-3">{f.title}</h3>
                <p className="text-slate-500 dark:text-slate-400 leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ HOW IT WORKS ═══════════════════════════ */}
      <section className="py-24 bg-slate-50 dark:bg-slate-800/30">
        <div className="max-w-5xl mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="section-title">How It Works</h2>
            <p className="section-subtitle">Three simple steps to get your AI-powered medical analysis.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 relative">
            <div className="hidden md:block absolute top-10 left-1/3 right-1/3 h-0.5 bg-gradient-to-r from-primary-400 to-accent-400" />
            {STEPS.map((step, i) => (
              <div key={step.num} className="relative flex flex-col items-center text-center animate-slide-up" style={{ animationDelay: `${i * 0.1}s` }}>
                <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center mb-6 shadow-glow z-10">
                  <span className="text-2xl font-black text-white">{step.num}</span>
                </div>
                <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-3">{step.title}</h3>
                <p className="text-slate-500 dark:text-slate-400">{step.desc}</p>
              </div>
            ))}
          </div>

          <div className="text-center mt-14">
            <button
              id="how-it-works-cta"
              onClick={() => navigate('/dashboard')}
              className="btn-primary text-lg px-10 py-4"
            >
              Try It Now <ArrowRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      </section>

      {/* ═══ TESTIMONIALS ═══════════════════════════ */}
      <section className="py-24 bg-white dark:bg-slate-900">
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="section-title">Trusted by Professionals</h2>
            <p className="section-subtitle">Doctors, radiologists, and patients trust Medivision for better health outcomes.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {TESTIMONIALS.map(t => (
              <div key={t.name} className="card p-8 hover:shadow-xl transition-all duration-300">
                <div className="flex mb-4">
                  {Array.from({ length: t.rating }).map((_, i) => (
                    <Star key={i} className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                  ))}
                </div>
                <p className="text-slate-600 dark:text-slate-300 italic mb-6 leading-relaxed">"{t.text}"</p>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center text-white font-bold text-sm">
                    {t.name.split(' ').map(n => n[0]).join('')}
                  </div>
                  <div>
                    <p className="font-semibold text-slate-900 dark:text-white text-sm">{t.name}</p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">{t.role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ CTA BANNER ═════════════════════════════ */}
      <section className="py-20 bg-gradient-to-r from-primary-600 via-primary-700 to-accent-600">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <Activity className="w-12 h-12 text-white/80 mx-auto mb-6 animate-pulse-slow" />
          <h2 className="text-4xl font-black text-white mb-4">Ready to get started?</h2>
          <p className="text-xl text-primary-100 mb-8">Upload your first medical image and experience AI diagnostics firsthand.</p>
          <button
            id="bottom-cta"
            onClick={() => navigate('/dashboard')}
            className="inline-flex items-center gap-3 px-10 py-4 bg-white text-primary-700 font-bold rounded-xl shadow-lg hover:shadow-xl hover:-translate-y-0.5 active:scale-95 transition-all duration-200"
          >
            <Upload className="w-5 h-5" />
            Analyze My Image
            <ArrowRight className="w-5 h-5" />
          </button>
          <div className="flex justify-center items-center gap-6 mt-8 text-primary-200 text-sm">
            {['Free to use', 'No sign-up required', 'Results in seconds'].map(t => (
              <span key={t} className="flex items-center gap-1.5">
                <CheckCircle className="w-4 h-4" /> {t}
              </span>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
