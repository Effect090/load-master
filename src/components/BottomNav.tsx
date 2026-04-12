"use client";

import { usePathname, useRouter } from "next/navigation";
import { Home, Calendar, PlusCircle, User } from "lucide-react";
import { cn } from "@/lib/utils";
import { useLang } from "@/lib/i18n";

export function BottomNav() {
  const pathname = usePathname();
  const router = useRouter();
  const { t } = useLang();

  const isActive = (href: string, exact: boolean) => {
    if (exact) return pathname === href;
    return pathname.startsWith(href);
  };

  const navItems = [
    { label: t("nav.home"),    href: "/feed",    icon: Home,     exact: true  },
    { label: t("nav.matches"), href: "/matches", icon: Calendar, exact: false },
    { label: t("nav.profile"), href: "/profile", icon: User,     exact: false },
  ];

  return (
    <div
      className="fixed bottom-0 inset-x-0 z-40 glass-dark border-t border-cf-border/60"
      style={{ paddingBottom: "env(safe-area-inset-bottom, 0px)" }}
    >
      <div className="flex items-center justify-around h-[72px] px-2 max-w-lg mx-auto">
        {navItems.slice(0, 2).map((item) => {
          const active = isActive(item.href, item.exact);
          return (
            <NavButton
              key={item.href}
              label={item.label}
              icon={item.icon}
              active={active}
              onClick={() => router.push(item.href)}
            />
          );
        })}

        <button
          onClick={() => router.push("/matches/create")}
          className={cn(
            "flex flex-col items-center justify-center",
            "-mt-6 w-16 h-16 rounded-full",
            "bg-green-600 hover:bg-green-500 active:bg-green-700",
            "shadow-green-glow",
            "transition-all duration-200 active:scale-95",
            "border-4 border-[#07090F]"
          )}
          aria-label={t("nav.create_match_aria")}
        >
          <PlusCircle className="w-7 h-7 text-white" />
        </button>

        {navItems.slice(2).map((item) => {
          const active = isActive(item.href, item.exact);
          return (
            <NavButton
              key={item.href}
              label={item.label}
              icon={item.icon}
              active={active}
              onClick={() => router.push(item.href)}
            />
          );
        })}
      </div>
    </div>
  );
}

function NavButton({
  label,
  icon: Icon,
  active,
  onClick,
}: {
  label: string;
  icon: React.ElementType;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className="flex flex-col items-center justify-center gap-1 w-16 h-full transition-all duration-200 active:scale-90"
      aria-label={label}
    >
      <Icon
        className={cn(
          "w-5 h-5 transition-colors duration-200",
          active ? "text-green-400" : "text-cf-dim"
        )}
      />
      <span
        className={cn(
          "text-[10px] font-semibold tracking-wide transition-colors duration-200",
          active ? "text-green-400" : "text-cf-dim"
        )}
      >
        {label}
      </span>
      {active && (
        <span className="absolute bottom-2 w-1 h-1 rounded-full bg-green-400" />
      )}
    </button>
  );
}
