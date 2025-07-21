"use client";

import React, { useState, useEffect, Suspense } from "react";
import {
  Box,
  Button,
  FormControl,
  FormLabel,
  Input,
  VStack,
  Heading,
  Text,
  useToast,
  Container,
  InputGroup,
  InputRightElement,
  IconButton,
  useColorModeValue,
  Center,
  Spinner,
} from "@chakra-ui/react";
import { ViewIcon, ViewOffIcon } from "@chakra-ui/icons";
import { useRouter, useSearchParams } from "next/navigation";
import {
  getAuth,
  confirmPasswordReset,
  verifyPasswordResetCode,
} from "firebase/auth";
import { app } from "@/utils/firebaseClient";

// This component contains the actual logic and uses the search params.
function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const toast = useToast();
  const auth = getAuth(app);

  const [oobCode, setOobCode] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isValidCode, setIsValidCode] = useState(false);
  const [email, setEmail] = useState("");

  const bg = useColorModeValue("white", "gray.700");
  const headerBg = useColorModeValue("teal.500", "teal.300");
  const inputBg = useColorModeValue("gray.50", "gray.600");

  useEffect(() => {
    const code = searchParams.get("oobCode");
    if (!code) {
      toast({
        title: "Invalid Link",
        description: "The password reset link is missing a required code.",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
      setIsLoading(false);
      return;
    }

    setOobCode(code);
    verifyPasswordResetCode(auth, code)
      .then((email) => {
        setEmail(email);
        setIsValidCode(true);
        setIsLoading(false);
      })
      .catch(() => {
        toast({
          title: "Invalid or Expired Link",
          description:
            "This password reset link is either invalid or has expired.",
          status: "error",
          duration: 5000,
          isClosable: true,
        });
        setIsValidCode(false);
        setIsLoading(false);
      });
  }, [auth, searchParams, toast]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      toast({
        title: "Passwords do not match!",
        status: "error",
        duration: 3000,
      });
      return;
    }
    setIsUpdating(true);
    try {
      await confirmPasswordReset(auth, oobCode, newPassword);
      toast({
        title: "Password Reset Successful!",
        description: "You can now log in with your new password.",
        status: "success",
        duration: 5000,
        isClosable: true,
      });
      router.push("/");
    } catch (error) {
      toast({
        title: "Error resetting password",
        description: "An unexpected error occurred. Please try again.",
        status: "error",
        duration: 5000,
      });
    } finally {
      setIsUpdating(false);
    }
  };

  if (isLoading) {
    return (
      <Center flex="1">
        <Spinner size="xl" />
      </Center>
    );
  }

  if (!isValidCode) {
    return (
      <Container maxW="container.sm" py={10}>
        <Box textAlign="center">
          <Heading size="lg" color="red.500">
            Invalid Link
          </Heading>
          <Text mt={4}>This link is invalid or has expired.</Text>
          <Button mt={6} colorScheme="teal" onClick={() => router.push("/")}>
            Return to Homepage
          </Button>
        </Box>
      </Container>
    );
  }

  return (
    <Container maxW="container.sm" py={10}>
      <Box borderRadius="2xl" overflow="hidden" boxShadow="lg" bg={bg}>
        <Box bg={headerBg} py={6} px={8} textAlign="center">
          <Heading size="lg" color="white">
            Reset Your Password
          </Heading>
          <Text color="white" mt={2}>
            Enter a new password for {email}
          </Text>
        </Box>
        <Box p={8}>
          <VStack spacing={6} as="form" onSubmit={handleSubmit}>
            <FormControl isRequired>
              <FormLabel>New Password</FormLabel>
              <InputGroup>
                <Input
                  type={showPassword ? "text" : "password"}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  bg={inputBg}
                  placeholder="Enter new password"
                />
                <InputRightElement>
                  <IconButton
                    icon={showPassword ? <ViewOffIcon /> : <ViewIcon />}
                    onClick={() => setShowPassword(!showPassword)}
                    variant="ghost"
                  />
                </InputRightElement>
              </InputGroup>
            </FormControl>
            <FormControl isRequired>
              <FormLabel>Confirm New Password</FormLabel>
              <InputGroup>
                <Input
                  type={showConfirmPassword ? "text" : "password"}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  bg={inputBg}
                  placeholder="Confirm new password"
                />
                <InputRightElement>
                  <IconButton
                    icon={showConfirmPassword ? <ViewOffIcon /> : <ViewIcon />}
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    variant="ghost"
                  />
                </InputRightElement>
              </InputGroup>
            </FormControl>
            <Button
              type="submit"
              colorScheme="teal"
              size="lg"
              width="100%"
              isLoading={isUpdating}
            >
              Update Password
            </Button>
          </VStack>
        </Box>
      </Box>
    </Container>
  );
}

// The main page now wraps the form in Suspense.
export default function ResetPasswordPage() {
  return (
    <Suspense
      fallback={
        <Center flex="1">
          <Spinner size="xl" />
        </Center>
      }
    >
      <ResetPasswordForm />
    </Suspense>
  );
}
