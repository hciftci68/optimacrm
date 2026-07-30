import React, { useState } from 'react';
import { useCRM } from '../../context/CRMContext';
import { Order, OrderStatus, OrderLineItem } from '../../types';
import {
  ShoppingBag, Search, Filter, Plus, Clock, CheckCircle2, Truck,
  XCircle, ArrowRightLeft, DollarSign, FileText, User, Building2,
  Calendar, Eye, X, Edit3, ChevronRight, Package, Tag, AlertCircle,
  ArrowUpDown, ArrowUp, ArrowDown
} from 'lucide-react';
import { DeleteConfirmModal } from '../common/DeleteConfirmModal';
import { SearchableContactSelect } from '../common/SearchableContactSelect';
import { LocationAddressSelector } from '../common/LocationAddressSelector';
import { QuickAddContactModal } from '../contacts/QuickAddContactModal';

export const OrderManagementView: React.FC = () => {
  const {
    orders,
    deals,
    contacts,
    accounts,
    products,
    updateOrderStatus,
    updateOrder,
    deleteOrder,
    addOrder,
    convertDealToOrder,
  } = useCRM();

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [paymentFilter, setPaymentFilter] = useState<string>('ALL');

  // Modal & Confirmation states
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [pendingDeleteOrder, setPendingDeleteOrder] = useState<Order | null>(null);

  // Order Detail Edit States
  const [editStatus, setEditStatus] = useState<OrderStatus>('CONFIRMED');
  const [editPaymentStatus, setEditPaymentStatus] = useState<Order['paymentStatus']>('UNPAID');
  const [editPaidAmount, setEditPaidAmount] = useState<number>(0);
  const [editShippingAddr, setEditShippingAddr] = useState<string>('');
  const [editOrderNotes, setEditOrderNotes] = useState<string>('');

  React.useEffect(() => {
    if (selectedOrder) {
      setEditStatus(selectedOrder.status);
      setEditPaymentStatus(selectedOrder.paymentStatus);
      setEditPaidAmount(
        selectedOrder.paidAmount ?? (selectedOrder.paymentStatus === 'PAID' ? selectedOrder.totalAmount : 0)
      );
      setEditShippingAddr(selectedOrder.shippingAddress || '');
      setEditShippingAddrData({
        country: selectedOrder.country || 'Türkiye',
        city: selectedOrder.city || '',
        district: selectedOrder.district || '',
        addressLine: selectedOrder.addressLine || selectedOrder.shippingAddress || '',
        fullAddress: selectedOrder.shippingAddress || '',
      });
      setEditOrderNotes(selectedOrder.notes || '');
    }
  }, [selectedOrder?.id]);

  // Sorting State
  const [sortField, setSortField] = useState<'orderNumber' | 'contactName' | 'totalAmount' | 'createdAt'>('createdAt');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');

  const [isNewOrderModalOpen, setIsNewOrderModalOpen] = useState(false);
  const [isQuickContactModalOpen, setIsQuickContactModalOpen] = useState(false);
  const [selectedDealId, setSelectedDealId] = useState('');
  const [selectedContactId, setSelectedContactId] = useState('');
  const [orderItems, setOrderItems] = useState<
    { productId: string; quantity: number; unitPrice: number; discountPercent: number }[]
  >([]);

  // Address states
  const [shippingAddrData, setShippingAddrData] = useState({
    country: 'Türkiye',
    city: '',
    district: '',
    addressLine: '',
    fullAddress: '',
  });

  const [editShippingAddrData, setEditShippingAddrData] = useState({
    country: 'Türkiye',
    city: '',
    district: '',
    addressLine: '',
    fullAddress: '',
  });

  const [shippingAddr, setShippingAddr] = useState('');
  const [orderNotes, setOrderNotes] = useState('');

  // Status Badge Helper
  const getStatusBadge = (status: OrderStatus) => {
    switch (status) {
      case 'DRAFT':
        return { label: 'Taslak', bg: 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300', icon: Clock };
      case 'CONFIRMED':
        return { label: 'Onaylandı', bg: 'bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300', icon: CheckCircle2 };
      case 'PROCESSING':
        return { label: 'Hazırlanıyor / İşlemde', bg: 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300', icon: Clock };
      case 'SHIPPED':
        return { label: 'Kargoya Verildi', bg: 'bg-purple-100 text-purple-700 dark:bg-purple-950 dark:text-purple-300', icon: Truck };
      case 'FULFILLED':
        return { label: 'Tamamlandı / Teslim Edildi', bg: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300', icon: CheckCircle2 };
      case 'CANCELLED':
        return { label: 'İptal Edildi', bg: 'bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300', icon: XCircle };
      default:
        return { label: status, bg: 'bg-slate-100 text-slate-700', icon: Clock };
    }
  };

  const getPaymentBadge = (payStatus: Order['paymentStatus']) => {
    switch (payStatus) {
      case 'PAID':
        return { label: 'Ödendi', bg: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300' };
      case 'PARTIAL':
        return { label: 'Kısmi Ödeme', bg: 'bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300' };
      case 'UNPAID':
        return { label: 'Ödenmedi', bg: 'bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300' };
    }
  };

  const filteredOrders = orders.filter((o) => {
    const matchesSearch =
      o.orderNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      o.contactName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (o.accountName && o.accountName.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (o.dealTitle && o.dealTitle.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesStatus = statusFilter === 'ALL' || o.status === statusFilter;
    const matchesPayment = paymentFilter === 'ALL' || o.paymentStatus === paymentFilter;

    return matchesSearch && matchesStatus && matchesPayment;
  });

  // Handle Quick Conversion from Won Deals
  const wonDeals = deals.filter(
    (d) => d.stageId === 'stg-5' || d.probability === 100 || d.title.toLowerCase().includes('won')
  );

  const handleConvertWonDeal = (dealId: string) => {
    const newOrd = convertDealToOrder(dealId);
    if (newOrd) {
      setSelectedOrder(newOrd);
      setIsDetailModalOpen(true);
    }
  };

  // Add Item to New Order Form
  const handleAddLineItemToOrder = () => {
    if (products.length === 0) return;
    const firstProd = products[0];
    setOrderItems([
      ...orderItems,
      {
        productId: firstProd.id,
        quantity: 1,
        unitPrice: firstProd.unitPrice,
        discountPercent: 0,
      },
    ]);
  };

  const handleSaveNewOrder = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedContactId && !selectedDealId) return;

    if (selectedDealId) {
      convertDealToOrder(selectedDealId);
      setIsNewOrderModalOpen(false);
      return;
    }

    const contact = contacts.find((c) => c.id === selectedContactId);
    const account = accounts.find((a) => a.id === contact?.accountId);

    const lineItemsArr: OrderLineItem[] = orderItems.map((item, idx) => {
      const p = products.find((prod) => prod.id === item.productId);
      const sub = item.quantity * item.unitPrice * (1 - item.discountPercent / 100);
      return {
        id: `oli-${Date.now()}-${idx}`,
        productId: item.productId,
        productName: p?.name || 'Ürün',
        sku: p?.sku || 'SKU-001',
        type: p?.type || 'PRODUCT',
        unitPrice: item.unitPrice,
        quantity: item.quantity,
        discountPercent: item.discountPercent,
        subtotal: sub,
        dimensions: p?.dimensions,
      };
    });

    const subtotal = lineItemsArr.reduce((sum, i) => sum + i.subtotal, 0);
    const taxAmount = Math.round(subtotal * 0.18);
    const totalAmount = subtotal + taxAmount;

    addOrder({
      contactId: selectedContactId,
      contactName: contact ? `${contact.firstName} ${contact.lastName}` : 'Müşteri',
      accountId: contact?.accountId,
      accountName: account?.name || contact?.accountName || '',
      status: 'CONFIRMED',
      lineItems: lineItemsArr,
      subtotal,
      taxAmount,
      discountAmount: 0,
      totalAmount,
      currency: 'USD',
      paymentStatus: 'UNPAID',
      shippingAddress: shippingAddrData.fullAddress || shippingAddr,
      country: shippingAddrData.country,
      city: shippingAddrData.city,
      district: shippingAddrData.district,
      addressLine: shippingAddrData.addressLine,
      notes: orderNotes,
      ownerId: contact?.ownerId || 'usr-1',
    });

    setIsNewOrderModalOpen(false);
  };

  return (
    <div className="flex h-full flex-col gap-6 overflow-y-auto p-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <ShoppingBag className="h-7 w-7 text-indigo-600" />
            Sipariş Yönetim Modülü
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Kazanılan fırsatlardan otomatik üretilen siparişler, tedarik ve faturalandırma takibi
          </p>
        </div>

        <button
          onClick={() => {
            const initialContact = contacts[0];
            const initialAccount = initialContact ? accounts.find((a) => a.id === initialContact.accountId || a.name === initialContact.accountName) : null;
            setSelectedDealId('');
            setSelectedContactId(initialContact?.id || '');
            setOrderItems(
              products[0]
                ? [{ productId: products[0].id, quantity: 1, unitPrice: products[0].unitPrice, discountPercent: 0 }]
                : []
            );
            setShippingAddr(initialAccount?.address || initialContact?.address || '');
            setOrderNotes('');
            setIsNewOrderModalOpen(true);
          }}
          className="flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-xs font-semibold text-white shadow-md transition hover:bg-indigo-700"
        >
          <Plus className="h-4 w-4" />
          Manuel Sipariş Oluştur
        </button>
      </div>

      {/* Filters Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <div className="relative flex-1 min-w-[240px]">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Sipariş no, müşteri veya şirket ara..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-xl border border-slate-200 bg-slate-50 pl-9 pr-4 py-2 text-xs focus:border-indigo-500 focus:bg-white focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
          />
        </div>

        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-slate-400" />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-medium text-slate-700 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
          >
            <option value="ALL">Tüm Durumlar</option>
            <option value="DRAFT">Taslak</option>
            <option value="CONFIRMED">Onaylandı</option>
            <option value="PROCESSING">Hazırlanıyor</option>
            <option value="SHIPPED">Kargoya Verildi</option>
            <option value="FULFILLED">Tamamlandı</option>
            <option value="CANCELLED">İptal</option>
          </select>

          <select
            value={paymentFilter}
            onChange={(e) => setPaymentFilter(e.target.value)}
            className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-medium text-slate-700 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
          >
            <option value="ALL">Tüm Ödeme Durumları</option>
            <option value="PAID">Ödendi</option>
            <option value="PARTIAL">Kısmi Ödeme</option>
            <option value="UNPAID">Ödenmedi</option>
          </select>
        </div>
      </div>

      {/* Orders Table */}
      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <table className="w-full text-left text-xs">
          <thead className="border-b border-slate-200 bg-slate-50 font-semibold text-slate-600 dark:border-slate-800 dark:bg-slate-800/60 dark:text-slate-300">
            <tr>
              <th className="py-3.5 pl-4 pr-3">Sipariş No</th>
              <th className="px-3 py-3.5">Müşteri & Şirket</th>
              <th className="px-3 py-3.5">Kalem Sayısı</th>
              <th className="px-3 py-3.5">Toplam Tutar</th>
              <th className="px-3 py-3.5">Sipariş Durumu</th>
              <th className="px-3 py-3.5">Ödeme Durumu</th>
              <th className="px-3 py-3.5">Tarih</th>
              <th className="py-3.5 pl-3 pr-4 text-right">İşlem</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-700 dark:text-slate-300">
            {filteredOrders.map((order) => {
              const statusInfo = getStatusBadge(order.status);
              const payInfo = getPaymentBadge(order.paymentStatus);
              const StatusIcon = statusInfo.icon;

              return (
                <tr
                  key={order.id}
                  onClick={() => {
                    setSelectedOrder(order);
                    setIsDetailModalOpen(true);
                  }}
                  className="hover:bg-indigo-50/50 transition cursor-pointer dark:hover:bg-indigo-950/30"
                  title="Tıklayarak sipariş detayını ve formunu açın"
                >
                  <td className="py-3.5 pl-4 pr-3 font-mono font-bold text-indigo-600 dark:text-indigo-400">
                    {order.orderNumber}
                    {order.dealTitle && (
                      <span className="block text-[10px] font-sans font-normal text-slate-400 truncate max-w-[150px]">
                        {order.dealTitle}
                      </span>
                    )}
                  </td>

                  <td className="px-3 py-3.5">
                    <div className="font-semibold text-slate-900 dark:text-white">{order.contactName}</div>
                    <div className="text-[11px] text-slate-400">{order.accountName || 'Bireysel Müşteri'}</div>
                  </td>

                  <td className="px-3 py-3.5 font-medium">
                    {order.lineItems?.length || 0} Kalem
                  </td>

                  <td className="px-3 py-3.5 font-bold text-slate-900 dark:text-white">
                    ${order.totalAmount.toLocaleString()} {order.currency}
                  </td>

                  <td className="px-3 py-3.5">
                    <span className={`inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-[11px] font-bold ${statusInfo.bg}`}>
                      <StatusIcon className="h-3.5 w-3.5" />
                      {statusInfo.label}
                    </span>
                  </td>

                  <td className="px-3 py-3.5">
                    <span className={`inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-[10px] font-bold ${payInfo.bg}`}>
                      <DollarSign className="h-3 w-3" />
                      {payInfo.label}
                    </span>
                  </td>

                  <td className="px-3 py-3.5 text-slate-400 font-mono text-[11px]">
                    {new Date(order.createdAt).toLocaleDateString('tr-TR')}
                  </td>

                  <td className="py-3.5 pl-3 pr-4 text-right" onClick={(e) => e.stopPropagation()}>
                    <div className="flex items-center justify-end gap-1.5">
                      <button
                        onClick={() => setPendingDeleteOrder(order)}
                        className="inline-flex items-center gap-1 rounded-xl bg-rose-50 px-2.5 py-1.5 text-xs font-semibold text-rose-600 hover:bg-rose-100 dark:bg-rose-950/60 dark:text-rose-400"
                        title="Siparişi Sil"
                      >
                        Sil
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>

        {filteredOrders.length === 0 && (
          <div className="p-12 text-center text-slate-400">
            <ShoppingBag className="mx-auto h-10 w-10 text-slate-300 dark:text-slate-600 mb-2" />
            <p className="text-sm font-semibold">Sipariş Kaydı Bulunamadı</p>
          </div>
        )}
      </div>

      {/* ORDER DETAIL MODAL */}
      {isDetailModalOpen && selectedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-sm">
          <div className="w-full max-w-3xl rounded-2xl bg-white p-6 shadow-xl dark:bg-slate-900 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-200 pb-4 dark:border-slate-800">
              <div>
                <span className="text-xs font-mono font-bold text-indigo-600 dark:text-indigo-400">
                  {selectedOrder.orderNumber}
                </span>
                <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                  Sipariş Detay Formu & Kalemleri
                </h2>
              </div>
              <button onClick={() => setIsDetailModalOpen(false)} className="rounded-lg p-1 text-slate-400 hover:bg-slate-100">
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="mt-4 flex flex-col gap-6">
              {/* Quick Status Control Bar */}
              <div className="flex flex-wrap items-center justify-between gap-4 rounded-xl border border-slate-200 bg-slate-50/80 p-4 dark:border-slate-800 dark:bg-slate-800/60">
                <div>
                  <span className="text-xs font-bold text-slate-700 dark:text-slate-300">Sipariş Durumu:</span>
                  <div className="mt-1 flex flex-wrap gap-1.5">
                    {(['CONFIRMED', 'PROCESSING', 'SHIPPED', 'FULFILLED', 'CANCELLED'] as OrderStatus[]).map((st) => (
                      <button
                        key={st}
                        type="button"
                        onClick={() => setEditStatus(st)}
                        className={`rounded-lg px-2.5 py-1 text-[11px] font-bold transition ${
                          editStatus === st
                            ? 'bg-indigo-600 text-white shadow-sm'
                            : 'bg-white text-slate-700 hover:bg-slate-200 dark:bg-slate-700 dark:text-slate-200'
                        }`}
                      >
                        {st}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <span className="text-xs font-bold text-slate-700 dark:text-slate-300">Ödeme Tahsilat Durumu:</span>
                  <div className="mt-1 flex gap-1.5">
                    {(['UNPAID', 'PARTIAL', 'PAID'] as Order['paymentStatus'][]).map((ps) => (
                      <button
                        key={ps}
                        type="button"
                        onClick={() => {
                          setEditPaymentStatus(ps);
                          if (ps === 'PAID') {
                            setEditPaidAmount(selectedOrder.totalAmount);
                          } else if (ps === 'UNPAID') {
                            setEditPaidAmount(0);
                          }
                        }}
                        className={`rounded-lg px-2.5 py-1 text-[11px] font-bold transition ${
                          editPaymentStatus === ps
                            ? 'bg-emerald-600 text-white shadow-sm'
                            : 'bg-white text-slate-700 hover:bg-slate-200 dark:bg-slate-700 dark:text-slate-200'
                        }`}
                      >
                        {ps === 'PAID' ? 'Ödendi' : ps === 'PARTIAL' ? 'Kısmi Ödeme' : 'Ödenmedi'}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Partial Payment Amount Input & Calculation Box */}
              {editPaymentStatus === 'PARTIAL' && (
                <div className="rounded-xl border border-indigo-200 bg-indigo-50/70 p-4 dark:border-indigo-900/50 dark:bg-indigo-950/40">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                    <div className="flex-1">
                      <label className="font-bold text-indigo-950 dark:text-indigo-200 block mb-1">
                        Tahsil Edilen (Kısmi Ödenen) Miktar ($) *
                      </label>
                      <input
                        type="number"
                        min={0}
                        max={selectedOrder.totalAmount}
                        value={editPaidAmount}
                        onChange={(e) => setEditPaidAmount(Number(e.target.value))}
                        className="w-full rounded-xl border border-indigo-300 bg-white p-2.5 text-sm font-bold text-slate-900 shadow-sm outline-none focus:border-indigo-600 dark:border-indigo-700 dark:bg-slate-800 dark:text-white"
                        placeholder="Örn: 500"
                      />
                    </div>
                    <div className="rounded-xl bg-white p-3 border border-indigo-100 shadow-sm dark:bg-slate-900 dark:border-indigo-900 min-w-[180px] text-right">
                      <span className="text-[10px] uppercase font-bold text-slate-400 block">Kalan Sipariş Bakiyesi</span>
                      <span className="text-base font-extrabold text-rose-600 dark:text-rose-400">
                        ${Math.max(0, (selectedOrder.totalAmount || 0) - (editPaidAmount || 0)).toLocaleString()} {selectedOrder.currency}
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {/* Customer Info & Shipping Address Editable */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 rounded-xl border border-slate-200 p-4 dark:border-slate-800">
                <div>
                  <span className="text-[10px] font-bold uppercase text-slate-400">Müşteri Bilgisi</span>
                  <div className="mt-1 font-semibold text-slate-900 dark:text-white text-sm">{selectedOrder.contactName}</div>
                  <div className="text-xs text-slate-500">{selectedOrder.accountName || 'Bireysel Müşteri'}</div>
                </div>

                <div className="col-span-1 md:col-span-2">
                  <LocationAddressSelector
                    country={editShippingAddrData.country}
                    city={editShippingAddrData.city}
                    district={editShippingAddrData.district}
                    addressLine={editShippingAddrData.addressLine}
                    onChange={(val) => {
                      setEditShippingAddrData(val);
                      setEditShippingAddr(val.fullAddress);
                    }}
                    compact
                  />
                </div>
              </div>

              {/* Line Items Table */}
              <div>
                <h3 className="text-xs font-bold text-slate-900 dark:text-white mb-2 flex items-center gap-1.5">
                  <Package className="h-4 w-4 text-indigo-600" />
                  Sipariş Edilen Ürün ve Hizmet Kalemleri
                </h3>

                <div className="overflow-hidden rounded-xl border border-slate-200 dark:border-slate-800">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-50 font-semibold text-slate-600 dark:bg-slate-800/60 dark:text-slate-300">
                      <tr>
                        <th className="py-2.5 pl-3 pr-2">Ürün / Hizmet</th>
                        <th className="px-2 py-2.5">Birim Fiyat</th>
                        <th className="px-2 py-2.5">Miktar</th>
                        <th className="px-2 py-2.5">İskonto</th>
                        <th className="py-2.5 pl-2 pr-3 text-right">Ara Toplam</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                      {selectedOrder.lineItems?.map((item) => (
                        <tr key={item.id}>
                          <td className="py-2.5 pl-3 pr-2">
                            <div className="font-bold text-slate-900 dark:text-white">{item.productName}</div>
                            <div className="text-[10px] text-slate-400 font-mono">{item.sku}</div>

                            {/* Dimension values */}
                            {item.dimensions && Object.keys(item.dimensions).length > 0 && (
                              <div className="mt-1 flex flex-wrap gap-1">
                                {Object.entries(item.dimensions || {}).map(([k, v]) => (
                                  <span key={k} className="rounded bg-slate-100 px-1.5 py-0.5 text-[9px] font-medium text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                                    {k}: {String(v)}
                                  </span>
                                ))}
                              </div>
                            )}
                          </td>
                          <td className="px-2 py-2.5 font-mono">${item.unitPrice.toLocaleString()}</td>
                          <td className="px-2 py-2.5 font-bold">{item.quantity}</td>
                          <td className="px-2 py-2.5 text-rose-500 font-medium">%{item.discountPercent}</td>
                          <td className="py-2.5 pl-2 pr-3 text-right font-extrabold text-slate-900 dark:text-white">
                            ${item.subtotal.toLocaleString()}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Total Calculation & Payment Summary */}
              <div className="flex justify-end">
                <div className="w-72 flex flex-col gap-1.5 text-xs bg-slate-50 p-4 rounded-xl border border-slate-200 dark:bg-slate-800/50 dark:border-slate-800">
                  <div className="flex justify-between text-slate-500">
                    <span>Ara Toplam:</span>
                    <span className="font-semibold text-slate-800 dark:text-slate-200">${selectedOrder.subtotal?.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-slate-500">
                    <span>KDV (%18):</span>
                    <span className="font-semibold text-slate-800 dark:text-slate-200">${selectedOrder.taxAmount?.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-sm font-extrabold text-slate-900 dark:text-white border-t border-slate-200 pt-2 dark:border-slate-700">
                    <span>Genel Sipariş Tutarı:</span>
                    <span className="text-indigo-600 dark:text-indigo-400">${selectedOrder.totalAmount?.toLocaleString()} {selectedOrder.currency}</span>
                  </div>

                  <div className="flex justify-between text-xs font-bold text-emerald-600 pt-1">
                    <span>Ödenen / Tahsil Edilen:</span>
                    <span>
                      $
                      {(
                        editPaymentStatus === 'PAID'
                          ? selectedOrder.totalAmount
                          : editPaymentStatus === 'UNPAID'
                          ? 0
                          : editPaidAmount
                      ).toLocaleString()}
                    </span>
                  </div>

                  <div className="flex justify-between text-xs font-bold text-rose-600 border-t border-dashed border-slate-300 pt-1 dark:border-slate-700">
                    <span>Kalan Bakiye:</span>
                    <span>
                      $
                      {Math.max(
                        0,
                        (selectedOrder.totalAmount || 0) -
                          (editPaymentStatus === 'PAID'
                            ? selectedOrder.totalAmount
                            : editPaymentStatus === 'UNPAID'
                            ? 0
                            : editPaidAmount)
                      ).toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>

              {/* Editable Notes */}
              <div>
                <label className="text-[10px] font-bold uppercase text-slate-400 block mb-1">Sipariş Notları & Açıklama</label>
                <textarea
                  rows={2}
                  value={editOrderNotes}
                  onChange={(e) => setEditOrderNotes(e.target.value)}
                  placeholder="Sipariş ile ilgili dahili not ekleyin..."
                  className="w-full rounded-xl border border-slate-200 bg-white p-2.5 text-xs outline-none focus:border-indigo-500 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                />
              </div>

              {/* Action Buttons Footer including Save Changes */}
              <div className="flex items-center justify-between border-t border-slate-200 pt-4 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsDetailModalOpen(false)}
                  className="rounded-xl border border-slate-300 bg-white px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
                >
                  Kapat
                </button>
                <button
                  type="button"
                  onClick={() => {
                    const finalPaid =
                      editPaymentStatus === 'PAID'
                        ? selectedOrder.totalAmount
                        : editPaymentStatus === 'UNPAID'
                        ? 0
                        : editPaidAmount;

                    const updatedData = {
                      status: editStatus,
                      paymentStatus: editPaymentStatus,
                      paidAmount: finalPaid,
                      shippingAddress: editShippingAddrData.fullAddress || editShippingAddr,
                      country: editShippingAddrData.country,
                      city: editShippingAddrData.city,
                      district: editShippingAddrData.district,
                      addressLine: editShippingAddrData.addressLine,
                      notes: editOrderNotes,
                    };

                    updateOrder(selectedOrder.id, updatedData);
                    setSelectedOrder({ ...selectedOrder, ...updatedData });
                    alert('Sipariş ve detay bilgileri başarıyla kaydedildi.');
                    setIsDetailModalOpen(false);
                  }}
                  className="rounded-xl bg-indigo-600 px-6 py-2.5 text-xs font-bold text-white shadow-md hover:bg-indigo-700 transition flex items-center gap-1.5"
                >
                  <CheckCircle2 className="h-4 w-4" />
                  Değişiklikleri Kaydet
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* NEW MANUAL ORDER MODAL */}
      {isNewOrderModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-sm">
          <div className="w-full max-w-2xl rounded-2xl bg-white p-6 shadow-xl dark:bg-slate-900 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-200 pb-4 dark:border-slate-800">
              <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Plus className="h-5 w-5 text-indigo-600" />
                Manuel Sipariş Oluştur
              </h2>
              <button onClick={() => setIsNewOrderModalOpen(false)} className="rounded-lg p-1 text-slate-400 hover:bg-slate-100">
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSaveNewOrder} className="mt-4 flex flex-col gap-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {/* Searchable Customer Select */}
                <div>
                  <SearchableContactSelect
                    selectedContactId={selectedContactId}
                    onSelectContact={(newId) => {
                      setSelectedContactId(newId);
                      const contactObj = contacts.find((c) => c.id === newId);
                      const accObj = contactObj
                        ? accounts.find((a) => a.id === contactObj.accountId || a.name === contactObj.accountName)
                        : null;
                      
                      const foundAddr = accObj?.address || contactObj?.address || '';
                      setShippingAddr(foundAddr);
                      setShippingAddrData({
                        country: contactObj?.country || accObj?.country || 'Türkiye',
                        city: contactObj?.city || accObj?.city || '',
                        district: contactObj?.district || accObj?.district || '',
                        addressLine: contactObj?.addressLine || accObj?.addressLine || foundAddr,
                        fullAddress: foundAddr,
                      });
                    }}
                    onOpenNewContactModal={() => setIsQuickContactModalOpen(true)}
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                    İlişkili Fırsat (Opsiyonel)
                  </label>
                  <select
                    value={selectedDealId}
                    onChange={(e) => setSelectedDealId(e.target.value)}
                    className="mt-1.5 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs text-slate-800 focus:border-indigo-500 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                  >
                    <option value="">-- Doğrudan Sipariş (Fırsat Yok) --</option>
                    {deals.map((d) => (
                      <option key={d.id} value={d.id}>
                        {d.title} (${d.amount.toLocaleString()})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {!selectedDealId && (
                <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-800/40">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="text-xs font-bold text-slate-900 dark:text-white">Sipariş Kalemleri</h4>
                    <button
                      type="button"
                      onClick={handleAddLineItemToOrder}
                      className="flex items-center gap-1 text-xs font-semibold text-indigo-600 hover:text-indigo-800"
                    >
                      <Plus className="h-3.5 w-3.5" /> Kalem Ekle
                    </button>
                  </div>

                  <div className="flex flex-col gap-2">
                    {orderItems.map((item, idx) => (
                      <div key={idx} className="grid grid-cols-12 gap-2 items-center">
                        <select
                          value={item.productId}
                          onChange={(e) => {
                            const newProd = products.find((p) => p.id === e.target.value);
                            const copy = [...orderItems];
                            copy[idx].productId = e.target.value;
                            if (newProd) copy[idx].unitPrice = newProd.unitPrice;
                            setOrderItems(copy);
                          }}
                          className="col-span-5 rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                        >
                          {products.map((p) => (
                            <option key={p.id} value={p.id}>
                              {p.name} (${p.unitPrice})
                            </option>
                          ))}
                        </select>

                        <input
                          type="number"
                          min="1"
                          value={item.quantity}
                          onChange={(e) => {
                            const copy = [...orderItems];
                            copy[idx].quantity = parseInt(e.target.value) || 1;
                            setOrderItems(copy);
                          }}
                          placeholder="Miktar"
                          className="col-span-2 rounded-lg border border-slate-200 bg-white px-2 py-1.5 text-xs text-center dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                        />

                        <input
                          type="number"
                          value={item.unitPrice}
                          onChange={(e) => {
                            const copy = [...orderItems];
                            copy[idx].unitPrice = parseFloat(e.target.value) || 0;
                            setOrderItems(copy);
                          }}
                          placeholder="Fiyat"
                          className="col-span-3 rounded-lg border border-slate-200 bg-white px-2 py-1.5 text-xs dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                        />

                        <button
                          type="button"
                          onClick={() => setOrderItems(orderItems.filter((_, i) => i !== idx))}
                          className="col-span-2 text-rose-500 hover:text-rose-700 text-xs text-center font-bold"
                        >
                          Kaldır
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Location Address Selector for New Order */}
              <LocationAddressSelector
                country={shippingAddrData.country}
                city={shippingAddrData.city}
                district={shippingAddrData.district}
                addressLine={shippingAddrData.addressLine}
                onChange={(val) => {
                  setShippingAddrData(val);
                  setShippingAddr(val.fullAddress);
                }}
                compact
              />

              <div>
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Notlar & Özel Talimatlar</label>
                <textarea
                  rows={2}
                  value={orderNotes}
                  onChange={(e) => setOrderNotes(e.target.value)}
                  placeholder="Sipariş onay ve faturalandırma notları..."
                  className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-xs focus:border-indigo-500 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                />
              </div>

              <div className="mt-4 flex justify-end gap-2 border-t border-slate-200 pt-4 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsNewOrderModalOpen(false)}
                  className="rounded-xl px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 dark:text-slate-300"
                >
                  İptal
                </button>
                <button
                  type="submit"
                  className="rounded-xl bg-indigo-600 px-5 py-2 text-xs font-semibold text-white shadow-md hover:bg-indigo-700"
                >
                  Siparişi Tamamla
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {/* Quick Add Contact Modal */}
      <QuickAddContactModal
        isOpen={isQuickContactModalOpen}
        onClose={() => setIsQuickContactModalOpen(false)}
        onSuccess={(newContact) => {
          setSelectedContactId(newContact.id);
          const foundAddr = newContact.address || '';
          setShippingAddr(foundAddr);
          setShippingAddrData({
            country: newContact.country || 'Türkiye',
            city: newContact.city || '',
            district: newContact.district || '',
            addressLine: newContact.addressLine || foundAddr,
            fullAddress: foundAddr,
          });
        }}
      />

      {/* Delete Order Confirmation Modal */}
      <DeleteConfirmModal
        isOpen={Boolean(pendingDeleteOrder)}
        title="Sipariş Silme Onayı"
        recordType="Sipariş"
        recordTitle={pendingDeleteOrder ? pendingDeleteOrder.orderNumber : ''}
        summaryItems={
          pendingDeleteOrder
            ? [
                { label: 'Müşteri', value: pendingDeleteOrder.contactName },
                { label: 'Şirket', value: pendingDeleteOrder.accountName || 'Bireysel' },
                { label: 'Toplam Tutar', value: `$${pendingDeleteOrder.totalAmount?.toLocaleString()} ${pendingDeleteOrder.currency}` },
                { label: 'Sipariş Durumu', value: pendingDeleteOrder.status },
              ]
            : []
        }
        onConfirm={() => {
          if (pendingDeleteOrder) {
            deleteOrder(pendingDeleteOrder.id);
            setPendingDeleteOrder(null);
          }
        }}
        onCancel={() => setPendingDeleteOrder(null)}
      />
    </div>
  );
};
