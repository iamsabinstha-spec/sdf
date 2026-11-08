import React, { useState } from 'react';
import { LogIn, Shield, UserCheck, KeyRound, Droplets, X } from 'lucide-react';
import { UserSession, OrganizationSettings } from '../types';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  currentSession: UserSession;
  onLogin: (session: UserSession) => void;
  settings: OrganizationSettings;
}

export const LoginModal: React.FC<Props> = ({
  isOpen,
  onClose,
  currentSession,
  onLogin,
  settings,
}) => {
  const [role, setRole] = useState<UserSession['role']>(currentSession.role || 'व्यवस्थापक / Admin');
  const [username, setUsername] = useState(currentSession.username || 'admin');
  const [password, setPassword] = useState('12345');
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!password) {
      setError('कृपया पासवर्ड प्रविष्ट गर्नुहोस्');
      return;
    }

    let fullName = 'रामबहादुर श्रेष्ठ';
    if (role === 'खजाञ्ची / Cashier') fullName = 'हरिप्रसाद दाहाल';
    if (role === 'मिटर रिडर') fullName = 'दिलमाया श्रेष्ठ';

    onLogin({
      username: username || 'user',
      fullName,
      role,
      isLoggedIn: true,
    });
    setError('');
    onClose();
  };

  const handleQuickSwitch = (selectedRole: UserSession['role'], user: string, name: string) => {
    setRole(selectedRole);
    setUsername(user);
    setPassword('12345');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-xs">
      <div className="relative w-full max-w-md rounded-2xl bg-white shadow-2xl overflow-hidden border border-slate-200">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-700 to-indigo-800 p-6 text-white text-center relative">
          <button
            onClick={onClose}
            className="absolute right-4 top-4 rounded-xl p-1.5 text-blue-200 hover:bg-white/10 hover:text-white"
          >
            <X className="h-5 w-5" />
          </button>
          <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 shadow-inner">
            <Droplets className="h-8 w-8 text-cyan-300" />
          </div>
          <h2 className="text-lg font-bold text-white">सफ्टवेयर प्रयोगकर्ता लगइन</h2>
          <p className="text-xs text-blue-100 mt-1">{settings.name}</p>
        </div>

        {/* Quick Role Selection Badges */}
        <div className="bg-slate-50 p-4 border-b border-slate-200">
          <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-2">
            द्रुत भूमिका छनौट (Quick Role Demo):
          </label>
          <div className="grid grid-cols-3 gap-2">
            <button
              type="button"
              onClick={() => handleQuickSwitch('व्यवस्थापक / Admin', 'admin', 'रामबहादुर श्रेष्ठ')}
              className={`rounded-xl p-2 text-xs font-bold border transition text-center ${
                role === 'व्यवस्थापक / Admin'
                  ? 'bg-blue-600 text-white border-blue-600 shadow-sm'
                  : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-100'
              }`}
            >
              व्यवस्थापक
            </button>
            <button
              type="button"
              onClick={() => handleQuickSwitch('खजाञ्ची / Cashier', 'cashier', 'हरिप्रसाद दाहाल')}
              className={`rounded-xl p-2 text-xs font-bold border transition text-center ${
                role === 'खजाञ्ची / Cashier'
                  ? 'bg-blue-600 text-white border-blue-600 shadow-sm'
                  : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-100'
              }`}
            >
              खजाञ्ची
            </button>
            <button
              type="button"
              onClick={() => handleQuickSwitch('मिटर रिडर', 'reader', 'दिलमाया श्रेष्ठ')}
              className={`rounded-xl p-2 text-xs font-bold border transition text-center ${
                role === 'मिटर रिडर'
                  ? 'bg-blue-600 text-white border-blue-600 shadow-sm'
                  : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-100'
              }`}
            >
              मिटर रिडर
            </button>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="rounded-xl bg-rose-50 border border-rose-200 p-2.5 text-xs text-rose-700 font-medium">
              {error}
            </div>
          )}

          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1">
              प्रयोगकर्ता नाम (Username)
            </label>
            <div className="relative">
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                className="w-full rounded-xl border border-slate-300 py-2.5 pl-9 pr-3 text-xs font-semibold text-slate-900 focus:border-blue-600 focus:outline-hidden"
              />
              <UserCheck className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
            </div>
          </div>

          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1">
              गोप्य पासवर्ड (Password)
            </label>
            <div className="relative">
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full rounded-xl border border-slate-300 py-2.5 pl-9 pr-3 text-xs text-slate-900 focus:border-blue-600 focus:outline-hidden"
              />
              <KeyRound className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
            </div>
            <p className="text-[11px] text-slate-400 mt-1">नमुना पासवर्ड: 12345</p>
          </div>

          <div className="pt-2">
            <button
              type="submit"
              className="w-full flex items-center justify-center gap-2 rounded-xl bg-blue-600 py-3 text-xs font-bold text-white shadow-md shadow-blue-500/20 hover:bg-blue-700 transition"
            >
              <LogIn className="h-4 w-4" />
              <span>प्रणालीमा सुरक्षित प्रवेश गर्नुहोस्</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
