# VendorBridge ERP

VendorBridge is a centralized procurement and ERP platform designed to simplify vendor management, Request for Quotation (RFQ) processing, and automated invoicing.

## Features

### RFQ Management
- Create and manage RFQs instantly.
- Track quotation requests and responses efficiently.

### Quotation Comparison
- Side-by-side analysis of vendor quotations.
- Compare pricing, delivery timelines, and vendor capabilities.

### Approval Workflows
- Structured approval processes for procurement activities.
- Multi-level approval support for organizations.

### Automation
- Auto-generate Purchase Orders (POs).
- Automated invoice creation and management.
- Reduce manual effort and processing time.

## Tech Stack

| Category | Technology |
|-----------|------------|
| Framework | Next.js (App Router) |
| Language | TypeScript |
| Database & Authentication | Supabase |
| Styling | Tailwind CSS |

## Getting Started

### 1. Clone the Repository

```bash
git clone https://github.com/zackyjacky3123-dot/Vendorbridge-odoo.git
cd Vendorbridge-odoo
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Configure Environment Variables

Create a `.env.local` file in the root directory and add:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### 4. Run the Development Server

```bash
npm run dev
```

### 5. Open the Application

Visit:

```text
http://localhost:3000
```

## Project Structure

```text
Vendorbridge-odoo/
│
├── app/                # Next.js App Router pages
├── components/         # Reusable UI components
├── lib/                # Utility and helper functions
├── public/             # Static assets
├── styles/             # Global styles
├── supabase/           # Supabase configuration
├── types/              # TypeScript type definitions
├── package.json
└── README.md
```

## Future Enhancements

- AI-powered vendor recommendations
- Advanced procurement analytics
- Vendor performance scoring
- Multi-organization support
- Mobile application integration

## License

This project is licensed under the MIT License.

## Authors

Developed as a modern procurement and vendor management solution to streamline supplier collaboration, RFQ processing, and procurement workflows.
