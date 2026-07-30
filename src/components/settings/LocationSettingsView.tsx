import React, { useState } from 'react';
import { useCRM } from '../../context/CRMContext';
import {
  Globe, Building, Compass, Plus, Trash2, Edit2, Download, Upload,
  CheckCircle2, AlertCircle, FileSpreadsheet, X, Search, Layers
} from 'lucide-react';

export const LocationSettingsView: React.FC = () => {
  const {
    countries,
    cities,
    districts,
    addCountry,
    updateCountry,
    deleteCountry,
    addCity,
    updateCity,
    deleteCity,
    addDistrict,
    updateDistrict,
    deleteDistrict,
    exportLocationsCsv,
    importLocationsCsv,
  } = useCRM();

  const [activeTab, setActiveTab] = useState<'HIERARCHY' | 'COUNTRIES' | 'CITIES' | 'DISTRICTS'>('HIERARCHY');

  // Search filter
  const [search, setSearch] = useState('');

  // Add / Edit Forms
  const [countryName, setCountryName] = useState('');
  const [countryCode, setCountryCode] = useState('');
  const [editingCountryId, setEditingCountryId] = useState<string | null>(null);

  const [cityCountryId, setCityCountryId] = useState('');
  const [cityName, setCityName] = useState('');
  const [editingCityId, setEditingCityId] = useState<string | null>(null);

  const [districtCityId, setDistrictCityId] = useState('');
  const [districtName, setDistrictName] = useState('');
  const [editingDistrictId, setEditingDistrictId] = useState<string | null>(null);

  // CSV Modals & Status
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [csvText, setCsvText] = useState('');
  const [importReport, setImportReport] = useState<{
    importedCountries: number;
    importedCities: number;
    importedDistricts: number;
    errors: string[];
  } | null>(null);

  // Notification
  const [notification, setNotification] = useState<string | null>(null);

  const showNotice = (msg: string) => {
    setNotification(msg);
    setTimeout(() => setNotification(null), 3000);
  };

  // Handlers
  const handleSaveCountry = (e: React.FormEvent) => {
    e.preventDefault();
    if (!countryName.trim()) return;
    if (editingCountryId) {
      updateCountry(editingCountryId, { name: countryName, code: countryCode || countryName.slice(0, 2).toUpperCase() });
      showNotice('Ülke kaydı güncellendi.');
    } else {
      addCountry({ name: countryName, code: countryCode || countryName.slice(0, 2).toUpperCase() });
      showNotice('Yeni ülke eklendi.');
    }
    setCountryName('');
    setCountryCode('');
    setEditingCountryId(null);
  };

  const handleSaveCity = (e: React.FormEvent) => {
    e.preventDefault();
    if (!cityName.trim() || !cityCountryId) return;
    const country = countries.find((c) => c.id === cityCountryId);
    if (editingCityId) {
      updateCity(editingCityId, { countryId: cityCountryId, countryName: country?.name, name: cityName });
      showNotice('Şehir kaydı güncellendi.');
    } else {
      addCity({ countryId: cityCountryId, countryName: country?.name, name: cityName });
      showNotice('Yeni şehir eklendi.');
    }
    setCityName('');
    setEditingCityId(null);
  };

  const handleSaveDistrict = (e: React.FormEvent) => {
    e.preventDefault();
    if (!districtName.trim() || !districtCityId) return;
    const cityObj = cities.find((c) => c.id === districtCityId);
    if (editingDistrictId) {
      updateDistrict(editingDistrictId, {
        cityId: districtCityId,
        cityName: cityObj?.name,
        countryId: cityObj?.countryId,
        name: districtName,
      });
      showNotice('Semt / İlçe kaydı güncellendi.');
    } else {
      addDistrict({
        cityId: districtCityId,
        cityName: cityObj?.name,
        countryId: cityObj?.countryId,
        name: districtName,
      });
      showNotice('Yeni Semt / İlçe eklendi.');
    }
    setDistrictName('');
    setEditingDistrictId(null);
  };

  const handleExportCsv = () => {
    const csvContent = exportLocationsCsv();
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `lokasyonlar_hiyerarsi_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showNotice('CSV dışa aktarma başarıyla indirildi.');
  };

  const handleImportCsv = (e: React.FormEvent) => {
    e.preventDefault();
    if (!csvText.trim()) return;
    const result = importLocationsCsv(csvText);
    setImportReport(result);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      if (content) setCsvText(content);
    };
    reader.readAsText(file);
  };

  return (
    <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-2xs dark:border-slate-800 dark:bg-slate-900 space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-slate-100 pb-4 dark:border-slate-800">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600 dark:bg-indigo-950 dark:text-indigo-400">
            <Globe className="h-5 w-5" />
          </div>
          <div>
            <h2 className="font-bold text-sm text-slate-900 dark:text-slate-100">
              Adres & Lokasyon Hiyerarşisi (Ülke &gt; Şehir &gt; Semt / İlçe)
            </h2>
            <p className="text-xs text-slate-400">
              Sistem genelindeki adres alanlarında kullanılacak ilişkisel lokasyon verilerini tanımlayın.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              setCsvText('');
              setImportReport(null);
              setIsImportModalOpen(true);
            }}
            className="flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700 transition-all shadow-2xs"
          >
            <Upload className="h-3.5 w-3.5 text-indigo-600" />
            <span>CSV İçe Aktar (Import)</span>
          </button>

          <button
            onClick={handleExportCsv}
            className="flex items-center gap-1.5 rounded-xl bg-indigo-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-indigo-700 transition-all shadow-2xs"
          >
            <Download className="h-3.5 w-3.5" />
            <span>CSV Dışa Aktar (Export)</span>
          </button>
        </div>
      </div>

      {notification && (
        <div className="flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-xs font-semibold text-emerald-800 dark:border-emerald-900/60 dark:bg-emerald-950/60 dark:text-emerald-300">
          <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600" />
          <span>{notification}</span>
        </div>
      )}

      {/* Tabs */}
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-200/60 pb-3 dark:border-slate-800">
        <div className="flex items-center gap-1 bg-slate-100/80 p-1 rounded-xl dark:bg-slate-800/80">
          <button
            onClick={() => setActiveTab('HIERARCHY')}
            className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-bold transition-all ${
              activeTab === 'HIERARCHY'
                ? 'bg-white text-indigo-600 shadow-xs dark:bg-slate-900 dark:text-indigo-400'
                : 'text-slate-600 hover:text-slate-900 dark:text-slate-400'
            }`}
          >
            <Layers className="h-3.5 w-3.5" /> Hiyerarşik Görünüm
          </button>
          <button
            onClick={() => setActiveTab('COUNTRIES')}
            className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-bold transition-all ${
              activeTab === 'COUNTRIES'
                ? 'bg-white text-indigo-600 shadow-xs dark:bg-slate-900 dark:text-indigo-400'
                : 'text-slate-600 hover:text-slate-900 dark:text-slate-400'
            }`}
          >
            <Globe className="h-3.5 w-3.5" /> Ülkeler ({countries.length})
          </button>
          <button
            onClick={() => setActiveTab('CITIES')}
            className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-bold transition-all ${
              activeTab === 'CITIES'
                ? 'bg-white text-indigo-600 shadow-xs dark:bg-slate-900 dark:text-indigo-400'
                : 'text-slate-600 hover:text-slate-900 dark:text-slate-400'
            }`}
          >
            <Building className="h-3.5 w-3.5" /> Şehirler ({cities.length})
          </button>
          <button
            onClick={() => setActiveTab('DISTRICTS')}
            className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-bold transition-all ${
              activeTab === 'DISTRICTS'
                ? 'bg-white text-indigo-600 shadow-xs dark:bg-slate-900 dark:text-indigo-400'
                : 'text-slate-600 hover:text-slate-900 dark:text-slate-400'
            }`}
          >
            <Compass className="h-3.5 w-3.5" /> Semtler ({districts.length})
          </button>
        </div>

        {/* Search */}
        <div className="relative w-full sm:w-64">
          <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Lokasyonlarda ara..."
            className="w-full rounded-xl border border-slate-200 bg-slate-50 pl-8 pr-3 py-1.5 text-xs focus:border-indigo-500 focus:bg-white focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
          />
        </div>
      </div>

      {/* Tab 1: HIERARCHY TREE VIEW */}
      {activeTab === 'HIERARCHY' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Country Cards */}
            {countries
              .filter(
                (cntry) =>
                  !search ||
                  cntry.name.toLowerCase().includes(search.toLowerCase()) ||
                  cities.some(
                    (c) =>
                      c.countryId === cntry.id &&
                      (c.name.toLowerCase().includes(search.toLowerCase()) ||
                        districts.some(
                          (d) =>
                            d.cityId === c.id &&
                            d.name.toLowerCase().includes(search.toLowerCase())
                        ))
                  )
              )
              .map((country) => {
                const countryCities = cities.filter((c) => c.countryId === country.id);
                return (
                  <div
                    key={country.id}
                    className="rounded-2xl border border-slate-200 bg-slate-50/70 p-4 dark:border-slate-800 dark:bg-slate-800/40 space-y-3"
                  >
                    <div className="flex items-center justify-between border-b border-slate-200/80 pb-2 dark:border-slate-700/80">
                      <div className="flex items-center gap-2">
                        <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-indigo-100 text-xs font-bold text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300">
                          {country.code}
                        </span>
                        <h3 className="font-bold text-sm text-slate-900 dark:text-white">
                          {country.name}
                        </h3>
                      </div>
                      <span className="rounded-full bg-slate-200 px-2 py-0.5 text-[10px] font-bold text-slate-700 dark:bg-slate-700 dark:text-slate-300">
                        {countryCities.length} Şehir
                      </span>
                    </div>

                    <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
                      {countryCities.length === 0 ? (
                        <p className="text-xs text-slate-400 italic">Henüz şehir tanımlanmamış.</p>
                      ) : (
                        countryCities.map((city) => {
                          const cityDistricts = districts.filter((d) => d.cityId === city.id);
                          return (
                            <div
                              key={city.id}
                              className="rounded-xl border border-slate-200/60 bg-white p-2.5 shadow-2xs dark:border-slate-700 dark:bg-slate-800 space-y-1.5"
                            >
                              <div className="flex items-center justify-between font-bold text-xs text-slate-800 dark:text-slate-200">
                                <span className="flex items-center gap-1.5">
                                  <Building className="h-3.5 w-3.5 text-indigo-500" />
                                  {city.name}
                                </span>
                                <span className="text-[10px] text-slate-400 font-normal">
                                  {cityDistricts.length} Semt/İlçe
                                </span>
                              </div>

                              {cityDistricts.length > 0 && (
                                <div className="flex flex-wrap gap-1 pt-1">
                                  {cityDistricts.map((dist) => (
                                    <span
                                      key={dist.id}
                                      className="inline-flex items-center gap-1 rounded-md bg-slate-100 px-2 py-0.5 text-[10px] font-medium text-slate-700 dark:bg-slate-700/60 dark:text-slate-300"
                                    >
                                      <Compass className="h-2.5 w-2.5 text-slate-400" />
                                      {dist.name}
                                    </span>
                                  ))}
                                </div>
                              )}
                            </div>
                          );
                        })
                      )}
                    </div>
                  </div>
                );
              })}
          </div>
        </div>
      )}

      {/* Tab 2: COUNTRIES MANAGEMENT */}
      {activeTab === 'COUNTRIES' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {/* Form */}
          <div className="rounded-2xl border border-slate-200 bg-slate-50/50 p-4 dark:border-slate-800 dark:bg-slate-800/40 space-y-3">
            <h3 className="font-bold text-xs text-slate-900 dark:text-white flex items-center gap-1.5">
              <Plus className="h-4 w-4 text-indigo-600" />
              {editingCountryId ? 'Ülke Güncelle' : 'Yeni Ülke Ekle'}
            </h3>
            <form onSubmit={handleSaveCountry} className="space-y-3">
              <div>
                <label className="text-[11px] font-semibold text-slate-700 dark:text-slate-300">
                  Ülke Adı *
                </label>
                <input
                  type="text"
                  required
                  value={countryName}
                  onChange={(e) => setCountryName(e.target.value)}
                  placeholder="Örn: Türkiye, İtalya"
                  className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-1.5 text-xs text-slate-800 focus:border-indigo-500 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                />
              </div>

              <div>
                <label className="text-[11px] font-semibold text-slate-700 dark:text-slate-300">
                  Ülke Kodu (ISO 2-Harfli)
                </label>
                <input
                  type="text"
                  maxLength={2}
                  value={countryCode}
                  onChange={(e) => setCountryCode(e.target.value.toUpperCase())}
                  placeholder="Örn: TR, IT"
                  className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-1.5 text-xs text-slate-800 focus:border-indigo-500 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                />
              </div>

              <div className="flex gap-2 pt-1">
                {editingCountryId && (
                  <button
                    type="button"
                    onClick={() => {
                      setEditingCountryId(null);
                      setCountryName('');
                      setCountryCode('');
                    }}
                    className="w-1/2 rounded-xl border border-slate-200 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-100 dark:border-slate-700 dark:text-slate-300"
                  >
                    İptal
                  </button>
                )}
                <button
                  type="submit"
                  className="w-full rounded-xl bg-indigo-600 py-1.5 text-xs font-semibold text-white shadow-md hover:bg-indigo-700 transition-all"
                >
                  {editingCountryId ? 'Güncelle' : 'Ekle'}
                </button>
              </div>
            </form>
          </div>

          {/* List */}
          <div className="md:col-span-2 rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900 overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-200 text-slate-500 dark:border-slate-800">
                  <th className="py-2 px-3 font-semibold">Kod</th>
                  <th className="py-2 px-3 font-semibold">Ülke Adı</th>
                  <th className="py-2 px-3 font-semibold">Bağlı Şehir Sayısı</th>
                  <th className="py-2 px-3 text-right font-semibold">İşlemler</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {countries
                  .filter((c) => !search || c.name.toLowerCase().includes(search.toLowerCase()))
                  .map((c) => {
                    const cityCount = cities.filter((city) => city.countryId === c.id).length;
                    return (
                      <tr key={c.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                        <td className="py-2.5 px-3 font-bold text-indigo-600 dark:text-indigo-400">
                          {c.code}
                        </td>
                        <td className="py-2.5 px-3 font-semibold text-slate-900 dark:text-white">
                          {c.name}
                        </td>
                        <td className="py-2.5 px-3 text-slate-500 dark:text-slate-400">
                          {cityCount} Şehir
                        </td>
                        <td className="py-2.5 px-3 text-right space-x-2">
                          <button
                            onClick={() => {
                              setEditingCountryId(c.id);
                              setCountryName(c.name);
                              setCountryCode(c.code);
                            }}
                            className="p-1 text-slate-400 hover:text-indigo-600"
                          >
                            <Edit2 className="h-3.5 w-3.5" />
                          </button>
                          <button
                            onClick={() => {
                              deleteCountry(c.id);
                              showNotice('Ülke silindi.');
                            }}
                            className="p-1 text-slate-400 hover:text-rose-600"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 3: CITIES MANAGEMENT */}
      {activeTab === 'CITIES' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {/* Form */}
          <div className="rounded-2xl border border-slate-200 bg-slate-50/50 p-4 dark:border-slate-800 dark:bg-slate-800/40 space-y-3">
            <h3 className="font-bold text-xs text-slate-900 dark:text-white flex items-center gap-1.5">
              <Plus className="h-4 w-4 text-indigo-600" />
              {editingCityId ? 'Şehir Güncelle' : 'Yeni Şehir Ekle'}
            </h3>
            <form onSubmit={handleSaveCity} className="space-y-3">
              <div>
                <label className="text-[11px] font-semibold text-slate-700 dark:text-slate-300">
                  Bağlı Olduğu Ülke *
                </label>
                <select
                  required
                  value={cityCountryId}
                  onChange={(e) => setCityCountryId(e.target.value)}
                  className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs text-slate-800 focus:border-indigo-500 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                >
                  <option value="">-- Ülke Seçin --</option>
                  {countries.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name} ({c.code})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-[11px] font-semibold text-slate-700 dark:text-slate-300">
                  Şehir Adı *
                </label>
                <input
                  type="text"
                  required
                  value={cityName}
                  onChange={(e) => setCityName(e.target.value)}
                  placeholder="Örn: İstanbul, Ankara, Berlin"
                  className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-1.5 text-xs text-slate-800 focus:border-indigo-500 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                />
              </div>

              <div className="flex gap-2 pt-1">
                {editingCityId && (
                  <button
                    type="button"
                    onClick={() => {
                      setEditingCityId(null);
                      setCityName('');
                    }}
                    className="w-1/2 rounded-xl border border-slate-200 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-100 dark:border-slate-700 dark:text-slate-300"
                  >
                    İptal
                  </button>
                )}
                <button
                  type="submit"
                  className="w-full rounded-xl bg-indigo-600 py-1.5 text-xs font-semibold text-white shadow-md hover:bg-indigo-700 transition-all"
                >
                  {editingCityId ? 'Güncelle' : 'Ekle'}
                </button>
              </div>
            </form>
          </div>

          {/* List */}
          <div className="md:col-span-2 rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900 overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-200 text-slate-500 dark:border-slate-800">
                  <th className="py-2 px-3 font-semibold">Şehir Adı</th>
                  <th className="py-2 px-3 font-semibold">Ülke</th>
                  <th className="py-2 px-3 font-semibold">Bağlı Semt Sayısı</th>
                  <th className="py-2 px-3 text-right font-semibold">İşlemler</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {cities
                  .filter((c) => !search || c.name.toLowerCase().includes(search.toLowerCase()))
                  .map((city) => {
                    const country = countries.find((c) => c.id === city.countryId);
                    const districtCount = districts.filter((d) => d.cityId === city.id).length;
                    return (
                      <tr key={city.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                        <td className="py-2.5 px-3 font-bold text-slate-900 dark:text-white">
                          {city.name}
                        </td>
                        <td className="py-2.5 px-3 text-slate-600 dark:text-slate-300">
                          {country ? country.name : city.countryName || '-'}
                        </td>
                        <td className="py-2.5 px-3 text-slate-500 dark:text-slate-400">
                          {districtCount} Semt/İlçe
                        </td>
                        <td className="py-2.5 px-3 text-right space-x-2">
                          <button
                            onClick={() => {
                              setEditingCityId(city.id);
                              setCityCountryId(city.countryId);
                              setCityName(city.name);
                            }}
                            className="p-1 text-slate-400 hover:text-indigo-600"
                          >
                            <Edit2 className="h-3.5 w-3.5" />
                          </button>
                          <button
                            onClick={() => {
                              deleteCity(city.id);
                              showNotice('Şehir silindi.');
                            }}
                            className="p-1 text-slate-400 hover:text-rose-600"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 4: DISTRICTS MANAGEMENT */}
      {activeTab === 'DISTRICTS' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {/* Form */}
          <div className="rounded-2xl border border-slate-200 bg-slate-50/50 p-4 dark:border-slate-800 dark:bg-slate-800/40 space-y-3">
            <h3 className="font-bold text-xs text-slate-900 dark:text-white flex items-center gap-1.5">
              <Plus className="h-4 w-4 text-indigo-600" />
              {editingDistrictId ? 'Semt/İlçe Güncelle' : 'Yeni Semt/İlçe Ekle'}
            </h3>
            <form onSubmit={handleSaveDistrict} className="space-y-3">
              <div>
                <label className="text-[11px] font-semibold text-slate-700 dark:text-slate-300">
                  Bağlı Olduğu Şehir *
                </label>
                <select
                  required
                  value={districtCityId}
                  onChange={(e) => setDistrictCityId(e.target.value)}
                  className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs text-slate-800 focus:border-indigo-500 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                >
                  <option value="">-- Şehir Seçin --</option>
                  {cities.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name} ({c.countryName || 'Ülke'})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-[11px] font-semibold text-slate-700 dark:text-slate-300">
                  Semt / İlçe Adı *
                </label>
                <input
                  type="text"
                  required
                  value={districtName}
                  onChange={(e) => setDistrictName(e.target.value)}
                  placeholder="Örn: Kadıköy, Beşiktaş, Çankaya"
                  className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-1.5 text-xs text-slate-800 focus:border-indigo-500 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                />
              </div>

              <div className="flex gap-2 pt-1">
                {editingDistrictId && (
                  <button
                    type="button"
                    onClick={() => {
                      setEditingDistrictId(null);
                      setDistrictName('');
                    }}
                    className="w-1/2 rounded-xl border border-slate-200 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-100 dark:border-slate-700 dark:text-slate-300"
                  >
                    İptal
                  </button>
                )}
                <button
                  type="submit"
                  className="w-full rounded-xl bg-indigo-600 py-1.5 text-xs font-semibold text-white shadow-md hover:bg-indigo-700 transition-all"
                >
                  {editingDistrictId ? 'Güncelle' : 'Ekle'}
                </button>
              </div>
            </form>
          </div>

          {/* List */}
          <div className="md:col-span-2 rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900 overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-200 text-slate-500 dark:border-slate-800">
                  <th className="py-2 px-3 font-semibold">Semt / İlçe</th>
                  <th className="py-2 px-3 font-semibold">Şehir</th>
                  <th className="py-2 px-3 font-semibold">Ülke</th>
                  <th className="py-2 px-3 text-right font-semibold">İşlemler</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {districts
                  .filter((d) => !search || d.name.toLowerCase().includes(search.toLowerCase()))
                  .map((dist) => {
                    const city = cities.find((c) => c.id === dist.cityId);
                    const country = city ? countries.find((cn) => cn.id === city.countryId) : null;
                    return (
                      <tr key={dist.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                        <td className="py-2.5 px-3 font-bold text-slate-900 dark:text-white">
                          {dist.name}
                        </td>
                        <td className="py-2.5 px-3 text-slate-700 dark:text-slate-300">
                          {city ? city.name : dist.cityName || '-'}
                        </td>
                        <td className="py-2.5 px-3 text-slate-500 dark:text-slate-400">
                          {country ? country.name : '-'}
                        </td>
                        <td className="py-2.5 px-3 text-right space-x-2">
                          <button
                            onClick={() => {
                              setEditingDistrictId(dist.id);
                              setDistrictCityId(dist.cityId);
                              setDistrictName(dist.name);
                            }}
                            className="p-1 text-slate-400 hover:text-indigo-600"
                          >
                            <Edit2 className="h-3.5 w-3.5" />
                          </button>
                          <button
                            onClick={() => {
                              deleteDistrict(dist.id);
                              showNotice('Semt silindi.');
                            }}
                            className="p-1 text-slate-400 hover:text-rose-600"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* CSV IMPORT MODAL */}
      {isImportModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-xs">
          <div className="relative w-full max-w-lg rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl dark:border-slate-800 dark:bg-slate-900 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <FileSpreadsheet className="h-5 w-5 text-indigo-600" />
                <h3 className="font-bold text-base text-slate-900 dark:text-white">
                  CSV İçe Aktarma (Import Locations)
                </h3>
              </div>
              <button
                onClick={() => setIsImportModalOpen(false)}
                className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {importReport ? (
              <div className="space-y-3">
                <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-xs dark:border-emerald-900/60 dark:bg-emerald-950/60">
                  <h4 className="font-bold text-emerald-800 dark:text-emerald-300 flex items-center gap-1.5 mb-2">
                    <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                    CSV Başarıyla İşlendi!
                  </h4>
                  <ul className="space-y-1 text-emerald-700 dark:text-emerald-400 font-medium">
                    <li>• {importReport.importedCountries} yeni Ülke eklendi.</li>
                    <li>• {importReport.importedCities} yeni Şehir eklendi.</li>
                    <li>• {importReport.importedDistricts} yeni Semt / İlçe eklendi.</li>
                  </ul>
                </div>
                <div className="flex justify-end pt-2">
                  <button
                    onClick={() => {
                      setIsImportModalOpen(false);
                      setImportReport(null);
                    }}
                    className="rounded-xl bg-indigo-600 px-5 py-2 text-xs font-semibold text-white hover:bg-indigo-700"
                  >
                    Tamam
                  </button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleImportCsv} className="space-y-4">
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Aşağıdaki formatta bir CSV dosyası yükleyin veya metin olarak yapıştırın:
                  <br />
                  <code className="mt-1 inline-block rounded bg-slate-100 px-2 py-1 font-mono text-[11px] text-indigo-600 dark:bg-slate-800 dark:text-indigo-400">
                    Ülke,Ülke Kodu,Şehir,Semt
                  </code>
                </p>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Dosya Yükle (.csv)
                  </label>
                  <input
                    type="file"
                    accept=".csv"
                    onChange={handleFileUpload}
                    className="block w-full text-xs text-slate-500 file:mr-3 file:rounded-xl file:border-0 file:bg-indigo-50 file:px-3 file:py-2 file:text-xs file:font-semibold file:text-indigo-700 hover:file:bg-indigo-100 dark:file:bg-indigo-950 dark:file:text-indigo-300"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    veya CSV Metni Yapıştırın
                  </label>
                  <textarea
                    rows={6}
                    value={csvText}
                    onChange={(e) => setCsvText(e.target.value)}
                    placeholder={`Ülke,Ülke Kodu,Şehir,Semt\nTürkiye,TR,İstanbul,Kadıköy\nTürkiye,TR,Ankara,Çankaya\nAlmanya,DE,Berlin,Mitte`}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 p-3 font-mono text-xs text-slate-800 focus:border-indigo-500 focus:bg-white focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
                  />
                </div>

                <div className="flex justify-end gap-2 border-t border-slate-100 pt-3 dark:border-slate-800">
                  <button
                    type="button"
                    onClick={() => setIsImportModalOpen(false)}
                    className="rounded-xl px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 dark:text-slate-300"
                  >
                    İptal
                  </button>
                  <button
                    type="submit"
                    disabled={!csvText.trim()}
                    className="rounded-xl bg-indigo-600 px-5 py-2 text-xs font-semibold text-white shadow-md hover:bg-indigo-700 disabled:opacity-50"
                  >
                    İçe Aktar (Import)
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
