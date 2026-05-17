import { useState, useEffect } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  Moon, Sun, Menu, X, Activity, LogIn, LogOut, User
} from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';

const LINKS = [
  { to: '/',           label: 'Home' },
  { to: '/dashboard',  label: 'Dashboard' },
  { to: '/symptoms',   label: 'Symptom Check' },
  { to: '/hospitals',  label: 'Hospitals' },
  { to: '/chatbot',    label: 'Chatbot' },
];

export default function Navbar() {
  const { dark, toggle } = useTheme();
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const [open, setOpen]       = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/');
    setOpen(false);
  };

  const navLinkCls = ({ isActive }) =>
    `relative px-3 py-1.5 rounded-lg font-medium text-sm transition-all duration-200 ` +
    (isActive
      ? 'text-primary-600 dark:text-primary-400 bg-primary-50 dark:bg-primary-900/30'
      : 'text-slate-600 dark:text-slate-300 hover:text-primary-600 dark:hover:text-primary-400 hover:bg-slate-100 dark:hover:bg-slate-800');

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? 'bg-white/90 dark:bg-slate-900/90 backdrop-blur-md shadow-md border-b border-slate-200/60 dark:border-slate-700/60'
          : 'bg-transparent'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">

          {/* ── Logo ── */}
          <NavLink to="/" className="flex items-center gap-2 group">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center shadow-glow group-hover:scale-110 transition-transform duration-200">
              <Activity className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold text-gradient">Medivision</span>
          </NavLink>

          {/* ── Desktop Links ── */}
          <div className="hidden md:flex items-center gap-1">
            {LINKS.map(l => (
              <NavLink key={l.to} to={l.to} className={navLinkCls} end={l.to === '/'}>
                {l.label}
              </NavLink>
            ))}
          </div>

          {/* ── Right Controls ── */}
          <div className="flex items-center gap-2">
            {/* Dark mode toggle */}
            <button
              id="dark-mode-toggle"
              onClick={toggle}
              aria-label="Toggle dark mode"
              className="w-9 h-9 rounded-lg flex items-center justify-center text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all duration-200"
            >
              {dark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>

            {user ? (
              <div className="hidden md:flex items-center gap-2">
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-primary-50 dark:bg-primary-900/30">
                  <div className="w-7 h-7 rounded-full bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center text-xs font-bold text-white">
                    {user.avatar}
                  </div>
                  <span className="text-sm font-medium text-slate-700 dark:text-slate-300">{user.name}</span>
                </div>
                <button
                  id="logout-btn"
                  onClick={handleLogout}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium text-slate-500 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all duration-200"
                >
                  <LogOut className="w-4 h-4" /> Logout
                </button>
              </div>
            ) : (
              <NavLink
                to="/auth"
                id="login-nav-btn"
                className="hidden md:flex items-center gap-1.5 btn-primary py-2 px-4 text-sm"
              >
                <LogIn className="w-4 h-4" /> Login
              </NavLink>
            )}

            {/* Mobile hamburger */}
            <button
              id="mobile-menu-toggle"
              onClick={() => setOpen(o => !o)}
              className="md:hidden w-9 h-9 rounded-lg flex items-center justify-center text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all duration-200"
              aria-label="Toggle mobile menu"
            >
              {open ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* ── Mobile Menu ── */}
      <div className={`md:hidden transition-all duration-300 overflow-hidden ${open ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'}`}>
        <div className="bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-t border-slate-200 dark:border-slate-700 px-4 py-3 space-y-1">
          {LINKS.map(l => (
            <NavLink
              key={l.to}
              to={l.to}
              className={navLinkCls}
              end={l.to === '/'}
              onClick={() => setOpen(false)}
            >
              {l.label}
            </NavLink>
          ))}
          <div className="pt-2 border-t border-slate-100 dark:border-slate-700">
            {user ? (
              <button
                onClick={handleLogout}
                className="flex items-center gap-2 w-full px-3 py-2 text-sm text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-all"
              >
                <LogOut className="w-4 h-4" /> Logout
              </button>
            ) : (
              <NavLink to="/auth" onClick={() => setOpen(false)} className="btn-primary w-full justify-center py-2.5 text-sm">
                <LogIn className="w-4 h-4" /> Login / Sign Up
              </NavLink>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
