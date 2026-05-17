import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import { Activity, LogIn, UserPlus, Eye, EyeOff, ArrowRight } from 'lucide-react';

export default function Auth() {
  const [mode, setMode]     = useState('login'); // 'login' | 'signup'
  const [showPwd, setShowPwd] = useState(false);
  const [form, setForm]     = useState({ name: '', email: '', password: '' });
  const { login, signup, loading } = useAuth();
  const navigate = useNavigate();

  const handle = (e) => setForm(f => ({ ...f, [e.target.name]: e.target.value }));

  const submit = async (e) => {
    e.preventDefault();
    if (mode === 'signup' && !form.name.trim()) {
      toast.error('Please enter your name.'); return;
    }
    if (!form.email.includes('@')) {
      toast.error('Please enter a valid email.'); return;
    }
    if (form.password.length < 4) {
      toast.error('Password must be at least 4 characters.'); return;
    }

    let res;
    if (mode === 'login') {
      res = await login(form.email, form.password);
      if (res.success) { toast.success('Welcome back!'); navigate('/dashboard'); }
    } else {
      res = await signup(form.name, form.email, form.password);
      if (res.success) { toast.success('Account created! Welcome to Medivision.'); navigate('/dashboard'); }
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-primary-950 to-slate-900 flex items-center justify-center px-4 pt-16">
      <div className="absolute inset-0 bg-mesh opacity-50" />

      <div className="relative z-10 w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8 animate-fade-in">
          <Link to="/" className="inline-flex items-center gap-2 mb-6">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center shadow-glow">
              <Activity className="w-6 h-6 text-white" />
            </div>
            <span className="text-2xl font-black text-gradient">Medivision</span>
          </Link>
          <h1 className="text-3xl font-black text-white mb-2">
            {mode === 'login' ? 'Welcome back' : 'Create account'}
          </h1>
          <p className="text-slate-400">
            {mode === 'login' ? "Sign in to your Medivision account" : "Start your AI-powered health journey"}
          </p>
        </div>

        {/* Card */}
        <div className="glass p-8 animate-slide-up">
          {/* Tab toggle */}
          <div className="flex p-1 bg-slate-800/50 rounded-xl mb-6">
            {[['login', 'Login', LogIn], ['signup', 'Sign Up', UserPlus]].map(([m, label, Icon]) => (
              <button
                key={m}
                id={`auth-tab-${m}`}
                onClick={() => setMode(m)}
                className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-semibold transition-all duration-200 ${
                  mode === m ? 'bg-primary-600 text-white shadow-sm' : 'text-slate-400 hover:text-slate-300'
                }`}
              >
                <Icon className="w-4 h-4" /> {label}
              </button>
            ))}
          </div>

          <form onSubmit={submit} className="space-y-4">
            {mode === 'signup' && (
              <div className="animate-slide-up">
                <label htmlFor="auth-name" className="block text-sm font-medium text-slate-300 mb-1.5">Full Name</label>
                <input
                  id="auth-name"
                  name="name"
                  type="text"
                  value={form.name}
                  onChange={handle}
                  placeholder="Dr. Manish Kumar"
                  className="input-field bg-slate-800/50 border-slate-600 text-white placeholder:text-slate-500"
                  autoComplete="name"
                />
              </div>
            )}

            <div>
              <label htmlFor="auth-email" className="block text-sm font-medium text-slate-300 mb-1.5">Email</label>
              <input
                id="auth-email"
                name="email"
                type="email"
                value={form.email}
                onChange={handle}
                placeholder="you@hospital.com"
                className="input-field bg-slate-800/50 border-slate-600 text-white placeholder:text-slate-500"
                autoComplete="email"
              />
            </div>

            <div>
              <label htmlFor="auth-password" className="block text-sm font-medium text-slate-300 mb-1.5">Password</label>
              <div className="relative">
                <input
                  id="auth-password"
                  name="password"
                  type={showPwd ? 'text' : 'password'}
                  value={form.password}
                  onChange={handle}
                  placeholder="••••••••"
                  className="input-field bg-slate-800/50 border-slate-600 text-white placeholder:text-slate-500 pr-12"
                  autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
                />
                <button
                  type="button"
                  onClick={() => setShowPwd(v => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-300 transition-colors"
                  aria-label="Toggle password visibility"
                >
                  {showPwd ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {mode === 'login' && (
              <div className="flex justify-end">
                <button type="button" className="text-xs text-primary-400 hover:text-primary-300 transition-colors">
                  Forgot password?
                </button>
              </div>
            )}

            <button
              id="auth-submit-btn"
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl bg-gradient-to-r from-primary-600 to-primary-700 text-white font-bold shadow-glow hover:shadow-primary-500/50 hover:from-primary-500 hover:to-primary-600 active:scale-95 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed mt-2"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  {mode === 'login' ? <LogIn className="w-5 h-5" /> : <UserPlus className="w-5 h-5" />}
                  {mode === 'login' ? 'Sign In' : 'Create Account'}
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          <p className="text-center text-sm text-slate-400 mt-6">
            {mode === 'login' ? "Don't have an account? " : "Already have an account? "}
            <button
              onClick={() => setMode(m => m === 'login' ? 'signup' : 'login')}
              className="text-primary-400 hover:text-primary-300 font-semibold transition-colors"
            >
              {mode === 'login' ? 'Sign Up' : 'Login'}
            </button>
          </p>

          <div className="mt-4 p-3 bg-slate-800/50 rounded-lg border border-slate-700">
            <p className="text-xs text-slate-500 text-center">
              💡 Demo: Any email & password (4+ chars) will work
            </p>
          </div>
        </div>

        <p className="text-center text-xs text-slate-600 mt-4">
          By continuing, you agree to our Terms & Privacy Policy
        </p>
      </div>
    </div>
  );
}
