import React, { useState, useEffect } from "react";
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalCloseButton,
  Box,
  Button,
  FormControl,
  FormLabel,
  Input,
  VStack,
  useToast,
  InputGroup,
  InputRightElement,
  IconButton,
  useColorModeValue,
  Text,
  HStack,
  Link as ChakraLink,
  Radio,
  RadioGroup,
  Stack,
  FormHelperText,
} from "@chakra-ui/react";
import { ViewIcon, ViewOffIcon } from "@chakra-ui/icons";
import { signIn } from "next-auth/react";
import { db } from "@/utils/firebaseClient";
import { doc, setDoc } from "firebase/firestore";
import ReCAPTCHA from "react-google-recaptcha";
import { USER_ROLES, ROLE_NAMES, ROLE_DESCRIPTIONS } from "@/constants/roles";

// LOGIN MODAL COMPONENT
export default function LoginModal({ isOpen, onClose, initialMode = "login" }) {
  const [mode, setMode] = useState(initialMode);
  const [loginCredentials, setLoginCredentials] = useState({
    email: "",
    password: "",
  });
  const [registerForm, setRegisterForm] = useState({
    email: "",
    password: "",
    confirmPassword: "",
    displayName: "",
    role: USER_ROLES.CUSTOMER, // DEFAULT TO CUSTOMER
  });
  const [resetEmail, setResetEmail] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [recaptchaToken, setRecaptchaToken] = useState("");

  const toast = useToast();
  const inputBg = useColorModeValue("gray.50", "gray.600");

  // UPDATE MODE WHEN INITIAL MODE PROP CHANGES
  useEffect(() => {
    setMode(initialMode);
  }, [initialMode]);

  // LOGIN LOGIC
  const handleLoginInputChange = (e) => {
    const { name, value } = e.target;
    setLoginCredentials((prev) => ({ ...prev, [name]: value }));
  };

  const handleCredentialsSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
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
    try {
      const result = await signIn("credentials", {
        email: loginCredentials.email,
        password: loginCredentials.password,
        redirect: false,
      });
      if (result?.error) {
        toast({
          title: "Login failed",
          description: "Invalid email or password",
          status: "error",
          duration: 3000,
          isClosable: true,
        });
      } else {
        toast({
          title: "Login successful",
          status: "success",
          duration: 2000,
          isClosable: true,
        });
        onClose();
        window.location.reload();
      }
    } catch (error) {
      toast({
        title: "An error occurred",
        description: "Please try again later",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setIsLoading(false);
    }
  };

  // REGISTER LOGIC
  const handleRegisterInputChange = (e) => {
    const { name, value } = e.target;
    setRegisterForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    if (
      !registerForm.email ||
      !registerForm.password ||
      !registerForm.confirmPassword ||
      !registerForm.displayName
    ) {
      toast({
        title: "All fields are required!",
        status: "warning",
        duration: 3000,
        isClosable: true,
      });
      return;
    }
    if (registerForm.password !== registerForm.confirmPassword) {
      toast({
        title: "Passwords do not match!",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
      return;
    }
    if (registerForm.password.length < 6) {
      toast({
        title: "Password must be at least 6 characters",
        status: "warning",
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
      // STEP 1: CREATE FIREBASE AUTH USER
      const response = await fetch(
        `https://identitytoolkit.googleapis.com/v1/accounts:signUp?key=${process.env.NEXT_PUBLIC_FIREBASE_API_KEY}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            email: registerForm.email,
            password: registerForm.password,
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
        return;
      }

      // STEP 2: CREATE USER PROFILE IN FIRESTORE WITH ROLE
      const userId = data.localId;
      await setDoc(doc(db, "users", userId), {
        email: registerForm.email,
        displayName: registerForm.displayName,
        role: registerForm.role,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });

      toast({
        title: "Registration successful!",
        description: `Account created as ${
          ROLE_NAMES[registerForm.role]
        }. You can now log in.`,
        status: "success",
        duration: 4000,
        isClosable: true,
      });
      setMode("login");
      setRegisterForm({
        email: "",
        password: "",
        confirmPassword: "",
        displayName: "",
        role: USER_ROLES.CUSTOMER,
      });
    } catch (error) {
      console.error("Registration error:", error);
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

  // FORGOT PASSWORD LOGIC
  const handleResetPassword = async (e) => {
    e.preventDefault();
    if (!resetEmail) {
      toast({
        title: "Email is required!",
        status: "warning",
        duration: 3000,
        isClosable: true,
      });
      return;
    }
    setIsLoading(true);
    try {
      const response = await fetch(
        `https://identitytoolkit.googleapis.com/v1/accounts:sendOobCode?key=${process.env.NEXT_PUBLIC_FIREBASE_API_KEY}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            requestType: "PASSWORD_RESET",
            email: resetEmail,
          }),
        }
      );
      const data = await response.json();
      if (data.error) {
        toast({
          title: "Reset failed",
          description: data.error.message,
          status: "error",
          duration: 4000,
          isClosable: true,
        });
      } else {
        toast({
          title: "Password reset email sent!",
          description: "Check your inbox for reset instructions.",
          status: "success",
          duration: 4000,
          isClosable: true,
        });
        setMode("login");
        setResetEmail("");
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
    <Modal isOpen={isOpen} onClose={onClose} isCentered size="lg">
      <ModalOverlay />
      <ModalContent maxW="500px">
        <ModalHeader textAlign="center">
          {mode === "register"
            ? "Register"
            : mode === "forgot"
            ? "Reset Password"
            : "Sign In"}
        </ModalHeader>
        <ModalCloseButton />
        <ModalBody pb={6}>
          {mode === "register" ? (
            <Box as="form" onSubmit={handleRegisterSubmit}>
              <VStack spacing={4}>
                {/* RECAPTCHA WIDGET - REQUIRED */}
                <ReCAPTCHA
                  sitekey={process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY}
                  onChange={setRecaptchaToken}
                />
                <FormControl isRequired>
                  <FormLabel>Full Name</FormLabel>
                  <Input
                    type="text"
                    name="displayName"
                    value={registerForm.displayName}
                    onChange={handleRegisterInputChange}
                    bg={inputBg}
                    borderRadius="md"
                    focusBorderColor="teal.400"
                    placeholder="Enter your full name"
                  />
                </FormControl>
                <FormControl isRequired>
                  <FormLabel>Email</FormLabel>
                  <Input
                    type="email"
                    name="email"
                    value={registerForm.email}
                    onChange={handleRegisterInputChange}
                    bg={inputBg}
                    borderRadius="md"
                    focusBorderColor="teal.400"
                    placeholder="Enter your email"
                  />
                </FormControl>
                <FormControl isRequired>
                  <FormLabel>Account Type</FormLabel>
                  <RadioGroup
                    name="role"
                    value={registerForm.role}
                    onChange={(value) =>
                      setRegisterForm((prev) => ({ ...prev, role: value }))
                    }
                  >
                    <Stack direction="column" spacing={2}>
                      <Box
                        p={3}
                        borderWidth={1}
                        borderRadius="md"
                        borderColor={
                          registerForm.role === USER_ROLES.CUSTOMER
                            ? "teal.500"
                            : "gray.200"
                        }
                        bg={
                          registerForm.role === USER_ROLES.CUSTOMER
                            ? "teal.50"
                            : "transparent"
                        }
                        cursor="pointer"
                        onClick={() =>
                          setRegisterForm((prev) => ({
                            ...prev,
                            role: USER_ROLES.CUSTOMER,
                          }))
                        }
                      >
                        <Radio value={USER_ROLES.CUSTOMER} colorScheme="teal">
                          <Text fontWeight="bold" fontSize="sm">
                            {ROLE_NAMES[USER_ROLES.CUSTOMER]}
                          </Text>
                        </Radio>
                        <Text fontSize="xs" color="gray.600" ml={6}>
                          {ROLE_DESCRIPTIONS[USER_ROLES.CUSTOMER]}
                        </Text>
                      </Box>
                      <Box
                        p={3}
                        borderWidth={1}
                        borderRadius="md"
                        borderColor={
                          registerForm.role === USER_ROLES.SURVEYOR
                            ? "teal.500"
                            : "gray.200"
                        }
                        bg={
                          registerForm.role === USER_ROLES.SURVEYOR
                            ? "teal.50"
                            : "transparent"
                        }
                        cursor="pointer"
                        onClick={() =>
                          setRegisterForm((prev) => ({
                            ...prev,
                            role: USER_ROLES.SURVEYOR,
                          }))
                        }
                      >
                        <Radio value={USER_ROLES.SURVEYOR} colorScheme="teal">
                          <Text fontWeight="bold" fontSize="sm">
                            {ROLE_NAMES[USER_ROLES.SURVEYOR]}
                          </Text>
                        </Radio>
                        <Text fontSize="xs" color="gray.600" ml={6}>
                          {ROLE_DESCRIPTIONS[USER_ROLES.SURVEYOR]}
                        </Text>
                      </Box>
                    </Stack>
                  </RadioGroup>
                  <FormHelperText fontSize="xs">
                    Select the type of account that best describes your needs
                  </FormHelperText>
                </FormControl>
                <FormControl isRequired>
                  <FormLabel>Password</FormLabel>
                  <InputGroup>
                    <Input
                      type={showPassword ? "text" : "password"}
                      name="password"
                      value={registerForm.password}
                      onChange={handleRegisterInputChange}
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
                        onMouseDown={() => setShowPassword(true)}
                        onMouseUp={() => setShowPassword(false)}
                        onMouseLeave={() => setShowPassword(false)}
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
                      value={registerForm.confirmPassword}
                      onChange={handleRegisterInputChange}
                      bg={inputBg}
                      borderRadius="md"
                      focusBorderColor="teal.400"
                      placeholder="Confirm your password"
                    />
                    <InputRightElement>
                      <IconButton
                        aria-label={
                          showConfirmPassword
                            ? "Hide password"
                            : "Show password"
                        }
                        icon={
                          showConfirmPassword ? <ViewOffIcon /> : <ViewIcon />
                        }
                        onMouseDown={() => setShowConfirmPassword(true)}
                        onMouseUp={() => setShowConfirmPassword(false)}
                        onMouseLeave={() => setShowConfirmPassword(false)}
                        variant="ghost"
                        size="sm"
                      />
                    </InputRightElement>
                  </InputGroup>
                </FormControl>
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
                  onClick={() => setMode("login")}
                >
                  Already have an account? Login
                </Button>
              </VStack>
            </Box>
          ) : mode === "forgot" ? (
            <Box as="form" onSubmit={handleResetPassword}>
              <VStack spacing={6}>
                <FormControl isRequired>
                  <FormLabel>Email</FormLabel>
                  <Input
                    type="email"
                    name="resetEmail"
                    value={resetEmail}
                    onChange={(e) => setResetEmail(e.target.value)}
                    bg={inputBg}
                    borderRadius="md"
                    focusBorderColor="teal.400"
                    // placeholder="Enter your email"
                  />
                </FormControl>
                <Button
                  type="submit"
                  colorScheme="teal"
                  size="lg"
                  width="100%"
                  isLoading={isLoading}
                  loadingText="Sending..."
                >
                  Send Reset Email
                </Button>
                <Button
                  variant="link"
                  colorScheme="teal"
                  width="100%"
                  onClick={() => setMode("login")}
                >
                  Back to Login
                </Button>
              </VStack>
            </Box>
          ) : (
            <Box as="form" onSubmit={handleCredentialsSubmit}>
              <VStack spacing={6}>
                {/* RECAPTCHA WIDGET - REQUIRED */}
                <ReCAPTCHA
                  sitekey={process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY}
                  onChange={setRecaptchaToken}
                />
                <FormControl isRequired>
                  <FormLabel>Email</FormLabel>
                  <Input
                    type="email"
                    name="email"
                    value={loginCredentials.email}
                    onChange={handleLoginInputChange}
                    bg={inputBg}
                    borderRadius="md"
                    focusBorderColor="teal.400"
                    // placeholder="Enter your email"
                  />
                </FormControl>
                <FormControl isRequired>
                  <FormLabel>Password</FormLabel>
                  <InputGroup>
                    <Input
                      type={showPassword ? "text" : "password"}
                      name="password"
                      value={loginCredentials.password}
                      onChange={handleLoginInputChange}
                      bg={inputBg}
                      borderRadius="md"
                      focusBorderColor="teal.400"
                      // placeholder="Enter your password"
                    />
                    <InputRightElement>
                      <IconButton
                        aria-label={
                          showPassword ? "Hide password" : "Show password"
                        }
                        icon={showPassword ? <ViewOffIcon /> : <ViewIcon />}
                        // SHOW PASSWORD WHILE MOUSE IS HELD
                        onMouseDown={() => setShowPassword(true)}
                        onMouseUp={() => setShowPassword(false)}
                        onMouseLeave={() => setShowPassword(false)}
                        variant="ghost"
                        size="sm"
                      />
                    </InputRightElement>
                  </InputGroup>
                </FormControl>
                <HStack width="100%" justify="space-between">
                  <Button
                    variant="link"
                    colorScheme="teal"
                    size="sm"
                    onClick={() => setMode("forgot")}
                  >
                    Forgot password?
                  </Button>
                  <Button
                    variant="link"
                    colorScheme="teal"
                    size="sm"
                    onClick={() => setMode("register")}
                  >
                    Don't have an account? Register
                  </Button>
                </HStack>
                <Button
                  type="submit"
                  colorScheme="teal"
                  size="lg"
                  width="100%"
                  isLoading={isLoading}
                  loadingText="Signing in..."
                >
                  Sign In
                </Button>
              </VStack>
            </Box>
          )}
        </ModalBody>
      </ModalContent>
    </Modal>
  );
}
