"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { buttonVariants } from "@/components/ui/button";
import { ThemeToggle } from "@/components/theme-toggle";

const navItems = [
  {
    path: "/",
    label: "Home",
  },
  {
    path: "/pricing",
    label: "Pricing",
  },
  {
    path: "/features",
    label: "Features",
  },
];

export function MainNav() {
  const pathname = usePathname();

  return (
    <div className="flex h-16 items-center justify-between border-b px-4">
      <div className="flex items-center gap-6 md:gap-10">
        <Link href="/" className="flex items-center space-x-2">
          <span className="font-bold text-xl">ModernSaaS</span>
        </Link>
        <nav className="hidden md:flex gap-6">
          {navItems.map((item, index) => (
            <Link
              key={index}
              href={item.path}
              className={cn(
                "text-sm font-medium transition-colors hover:text-primary",
                pathname === item.path
                  ? "text-foreground"
                  : "text-muted-foreground",
              )}
            >
              {item.label}
            </Link>
          ))}
        </nav>
      </div>
      <div className="flex items-center gap-2">
        <nav className="flex items-center gap-2">
          <Link
            href="/auth/login"
            className={buttonVariants({ variant: "ghost", size: "sm" })}
          >
            Login
          </Link>
          <Link
            href="/auth/register"
            className={buttonVariants({ size: "sm" })}
          >
            Sign Up
          </Link>
        </nav>
        <ThemeToggle />
      </div>
    </div>
  );
}
