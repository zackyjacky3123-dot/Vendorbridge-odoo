'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { formatDate } from '@/lib/utils';

export default function ActivityPage() {
  const [logs, setLogs] = useState<any[]>([]);
  const supabase = createClient();

  useEffect(() => {
    const fetchLogs = async () => {
      const { data } = await supabase.from('activity_logs').select('*').order('created_at', { ascending: false });
      if (data) setLogs(data);
    };
    fetchLogs();
  }, [supabase]);

  return (
    <div className="p-6">
      <h2 className="page-title mb-6">Activity Logs</h2>
      <div className="card p-6 space-y-4">
        {logs.map(log => (
          <p key={log.id} className="text-sm border-b pb-2">
            <span className="font-bold">{formatDate(log.created_at)}:</span> {log.description}
          </p>
        ))}
      </div>
    </div>
  );
}