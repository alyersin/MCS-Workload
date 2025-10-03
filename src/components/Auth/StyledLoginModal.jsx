import React, { useState, useEffect } from "react";
import styled from "styled-components";
import {
  useToast,
  useColorModeValue,
  Box,
  Text,
  VStack,
  HStack,
  Button,
  FormControl,
  FormLabel,
  Input,
  Radio,
  RadioGroup,
  Stack,
  FormHelperText,
} from "@chakra-ui/react";
import { ViewIcon, ViewOffIcon } from "@chakra-ui/icons";
import { signIn } from "next-auth/react";
import ReCAPTCHA from "react-google-recaptcha";
import { USER_ROLES, ROLE_NAMES, ROLE_DESCRIPTIONS } from "@/constants/roles";
import { createUserWithEmailAndPassword, updateProfile } from "firebase/auth";
import { auth } from "@/utils/firebaseClient";

// STYLED COMPONENTS
const StyledWrapper = styled.div.withConfig({
  shouldForwardProp: (prop) => !["isDark"].includes(prop),
})`
  .form {
    --background: ${(props) => (props.isDark ? "#2d3748" : "#d3d3d3")};
    --input-focus: #2d8cf0;
    --font-color: ${(props) => (props.isDark ? "#e2e8f0" : "#323232")};
    --font-color-sub: ${(props) => (props.isDark ? "#a0aec0" : "#666")};
    --bg-color: ${(props) => (props.isDark ? "#4a5568" : "#fff")};
    --main-color: ${(props) => (props.isDark ? "#e2e8f0" : "#323232")};
    padding: 20px;
    background: var(--background);
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    justify-content: center;
    gap: 20px;
    border-radius: 5px;
    border: 2px solid var(--main-color);
    box-shadow: 4px 4px var(--main-color);
    max-width: 400px;
    margin: 0 auto;
  }

  .form > p {
    font-family: system-ui, -apple-system, sans-serif;
    color: var(--font-color);
    font-weight: 700;
    font-size: 20px;
    margin-bottom: 15px;
    display: flex;
    flex-direction: column;
  }

  .form > p > span {
    font-family: system-ui, -apple-system, sans-serif;
    color: var(--font-color-sub);
    font-weight: 600;
    font-size: 17px;
  }

  .separator {
    width: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 5px;
  }

  .separator > div {
    width: 100px;
    height: 3px;
    border-radius: 5px;
    background-color: var(--font-color-sub);
  }

  .separator > span {
    color: var(--font-color);
    font-family: system-ui, -apple-system, sans-serif;
    font-weight: 600;
  }

  .oauthButton {
    display: flex;
    justify-content: center;
    align-items: center;
    gap: 5px;
    padding: 15px;
    width: 100%;
    height: 40px;
    border-radius: 5px;
    border: 2px solid var(--main-color);
    background-color: var(--bg-color);
    box-shadow: 4px 4px var(--main-color);
    font-size: 16px;
    font-weight: 600;
    color: var(--font-color);
    cursor: pointer;
    transition: all 250ms;
    position: relative;
    overflow: hidden;
    z-index: 1;
  }

  .oauthButton::before {
    content: "";
    position: absolute;
    top: 0;
    left: 0;
    height: 100%;
    width: 0;
    background-color: #212121;
    z-index: -1;
    box-shadow: 4px 8px 19px -3px rgba(0, 0, 0, 0.27);
    transition: all 250ms;
  }

  .oauthButton:hover {
    color: #e8e8e8;
  }

  .oauthButton:hover::before {
    width: 100%;
  }

  .form > input {
    width: 100%;
    height: 40px;
    border-radius: 5px;
    border: 2px solid var(--main-color);
    background-color: var(--bg-color);
    box-shadow: 4px 4px var(--main-color);
    font-size: 15px;
    font-weight: 600;
    color: var(--font-color);
    padding: 5px 10px;
    outline: none;
  }

  .form > input:focus {
    border-color: var(--input-focus);
  }

  .icon {
    width: 1.5rem;
    height: 1.5rem;
  }

  .mode-toggle {
    display: flex;
    gap: 10px;
    margin-bottom: 20px;
  }

  .mode-button {
    padding: 8px 16px;
    border: 2px solid var(--main-color);
    border-radius: 5px;
    background-color: var(--bg-color);
    color: var(--font-color);
    cursor: pointer;
    transition: all 250ms;
  }

  .mode-button.active {
    background-color: var(--input-focus);
    color: white;
  }

  .password-input {
    position: relative;
    width: 100%;
  }

  .password-input input {
    width: 100%;
    height: 40px;
    border-radius: 5px;
    border: 2px solid var(--main-color);
    background-color: var(--bg-color);
    box-shadow: 4px 4px var(--main-color);
    font-size: 15px;
    font-weight: 600;
    color: var(--font-color);
    padding: 5px 10px;
    outline: none;
  }

  .password-input input:focus {
    border-color: var(--input-focus);
  }

  .password-toggle {
    position: absolute;
    right: 10px;
    top: 50%;
    transform: translateY(-50%);
    background: none;
    border: none;
    color: var(--font-color);
    cursor: pointer;
  }
`;

// STYLED LOGIN MODAL COMPONENT
export default function StyledLoginModal({
  isOpen,
  onClose,
  initialMode = "login",
}) {
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
    role: USER_ROLES.CUSTOMER,
  });
  const [resetEmail, setResetEmail] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [recaptchaToken, setRecaptchaToken] = useState("");

  const toast = useToast();
  const isDark = useColorModeValue(false, true);

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
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        registerForm.email,
        registerForm.password
      );

      const user = userCredential.user;

      // UPDATE USER DISPLAY NAME
      await updateProfile(user, {
        displayName: registerForm.displayName,
      });

      // STEP 2: CREATE USER PROFILE VIA API ENDPOINT
      const profileResponse = await fetch("/api/register-user", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          uid: user.uid,
          email: registerForm.email,
          displayName: registerForm.displayName,
        }),
      });

      if (!profileResponse.ok) {
        const errorData = await profileResponse.json();
        throw new Error(errorData.error || "Failed to create user profile");
      }

      toast({
        title: "Registration successful!",
        description: "Account created successfully. You can now log in.",
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

      let errorMessage = "An error occurred during registration";

      // HANDLE SPECIFIC FIREBASE ERRORS
      if (error.code) {
        switch (error.code) {
          case "auth/email-already-in-use":
            errorMessage = "This email is already registered";
            break;
          case "auth/weak-password":
            errorMessage = "Password should be at least 6 characters";
            break;
          case "auth/invalid-email":
            errorMessage = "Invalid email address";
            break;
          default:
            errorMessage = error.message || errorMessage;
        }
      } else {
        errorMessage = error.message || errorMessage;
      }

      toast({
        title: "Registration failed",
        description: errorMessage,
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

  if (!isOpen) return null;

  return (
    <Box
      position="fixed"
      top="0"
      left="0"
      width="100%"
      height="100%"
      bg="rgba(0, 0, 0, 0.5)"
      display="flex"
      alignItems="center"
      justifyContent="center"
      zIndex="9999"
      onClick={onClose}
    >
      <StyledWrapper isDark={isDark} onClick={(e) => e.stopPropagation()}>
        <form
          className="form"
          onSubmit={
            mode === "login"
              ? handleCredentialsSubmit
              : mode === "register"
              ? handleRegisterSubmit
              : handleResetPassword
          }
        >
          <p>
            Welcome,
            <span>
              {mode === "login"
                ? "sign in to continue"
                : mode === "register"
                ? "create your account"
                : "reset your password"}
            </span>
          </p>

          {/* GOOGLE OAUTH BUTTON */}
          <button
            type="button"
            className="oauthButton"
            onClick={() => {
              // TODO: IMPLEMENT GOOGLE OAUTH
              toast({
                title: "Google OAuth",
                description: "Google authentication coming soon!",
                status: "info",
                duration: 3000,
                isClosable: true,
              });
            }}
          >
            <svg className="icon" viewBox="0 0 24 24">
              <path
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                fill="#4285F4"
              />
              <path
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                fill="#34A853"
              />
              <path
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                fill="#FBBC05"
              />
              <path
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                fill="#EA4335"
              />
              <path d="M1 1h22v22H1z" fill="none" />
            </svg>
            Continue with Google
          </button>

          {/* SEPARATOR */}
          <div className="separator">
            <div />
            <span>OR</span>
            <div />
          </div>

          {mode === "register" ? (
            <>
              {/* FULL NAME */}
              <input
                type="text"
                name="displayName"
                value={registerForm.displayName}
                onChange={handleRegisterInputChange}
                placeholder="Full Name"
                required
              />

              {/* EMAIL */}
              <input
                type="email"
                name="email"
                value={registerForm.email}
                onChange={handleRegisterInputChange}
                placeholder="Email"
                required
              />

              {/* PASSWORD */}
              <div className="password-input">
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  value={registerForm.password}
                  onChange={handleRegisterInputChange}
                  placeholder="Password"
                  required
                />
                <button
                  type="button"
                  className="password-toggle"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? "🙈" : "👁️"}
                </button>
              </div>

              {/* CONFIRM PASSWORD */}
              <div className="password-input">
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  name="confirmPassword"
                  value={registerForm.confirmPassword}
                  onChange={handleRegisterInputChange}
                  placeholder="Confirm Password"
                  required
                />
                <button
                  type="button"
                  className="password-toggle"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  {showConfirmPassword ? "🙈" : "👁️"}
                </button>
              </div>

              {/* RECAPTCHA */}
              <ReCAPTCHA
                sitekey={process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY}
                onChange={setRecaptchaToken}
              />
            </>
          ) : mode === "forgot" ? (
            <input
              type="email"
              name="resetEmail"
              value={resetEmail}
              onChange={(e) => setResetEmail(e.target.value)}
              placeholder="Email"
              required
            />
          ) : (
            <>
              {/* EMAIL */}
              <input
                type="email"
                name="email"
                value={loginCredentials.email}
                onChange={handleLoginInputChange}
                placeholder="Email"
                required
              />

              {/* PASSWORD */}
              <div className="password-input">
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  value={loginCredentials.password}
                  onChange={handleLoginInputChange}
                  placeholder="Password"
                  required
                />
                <button
                  type="button"
                  className="password-toggle"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? "🙈" : "👁️"}
                </button>
              </div>

              {/* RECAPTCHA */}
              <ReCAPTCHA
                sitekey={process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY}
                onChange={setRecaptchaToken}
              />
            </>
          )}

          {/* SUBMIT BUTTON */}
          <button
            type="submit"
            className="oauthButton"
            disabled={isLoading}
            style={{ opacity: isLoading ? 0.7 : 1 }}
          >
            {isLoading ? (
              "Loading..."
            ) : (
              <>
                {mode === "login"
                  ? "Sign In"
                  : mode === "register"
                  ? "Register"
                  : "Send Reset Email"}
                <svg
                  className="icon"
                  xmlns="http://www.w3.org/2000/svg"
                  width={24}
                  height={24}
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={2}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="m6 17 5-5-5-5" />
                  <path d="m13 17 5-5-5-5" />
                </svg>
              </>
            )}
          </button>

          {/* BOTTOM LINKS - CENTERED */}
          {mode === "login" ? (
            <div
              style={{ textAlign: "center", marginTop: "10px", width: "100%" }}
            >
              <button
                type="button"
                style={{
                  background: "none",
                  border: "none",
                  color: isDark ? "#a0aec0" : "#666",
                  cursor: "pointer",
                  textDecoration: "underline",
                  fontSize: "14px",
                }}
                onClick={() => setMode("forgot")}
              >
                Forgot password?
              </button>
              <div
                style={{
                  marginTop: "15px",
                  fontSize: "14px",
                  color: isDark ? "#a0aec0" : "#666",
                }}
              >
                Don't have an account?{" "}
                <button
                  type="button"
                  style={{
                    background: "none",
                    border: "none",
                    color: isDark ? "#2d8cf0" : "#2d8cf0",
                    cursor: "pointer",
                    textDecoration: "underline",
                    fontSize: "14px",
                  }}
                  onClick={() => setMode("register")}
                >
                  Register
                </button>
              </div>
            </div>
          ) : mode === "register" ? (
            <div
              style={{
                textAlign: "center",
                marginTop: "10px",
                fontSize: "14px",
                color: isDark ? "#a0aec0" : "#666",
                width: "100%",
              }}
            >
              Already have an account?{" "}
              <button
                type="button"
                style={{
                  background: "none",
                  border: "none",
                  color: isDark ? "#2d8cf0" : "#2d8cf0",
                  cursor: "pointer",
                  textDecoration: "underline",
                  fontSize: "14px",
                }}
                onClick={() => setMode("login")}
              >
                Sign In
              </button>
            </div>
          ) : mode === "forgot" ? (
            <div
              style={{ textAlign: "center", marginTop: "10px", width: "100%" }}
            >
              <button
                type="button"
                style={{
                  background: "none",
                  border: "none",
                  color: isDark ? "#a0aec0" : "#666",
                  cursor: "pointer",
                  textDecoration: "underline",
                  fontSize: "14px",
                }}
                onClick={() => setMode("login")}
              >
                Back to Sign In
              </button>
            </div>
          ) : null}
        </form>
      </StyledWrapper>
    </Box>
  );
}
