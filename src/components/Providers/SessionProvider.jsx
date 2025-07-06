"use client";

import { SessionProvider } from "next-auth/react";

// SESSION PROVIDER COMPONENT
export default function AuthProvider({ children }) {
  return <SessionProvider>{children}</SessionProvider>;
}
