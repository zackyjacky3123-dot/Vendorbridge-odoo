'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/providers/AuthProvider';
import { createClient } from '@/lib/supabase/client';
import { formatINR, formatDate, getStatusColor, capitalizeFirst } from '@/lib/utils';
import type { PurchaseOrder, Invoice, ActivityLog } from '@/types/database.types';

interface Stats {
  pending_approvals: number;
  active_rfqs: number;
  total_vendors: number;
  monthly_spend: number;
}

export default function DashboardPage() {
  const { profile, canCreateRFQ, canApprove } = useAuth();
  const supabase = createClient();
  const [stats, setStats] = useState<Stats>({ pending_approvals: 0, active_rfqs: 0, total_vendors: 0, monthly_spend: 0 });
  const [recentPOs, setRecentPOs] = useState<PurchaseOrder[]>([]);
  const [recentInvoices, setRecentInvoices] = useState<Invoice[]>([]);
  const [recentActivity, setRecentActivity] = useState<ActivityLog[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      const [approvalsRes, rfqsRes, vendorsRes, posRes, invoicesRes, activityRes] = await Promise.all([
        supabase.from('approvals').select('id', { count: 'exact' }).eq('status', 'pending'),
        supabase.from('rfqs').select('id', { count: 'exact' }).eq('status', 'active'),
        supabase.from('vendors').select('id', { count: 'exact' }).eq('status', 'active'),
        supabase.from('purchase_orders').select('*, vendors(company_name), rfqs(title)').order('created_at', { ascending: false }).limit(5),
        supabase.from('invoices').select('*, vendors(company_name)').order('created_at', { ascending: false }).limit(5),
        supabase.from('activity_logs').select('*, profiles(full_name)').order('created_at', { ascending: false }).limit(8),
      ]);

      // Monthly spend
      const startOfMonth = new Date();
      startOfMonth.setDate(1);
      startOfMonth.setHours(0, 0, 0, 0);
      const { data: monthlyData } = await supabase
        .from('invoices')
        .select('total_amount')
        .gte('created_at', startOfMonth.toISOString());
      
      const monthlySpend = (monthlyData ?? []).reduce((sum, inv) => sum + (inv.total_amount ?? 0), 0);

      setStats({
        pending_approvals: approvalsRes.count ?? 0,
        active_rfqs: rfqsRes.count ?? 0,
        total_vendors: vendorsRes.count ?? 0,
        monthly_spend: monthlySpend,
      });

      setRecentPOs((posRes.data as unknown as PurchaseOrder[]) ?? []);
      setRecentInvoices((invoicesRes.data as unknown as Invoice[]) ?? []);
      setRecentActivity((activityRes.data as unknown as ActivityLog[]) ?? []);
      setLoading(false);
    };

    fetchData();
  }, [supabase]);

  const kpiCards = [
    {
      title: 'Pending Approvals',
      value: stats.pending_approvals,
      href: '/approvals',
      color: 'bg-amber-50 border-amber-200',
      iconBg: 'bg-amber-100',
      iconColor: 'text-amber-600',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
    },
    {
      title: 'Active RFQs',
      value: stats.active_rfqs,
      href: '/rfqs',
      color: 'bg-blue-50 border-blue-200',
      iconBg: 'bg-blue-100',
      iconColor: 'text-blue-600',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      ),
    },
    {
      title: 'Active Vendors',
      value: stats.total_vendors,
      href: '/vendors',
      color: 'bg-green-50 border-green-200',
      iconBg: 'bg-green-100',
      iconColor: 'text-green-600',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      ),
    },
    {
      title: 'Monthly Spend',
      value: formatINR(stats.monthly_spend),
      href: '/reports',
      color: 'bg-purple-50 border-purple-200',
      iconBg: 'bg-purple-100',
      iconColor: 'text-purple-600',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
    },
  ];

  return (
    <div className="p-6 space-y-6 animate-fade-in">
      {/* Greeting */}
      <div>
        <h2 className="text-2xl font-semibold text-neutral-900">
          Good {getGreeting()}, {profile?.full_name?.split(' ')[0] ?? 'there'} 👋
        </h2>
        <p className="text-neutral-500 text-sm mt-0.5">Here&apos;s what&apos;s happening across procurement today.</p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {kpiCards.map(card => (
          <Link key={card.title} href={card.href} className={`card border p-5 hover:shadow-md transition-shadow ${card.color}`}>
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-neutral-600 font-medium">{card.title}</p>
                <p className="text-2xl font-bold text-neutral-900 mt-1">
                  {loading ? '—' : card.value}
                </p>
              </div>
              <div className={`p-2.5 rounded-xl ${card.iconBg} ${card.iconColor}`}>
                {card.icon}
              </div>
            </div>
          </Link>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="card p-5">
        <h3 className="text-sm font-semibold text-neutral-700 mb-3">Quick Actions</h3>
        <div className="flex flex-wrap gap-2">
          {canCreateRFQ && (
            <Link href="/rfqs/new" className="btn-primary flex items-center gap-1.5">
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              New RFQ
            </Link>
          )}
          <Link href="/vendors" className="btn-secondary flex items-center gap-1.5">
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            Manage Vendors
          </Link>
          {canApprove && (
            <Link href="/approvals" className="btn-secondary flex items-center gap-1.5">
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Review Approvals
              {stats.pending_approvals > 0 && (
                <span className="ml-1 bg-amber-500 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center font-semibold">
                  {stats.pending_approvals}
                </span>
              )}
            </Link>
          )}
          <Link href="/invoices" className="btn-secondary flex items-center gap-1.5">
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
            </svg>
            View Invoices
          </Link>
        </div>
      </div>

      {/* Tables Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent POs */}
        <div className="card overflow-hidden">
          <div className="px-5 py-4 border-b border-neutral-100 flex items-center justify-between">
            <h3 className="text-sm font-semibold text-neutral-800">Recent Purchase Orders</h3>
            <Link href="/invoices" className="text-xs text-blue-600 hover:underline">View all</Link>
          </div>
          <div className="divide-y divide-neutral-50">
            {loading ? (
              <div className="p-5 text-sm text-neutral-400">Loading…</div>
            ) : recentPOs.length === 0 ? (
              <div className="p-5 text-sm text-neutral-400">No purchase orders yet.</div>
            ) : (
              recentPOs.map(po => (
                <Link key={po.id} href={`/invoices/${po.id}`} className="flex items-center justify-between px-5 py-3 hover:bg-neutral-50 transition-colors">
                  <div>
                    <p className="text-sm font-medium text-neutral-800">{po.po_number}</p>
                    <p className="text-xs text-neutral-400 mt-0.5">
                      {(po.vendors as unknown as { company_name: string })?.company_name ?? 'N/A'} · {formatDate(po.created_at)}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold text-neutral-800">{formatINR(po.total_amount)}</p>
                    <span className={getStatusColor(po.status)}>{capitalizeFirst(po.status)}</span>
                  </div>
                </Link>
              ))
            )}
          </div>
        </div>

        {/* Recent Invoices */}
        <div className="card overflow-hidden">
          <div className="px-5 py-4 border-b border-neutral-100 flex items-center justify-between">
            <h3 className="text-sm font-semibold text-neutral-800">Recent Invoices</h3>
            <Link href="/invoices" className="text-xs text-blue-600 hover:underline">View all</Link>
          </div>
          <div className="divide-y divide-neutral-50">
            {loading ? (
              <div className="p-5 text-sm text-neutral-400">Loading…</div>
            ) : recentInvoices.length === 0 ? (
              <div className="p-5 text-sm text-neutral-400">No invoices yet.</div>
            ) : (
              recentInvoices.map(inv => (
                <div key={inv.id} className="flex items-center justify-between px-5 py-3 hover:bg-neutral-50 transition-colors">
                  <div>
                    <p className="text-sm font-medium text-neutral-800">{inv.invoice_number}</p>
                    <p className="text-xs text-neutral-400 mt-0.5">
                      {(inv.vendors as unknown as { company_name: string })?.company_name ?? 'N/A'} · Due {formatDate(inv.due_date)}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold text-neutral-800">{formatINR(inv.total_amount)}</p>
                    <span className={getStatusColor(inv.status)}>{capitalizeFirst(inv.status)}</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Activity Feed */}
      <div className="card overflow-hidden">
        <div className="px-5 py-4 border-b border-neutral-100 flex items-center justify-between">
          <h3 className="text-sm font-semibold text-neutral-800">Recent Activity</h3>
          <Link href="/activity" className="text-xs text-blue-600 hover:underline">View all</Link>
        </div>
        {loading ? (
          <div className="p-5 text-sm text-neutral-400">Loading…</div>
        ) : recentActivity.length === 0 ? (
          <div className="p-5 text-sm text-neutral-400">No activity recorded yet.</div>
        ) : (
          <div className="divide-y divide-neutral-50">
            {recentActivity.map(log => (
              <div key={log.id} className="flex gap-3 px-5 py-3">
                <div className="w-7 h-7 bg-blue-50 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  <svg className="w-3.5 h-3.5 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-neutral-800">{log.description}</p>
                  <p className="text-xs text-neutral-400 mt-0.5">
                    {(log.profiles as unknown as { full_name: string })?.full_name ?? 'System'} · {formatDate(log.created_at)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return 'morning';
  if (h < 17) return 'afternoon';
  return 'evening';
}