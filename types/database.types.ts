export type UserRole = 'admin' | 'procurement_officer' | 'manager' | 'vendor';

export type VendorStatus = 'active' | 'inactive' | 'pending' | 'blacklisted';
export type RFQStatus = 'draft' | 'active' | 'closed' | 'cancelled';
export type QuotationStatus = 'submitted' | 'shortlisted' | 'rejected' | 'approved';
export type ApprovalStatus = 'pending' | 'approved' | 'rejected';
export type POStatus = 'draft' | 'sent' | 'acknowledged' | 'completed' | 'cancelled';
export type InvoiceStatus = 'draft' | 'sent' | 'paid' | 'overdue' | 'cancelled';

export type ActivityType =
  | 'rfq_created' | 'rfq_updated' | 'rfq_closed'
  | 'quotation_submitted' | 'quotation_approved' | 'quotation_rejected'
  | 'approval_initiated' | 'approval_granted' | 'approval_rejected'
  | 'po_generated' | 'po_sent'
  | 'invoice_generated' | 'invoice_sent' | 'invoice_paid'
  | 'vendor_registered' | 'vendor_updated';

export interface Profile {
  id: string;
  email: string;
  full_name: string;
  role: UserRole;
  avatar_url?: string;
  created_at: string;
  updated_at: string;
}

export interface Vendor {
  id: string;
  company_name: string;
  contact_person: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  pincode: string;
  category: string;
  gst_number: string;
  pan_number: string;
  status: VendorStatus;
  rating: number;
  total_orders: number;
  created_by: string;
  created_at: string;
  updated_at: string;
  profile_id?: string;
}

export interface RFQItem {
  id: string;
  rfq_id: string;
  product_name: string;
  description?: string;
  quantity: number;
  unit: string;
  estimated_price?: number;
}

export interface RFQ {
  id: string;
  rfq_number: string;
  title: string;
  description?: string;
  status: RFQStatus;
  deadline: string;
  created_by: string;
  created_at: string;
  updated_at: string;
  items?: RFQItem[];
  vendor_ids?: string[];
  attachments?: string[];
  profiles?: Profile;
}

export interface QuotationItem {
  id: string;
  quotation_id: string;
  rfq_item_id: string;
  unit_price: number;
  quantity: number;
  total_price: number;
  product_name: string;
}

export interface Quotation {
  id: string;
  rfq_id: string;
  vendor_id: string;
  status: QuotationStatus;
  total_amount: number;
  delivery_days: number;
  validity_days: number;
  notes?: string;
  submitted_at: string;
  created_at: string;
  updated_at: string;
  items?: QuotationItem[];
  vendors?: Vendor;
  rfqs?: RFQ;
}

export interface Approval {
  id: string;
  quotation_id: string;
  rfq_id: string;
  requested_by: string;
  approved_by?: string;
  status: ApprovalStatus;
  remarks?: string;
  requested_at: string;
  actioned_at?: string;
  profiles?: Profile;
  quotations?: Quotation;
  rfqs?: RFQ;
}

export interface PurchaseOrder {
  id: string;
  po_number: string;
  rfq_id: string;
  quotation_id: string;
  vendor_id: string;
  approval_id: string;
  status: POStatus;
  subtotal: number;
  gst_rate: number;
  gst_amount: number;
  total_amount: number;
  delivery_address: string;
  expected_delivery: string;
  notes?: string;
  created_by: string;
  created_at: string;
  updated_at: string;
  vendors?: Vendor;
  quotations?: Quotation;
  rfqs?: RFQ;
}

export interface Invoice {
  id: string;
  invoice_number: string;
  po_id: string;
  vendor_id: string;
  status: InvoiceStatus;
  subtotal: number;
  gst_rate: number;
  gst_amount: number;
  total_amount: number;
  due_date: string;
  paid_at?: string;
  notes?: string;
  created_by: string;
  created_at: string;
  updated_at: string;
  purchase_orders?: PurchaseOrder;
  vendors?: Vendor;
}

export interface ActivityLog {
  id: string;
  activity_type: ActivityType;
  description: string;
  entity_id: string;
  entity_type: string;
  performed_by: string;
  metadata?: Record<string, unknown>;
  created_at: string;
  profiles?: Profile;
}

export interface DashboardStats {
  pending_approvals: number;
  active_rfqs: number;
  total_vendors: number;
  monthly_spend: number;
  recent_pos: PurchaseOrder[];
  recent_invoices: Invoice[];
}