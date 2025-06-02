import Link from "next/link";
import { ChevronRight, Rocket, Shield, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { MainNav } from "@/components/main-nav";
import { Footer } from "@/components/footer";
import { Container } from "@/components/ui/container";

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col">
      <MainNav />
      <main className="flex-1">
        {/* Hero Section */}
        <section className="w-full py-12 md:py-24 lg:py-32 bg-gradient-to-b from-background to-muted/20">
          <Container>
            <div className="grid gap-10 lg:grid-cols-2 lg:gap-16 items-center">
              <div className="space-y-6">
                <div className="inline-block rounded-lg bg-muted px-3 py-1 text-sm">
                  Introducing Modern SaaS Starter
                </div>
                <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl xl:text-6xl">
                  Build Faster, Scale Better
                </h1>
                <p className="max-w-[600px] text-muted-foreground md:text-xl">
                  A clean, modern full-stack boilerplate for building SaaS
                  applications with beautiful UI and type-safe backend.
                </p>
                <div className="flex flex-col gap-4 sm:flex-row">
                  <Button asChild size="lg" className="gap-2">
                    <Link href="/dashboard">
                      Get Started
                      <ChevronRight className="h-4 w-4" />
                    </Link>
                  </Button>
                  <Button asChild variant="outline" size="lg">
                    <Link href="/auth/login">Sign In</Link>
                  </Button>
                </div>
              </div>
              <div className="rounded-lg border bg-background p-8 shadow-sm">
                <div className="aspect-video w-full rounded-lg bg-gradient-to-br from-primary/20 via-secondary/20 to-accent/20 flex items-center justify-center">
                  <span className="text-4xl font-bold">Modern SaaS</span>
                </div>
              </div>
            </div>
          </Container>
        </section>

        {/* Features Section */}
        <section className="w-full py-12 md:py-24 lg:py-32">
          <Container>
            <div className="mx-auto flex max-w-[58rem] flex-col items-center space-y-4 text-center">
              <h2 className="font-bold text-3xl leading-[1.1] sm:text-3xl md:text-5xl">
                Features that power your product
              </h2>
              <p className="max-w-[85%] leading-normal text-muted-foreground sm:text-lg sm:leading-7">
                Everything you need to build modern web applications
              </p>
            </div>
            <div className="mx-auto grid gap-6 py-12 md:grid-cols-3">
              <div className="flex flex-col items-center space-y-4 rounded-lg border p-6 shadow-sm transition-all hover:shadow-md">
                <div className="rounded-full bg-primary/10 p-3">
                  <Rocket className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-xl font-bold">Lightning Fast</h3>
                <p className="text-center text-muted-foreground">
                  Optimized performance with Next.js App Router and React Server
                  Components
                </p>
              </div>
              <div className="flex flex-col items-center space-y-4 rounded-lg border p-6 shadow-sm transition-all hover:shadow-md">
                <div className="rounded-full bg-primary/10 p-3">
                  <Shield className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-xl font-bold">Type-Safe API</h3>
                <p className="text-center text-muted-foreground">
                  End-to-end type safety with tRPC, Prisma, and TypeScript
                </p>
              </div>
              <div className="flex flex-col items-center space-y-4 rounded-lg border p-6 shadow-sm transition-all hover:shadow-md">
                <div className="rounded-full bg-primary/10 p-3">
                  <Zap className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-xl font-bold">Beautiful UI</h3>
                <p className="text-center text-muted-foreground">
                  Modern, accessible components with shadcn/ui and Tailwind CSS
                </p>
              </div>
            </div>
          </Container>
        </section>

        {/* CTA Section */}
        <section className="w-full py-12 md:py-24 lg:py-32 bg-muted/50">
          <Container>
            <div className="mx-auto max-w-3xl space-y-6 text-center">
              <h2 className="font-bold text-3xl leading-[1.1] sm:text-3xl md:text-5xl">
                Ready to get started?
              </h2>
              <p className="leading-normal text-muted-foreground sm:text-lg sm:leading-7">
                Join thousands of developers building amazing products with our
                starter.
              </p>
              <div className="mx-auto flex flex-col gap-4 sm:flex-row sm:justify-center">
                <Button asChild size="lg">
                  <Link href="/auth/register">Sign up now</Link>
                </Button>
                <Button asChild variant="outline" size="lg">
                  <Link href="/">Learn more</Link>
                </Button>
              </div>
            </div>
          </Container>
        </section>
      </main>
      <Footer />
    </div>
  );
}
