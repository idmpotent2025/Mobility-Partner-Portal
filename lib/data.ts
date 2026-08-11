export interface InventoryItem {
  id: string
  sku: string
  name: string
  category: string
  currentStock: number
  minThreshold: number
  unitCost: number
  status: 'In Stock' | 'Low Stock' | 'Out of Stock'
  warehouse: string
  lastUpdated: string
}

export const mockInventory: InventoryItem[] = [
  {
    id: '1',
    sku: 'GPP-GRC-001',
    name: 'Organic Rolled Oats (5lb)',
    category: 'Grocery',
    currentStock: 3200,
    minThreshold: 1000,
    unitCost: 4.49,
    status: 'In Stock',
    warehouse: 'DC-Dallas-TX',
    lastUpdated: '2026-07-18',
  },
  {
    id: '2',
    sku: 'GPP-HBC-042',
    name: 'Aloe Vera Shampoo (12oz)',
    category: 'Health & Beauty',
    currentStock: 450,
    minThreshold: 500,
    unitCost: 3.29,
    status: 'Low Stock',
    warehouse: 'DC-Atlanta-GA',
    lastUpdated: '2026-07-19',
  },
  {
    id: '3',
    sku: 'GPP-HHD-018',
    name: 'Microfiber Cleaning Cloths (10pk)',
    category: 'Household',
    currentStock: 0,
    minThreshold: 800,
    unitCost: 6.99,
    status: 'Out of Stock',
    warehouse: 'DC-Chicago-IL',
    lastUpdated: '2026-07-15',
  },
  {
    id: '4',
    sku: 'GPP-ELC-077',
    name: 'USB-C Charging Cable 6ft',
    category: 'Electronics',
    currentStock: 1800,
    minThreshold: 600,
    unitCost: 5.49,
    status: 'In Stock',
    warehouse: 'DC-Phoenix-AZ',
    lastUpdated: '2026-07-20',
  },
  {
    id: '5',
    sku: 'GPP-SPT-033',
    name: 'Resistance Band Set (5-pack)',
    category: 'Sports',
    currentStock: 220,
    minThreshold: 300,
    unitCost: 11.99,
    status: 'Low Stock',
    warehouse: 'DC-Dallas-TX',
    lastUpdated: '2026-07-17',
  },
  {
    id: '6',
    sku: 'GPP-GRC-088',
    name: 'Cold Brew Coffee Concentrate (32oz)',
    category: 'Grocery',
    currentStock: 2100,
    minThreshold: 700,
    unitCost: 7.99,
    status: 'In Stock',
    warehouse: 'DC-Seattle-WA',
    lastUpdated: '2026-07-19',
  },
]

export interface Invoice {
  id: string
  invoiceNumber: string
  issueDate: string
  dueDate: string
  amount: number
  status: 'Paid' | 'Pending' | 'Overdue'
  poNumber: string
  items: number
}

export const mockInvoices: Invoice[] = [
  {
    id: '1',
    invoiceNumber: 'INV-2026-00481',
    issueDate: 'Jul 01, 2026',
    dueDate: 'Jul 31, 2026',
    amount: 48250.0,
    status: 'Pending',
    poNumber: 'PO-GPP-884421',
    items: 3,
  },
  {
    id: '2',
    invoiceNumber: 'INV-2026-00398',
    issueDate: 'Jun 15, 2026',
    dueDate: 'Jul 15, 2026',
    amount: 31480.5,
    status: 'Paid',
    poNumber: 'PO-GPP-812034',
    items: 5,
  },
  {
    id: '3',
    invoiceNumber: 'INV-2026-00312',
    issueDate: 'May 28, 2026',
    dueDate: 'Jun 27, 2026',
    amount: 19755.0,
    status: 'Overdue',
    poNumber: 'PO-GPP-779201',
    items: 2,
  },
  {
    id: '4',
    invoiceNumber: 'INV-2026-00267',
    issueDate: 'May 01, 2026',
    dueDate: 'May 31, 2026',
    amount: 62100.75,
    status: 'Paid',
    poNumber: 'PO-GPP-751888',
    items: 8,
  },
  {
    id: '5',
    invoiceNumber: 'INV-2026-00524',
    issueDate: 'Jul 10, 2026',
    dueDate: 'Aug 09, 2026',
    amount: 27340.0,
    status: 'Pending',
    poNumber: 'PO-GPP-901774',
    items: 4,
  },
]

export interface Payment {
  id: string
  date: string
  reference: string
  invoiceNumber: string
  amount: number
  method: string
  status: 'Completed' | 'Processing' | 'Failed'
}

export const mockPayments: Payment[] = [
  {
    id: '1',
    date: 'Jul 14, 2026',
    reference: 'PAY-20260714-8821',
    invoiceNumber: 'INV-2026-00398',
    amount: 31480.5,
    method: 'ACH Transfer',
    status: 'Completed',
  },
  {
    id: '2',
    date: 'May 30, 2026',
    reference: 'PAY-20260530-7741',
    invoiceNumber: 'INV-2026-00267',
    amount: 62100.75,
    method: 'Wire Transfer',
    status: 'Completed',
  },
  {
    id: '3',
    date: 'Jul 19, 2026',
    reference: 'PAY-20260719-9910',
    invoiceNumber: 'INV-2026-00312',
    amount: 19755.0,
    method: 'ACH Transfer',
    status: 'Processing',
  },
]

export const pendingBalance = {
  total: 75590.0,
  overdueAmount: 19755.0,
  nextDueDate: 'Jul 31, 2026',
  nextDueAmount: 48250.0,
}

export interface TeamMember {
  id: string
  name: string
  email: string
  role: 'Admin' | 'Finance' | 'Inventory Manager' | 'Viewer'
  status: 'Active' | 'Pending Invite'
  lastLogin: string
}

export const mockTeam: TeamMember[] = [
  {
    id: '1',
    name: 'Sarah Chen',
    email: 'sarah.chen@acmegoods.com',
    role: 'Admin',
    status: 'Active',
    lastLogin: 'Jul 20, 2026',
  },
  {
    id: '2',
    name: 'Marcus Johnson',
    email: 'm.johnson@acmegoods.com',
    role: 'Finance',
    status: 'Active',
    lastLogin: 'Jul 19, 2026',
  },
  {
    id: '3',
    name: 'Priya Patel',
    email: 'p.patel@acmegoods.com',
    role: 'Inventory Manager',
    status: 'Active',
    lastLogin: 'Jul 20, 2026',
  },
  {
    id: '4',
    name: 'Liam Torres',
    email: 'l.torres@acmegoods.com',
    role: 'Viewer',
    status: 'Pending Invite',
    lastLogin: '—',
  },
]

export interface Ticket {
  id: string
  ticketNumber: string
  subject: string
  category: 'Inventory' | 'Invoice' | 'Payment' | 'Account' | 'Technical' | 'Other'
  status: 'Open' | 'In Progress' | 'Resolved' | 'Closed'
  priority: 'Low' | 'Medium' | 'High' | 'Critical'
  createdDate: string
  lastUpdated: string
}

export const mockTickets: Ticket[] = [
  {
    id: '1',
    ticketNumber: 'TKT-2026-00881',
    subject: 'Inventory sync discrepancy for SKU GPP-HBC-042',
    category: 'Inventory',
    status: 'In Progress',
    priority: 'High',
    createdDate: 'Jul 18, 2026',
    lastUpdated: 'Jul 19, 2026',
  },
  {
    id: '2',
    ticketNumber: 'TKT-2026-00774',
    subject: 'Invoice INV-2026-00312 payment dispute',
    category: 'Invoice',
    status: 'Open',
    priority: 'Critical',
    createdDate: 'Jul 10, 2026',
    lastUpdated: 'Jul 10, 2026',
  },
  {
    id: '3',
    ticketNumber: 'TKT-2026-00631',
    subject: 'Request to add new product category — Outdoor & Garden',
    category: 'Account',
    status: 'Resolved',
    priority: 'Low',
    createdDate: 'Jun 22, 2026',
    lastUpdated: 'Jun 28, 2026',
  },
  {
    id: '4',
    ticketNumber: 'TKT-2026-00590',
    subject: 'EDI 850 purchase order format error',
    category: 'Technical',
    status: 'Closed',
    priority: 'Medium',
    createdDate: 'Jun 15, 2026',
    lastUpdated: 'Jun 20, 2026',
  },
]

export interface PendingProduct {
  id: string
  sku: string
  name: string
  category: string
  submittedDate: string
  status: 'Under Review' | 'Approved' | 'Rejected' | 'Needs Info'
  notes: string
}

export const mockPendingProducts: PendingProduct[] = [
  {
    id: '1',
    sku: 'NEW-GRC-112',
    name: 'Plant-Based Protein Powder (2lb)',
    category: 'Grocery',
    submittedDate: 'Jul 05, 2026',
    status: 'Under Review',
    notes: 'Awaiting FDA compliance check',
  },
  {
    id: '2',
    sku: 'NEW-HBC-091',
    name: 'Bamboo Toothbrush Set (4pk)',
    category: 'Health & Beauty',
    submittedDate: 'Jun 20, 2026',
    status: 'Approved',
    notes: 'Approved — item will be live in 3 business days',
  },
  {
    id: '3',
    sku: 'NEW-HHD-055',
    name: 'Collapsible Storage Bins (3pk)',
    category: 'Household',
    submittedDate: 'Jun 10, 2026',
    status: 'Needs Info',
    notes: 'Please provide UPC barcode and updated images',
  },
]

export const partnerStats = {
  companyName: 'Acme Goods Inc.',
  partnerSince: 'March 2019',
  supplierId: 'GPP-SUP-003847',
  activeSkus: 24,
  pendingInvoices: 2,
  pendingBalance: 75590.0,
  openTickets: 2,
  teamSize: 4,
}
