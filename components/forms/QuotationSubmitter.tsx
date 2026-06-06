
'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { quotationSchema, type QuotationFormData } from '@/lib/validations/quote.schema';
import { createClient } from '@/lib/supabase/client';

export default function QuotationSubmitter({ rfqId, vendorId }: { rfqId: string; vendorId: string }) {
  const supabase = createClient();
  const { register, handleSubmit } = useForm<QuotationFormData>({
    resolver: zodResolver(quotationSchema),
    defaultValues: { rfq_id: rfqId, vendor_id: vendorId }
  });

  const onSubmit = async (data: QuotationFormData) => {
    await supabase.from('quotations').insert({ ...data, status: 'submitted' });
    alert('Quotation submitted successfully');
  };

  return <form onSubmit={handleSubmit(onSubmit)} className="card p-6 space-y-4"> {/* Add form fields here */}</form>;
}