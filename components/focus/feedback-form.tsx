"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useToast } from "@/components/ui/use-toast";
import { Loader2 } from "lucide-react";

interface FeedbackFormProps {
  focusBlockId: string;
  type: string;
}

export function FeedbackForm({ focusBlockId, type }: FeedbackFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [energyLevel, setEnergyLevel] = useState<string>("");
  const [focusQuality, setFocusQuality] = useState<string>("");
  const [notes, setNotes] = useState("");
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!energyLevel || !focusQuality) {
      toast({
        title: "Missing Information",
        description: "Please rate your energy level and focus quality.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch("/api/feedback", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          focusBlockId,
          energyLevel: parseInt(energyLevel),
          focusQuality: parseInt(focusQuality),
          notes: notes.trim() || null,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to submit feedback");
      }

      toast({
        title: "Feedback Submitted",
        description: "Thank you for your feedback!",
      });

      // Reset form
      setEnergyLevel("");
      setFocusQuality("");
      setNotes("");
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to submit feedback. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Session Feedback</CardTitle>
        <CardDescription>
          Help us understand how your {type === "DEEP_WORK" ? "focus session" : "break"} went
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-3">
            <Label className="text-sm font-medium">Energy Level</Label>
            <RadioGroup value={energyLevel} onValueChange={setEnergyLevel}>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="1" id="energy-1" />
                <Label htmlFor="energy-1" className="text-sm">1 - Very Low</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="2" id="energy-2" />
                <Label htmlFor="energy-2" className="text-sm">2 - Low</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="3" id="energy-3" />
                <Label htmlFor="energy-3" className="text-sm">3 - Moderate</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="4" id="energy-4" />
                <Label htmlFor="energy-4" className="text-sm">4 - High</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="5" id="energy-5" />
                <Label htmlFor="energy-5" className="text-sm">5 - Very High</Label>
              </div>
            </RadioGroup>
          </div>

          <div className="space-y-3">
            <Label className="text-sm font-medium">
              {type === "DEEP_WORK" ? "Focus Quality" : "Rest Quality"}
            </Label>
            <RadioGroup value={focusQuality} onValueChange={setFocusQuality}>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="1" id="focus-1" />
                <Label htmlFor="focus-1" className="text-sm">1 - Very Poor</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="2" id="focus-2" />
                <Label htmlFor="focus-2" className="text-sm">2 - Poor</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="3" id="focus-3" />
                <Label htmlFor="focus-3" className="text-sm">3 - Average</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="4" id="focus-4" />
                <Label htmlFor="focus-4" className="text-sm">4 - Good</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="5" id="focus-5" />
                <Label htmlFor="focus-5" className="text-sm">5 - Excellent</Label>
              </div>
            </RadioGroup>
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes" className="text-sm font-medium">
              Additional Notes (Optional)
            </Label>
            <Textarea
              id="notes"
              placeholder="How did this session feel? Any insights or observations..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="min-h-[80px]"
            />
          </div>

          <Button type="submit" className="w-full" disabled={isSubmitting}>
            {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Submit Feedback
          </Button>
        </form>
      </CardContent>
    </Card>
  );
} 