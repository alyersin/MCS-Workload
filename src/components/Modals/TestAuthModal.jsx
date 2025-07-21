import React, { useState } from "react";
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalBody,
  ModalCloseButton,
  useDisclosure,
  Button,
  useToast,
  VStack,
  HStack,
  IconButton,
} from "@chakra-ui/react";
import { ViewIcon, ViewOffIcon } from "@chakra-ui/icons";
import styled from "styled-components";
import { signIn } from "next-auth/react";
import ReCAPTCHA from "react-google-recaptcha";

const TestAuthModal = () => {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [mode, setMode] = useState("login");
  const [loginForm, setLoginForm] = useState({ email: "", password: "" });
  const [registerForm, setRegisterForm] = useState({
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [resetEmail, setResetEmail] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [recaptchaToken, setRecaptchaToken] = useState("");
  const toast = useToast();

  // LOGIN LOGIC
  const handleLoginInputChange = (e) => {
    const { name, value } = e.target;
    setLoginForm((prev) => ({ ...prev, [name]: value }));
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
        email: loginForm.email,
        password: loginForm.password,
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
      !registerForm.username ||
      !registerForm.email ||
      !registerForm.password ||
      !registerForm.confirmPassword
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
      } else {
        toast({
          title: "Registration successful!",
          description: "You can now log in.",
          status: "success",
          duration: 3000,
          isClosable: true,
        });
        setMode("login");
        setRegisterForm({
          username: "",
          email: "",
          password: "",
          confirmPassword: "",
        });
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
    <>
      <Button
        colorScheme="teal"
        onClick={onOpen}
        position="fixed"
        bottom={8}
        right={8}
        zIndex={9999}
      >
        Open Test Auth Modal
      </Button>
      <Modal isOpen={isOpen} onClose={onClose} isCentered>
        <ModalOverlay />
        <ModalContent bg="transparent" boxShadow="none" maxW="350px">
          <ModalCloseButton color="white" zIndex={10} />
          <ModalBody p={0}>
            <StyledWrapper>
              <div className="card">
                <div className="card2">
                  {mode === "login" && (
                    <form className="form" onSubmit={handleCredentialsSubmit}>
                      <p id="heading">Login</p>
                      <VStack spacing={4}>
                        <ReCAPTCHA
                          sitekey={process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY}
                          onChange={setRecaptchaToken}
                        />
                        <div className="field">
                          <svg
                            viewBox="0 0 16 16"
                            fill="currentColor"
                            height={16}
                            width={16}
                            xmlns="http://www.w3.org/2000/svg"
                            className="input-icon"
                          >
                            <path d="M0 4a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H2a2 2 0 0 1-2-2V4zm2-1a1 1 0 0 0-1 1v.217l7 4.2 7-4.2V4a1 1 0 0 0-1-1H2zm13 2.383l-4.708 2.825a1 1 0 0 1-1.084 0L1 5.383V12a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1V5.383z" />
                          </svg>
                          <input
                            type="email"
                            className="input-field"
                            placeholder="Email"
                            name="email"
                            autoComplete="off"
                            value={loginForm.email}
                            onChange={handleLoginInputChange}
                          />
                        </div>
                        <div className="field">
                          <svg
                            viewBox="0 0 16 16"
                            fill="currentColor"
                            height={16}
                            width={16}
                            xmlns="http://www.w3.org/2000/svg"
                            className="input-icon"
                          >
                            <path d="M8 1a2 2 0 0 1 2 2v4H6V3a2 2 0 0 1 2-2zm3 6V3a3 3 0 0 0-6 0v4a2 2 0 0 0-2 2v5a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2z" />
                          </svg>
                          <input
                            type={showPassword ? "text" : "password"}
                            className="input-field"
                            placeholder="Password"
                            name="password"
                            value={loginForm.password}
                            onChange={handleLoginInputChange}
                          />
                          <IconButton
                            aria-label={
                              showPassword ? "Hide password" : "Show password"
                            }
                            icon={showPassword ? <ViewOffIcon /> : <ViewIcon />}
                            onClick={() => setShowPassword(!showPassword)}
                            variant="ghost"
                            size="sm"
                            ml={2}
                          />
                        </div>
                        <div className="btn">
                          <button
                            className="button1"
                            type="submit"
                            disabled={isLoading}
                          >
                            {isLoading ? "Signing in..." : "Login"}
                          </button>
                          <button
                            className="button2"
                            type="button"
                            onClick={() => setMode("signup")}
                          >
                            Sign Up
                          </button>
                        </div>
                        <button
                          className="button3"
                          type="button"
                          onClick={() => setMode("forgot")}
                        >
                          Forgot Password
                        </button>
                      </VStack>
                    </form>
                  )}
                  {mode === "signup" && (
                    <form className="form" onSubmit={handleRegisterSubmit}>
                      <p id="heading">Sign Up</p>
                      <VStack spacing={4}>
                        <ReCAPTCHA
                          sitekey={process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY}
                          onChange={setRecaptchaToken}
                        />
                        <div className="field">
                          <svg
                            viewBox="0 0 16 16"
                            fill="currentColor"
                            height={16}
                            width={16}
                            xmlns="http://www.w3.org/2000/svg"
                            className="input-icon"
                          >
                            <path d="M13.106 7.222c0-2.967-2.249-5.032-5.482-5.032-3.35 0-5.646 2.318-5.646 5.702 0 3.493 2.235 5.708 5.762 5.708.862 0 1.689-.123 2.304-.335v-.862c-.43.199-1.354.328-2.29.328-2.926 0-4.813-1.88-4.813-4.798 0-2.844 1.921-4.881 4.594-4.881 2.735 0 4.608 1.688 4.608 4.156 0 1.682-.554 2.769-1.416 2.769-.492 0-.772-.28-.772-.76V5.206H8.923v.834h-.11c-.266-.595-.881-.964-1.6-.964-1.4 0-2.378 1.162-2.378 2.823 0 1.737.957 2.906 2.379 2.906.8 0 1.415-.39 1.709-1.087h.11c.081.67.703 1.148 1.503 1.148 1.572 0 2.57-1.415 2.57-3.643zm-7.177.704c0-1.197.54-1.907 1.456-1.907.93 0 1.524.738 1.524 1.907S8.308 9.84 7.371 9.84c-.895 0-1.442-.725-1.442-1.914z" />
                          </svg>
                          <input
                            type="text"
                            className="input-field"
                            placeholder="Username"
                            name="username"
                            autoComplete="off"
                            value={registerForm.username}
                            onChange={handleRegisterInputChange}
                          />
                        </div>
                        <div className="field">
                          <svg
                            viewBox="0 0 16 16"
                            fill="currentColor"
                            height={16}
                            width={16}
                            xmlns="http://www.w3.org/2000/svg"
                            className="input-icon"
                          >
                            <path d="M0 4a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H2a2 2 0 0 1-2-2V4zm2-1a1 1 0 0 0-1 1v.217l7 4.2 7-4.2V4a1 1 0 0 0-1-1H2zm13 2.383l-4.708 2.825a1 1 0 0 1-1.084 0L1 5.383V12a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1V5.383z" />
                          </svg>
                          <input
                            type="email"
                            className="input-field"
                            placeholder="Email"
                            name="email"
                            autoComplete="off"
                            value={registerForm.email}
                            onChange={handleRegisterInputChange}
                          />
                        </div>
                        <div className="field">
                          <svg
                            viewBox="0 0 16 16"
                            fill="currentColor"
                            height={16}
                            width={16}
                            xmlns="http://www.w3.org/2000/svg"
                            className="input-icon"
                          >
                            <path d="M8 1a2 2 0 0 1 2 2v4H6V3a2 2 0 0 1 2-2zm3 6V3a3 3 0 0 0-6 0v4a2 2 0 0 0-2 2v5a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2z" />
                          </svg>
                          <input
                            type={showPassword ? "text" : "password"}
                            className="input-field"
                            placeholder="Password"
                            name="password"
                            value={registerForm.password}
                            onChange={handleRegisterInputChange}
                          />
                          <IconButton
                            aria-label={
                              showPassword ? "Hide password" : "Show password"
                            }
                            icon={showPassword ? <ViewOffIcon /> : <ViewIcon />}
                            onClick={() => setShowPassword(!showPassword)}
                            variant="ghost"
                            size="sm"
                            ml={2}
                          />
                        </div>
                        <div className="field">
                          <svg
                            viewBox="0 0 16 16"
                            fill="currentColor"
                            height={16}
                            width={16}
                            xmlns="http://www.w3.org/2000/svg"
                            className="input-icon"
                          >
                            <path d="M8 1a2 2 0 0 1 2 2v4H6V3a2 2 0 0 1 2-2zm3 6V3a3 3 0 0 0-6 0v4a2 2 0 0 0-2 2v5a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2z" />
                          </svg>
                          <input
                            type={showConfirmPassword ? "text" : "password"}
                            className="input-field"
                            placeholder="Confirm Password"
                            name="confirmPassword"
                            value={registerForm.confirmPassword}
                            onChange={handleRegisterInputChange}
                          />
                          <IconButton
                            aria-label={
                              showConfirmPassword
                                ? "Hide password"
                                : "Show password"
                            }
                            icon={
                              showConfirmPassword ? (
                                <ViewOffIcon />
                              ) : (
                                <ViewIcon />
                              )
                            }
                            onClick={() =>
                              setShowConfirmPassword(!showConfirmPassword)
                            }
                            variant="ghost"
                            size="sm"
                            ml={2}
                          />
                        </div>
                        <div className="btn">
                          <button
                            className="button1"
                            type="submit"
                            disabled={isLoading}
                          >
                            {isLoading ? "Registering..." : "Sign Up"}
                          </button>
                          <button
                            className="button2"
                            type="button"
                            onClick={() => setMode("login")}
                          >
                            Login
                          </button>
                        </div>
                      </VStack>
                    </form>
                  )}
                  {mode === "forgot" && (
                    <form className="form" onSubmit={handleResetPassword}>
                      <p id="heading">Reset Password</p>
                      <VStack spacing={4}>
                        <div className="field">
                          <svg
                            viewBox="0 0 16 16"
                            fill="currentColor"
                            height={16}
                            width={16}
                            xmlns="http://www.w3.org/2000/svg"
                            className="input-icon"
                          >
                            <path d="M0 4a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H2a2 2 0 0 1-2-2V4zm2-1a1 1 0 0 0-1 1v.217l7 4.2 7-4.2V4a1 1 0 0 0-1-1H2zm13 2.383l-4.708 2.825a1 1 0 0 1-1.084 0L1 5.383V12a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1V5.383z" />
                          </svg>
                          <input
                            type="email"
                            className="input-field"
                            placeholder="Email"
                            name="resetEmail"
                            autoComplete="off"
                            value={resetEmail}
                            onChange={(e) => setResetEmail(e.target.value)}
                          />
                        </div>
                        <div className="btn">
                          <button
                            className="button1"
                            type="submit"
                            disabled={isLoading}
                          >
                            {isLoading ? "Sending..." : "Send Reset Email"}
                          </button>
                          <button
                            className="button2"
                            type="button"
                            onClick={() => setMode("login")}
                          >
                            Back to Login
                          </button>
                        </div>
                      </VStack>
                    </form>
                  )}
                </div>
              </div>
            </StyledWrapper>
          </ModalBody>
        </ModalContent>
      </Modal>
    </>
  );
};

const StyledWrapper = styled.div`
  .form {
    display: flex;
    flex-direction: column;
    gap: 10px;
    padding-left: 2em;
    padding-right: 2em;
    padding-bottom: 0.4em;
    background-color: #171717;
    border-radius: 25px;
    transition: 0.4s ease-in-out;
  }

  .card {
    background-image: linear-gradient(163deg, #00ff75 0%, #3700ff 100%);
    border-radius: 22px;
    transition: all 0.3s;
  }

  .card2 {
    border-radius: 0;
    transition: all 0.2s;
  }

  .card2:hover {
    transform: scale(0.98);
    border-radius: 20px;
  }

  .card:hover {
    box-shadow: 0px 0px 30px 1px rgba(0, 255, 117, 0.3);
  }

  #heading {
    text-align: center;
    margin: 2em;
    color: rgb(255, 255, 255);
    font-size: 1.2em;
  }

  .field {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0.5em;
    border-radius: 25px;
    padding: 0.6em;
    border: none;
    outline: none;
    color: white;
    background-color: #171717;
    box-shadow: inset 2px 5px 10px rgb(5, 5, 5);
  }

  .input-icon {
    height: 1.3em;
    width: 1.3em;
    fill: white;
  }

  .input-field {
    background: none;
    border: none;
    outline: none;
    width: 100%;
    color: #d3d3d3;
  }

  .form .btn {
    display: flex;
    justify-content: center;
    flex-direction: row;
    margin-top: 2.5em;
  }

  .button1 {
    padding: 0.5em;
    padding-left: 1.1em;
    padding-right: 1.1em;
    border-radius: 5px;
    margin-right: 0.5em;
    border: none;
    outline: none;
    transition: 0.4s ease-in-out;
    background-color: #252525;
    color: white;
  }

  .button1:hover {
    background-color: black;
    color: white;
  }

  .button2 {
    padding: 0.5em;
    padding-left: 2.3em;
    padding-right: 2.3em;
    border-radius: 5px;
    border: none;
    outline: none;
    transition: 0.4s ease-in-out;
    background-color: #252525;
    color: white;
  }

  .button2:hover {
    background-color: black;
    color: white;
  }

  .button3 {
    margin-bottom: 3em;
    padding: 0.5em;
    border-radius: 5px;
    border: none;
    outline: none;
    transition: 0.4s ease-in-out;
    background-color: #252525;
    color: white;
  }

  .button3:hover {
    background-color: red;
    color: white;
  }
`;

export default TestAuthModal;
