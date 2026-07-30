import React, { useState } from 'react';
import { useCRM } from '../../context/CRMContext';
import { ProductGroup, ProductCatalogItem, DimensionFieldDef } from '../../types';
import {
  Package, Plus, Search, Filter, Layers, Sliders, CheckCircle, XCircle,
  Edit2, Trash2, Tag, Box, Wrench, ChevronRight, X, AlertCircle, Download, Upload,
  FileSpreadsheet, Check, ArrowUpDown, ArrowUp, ArrowDown
} from 'lucide-react';
import { DeleteConfirmModal } from '../common/DeleteConfirmModal';

export const ProductCatalogView: React.FC = () => {
  const {
    productGroups,
    products,
    addProductGroup,
    updateProductGroup,
    deleteProductGroup,
    addProduct,
    updateProduct,
    deleteProduct,
    importProductsCsv,
    canUserExport,
    canUserImport,
  } = useCRM();

  // Pending Deletes for Modal Confirmation
  const [pendingDeleteProduct, setPendingDeleteProduct] = useState<ProductCatalogItem | null>(null);
  const [pendingDeleteGroup, setPendingDeleteGroup] = useState<ProductGroup | null>(null);

  // Table Sorting & CSV
  const [sortField, setSortField] = useState<'sku' | 'name' | 'type' | 'group' | 'unitPrice'>('name');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [csvText, setCsvText] = useState('');
  const [importReport, setImportReport] = useState<{ imported: number; updated?: number; errors: string[] } | null>(null);
  const [permissionNotice, setPermissionNotice] = useState<string | null>(null);

  const [activeTab, setActiveTab] = useState<'catalog' | 'groups'>('catalog');
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState<'ALL' | 'PRODUCT' | 'SERVICE'>('ALL');
  const [selectedGroupId, setSelectedGroupId] = useState<string>('ALL');

  // Modals
  const [isGroupModalOpen, setIsGroupModalOpen] = useState(false);
  const [editingGroup, setEditingGroup] = useState<ProductGroup | null>(null);

  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<ProductCatalogItem | null>(null);

  // Group Form state
  const [groupName, setGroupName] = useState('');
  const [groupCode, setGroupCode] = useState('');
  const [groupType, setGroupType] = useState<'PRODUCT' | 'SERVICE'>('PRODUCT');
  const [groupDesc, setGroupDesc] = useState('');
  const [groupDimensions, setGroupDimensions] = useState<DimensionFieldDef[]>([]);

  // Dimension Form state inside Group Modal
  const [dimLabel, setDimLabel] = useState('');
  const [dimKey, setDimKey] = useState('');
  const [dimType, setDimType] = useState<'TEXT' | 'NUMBER' | 'SELECT' | 'BOOLEAN'>('TEXT');
  const [dimUnit, setDimUnit] = useState('');
  const [dimOptions, setDimOptions] = useState('');

  // Product Form state
  const [prodSku, setProdSku] = useState('');
  const [prodName, setProdName] = useState('');
  const [prodType, setProdType] = useState<'PRODUCT' | 'SERVICE'>('PRODUCT');
  const [prodGroupId, setProdGroupId] = useState('');
  const [prodUnitPrice, setProdUnitPrice] = useState<number>(0);
  const [prodCurrency, setProdCurrency] = useState('USD');
  const [prodUnit, setProdUnit] = useState('Adet');
  const [prodActive, setProdActive] = useState(true);
  const [prodDesc, setProdDesc] = useState('');
  const [prodDimensionValues, setProdDimensionValues] = useState<Record<string, string | number | boolean>>({});

  // Reset Group Form
  const openNewGroupModal = () => {
    setEditingGroup(null);
    setGroupName('');
    setGroupCode('');
    setGroupType('PRODUCT');
    setGroupDesc('');
    setGroupDimensions([]);
    setIsGroupModalOpen(true);
  };

  const openEditGroupModal = (group: ProductGroup) => {
    setEditingGroup(group);
    setGroupName(group.name);
    setGroupCode(group.code);
    setGroupType(group.type);
    setGroupDesc(group.description || '');
    setGroupDimensions(group.dimensions || []);
    setIsGroupModalOpen(true);
  };

  const handleAddDimensionToGroup = () => {
    if (!dimLabel.trim()) return;
    const keyName = dimKey.trim() || dimLabel.toLowerCase().replace(/\s+/g, '_');
    const newDim: DimensionFieldDef = {
      id: `dim-${Date.now()}`,
      key: keyName,
      label: dimLabel,
      dataType: dimType,
      unit: dimUnit,
      options: dimType === 'SELECT' ? dimOptions.split(',').map((o) => o.trim()).filter(Boolean) : undefined,
    };
    setGroupDimensions([...groupDimensions, newDim]);
    setDimLabel('');
    setDimKey('');
    setDimType('TEXT');
    setDimUnit('');
    setDimOptions('');
  };

  const handleRemoveDimensionFromGroup = (dimId: string) => {
    setGroupDimensions(groupDimensions.filter((d) => d.id !== dimId));
  };

  const handleSaveGroup = (e: React.FormEvent) => {
    e.preventDefault();
    if (!groupName.trim()) return;

    if (editingGroup) {
      updateProductGroup(editingGroup.id, {
        name: groupName,
        code: groupCode || `GRP-${Date.now()}`,
        type: groupType,
        description: groupDesc,
        dimensions: groupDimensions,
      });
    } else {
      addProductGroup({
        name: groupName,
        code: groupCode || `GRP-${Math.floor(1000 + Math.random() * 9000)}`,
        type: groupType,
        description: groupDesc,
        dimensions: groupDimensions,
      });
    }
    setIsGroupModalOpen(false);
  };

  // Reset Product Form
  const openNewProductModal = () => {
    setEditingProduct(null);
    setProdSku(`SKU-${Math.floor(10000 + Math.random() * 90000)}`);
    setProdName('');
    setProdType('PRODUCT');
    setProdGroupId(productGroups[0]?.id || '');
    setProdUnitPrice(100);
    setProdCurrency('USD');
    setProdUnit('Adet');
    setProdActive(true);
    setProdDesc('');
    setProdDimensionValues({});
    setIsProductModalOpen(true);
  };

  const openEditProductModal = (prod: ProductCatalogItem) => {
    setEditingProduct(prod);
    setProdSku(prod.sku);
    setProdName(prod.name);
    setProdType(prod.type);
    setProdGroupId(prod.groupId || '');
    setProdUnitPrice(prod.unitPrice);
    setProdCurrency(prod.currency);
    setProdUnit(prod.unit || 'Adet');
    setProdActive(prod.active);
    setProdDesc(prod.description || '');
    setProdDimensionValues(prod.dimensions || {});
    setIsProductModalOpen(true);
  };

  const handleSaveProduct = (e: React.FormEvent) => {
    e.preventDefault();
    if (!prodName.trim()) return;

    const group = productGroups.find((g) => g.id === prodGroupId);

    if (editingProduct) {
      updateProduct(editingProduct.id, {
        sku: prodSku,
        name: prodName,
        type: prodType,
        groupId: prodGroupId || undefined,
        groupName: group?.name || undefined,
        unitPrice: prodUnitPrice,
        currency: prodCurrency,
        unit: prodUnit,
        active: prodActive,
        description: prodDesc,
        dimensions: prodDimensionValues,
      });
    } else {
      addProduct({
        sku: prodSku,
        name: prodName,
        type: prodType,
        groupId: prodGroupId || undefined,
        groupName: group?.name || undefined,
        unitPrice: prodUnitPrice,
        currency: prodCurrency,
        unit: prodUnit,
        active: prodActive,
        description: prodDesc,
        dimensions: prodDimensionValues,
      });
    }
    setIsProductModalOpen(false);
  };

  // Filter products
  const filteredProducts = products.filter((prod) => {
    const matchesQuery =
      prod.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      prod.sku.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (prod.groupName && prod.groupName.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesType = typeFilter === 'ALL' || prod.type === typeFilter;
    const matchesGroup = selectedGroupId === 'ALL' || prod.groupId === selectedGroupId;

    return matchesQuery && matchesType && matchesGroup;
  });

  // Selected group dimensions for dynamic form rendering in product modal
  const activeSelectedGroup = productGroups.find((g) => g.id === prodGroupId);

  return (
    <div className="flex h-full flex-col gap-6 overflow-y-auto p-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Package className="h-7 w-7 text-indigo-600" />
            Ürün ve Hizmet Katalogu
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Gruplandırılmış ürün/hizmet yönetimi ve esnek teknik boyut (dimension) tanımlamaları
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={openNewGroupModal}
            className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-xs font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
          >
            <Layers className="h-4 w-4 text-indigo-500" />
            Yeni Ürün Grubu
          </button>
          <button
            onClick={openNewProductModal}
            className="flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-xs font-semibold text-white shadow-md transition hover:bg-indigo-700"
          >
            <Plus className="h-4 w-4" />
            Yeni Ürün / Hizmet
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-200 dark:border-slate-800">
        <button
          onClick={() => setActiveTab('catalog')}
          className={`flex items-center gap-2 border-b-2 px-4 py-2.5 text-xs font-bold transition ${
            activeTab === 'catalog'
              ? 'border-indigo-600 text-indigo-600 dark:border-indigo-400 dark:text-indigo-400'
              : 'border-transparent text-slate-500 hover:text-slate-700 dark:text-slate-400'
          }`}
        >
          <Box className="h-4 w-4" />
          Katalog Liste ({products.length})
        </button>
        <button
          onClick={() => setActiveTab('groups')}
          className={`flex items-center gap-2 border-b-2 px-4 py-2.5 text-xs font-bold transition ${
            activeTab === 'groups'
              ? 'border-indigo-600 text-indigo-600 dark:border-indigo-400 dark:text-indigo-400'
              : 'border-transparent text-slate-500 hover:text-slate-700 dark:text-slate-400'
          }`}
        >
          <Layers className="h-4 w-4" />
          Ürün/Hizmet Grupları & Boyut Tanımları ({productGroups.length})
        </button>
      </div>

      {/* CATALOG VIEW */}
      {activeTab === 'catalog' && (
        <div className="flex flex-col gap-4">
          {/* Filters */}
          <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <div className="relative flex-1 min-w-[240px]">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Ürün adı, SKU veya grup ara..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 pl-9 pr-4 py-2 text-xs focus:border-indigo-500 focus:bg-white focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
              />
            </div>

            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-slate-400" />
              <select
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value as any)}
                className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-medium text-slate-700 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
              >
                <option value="ALL">Tüm Tipler</option>
                <option value="PRODUCT">Fiziksel Ürün</option>
                <option value="SERVICE">Hizmet / Servis</option>
              </select>

              <select
                value={selectedGroupId}
                onChange={(e) => setSelectedGroupId(e.target.value)}
                className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-medium text-slate-700 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
              >
                <option value="ALL">Tüm Gruplar</option>
                {productGroups.map((g) => (
                  <option key={g.id} value={g.id}>
                    {g.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Table / List View of Catalog Items */}
          <div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden dark:border-slate-800 dark:bg-slate-900">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase tracking-wider text-[10px] font-bold dark:bg-slate-800/60 dark:border-slate-800 dark:text-slate-400">
                  <tr>
                    <th className="px-4 py-3 cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800" onClick={() => {
                      if (sortField === 'sku') setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
                      else { setSortField('sku'); setSortDirection('asc'); }
                    }}>
                      <div className="flex items-center gap-1">
                        SKU & Tip
                        <ArrowUpDown className="h-3 w-3 text-slate-400" />
                      </div>
                    </th>
                    <th className="px-4 py-3 cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800" onClick={() => {
                      if (sortField === 'name') setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
                      else { setSortField('name'); setSortDirection('asc'); }
                    }}>
                      <div className="flex items-center gap-1">
                        Ürün / Hizmet Adı & Açıklama
                        <ArrowUpDown className="h-3 w-3 text-slate-400" />
                      </div>
                    </th>
                    <th className="px-4 py-3 cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800" onClick={() => {
                      if (sortField === 'group') setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
                      else { setSortField('group'); setSortDirection('asc'); }
                    }}>
                      <div className="flex items-center gap-1">
                        Ürün Grubu
                        <ArrowUpDown className="h-3 w-3 text-slate-400" />
                      </div>
                    </th>
                    <th className="px-4 py-3 cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800" onClick={() => {
                      if (sortField === 'unitPrice') setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
                      else { setSortField('unitPrice'); setSortDirection('asc'); }
                    }}>
                      <div className="flex items-center gap-1">
                        Birim Fiyat
                        <ArrowUpDown className="h-3 w-3 text-slate-400" />
                      </div>
                    </th>
                    <th className="px-4 py-3">Teknik Boyutlar (Dimensions)</th>
                    <th className="px-4 py-3 text-center">Durum</th>
                    <th className="px-4 py-3 text-right">İşlemler</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200/80 dark:divide-slate-800 text-slate-700 dark:text-slate-300">
                  {[...filteredProducts]
                    .sort((a, b) => {
                      let valA: any = '';
                      let valB: any = '';
                      if (sortField === 'sku') { valA = a.sku; valB = b.sku; }
                      else if (sortField === 'name') { valA = a.name; valB = b.name; }
                      else if (sortField === 'type') { valA = a.type; valB = b.type; }
                      else if (sortField === 'group') { valA = a.groupName || ''; valB = b.groupName || ''; }
                      else if (sortField === 'unitPrice') { valA = a.unitPrice; valB = b.unitPrice; }

                      if (valA < valB) return sortDirection === 'asc' ? -1 : 1;
                      if (valA > valB) return sortDirection === 'asc' ? 1 : -1;
                      return 0;
                    })
                    .map((prod) => (
                      <tr key={prod.id} className="hover:bg-slate-50/80 transition dark:hover:bg-slate-800/40">
                        <td className="px-4 py-3 font-mono font-semibold text-slate-900 dark:text-slate-100 whitespace-nowrap">
                          <div className="flex flex-col gap-1 items-start">
                            <span className="text-[11px] bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                              {prod.sku}
                            </span>
                            <span
                              className={`inline-flex items-center gap-1 rounded px-1.5 py-0.5 text-[9px] font-bold ${
                                prod.type === 'PRODUCT'
                                  ? 'bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-400'
                                  : 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400'
                              }`}
                            >
                              {prod.type === 'PRODUCT' ? <Box className="h-2.5 w-2.5" /> : <Wrench className="h-2.5 w-2.5" />}
                              {prod.type === 'PRODUCT' ? 'Ürün' : 'Hizmet'}
                            </span>
                          </div>
                        </td>

                        <td className="px-4 py-3">
                          <div className="font-bold text-slate-900 dark:text-white text-xs">{prod.name}</div>
                          {prod.description && (
                            <div className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-1 mt-0.5 max-w-xs">
                              {prod.description}
                            </div>
                          )}
                        </td>

                        <td className="px-4 py-3 whitespace-nowrap">
                          {prod.groupName ? (
                            <span className="inline-flex items-center gap-1 rounded-md bg-indigo-50 px-2 py-1 text-[11px] font-semibold text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300">
                              <Tag className="h-3 w-3" />
                              {prod.groupName}
                            </span>
                          ) : (
                            <span className="text-slate-400 text-[11px] italic">Grupsuz</span>
                          )}
                        </td>

                        <td className="px-4 py-3 whitespace-nowrap">
                          <div className="font-extrabold text-slate-900 dark:text-white text-xs">
                            ${prod.unitPrice.toLocaleString()}{' '}
                            <span className="text-[10px] font-normal text-slate-400">/ {prod.unit || 'Adet'}</span>
                          </div>
                        </td>

                        <td className="px-4 py-3">
                          {prod.dimensions && Object.keys(prod.dimensions).length > 0 ? (
                            <div className="flex flex-wrap gap-1 max-w-xs">
                              {Object.entries(prod.dimensions).map(([key, val]) => (
                                <span
                                  key={key}
                                  className="inline-flex items-center gap-1 rounded bg-slate-100 px-1.5 py-0.5 text-[10px] font-medium text-slate-700 dark:bg-slate-800 dark:text-slate-300"
                                >
                                  <span className="font-bold text-slate-500">{key}:</span> {String(val)}
                                </span>
                              ))}
                            </div>
                          ) : (
                            <span className="text-slate-400 text-[11px] italic">-</span>
                          )}
                        </td>

                        <td className="px-4 py-3 text-center whitespace-nowrap">
                          <span
                            className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold ${
                              prod.active
                                ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400'
                                : 'bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400'
                            }`}
                          >
                            {prod.active ? <CheckCircle className="h-3 w-3" /> : <XCircle className="h-3 w-3" />}
                            {prod.active ? 'Aktif' : 'Pasif'}
                          </span>
                        </td>

                        <td className="px-4 py-3 text-right whitespace-nowrap">
                          <div className="flex items-center justify-end gap-1">
                            <button
                              onClick={() => openEditProductModal(prod)}
                              className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-800"
                              title="Düzenle"
                            >
                              <Edit2 className="h-3.5 w-3.5" />
                            </button>
                            <button
                              onClick={() => setPendingDeleteProduct(prod)}
                              className="rounded-lg p-1 text-slate-400 hover:bg-rose-50 hover:text-rose-600 dark:hover:bg-rose-950/50"
                              title="Sil"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}

                  {filteredProducts.length === 0 && (
                    <tr>
                      <td colSpan={7} className="px-4 py-8 text-center text-slate-400 text-xs">
                        Arama kriterlerine uygun ürün veya hizmet bulunamadı.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {filteredProducts.length === 0 && (
            <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-300 p-12 text-center dark:border-slate-800">
              <Box className="h-10 w-10 text-slate-300 dark:text-slate-600 mb-2" />
              <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">Ürün veya Hizmet Bulunamadı</p>
              <p className="text-xs text-slate-400 mt-1">Arama kriterlerinizi değiştirebilir veya yeni ürün ekleyebilirsiniz.</p>
            </div>
          )}
        </div>
      )}

      {/* GROUPS VIEW */}
      {activeTab === 'groups' && (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {productGroups.map((group) => (
            <div
              key={group.id}
              className="flex flex-col justify-between rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition dark:border-slate-800 dark:bg-slate-900"
            >
              <div>
                <div className="flex items-start justify-between">
                  <span className="rounded-lg bg-indigo-50 px-2.5 py-1 text-xs font-mono font-bold text-indigo-700 dark:bg-indigo-950 dark:text-indigo-400">
                    {group.code}
                  </span>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => openEditGroupModal(group)}
                      className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-800"
                    >
                      <Edit2 className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => setPendingDeleteGroup(group)}
                      className="rounded-lg p-1 text-slate-400 hover:bg-rose-50 hover:text-rose-600 dark:hover:bg-rose-950/50"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>

                <h3 className="mt-3 font-bold text-slate-900 dark:text-white text-base">{group.name}</h3>
                <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">{group.description || 'Grup açıklaması tanımlanmadı.'}</p>

                {/* Dimension Definitions */}
                <div className="mt-4">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-2 dark:border-slate-800">
                    <span className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                      <Sliders className="h-3.5 w-3.5 text-indigo-500" />
                      Esnek Boyut Alanları ({group.dimensions?.length || 0})
                    </span>
                  </div>

                  <div className="mt-2 flex flex-col gap-1.5">
                    {group.dimensions?.map((dim) => (
                      <div
                        key={dim.id}
                        className="flex items-center justify-between rounded-xl bg-slate-50 px-3 py-2 text-xs dark:bg-slate-800/60"
                      >
                        <div>
                          <span className="font-semibold text-slate-800 dark:text-slate-200">{dim.label}</span>
                          <span className="ml-1 text-[10px] text-slate-400">({dim.dataType})</span>
                        </div>
                        {dim.unit && (
                          <span className="rounded bg-slate-200 px-1.5 py-0.5 text-[10px] font-mono text-slate-600 dark:bg-slate-700 dark:text-slate-300">
                            {dim.unit}
                          </span>
                        )}
                      </div>
                    ))}

                    {(!group.dimensions || group.dimensions.length === 0) && (
                      <p className="text-[11px] text-slate-400 italic py-1">Boyut alanı tanımlanmadı.</p>
                    )}
                  </div>
                </div>
              </div>

              <div className="mt-6 flex items-center justify-between border-t border-slate-100 pt-3 text-xs text-slate-400 dark:border-slate-800">
                <span>
                  Grup Tipi: <strong className="text-slate-700 dark:text-slate-300">{group.type === 'PRODUCT' ? 'Fiziksel Ürün' : 'Hizmet'}</strong>
                </span>
                <span>
                  Bağlı Ürünler:{' '}
                  <strong className="text-indigo-600 dark:text-indigo-400">
                    {products.filter((p) => p.groupId === group.id).length}
                  </strong>
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* GROUP MODAL */}
      {isGroupModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-sm">
          <div className="w-full max-w-xl rounded-2xl bg-white p-6 shadow-xl dark:bg-slate-900">
            <div className="flex items-center justify-between border-b border-slate-200 pb-4 dark:border-slate-800">
              <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Layers className="h-5 w-5 text-indigo-600" />
                {editingGroup ? 'Grubu Düzenle' : 'Yeni Ürün / Hizmet Grubu'}
              </h2>
              <button onClick={() => setIsGroupModalOpen(false)} className="rounded-lg p-1 text-slate-400 hover:bg-slate-100">
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSaveGroup} className="mt-4 flex flex-col gap-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Grup Adı *</label>
                  <input
                    type="text"
                    required
                    value={groupName}
                    onChange={(e) => setGroupName(e.target.value)}
                    placeholder="Örn: Bulut & SaaS Lisansları"
                    className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-xs focus:border-indigo-500 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Grup Kodu</label>
                  <input
                    type="text"
                    value={groupCode}
                    onChange={(e) => setGroupCode(e.target.value)}
                    placeholder="GRP-SAAS"
                    className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-xs focus:border-indigo-500 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Sınıflandırma Tipi</label>
                  <select
                    value={groupType}
                    onChange={(e) => setGroupType(e.target.value as any)}
                    className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-xs focus:border-indigo-500 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                  >
                    <option value="PRODUCT">Fiziksel Ürün (Product)</option>
                    <option value="SERVICE">Hizmet & Danışmanlık (Service)</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Açıklama</label>
                  <input
                    type="text"
                    value={groupDesc}
                    onChange={(e) => setGroupDesc(e.target.value)}
                    placeholder="Grup hakkında kısa açıklama"
                    className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-xs focus:border-indigo-500 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                  />
                </div>
              </div>

              {/* Dynamic Dimension Builder Section */}
              <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-800/40">
                <h4 className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                  <Sliders className="h-4 w-4 text-indigo-600" />
                  Esnek Dimension (Teknik Boyut) Alanları Ekle
                </h4>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                  Bu gruba ait tüm ürünlerin sahip olacağı özel parametreler (ör: Garanti, Kullanıcı Limiti, SLA, Voltaj vb.)
                </p>

                <div className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-3">
                  <input
                    type="text"
                    placeholder="Alan Etiketi (Örn: Garanti)"
                    value={dimLabel}
                    onChange={(e) => setDimLabel(e.target.value)}
                    className="rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                  />
                  <select
                    value={dimType}
                    onChange={(e) => setDimType(e.target.value as any)}
                    className="rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                  >
                    <option value="TEXT">Metin (Text)</option>
                    <option value="NUMBER">Sayı (Number)</option>
                    <option value="SELECT">Açılır Liste (Select)</option>
                    <option value="BOOLEAN">Evet / Hayır (Boolean)</option>
                  </select>
                  <input
                    type="text"
                    placeholder="Birim (Örn: Ay, Saat, Watt)"
                    value={dimUnit}
                    onChange={(e) => setDimUnit(e.target.value)}
                    className="rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                  />
                </div>

                {dimType === 'SELECT' && (
                  <input
                    type="text"
                    placeholder="Seçenekler (Virgülle ayırın: Seçenek A, Seçenek B)"
                    value={dimOptions}
                    onChange={(e) => setDimOptions(e.target.value)}
                    className="mt-2 w-full rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                  />
                )}

                <button
                  type="button"
                  onClick={handleAddDimensionToGroup}
                  className="mt-2 flex items-center gap-1.5 rounded-lg bg-indigo-50 px-3 py-1.5 text-xs font-semibold text-indigo-700 hover:bg-indigo-100 dark:bg-indigo-950 dark:text-indigo-300"
                >
                  <Plus className="h-3.5 w-3.5" />
                  Boyut Alanı Ekle
                </button>

                {/* List of currently defined dimensions */}
                <div className="mt-3 flex flex-wrap gap-2">
                  {(groupDimensions || []).map((d) => (
                    <span
                      key={d.id}
                      className="inline-flex items-center gap-1.5 rounded-lg bg-white px-2.5 py-1 text-xs font-medium border border-slate-200 text-slate-700 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
                    >
                      <span>{d.label}</span>
                      <span className="text-[10px] text-slate-400">({d.dataType})</span>
                      <button
                        type="button"
                        onClick={() => handleRemoveDimensionFromGroup(d.id)}
                        className="text-rose-500 hover:text-rose-700"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </span>
                  ))}
                </div>
              </div>

              <div className="mt-4 flex justify-end gap-2 border-t border-slate-200 pt-4 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsGroupModalOpen(false)}
                  className="rounded-xl px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 dark:text-slate-300"
                >
                  İptal
                </button>
                <button
                  type="submit"
                  className="rounded-xl bg-indigo-600 px-5 py-2 text-xs font-semibold text-white shadow-md hover:bg-indigo-700"
                >
                  Kaydet
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* PRODUCT MODAL */}
      {isProductModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-sm">
          <div className="w-full max-w-2xl rounded-2xl bg-white p-6 shadow-xl dark:bg-slate-900 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-200 pb-4 dark:border-slate-800">
              <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Box className="h-5 w-5 text-indigo-600" />
                {editingProduct ? 'Ürün / Hizmet Düzenle' : 'Yeni Ürün / Hizmet Ekle'}
              </h2>
              <button onClick={() => setIsProductModalOpen(false)} className="rounded-lg p-1 text-slate-400 hover:bg-slate-100">
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSaveProduct} className="mt-4 flex flex-col gap-4">
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">SKU Kodu</label>
                  <input
                    type="text"
                    required
                    value={prodSku}
                    onChange={(e) => setProdSku(e.target.value)}
                    className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-xs font-mono focus:border-indigo-500 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                  />
                </div>

                <div className="col-span-2">
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Ürün / Hizmet Adı *</label>
                  <input
                    type="text"
                    required
                    value={prodName}
                    onChange={(e) => setProdName(e.target.value)}
                    placeholder="Örn: 24/7 Premium SLA Lisansı"
                    className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-xs focus:border-indigo-500 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Tipi</label>
                  <select
                    value={prodType}
                    onChange={(e) => setProdType(e.target.value as any)}
                    className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-xs focus:border-indigo-500 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                  >
                    <option value="PRODUCT">Fiziksel Ürün</option>
                    <option value="SERVICE">Hizmet / Servis</option>
                  </select>
                </div>

                <div className="col-span-2">
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Ait Olduğu Grup</label>
                  <select
                    value={prodGroupId}
                    onChange={(e) => setProdGroupId(e.target.value)}
                    className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-xs focus:border-indigo-500 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                  >
                    <option value="">-- Grup Seçilmedi --</option>
                    {productGroups.map((g) => (
                      <option key={g.id} value={g.id}>
                        {g.name} ({g.type})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Birim Fiyat *</label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    required
                    value={prodUnitPrice}
                    onChange={(e) => setProdUnitPrice(parseFloat(e.target.value) || 0)}
                    className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-xs focus:border-indigo-500 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Para Birimi</label>
                  <select
                    value={prodCurrency}
                    onChange={(e) => setProdCurrency(e.target.value)}
                    className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-xs focus:border-indigo-500 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                  >
                    <option value="USD">USD ($)</option>
                    <option value="EUR">EUR (€)</option>
                    <option value="TRY">TRY (₺)</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Satış Birimi</label>
                  <input
                    type="text"
                    value={prodUnit}
                    onChange={(e) => setProdUnit(e.target.value)}
                    placeholder="Adet, Saat, Ay, Lisans"
                    className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-xs focus:border-indigo-500 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                  />
                </div>
              </div>

              {/* Dynamic Dimension Inputs from Selected Group */}
              {activeSelectedGroup && activeSelectedGroup.dimensions && activeSelectedGroup.dimensions.length > 0 && (
                <div className="rounded-xl border border-indigo-100 bg-indigo-50/50 p-4 dark:border-indigo-950/60 dark:bg-indigo-950/30">
                  <h4 className="text-xs font-bold text-indigo-900 dark:text-indigo-300 flex items-center gap-1.5">
                    <Sliders className="h-4 w-4 text-indigo-600" />
                    "{activeSelectedGroup.name}" Grubunun Esnek Boyut Değerleri
                  </h4>

                  <div className="mt-3 grid grid-cols-2 gap-3">
                    {(activeSelectedGroup.dimensions || []).map((dim) => (
                      <div key={dim.id}>
                        <label className="text-xs font-medium text-slate-700 dark:text-slate-300">
                          {dim.label} {dim.unit ? `(${dim.unit})` : ''}
                        </label>
                        {dim.dataType === 'SELECT' ? (
                          <select
                            value={String(prodDimensionValues[dim.key] || '')}
                            onChange={(e) =>
                              setProdDimensionValues({ ...prodDimensionValues, [dim.key]: e.target.value })
                            }
                            className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                          >
                            <option value="">-- Seçiniz --</option>
                            {dim.options?.map((opt) => (
                              <option key={opt} value={opt}>
                                {opt}
                              </option>
                            ))}
                          </select>
                        ) : dim.dataType === 'NUMBER' ? (
                          <input
                            type="number"
                            value={Number(prodDimensionValues[dim.key] || 0)}
                            onChange={(e) =>
                              setProdDimensionValues({
                                ...prodDimensionValues,
                                [dim.key]: parseFloat(e.target.value) || 0,
                              })
                            }
                            className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                          />
                        ) : dim.dataType === 'BOOLEAN' ? (
                          <select
                            value={String(prodDimensionValues[dim.key] ?? 'true')}
                            onChange={(e) =>
                              setProdDimensionValues({
                                ...prodDimensionValues,
                                [dim.key]: e.target.value === 'true',
                              })
                            }
                            className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                          >
                            <option value="true">Evet</option>
                            <option value="false">Hayır</option>
                          </select>
                        ) : (
                          <input
                            type="text"
                            value={String(prodDimensionValues[dim.key] || '')}
                            onChange={(e) =>
                              setProdDimensionValues({ ...prodDimensionValues, [dim.key]: e.target.value })
                            }
                            className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                          />
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div>
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Açıklama & Detaylar</label>
                <textarea
                  rows={3}
                  value={prodDesc}
                  onChange={(e) => setProdDesc(e.target.value)}
                  placeholder="Ürün veya hizmet şartları..."
                  className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-xs focus:border-indigo-500 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                />
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="prodActive"
                  checked={prodActive}
                  onChange={(e) => setProdActive(e.target.checked)}
                  className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                />
                <label htmlFor="prodActive" className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Satışa ve Tekliflere Açık (Aktif)
                </label>
              </div>

              <div className="mt-4 flex justify-end gap-2 border-t border-slate-200 pt-4 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsProductModalOpen(false)}
                  className="rounded-xl px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 dark:text-slate-300"
                >
                  İptal
                </button>
                <button
                  type="submit"
                  className="rounded-xl bg-indigo-600 px-5 py-2 text-xs font-semibold text-white shadow-md hover:bg-indigo-700"
                >
                  Kaydet
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {/* Delete Product Modal */}
      <DeleteConfirmModal
        isOpen={Boolean(pendingDeleteProduct)}
        title="Ürün/Hizmet Silme Onayı"
        recordType="Ürün / Hizmet"
        recordTitle={pendingDeleteProduct ? pendingDeleteProduct.name : ''}
        summaryItems={
          pendingDeleteProduct
            ? [
                { label: 'SKU Kodu', value: pendingDeleteProduct.sku },
                { label: 'Tip', value: pendingDeleteProduct.type === 'PRODUCT' ? 'Ürün' : 'Hizmet' },
                { label: 'Birim Fiyat', value: `$${pendingDeleteProduct.unitPrice?.toLocaleString()} / ${pendingDeleteProduct.unit || 'Adet'}` },
                { label: 'Grup', value: pendingDeleteProduct.groupName || 'Grupsuz' },
              ]
            : []
        }
        onConfirm={() => {
          if (pendingDeleteProduct) {
            deleteProduct(pendingDeleteProduct.id);
            setPendingDeleteProduct(null);
          }
        }}
        onCancel={() => setPendingDeleteProduct(null)}
      />

      {/* Delete Product Group Modal */}
      <DeleteConfirmModal
        isOpen={Boolean(pendingDeleteGroup)}
        title="Ürün Grubu Silme Onayı"
        recordType="Ürün Grubu"
        recordTitle={pendingDeleteGroup ? pendingDeleteGroup.name : ''}
        summaryItems={
          pendingDeleteGroup
            ? [
                { label: 'Grup Kodu', value: pendingDeleteGroup.code },
                { label: 'Tip', value: pendingDeleteGroup.type === 'PRODUCT' ? 'Fiziksel Ürünler' : 'Hizmet Grubu' },
                { label: 'Tanımlı Boyut Sayısı', value: `${pendingDeleteGroup.dimensions?.length || 0} boyut` },
              ]
            : []
        }
        onConfirm={() => {
          if (pendingDeleteGroup) {
            deleteProductGroup(pendingDeleteGroup.id);
            setPendingDeleteGroup(null);
          }
        }}
        onCancel={() => setPendingDeleteGroup(null)}
      />
    </div>
  );
};
