import { useState } from 'react';
import { useSession } from 'next-auth/react';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';

export function CalendarSettings() {
  const { data: session } = useSession();
  const [isLoading, setIsLoading] = useState(false);

  const handleConnect = async () => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/auth/google-calendar');
      const data = await response.json();
      
      if (data.url) {
        // Open Google OAuth consent screen in a popup
        const width = 600;
        const height = 600;
        const left = window.screenX + (window.outerWidth - width) / 2;
        const top = window.screenY + (window.outerHeight - height) / 2;
        
        window.open(
          data.url,
          'Connect Google Calendar',
          `width=${width},height=${height},left=${left},top=${top}`
        );
      }
    } catch (error) {
      console.error('Error connecting calendar:', error);
      toast.error('Failed to connect calendar');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDisconnect = async () => {
    try {
      setIsLoading(true);
      await fetch('/api/auth/google-calendar/disconnect', {
        method: 'POST',
      });
      toast.success('Calendar disconnected successfully');
    } catch (error) {
      console.error('Error disconnecting calendar:', error);
      toast.error('Failed to disconnect calendar');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Calendar Integration</CardTitle>
        <CardDescription>
          Sync your focus blocks with Google Calendar
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <h3 className="text-base font-medium">Google Calendar</h3>
            <p className="text-sm text-muted-foreground">
              {session?.user?.calendarConnected
                ? 'Your calendar is connected'
                : 'Connect your calendar to sync focus blocks'}
            </p>
          </div>
          {isLoading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : session?.user?.calendarConnected ? (
            <Button
              variant="destructive"
              size="sm"
              onClick={handleDisconnect}
            >
              Disconnect
            </Button>
          ) : (
            <Button
              variant="outline"
              size="sm"
              onClick={handleConnect}
            >
              Connect
            </Button>
          )}
        </div>

        {session?.user?.calendarConnected && (
          <div className="flex items-center space-x-2">
            <Switch
              id="calendar-sync"
              defaultChecked={true}
              onCheckedChange={(checked) => {
                // TODO: Implement sync toggle logic
                toast.success(
                  checked
                    ? 'Calendar sync enabled'
                    : 'Calendar sync disabled'
                );
              }}
            />
            <label
              htmlFor="calendar-sync"
              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
            >
              Enable calendar sync
            </label>
          </div>
        )}
      </CardContent>
    </Card>
  );
} 