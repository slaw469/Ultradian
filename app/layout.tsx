import "./globals.css";
import type { Metadata } from "next";
import { Providers } from "@/components/providers";
import { Toaster } from "@/components/ui/toaster";

export const metadata: Metadata = {
  title: "Modern SaaS Starter",
  description: "A clean, modern full-stack boilerplate for SaaS applications",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="font-inter">
        <Providers>
          {children}
          <Toaster />
        </Providers>
      </body>
    </html>
  );
}
