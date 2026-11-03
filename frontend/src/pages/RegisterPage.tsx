import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../app/AuthContext';
import { useLanguage } from '../app/LanguageContext';
import type { SupportedLanguage } from '../types/auth';
import { Input } from '../components/Input';
import { Button } from '../components/Button';
import { Card } from '../components/Card';
import { VoiceDictationButton } from '../components/VoiceDictationButton';
import { sarvamService } from '../services/sarvamService';
import { Sprout, AlertCircle, CheckCircle2, Plus, X, Mic, Sparkles } from 'lucide-react';

const MAHARASHTRA_DISTRICTS = [
  'Ahmednagar', 'Akola', 'Amravati', 'Chhatrapati Sambhajinagar', 'Beed', 'Bhandara',
  'Buldhana', 'Chandrapur', 'Dhule', 'Gadchiroli', 'Gondia', 'Hingoli', 'Jalgaon',
  'Jalna', 'Kolhapur', 'Latur', 'Mumbai City', 'Mumbai Suburban', 'Nagpur', 'Nanded',
  'Nandurbar', 'Nashik', 'Dharashiv', 'Palghar', 'Parbhani', 'Pune', 'Raigad',
  'Ratnagiri', 'Sangli', 'Satara', 'Sindhudurg', 'Solapur', 'Thane', 'Wardha',
  'Washim', 'Yavatmal'
];

const PREDEFINED_CROPS = [
  { id: 'Onion', mr: 'कांदा (Onion)', hi: 'प्याज (Onion)', en: 'Onion', defaultVariety: 'Red Garwa' },
  { id: 'Soybean', mr: 'सोयाबीन (Soybean)', hi: 'सोयाबीन (Soybean)', en: 'Soybean', defaultVariety: 'Yellow' },
  { id: 'Cotton', mr: 'कापूस (Cotton)', hi: 'कपास (Cotton)', en: 'Cotton', defaultVariety: 'BT Cotton' },
  { id: 'Wheat', mr: 'गहू (Wheat)', hi: 'गेहूं (Wheat)', en: 'Wheat', defaultVariety: 'Lokwan' },
  { id: 'Tomato', mr: 'टोमॅटो (Tomato)', hi: 'टमाटर (Tomato)', en: 'Tomato', defaultVariety: 'Hybrid' },
  { id: 'Gram', mr: 'हरभरा (Chana)', hi: 'चना (Gram)', en: 'Gram / Chana', defaultVariety: 'Desi' },
  { id: 'Maize', mr: 'मका (Maize)', hi: 'मक्का (Maize)', en: 'Maize', defaultVariety: 'Yellow' },
  { id: 'Sugarcane', mr: 'ऊस (Sugarcane)', hi: 'गन्ना (Sugarcane)', en: 'Sugarcane', defaultVariety: 'Co 86032' },
];

export const RegisterPage: React.FC = () => {
  const { register } = useAuth();
  const { language, setLanguage, t } = useLanguage();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    username: '',
    password: '',
    confirmPassword: '',
    displayName: '',
    phoneNumber: '',
    state: 'Maharashtra',
    district: 'Nashik',
    village: '',
    locality: '',
    preferredLanguage: language as SupportedLanguage,
  });

  // Mandatory commonly grown crops (at least 1)
  const [selectedCrops, setSelectedCrops] = useState<Array<{ commodity: string; variety?: string }>>([
    { commodity: 'Onion', variety: 'Red Garwa' }
  ]);
  const [customCropName, setCustomCropName] = useState('');
  const [customVariety, setCustomVariety] = useState('');
  const [voiceCropStatus, setVoiceCropStatus] = useState<string | null>(null);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const togglePredefinedCrop = (cropId: string, defaultVar: string) => {
    setSelectedCrops((prev) => {
      const exists = prev.some((c) => c.commodity.toLowerCase() === cropId.toLowerCase());
      if (exists) {
        return prev.filter((c) => c.commodity.toLowerCase() !== cropId.toLowerCase());
      } else {
        return [...prev, { commodity: cropId, variety: defaultVar }];
      }
    });
  };

  const addCustomCrop = () => {
    if (!customCropName.trim()) return;
    const exists = selectedCrops.some(
      (c) => c.commodity.toLowerCase() === customCropName.trim().toLowerCase()
    );
    if (!exists) {
      setSelectedCrops((prev) => [
        ...prev,
        { commodity: customCropName.trim(), variety: customVariety.trim() || 'Standard' }
      ]);
    }
    setCustomCropName('');
    setCustomVariety('');
  };

  const removeCrop = (index: number) => {
    setSelectedCrops((prev) => prev.filter((_, i) => i !== index));
  };

  const handleVoiceCrops = async (transcript: string) => {
    setVoiceCropStatus('पिके ओळखली जात आहेत...');
    try {
      const res = await sarvamService.extractCrops(transcript, language);
      if (res.crops && res.crops.length > 0) {
        setSelectedCrops((prev) => {
          const combined = [...prev];
          for (const newC of res.crops) {
            if (!combined.some((c) => c.commodity.toLowerCase() === newC.commodity.toLowerCase())) {
              combined.push(newC);
            }
          }
          return combined;
        });
        setVoiceCropStatus(`ओळखली गेलेली पिके जोडली: ${res.crops.map((c) => c.commodity).join(', ')}`);
      } else {
        setVoiceCropStatus('कोणतेही पीक ओळखता आले नाही. कृपया पुन्हा बोला.');
      }
    } catch {
      setVoiceCropStatus('पीक ओळखताना त्रुटी आली.');
    } finally {
      setTimeout(() => setVoiceCropStatus(null), 3000);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Validation
    if (formData.password.length < 6) {
      setError('पासवर्ड किमान ६ अक्षरांचा असावा / Password must be at least 6 characters.');
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError(t.auth.passwordMismatch);
      return;
    }

    if (!formData.username.trim() || !formData.displayName.trim() || !formData.village.trim()) {
      setError('कृपया सर्व आवश्यक माहिती भरा / Please fill all required fields.');
      return;
    }

    if (selectedCrops.length === 0) {
      setError(
        language === 'mr-IN'
          ? 'कृपया किमान एक मुख्य पीक निवडा किंवा प्रविष्ट करा.'
          : 'Please select or add at least one commonly grown crop.'
      );
      return;
    }

    try {
      setLoading(true);
      await register({
        username: formData.username.trim(),
        password: formData.password,
        display_name: formData.displayName.trim(),
        phone_number: formData.phoneNumber.trim() || undefined,
        state: formData.state,
        district: formData.district,
        village: formData.village.trim(),
        locality: formData.locality.trim() || undefined,
        preferred_language: formData.preferredLanguage,
        commonly_grown_crops: selectedCrops,
      });

      if (formData.preferredLanguage !== language) {
        setLanguage(formData.preferredLanguage);
      }

      navigate('/');
    } catch (err: any) {
      setError(err.message || 'नोंदणी अयशस्वी झाली. कृपया पुन्हा प्रयत्न करा.');
    } finally {
      setLoading(false);
    }
  };

  const isMarathi = language === 'mr-IN';
  const isHindi = language === 'hi-IN';

  return (
    <div className="max-w-xl mx-auto pt-4 sm:pt-8 pb-12">
      <Card className="shadow-md">
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-forest-100 text-forest-700 mb-3 shadow-xs">
            <Sprout className="w-8 h-8 text-forest-600" />
          </div>
          <h1 className="text-2xl font-bold text-forest-800 tracking-tight">
            {t.auth.registerTitle}
          </h1>
          <p className="text-sm text-charcoal-700 mt-1">
            {t.auth.registerSubtitle}
          </p>
        </div>

        {error && (
          <div className="mb-5 p-3.5 bg-red-50 border border-red-200 rounded-xl flex items-center gap-2.5 text-sm text-red-700">
            <AlertCircle className="w-5 h-5 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="relative">
              <Input
                label={t.auth.displayName}
                name="displayName"
                type="text"
                value={formData.displayName}
                onChange={handleChange}
                placeholder="उदा. तुकाराम पाटील"
                required
              />
              <div className="absolute top-8 right-2">
                <VoiceDictationButton
                  size="sm"
                  onTranscript={(txt) => setFormData((p) => ({ ...p, displayName: txt }))}
                />
              </div>
            </div>

            <Input
              label={t.auth.username}
              name="username"
              type="text"
              value={formData.username}
              onChange={handleChange}
              placeholder="उदा. tukaram_p"
              required
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label={t.auth.phoneNumber}
              name="phoneNumber"
              type="tel"
              value={formData.phoneNumber}
              onChange={handleChange}
              placeholder="उदा. 9822012345"
              optional
            />

            {/* Preferred Language */}
            <div className="w-full flex flex-col gap-1.5 text-left">
              <label htmlFor="pref-lang" className="text-sm font-semibold text-charcoal-800">
                {t.auth.preferredLanguage}
              </label>
              <select
                id="pref-lang"
                name="preferredLanguage"
                value={formData.preferredLanguage}
                onChange={handleChange}
                className="w-full min-h-[48px] px-4 py-2.5 rounded-xl border border-warm-400 bg-white text-charcoal-900 text-base shadow-sm focus:outline-none focus:border-forest-600 focus:ring-2 focus:ring-forest-100"
              >
                <option value="mr-IN">मराठी (mr-IN)</option>
                <option value="hi-IN">हिन्दी (hi-IN)</option>
                <option value="en-IN">English (en-IN)</option>
              </select>
            </div>
          </div>

          {/* Location Fields */}
          <div className="bg-warm-100 p-4 rounded-xl border border-warm-300 flex flex-col gap-3">
            <div className="flex items-center gap-2 text-forest-700 font-semibold text-sm">
              <CheckCircle2 className="w-4 h-4" />
              <span>स्थान तपशील / Location Hierarchy</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="w-full flex flex-col gap-1 text-left">
                <label htmlFor="district-select" className="text-xs font-semibold text-charcoal-800">
                  {t.auth.district} *
                </label>
                <select
                  id="district-select"
                  name="district"
                  value={formData.district}
                  onChange={handleChange}
                  className="w-full min-h-[44px] px-3 py-2 rounded-lg border border-warm-400 bg-white text-charcoal-900 text-sm focus:outline-none focus:border-forest-600"
                  required
                >
                  {MAHARASHTRA_DISTRICTS.map((d) => (
                    <option key={d} value={d}>
                      {d}
                    </option>
                  ))}
                </select>
              </div>

              <div className="relative">
                <Input
                  label={t.auth.village}
                  name="village"
                  type="text"
                  value={formData.village}
                  onChange={handleChange}
                  placeholder="उदा. पिंपळगाव बसवंत"
                  required
                />
                <div className="absolute top-8 right-2">
                  <VoiceDictationButton
                    size="sm"
                    onTranscript={(txt) => setFormData((p) => ({ ...p, village: txt }))}
                  />
                </div>
              </div>
            </div>

            <Input
              label={t.auth.locality}
              name="locality"
              type="text"
              value={formData.locality}
              onChange={handleChange}
              placeholder="उदा. बाजार समिती जवळ"
              optional
            />
          </div>

          {/* Mandatory Commonly Grown Crops Section (Pillar 2) */}
          <div className="bg-[#EAF3EA] p-4 rounded-xl border border-emerald-300 flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-[#176B45] font-bold text-sm">
                <Sprout className="w-4 h-4" />
                <span>
                  {isMarathi
                    ? 'मुख्य शेतीमाल / पिके (Commonly Grown Crops) *'
                    : isHindi
                    ? 'मुख्य फसलें (Commonly Grown Crops) *'
                    : 'Commonly Grown Crops *'}
                </span>
              </div>
              <span className="text-[11px] text-emerald-800 font-semibold">किमान १ पीक आवश्यक</span>
            </div>

            <p className="text-xs text-gray-600">
              {isMarathi
                ? 'खालील पिकांवर क्लिक करा किंवा बोलून निवडा. (उदा. "मी कांदा आणि सोयाबीन पिकवतो")'
                : 'Tap to select your crops or use voice dictation.'}
            </p>

            {/* Predefined Crop Chips */}
            <div className="flex flex-wrap gap-2">
              {PREDEFINED_CROPS.map((crop) => {
                const isSelected = selectedCrops.some(
                  (c) => c.commodity.toLowerCase() === crop.id.toLowerCase()
                );
                return (
                  <button
                    key={crop.id}
                    type="button"
                    onClick={() => togglePredefinedCrop(crop.id, crop.defaultVariety)}
                    className={`px-3 py-1.5 text-xs font-semibold rounded-lg border transition ${
                      isSelected
                        ? 'bg-[#176B45] text-white border-[#176B45] shadow-xs'
                        : 'bg-white text-gray-800 border-gray-300 hover:bg-emerald-50'
                    }`}
                  >
                    {isMarathi ? crop.mr : isHindi ? crop.hi : crop.en}
                    {isSelected && ' ✓'}
                  </button>
                );
              })}
            </div>

            {/* Custom Crop Entry with Voice dictation */}
            <div className="flex items-center gap-2 pt-1">
              <input
                type="text"
                placeholder="इतर पीक (उदा. डाळिंब / अनार)"
                value={customCropName}
                onChange={(e) => setCustomCropName(e.target.value)}
                className="flex-1 px-3 py-2 text-xs rounded-lg border border-gray-300 bg-white"
              />
              <input
                type="text"
                placeholder="जात (उदा. भगवा)"
                value={customVariety}
                onChange={(e) => setCustomVariety(e.target.value)}
                className="w-28 px-3 py-2 text-xs rounded-lg border border-gray-300 bg-white"
              />
              <button
                type="button"
                onClick={addCustomCrop}
                className="p-2 bg-[#176B45] text-white rounded-lg hover:bg-emerald-800"
                title="Add Crop"
              >
                <Plus className="w-4 h-4" />
              </button>
              <VoiceDictationButton
                size="sm"
                onTranscript={handleVoiceCrops}
              />
            </div>

            {voiceCropStatus && (
              <p className="text-xs text-emerald-800 font-semibold animate-pulse">
                {voiceCropStatus}
              </p>
            )}

            {/* Selected Crops List */}
            {selectedCrops.length > 0 && (
              <div className="flex flex-wrap gap-1.5 pt-1">
                {selectedCrops.map((c, idx) => (
                  <span
                    key={idx}
                    className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs bg-white text-gray-900 border border-emerald-300 font-medium"
                  >
                    <strong>{c.commodity}</strong>
                    {c.variety && <span className="text-gray-500 text-[10px]">({c.variety})</span>}
                    <button
                      type="button"
                      onClick={() => removeCrop(idx)}
                      className="text-gray-400 hover:text-red-600"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Password Fields */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label={t.auth.password}
              name="password"
              type="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="••••••••"
              required
            />

            <Input
              label={t.auth.confirmPassword}
              name="confirmPassword"
              type="password"
              value={formData.confirmPassword}
              onChange={handleChange}
              placeholder="••••••••"
              required
            />
          </div>

          <Button
            type="submit"
            variant="primary"
            size="lg"
            isLoading={loading}
            className="mt-3 w-full text-base font-semibold bg-[#176B45] hover:bg-[#125335] text-white min-h-[48px]"
          >
            {t.auth.submitRegister}
          </Button>
        </form>

        <div className="mt-6 pt-5 border-t border-warm-300 text-center">
          <Link
            to="/login"
            className="text-sm font-semibold text-forest-700 hover:text-forest-800 hover:underline inline-block py-1"
          >
            {t.auth.haveAccount}
          </Link>
        </div>
      </Card>
    </div>
  );
};
