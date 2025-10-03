"use client";

import {
  Box,
  Container,
  Heading,
  Text,
  VStack,
  useColorModeValue,
} from "@chakra-ui/react";
import { useAuth } from "@/hooks/useAuth";
import ProtectedRoute from "@/components/Auth/ProtectedRoute";
import RoleProtectedRoute from "@/components/Auth/RoleProtectedRoute";
import { USER_ROLES } from "@/constants/roles";
import CustomerSurveyOrderForm from "@/components/CustomerSurveyOrderForm";

export default function SurveyOrderPage() {
  const bg = useColorModeValue("gray.50", "gray.900");

  return (
    <ProtectedRoute>
      <RoleProtectedRoute allowedRoles={[USER_ROLES.CUSTOMER]}>
        <Box bg={bg} minH="100vh" py={8}>
          <Container maxW="container.lg">
            <VStack spacing={8} align="stretch">
              <Box textAlign="center">
                <Heading as="h1" size="xl" color="teal.600" mb={4}>
                  Survey Order Request
                </Heading>
                <Text fontSize="lg" color="gray.600" maxW="2xl" mx="auto">
                  Request a professional survey for your cargo or vessel. Our
                  certified surveyors will provide detailed reports and
                  documentation.
                </Text>
              </Box>

              <CustomerSurveyOrderForm />
            </VStack>
          </Container>
        </Box>
      </RoleProtectedRoute>
    </ProtectedRoute>
  );
}
