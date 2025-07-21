"use client";

import { SessionProvider, useSession } from "next-auth/react";
import React, { createContext, useContext } from "react";

// CREATE AUTH LOADING CONTEXT
const AuthLoadingContext = createContext({ isLoading: false });

export function useAuthLoading() {
  return useContext(AuthLoadingContext);
}

export default function AuthProvider({ children }) {
  return (
    <SessionProvider>
      <AuthLoadingProvider>{children}</AuthLoadingProvider>
    </SessionProvider>
  );
}

function AuthLoadingProvider({ children }) {
  const { status } = useSession();
  const isLoading = status === "loading";
  return (
    <AuthLoadingContext.Provider value={{ isLoading }}>
      {children}
    </AuthLoadingContext.Provider>
  );
}
