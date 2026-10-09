import {
  LayoutDashboard,
  Factory,
  ClipboardList,
  Boxes,
  Wrench,
  CheckCircle2,
  Truck,
  Users,
  IndianRupee,
  Sparkles,
  BarChart3,
  Settings,
  LucideIcon,
} from "lucide-react";
import { UserRole } from "@/types/auth";

export interface NavItem {
  title: string;
  href: string;
  icon: LucideIcon;
  badge?: string;
  badgeColor?: string;
  description: string;
  allowedRoles?: UserRole[]; // If omitted, accessible by all authorized users
}

export const MAIN_NAV_ITEMS: NavItem[] = [
  {
    title: "Dashboard",
    href: "/dashboard",
    icon: LayoutDashboard,
    description: "Operational overview & manufacturing status",
    allowedRoles: [
      "Admin",
      "Factory Manager",
      "Production Manager",
      "Inventory Manager",
      "Maintenance Manager",
      "Quality Manager",
      "Procurement Manager",
      "HR Manager",
      "Finance Manager",
    ],
  },
  {
    title: "Production",
    href: "/production",
    icon: Factory,
    description: "Production planning, scheduling & shop floor",
    allowedRoles: [
      "Admin",
      "Factory Manager",
      "Production Manager",
      "Maintenance Manager",
      "Quality Manager",
    ],
  },
  {
    title: "Orders",
    href: "/orders",
    icon: ClipboardList,
    description: "Customer orders, fulfillment & demand pipeline",
    allowedRoles: [
      "Admin",
      "Factory Manager",
      "Production Manager",
      "Inventory Manager",
      "Procurement Manager",
      "Finance Manager",
      "Quality Manager",
    ],
  },
  {
    title: "Inventory",
    href: "/inventory",
    icon: Boxes,
    description: "Raw materials, stock levels & warehouse bins",
    allowedRoles: [
      "Admin",
      "Factory Manager",
      "Production Manager",
      "Inventory Manager",
      "Procurement Manager",
      "Finance Manager",
    ],
  },
  {
    title: "Digital Twin",
    href: "/digital-twin",
    icon: Sparkles,
    badge: "AI Simulator",
    badgeColor: "bg-cyan-500/15 text-cyan-700 border-cyan-300",
    description: "What-If simulation, downtime & capacity testing",
    allowedRoles: [
      "Admin",
      "Factory Manager",
      "Production Manager",
      "Maintenance Manager",
      "Quality Manager",
      "Inventory Manager",
      "Finance Manager",
    ],
  },
  {
    title: "Machines & Maintenance",
    href: "/machines",
    icon: Wrench,
    description: "Equipment telemetry, uptime & preventative care",
    allowedRoles: [
      "Admin",
      "Factory Manager",
      "Production Manager",
      "Maintenance Manager",
    ],
  },
  {
    title: "Quality Control",
    href: "/quality",
    icon: CheckCircle2,
    description: "Inspections, defect logging & compliance",
    allowedRoles: [
      "Admin",
      "Factory Manager",
      "Production Manager",
      "Quality Manager",
    ],
  },
  {
    title: "Procurement",
    href: "/procurement",
    icon: Truck,
    description: "Supplier purchase orders & material intake",
    allowedRoles: [
      "Admin",
      "Factory Manager",
      "Procurement Manager",
      "Inventory Manager",
      "Finance Manager",
    ],
  },
  {
    title: "Workforce",
    href: "/workforce",
    icon: Users,
    description: "Shift assignments, skills & operator capacity",
    allowedRoles: [
      "Admin",
      "Factory Manager",
      "HR Manager",
      "Production Manager",
    ],
  },
  {
    title: "Finance",
    href: "/finance",
    icon: IndianRupee,
    description: "Unit costing, margins & budget approvals",
    allowedRoles: [
      "Admin",
      "Factory Manager",
      "Finance Manager",
    ],
  },
];

export const BOTTOM_NAV_ITEMS: NavItem[] = [
  {
    title: "Settings",
    href: "/settings",
    icon: Settings,
    description: "System preferences, roles & plant configurations",
    allowedRoles: [
      "Admin",
      "Factory Manager",
    ],
  },
];
