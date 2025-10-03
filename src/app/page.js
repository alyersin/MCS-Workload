"use client";
import {
  Box,
  Heading,
  Text,
  Button,
  VStack,
  Container,
  HStack,
} from "@chakra-ui/react";
import { FaUser, FaClipboardCheck } from "react-icons/fa";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import styled from "styled-components";

// PROFESSIONAL STYLED ACCESS BUTTONS
const StyledButton = styled.button.withConfig({
  shouldForwardProp: (prop) => !["isDark", "variant"].includes(prop),
})`
  --primary-bg: ${(props) =>
    props.variant === "customer" ? "#319795" : "#2B6CB0"};
  --primary-hover: ${(props) =>
    props.variant === "customer" ? "#2C7A7B" : "#2C5282"};
  --primary-active: ${(props) =>
    props.variant === "customer" ? "#285E61" : "#2A4A6B"};
  --text-color: #ffffff;
  --shadow-light: rgba(0, 0, 0, 0.1);
  --shadow-medium: rgba(0, 0, 0, 0.15);
  --shadow-strong: rgba(0, 0, 0, 0.2);

  background: linear-gradient(
    135deg,
    var(--primary-bg) 0%,
    var(--primary-hover) 100%
  );
  border: none;
  border-radius: 12px;
  color: var(--text-color);
  font-size: 16px;
  font-weight: 600;
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
  letter-spacing: 0.025em;
  padding: 16px 32px;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
  overflow: hidden;
  min-width: 180px;
  box-shadow: 0 4px 12px var(--shadow-light), 0 2px 4px var(--shadow-light);

  /* Professional icon styling */
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;

  /* Subtle shine effect */
  &::before {
    content: "";
    position: absolute;
    top: 0;
    left: -100%;
    width: 100%;
    height: 100%;
    background: linear-gradient(
      90deg,
      transparent,
      rgba(255, 255, 255, 0.2),
      transparent
    );
    transition: left 0.5s;
  }

  &:hover {
    background: linear-gradient(
      135deg,
      var(--primary-hover) 0%,
      var(--primary-active) 100%
    );
    transform: translateY(-2px);
    box-shadow: 0 8px 25px var(--shadow-medium), 0 4px 12px var(--shadow-light);

    &::before {
      left: 100%;
    }
  }

  &:active {
    transform: translateY(-1px);
    box-shadow: 0 4px 12px var(--shadow-strong), 0 2px 6px var(--shadow-light);
  }

  &:focus {
    outline: none;
    box-shadow: 0 4px 12px var(--shadow-light), 0 2px 4px var(--shadow-light),
      0 0 0 4px rgba(49, 151, 149, 0.2);
  }

  /* Disabled state */
  &:disabled {
    background: #e2e8f0;
    color: #a0aec0;
    cursor: not-allowed;
    transform: none;
    box-shadow: none;

    &:hover {
      transform: none;
      box-shadow: none;
    }
  }

  /* Responsive design */
  @media (max-width: 768px) {
    min-width: 160px;
    padding: 14px 28px;
    font-size: 15px;
  }
`;

// MAIN LANDING PAGE
export default function Home() {
  const router = useRouter();
  const { isAuthenticated } = useAuth();

  const handleCustomerAccess = () => {
    router.push("/customer-dashboard");
  };

  const handleSurveyorAccess = () => {
    router.push("/surveyor-dashboard");
  };

  return (
    <Box
      flex="1"
      display="flex"
      alignItems="center"
      justifyContent="center"
      px={4}
    >
      <Container maxW="lg" textAlign="center">
        <VStack spacing={6}>
          <Heading as="h1" size="xl" color="teal.600">
            Welcome to MCS Workload Portal
          </Heading>
          <Text fontSize="lg" color="gray.700">
            A streamlined platform for creating, submitting, and managing
            operational survey reports efficiently and securely.
          </Text>

          {/* Always show access buttons */}
          <VStack spacing={6} mt={8}>
            <Text
              fontSize="lg"
              color="gray.600"
              fontWeight="semibold"
              textTransform="uppercase"
              letterSpacing="wide"
            >
              Choose your access type
            </Text>
            <HStack spacing={8} justify="center" wrap="wrap">
              <StyledButton variant="customer" onClick={handleCustomerAccess}>
                <FaUser size={18} />
                Customer
              </StyledButton>
              <StyledButton variant="surveyor" onClick={handleSurveyorAccess}>
                <FaClipboardCheck size={18} />
                Surveyor
              </StyledButton>
            </HStack>
          </VStack>
        </VStack>
      </Container>
    </Box>
  );
}
