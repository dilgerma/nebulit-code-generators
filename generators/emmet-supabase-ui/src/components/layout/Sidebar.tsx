import { NavLink, useLocation } from "react-router-dom";
import {
  Users,
  Calendar,
  ClipboardList,
  LayoutDashboard,
  Settings,
  FileText,
  TreePalm,
  Layers,
} from "lucide-react";
import { cn } from "@/lib/utils";

const navigation = [
  { name: "Overview", href: "/", icon: LayoutDashboard },
  { name: "Items", href: "/tables", icon: Layers },
  { name: "Staff", href: "/staff", icon: Users },
  { name: "Shifts", href: "/shifts", icon: Calendar },
  { name: "Tasks", href: "/tasks", icon: ClipboardList },
  { name: "Documents", href: "/menus", icon: FileText },
  { name: "Vacations", href: "/vacations", icon: TreePalm },
];

export function Sidebar() {
  const location = useLocation();

  return (
    <aside className="fixed inset-y-0 left-0 z-50 flex h-full w-64 flex-col bg-sidebar">
      {/* Logo */}
      <div className="flex h-16 items-center gap-3 border-b border-sidebar-border px-6">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary">
          <LayoutDashboard className="h-5 w-5 text-primary-foreground" />
        </div>
        <span className="text-lg font-semibold text-sidebar-foreground">
          App
        </span>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-1 px-3 py-4">
        {navigation.map((item) => {
          const isActive =
            item.href === "/"
              ? location.pathname === "/"
              : location.pathname.startsWith(item.href);

          return (
            <NavLink
              key={item.name}
              to={item.href}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                isActive
                  ? "bg-sidebar-accent text-sidebar-primary"
                  : "text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-foreground"
              )}
            >
              <item.icon className="h-5 w-5" />
              {item.name}
            </NavLink>
          );
        })}
      </nav>

      {/* Settings */}
      <div className="border-t border-sidebar-border p-3">
        <NavLink
          to="/settings"
          className={cn(
            "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
            location.pathname === "/settings"
              ? "bg-sidebar-accent text-sidebar-primary"
              : "text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-foreground"
          )}
        >
          <Settings className="h-5 w-5" />
          Settings
        </NavLink>
      </div>
    </aside>
  );
}
