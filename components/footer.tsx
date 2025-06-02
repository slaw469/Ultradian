import Link from "next/link";
import { Container } from "@/components/ui/container";
import { Brain } from "lucide-react";

export function Footer() {
  return (
    <footer className="border-t bg-background">
      <Container>
        <div className="grid grid-cols-1 gap-8 py-10 md:grid-cols-4 lg:py-16">
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-2">
              <Brain className="h-5 w-5 text-primary" />
              <h3 className="text-lg font-semibold">Ultradian</h3>
            </div>
            <p className="text-sm text-muted-foreground">
              Your personal deep work coach for optimal productivity and
              well-being
            </p>
          </div>
          <div className="flex flex-col gap-2">
            <h3 className="text-lg font-semibold">Product</h3>
            <nav className="flex flex-col gap-2">
              <Link href="/features" className="text-sm hover:underline">
                Features
              </Link>
              <Link href="/pricing" className="text-sm hover:underline">
                Pricing
              </Link>
              <Link href="/integrations" className="text-sm hover:underline">
                Integrations
              </Link>
              <Link href="/about" className="text-sm hover:underline">
                The Science
              </Link>
            </nav>
          </div>
          <div className="flex flex-col gap-2">
            <h3 className="text-lg font-semibold">Resources</h3>
            <nav className="flex flex-col gap-2">
              <Link href="/blog" className="text-sm hover:underline">
                Blog
              </Link>
              <Link href="/guides" className="text-sm hover:underline">
                Productivity Guides
              </Link>
              <Link href="/research" className="text-sm hover:underline">
                Research
              </Link>
              <Link href="/help" className="text-sm hover:underline">
                Help Center
              </Link>
            </nav>
          </div>
          <div className="flex flex-col gap-2">
            <h3 className="text-lg font-semibold">Company</h3>
            <nav className="flex flex-col gap-2">
              <Link href="/about-us" className="text-sm hover:underline">
                About Us
              </Link>
              <Link href="/careers" className="text-sm hover:underline">
                Careers
              </Link>
              <Link href="/contact" className="text-sm hover:underline">
                Contact
              </Link>
              <Link href="/press" className="text-sm hover:underline">
                Press Kit
              </Link>
            </nav>
          </div>
        </div>
        <div className="flex flex-col gap-4 border-t py-6 md:flex-row md:items-center md:justify-between md:py-8">
          <p className="text-sm text-muted-foreground">
            &copy; {new Date().getFullYear()} Ultradian. All rights reserved.
          </p>
          <div className="flex gap-4">
            <Link
              href="/privacy"
              className="text-sm text-muted-foreground hover:underline"
            >
              Privacy
            </Link>
            <Link
              href="/terms"
              className="text-sm text-muted-foreground hover:underline"
            >
              Terms
            </Link>
            <Link
              href="/cookies"
              className="text-sm text-muted-foreground hover:underline"
            >
              Cookies
            </Link>
          </div>
        </div>
      </Container>
    </footer>
  );
}
