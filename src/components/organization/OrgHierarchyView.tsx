import React, { useState } from 'react';
import { useCRM } from '../../context/CRMContext';
import { OrgNode, OrgPermissionRule, User, DataAccessScope, AccessRight } from '../../types';
import {
  Network, Users, Shield, Plus, Building, UserCheck, Key, Settings,
  Edit2, Trash2, Check, X, ChevronRight, ChevronDown, CornerDownRight, Lock, Eye, EyeOff, AlertCircle, CheckCircle2
} from 'lucide-react';

interface OrgTreeNodeItemProps {
  node: OrgNode;
  allNodes: OrgNode[];
  allUsers: User[];
  onEdit: (node: OrgNode) => void;
  onDelete: (id: string) => void;
  onAddChild: (parentId: string) => void;
}

const OrgTreeNodeItem: React.FC<OrgTreeNodeItemProps> = ({
  node,
  allNodes,
  allUsers,
  onEdit,
  onDelete,
  onAddChild,
}) => {
  const [isExpanded, setIsExpanded] = useState(true);

  const childNodes = allNodes.filter((n) => n.parentId === node.id);
  const manager = allUsers.find((u) => u.id === node.managerUserId);
  const deptStaff = allUsers.filter((u) => u.departmentId === node.id);

  return (
    <div className="flex flex-col gap-2">
      {/* Node Card */}
      <div className="flex flex-col justify-between rounded-2xl border border-slate-200 bg-white p-4 shadow-sm transition hover:border-indigo-300 dark:border-slate-800 dark:bg-slate-900">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-2">
            {childNodes.length > 0 ? (
              <button
                onClick={() => setIsExpanded(!isExpanded)}
                className="rounded-lg p-1 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800"
                title={isExpanded ? 'Daralt' : 'Genişlet'}
              >
                {isExpanded ? <ChevronDown className="h-4 w-4 text-indigo-600" /> : <ChevronRight className="h-4 w-4 text-indigo-600" />}
              </button>
            ) : (
              <span className="w-6 h-6 flex items-center justify-center text-slate-300">•</span>
            )}

            <div>
              <div className="flex items-center gap-2">
                <span className="rounded-md bg-slate-100 px-2 py-0.5 font-mono text-[10px] font-bold text-slate-700 dark:bg-slate-800 dark:text-slate-300">
                  {node.code}
                </span>
                <span className={`rounded-md px-2 py-0.5 text-[10px] font-bold ${node.type === 'HEAD' ? 'bg-indigo-600 text-white' : node.type === 'UNIT' ? 'bg-amber-100 text-amber-800' : 'bg-blue-100 text-blue-800'}`}>
                  {node.type === 'HEAD' ? 'Üst Yönetim' : node.type === 'UNIT' ? 'Alt Birim' : 'Departman'}
                </span>
                {childNodes.length > 0 && (
                  <span className="rounded-full bg-indigo-50 px-2 py-0.5 text-[10px] font-semibold text-indigo-600 dark:bg-indigo-950 dark:text-indigo-400">
                    {childNodes.length} Alt Birim
                  </span>
                )}
              </div>
              <h4 className="mt-1 font-bold text-slate-900 dark:text-white text-base">{node.name}</h4>
              {node.description && (
                <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
                  {node.description}
                </p>
              )}
            </div>
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            <button
              onClick={() => onAddChild(node.id)}
              className="flex items-center gap-1 rounded-lg bg-indigo-50 px-2.5 py-1 text-[11px] font-semibold text-indigo-600 hover:bg-indigo-100 dark:bg-indigo-950 dark:text-indigo-300"
              title="Alt Departman / Birim Ekle"
            >
              <Plus className="h-3 w-3" />
              Alt Birim Ekle
            </button>
            <button
              onClick={() => onEdit(node)}
              className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-800"
              title="Düzenle"
            >
              <Edit2 className="h-3.5 w-3.5" />
            </button>
            {node.type !== 'HEAD' && (
              <button
                onClick={() => onDelete(node.id)}
                className="rounded-lg p-1.5 text-slate-400 hover:bg-rose-50 hover:text-rose-600 dark:hover:bg-rose-950"
                title="Sil"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* Manager & Staff footer inside node card */}
        <div className="mt-3 flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 pt-3 dark:border-slate-800/80 text-xs">
          <div className="flex items-center gap-2">
            <UserCheck className="h-4 w-4 text-indigo-500" />
            <span className="text-[11px] text-slate-400">Yönetici:</span>
            <strong className="text-slate-800 dark:text-slate-200 text-xs">
              {manager ? manager.name : 'Atanmadı'}
            </strong>
          </div>

          <div className="flex items-center gap-1.5">
            <span className="text-[10px] font-bold text-slate-400 uppercase">
              Personeller ({deptStaff.length}):
            </span>
            {deptStaff.slice(0, 4).map((st) => (
              <span
                key={st.id}
                className="inline-flex items-center gap-1 rounded-md bg-slate-100 px-2 py-0.5 text-[10px] font-medium text-slate-700 dark:bg-slate-800 dark:text-slate-300"
              >
                {st.name}
              </span>
            ))}
            {deptStaff.length > 4 && (
              <span className="text-[10px] font-semibold text-slate-400">+{deptStaff.length - 4}</span>
            )}
            {deptStaff.length === 0 && (
              <span className="text-[10px] text-slate-400 italic">Personel yok</span>
            )}
          </div>
        </div>
      </div>

      {/* Children Drill-down Container */}
      {isExpanded && childNodes.length > 0 && (
        <div className="pl-6 border-l-2 border-indigo-200 dark:border-indigo-900/60 space-y-2 mt-1">
          {childNodes.map((child) => (
            <OrgTreeNodeItem
              key={child.id}
              node={child}
              allNodes={allNodes}
              allUsers={allUsers}
              onEdit={onEdit}
              onDelete={onDelete}
              onAddChild={onAddChild}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export const OrgHierarchyView: React.FC = () => {
  const {
    orgNodes,
    orgRules,
    users,
    addOrgNode,
    updateOrgNode,
    deleteOrgNode,
    updateOrgRule,
    updateUserOrgProfile,
  } = useCRM();

  const [activeTab, setActiveTab] = useState<'hierarchy' | 'rbac' | 'staff'>('hierarchy');

  // Node Modal State
  const [isNodeModalOpen, setIsNodeModalOpen] = useState(false);
  const [editingNode, setEditingNode] = useState<OrgNode | null>(null);
  const [nodeName, setNodeName] = useState('');
  const [nodeCode, setNodeCode] = useState('');
  const [nodeType, setNodeType] = useState<OrgNode['type']>('DEPARTMENT');
  const [parentId, setParentId] = useState('');
  const [managerUserId, setManagerUserId] = useState('');
  const [nodeDesc, setNodeDesc] = useState('');

  // User Assignment State
  const [selectedUserId, setSelectedUserId] = useState<string>('');
  const [userDeptId, setUserDeptId] = useState<string>('');
  const [userPos, setUserPos] = useState<User['position']>('STAFF');
  const [userReportsTo, setUserReportsTo] = useState<string>('');

  // Confirmation Modal State for Personnel Assignment
  const [isStaffConfirmModalOpen, setIsStaffConfirmModalOpen] = useState(false);
  const [saveSuccessNotice, setSaveSuccessNotice] = useState<string | null>(null);

  const openNewNodeModal = (defaultParentId?: string) => {
    setEditingNode(null);
    setNodeName('');
    setNodeCode(`DEPT-${Math.floor(100 + Math.random() * 900)}`);
    setNodeType('DEPARTMENT');
    setParentId(defaultParentId || orgNodes.find((n) => n.type === 'HEAD')?.id || '');
    setManagerUserId(users[0]?.id || '');
    setNodeDesc('');
    setIsNodeModalOpen(true);
  };

  const openEditNodeModal = (node: OrgNode) => {
    setEditingNode(node);
    setNodeName(node.name);
    setNodeCode(node.code);
    setNodeType(node.type);
    setParentId(node.parentId || '');
    setManagerUserId(node.managerUserId || '');
    setNodeDesc(node.description || '');
    setIsNodeModalOpen(true);
  };

  const handleSaveNode = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nodeName.trim()) return;

    if (editingNode) {
      updateOrgNode(editingNode.id, {
        name: nodeName,
        code: nodeCode,
        type: nodeType,
        parentId: parentId || undefined,
        managerUserId: managerUserId || undefined,
        description: nodeDesc,
      });
    } else {
      addOrgNode({
        name: nodeName,
        code: nodeCode,
        type: nodeType,
        parentId: parentId || undefined,
        managerUserId: managerUserId || undefined,
        description: nodeDesc,
      });
    }
    setIsNodeModalOpen(false);
  };

  const handleStaffFormSubmitRequest = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUserId) return;
    setIsStaffConfirmModalOpen(true);
  };

  const handleConfirmStaffAssignment = () => {
    if (!selectedUserId) return;
    updateUserOrgProfile(selectedUserId, userDeptId || undefined, userPos, userReportsTo || undefined);
    setIsStaffConfirmModalOpen(false);
    
    const assignedUser = users.find((u) => u.id === selectedUserId);
    setSaveSuccessNotice(
      `${assignedUser?.name || 'Kullanıcı'} için departman pozisyonu ve yönetici ataması başarıyla kaydedildi.`
    );
    setTimeout(() => setSaveSuccessNotice(null), 5000);
  };

  const safeOrgNodes = orgNodes || [];
  const safeOrgRules = orgRules || [];
  const safeUsers = users || [];

  const headNodes = safeOrgNodes.filter((n) => n.type === 'HEAD' || !n.parentId);

  return (
    <div className="flex h-full flex-col gap-6 overflow-y-auto p-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Network className="h-7 w-7 text-indigo-600" />
            Şirket Organizasyon & Veri Yetki Yönetimi
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Hiyerarşik collapsable drill-down departman ağacı, yönetici ve personel veri erişim matrisi
          </p>
        </div>

        <button
          onClick={() => openNewNodeModal()}
          className="flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-xs font-semibold text-white shadow-md transition hover:bg-indigo-700"
        >
          <Plus className="h-4 w-4" />
          Yeni Departman / Birim Ekle
        </button>
      </div>

      {/* Save Success Notice Banner */}
      {saveSuccessNotice && (
        <div className="flex items-center justify-between rounded-xl bg-emerald-50 border border-emerald-200 p-3.5 text-xs font-bold text-emerald-800 dark:bg-emerald-950/40 dark:border-emerald-800 dark:text-emerald-300">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 text-emerald-600" />
            <span>{saveSuccessNotice}</span>
          </div>
          <button onClick={() => setSaveSuccessNotice(null)} className="text-emerald-600 hover:text-emerald-800">
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      {/* Navigation Tabs */}
      <div className="flex border-b border-slate-200 dark:border-slate-800">
        <button
          onClick={() => setActiveTab('hierarchy')}
          className={`flex items-center gap-2 border-b-2 px-4 py-2.5 text-xs font-bold transition ${
            activeTab === 'hierarchy'
              ? 'border-indigo-600 text-indigo-600 dark:border-indigo-400 dark:text-indigo-400'
              : 'border-transparent text-slate-500 hover:text-slate-700 dark:text-slate-400'
          }`}
        >
          <Building className="h-4 w-4" />
          Hiyerarşik Organizasyon Ağacı (Collapsable)
        </button>
        <button
          onClick={() => setActiveTab('rbac')}
          className={`flex items-center gap-2 border-b-2 px-4 py-2.5 text-xs font-bold transition ${
            activeTab === 'rbac'
              ? 'border-indigo-600 text-indigo-600 dark:border-indigo-400 dark:text-indigo-400'
              : 'border-transparent text-slate-500 hover:text-slate-700 dark:text-slate-400'
          }`}
        >
          <Shield className="h-4 w-4" />
          Rol & Veri Erişim Hakları (RBAC)
        </button>
        <button
          onClick={() => setActiveTab('staff')}
          className={`flex items-center gap-2 border-b-2 px-4 py-2.5 text-xs font-bold transition ${
            activeTab === 'staff'
              ? 'border-indigo-600 text-indigo-600 dark:border-indigo-400 dark:text-indigo-400'
              : 'border-transparent text-slate-500 hover:text-slate-700 dark:text-slate-400'
          }`}
        >
          <UserCheck className="h-4 w-4" />
          Personel & Yönetici Atamaları
        </button>
      </div>

      {/* TAB 1: HIERARCHICAL DRILL-DOWN TREE */}
      {activeTab === 'hierarchy' && (
        <div className="flex flex-col gap-4">
          <div className="rounded-2xl border border-indigo-100 bg-indigo-50/50 p-4 dark:border-indigo-950/50 dark:bg-indigo-950/30">
            <h3 className="text-xs font-bold text-indigo-900 dark:text-indigo-200 flex items-center gap-2">
              <CornerDownRight className="h-4 w-4 text-indigo-600" />
              Alt-Üst Bağlantılı Hiyerarşik Yapı (Collapsable Drill-Down)
            </h3>
            <p className="text-[11px] text-indigo-800 dark:text-indigo-300 mt-1">
              Departmanların üzerine tıklayarak alt birimlerini genişletebilir veya daraltabilirsiniz. "Alt Birim Ekle" butonu ile doğrudan hiyerarşide yeni kademeler oluşturabilirsiniz.
            </p>
          </div>

          <div className="space-y-4">
            {headNodes.map((headNode) => (
              <OrgTreeNodeItem
                key={headNode.id}
                node={headNode}
                allNodes={safeOrgNodes}
                allUsers={safeUsers}
                onEdit={openEditNodeModal}
                onDelete={deleteOrgNode}
                onAddChild={(parentId) => openNewNodeModal(parentId)}
              />
            ))}
          </div>
        </div>
      )}

      {/* TAB 2: RBAC PERMISSIONS MATRIX */}
      {activeTab === 'rbac' && (
        <div className="flex flex-col gap-4">
          <div className="rounded-2xl border border-indigo-100 bg-indigo-50/50 p-4 dark:border-indigo-950/50 dark:bg-indigo-950/30">
            <h3 className="text-sm font-bold text-indigo-900 dark:text-indigo-200 flex items-center gap-2">
              <Shield className="h-4 w-4 text-indigo-600" />
              Organizasyon Bazlı Veri İzin Matrisi (Role-Based Access Control)
            </h3>
            <p className="text-xs text-indigo-800 dark:text-indigo-300 mt-1">
              Personel ve yöneticilerin sadece kendi verilerine (OWN), bağlı alt ekiplerinin verilerine (SUBORDINATES),
              departman verilerine (DEPARTMENT) veya tüm şirket verilerine (COMPANY) erişim hakları burada yönetilir.
            </p>
          </div>

          <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-slate-200 bg-slate-50 font-semibold text-slate-600 dark:border-slate-800 dark:bg-slate-800/60 dark:text-slate-300">
                <tr>
                  <th className="px-4 py-3">Rol Unvanı</th>
                  <th className="px-4 py-3">Veri Erişim Kapsamı</th>
                  <th className="px-4 py-3">Kişiler (Contacts)</th>
                  <th className="px-4 py-3">Fırsatlar (Deals)</th>
                  <th className="px-4 py-3">Destek (Cases)</th>
                  <th className="px-4 py-3">Raporlar</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {safeOrgRules.map((rule) => (
                  <tr key={rule.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                    <td className="px-4 py-3.5 font-bold text-slate-900 dark:text-white">
                      {rule.roleName}
                    </td>
                    <td className="px-4 py-3.5">
                      <select
                        value={rule.dataAccessScope}
                        onChange={(e) =>
                          updateOrgRule(rule.id, { dataAccessScope: e.target.value as DataAccessScope })
                        }
                        className="rounded-lg border border-slate-200 bg-white px-2.5 py-1 text-xs focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                      >
                        <option value="OWN">Sadece Kendi Verileri (OWN)</option>
                        <option value="SUBORDINATES">Kendi & Bağlı Ekip Verileri (SUBORDINATES)</option>
                        <option value="DEPARTMENT">Tüm Departman Verileri (DEPARTMENT)</option>
                        <option value="COMPANY">Tüm Şirket Verileri (COMPANY)</option>
                      </select>
                    </td>

                    <td className="px-3 py-3.5">
                      <select
                        value={rule.entityPermissions.contacts}
                        onChange={(e) =>
                          updateOrgRule(rule.id, {
                            entityPermissions: { ...rule.entityPermissions, contacts: e.target.value as AccessRight },
                          })
                        }
                        className="rounded-lg border border-slate-200 bg-white px-2 py-1 text-[11px] focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                      >
                        <option value="NONE">Yok</option>
                        <option value="READ">Okuma</option>
                        <option value="READ_WRITE">Okuma & Yazma</option>
                        <option value="FULL">Tam Yetki</option>
                      </select>
                    </td>

                    <td className="px-3 py-3.5">
                      <select
                        value={rule.entityPermissions.deals}
                        onChange={(e) =>
                          updateOrgRule(rule.id, {
                            entityPermissions: { ...rule.entityPermissions, deals: e.target.value as AccessRight },
                          })
                        }
                        className="rounded-lg border border-slate-200 bg-white px-2 py-1 text-[11px] focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                      >
                        <option value="NONE">Yok</option>
                        <option value="READ">Okuma</option>
                        <option value="READ_WRITE">Okuma & Yazma</option>
                        <option value="FULL">Tam Yetki</option>
                      </select>
                    </td>

                    <td className="px-3 py-3.5">
                      <select
                        value={rule.entityPermissions.cases}
                        onChange={(e) =>
                          updateOrgRule(rule.id, {
                            entityPermissions: { ...rule.entityPermissions, cases: e.target.value as AccessRight },
                          })
                        }
                        className="rounded-lg border border-slate-200 bg-white px-2 py-1 text-[11px] focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                      >
                        <option value="NONE">Yok</option>
                        <option value="READ">Okuma</option>
                        <option value="READ_WRITE">Okuma & Yazma</option>
                        <option value="FULL">Tam Yetki</option>
                      </select>
                    </td>

                    <td className="px-3 py-3.5">
                      <select
                        value={rule.entityPermissions.reports}
                        onChange={(e) =>
                          updateOrgRule(rule.id, {
                            entityPermissions: { ...rule.entityPermissions, reports: e.target.value as AccessRight },
                          })
                        }
                        className="rounded-lg border border-slate-200 bg-white px-2 py-1 text-[11px] focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                      >
                        <option value="NONE">Yok</option>
                        <option value="READ">Okuma</option>
                        <option value="READ_WRITE">Okuma & Yazma</option>
                        <option value="FULL">Tam Yetki</option>
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 3: STAFF ORGANIZATIONAL PROFILE ASSIGNMENT */}
      {activeTab === 'staff' && (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          {/* Form */}
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2 mb-4">
              <UserCheck className="h-5 w-5 text-indigo-600" />
              Personel Hiyerarşi & Yönetici Atama Formu
            </h3>

            <form onSubmit={handleStaffFormSubmitRequest} className="flex flex-col gap-4">
              <div>
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Kullanıcı Seçin *</label>
                <select
                  required
                  value={selectedUserId}
                  onChange={(e) => {
                    const u = users.find((usr) => usr.id === e.target.value);
                    setSelectedUserId(e.target.value);
                    if (u) {
                      setUserDeptId(u.departmentId || '');
                      setUserPos(u.position || 'STAFF');
                      setUserReportsTo(u.reportsToUserId || '');
                    }
                  }}
                  className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-xs focus:border-indigo-500 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                >
                  <option value="">-- Kullanıcı Seçiniz --</option>
                  {safeUsers.map((u) => (
                    <option key={u.id} value={u.id}>
                      {u.name} ({u.email}) - [{u.role}]
                    </option>
                  ))}
                </select>
              </div>

              {selectedUserId && (
                <>
                  <div>
                    <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Ait Olduğu Departman</label>
                    <select
                      value={userDeptId}
                      onChange={(e) => setUserDeptId(e.target.value)}
                      className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-xs focus:border-indigo-500 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                    >
                      <option value="">-- Departman Yok --</option>
                      {safeOrgNodes.map((n) => (
                        <option key={n.id} value={n.id}>
                          {n.name} ({n.code})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Organizasyon Pozisyonu</label>
                    <select
                      value={userPos}
                      onChange={(e) => setUserPos(e.target.value as any)}
                      className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-xs focus:border-indigo-500 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                    >
                      <option value="HEAD">Üst Yönetici / Head (CEO/GM)</option>
                      <option value="DEPARTMENT_MANAGER">Departman Müdürü (Manager)</option>
                      <option value="TEAM_LEAD">Takım Lideri (Lead)</option>
                      <option value="STAFF">Uzman / Personel (Staff)</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Rapor Vereceği Yönetici</label>
                    <select
                      value={userReportsTo}
                      onChange={(e) => setUserReportsTo(e.target.value)}
                      className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-xs focus:border-indigo-500 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                    >
                      <option value="">-- Doğrudan Yönetici Yok --</option>
                      {safeUsers
                        .filter((u) => u.id !== selectedUserId)
                        .map((u) => (
                          <option key={u.id} value={u.id}>
                            {u.name} ({u.position || u.role})
                          </option>
                        ))}
                    </select>
                  </div>

                  <button
                    type="submit"
                    className="mt-2 rounded-xl bg-indigo-600 px-5 py-2.5 text-xs font-semibold text-white shadow-md hover:bg-indigo-700"
                  >
                    Pozisyon ve Yöneticiyi Kaydet
                  </button>
                </>
              )}
            </form>
          </div>

          {/* User Org Roster */}
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <h3 className="text-base font-bold text-slate-900 dark:text-white mb-4">
              Şirket Kadro Hiyerarşi Listesi ({safeUsers.length})
            </h3>

            <div className="flex flex-col gap-3 max-h-[450px] overflow-y-auto pr-1">
              {safeUsers.map((u) => {
                const dept = safeOrgNodes.find((n) => n.id === u.departmentId);
                const manager = safeUsers.find((m) => m.id === u.reportsToUserId);

                return (
                  <div
                    key={u.id}
                    className="flex items-center justify-between rounded-xl border border-slate-100 bg-slate-50 p-3 text-xs dark:border-slate-800 dark:bg-slate-800/50"
                  >
                    <div className="flex items-center gap-3">
                      <img src={u.avatar} alt={u.name} className="h-8 w-8 rounded-full object-cover" />
                      <div>
                        <div className="font-bold text-slate-900 dark:text-white">{u.name}</div>
                        <div className="text-[11px] text-slate-500">
                          {dept ? dept.name : 'Departman Atanmadı'} • <span className="font-semibold text-indigo-600">{u.position || 'Personel'}</span>
                        </div>
                      </div>
                    </div>

                    <div className="text-right text-[11px] text-slate-400">
                      Yönetici: <strong className="text-slate-700 dark:text-slate-200">{manager ? manager.name : '-'}</strong>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* CONFIRMATION POPUP MODAL FOR STAFF ASSIGNMENT */}
      {isStaffConfirmModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl dark:bg-slate-900">
            <div className="flex items-center gap-3 border-b border-slate-100 pb-3 dark:border-slate-800">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300">
                <AlertCircle className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">Personel Atama Onayı</h3>
                <p className="text-xs text-slate-500">Aşağıdaki organizasyonel değişiklikler kaydedilecek.</p>
              </div>
            </div>

            <div className="mt-4 space-y-2.5 rounded-xl bg-slate-50 p-3.5 text-xs dark:bg-slate-800/60">
              <div className="flex justify-between">
                <span className="text-slate-500">Personel:</span>
                <strong className="text-slate-900 dark:text-white">
                  {users.find((u) => u.id === selectedUserId)?.name}
                </strong>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Yeni Departman:</span>
                <strong className="text-slate-900 dark:text-white">
                  {safeOrgNodes.find((n) => n.id === userDeptId)?.name || 'Departman Yok'}
                </strong>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Organizasyon Pozisyonu:</span>
                <strong className="text-indigo-600 dark:text-indigo-400 font-bold">{userPos}</strong>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Bağlı Olacağı Yönetici:</span>
                <strong className="text-slate-900 dark:text-white">
                  {users.find((u) => u.id === userReportsTo)?.name || 'Yönetici Yok'}
                </strong>
              </div>
            </div>

            <div className="mt-5 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setIsStaffConfirmModalOpen(false)}
                className="rounded-xl border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 dark:border-slate-700 dark:text-slate-300"
              >
                İptal
              </button>
              <button
                type="button"
                onClick={handleConfirmStaffAssignment}
                className="rounded-xl bg-indigo-600 px-4 py-2 text-xs font-semibold text-white shadow-md hover:bg-indigo-700"
              >
                Onayla ve Kaydet
              </button>
            </div>
          </div>
        </div>
      )}

      {/* NODE MODAL */}
      {isNodeModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-sm">
          <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-xl dark:bg-slate-900">
            <div className="flex items-center justify-between border-b border-slate-200 pb-4 dark:border-slate-800">
              <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Building className="h-5 w-5 text-indigo-600" />
                {editingNode ? 'Departmanı Düzenle' : 'Yeni Departman / Birim Tanımla'}
              </h2>
              <button onClick={() => setIsNodeModalOpen(false)} className="rounded-lg p-1 text-slate-400 hover:bg-slate-100">
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSaveNode} className="mt-4 flex flex-col gap-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Birim Adı *</label>
                  <input
                    type="text"
                    required
                    value={nodeName}
                    onChange={(e) => setNodeName(e.target.value)}
                    placeholder="Örn: Satış & Pazarlama"
                    className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-xs focus:border-indigo-500 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Birim Kodu</label>
                  <input
                    type="text"
                    value={nodeCode}
                    onChange={(e) => setNodeCode(e.target.value)}
                    placeholder="DEPT-SALES"
                    className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-xs font-mono focus:border-indigo-500 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Hiyerarşi Tipi</label>
                  <select
                    value={nodeType}
                    onChange={(e) => setNodeType(e.target.value as any)}
                    className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-xs focus:border-indigo-500 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                  >
                    <option value="HEAD">Üst Yönetim (Head / HQ)</option>
                    <option value="DEPARTMENT">Ana Departman</option>
                    <option value="UNIT">Alt Birim / Ekip</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Üst Birim / Departman</label>
                  <select
                    value={parentId}
                    onChange={(e) => setParentId(e.target.value)}
                    className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-xs focus:border-indigo-500 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                  >
                    <option value="">-- Kök Birim (Üst Bağlantı Yok) --</option>
                    {safeOrgNodes
                      .filter((n) => !editingNode || n.id !== editingNode.id)
                      .map((n) => (
                        <option key={n.id} value={n.id}>
                          {n.name} ({n.code})
                        </option>
                      ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Departman Yöneticisi</label>
                <select
                  value={managerUserId}
                  onChange={(e) => setManagerUserId(e.target.value)}
                  className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-xs focus:border-indigo-500 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                >
                  <option value="">-- Seçiniz --</option>
                  {safeUsers.map((u) => (
                    <option key={u.id} value={u.id}>
                      {u.name} ({u.email})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Açıklama</label>
                <textarea
                  rows={2}
                  value={nodeDesc}
                  onChange={(e) => setNodeDesc(e.target.value)}
                  placeholder="Departmanın yetki alanı ve görev tanımı..."
                  className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-xs focus:border-indigo-500 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                />
              </div>

              <div className="mt-4 flex justify-end gap-2 border-t border-slate-200 pt-4 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsNodeModalOpen(false)}
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
    </div>
  );
};
