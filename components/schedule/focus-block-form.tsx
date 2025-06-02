"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { format, parse, addMinutes } from "date-fns";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/use-toast";

interface FocusBlockFormProps {
  userId: string;
  focusBlockDuration: number;
  breakDuration: number;
  workStartTime: string;
  workEndTime: string;
}

const formSchema = z.object({
  startTime: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/),
  date: z.string(),
  type: z.enum(["DEEP_WORK", "BREAK"]),
});

type FormData = z.infer<typeof formSchema>;

export function FocusBlockForm({
  userId,
  focusBlockDuration,
  breakDuration,
  workStartTime,
  workEndTime,
}: FocusBlockFormProps) {
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const { toast } = useToast();

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      startTime: workStartTime,
      date: format(new Date(), "yyyy-MM-dd"),
      type: "DEEP_WORK",
    },
  });

  async function onSubmit(data: FormData) {
    setIsLoading(true);

    try {
      const startDateTime = parse(
        `${data.date} ${data.startTime}`,
        "yyyy-MM-dd HH:mm",
        new Date()
      );

      const endDateTime = addMinutes(
        startDateTime,
        data.type === "DEEP_WORK" ? focusBlockDuration : breakDuration
      );

      const response = await fetch("/api/focus-blocks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId,
          startTime: startDateTime.toISOString(),
          endTime: endDateTime.toISOString(),
          type: data.type,
          status: "PLANNED",
        }),
      });

      if (!response.ok) throw new Error("Failed to create focus block");

      toast({
        title: "Success",
        description: "Focus block scheduled successfully",
      });

      router.refresh();
      form.reset();
    } catch (error) {
      toast({
        title: "Error",
        description: "Something went wrong. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Schedule Focus Block</CardTitle>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="date"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Date</FormLabel>
                  <FormControl>
                    <Input type="date" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="startTime"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Start Time</FormLabel>
                  <FormControl>
                    <Input type="time" {...field} />
                  </FormControl>
                  <FormDescription>
                    Work hours: {workStartTime} - {workEndTime}
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="type"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Type</FormLabel>
                  <FormControl>
                    <div className="grid grid-cols-2 gap-4">
                      <Button
                        type="button"
                        variant={field.value === "DEEP_WORK" ? "default" : "outline"}
                        className="w-full"
                        onClick={() => field.onChange("DEEP_WORK")}
                      >
                        Focus ({focusBlockDuration}m)
                      </Button>
                      <Button
                        type="button"
                        variant={field.value === "BREAK" ? "default" : "outline"}
                        className="w-full"
                        onClick={() => field.onChange("BREAK")}
                      >
                        Break ({breakDuration}m)
                      </Button>
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? "Scheduling..." : "Schedule Block"}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
} 