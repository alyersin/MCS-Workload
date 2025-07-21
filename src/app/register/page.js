"use client";

import React, { useState } from "react";
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
} from "@chakra-ui/react";
import { ViewIcon, ViewOffIcon } from "@chakra-ui/icons";
import { useRouter } from "next/navigation";
import ReCAPTCHA from "react-google-recaptcha";

// USER REGISTRATION PAGE
export default function RegisterPage() {
  const [form, setForm] = useState({
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [recaptchaToken, setRecaptchaToken] = useState("");

  const toast = useToast();
  const router = useRouter();
  const bg = useColorModeValue("white", "gray.700");
  const headerBg = useColorModeValue("teal.500", "teal.300");
  const inputBg = useColorModeValue("gray.50", "gray.600");

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.email || !form.password || !form.confirmPassword) {
      toast({
        title: "All fields are required!",
        status: "warning",
        duration: 3000,
        isClosable: true,
      });
      return;
    }
    if (form.password !== form.confirmPassword) {
      toast({
        title: "Passwords do not match!",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
      return;
    }
    if (!recaptchaToken) {
      toast({
        title: "RECAPTCHA REQUIRED",
        status: "warning",
        duration: 3000,
        isClosable: true,
      });
      setIsLoading(false);
      return;
    }
    setIsLoading(true);
    try {
      const response = await fetch(
        `https://identitytoolkit.googleapis.com/v1/accounts:signUp?key=${process.env.NEXT_PUBLIC_FIREBASE_API_KEY}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            email: form.email,
            password: form.password,
            returnSecureToken: true,
          }),
        }
      );
      const data = await response.json();
      if (data.error) {
        toast({
          title: "Registration failed",
          description: data.error.message,
          status: "error",
          duration: 4000,
          isClosable: true,
        });
      } else {
        toast({
          title: "Registration successful!",
          description: "You can now log in.",
          status: "success",
          duration: 3000,
          isClosable: true,
        });
        router.push("/login");
      }
    } catch (error) {
      toast({
        title: "An error occurred",
        description: "Please try again later.",
        status: "error",
        duration: 4000,
        isClosable: true,
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Container maxW="container.sm" py={10}>
      <Box borderRadius="2xl" overflow="hidden" boxShadow="lg" bg={bg}>
        <Box bg={headerBg} py={6} px={8} textAlign="center">
          <Heading size="lg" color="white">
            Register
          </Heading>
          <Text color="white" mt={2}>
            Create a new account
          </Text>
        </Box>
        <Box p={8}>
          <VStack spacing={6} as="form" onSubmit={handleSubmit}>
            <FormControl isRequired>
              <FormLabel>Email</FormLabel>
              <Input
                type="email"
                name="email"
                value={form.email}
                onChange={handleInputChange}
                bg={inputBg}
                borderRadius="md"
                focusBorderColor="teal.400"
                placeholder="Enter your email"
              />
            </FormControl>
            <FormControl isRequired>
              <FormLabel>Password</FormLabel>
              <InputGroup>
                <Input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  value={form.password}
                  onChange={handleInputChange}
                  bg={inputBg}
                  borderRadius="md"
                  focusBorderColor="teal.400"
                  placeholder="Enter your password"
                />
                <InputRightElement>
                  <IconButton
                    aria-label={
                      showPassword ? "Hide password" : "Show password"
                    }
                    icon={showPassword ? <ViewOffIcon /> : <ViewIcon />}
                    onClick={() => setShowPassword(!showPassword)}
                    variant="ghost"
                    size="sm"
                  />
                </InputRightElement>
              </InputGroup>
            </FormControl>
            <FormControl isRequired>
              <FormLabel>Confirm Password</FormLabel>
              <InputGroup>
                <Input
                  type={showConfirmPassword ? "text" : "password"}
                  name="confirmPassword"
                  value={form.confirmPassword}
                  onChange={handleInputChange}
                  bg={inputBg}
                  borderRadius="md"
                  focusBorderColor="teal.400"
                  placeholder="Confirm your password"
                />
                <InputRightElement>
                  <IconButton
                    aria-label={
                      showConfirmPassword ? "Hide password" : "Show password"
                    }
                    icon={showConfirmPassword ? <ViewOffIcon /> : <ViewIcon />}
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    variant="ghost"
                    size="sm"
                  />
                </InputRightElement>
              </InputGroup>
            </FormControl>
            {/* RECAPTCHA WIDGET - REQUIRED */}
            <ReCAPTCHA
              sitekey={process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY}
              onChange={setRecaptchaToken}
            />
            <Button
              type="submit"
              colorScheme="teal"
              size="lg"
              width="100%"
              isLoading={isLoading}
              loadingText="Registering..."
            >
              Register
            </Button>
            <Button
              variant="link"
              colorScheme="teal"
              width="100%"
              onClick={() => router.push("/login")}
            >
              Already have an account? Login
            </Button>
          </VStack>
        </Box>
      </Box>
    </Container>
  );
}
