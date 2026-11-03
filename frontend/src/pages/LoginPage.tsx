import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../app/AuthContext';
import { useLanguage } from '../app/LanguageContext';
import { Input } from '../components/Input';
import { Button } from '../components/Button';
import { Card } from '../components/Card';
import { Sprout, AlertCircle } from 'lucide-react';

export const LoginPage: React.FC = () => {
  const { login } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!username.trim() || !password) {
      setError('कृपया सर्व आवश्यक माहिती भरा / Please enter all credentials.');
      return;
    }

    try {
      setLoading(true);
      await login({ username: username.trim(), password });
      navigate('/');
    } catch (err: any) {
      setError(err.message || 'लॉगिन अयशस्वी झाले. कृपया माहिती तपासा.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto pt-6 sm:pt-12">
      <Card className="shadow-md">
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-forest-100 text-forest-700 mb-3 shadow-xs">
            <Sprout className="w-8 h-8 text-forest-600" />
          </div>
          <h1 className="text-2xl font-bold text-forest-800 tracking-tight">
            {t.auth.loginTitle}
          </h1>
          <p className="text-sm text-charcoal-700 mt-1">
            {t.auth.loginSubtitle}
          </p>
        </div>

        {error && (
          <div className="mb-5 p-3.5 bg-red-50 border border-red-200 rounded-xl flex items-center gap-2.5 text-sm text-red-700">
            <AlertCircle className="w-5 h-5 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <Input
            label={t.auth.username}
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="उदा. tukaram_patil"
            autoComplete="username"
            required
          />

          <Input
            label={t.auth.password}
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            autoComplete="current-password"
            required
          />

          <Button
            type="submit"
            variant="primary"
            size="lg"
            isLoading={loading}
            className="mt-2 w-full text-base font-semibold"
          >
            {t.auth.submitLogin}
          </Button>
        </form>

        <div className="mt-6 pt-5 border-t border-warm-300 text-center">
          <Link
            to="/register"
            className="text-sm font-semibold text-forest-700 hover:text-forest-800 hover:underline inline-block py-1"
          >
            {t.auth.noAccount}
          </Link>
        </div>
      </Card>
    </div>
  );
};

