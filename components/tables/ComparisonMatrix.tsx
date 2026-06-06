'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { cn, formatINR } from '@/lib/utils';

export default function ComparisonMatrix({ rfqId }: { rfqId: string }) {
  const [quotes, setQuotes] = useState<any[]>([]);
  const supabase = createClient();

  useEffect(() => {
    const fetchQuotes = async () => {
      const { data } = await supabase.from('quotations').select('*, vendors(*)').eq('rfq_id', rfqId);
      if (data) setQuotes(data);
    };
    fetchQuotes();
  }, [rfqId, supabase]);

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {quotes.map((quote) => (
        <div key={quote.id} className="card p-6">
          <h3 className="text-lg font-semibold">{quote.vendors.company_name}</h3>
          <p className="text-2xl font-bold">{formatINR(quote.total_amount)}</p>
        </div>
      ))}
    </div>
  );
}