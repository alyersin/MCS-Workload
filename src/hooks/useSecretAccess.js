"use client";
import { useEffect, useState } from "react";
import { useToast } from "@chakra-ui/react";

export function useSecretAccess(pageName) {
  const [secretInput, setSecretInput] = useState("");
  const [accessGranted, setAccessGranted] = useState(false);
  const toast = useToast();

  const storageKey = `access_${pageName}`;

  useEffect(() => {
    const stored = localStorage.getItem(storageKey);
    if (stored) {
      const parsed = JSON.parse(stored);
      const expiresAt = new Date(parsed.expiresAt);
      if (new Date() < expiresAt) {
        setAccessGranted(true);
      } else {
        localStorage.removeItem(storageKey);
      }
    }
  }, [pageName]);

  const handleSecretSubmit = async () => {
    const res = await fetch("/api/validate-secret", {
      method: "POST",
      body: JSON.stringify({
        pageName,
        userSecret: secretInput,
      }),
      headers: { "Content-Type": "application/json" },
    });

    const data = await res.json();

    if (data.valid) {
      setAccessGranted(true);
      const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);
      localStorage.setItem(
        storageKey,
        JSON.stringify({ granted: true, expiresAt })
      );
    } else {
      setAccessGranted(false);
      toast({
        title: "Invalid secret key",
        status: "error",
        duration: 3000,
        isClosable: true,
        position: "top",
      });
    }
  };

  return { secretInput, setSecretInput, accessGranted, handleSecretSubmit };
}
