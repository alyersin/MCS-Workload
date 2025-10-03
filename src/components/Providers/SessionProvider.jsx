"use client";

import { SessionProvider, useSession } from "next-auth/react";
import React, { createContext, useContext, useEffect, useState } from "react";

// CREATE AUTH LOADING CONTEXT
const AuthLoadingContext = createContext({ isLoading: false, hasError: false });

export function useAuthLoading() {
  return useContext(AuthLoadingContext);
}

export default function AuthProvider({ children }) {
  return (
    <SessionProvider refetchInterval={5 * 60} refetchOnWindowFocus={false}>
      <AuthLoadingProvider>{children}</AuthLoadingProvider>
    </SessionProvider>
  );
}

function AuthLoadingProvider({ children }) {
  const { status } = useSession();
  const [hasError, setHasError] = useState(false);
  const [errorTimeout, setErrorTimeout] = useState(false);

  const isLoading = status === "loading";

  useEffect(() => {
    // Reset error state when status changes
    if (status === "authenticated" || status === "unauthenticated") {
      setHasError(false);
      setErrorTimeout(false);
    }
  }, [status]);

  useEffect(() => {
    // Set a timeout for loading state to prevent infinite loading
    if (isLoading) {
      const timeout = setTimeout(() => {
        console.warn("Auth loading timeout - setting error state");
        setErrorTimeout(true);
        setHasError(true);
      }, 30000); // 30 second timeout

      return () => clearTimeout(timeout);
    }
  }, [isLoading]);

  return (
    <AuthLoadingContext.Provider
      value={{ isLoading: isLoading && !errorTimeout, hasError }}
    >
      {children}
    </AuthLoadingContext.Provider>
  );
}
