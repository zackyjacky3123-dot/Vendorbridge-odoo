'use client';

import { usePathname } from 'next/navigation';
import { useAuth } from '@/providers/AuthProvider';

const PAGE_TITLES: Record<string, string> = {
  '/': 'Dashboard',
  '/vendors': 'Vendor Management',
  '/rfqs': 'RFQs',
  '/rfqs/new': 'Create RFQ',
  '/quotations': 'Quotations',
  '/approvals': 'Approvals',
  '/invoices': 'Orders & Invoices',
  '/activity': 'Activity Logs',
  '/reports': 'Reports & Analytics',
};

export default function TopNav() {
  const pathname = usePathname();
  const { profile } = useAuth();
  const title = PAGE_TITLES[pathname] ?? 'VendorBridge';

  return (
    <header className="h-14 bg-white border-b border-neutral-200 flex items-center justify-between px-6 flex-shrink-0">
      <h1 className="text-base font-semibold text-neutral-900">{title}</h1>
      <div className="flex items-center gap-3">
        {/* Notifications */}
        <button className="relative w-8 h-8 flex items-center justify-center text-neutral-500 hover:text-neutral-700 hover:bg-neutral-100 rounded-lg transition-colors">
          <svg className="w-4.5 h-4.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
          </svg>
          <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 bg-blue-500 rounded-full" />
        </button>

        {/* Avatar */}
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 bg-blue-600 rounded-full flex items-center justify-center">
            <span className="text-white text-xs font-semibold">
              {profile?.full_name?.charAt(0).toUpperCase() ?? 'U'}
            </span>
          </div>
          <span className="text-sm font-medium text-neutral-700 hidden sm:block">
            {profile?.full_name ?? 'User'}
          </span>
        </div>
      </div>
    </header>
  );
}