"use client";

import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";

// AUTH HOOK
export function useAuth() {
  const { data: session, status } = useSession();
  const router = useRouter();

  const isAuthenticated = status === "authenticated";
  const isLoading = status === "loading";
  const isAdmin = session?.user?.role === "admin";
  const isUser = session?.user?.role === "user";

  const logout = async () => {
    await signOut({ redirect: false });
    router.push("/");
  };

  const requireAuth = (callback) => {
    if (!isAuthenticated && !isLoading) {
      router.push("/login");
      return false;
    }
    return callback ? callback() : true;
  };

  const requireRole = (requiredRole, callback) => {
    if (!isAuthenticated && !isLoading) {
      router.push("/login");
      return false;
    }

    if (session?.user?.role !== requiredRole) {
      router.push("/");
      return false;
    }

    return callback ? callback() : true;
  };

  return {
    session,
    status,
    isAuthenticated,
    isLoading,
    isAdmin,
    isUser,
    logout,
    requireAuth,
    requireRole,
  };
}
