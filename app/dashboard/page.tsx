import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Container } from "@/components/ui/container";
import { getCurrentUser } from "@/lib/auth";

export default async function DashboardPage() {
  const user = await getCurrentUser();

  return (
    <Container>
      <div className="flex flex-col gap-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground">
            Welcome back, {user?.name || "User"}
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle>Activity</CardTitle>
              <CardDescription>Your activity this month</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">12 sessions</div>
              <p className="text-xs text-muted-foreground">
                +8% from last month
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle>Usage</CardTitle>
              <CardDescription>Your usage metrics</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">82%</div>
              <p className="text-xs text-muted-foreground">
                +12% from last month
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle>Status</CardTitle>
              <CardDescription>Your account status</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">Active</div>
              <p className="text-xs text-muted-foreground">
                Since {new Date().toLocaleDateString()}
              </p>
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-1">
          <Card>
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
              <CardDescription>Your recent actions and updates</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[1, 2, 3].map((_, i) => (
                  <div
                    key={i}
                    className="flex items-center gap-4 rounded-lg border p-4"
                  >
                    <div className="flex-1 space-y-1">
                      <p className="text-sm font-medium">
                        {i === 0
                          ? "Profile updated"
                          : i === 1
                            ? "Settings changed"
                            : "Logged in from new device"}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {new Date(
                          Date.now() - i * 24 * 60 * 60 * 1000,
                        ).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
            <CardFooter>
              <p className="text-sm text-muted-foreground">
                Showing recent activity from the last 3 days
              </p>
            </CardFooter>
          </Card>
        </div>
      </div>
    </Container>
  );
}
