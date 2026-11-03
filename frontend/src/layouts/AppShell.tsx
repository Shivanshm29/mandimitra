import React from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { Navbar } from './Navbar';
import { FloatingVoiceAssistant } from '../components/FloatingVoiceAssistant';
import { useAuth } from '../app/AuthContext';
import { useLanguage } from '../app/LanguageContext';
import { Home, TrendingUp, Sparkles, FileText, IndianRupee, Bot, LineChart } from 'lucide-react';

export const AppShell: React.FC = () => {
  const { user } = useAuth();
  const { t } = useLanguage();
  const location = useLocation();

  const navItems = [
    { path: '/', label: t.nav.dashboard, icon: Home },
    { path: '/mandi-intelligence', label: t.nav.mandiIntelligence, icon: TrendingUp },
    { path: '/selling-recommendations', label: t.nav.sellingRecommendations, icon: Sparkles },
    { path: '/transactions', label: t.nav.transactions, icon: FileText },
    { path: '/payments', label: t.nav.payments, icon: IndianRupee },
    { path: '/profit-coach', label: t.nav.profitCoach, icon: LineChart },
    { path: '/sarvam-assistant', label: t.nav.sarvamAssistant, icon: Bot },
  ];

  const isActive = (path: string) => location.pathname === path;

  return (
    <div className="min-h-screen flex flex-col bg-warm-200">
      <Navbar />

      {/* Main Content Container */}
      <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 py-6 sm:py-8 pb-24 md:pb-8">
        <Outlet />
      </main>

      {/* Mobile Sticky Bottom Navigation (Available for authenticated farmers) */}
      {user && (
        <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-md border-t border-warm-300 px-2 py-2 flex justify-around items-center z-30 shadow-lg">
          {navItems.slice(0, 5).map((item) => {
            const Icon = item.icon;
            const active = isActive(item.path);
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex flex-col items-center justify-center p-1.5 rounded-xl text-[11px] font-medium transition-all ${
                  active ? 'text-forest-700 font-bold' : 'text-charcoal-700'
                }`}
              >
                <div
                  className={`p-1.5 rounded-lg mb-0.5 ${
                    active ? 'bg-forest-100 text-forest-700' : 'text-charcoal-700'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                </div>
                <span className="truncate max-w-[62px] text-center leading-tight">
                  {item.label}
                </span>
              </Link>
            );
          })}
        </nav>
      )}

      {/* Accessible Footer */}
      <footer className="bg-white border-t border-warm-300 py-6 text-center text-xs text-charcoal-700 mt-auto hidden md:block">
        <div className="max-w-6xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p>© 2026 MANDIMITRA — महाराष्ट्र शेतकरी बाजार आणि वित्तीय बुद्धिमत्ता मंच</p>
          <div className="flex items-center gap-4 text-charcoal-700">
            <span>अधिकृत सरकारी आकडेवारी (AGMARKNET)</span>
            <span>•</span>
            <span>सर्वम AI (Sarvam AI) द्वारे समर्थित</span>
          </div>
        </div>
      </footer>

      {/* Universal Persistent Sarvam AI Floating Assistant */}
      {user && <FloatingVoiceAssistant />}
    </div>
  );
};

