import Link from "next/link";
import {
  ChevronRight,
  Brain,
  Clock,
  Calendar,
  LineChart,
  Sparkles,
  Leaf,
  Play,
  CheckCircle,
} from "lucide-react";
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
        <section className="w-full py-20 sm:py-32 bg-gradient-to-br from-background via-blue-50/20 to-emerald-50/20 dark:from-background dark:via-blue-950/20 dark:to-emerald-950/20 relative overflow-hidden">
          <div className="absolute inset-0 bg-[url('/wave-pattern.svg')] opacity-10 dark:opacity-5"></div>
          <Container>
            <div className="grid gap-10 lg:grid-cols-2 lg:gap-16 items-center">
              <div className="space-y-8 relative z-10">
                <div className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-energy-green/10 text-energy-green border border-energy-green/20">
                  <Leaf className="mr-2 h-4 w-4" />
                  Science-Based Productivity
                </div>
                <h1 className="text-4xl font-bold tracking-tighter sm:text-5xl xl:text-6xl/none bg-clip-text text-transparent bg-gradient-to-r from-[#059669] via-[#0284c7] to-[#7c3aed] dark:from-[#34d399] dark:via-[#60a5fa] dark:to-[#a78bfa] animate-glow">
                  Work with your natural rhythms
                </h1>
                <p className="max-w-[600px] text-muted-foreground text-xl">
                  Ultradian helps you optimize your workday by aligning with
                  your body&apos;s natural energy cycles. Maximize focus,
                  minimize burnout, and achieve more with less effort.
                </p>
                <div className="flex flex-col gap-4 sm:flex-row">
                  <Button
                    size="lg"
                    className="gap-2 bg-gradient-to-r from-energy-green to-calm-blue hover:opacity-90"
                  >
                    <Link href="/auth/register" className="flex items-center">
                      Start Your Journey
                      <ChevronRight className="h-4 w-4" />
                    </Link>
                  </Button>
                  <Button variant="outline" size="lg" className="gap-2">
                    <Play className="h-4 w-4" />
                    Watch Demo
                  </Button>
                </div>
                <div className="flex flex-wrap gap-6 text-sm text-muted-foreground">
                  <div className="flex items-center">
                    <CheckCircle className="text-energy-green mr-2 h-4 w-4" />
                    Free 14-day trial
                  </div>
                  <div className="flex items-center">
                    <CheckCircle className="text-energy-green mr-2 h-4 w-4" />
                    No credit card required
                  </div>
                  <div className="flex items-center">
                    <CheckCircle className="text-energy-green mr-2 h-4 w-4" />
                    Cancel anytime
                  </div>
                </div>
              </div>
              <div className="relative">
                <div className="aspect-video w-full rounded-2xl bg-gradient-to-br from-primary/20 via-secondary/20 to-accent/20 p-2 backdrop-blur-sm border border-white/10 shadow-2xl animate-float">
                  <div className="absolute inset-0 bg-grid-white/10 [mask-image:radial-gradient(white,transparent_70%)] dark:bg-grid-dark/10"></div>
                  <div className="relative h-full rounded-xl bg-background/95 p-6 flex items-center justify-center">
                    <div className="text-center space-y-4">
                      <Clock className="h-16 w-16 mx-auto text-primary animate-pulse" />
                      <div className="space-y-2">
                        <h3 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-[#059669] via-[#0284c7] to-[#7c3aed] dark:from-[#34d399] dark:via-[#60a5fa] dark:to-[#a78bfa]">
                          Ultradian
                        </h3>
                        <p className="text-muted-foreground">
                          90/20 Focus Cycle
                        </p>
                      </div>
                    </div>
                  </div>
                  <div
                    className="absolute -top-4 -right-4 bg-white dark:bg-gray-800 rounded-xl shadow-lg p-4 border border-border animate-float"
                    style={{ animationDelay: "0.5s" }}
                  >
                    <div className="flex items-center space-x-3">
                      <div className="w-3 h-3 bg-energy-green rounded-full animate-pulse"></div>
                      <span className="text-sm font-medium">
                        Peak Focus Time
                      </span>
                    </div>
                    <div className="text-xs text-muted-foreground mt-1">
                      90 min deep work block
                    </div>
                  </div>
                  <div
                    className="absolute -bottom-4 -left-4 bg-white dark:bg-gray-800 rounded-xl shadow-lg p-4 border border-border animate-float"
                    style={{ animationDelay: "1s" }}
                  >
                    <div className="flex items-center space-x-3">
                      <div className="w-3 h-3 bg-calm-blue rounded-full animate-pulse"></div>
                      <span className="text-sm font-medium">Rest Period</span>
                    </div>
                    <div className="text-xs text-muted-foreground mt-1">
                      20 min recovery break
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </Container>
        </section>

        {/* Features Section */}
        <section className="w-full py-20 sm:py-32">
          <Container>
            <div className="mx-auto flex max-w-[58rem] flex-col items-center space-y-4 text-center">
              <h2 className="font-bold text-3xl leading-[1.1] sm:text-3xl md:text-5xl">
                Optimize Your{" "}
                <span className="bg-clip-text text-transparent bg-gradient-to-r from-[#059669] via-[#0284c7] to-[#7c3aed] dark:from-[#34d399] dark:via-[#60a5fa] dark:to-[#a78bfa]">
                  Productivity Flow
                </span>
              </h2>
              <p className="max-w-[85%] leading-normal text-muted-foreground sm:text-lg sm:leading-7">
                Harness the power of your natural ultradian rhythm for peak
                performance
              </p>
            </div>
            <div className="mx-auto grid gap-8 py-12 md:grid-cols-4">
              <div className="group relative overflow-hidden rounded-lg border bg-background p-6 shadow-md transition-all hover:shadow-xl">
                <div className="absolute inset-0 bg-gradient-to-r from-energy-green/10 to-transparent opacity-0 transition-opacity group-hover:opacity-100"></div>
                <div className="relative space-y-4">
                  <div className="rounded-full bg-energy-green/10 p-3 w-fit">
                    <Brain className="h-6 w-6 text-energy-green" />
                  </div>
                  <h3 className="text-xl font-bold">Smart Scheduling</h3>
                  <p className="text-muted-foreground">
                    AI-powered daily schedules based on your energy patterns
                  </p>
                </div>
              </div>
              <div className="group relative overflow-hidden rounded-lg border bg-background p-6 shadow-md transition-all hover:shadow-xl">
                <div className="absolute inset-0 bg-gradient-to-r from-calm-blue/10 to-transparent opacity-0 transition-opacity group-hover:opacity-100"></div>
                <div className="relative space-y-4">
                  <div className="rounded-full bg-calm-blue/10 p-3 w-fit">
                    <Clock className="h-6 w-6 text-calm-blue" />
                  </div>
                  <h3 className="text-xl font-bold">Focus Tracking</h3>
                  <p className="text-muted-foreground">
                    90-minute deep work blocks with optimized break periods
                  </p>
                </div>
              </div>
              <div className="group relative overflow-hidden rounded-lg border bg-background p-6 shadow-md transition-all hover:shadow-xl">
                <div className="absolute inset-0 bg-gradient-to-r from-premium-violet/10 to-transparent opacity-0 transition-opacity group-hover:opacity-100"></div>
                <div className="relative space-y-4">
                  <div className="rounded-full bg-premium-violet/10 p-3 w-fit">
                    <Calendar className="h-6 w-6 text-premium-violet" />
                  </div>
                  <h3 className="text-xl font-bold">Calendar Sync</h3>
                  <p className="text-muted-foreground">
                    Seamless integration with your existing calendar
                  </p>
                </div>
              </div>
              <div className="group relative overflow-hidden rounded-lg border bg-background p-6 shadow-md transition-all hover:shadow-xl">
                <div className="absolute inset-0 bg-gradient-to-r from-energy-green/10 to-transparent opacity-0 transition-opacity group-hover:opacity-100"></div>
                <div className="relative space-y-4">
                  <div className="rounded-full bg-energy-green/10 p-3 w-fit">
                    <LineChart className="h-6 w-6 text-energy-green" />
                  </div>
                  <h3 className="text-xl font-bold">Analytics</h3>
                  <p className="text-muted-foreground">
                    Track your productivity trends and improvements
                  </p>
                </div>
              </div>
            </div>
          </Container>
        </section>

        {/* Premium Features Section */}
        <section className="w-full py-20 sm:py-32 bg-muted/50">
          <Container>
            <div className="mx-auto flex max-w-[58rem] flex-col items-center space-y-4 text-center mb-12">
              <div className="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 border-transparent bg-premium-violet text-white">
                <Sparkles className="mr-2 h-4 w-4" />
                Premium Features
              </div>
              <h2 className="font-bold text-3xl leading-[1.1] sm:text-3xl md:text-5xl">
                Unlock Your{" "}
                <span className="bg-clip-text text-transparent bg-gradient-to-r from-[#7c3aed] to-[#0284c7] dark:from-[#a78bfa] dark:to-[#60a5fa]">
                  Full Potential
                </span>
              </h2>
              <p className="max-w-[85%] leading-normal text-muted-foreground sm:text-lg sm:leading-7">
                Take your productivity to the next level with our premium
                features
              </p>
            </div>
            <div className="grid gap-8 lg:grid-cols-3">
              <div className="group relative overflow-hidden rounded-xl border-2 border-muted p-6 shadow-sm transition-all hover:shadow-xl hover:border-premium-violet/50">
                <div className="absolute inset-0 bg-gradient-to-br from-premium-violet/10 via-transparent to-transparent opacity-0 transition-opacity group-hover:opacity-100"></div>
                <div className="relative space-y-4">
                  <h3 className="text-xl font-bold">AI Weekly Review</h3>
                  <p className="text-muted-foreground">
                    Personalized insights and recommendations based on your
                    performance
                  </p>
                </div>
              </div>
              <div className="group relative overflow-hidden rounded-xl border-2 border-muted p-6 shadow-sm transition-all hover:shadow-xl hover:border-calm-blue/50">
                <div className="absolute inset-0 bg-gradient-to-br from-calm-blue/10 via-transparent to-transparent opacity-0 transition-opacity group-hover:opacity-100"></div>
                <div className="relative space-y-4">
                  <h3 className="text-xl font-bold">Focus Soundscapes</h3>
                  <p className="text-muted-foreground">
                    AI-generated ambient playlists to enhance your focus
                    sessions
                  </p>
                </div>
              </div>
              <div className="group relative overflow-hidden rounded-xl border-2 border-muted p-6 shadow-sm transition-all hover:shadow-xl hover:border-energy-green/50">
                <div className="absolute inset-0 bg-gradient-to-br from-energy-green/10 via-transparent to-transparent opacity-0 transition-opacity group-hover:opacity-100"></div>
                <div className="relative space-y-4">
                  <h3 className="text-xl font-bold">Wearable Integration</h3>
                  <p className="text-muted-foreground">
                    Connect your favorite fitness devices for enhanced tracking
                  </p>
                </div>
              </div>
            </div>
          </Container>
        </section>

        {/* CTA Section */}
        <section className="w-full py-20 sm:py-32">
          <Container>
            <div className="mx-auto max-w-3xl space-y-8 text-center">
              <h2 className="font-bold text-3xl leading-[1.1] sm:text-3xl md:text-5xl">
                Ready to Transform Your{" "}
                <span className="bg-clip-text text-transparent bg-gradient-to-r from-[#059669] via-[#0284c7] to-[#7c3aed] dark:from-[#34d399] dark:via-[#60a5fa] dark:to-[#a78bfa]">
                  Workday
                </span>
                ?
              </h2>
              <p className="leading-normal text-muted-foreground sm:text-lg sm:leading-7">
                Join thousands of professionals who have discovered their
                optimal work rhythm with Ultradian.
              </p>
              <div className="mx-auto flex flex-col gap-4 sm:flex-row sm:justify-center">
                <Button
                  size="lg"
                  className="gap-2 bg-gradient-to-r from-energy-green to-calm-blue hover:opacity-90"
                >
                  <Link href="/auth/register" className="flex items-center">
                    Get Started Free
                    <ChevronRight className="h-4 w-4" />
                  </Link>
                </Button>
                <Button variant="outline" size="lg" className="gap-2">
                  <Link href="#features">Learn More</Link>
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
