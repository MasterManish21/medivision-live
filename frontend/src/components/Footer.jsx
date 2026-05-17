import { NavLink } from 'react-router-dom';
import { Activity, Mail, Phone, MapPin, Heart } from 'lucide-react';

const LINKS = [
  { to: '/',          label: 'Home' },
  { to: '/dashboard', label: 'Dashboard' },
  { to: '/hospitals', label: 'Hospitals' },
  { to: '/chatbot',   label: 'Chatbot' },
];

const SOCIAL = [
  { href: 'mailto:hello@medivision.ai', icon: Mail,    label: 'Email' },
  { href: 'tel:+911800000000',          icon: Phone,   label: 'Phone' },
  { href: '#',                           icon: MapPin,  label: 'Address' },
];

export default function Footer() {
  return (
    <footer className="bg-slate-900 dark:bg-dark-900 text-slate-300 mt-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-14 pb-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10 mb-10">

          {/* Brand */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center shadow-glow">
                <Activity className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold text-white">Medivision</span>
            </div>
            <p className="text-sm text-slate-400 leading-relaxed max-w-xs">
              AI-powered medical image analysis platform helping doctors and patients get faster, more accurate diagnoses.
            </p>
            <p className="text-xs text-slate-500 mt-4 flex items-center gap-1">
              Made with <Heart className="w-3 h-3 text-red-400 fill-red-400" /> for better healthcare
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-white font-semibold mb-4">Quick Links</h3>
            <ul className="space-y-2">
              {LINKS.map(l => (
                <li key={l.to}>
                  <NavLink
                    to={l.to}
                    className="text-sm text-slate-400 hover:text-primary-400 transition-colors duration-200"
                    end={l.to === '/'}
                  >
                    {l.label}
                  </NavLink>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="text-white font-semibold mb-4">Contact</h3>
            <ul className="space-y-3">
              {SOCIAL.map(({ href, icon: Icon, label }) => (
                <li key={label}>
                  <a
                    href={href}
                    className="flex items-center gap-2.5 text-sm text-slate-400 hover:text-primary-400 transition-colors duration-200"
                  >
                    <Icon className="w-4 h-4 flex-shrink-0" />
                    {label === 'Email' && 'hello@medivision.ai'}
                    {label === 'Phone' && '+91 1800 000 000'}
                    {label === 'Address' && 'Bangalore, India'}
                  </a>
                </li>
              ))}
            </ul>

            <div className="mt-5 p-3 rounded-xl bg-slate-800 border border-slate-700">
              <p className="text-xs text-slate-400">
                <span className="text-accent-400 font-semibold">⚠ Disclaimer:</span> Medivision is for informational purposes only. Always consult a licensed medical professional.
              </p>
            </div>
          </div>
        </div>

        <div className="border-t border-slate-800 pt-6 flex flex-col sm:flex-row items-center justify-between gap-2">
          <p className="text-xs text-slate-500">© {new Date().getFullYear()} Medivision. All rights reserved.</p>
          <p className="text-xs text-slate-500">v1.0.0 • AI-Powered Healthcare Platform</p>
        </div>
      </div>
    </footer>
  );
}
