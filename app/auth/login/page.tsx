import { Metadata } from "next";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { LoginForm } from "@/components/auth/login-form";

export const metadata: Metadata = {
  title: "Login - Ultradian",
  description: "Login to your Ultradian account",
};

export default async function LoginPage() {
  const session = await getServerSession();
  if (session?.user) redirect("/dashboard");

  return (
    <div className="container relative min-h-screen flex items-center justify-center">
      <div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[350px]">
        <div className="flex flex-col space-y-2 text-center">
          <h1 className="text-2xl font-semibold tracking-tight">
            Welcome back
          </h1>
          <p className="text-sm text-muted-foreground">
            Sign in to your account to continue
          </p>
        </div>
        <LoginForm />
      </div>
    </div>
  );
}
