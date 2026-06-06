import { z } from 'zod';

export const quotationItemSchema = z.object({
  rfq_item_id: z.string().min(1),
  product_name: z.string().min(1),
  quantity: z.coerce.number().min(1),
  unit_price: z.coerce.number().min(0, 'Price must be non-negative'),
  total_price: z.coerce.number().min(0),
});

export const quotationSchema = z.object({
  rfq_id: z.string().min(1),
  vendor_id: z.string().min(1),
  delivery_days: z.coerce.number().min(1, 'Delivery days must be at least 1'),
  validity_days: z.coerce.number().min(1, 'Validity must be at least 1 day'),
  notes: z.string().optional(),
  items: z.array(quotationItemSchema).min(1, 'Quote all items'),
});

export type QuotationFormData = z.infer<typeof quotationSchema>;