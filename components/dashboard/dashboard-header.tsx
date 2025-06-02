"use client";

import Link from "next/link";
import { Menu, User } from "lucide-react";
import { signOut } from "next-auth/react";
import { useSession } from "next-auth/react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ThemeToggle } from "@/components/theme-toggle";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";

export function DashboardHeader() {
  const { data: session } = useSession();

  const user = session?.user;
  const userInitials = user?.name
    ? user.name
        .split(" ")
        .map((n) => n[0])
        .join("")
    : "U";

  return (
    <header className="flex h-14 items-center gap-4 border-b bg-background px-4 lg:h-16 lg:px-6">
      <Sheet>
        <SheetTrigger asChild>
          <Button variant="outline" size="icon" className="md:hidden">
            <Menu className="h-5 w-5" />
            <span className="sr-only">Toggle Menu</span>
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="w-64 p-0">
          <nav className="grid gap-2 p-4">
            <Link
              href="/dashboard"
              className="flex items-center gap-2 text-lg font-semibold"
            >
              <span>ModernSaaS</span>
            </Link>
            <Link
              href="/dashboard"
              className="flex items-center gap-2 rounded-md px-3 py-2 text-sm hover:bg-accent"
            >
              Dashboard
            </Link>
            <Link
              href="/dashboard/profile"
              className="flex items-center gap-2 rounded-md px-3 py-2 text-sm hover:bg-accent"
            >
              Profile
            </Link>
            <Link
              href="/dashboard/settings"
              className="flex items-center gap-2 rounded-md px-3 py-2 text-sm hover:bg-accent"
            >
              Settings
            </Link>
          </nav>
        </SheetContent>
      </Sheet>
      <div className="flex-1">
        <h1 className="text-lg font-semibold md:text-xl">Dashboard</h1>
      </div>
      <div className="flex items-center gap-2">
        <ThemeToggle />
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="rounded-full">
              <Avatar className="h-8 w-8">
                <AvatarImage src={user?.image || ""} alt={user?.name || ""} />
                <AvatarFallback>{userInitials}</AvatarFallback>
              </Avatar>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>My Account</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem>
              <Link href="/dashboard/profile" className="flex w-full">
                Profile
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem>
              <Link href="/dashboard/settings" className="flex w-full">
                Settings
              </Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={() => signOut({ callbackUrl: "/" })}
              className="cursor-pointer"
            >
              Log out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
