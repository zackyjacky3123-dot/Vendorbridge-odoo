'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';

export default function ApprovalsPage() {
  const [approvals, setApprovals] = useState<any[]>([]);
  const supabase = createClient();

  useEffect(() => {
    const fetchApprovals = async () => {
      const { data } = await supabase.from('approvals').select('*, rfqs(title), quotations(total_amount)');
      if (data) setApprovals(data);
    };
    fetchApprovals();
  }, [supabase]);

  return (
    <div className="p-6">
      <h2 className="page-title mb-6">Approval Workflow</h2>
      <div className="card divide-y">
        {approvals.map(app => (
          <div key={app.id} className="p-4 flex justify-between items-center">
            <span>{app.rfqs.title} - {app.quotations.total_amount}</span>
            <button className="btn-primary">Approve</button>
          </div>
        ))}
      </div>
    </div>
  );
}