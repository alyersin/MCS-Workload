"use client";

import { useAuth } from "@/hooks/useAuth";
import { Box, Spinner, Center, Text } from "@chakra-ui/react";

export default function ProtectedRoute({
  children,
  requiredRole = null,
  fallback = null,
}) {
  const { isAuthenticated, isLoading, session, requireRole } = useAuth();

  if (isLoading) {
    return (
      <Center minH="50vh">
        <Box textAlign="center">
          <Spinner size="xl" color="teal.500" />
          <Text mt={4}>Loading...</Text>
        </Box>
      </Center>
    );
  }

  if (!isAuthenticated) {
    return (
      fallback || (
        <Center minH="50vh">
          <Text>Please log in to access this page.</Text>
        </Center>
      )
    );
  }

  if (requiredRole && session?.user?.role !== requiredRole) {
    return (
      fallback || (
        <Center minH="50vh">
          <Text>You don't have permission to access this page.</Text>
        </Center>
      )
    );
  }

  return children;
}
