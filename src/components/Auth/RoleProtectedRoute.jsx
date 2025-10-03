"use client";

import { useAuth } from "@/hooks/useAuth";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import {
  Center,
  Spinner,
  Box,
  Heading,
  Text,
  Container,
} from "@chakra-ui/react";
import { USER_ROLES, ROLE_NAMES } from "@/constants/roles";

// ROLE-BASED ROUTE PROTECTION
export default function RoleProtectedRoute({
  children,
  allowedRoles = [],
  fallbackPath = "/",
}) {
  const { isAuthenticated, isLoading, userRole } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && isAuthenticated && allowedRoles.length > 0 && userRole) {
      // CHECK ROLE PERMISSION ONLY IF AUTHENTICATED
      // MASTER ADMIN HAS ACCESS TO EVERYTHING
      if (userRole === USER_ROLES.MASTER_ADMIN) {
        return;
      }

      // CHECK IF USER'S ROLE IS IN ALLOWED ROLES
      if (!allowedRoles.includes(userRole)) {
        router.push(fallbackPath);
        return;
      }
    }
  }, [
    isAuthenticated,
    isLoading,
    userRole,
    allowedRoles,
    router,
    fallbackPath,
  ]);

  // SHOW LOADING SPINNER
  if (isLoading) {
    return (
      <Center minH="60vh">
        <Spinner
          size="xl"
          thickness="4px"
          speed="0.65s"
          color="teal.500"
          emptyColor="gray.200"
        />
      </Center>
    );
  }

  // SHOW UNAUTHORIZED MESSAGE
  if (!isAuthenticated) {
    return (
      <Container
        maxW="container.md"
        minH="60vh"
        display="flex"
        alignItems="center"
        justifyContent="center"
      >
        <Box textAlign="center">
          <Heading size="lg" color="teal.600" mb={4}>
            AUTHENTICATION REQUIRED
          </Heading>
          <Text color="gray.600">Please log in to access this page.</Text>
        </Box>
      </Container>
    );
  }

  // CHECK IF USER HAS PENDING ROLE (NO ACCESS)
  if (isAuthenticated && !userRole && !isLoading) {
    return (
      <Container
        maxW="container.md"
        minH="60vh"
        display="flex"
        alignItems="center"
        justifyContent="center"
      >
        <Box textAlign="center">
          <Heading size="lg" color="orange.500" mb={4}>
            ACCOUNT PENDING
          </Heading>
          <Text color="gray.600">
            Your account is pending role assignment. Please contact an
            administrator.
          </Text>
        </Box>
      </Container>
    );
  }

  // SHOW ACCESS DENIED MESSAGE
  if (
    allowedRoles.length > 0 &&
    userRole &&
    !allowedRoles.includes(userRole) &&
    userRole !== USER_ROLES.MASTER_ADMIN
  ) {
    return (
      <Container
        maxW="container.md"
        minH="60vh"
        display="flex"
        alignItems="center"
        justifyContent="center"
      >
        <Box textAlign="center">
          <Heading size="lg" color="orange.600" mb={4}>
            ACCESS DENIED
          </Heading>
          <Text color="gray.600" mb={2}>
            This page is only accessible to:{" "}
            {allowedRoles.map((role) => ROLE_NAMES[role]).join(", ")}
          </Text>
          <Text color="gray.600">
            Your account type: {ROLE_NAMES[userRole]}
          </Text>
        </Box>
      </Container>
    );
  }

  // RENDER PROTECTED CONTENT
  return <>{children}</>;
}
