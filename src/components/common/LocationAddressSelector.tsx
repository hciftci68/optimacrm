import React from 'react';
import { useCRM } from '../../context/CRMContext';
import { MapPin, Globe, Building, Compass } from 'lucide-react';

interface LocationAddressSelectorProps {
  country?: string;
  city?: string;
  district?: string;
  addressLine?: string;
  onChange: (updated: {
    country: string;
    city: string;
    district: string;
    addressLine: string;
    fullAddress: string;
  }) => void;
  disabled?: boolean;
  compact?: boolean;
}

export const LocationAddressSelector: React.FC<LocationAddressSelectorProps> = ({
  country = '',
  city = '',
  district = '',
  addressLine = '',
  onChange,
  disabled = false,
  compact = false,
}) => {
  const { countries, cities, districts } = useCRM();

  // Find country object if selected
  const selectedCountryObj = countries.find(
    (c) => c.name.toLowerCase() === country.toLowerCase() || c.id === country
  );

  // Filter cities by selected country
  const filteredCities = selectedCountryObj
    ? cities.filter((c) => c.countryId === selectedCountryObj.id)
    : cities;

  // Find city object if selected
  const selectedCityObj = filteredCities.find(
    (c) => c.name.toLowerCase() === city.toLowerCase() || c.id === city
  );

  // Filter districts by selected city
  const filteredDistricts = selectedCityObj
    ? districts.filter((d) => d.cityId === selectedCityObj.id)
    : districts;

  const handleCountryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newCountryName = e.target.value;
    const newFull = [addressLine, district, city, newCountryName].filter(Boolean).join(', ');
    onChange({
      country: newCountryName,
      city: '', // reset city when country changes
      district: '', // reset district
      addressLine,
      fullAddress: newFull,
    });
  };

  const handleCityChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newCityName = e.target.value;
    const newFull = [addressLine, district, newCityName, country].filter(Boolean).join(', ');
    onChange({
      country,
      city: newCityName,
      district: '', // reset district when city changes
      addressLine,
      fullAddress: newFull,
    });
  };

  const handleDistrictChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newDistrictName = e.target.value;
    const newFull = [addressLine, newDistrictName, city, country].filter(Boolean).join(', ');
    onChange({
      country,
      city,
      district: newDistrictName,
      addressLine,
      fullAddress: newFull,
    });
  };

  const handleAddressLineChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const newLine = e.target.value;
    const newFull = [newLine, district, city, country].filter(Boolean).join(', ');
    onChange({
      country,
      city,
      district,
      addressLine: newLine,
      fullAddress: newFull,
    });
  };

  return (
    <div className="space-y-3 rounded-2xl border border-slate-200 bg-slate-50/50 p-3.5 dark:border-slate-800 dark:bg-slate-900/40">
      <div className="flex items-center justify-between border-b border-slate-200/60 pb-2 dark:border-slate-800/60">
        <div className="flex items-center gap-1.5 text-xs font-bold text-slate-800 dark:text-slate-200">
          <MapPin className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
          <span>Adres ve Lokasyon Bilgileri (Ülke &gt; Şehir &gt; Semt/İlçe)</span>
        </div>
      </div>

      <div className={`grid gap-2.5 ${compact ? 'grid-cols-1 sm:grid-cols-3' : 'grid-cols-1 sm:grid-cols-3'}`}>
        {/* Ülke */}
        <div>
          <label className="mb-1 flex items-center gap-1 text-[11px] font-semibold text-slate-700 dark:text-slate-300">
            <Globe className="h-3 w-3 text-slate-400" /> Ülke
          </label>
          <select
            value={country}
            onChange={handleCountryChange}
            disabled={disabled}
            className="w-full rounded-xl border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-medium text-slate-800 transition-all focus:border-indigo-500 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
          >
            <option value="">-- Ülke Seçin --</option>
            {countries.map((c) => (
              <option key={c.id} value={c.name}>
                {c.name} ({c.code})
              </option>
            ))}
          </select>
        </div>

        {/* Şehir */}
        <div>
          <label className="mb-1 flex items-center gap-1 text-[11px] font-semibold text-slate-700 dark:text-slate-300">
            <Building className="h-3 w-3 text-slate-400" /> Şehir (İl)
          </label>
          <select
            value={city}
            onChange={handleCityChange}
            disabled={disabled || (!country && filteredCities.length === 0)}
            className="w-full rounded-xl border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-medium text-slate-800 transition-all focus:border-indigo-500 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 disabled:opacity-60"
          >
            <option value="">-- Şehir Seçin --</option>
            {filteredCities.map((c) => (
              <option key={c.id} value={c.name}>
                {c.name}
              </option>
            ))}
          </select>
        </div>

        {/* Semt / İlçe */}
        <div>
          <label className="mb-1 flex items-center gap-1 text-[11px] font-semibold text-slate-700 dark:text-slate-300">
            <Compass className="h-3 w-3 text-slate-400" /> Semt / İlçe
          </label>
          <select
            value={district}
            onChange={handleDistrictChange}
            disabled={disabled || (!city && filteredDistricts.length === 0)}
            className="w-full rounded-xl border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-medium text-slate-800 transition-all focus:border-indigo-500 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 disabled:opacity-60"
          >
            <option value="">-- Semt / İlçe Seçin --</option>
            {filteredDistricts.map((d) => (
              <option key={d.id} value={d.name}>
                {d.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Açık Adres */}
      <div>
        <label className="mb-1 block text-[11px] font-semibold text-slate-700 dark:text-slate-300">
          Açık Adres (Cadde, Sokak, Bina No, Daire)
        </label>
        <input
          type="text"
          value={addressLine}
          onChange={handleAddressLineChange}
          disabled={disabled}
          placeholder="Örn: Barbaros Bulvarı No: 42 Daire: 5"
          className="w-full rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs text-slate-800 transition-all focus:border-indigo-500 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
        />
      </div>
    </div>
  );
};
