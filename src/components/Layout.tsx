import { useState } from "react";
import { Link, useLocation, Outlet } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  Sprout,
  Home,
  Cloud,
  TestTube,
  TrendingUp,
  Calendar,
  Bell,
  Users,
  Settings,
  Menu,
  X,
  MapPin
} from "lucide-react";

export const navigation = [
  { name: "Homepage", href: "/", icon: Home },
  { name: "Weather", href: "/weather", icon: Cloud },
  { name: "Soil Insights", href: "/soil", icon: TestTube },
  { name: "Market", href: "/market", icon: TrendingUp },
  { name: "Farm History", href: "/history", icon: Calendar },
  { name: "Alerts", href: "/alerts", icon: Bell },
  { name: "Community", href: "/community", icon: Users },
  { name: "Settings", href: "/settings", icon: Settings },
];

interface LayoutProps {
  children: React.ReactNode;
  location?: { lat: number; lng: number; address: string } | null;
  onLocationChange?: () => void;
}

const Layout = ({ children, location, onLocationChange }: LayoutProps) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const currentLocation = useLocation();

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-gradient-hero text-primary-foreground shadow-soft border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Button
                variant="ghost"
                size="sm"
                className="md:hidden text-primary-foreground hover:bg-white/20"
                onClick={() => setSidebarOpen(!sidebarOpen)}
              >
                {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </Button>
              <Link to="/" className="flex items-center gap-3">
                <Sprout className="w-8 h-8" />
                <h1 className="text-xl font-bold">SmartAgri Advisor</h1>
              </Link>
            </div>
            
            <div className="flex items-center gap-4">
              {location && (
                <div className="flex items-center gap-2 text-sm bg-white/10 backdrop-blur-sm rounded-full px-4 py-2">
                  <MapPin className="w-4 h-4" />
                  <span className="hidden sm:inline">{location.address}</span>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={onLocationChange}
                    className="text-primary-foreground hover:bg-white/20 ml-2"
                  >
                    Change
                  </Button>
                </div>
              )}
              <Link to="/login">
                <Button variant="secondary" size="sm">Login</Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      <div className="flex">
        {/* Sidebar */}
        <aside className={cn(
          "fixed inset-y-0 left-0 z-50 w-64 bg-card border-r transform transition-transform duration-200 ease-in-out md:relative md:translate-x-0 md:inset-y-auto md:top-0",
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        )}>
          <div className="p-6 pt-20 md:pt-6">
            <nav className="space-y-2">
              {navigation.map((item) => {
                const Icon = item.icon;
                const isActive = currentLocation.pathname === item.href;
                return (
                  <Link
                    key={item.name}
                    to={item.href}
                    className={cn(
                      "flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors",
                      isActive
                        ? "bg-primary text-primary-foreground"
                        : "text-muted-foreground hover:text-foreground hover:bg-accent"
                    )}
                    onClick={() => setSidebarOpen(false)}
                  >
                    <Icon className="w-5 h-5" />
                    {item.name}
                  </Link>
                );
              })}
            </nav>
          </div>
        </aside>

        {/* Overlay for mobile */}
        {sidebarOpen && (
          <div 
            className="fixed inset-0 bg-black/20 z-40 md:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* Main Content */}
        <main className="flex-1 p-6 md:p-8">
          {children ?? <Outlet />}
        </main>
      </div>
    </div>
  );
};

export default Layout;