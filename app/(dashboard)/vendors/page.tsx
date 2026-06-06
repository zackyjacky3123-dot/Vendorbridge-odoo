'use client';

import { useEffect, useState, useCallback } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useAuth } from '@/providers/AuthProvider';
import { formatDate, getStatusColor, capitalizeFirst, debounce } from '@/lib/utils';
import type { Vendor, VendorStatus } from '@/types/database.types';

const VENDOR_CATEGORIES = ['IT & Technology', 'Office Supplies', 'Logistics', 'Manufacturing', 'Services', 'Raw Materials', 'Other'];
const STATUS_OPTIONS: VendorStatus[] = ['active', 'inactive', 'pending', 'blacklisted'];

const emptyVendor: Partial<Vendor> = {
  company_name: '', contact_person: '', email: '', phone: '',
  address: '', city: '', state: '', pincode: '',
  category: '', gst_number: '', pan_number: '', status: 'active',
};

export default function VendorsPage() {
  const supabase = createClient();
  const { isAdmin, isProcurementOfficer, profile } = useAuth();
  const canManage = isAdmin || isProcurementOfficer;

  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterCategory, setFilterCategory] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editVendor, setEditVendor] = useState<Partial<Vendor>>(emptyVendor);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const fetchVendors = useCallback(async (q = '', cat = '', status = '') => {
    setLoading(true);
    let query = supabase.from('vendors').select('*').order('created_at', { ascending: false });
    if (q) query = query.ilike('company_name', `%${q}%`);
    if (cat) query = query.eq('category', cat);
    if (status) query = query.eq('status', status);
    const { data } = await query;
    setVendors((data as Vendor[]) ?? []);
    setLoading(false);
  }, [supabase]);

  useEffect(() => { fetchVendors(); }, [fetchVendors]);

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const debouncedSearch = useCallback(debounce((q: string) => fetchVendors(q, filterCategory, filterStatus), 300), [filterCategory, filterStatus]);

  const handleSearch = (q: string) => { setSearch(q); debouncedSearch(q); };
  const handleFilter = (cat: string, status: string) => { setFilterCategory(cat); setFilterStatus(status); fetchVendors(search, cat, status); };

  const openNew = () => { setEditVendor(emptyVendor); setError(''); setShowModal(true); };
  const openEdit = (v: Vendor) => { setEditVendor(v); setError(''); setShowModal(true); };

  const handleSave = async () => {
    if (!editVendor.company_name || !editVendor.email || !editVendor.gst_number) {
      setError('Company name, email, and GST number are required.');
      return;
    }
    setSaving(true);
    setError('');

    if (editVendor.id) {
      const { error: err } = await supabase.from('vendors').update({ ...editVendor, updated_at: new Date().toISOString() }).eq('id', editVendor.id);
      if (err) { setError(err.message); setSaving(false); return; }
    } else {
      const { error: err } = await supabase.from('vendors').insert({ ...editVendor, created_by: profile?.id, rating: 0, total_orders: 0 });
      if (err) { setError(err.message); setSaving(false); return; }
    }

    setSaving(false);
    setShowModal(false);
    fetchVendors(search, filterCategory, filterStatus);
  };

  const handleStatusChange = async (id: string, status: VendorStatus) => {
    await supabase.from('vendors').update({ status }).eq('id', id);
    fetchVendors(search, filterCategory, filterStatus);
  };

  return (
    <div className="p-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="page-title">Vendor Management</h2>
          <p className="text-sm text-neutral-500 mt-0.5">Register, track, and manage your vendor relationships</p>
        </div>
        {canManage && (
          <button onClick={openNew} className="btn-primary flex items-center gap-1.5">
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Add Vendor
          </button>
        )}
      </div>

      {/* Filters */}
      <div className="card p-4 mb-4 flex flex-wrap gap-3">
        <div className="flex-1 min-w-48">
          <div className="relative">
            <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              value={search}
              onChange={e => handleSearch(e.target.value)}
              placeholder="Search vendors…"
              className="input pl-9"
            />
          </div>
        </div>
        <select
          value={filterCategory}
          onChange={e => handleFilter(e.target.value, filterStatus)}
          className="input w-auto"
        >
          <option value="">All Categories</option>
          {VENDOR_CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
        </select>
        <select
          value={filterStatus}
          onChange={e => handleFilter(filterCategory, e.target.value)}
          className="input w-auto"
        >
          <option value="">All Status</option>
          {STATUS_OPTIONS.map(s => <option key={s} value={s}>{capitalizeFirst(s)}</option>)}
        </select>
      </div>

      {/* Table */}
      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-neutral-100 bg-neutral-50">
                <th className="text-left px-5 py-3 text-xs font-semibold text-neutral-500 uppercase tracking-wider">Company</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-neutral-500 uppercase tracking-wider">Contact</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-neutral-500 uppercase tracking-wider">Category</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-neutral-500 uppercase tracking-wider">GST No.</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-neutral-500 uppercase tracking-wider">Rating</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-neutral-500 uppercase tracking-wider">Status</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-neutral-500 uppercase tracking-wider">Added</th>
                {canManage && <th className="px-5 py-3" />}
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-50">
              {loading ? (
                <tr><td colSpan={8} className="px-5 py-8 text-center text-neutral-400">Loading vendors…</td></tr>
              ) : vendors.length === 0 ? (
                <tr><td colSpan={8} className="px-5 py-8 text-center text-neutral-400">No vendors found.</td></tr>
              ) : vendors.map(v => (
                <tr key={v.id} className="hover:bg-neutral-50 transition-colors">
                  <td className="px-5 py-3.5">
                    <div>
                      <p className="font-medium text-neutral-900">{v.company_name}</p>
                      <p className="text-xs text-neutral-400">{v.city}, {v.state}</p>
                    </div>
                  </td>
                  <td className="px-5 py-3.5">
                    <div>
                      <p className="text-neutral-700">{v.contact_person}</p>
                      <p className="text-xs text-neutral-400">{v.email}</p>
                    </div>
                  </td>
                  <td className="px-5 py-3.5 text-neutral-600">{v.category || '—'}</td>
                  <td className="px-5 py-3.5 font-mono text-xs text-neutral-600">{v.gst_number}</td>
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-1">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <svg key={i} className={`w-3 h-3 ${i < v.rating ? 'text-amber-400' : 'text-neutral-200'}`} fill="currentColor" viewBox="0 0 20 20">
                          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                        </svg>
                      ))}
                      <span className="text-xs text-neutral-500 ml-1">{v.rating.toFixed(1)}</span>
                    </div>
                  </td>
                  <td className="px-5 py-3.5">
                    {canManage ? (
                      <select
                        value={v.status}
                        onChange={e => handleStatusChange(v.id, e.target.value as VendorStatus)}
                        className={`text-xs font-medium rounded-full px-2 py-0.5 border-0 focus:outline-none cursor-pointer ${getStatusColor(v.status)}`}
                      >
                        {STATUS_OPTIONS.map(s => <option key={s} value={s}>{capitalizeFirst(s)}</option>)}
                      </select>
                    ) : (
                      <span className={getStatusColor(v.status)}>{capitalizeFirst(v.status)}</span>
                    )}
                  </td>
                  <td className="px-5 py-3.5 text-neutral-500 text-xs">{formatDate(v.created_at)}</td>
                  {canManage && (
                    <td className="px-5 py-3.5">
                      <button onClick={() => openEdit(v)} className="text-blue-600 hover:text-blue-800 text-xs font-medium">Edit</button>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-100">
              <h3 className="text-base font-semibold text-neutral-900">{editVendor.id ? 'Edit Vendor' : 'Add Vendor'}</h3>
              <button onClick={() => setShowModal(false)} className="text-neutral-400 hover:text-neutral-600">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="p-6 space-y-4">
              {error && <div className="px-4 py-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">{error}</div>}

              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <label className="label">Company Name *</label>
                  <input className="input" value={editVendor.company_name ?? ''} onChange={e => setEditVendor(p => ({ ...p, company_name: e.target.value }))} placeholder="Acme Corp Pvt Ltd" />
                </div>
                <div>
                  <label className="label">Contact Person *</label>
                  <input className="input" value={editVendor.contact_person ?? ''} onChange={e => setEditVendor(p => ({ ...p, contact_person: e.target.value }))} placeholder="Rahul Mehta" />
                </div>
                <div>
                  <label className="label">Email *</label>
                  <input type="email" className="input" value={editVendor.email ?? ''} onChange={e => setEditVendor(p => ({ ...p, email: e.target.value }))} placeholder="vendor@company.com" />
                </div>
                <div>
                  <label className="label">Phone</label>
                  <input className="input" value={editVendor.phone ?? ''} onChange={e => setEditVendor(p => ({ ...p, phone: e.target.value }))} placeholder="+91 98765 43210" />
                </div>
                <div>
                  <label className="label">Category</label>
                  <select className="input" value={editVendor.category ?? ''} onChange={e => setEditVendor(p => ({ ...p, category: e.target.value }))}>
                    <option value="">Select category</option>
                    {VENDOR_CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div>
                  <label className="label">GST Number *</label>
                  <input className="input font-mono" value={editVendor.gst_number ?? ''} onChange={e => setEditVendor(p => ({ ...p, gst_number: e.target.value.toUpperCase() }))} placeholder="27AAPFU0939F1ZV" />
                </div>
                <div>
                  <label className="label">PAN Number</label>
                  <input className="input font-mono" value={editVendor.pan_number ?? ''} onChange={e => setEditVendor(p => ({ ...p, pan_number: e.target.value.toUpperCase() }))} placeholder="AAPFU0939F" />
                </div>
                <div className="col-span-2">
                  <label className="label">Address</label>
                  <input className="input" value={editVendor.address ?? ''} onChange={e => setEditVendor(p => ({ ...p, address: e.target.value }))} placeholder="123, MG Road" />
                </div>
                <div>
                  <label className="label">City</label>
                  <input className="input" value={editVendor.city ?? ''} onChange={e => setEditVendor(p => ({ ...p, city: e.target.value }))} placeholder="Mumbai" />
                </div>
                <div>
                  <label className="label">State</label>
                  <input className="input" value={editVendor.state ?? ''} onChange={e => setEditVendor(p => ({ ...p, state: e.target.value }))} placeholder="Maharashtra" />
                </div>
                <div>
                  <label className="label">Pincode</label>
                  <input className="input" value={editVendor.pincode ?? ''} onChange={e => setEditVendor(p => ({ ...p, pincode: e.target.value }))} placeholder="400001" maxLength={6} />
                </div>
                <div>
                  <label className="label">Status</label>
                  <select className="input" value={editVendor.status ?? 'active'} onChange={e => setEditVendor(p => ({ ...p, status: e.target.value as VendorStatus }))}>
                    {STATUS_OPTIONS.map(s => <option key={s} value={s}>{capitalizeFirst(s)}</option>)}
                  </select>
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-2 px-6 py-4 border-t border-neutral-100">
              <button onClick={() => setShowModal(false)} className="btn-secondary">Cancel</button>
              <button onClick={handleSave} disabled={saving} className="btn-primary">
                {saving ? 'Saving…' : editVendor.id ? 'Update Vendor' : 'Add Vendor'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}