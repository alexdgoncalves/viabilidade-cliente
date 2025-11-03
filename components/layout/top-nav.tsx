'use client';

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { useTheme } from "@/context/theme-context";

const navItems = [
  { href: "/", label: "Pre-analise" },
  { href: "/validacao", label: "Validacao de notas" },
  { href: "/parecer", label: "Parecer final" },
];

type TopNavProps = {
  title: string;
  description: string;
  stage?: string;
  rightSlot?: React.ReactNode;
};

export default function TopNav({
  title,
  description,
  stage,
  rightSlot,
}: TopNavProps) {
  const pathname = usePathname();
  const { theme } = useTheme();

  const headerClass =
    theme === "dark"
      ? "border-slate-800/70 bg-slate-900/40"
      : "border-slate-200 bg-white/80";
  const titleColor = theme === "dark" ? "text-slate-100" : "text-slate-900";
  const descColor = theme === "dark" ? "text-slate-400" : "text-slate-600";
  const navColor = theme === "dark" ? "text-slate-400" : "text-slate-600";

  return (
    <header className={cn("border-b backdrop-blur", headerClass)}>
      <div className="mx-auto flex max-w-6xl flex-col gap-4 px-4 py-4 md:flex-row md:items-center md:justify-between">
        <div className="space-y-2">
          <div className="flex flex-wrap items-center gap-3">
            <h1 className={cn("text-lg font-semibold tracking-tight", titleColor)}>
              {title}
            </h1>
            {stage ? (
              <Badge variant="outline" className="text-xs capitalize">
                {stage}
              </Badge>
            ) : null}
          </div>
          <p className={cn("text-sm", descColor)}>{description}</p>
          <nav className={cn("flex flex-wrap gap-2 text-xs", navColor)}>
            {navItems.map((item) => {
              const active = pathname === item.href;
              const activeClasses =
                theme === "dark"
                  ? "bg-emerald-500/20 text-emerald-200"
                  : "bg-blue-100 text-blue-700";
              const hoverClasses =
                theme === "dark"
                  ? "hover:bg-slate-800/60 hover:text-slate-200"
                  : "hover:bg-slate-200 hover:text-slate-800";
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "rounded-md px-3 py-1 transition",
                    active ? activeClasses : hoverClasses,
                  )}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </div>
        {rightSlot ? (
          <div className="text-xs text-muted">{rightSlot}</div>
        ) : null}
      </div>
    </header>
  );
}
