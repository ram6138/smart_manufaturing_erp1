import { User, UserRole } from "@/types/auth";

export interface DemoAccount {
  email: string;
  password: string; // Used for auth validation
  user: User;
}

export const ALL_SYSTEM_ROLES: {
  role: UserRole;
  description: string;
  color: string;
  iconName: string;
}[] = [
  {
    role: "Admin",
    description: "Full system administration and configuration control",
    color: "rose",
    iconName: "ShieldAlert",
  },
  {
    role: "Factory Manager",
    description: "Overall manufacturing operations and high-level KPI oversight",
    color: "amber",
    iconName: "Building2",
  },
  {
    role: "Production Manager",
    description: "Production schedules, work orders, and shop floor monitoring",
    color: "blue",
    iconName: "Factory",
  },
  {
    role: "Inventory Manager",
    description: "Raw material stocks, finished goods, warehouse, and SKU tracking",
    color: "emerald",
    iconName: "Boxes",
  },
  {
    role: "Maintenance Manager",
    description: "Machine health, preventive schedules, and downtime tracking",
    color: "orange",
    iconName: "Wrench",
  },
  {
    role: "Quality Manager",
    description: "QA inspections, defect logging, and compliance audits",
    color: "purple",
    iconName: "CheckCircle2",
  },
  {
    role: "Procurement Manager",
    description: "Vendor orders, supplier quotes, and material intake",
    color: "cyan",
    iconName: "Truck",
  },
  {
    role: "HR Manager",
    description: "Shift assignments, workforce capacity, and operator skills",
    color: "indigo",
    iconName: "Users",
  },
  {
    role: "Finance Manager",
    description: "Production costing, margins, PO approvals, and fiscal reports",
    color: "teal",
    iconName: "IndianRupee",
  },
];

export const DEMO_USERS: DemoAccount[] = [
  {
    email: "admin@factory.com",
    password: "Admin@123",
    user: {
      id: "usr_admin_001",
      name: "Raju",
      email: "admin@factory.com",
      role: "Admin",
      department: "Executive Management",
      createdAt: "2026-01-15T08:00:00.000Z",
    },
  },
  {
    email: "manager@factory.com",
    password: "Manager@123",
    user: {
      id: "usr_mgr_002",
      name: "David Miller",
      email: "manager@factory.com",
      role: "Factory Manager",
      department: "Plant Operations",
      createdAt: "2026-01-18T09:00:00.000Z",
    },
  },
  {
    email: "production@factory.com",
    password: "Production@123",
    user: {
      id: "usr_prod_003",
      name: "Sarah Jenkins",
      email: "production@factory.com",
      role: "Production Manager",
      department: "Manufacturing Operations",
      createdAt: "2026-01-20T09:30:00.000Z",
    },
  },
  {
    email: "inventory@factory.com",
    password: "Inventory@123",
    user: {
      id: "usr_inv_004",
      name: "Marcus Chen",
      email: "inventory@factory.com",
      role: "Inventory Manager",
      department: "Supply Chain & Warehouse",
      createdAt: "2026-02-01T10:15:00.000Z",
    },
  },
  {
    email: "maintenance@factory.com",
    password: "Maintenance@123",
    user: {
      id: "usr_maint_005",
      name: "Robert Torres",
      email: "maintenance@factory.com",
      role: "Maintenance Manager",
      department: "Plant Engineering & IoT",
      createdAt: "2026-02-05T08:45:00.000Z",
    },
  },
  {
    email: "quality@factory.com",
    password: "Quality@123",
    user: {
      id: "usr_qa_006",
      name: "Elena Rostova",
      email: "quality@factory.com",
      role: "Quality Manager",
      department: "Quality Assurance & Compliance",
      createdAt: "2026-02-10T11:00:00.000Z",
    },
  },
  {
    email: "procurement@factory.com",
    password: "Procurement@123",
    user: {
      id: "usr_proc_007",
      name: "Liam O'Connor",
      email: "procurement@factory.com",
      role: "Procurement Manager",
      department: "Vendor Sourcing & Purchasing",
      createdAt: "2026-02-15T09:15:00.000Z",
    },
  },
  {
    email: "hr@factory.com",
    password: "HR@123",
    user: {
      id: "usr_hr_008",
      name: "Priya Sharma",
      email: "hr@factory.com",
      role: "HR Manager",
      department: "Workforce & People Operations",
      createdAt: "2026-02-20T10:00:00.000Z",
    },
  },
  {
    email: "finance@factory.com",
    password: "Finance@123",
    user: {
      id: "usr_fin_009",
      name: "Michael Sterling",
      email: "finance@factory.com",
      role: "Finance Manager",
      department: "Corporate Accounting & Cost Control",
      createdAt: "2026-02-25T11:30:00.000Z",
    },
  },
];
