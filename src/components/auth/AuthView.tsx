import React, { useState } from 'react';
import { useCRM } from '../../context/CRMContext';
import { UserRole, Language } from '../../types';
import {
  Building2, Lock, Mail, User as UserIcon, Shield, Sparkles, CheckCircle2,
  Eye, EyeOff, ArrowRight, UserCheck, KeyRound, Globe, HelpCircle
} from 'lucide-react';

export const AuthView: React.FC = () => {
  const { login, register, loginAsRole, t, language, setLanguage } = useCRM();

  const [mode, setMode] = useState<'LOGIN' | 'REGISTER'>('LOGIN');

  // Login form state
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [showLoginPassword, setShowLoginPassword] = useState(false);
  const [loginError, setLoginError] = useState<string | null>(null);

  // Register form state
  const [regName, setRegName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('123');
  const [showRegPassword, setShowRegPassword] = useState(false);
  const [regRole, setRegRole] = useState<UserRole>('OWNER');
  const [regCompany, setRegCompany] = useState('');
  const [regError, setRegError] = useState<string | null>(null);

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError(null);
    if (!loginEmail) {
      setLoginError(language === 'tr' ? 'Lütfen e-posta adresinizi girin.' : 'Please enter your email.');
      return;
    }
    const res = login(loginEmail, loginPassword || '123');
    if (!res.success) {
      setLoginError(t(res.error || 'invalidCredentials'));
    }
  };

  const handleRegisterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setRegError(null);
    if (!regName || !regEmail) {
      setRegError(language === 'tr' ? 'Lütfen tüm zorunlu alanları doldurun.' : 'Please fill all required fields.');
      return;
    }
    const res = register({
      name: regName,
      email: regEmail,
      password: regPassword || '123',
      role: regRole,
      companyName: regCompany,
    });
    if (!res.success) {
      setRegError(res.error || 'Registration failed');
    }
  };

  const testRoles: {
    role: UserRole;
    name: string;
    email: string;
    descTr: string;
    descEn: string;
    badgeColor: string;
  }[] = [
    {
      role: 'OWNER',
      name: 'Sarah Connor',
      email: 'sarah.connor@acmecloud.com',
      descTr: 'Şirket Kurucusu / Tam Yetkili Sahip',
      descEn: 'Company Owner & Full System Admin',
      badgeColor: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
    },
    {
      role: 'ADMIN',
      name: 'Marcus Vance',
      email: 'marcus.vance@acmecloud.com',
      descTr: 'Sistem Yöneticisi & Ayarlar',
      descEn: 'System Administrator & Settings',
      badgeColor: 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20',
    },
    {
      role: 'SALES_REP',
      name: 'Elena Rostova',
      email: 'elena.rostova@acmecloud.com',
      descTr: 'Satış Temsilcisi (Fırsatlar & Müşteriler)',
      descEn: 'Sales Representative & CRM Deals',
      badgeColor: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
    },
    {
      role: 'READ_ONLY',
      name: 'David Kim',
      email: 'david.kim@acmecloud.com',
      descTr: 'Sadece Okuma (Salt Okunur Denetçi)',
      descEn: 'Read Only Viewer & Auditor',
      badgeColor: 'bg-slate-500/10 text-slate-400 border-slate-500/20',
    },
  ];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-between selection:bg-indigo-500 selection:text-white">
      {/* Top Header Bar */}
      <header className="px-6 py-4 flex items-center justify-between border-b border-slate-800/80 bg-slate-900/40 backdrop-blur-md">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center text-white shadow-lg shadow-indigo-500/20 font-bold text-xl">
            C
          </div>
          <div>
            <h1 className="font-bold text-lg leading-tight tracking-tight text-white flex items-center gap-2">
              {t('appTitle')}
              <span className="text-xs px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 font-medium border border-indigo-500/30">
                v2.5
              </span>
            </h1>
            <p className="text-xs text-slate-400">
              {language === 'tr' ? 'Çok Kanallı KOBİ Müşteri Yönetim Platformu' : 'Omnichannel SMB CRM Platform'}
            </p>
          </div>
        </div>

        {/* Language Switcher */}
        <div className="flex items-center gap-2 bg-slate-900/80 p-1.5 rounded-xl border border-slate-800">
          <Globe className="w-4 h-4 text-slate-400 ml-1" />
          {(['tr', 'en', 'de'] as Language[]).map((lang) => (
            <button
              key={lang}
              onClick={() => setLanguage(lang)}
              className={`px-2.5 py-1 text-xs font-semibold rounded-lg transition-all ${
                language === lang
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
              }`}
            >
              {lang.toUpperCase()}
            </button>
          ))}
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-6xl w-full mx-auto px-4 py-8 flex-1 flex flex-col lg:flex-row items-stretch justify-center gap-8">
        
        {/* Left Side: Auth Card Form */}
        <div className="w-full lg:w-[480px] bg-slate-900/90 border border-slate-800 rounded-2xl shadow-2xl p-6 sm:p-8 flex flex-col justify-between backdrop-blur-xl">
          <div>
            {/* Mode Switcher Tabs */}
            <div className="grid grid-cols-2 p-1 bg-slate-950/80 rounded-xl border border-slate-800/80 mb-6">
              <button
                type="button"
                onClick={() => {
                  setMode('LOGIN');
                  setLoginError(null);
                }}
                className={`py-2.5 text-sm font-semibold rounded-lg transition-all flex items-center justify-center gap-2 ${
                  mode === 'LOGIN'
                    ? 'bg-indigo-600 text-white shadow-md'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
                }`}
              >
                <KeyRound className="w-4 h-4" />
                {t('login')}
              </button>
              <button
                type="button"
                onClick={() => {
                  setMode('REGISTER');
                  setRegError(null);
                }}
                className={`py-2.5 text-sm font-semibold rounded-lg transition-all flex items-center justify-center gap-2 ${
                  mode === 'REGISTER'
                    ? 'bg-indigo-600 text-white shadow-md'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
                }`}
              >
                <UserCheck className="w-4 h-4" />
                {t('register')}
              </button>
            </div>

            {/* Mode Title */}
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-white tracking-tight">
                {mode === 'LOGIN'
                  ? (language === 'tr' ? 'Hesabınıza Giriş Yapın' : 'Welcome Back')
                  : (language === 'tr' ? 'Yeni CRM Hesabı Oluşturun' : 'Create Your CRM Account')}
              </h2>
              <p className="text-sm text-slate-400 mt-1">
                {mode === 'LOGIN'
                  ? (language === 'tr' ? 'E-posta ve şifrenizle giriş yapın veya sağdaki test kullanıcılarını seçin.' : 'Sign in with your email or pick a test user below.')
                  : (language === 'tr' ? 'Ücretsiz hesabınızı başlatın ve CRM özelliklerini deneyimleyin.' : 'Set up your company profile and start managing customers.')}
              </p>
            </div>

            {/* LOGIN FORM */}
            {mode === 'LOGIN' && (
              <form onSubmit={handleLoginSubmit} className="space-y-4">
                {loginError && (
                  <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs flex items-center gap-2">
                    <HelpCircle className="w-4 h-4 shrink-0 text-rose-400" />
                    <span>{loginError}</span>
                  </div>
                )}

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    {t('emailAddress')}
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      type="email"
                      value={loginEmail}
                      onChange={(e) => setLoginEmail(e.target.value)}
                      placeholder="sarah.connor@acmecloud.com"
                      className="w-full bg-slate-950/80 border border-slate-800 rounded-xl py-2.5 pl-10 pr-4 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                    />
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-xs font-semibold text-slate-300">
                      {t('password')}
                    </label>
                    <span className="text-[11px] text-indigo-400 font-medium">
                      {language === 'tr' ? 'Varsayılan Şifre: 123' : 'Default Password: 123'}
                    </span>
                  </div>
                  <div className="relative">
                    <Lock className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      type={showLoginPassword ? 'text' : 'password'}
                      value={loginPassword}
                      onChange={(e) => setLoginPassword(e.target.value)}
                      placeholder="123"
                      className="w-full bg-slate-950/80 border border-slate-800 rounded-xl py-2.5 pl-10 pr-10 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                    />
                    <button
                      type="button"
                      onClick={() => setShowLoginPassword(!showLoginPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200 p-1"
                    >
                      {showLoginPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full py-3 bg-indigo-600 hover:bg-indigo-500 active:bg-indigo-700 text-white font-semibold text-sm rounded-xl shadow-lg shadow-indigo-600/30 transition-all flex items-center justify-center gap-2 mt-2"
                >
                  {t('login')}
                  <ArrowRight className="w-4 h-4" />
                </button>
              </form>
            )}

            {/* REGISTER FORM */}
            {mode === 'REGISTER' && (
              <form onSubmit={handleRegisterSubmit} className="space-y-3.5">
                {regError && (
                  <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs flex items-center gap-2">
                    <HelpCircle className="w-4 h-4 shrink-0 text-rose-400" />
                    <span>{regError}</span>
                  </div>
                )}

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    {t('fullName')} *
                  </label>
                  <div className="relative">
                    <UserIcon className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      type="text"
                      required
                      value={regName}
                      onChange={(e) => setRegName(e.target.value)}
                      placeholder="Ahmet Yılmaz"
                      className="w-full bg-slate-950/80 border border-slate-800 rounded-xl py-2 pl-10 pr-4 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    {t('emailAddress')} *
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      type="email"
                      required
                      value={regEmail}
                      onChange={(e) => setRegEmail(e.target.value)}
                      placeholder="ahmet@sirketiniz.com"
                      className="w-full bg-slate-950/80 border border-slate-800 rounded-xl py-2 pl-10 pr-4 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">
                      {t('password')}
                    </label>
                    <div className="relative">
                      <Lock className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                      <input
                        type={showRegPassword ? 'text' : 'password'}
                        value={regPassword}
                        onChange={(e) => setRegPassword(e.target.value)}
                        placeholder="123"
                        className="w-full bg-slate-950/80 border border-slate-800 rounded-xl py-2 pl-9 pr-8 text-sm text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      />
                      <button
                        type="button"
                        onClick={() => setShowRegPassword(!showRegPassword)}
                        className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200"
                      >
                        {showRegPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">
                      {t('selectRole')}
                    </label>
                    <select
                      value={regRole}
                      onChange={(e) => setRegRole(e.target.value as UserRole)}
                      className="w-full bg-slate-950/80 border border-slate-800 rounded-xl py-2 px-3 text-sm text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    >
                      <option value="OWNER">OWNER (Şirket Sahibi)</option>
                      <option value="ADMIN">ADMIN (Yönetici)</option>
                      <option value="SALES_REP">SALES_REP (Satış)</option>
                      <option value="READ_ONLY">READ_ONLY (Okuma)</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    {t('companyName')}
                  </label>
                  <div className="relative">
                    <Building2 className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      type="text"
                      value={regCompany}
                      onChange={(e) => setRegCompany(e.target.value)}
                      placeholder="Örn: Nexus Teknoloji A.Ş."
                      className="w-full bg-slate-950/80 border border-slate-800 rounded-xl py-2 pl-10 pr-4 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-500 active:bg-indigo-700 text-white font-semibold text-sm rounded-xl shadow-lg shadow-indigo-600/30 transition-all flex items-center justify-center gap-2 mt-2"
                >
                  {t('register')}
                  <ArrowRight className="w-4 h-4" />
                </button>
              </form>
            )}
          </div>

          {/* Bottom Switch Link */}
          <div className="pt-6 border-t border-slate-800/60 mt-6 text-center text-xs text-slate-400">
            {mode === 'LOGIN' ? (
              <p>
                {t('dontHaveAccount')}{' '}
                <button
                  type="button"
                  onClick={() => setMode('REGISTER')}
                  className="text-indigo-400 hover:text-indigo-300 font-semibold underline underline-offset-2 ml-1"
                >
                  {t('register')}
                </button>
              </p>
            ) : (
              <p>
                {t('alreadyHaveAccount')}{' '}
                <button
                  type="button"
                  onClick={() => setMode('LOGIN')}
                  className="text-indigo-400 hover:text-indigo-300 font-semibold underline underline-offset-2 ml-1"
                >
                  {t('login')}
                </button>
              </p>
            )}
          </div>
        </div>

        {/* Right Side: Quick Test Users Selection & Info Banner */}
        <div className="flex-1 flex flex-col justify-between bg-slate-900/40 border border-slate-800/80 rounded-2xl p-6 sm:p-8 backdrop-blur-md">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400">
                  <Shield className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-white text-base tracking-tight">
                    {t('testAccounts')}
                  </h3>
                  <p className="text-xs text-slate-400">
                    {language === 'tr'
                      ? 'Tek tıkla istediğiniz rol ile anında giriş yapın. Tüm hesap şifreleri: "123"'
                      : 'Click any user role below to instantly test authorization. All passwords: "123"'}
                  </p>
                </div>
              </div>
            </div>

            {/* Test User Role Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 mt-4">
              {testRoles.map((tUser) => (
                <div
                  key={tUser.role}
                  className="group bg-slate-900/80 hover:bg-slate-800/90 border border-slate-800 hover:border-indigo-500/50 rounded-xl p-4 transition-all duration-200 flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between gap-2 mb-2">
                      <span className={`text-[10px] font-bold tracking-wider px-2 py-0.5 rounded-md border ${tUser.badgeColor}`}>
                        {tUser.role}
                      </span>
                      <span className="text-[10px] text-slate-400 font-mono">
                        {language === 'tr' ? 'Şifre: 123' : 'Pass: 123'}
                      </span>
                    </div>

                    <h4 className="font-semibold text-sm text-slate-100 group-hover:text-indigo-300 transition-colors">
                      {tUser.name}
                    </h4>
                    <p className="text-xs text-slate-400 font-mono truncate mt-0.5">
                      {tUser.email}
                    </p>
                    <p className="text-[11px] text-slate-400 mt-2 line-clamp-2 leading-relaxed">
                      {language === 'tr' ? tUser.descTr : tUser.descEn}
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() => loginAsRole(tUser.role)}
                    className="mt-4 w-full py-2 px-3 bg-slate-800 hover:bg-indigo-600 text-slate-200 hover:text-white font-medium text-xs rounded-lg border border-slate-700/80 hover:border-indigo-500 transition-all flex items-center justify-center gap-1.5 shadow-sm"
                  >
                    <Sparkles className="w-3.5 h-3.5 text-amber-400 group-hover:text-white" />
                    {language === 'tr' ? `${tUser.role} Olarak Giriş Yap` : `Log in as ${tUser.role}`}
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Bottom Security Note */}
          <div className="mt-8 pt-4 border-t border-slate-800/60 flex items-center justify-between text-xs text-slate-400">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>
                {language === 'tr'
                  ? 'Kullanıcı Rolleri Bazlı Erişim Kontrolü (RBAC) Etkindir.'
                  : 'Role-Based Access Control (RBAC) Enabled.'}
              </span>
            </div>
            <div className="text-[11px] font-mono text-slate-400">
              Pass: <span className="text-amber-300 font-bold">123</span>
            </div>
          </div>
        </div>

      </main>

      {/* Footer */}
      <footer className="px-6 py-4 border-t border-slate-800/60 text-center text-xs text-slate-400 bg-slate-950/60">
        <p>© 2026 Compact SMB CRM Platform. {language === 'tr' ? 'Tüm Hakları Saklıdır.' : 'All rights reserved.'}</p>
      </footer>
    </div>
  );
};
