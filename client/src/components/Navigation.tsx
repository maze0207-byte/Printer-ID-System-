import { Link, useLocation } from "wouter";
import { cn } from "@/lib/utils";
import { CreditCard, Printer, Users, BarChart3, UploadCloud, Building2, UserCircle } from "lucide-react";
import seuLogo from "@assets/Logo_-SEU_1770297195752.png";

export function Navigation() {
  const [location] = useLocation();

  const navItems = [
    { href: "/", label: "Dashboard", labelAr: "لوحة التحكم", icon: BarChart3 },
    { href: "/structure", label: "Structure", labelAr: "الهيكل التنظيمي", icon: Building2 },
    { href: "/persons", label: "Persons", labelAr: "الأشخاص", icon: UserCircle },
    { href: "/cards", label: "Manage Cards", labelAr: "إدارة البطاقات", icon: Users },
    { href: "/design", label: "Designer", labelAr: "المصمم", icon: CreditCard },
    { href: "/batch", label: "Batch Import", labelAr: "استيراد دفعة", icon: UploadCloud },
    { href: "/print", label: "Print Station", labelAr: "محطة الطباعة", icon: Printer },
  ];

  return (
    <nav className="fixed top-0 left-0 h-screen w-64 bg-sidebar text-sidebar-foreground z-50 flex flex-col no-print hidden md:flex shadow-xl">
      <div className="p-6 border-b border-sidebar-border">
        <div className="flex items-center gap-3">
          <div className="w-14 h-14 flex-shrink-0 bg-white rounded-full p-1">
            <img src={seuLogo} alt="Saxony Egypt University" className="w-full h-full object-contain" />
          </div>
          <div>
            <h1 className="font-display font-bold text-sm leading-none tracking-wide text-white">
              ID Forge
            </h1>
            <span className="text-[9px] text-sidebar-foreground/70 font-medium tracking-wider">
              SEU Card System
            </span>
            <div className="text-[9px] text-sidebar-foreground/50 font-arabic mt-0.5">
              جامعة ساكسوني مصر
            </div>
          </div>
        </div>
      </div>

      <div className="flex-1 py-6 px-3 space-y-1 overflow-y-auto">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = location === item.href;
          
          return (
            <Link key={item.href} href={item.href}>
              <div
                data-testid={`nav-${item.href.replace('/', '') || 'dashboard'}`}
                className={cn(
                  "flex items-center gap-3 px-4 py-3 rounded-xl cursor-pointer transition-all duration-200 group",
                  isActive 
                    ? "bg-primary text-primary-foreground shadow-lg shadow-primary/30" 
                    : "text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-foreground"
                )}
              >
                <Icon className={cn("w-5 h-5", isActive ? "text-primary-foreground" : "text-sidebar-foreground/60 group-hover:text-accent")} />
                <div className="flex flex-col">
                  <span className="font-medium text-sm">{item.label}</span>
                  <span className="text-[9px] font-arabic opacity-60">{item.labelAr}</span>
                </div>
              </div>
            </Link>
          );
        })}
      </div>

      <div className="p-4 border-t border-sidebar-border">
        <div className="bg-gradient-to-br from-primary/20 to-accent/10 rounded-xl p-4 border border-primary/20">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-2 h-2 rounded-full bg-accent animate-pulse" />
            <h4 className="text-sm font-bold text-white">ID Card System</h4>
          </div>
          <p className="text-xs text-sidebar-foreground/60 mb-3">Manage student and staff identification cards.</p>
          <div className="flex gap-2">
            <span className="text-[10px] font-semibold text-accent bg-accent/10 px-2 py-1 rounded">v2.0</span>
          </div>
        </div>
      </div>
    </nav>
  );
}

export function MobileNav() {
  const [location] = useLocation();

  const navItems = [
    { href: "/", label: "Home", icon: BarChart3 },
    { href: "/cards", label: "Cards", icon: Users },
    { href: "/design", label: "New", icon: CreditCard },
    { href: "/print", label: "Print", icon: Printer },
  ];

  return (
    <div className="md:hidden fixed bottom-0 left-0 w-full bg-sidebar border-t border-sidebar-border z-50 flex justify-around p-2 no-print shadow-[0_-5px_20px_rgba(0,0,0,0.2)]">
      {navItems.map((item) => {
        const Icon = item.icon;
        const isActive = location === item.href;
        
        return (
          <Link key={item.href} href={item.href}>
            <div
              data-testid={`mobile-nav-${item.href.replace('/', '') || 'home'}`}
              className={cn(
                "flex flex-col items-center gap-1 p-2 rounded-lg cursor-pointer transition-all",
                isActive ? "text-accent" : "text-sidebar-foreground/60"
              )}
            >
              <Icon className={cn("w-5 h-5", isActive && "fill-current")} />
              <span className="text-[10px] font-medium">{item.label}</span>
            </div>
          </Link>
        );
      })}
    </div>
  );
}
