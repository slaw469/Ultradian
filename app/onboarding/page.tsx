import { Metadata } from "next";
import { OnboardingForm } from "@/components/onboarding/onboarding-form";

export const metadata: Metadata = {
  title: "Onboarding - Ultradian",
  description: "Set up your Ultradian profile and preferences",
};

export default function OnboardingPage() {
  return (
    <div className="container relative min-h-screen flex items-center justify-center">
      <div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[550px]">
        <div className="flex flex-col space-y-2 text-center">
          <h1 className="text-2xl font-semibold tracking-tight">
            Welcome to Ultradian
          </h1>
          <p className="text-sm text-muted-foreground">
            Let's personalize your experience
          </p>
        </div>
        <OnboardingForm />
      </div>
    </div>
  );
} 