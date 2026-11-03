import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../app/AuthContext';
import { useLanguage } from '../app/LanguageContext';
import type { SupportedLanguage } from '../types/auth';
import { Sprout, User, LogOut, Globe, Home } from 'lucide-react';

export const Navbar: React.FC = () => {
  const { user, profile, logout } = useAuth();
  const { language, setLanguage, t } = useLanguage();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const isActive = (path: string) => location.pathname === path;

  return (
    <header className="bg-white border-b border-warm-300 sticky top-0 z-30 shadow-xs">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 sm:h-20 flex items-center justify-between">
        {/* Brand Logo */}
        <Link to="/" className="flex items-center gap-2.5 group">
          <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-forest-600 flex items-center justify-center text-white shadow-sm group-hover:bg-forest-700 transition-colors">
            <Sprout className="w-6 h-6 sm:w-7 sm:h-7 text-mustard-400" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-xl sm:text-2xl font-bold tracking-tight text-forest-700">
                {t.appName}
              </span>
              <span className="text-xs bg-forest-50 text-forest-700 font-semibold px-2 py-0.5 rounded-md border border-forest-200">
                MH
              </span>
            </div>
            <p className="text-[11px] sm:text-xs text-charcoal-700 font-medium hidden sm:block">
              {t.tagline}
            </p>
          </div>
        </Link>

        {/* Right Section: Language switcher & User actions */}
        <div className="flex items-center gap-3 sm:gap-4">
          {/* Language Selector */}
          <div className="flex items-center bg-warm-200 rounded-xl px-2.5 py-1.5 border border-warm-300 text-xs sm:text-sm">
            <Globe className="w-4 h-4 text-forest-600 mr-1.5" />
            <select
              value={language}
              onChange={(e) => setLanguage(e.target.value as SupportedLanguage)}
              className="bg-transparent text-charcoal-900 font-medium focus:outline-none cursor-pointer"
              aria-label="Select Language"
            >
              <option value="mr-IN">मराठी (MR)</option>
              <option value="hi-IN">हिन्दी (HI)</option>
              <option value="en-IN">English (EN)</option>
            </select>
          </div>

          {user ? (
            <div className="flex items-center gap-2 sm:gap-3">
              <Link
                to="/"
                className={`p-2 rounded-xl transition-colors sm:hidden ${
                  isActive('/') ? 'bg-forest-50 text-forest-600' : 'text-charcoal-700 hover:bg-warm-200'
                }`}
                title={t.nav.dashboard}
              >
                <Home className="w-5 h-5" />
              </Link>
              
              <Link
                to="/profile"
                className={`flex items-center gap-2 px-3 py-2 rounded-xl transition-colors text-sm font-semibold ${
                  isActive('/profile')
                    ? 'bg-forest-50 text-forest-700 border border-forest-200'
                    : 'text-charcoal-800 hover:bg-warm-200'
                }`}
              >
                <div className="w-7 h-7 rounded-lg bg-forest-100 text-forest-700 flex items-center justify-center">
                  <User className="w-4 h-4" />
                </div>
                <span className="hidden md:inline-block max-w-[120px] truncate">
                  {profile?.display_name || user.username}
                </span>
              </Link>

              <button
                onClick={handleLogout}
                className="p-2 sm:px-3 sm:py-2 text-charcoal-700 hover:text-red-700 hover:bg-red-50 rounded-xl transition-colors flex items-center gap-1.5 text-sm font-medium"
                title={t.nav.logout}
              >
                <LogOut className="w-5 h-5" />
                <span className="hidden sm:inline-block">{t.nav.logout}</span>
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Link
                to="/login"
                className="px-4 py-2 text-sm font-semibold text-forest-700 hover:bg-forest-50 rounded-xl transition-colors"
              >
                {t.nav.login}
              </Link>
              <Link
                to="/register"
                className="px-4 py-2 text-sm font-semibold bg-forest-600 text-white hover:bg-forest-700 rounded-xl transition-colors shadow-xs"
              >
                {t.nav.register}
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
