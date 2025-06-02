import { Metadata } from "next";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { RegisterForm } from "@/components/auth/register-form";

export const metadata: Metadata = {
  title: "Register - Ultradian",
  description: "Create your Ultradian account",
};

export default async function RegisterPage() {
  const session = await getServerSession();
  if (session?.user) redirect("/dashboard");

  return (
    <div className="container relative min-h-screen flex items-center justify-center">
      <div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[350px]">
        <div className="flex flex-col space-y-2 text-center">
          <h1 className="text-2xl font-semibold tracking-tight">
            Create an account
          </h1>
          <p className="text-sm text-muted-foreground">
            Enter your details below to create your account
          </p>
        </div>
        <RegisterForm />
      </div>
    </div>
  );
}
