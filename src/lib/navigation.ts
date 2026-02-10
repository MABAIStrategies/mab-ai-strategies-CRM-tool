import { LayoutGrid, CalendarClock, Archive, Search } from "lucide-react";

export const navigationItems = [
  {
    label: "Workspace",
    href: "/workspace",
    icon: LayoutGrid,
    description: "Strategic command center"
  },
  {
    label: "Today",
    href: "/today",
    icon: CalendarClock,
    description: "Priority pulse"
  },
  {
    label: "Assets",
    href: "/assets",
    icon: Archive,
    description: "Brand intelligence vault"
  },
  {
    label: "Search",
    href: "/search",
    icon: Search,
    description: "Global intelligence scan"
  }
];
