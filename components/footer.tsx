import Link from "next/link";
import { Container } from "@/components/ui/container";

export function Footer() {
  return (
    <footer className="border-t bg-background">
      <Container>
        <div className="grid grid-cols-1 gap-8 py-10 md:grid-cols-4 lg:py-16">
          <div className="flex flex-col gap-2">
            <h3 className="text-lg font-semibold">ModernSaaS</h3>
            <p className="text-sm text-muted-foreground">
              A clean, modern full-stack boilerplate for SaaS applications
            </p>
          </div>
          <div className="flex flex-col gap-2">
            <h3 className="text-lg font-semibold">Resources</h3>
            <nav className="flex flex-col gap-2">
              <Link href="#" className="text-sm hover:underline">
                Documentation
              </Link>
              <Link href="#" className="text-sm hover:underline">
                Guides
              </Link>
              <Link href="#" className="text-sm hover:underline">
                Support
              </Link>
              <Link href="#" className="text-sm hover:underline">
                API
              </Link>
            </nav>
          </div>
          <div className="flex flex-col gap-2">
            <h3 className="text-lg font-semibold">Company</h3>
            <nav className="flex flex-col gap-2">
              <Link href="#" className="text-sm hover:underline">
                About
              </Link>
              <Link href="#" className="text-sm hover:underline">
                Blog
              </Link>
              <Link href="#" className="text-sm hover:underline">
                Careers
              </Link>
              <Link href="#" className="text-sm hover:underline">
                Contact
              </Link>
            </nav>
          </div>
          <div className="flex flex-col gap-2">
            <h3 className="text-lg font-semibold">Legal</h3>
            <nav className="flex flex-col gap-2">
              <Link href="#" className="text-sm hover:underline">
                Terms
              </Link>
              <Link href="#" className="text-sm hover:underline">
                Privacy
              </Link>
              <Link href="#" className="text-sm hover:underline">
                Cookies
              </Link>
              <Link href="#" className="text-sm hover:underline">
                Licenses
              </Link>
            </nav>
          </div>
        </div>
        <div className="flex flex-col gap-4 border-t py-6 md:flex-row md:items-center md:justify-between md:py-8">
          <p className="text-sm text-muted-foreground">
            &copy; {new Date().getFullYear()} ModernSaaS. All rights reserved.
          </p>
          <div className="flex gap-4">
            <Link
              href="#"
              className="text-sm text-muted-foreground hover:underline"
            >
              Privacy
            </Link>
            <Link
              href="#"
              className="text-sm text-muted-foreground hover:underline"
            >
              Terms
            </Link>
          </div>
        </div>
      </Container>
    </footer>
  );
}
