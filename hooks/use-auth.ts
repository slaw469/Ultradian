"use client";

import { useSession, signIn, signOut } from "next-auth/react";

export const useAuth = () => {
  const session = useSession();

  const isLoading = session.status === "loading";
  const isAuthenticated = session.status === "authenticated";
  const user = session.data?.user;

  return {
    isLoading,
    isAuthenticated,
    user,
    signIn,
    signOut,
  };
};
