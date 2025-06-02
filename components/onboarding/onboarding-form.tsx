"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { toast } from "sonner";

const formSchema = z.object({
  chronotype: z.enum(["EARLY_BIRD", "NIGHT_OWL", "INTERMEDIATE"]),
  workStartTime: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/),
  workEndTime: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/),
  focusBlockDuration: z.number().min(30).max(120),
  breakDuration: z.number().min(5).max(30),
  calendarIntegration: z.boolean(),
});

type FormData = z.infer<typeof formSchema>;

const steps = [
  {
    id: "chronotype",
    name: "Chronotype",
    fields: ["chronotype"],
  },
  {
    id: "schedule",
    name: "Work Schedule",
    fields: ["workStartTime", "workEndTime"],
  },
  {
    id: "duration",
    name: "Focus Duration",
    fields: ["focusBlockDuration", "breakDuration"],
  },
  {
    id: "integration",
    name: "Calendar Integration",
    fields: ["calendarIntegration"],
  },
];

export function OnboardingForm() {
  const [currentStep, setCurrentStep] = useState(0);
  const router = useRouter();
  
  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      chronotype: "INTERMEDIATE",
      workStartTime: "09:00",
      workEndTime: "17:00",
      focusBlockDuration: 90,
      breakDuration: 20,
      calendarIntegration: false,
    },
  });

  async function onSubmit(data: FormData) {
    try {
      const answers = [
        { question: "chronotype", answer: data.chronotype },
        { question: "workStartTime", answer: data.workStartTime },
        { question: "workEndTime", answer: data.workEndTime },
        { question: "focusBlockDuration", answer: data.focusBlockDuration.toString() },
        { question: "breakDuration", answer: data.breakDuration.toString() },
        { question: "calendarIntegration", answer: data.calendarIntegration.toString() },
      ];

      // Get the current origin to handle different ports in development
      const baseUrl = window.location.origin;
      const response = await fetch(`${baseUrl}/api/onboarding`, {
        method: "POST",
        headers: { 
          "Content-Type": "application/json"
        },
        credentials: "include",
        body: JSON.stringify({ answers }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `Failed to save preferences: ${response.status}`);
      }

      toast.success("Preferences saved successfully!");
      router.push("/dashboard");
    } catch (error) {
      console.error("Onboarding error:", error);
      toast.error(error instanceof Error ? error.message : "Something went wrong. Please try again.");
    }
  }

  const currentFields = steps[currentStep].fields;

  return (
    <Card className="p-6">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <div className="space-y-4">
            {/* Step indicator */}
            <div className="flex justify-between mb-8">
              {steps.map((step, index) => (
                <div
                  key={step.id}
                  className={`flex items-center ${
                    index !== steps.length - 1 &&
                    "after:content-[''] after:w-full after:h-[2px] after:bg-muted after:mx-2"
                  }`}
                >
                  <div
                    className={`rounded-full w-8 h-8 flex items-center justify-center text-sm font-medium ${
                      index <= currentStep
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted text-muted-foreground"
                    }`}
                  >
                    {index + 1}
                  </div>
                </div>
              ))}
            </div>

            {/* Chronotype Step */}
            {currentStep === 0 && (
              <FormField
                control={form.control}
                name="chronotype"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>When are you most productive?</FormLabel>
                    <FormControl>
                      <RadioGroup
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                        className="grid grid-cols-3 gap-4"
                      >
                        <FormItem>
                          <FormControl>
                            <RadioGroupItem
                              value="EARLY_BIRD"
                              className="peer sr-only"
                            />
                          </FormControl>
                          <FormLabel className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-transparent p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary">
                            <span>Early Bird</span>
                            <span className="text-sm text-muted-foreground">
                              Morning person
                            </span>
                          </FormLabel>
                        </FormItem>
                        <FormItem>
                          <FormControl>
                            <RadioGroupItem
                              value="INTERMEDIATE"
                              className="peer sr-only"
                            />
                          </FormControl>
                          <FormLabel className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-transparent p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary">
                            <span>Intermediate</span>
                            <span className="text-sm text-muted-foreground">
                              Flexible
                            </span>
                          </FormLabel>
                        </FormItem>
                        <FormItem>
                          <FormControl>
                            <RadioGroupItem
                              value="NIGHT_OWL"
                              className="peer sr-only"
                            />
                          </FormControl>
                          <FormLabel className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-transparent p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary">
                            <span>Night Owl</span>
                            <span className="text-sm text-muted-foreground">
                              Evening person
                            </span>
                          </FormLabel>
                        </FormItem>
                      </RadioGroup>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            {/* Work Schedule Step */}
            {currentStep === 1 && (
              <>
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
              </>
            )}

            {/* Focus Duration Step */}
            {currentStep === 2 && (
              <>
                <FormField
                  control={form.control}
                  name="focusBlockDuration"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Focus Block Duration (minutes)</FormLabel>
                      <FormControl>
                        <Select
                          onValueChange={(value) => field.onChange(Number(value))}
                          defaultValue={field.value.toString()}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select duration" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="60">60 minutes</SelectItem>
                            <SelectItem value="90">90 minutes</SelectItem>
                            <SelectItem value="120">120 minutes</SelectItem>
                          </SelectContent>
                        </Select>
                      </FormControl>
                      <FormDescription>
                        Recommended: 90 minutes (based on ultradian rhythm)
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
                        <Select
                          onValueChange={(value) => field.onChange(Number(value))}
                          defaultValue={field.value.toString()}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select duration" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="15">15 minutes</SelectItem>
                            <SelectItem value="20">20 minutes</SelectItem>
                            <SelectItem value="30">30 minutes</SelectItem>
                          </SelectContent>
                        </Select>
                      </FormControl>
                      <FormDescription>
                        Recommended: 20 minutes for optimal recovery
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </>
            )}

            {/* Calendar Integration Step */}
            {currentStep === 3 && (
              <FormField
                control={form.control}
                name="calendarIntegration"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Would you like to sync with your calendar?</FormLabel>
                    <FormControl>
                      <RadioGroup
                        onValueChange={(value) => field.onChange(value === "true")}
                        defaultValue={field.value.toString()}
                        className="grid grid-cols-2 gap-4"
                      >
                        <FormItem>
                          <FormControl>
                            <RadioGroupItem
                              value="true"
                              className="peer sr-only"
                            />
                          </FormControl>
                          <FormLabel className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-transparent p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary">
                            <span>Yes, sync calendar</span>
                            <span className="text-sm text-muted-foreground">
                              Integrate with Google Calendar
                            </span>
                          </FormLabel>
                        </FormItem>
                        <FormItem>
                          <FormControl>
                            <RadioGroupItem
                              value="false"
                              className="peer sr-only"
                            />
                          </FormControl>
                          <FormLabel className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-transparent p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary">
                            <span>No, skip for now</span>
                            <span className="text-sm text-muted-foreground">
                              Set up later
                            </span>
                          </FormLabel>
                        </FormItem>
                      </RadioGroup>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}
          </div>

          <div className="flex justify-between">
            <Button
              type="button"
              variant="outline"
              onClick={() => setCurrentStep((step) => step - 1)}
              disabled={currentStep === 0}
            >
              Previous
            </Button>
            <Button
              type={currentStep === steps.length - 1 ? "submit" : "button"}
              onClick={() => {
                if (currentStep < steps.length - 1) {
                  const fieldsToValidate = steps[currentStep].fields;
                  form.trigger(fieldsToValidate as any).then((isValid) => {
                    if (isValid) {
                      setCurrentStep((step) => step + 1);
                    }
                  });
                }
              }}
            >
              {currentStep === steps.length - 1 ? "Complete Setup" : "Next"}
            </Button>
          </div>
        </form>
      </Form>
    </Card>
  );
} 