"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { LucideIcon } from "lucide-react";

interface NavItem {
  name: string;
  href: string;
  icon: LucideIcon;
}

interface SidebarNavProps {
  items: NavItem[];
}

export default function SidebarNav({ items }: SidebarNavProps) {
  const pathname = usePathname();

  return (
    <nav className="flex flex-row md:flex-col overflow-x-auto md:overflow-visible gap-1.5 pb-2 md:pb-0 scrollbar-none">
      {items.map((item) => {
        const Icon = item.icon;
        // Exact match or sub-paths for children page selections
        const isActive = 
          pathname === item.href || 
          (item.href !== "/dashboard/admin" && pathname.startsWith(item.href));
        
        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "flex items-center gap-2.5 px-4 py-2.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap",
              isActive
                ? "bg-primary text-white shadow-md shadow-primary/20"
                : "text-slate-400 hover:bg-slate-800/40 hover:text-slate-200"
            )}
          >
            <Icon className="h-4.5 w-4.5" />
            {item.name}
          </Link>
        );
      })}
    </nav>
  );
}
