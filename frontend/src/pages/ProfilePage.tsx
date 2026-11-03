import React, { useState } from 'react';
import { useAuth } from '../app/AuthContext';
import { useLanguage } from '../app/LanguageContext';
import type { SupportedLanguage } from '../types/auth';
import { farmerService } from '../services/farmerService';
import { sarvamService } from '../services/sarvamService';
import { Card } from '../components/Card';
import { Input } from '../components/Input';
import { Button } from '../components/Button';
import { Badge } from '../components/Badge';
import { VoiceDictationButton } from '../components/VoiceDictationButton';
import { User, MapPin, Calendar, CheckCircle2, AlertCircle, Edit3, Sprout, Plus, X } from 'lucide-react';

const MAHARASHTRA_DISTRICTS = [
  'Ahmednagar', 'Akola', 'Amravati', 'Chhatrapati Sambhajinagar', 'Beed', 'Bhandara',
  'Buldhana', 'Chandrapur', 'Dhule', 'Gadchiroli', 'Gondia', 'Hingoli', 'Jalgaon',
  'Jalna', 'Kolhapur', 'Latur', 'Mumbai City', 'Mumbai Suburban', 'Nagpur', 'Nanded',
  'Nandurbar', 'Nashik', 'Dharashiv', 'Palghar', 'Parbhani', 'Pune', 'Raigad',
  'Ratnagiri', 'Sangli', 'Satara', 'Sindhudurg', 'Solapur', 'Thane', 'Wardha',
  'Washim', 'Yavatmal'
];

export const ProfilePage: React.FC = () => {
  const { user, profile, updateLocalProfile } = useAuth();
  const { setLanguage, t, language } = useLanguage();

  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    displayName: profile?.display_name || '',
    phoneNumber: profile?.phone_number || '',
    state: profile?.state || 'Maharashtra',
    district: profile?.district || 'Nashik',
    village: profile?.village || '',
    locality: profile?.locality || '',
    preferredLanguage: (profile?.preferred_language || 'mr-IN') as SupportedLanguage,
  });

  const [crops, setCrops] = useState<Array<{ commodity: string; variety?: string }>>(
    (profile?.commonly_grown_crops as any) || [{ commodity: 'Onion', variety: 'Red Garwa' }]
  );
  const [newCropName, setNewCropName] = useState('');
  const [newVariety, setNewVariety] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleAddCrop = () => {
    if (!newCropName.trim()) return;
    setCrops((prev) => [
      ...prev,
      { commodity: newCropName.trim(), variety: newVariety.trim() || 'Standard' },
    ]);
    setNewCropName('');
    setNewVariety('');
  };

  const handleRemoveCrop = (idx: number) => {
    setCrops((prev) => prev.filter((_, i) => i !== idx));
  };

  const handleVoiceCrops = async (transcript: string) => {
    try {
      const res = await sarvamService.extractCrops(transcript, language);
      if (res.crops && res.crops.length > 0) {
        setCrops((prev) => {
          const combined = [...prev];
          for (const nc of res.crops) {
            if (!combined.some((c) => c.commodity.toLowerCase() === nc.commodity.toLowerCase())) {
              combined.push(nc);
            }
          }
          return combined;
        });
      }
    } catch (err) {
      console.warn('Voice crops error:', err);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSuccessMsg(null);
    setErrorMsg(null);

    if (!formData.displayName.trim() || !formData.village.trim() || !formData.district) {
      setErrorMsg('कृपया नाव, जिल्हा व गाव आवश्यक भरा / Please complete required fields.');
      return;
    }

    try {
      setLoading(true);
      const updated = await farmerService.updateProfile({
        display_name: formData.displayName.trim(),
        phone_number: formData.phoneNumber.trim() || undefined,
        state: formData.state,
        district: formData.district,
        village: formData.village.trim(),
        locality: formData.locality.trim() || undefined,
        preferred_language: formData.preferredLanguage,
        commonly_grown_crops: crops,
      });

      updateLocalProfile(updated);
      setLanguage(formData.preferredLanguage);
      setSuccessMsg(t.profile.updateSuccess);
      setIsEditing(false);
    } catch (err: any) {
      setErrorMsg(err.message || 'प्रोफाईल अद्यतनित करताना त्रुटी आली.');
    } finally {
      setLoading(false);
    }
  };

  const formattedDate = user?.created_at
    ? new Date(user.created_at).toLocaleDateString('mr-IN', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      })
    : '';

  return (
    <div className="max-w-3xl mx-auto flex flex-col gap-6 pb-12">
      {/* Profile Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-warm-300 shadow-sm">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-forest-600 text-white flex items-center justify-center font-bold text-2xl shadow-sm">
            {profile?.display_name ? profile.display_name.charAt(0).toUpperCase() : 'श'}
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-charcoal-900">
              {profile?.display_name || user?.username}
            </h1>
            <p className="text-xs sm:text-sm text-charcoal-700 mt-0.5">
              @{user?.username} • {profile?.district}, {profile?.state}
            </p>
          </div>
        </div>

        {!isEditing && (
          <Button
            variant="outline"
            onClick={() => setIsEditing(true)}
            className="self-start sm:self-auto min-h-[44px]"
          >
            <Edit3 className="w-4 h-4 mr-2" />
            {t.profile.editProfile}
          </Button>
        )}
      </div>

      {successMsg && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center gap-2.5 text-sm text-emerald-800">
          <CheckCircle2 className="w-5 h-5 shrink-0 text-emerald-600" />
          <span>{successMsg}</span>
        </div>
      )}

      {errorMsg && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-xl flex items-center gap-2.5 text-sm text-red-700">
          <AlertCircle className="w-5 h-5 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Profile Details or Edit Form */}
      {isEditing ? (
        <Card>
          <h2 className="text-lg font-bold text-charcoal-900 mb-4 pb-2 border-b border-warm-300">
            {t.profile.editProfile}
          </h2>

          <form onSubmit={handleSave} className="flex flex-col gap-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="relative">
                <Input
                  label={t.auth.displayName}
                  name="displayName"
                  type="text"
                  value={formData.displayName}
                  onChange={handleChange}
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
                label={t.auth.phoneNumber}
                name="phoneNumber"
                type="tel"
                value={formData.phoneNumber}
                onChange={handleChange}
                optional
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="w-full flex flex-col gap-1.5 text-left">
                <label htmlFor="pref-lang-edit" className="text-sm font-semibold text-charcoal-800">
                  {t.auth.preferredLanguage}
                </label>
                <select
                  id="pref-lang-edit"
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

              <div className="w-full flex flex-col gap-1.5 text-left">
                <label htmlFor="district-select-edit" className="text-sm font-semibold text-charcoal-800">
                  {t.auth.district}
                </label>
                <select
                  id="district-select-edit"
                  name="district"
                  value={formData.district}
                  onChange={handleChange}
                  className="w-full min-h-[48px] px-4 py-2.5 rounded-xl border border-warm-400 bg-white text-charcoal-900 text-base shadow-sm focus:outline-none focus:border-forest-600 focus:ring-2 focus:ring-forest-100"
                >
                  {MAHARASHTRA_DISTRICTS.map((d) => (
                    <option key={d} value={d}>
                      {d}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="relative">
                <Input
                  label={t.auth.village}
                  name="village"
                  type="text"
                  value={formData.village}
                  onChange={handleChange}
                  required
                />
                <div className="absolute top-8 right-2">
                  <VoiceDictationButton
                    size="sm"
                    onTranscript={(txt) => setFormData((p) => ({ ...p, village: txt }))}
                  />
                </div>
              </div>

              <Input
                label={t.auth.locality}
                name="locality"
                type="text"
                value={formData.locality}
                onChange={handleChange}
                optional
              />
            </div>

            {/* Commonly Grown Crops Management */}
            <div className="p-4 bg-[#EAF3EA] rounded-xl border border-emerald-300 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-[#176B45] flex items-center gap-1.5 uppercase">
                  <Sprout className="w-4 h-4" /> मुख्य शेतीमाल / पिके (Commonly Grown Crops)
                </span>
                <span className="text-[11px] text-emerald-800">बोलून किंवा टाईप करून जोडा</span>
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="text"
                  placeholder="पीक (उदा. कांदा / सोयाबीन)"
                  value={newCropName}
                  onChange={(e) => setNewCropName(e.target.value)}
                  className="flex-1 px-3 py-2 text-xs rounded-lg border border-gray-300 bg-white"
                />
                <input
                  type="text"
                  placeholder="जात (उदा. लाल गरवा)"
                  value={newVariety}
                  onChange={(e) => setNewVariety(e.target.value)}
                  className="w-28 px-3 py-2 text-xs rounded-lg border border-gray-300 bg-white"
                />
                <button
                  type="button"
                  onClick={handleAddCrop}
                  className="p-2 bg-[#176B45] text-white rounded-lg hover:bg-emerald-800 cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                </button>
                <VoiceDictationButton size="sm" onTranscript={handleVoiceCrops} />
              </div>

              <div className="flex flex-wrap gap-2 pt-1">
                {crops.map((c, i) => (
                  <span
                    key={i}
                    className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs bg-white text-gray-900 border border-emerald-300 font-medium"
                  >
                    <strong>{typeof c === 'string' ? c : c.commodity}</strong>
                    {typeof c !== 'string' && c.variety && (
                      <span className="text-gray-500 text-[10px]">({c.variety})</span>
                    )}
                    <button
                      type="button"
                      onClick={() => handleRemoveCrop(i)}
                      className="text-gray-400 hover:text-red-600"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </span>
                ))}
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-4 border-t border-warm-300">
              <Button
                type="button"
                variant="secondary"
                onClick={() => setIsEditing(false)}
                className="min-h-[44px]"
              >
                {t.common.cancel}
              </Button>
              <Button
                type="submit"
                variant="primary"
                isLoading={loading}
                className="bg-[#176B45] text-white min-h-[44px]"
              >
                {t.profile.saveChanges}
              </Button>
            </div>
          </form>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <div className="flex items-center gap-2 mb-4 pb-2 border-b border-warm-300 text-forest-700 font-bold">
              <User className="w-5 h-5" />
              <h2>{t.profile.accountDetails}</h2>
            </div>

            <div className="flex flex-col gap-3 text-sm">
              <div className="flex justify-between py-1 border-b border-warm-200">
                <span className="text-charcoal-700">{t.auth.displayName}</span>
                <span className="font-semibold text-charcoal-900">{profile?.display_name}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-warm-200">
                <span className="text-charcoal-700">{t.auth.username}</span>
                <span className="font-semibold text-charcoal-900">{user?.username}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-warm-200">
                <span className="text-charcoal-700">{t.auth.phoneNumber}</span>
                <span className="font-semibold text-charcoal-900">{profile?.phone_number || '—'}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-warm-200">
                <span className="text-charcoal-700">{t.auth.preferredLanguage}</span>
                <span className="font-semibold text-charcoal-900">
                  {profile?.preferred_language === 'mr-IN'
                    ? 'मराठी'
                    : profile?.preferred_language === 'hi-IN'
                    ? 'हिन्दी'
                    : 'English'}
                </span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-charcoal-700 flex items-center gap-1">
                  <Calendar className="w-4 h-4" /> {t.profile.memberSince}
                </span>
                <span className="font-semibold text-charcoal-900">{formattedDate}</span>
              </div>
            </div>
          </Card>

          <Card>
            <div className="flex items-center gap-2 mb-4 pb-2 border-b border-warm-300 text-forest-700 font-bold">
              <MapPin className="w-5 h-5" />
              <h2>{t.profile.locationInfo}</h2>
            </div>

            <div className="flex flex-col gap-3 text-sm">
              <div className="flex justify-between py-1 border-b border-warm-200">
                <span className="text-charcoal-700">{t.auth.state}</span>
                <span className="font-semibold text-charcoal-900">{profile?.state}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-warm-200">
                <span className="text-charcoal-700">{t.auth.district}</span>
                <span className="font-semibold text-charcoal-900">{profile?.district}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-warm-200">
                <span className="text-charcoal-700">{t.auth.village}</span>
                <span className="font-semibold text-charcoal-900">{profile?.village}</span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-charcoal-700">{t.auth.locality}</span>
                <span className="font-semibold text-charcoal-900">{profile?.locality || '—'}</span>
              </div>
            </div>

            {/* Commonly Grown Crops View */}
            <div className="mt-4 pt-4 border-t border-gray-100">
              <span className="text-xs font-bold text-[#176B45] flex items-center gap-1 mb-2">
                <Sprout className="w-4 h-4" /> मुख्य पिके (Commonly Grown Crops):
              </span>
              <div className="flex flex-wrap gap-1.5">
                {crops.length > 0 ? (
                  crops.map((c, i) => (
                    <span
                      key={i}
                      className="px-2.5 py-1 bg-emerald-50 text-emerald-800 rounded-lg text-xs font-medium border border-emerald-200"
                    >
                      {typeof c === 'string' ? c : c.commodity}
                      {typeof c !== 'string' && c.variety && ` (${c.variety})`}
                    </span>
                  ))
                ) : (
                  <span className="text-xs text-gray-400">कोणतीही पिके नोंदवलेली नाहीत.</span>
                )}
              </div>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
};
