import { z } from 'zod';

export const rfqItemSchema = z.object({
  product_name: z.string().min(1, 'Product name is required'),
  description: z.string().optional(),
  quantity: z.coerce.number().min(1, 'Quantity must be at least 1'),
  unit: z.string().min(1, 'Unit is required'),
  estimated_price: z.coerce.number().optional(),
});

export const rfqSchema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters'),
  description: z.string().optional(),
  deadline: z.string().min(1, 'Deadline is required'),
  vendor_ids: z.array(z.string()).min(1, 'Select at least one vendor'),
  items: z.array(rfqItemSchema).min(1, 'Add at least one item'),
});

export type RFQFormData = z.infer<typeof rfqSchema>;
export type RFQItemFormData = z.infer<typeof rfqItemSchema>;