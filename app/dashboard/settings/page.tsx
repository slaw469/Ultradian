"use client";

import { useEffect, useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Container } from "@/components/ui/container";
import { toast } from "@/components/ui/use-toast";
import { trpc } from "@/lib/trpc/client";
import { useSession } from "next-auth/react";
import { ReAuthModal } from "@/components/settings/reauth-modal";

const settingsSchema = z.object({
  marketingEmails: z.boolean().default(false),
  securityEmails: z.boolean().default(true),
  calendarSync: z.boolean().default(false),
  focusBlockDuration: z.number().min(15).max(180),
  breakDuration: z.number().min(5).max(60),
  workStartTime: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/),
  workEndTime: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/),
});

type SettingsFormValues = z.infer<typeof settingsSchema>;

export default function SettingsPage() {
  const { data: session } = useSession();
  const utils = trpc.useUtils();
  const [showReAuthModal, setShowReAuthModal] = useState(false);
  
  const { data: userSettings, isLoading: isLoadingSettings } = trpc.user.getSettings.useQuery();
  const { data: calendarPermissions } = trpc.calendar.checkPermissions.useQuery();
  
  const updateSettings = trpc.user.updateSettings.useMutation({
    onSuccess: () => {
      utils.user.getSettings.invalidate();
      toast({
        title: "Settings updated",
        description: "Your settings have been saved successfully.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const toggleCalendarSync = trpc.calendar.toggleSync.useMutation({
    onSuccess: () => {
      utils.user.getSettings.invalidate();
      toast({
        title: "Calendar sync settings updated",
        description: "Your calendar preferences have been saved.",
      });
    },
    onError: (error) => {
      if (error.message === "Calendar permissions required") {
        setShowReAuthModal(true);
      } else {
        toast({
          title: "Error",
          description: error.message,
          variant: "destructive",
        });
      }
    },
  });

  const form = useForm<SettingsFormValues>({
    resolver: zodResolver(settingsSchema),
    defaultValues: {
      marketingEmails: false,
      securityEmails: true,
      calendarSync: false,
      focusBlockDuration: 90,
      breakDuration: 20,
      workStartTime: "09:00",
      workEndTime: "17:00",
    },
  });

  useEffect(() => {
    if (userSettings) {
      form.reset({
        ...form.getValues(),
        calendarSync: userSettings.calendarConnected,
        focusBlockDuration: userSettings.focusBlockDuration,
        breakDuration: userSettings.breakDuration,
        workStartTime: userSettings.workStartTime || "09:00",
        workEndTime: userSettings.workEndTime || "17:00",
      });
    }
  }, [userSettings, form]);

  function onSubmit(data: SettingsFormValues) {
    // Handle calendar sync separately
    if (data.calendarSync !== userSettings?.calendarConnected) {
      if (data.calendarSync && !calendarPermissions?.hasPermissions) {
        setShowReAuthModal(true);
        return;
      }
      toggleCalendarSync.mutate({ enabled: data.calendarSync });
    }

    // Update other settings
    updateSettings.mutate({
      focusBlockDuration: data.focusBlockDuration,
      breakDuration: data.breakDuration,
      workStartTime: data.workStartTime,
      workEndTime: data.workEndTime,
    });
  }

  if (isLoadingSettings) {
    return (
      <Container size="md">
        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
            <p className="text-muted-foreground">Loading settings...</p>
          </div>
        </div>
      </Container>
    );
  }

  return (
    <>
      <Container size="md">
        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
            <p className="text-muted-foreground">
              Manage your account settings and preferences
            </p>
          </div>
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Focus Block Settings</CardTitle>
                <CardDescription>
                  Configure your focus and break durations
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Form {...form}>
                  <form
                    onSubmit={form.handleSubmit(onSubmit)}
                    className="space-y-8"
                  >
                    <FormField
                      control={form.control}
                      name="focusBlockDuration"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Focus Block Duration (minutes)</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              min={15}
                              max={180}
                              {...field}
                              onChange={(e) => field.onChange(parseInt(e.target.value))}
                            />
                          </FormControl>
                          <FormDescription>
                            Recommended: 90 minutes for optimal focus
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="breakDuration"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Break Duration (minutes)</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              min={5}
                              max={60}
                              {...field}
                              onChange={(e) => field.onChange(parseInt(e.target.value))}
                            />
                          </FormControl>
                          <FormDescription>
                            Recommended: 20 minutes for optimal recovery
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="workStartTime"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Work Start Time</FormLabel>
                          <FormControl>
                            <Input type="time" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="workEndTime"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Work End Time</FormLabel>
                          <FormControl>
                            <Input type="time" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <Button type="submit" disabled={updateSettings.isLoading}>
                      Save Focus Settings
                    </Button>
                  </form>
                </Form>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Calendar Integration</CardTitle>
                <CardDescription>
                  Sync your focus blocks with Google Calendar
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Form {...form}>
                  <form
                    onSubmit={form.handleSubmit(onSubmit)}
                    className="space-y-8"
                  >
                    <FormField
                      control={form.control}
                      name="calendarSync"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                          <div className="space-y-0.5">
                            <FormLabel className="text-base">
                              Google Calendar Sync
                            </FormLabel>
                            <FormDescription>
                              Automatically sync your focus blocks with Google Calendar
                            </FormDescription>
                          </div>
                          <FormControl>
                            <Switch
                              checked={field.value}
                              onCheckedChange={field.onChange}
                              disabled={toggleCalendarSync.isLoading}
                            />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                    <Button 
                      type="submit" 
                      disabled={toggleCalendarSync.isLoading}
                    >
                      Save Calendar Settings
                    </Button>
                  </form>
                </Form>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Email Notifications</CardTitle>
                <CardDescription>
                  Configure which emails you want to receive
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Form {...form}>
                  <form
                    onSubmit={form.handleSubmit(onSubmit)}
                    className="space-y-8"
                  >
                    <FormField
                      control={form.control}
                      name="marketingEmails"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                          <div className="space-y-0.5">
                            <FormLabel className="text-base">
                              Marketing emails
                            </FormLabel>
                            <FormDescription>
                              Receive emails about new features and updates
                            </FormDescription>
                          </div>
                          <FormControl>
                            <Switch
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="securityEmails"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                          <div className="space-y-0.5">
                            <FormLabel className="text-base">
                              Security emails
                            </FormLabel>
                            <FormDescription>
                              Receive important security notifications
                            </FormDescription>
                          </div>
                          <FormControl>
                            <Switch
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                    <Button type="submit">Save Email Settings</Button>
                  </form>
                </Form>
              </CardContent>
            </Card>
          </div>
        </div>
      </Container>
      <ReAuthModal
        open={showReAuthModal}
        onOpenChange={setShowReAuthModal}
        onSuccess={() => {
          utils.calendar.checkPermissions.invalidate();
          const formValues = form.getValues();
          toggleCalendarSync.mutate({ enabled: formValues.calendarSync });
        }}
      />
    </>
  );
}
