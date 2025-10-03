"use client";
import {
  Box,
  Container,
  VStack,
  HStack,
  Heading,
  Text,
  Button,
  Card,
  CardBody,
  Grid,
  GridItem,
  Icon,
  useColorModeValue,
  Divider,
  Badge,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  StatArrow,
} from "@chakra-ui/react";
import {
  FaFileAlt,
  FaClock,
  FaCheckCircle,
  FaPlus,
  FaHistory,
  FaBell,
  FaDownload,
  FaEye,
} from "react-icons/fa";
import { useAuth } from "@/hooks/useAuth";
import { useRouter } from "next/navigation";
import { useDisclosure } from "@chakra-ui/react";
import StyledLoginModal from "@/components/Auth/StyledLoginModal";
import styled from "styled-components";

// Professional styled button for customer actions
const CustomerButton = styled.button.withConfig({
  shouldForwardProp: (prop) => !["variant"].includes(prop),
})`
  --primary-color: ${(props) =>
    props.variant === "primary" ? "#319795" : "#E2E8F0"};
  --primary-hover: ${(props) =>
    props.variant === "primary" ? "#2C7A7B" : "#CBD5E0"};
  --text-color: ${(props) =>
    props.variant === "primary" ? "#ffffff" : "#4A5568"};

  background: ${(props) =>
    props.variant === "primary"
      ? "linear-gradient(135deg, var(--primary-color) 0%, var(--primary-hover) 100%)"
      : "var(--primary-color)"};
  border: none;
  border-radius: 10px;
  color: var(--text-color);
  font-size: 16px;
  font-weight: 600;
  padding: 16px 32px;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  display: flex;
  align-items: center;
  gap: 8px;
  min-width: 200px;
  justify-content: center;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
    background: ${(props) =>
      props.variant === "primary"
        ? "linear-gradient(135deg, var(--primary-hover) 0%, #285E61 100%)"
        : "var(--primary-hover)"};
  }

  &:active {
    transform: translateY(-1px);
  }
`;

export default function CustomerDashboard() {
  const { isAuthenticated, userRole } = useAuth();
  const router = useRouter();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const bg = useColorModeValue("gray.50", "gray.900");
  const cardBg = useColorModeValue("white", "gray.800");

  // Mock data for customer dashboard
  const stats = {
    totalOrders: 12,
    pendingOrders: 3,
    completedOrders: 9,
    averageResponseTime: "2.5 days",
  };

  const recentOrders = [
    {
      id: "SRV-1759492658835-86CP2Q",
      type: "Vessel Inspection",
      status: "pending",
      date: "2025-01-03",
      urgency: "standard",
    },
    {
      id: "SRV-1759492658834-ABC123",
      type: "Cargo Inspection",
      status: "completed",
      date: "2025-01-01",
      urgency: "urgent",
    },
    {
      id: "SRV-1759492658833-XYZ789",
      type: "Container Inspection",
      status: "pending",
      date: "2024-12-28",
      urgency: "standard",
    },
  ];

  if (!isAuthenticated) {
    return (
      <Box bg={bg} minH="100vh" py={10}>
        <Container maxW="container.xl">
          <VStack spacing={8} textAlign="center" mt={20}>
            <Heading as="h1" size="xl" color="teal.600">
              Customer Dashboard
            </Heading>
            <Text fontSize="lg" color="gray.600">
              Please log in to access your customer dashboard
            </Text>
            <Button colorScheme="teal" size="lg" onClick={onOpen}>
              Login
            </Button>
          </VStack>
        </Container>
        <StyledLoginModal isOpen={isOpen} onClose={onClose} />
      </Box>
    );
  }

  return (
    <Box bg={bg} minH="100vh" py={10}>
      <Container maxW="container.xl">
        <VStack spacing={8} align="stretch">
          {/* Header */}
          <VStack spacing={4} textAlign="center">
            <Heading as="h1" size="xl" color="teal.600">
              Customer Dashboard
            </Heading>
            <Text fontSize="lg" color="gray.600">
              Manage your survey requests and track their progress
            </Text>
          </VStack>

          {/* Quick Actions */}
          <Card bg={cardBg} shadow="lg">
            <CardBody p={8}>
              <VStack spacing={6}>
                <Heading as="h2" size="md" color="teal.600">
                  Quick Actions
                </Heading>
                <HStack spacing={6} wrap="wrap" justify="center">
                  <CustomerButton
                    variant="primary"
                    onClick={() => router.push("/survey-order")}
                  >
                    <FaPlus size={18} />
                    Request New Survey
                  </CustomerButton>
                  <CustomerButton
                    onClick={() => router.push("/customer-orders")}
                  >
                    <FaHistory size={18} />
                    View All Orders
                  </CustomerButton>
                  <CustomerButton
                    onClick={() => router.push("/customer-notifications")}
                  >
                    <FaBell size={18} />
                    Notifications
                  </CustomerButton>
                </HStack>
              </VStack>
            </CardBody>
          </Card>

          {/* Statistics */}
          <Grid templateColumns={{ base: "1fr", md: "repeat(4, 1fr)" }} gap={6}>
            <GridItem>
              <Card bg={cardBg} shadow="md">
                <CardBody p={6}>
                  <Stat>
                    <StatLabel>Total Orders</StatLabel>
                    <StatNumber color="teal.500">
                      {stats.totalOrders}
                    </StatNumber>
                    <StatHelpText>
                      <StatArrow type="increase" />
                      +2 this month
                    </StatHelpText>
                  </Stat>
                </CardBody>
              </Card>
            </GridItem>
            <GridItem>
              <Card bg={cardBg} shadow="md">
                <CardBody p={6}>
                  <Stat>
                    <StatLabel>Pending Orders</StatLabel>
                    <StatNumber color="orange.500">
                      {stats.pendingOrders}
                    </StatNumber>
                    <StatHelpText>In progress</StatHelpText>
                  </Stat>
                </CardBody>
              </Card>
            </GridItem>
            <GridItem>
              <Card bg={cardBg} shadow="md">
                <CardBody p={6}>
                  <Stat>
                    <StatLabel>Completed</StatLabel>
                    <StatNumber color="green.500">
                      {stats.completedOrders}
                    </StatNumber>
                    <StatHelpText>Ready for download</StatHelpText>
                  </Stat>
                </CardBody>
              </Card>
            </GridItem>
            <GridItem>
              <Card bg={cardBg} shadow="md">
                <CardBody p={6}>
                  <Stat>
                    <StatLabel>Avg. Response</StatLabel>
                    <StatNumber color="blue.500">
                      {stats.averageResponseTime}
                    </StatNumber>
                    <StatHelpText>Time to completion</StatHelpText>
                  </Stat>
                </CardBody>
              </Card>
            </GridItem>
          </Grid>

          {/* Recent Orders */}
          <Card bg={cardBg} shadow="lg">
            <CardBody p={8}>
              <VStack spacing={6} align="stretch">
                <HStack justify="space-between">
                  <Heading as="h2" size="md" color="teal.600">
                    Recent Survey Orders
                  </Heading>
                  <Button variant="outline" colorScheme="teal" size="sm">
                    View All
                  </Button>
                </HStack>

                <VStack spacing={4} align="stretch">
                  {recentOrders.map((order, index) => (
                    <Box key={order.id}>
                      <HStack
                        justify="space-between"
                        p={4}
                        bg="gray.50"
                        borderRadius="lg"
                      >
                        <VStack align="start" spacing={1}>
                          <HStack>
                            <Text fontWeight="bold" fontSize="sm">
                              {order.id}
                            </Text>
                            <Badge
                              colorScheme={
                                order.status === "completed"
                                  ? "green"
                                  : "orange"
                              }
                              size="sm"
                            >
                              {order.status}
                            </Badge>
                            <Badge
                              colorScheme={
                                order.urgency === "urgent" ? "red" : "gray"
                              }
                              size="sm"
                            >
                              {order.urgency}
                            </Badge>
                          </HStack>
                          <Text fontSize="sm" color="gray.600">
                            {order.type} • {order.date}
                          </Text>
                        </VStack>
                        <HStack spacing={2}>
                          <Button
                            size="sm"
                            variant="ghost"
                            leftIcon={<FaEye />}
                          >
                            View
                          </Button>
                          {order.status === "completed" && (
                            <Button
                              size="sm"
                              variant="ghost"
                              leftIcon={<FaDownload />}
                            >
                              Download
                            </Button>
                          )}
                        </HStack>
                      </HStack>
                      {index < recentOrders.length - 1 && <Divider />}
                    </Box>
                  ))}
                </VStack>
              </VStack>
            </CardBody>
          </Card>

          {/* Help Section */}
          <Card bg={cardBg} shadow="md">
            <CardBody p={8}>
              <VStack spacing={4} textAlign="center">
                <Heading as="h2" size="md" color="teal.600">
                  Need Help?
                </Heading>
                <Text color="gray.600">
                  Our customer support team is here to help you with your survey
                  requests.
                </Text>
                <HStack spacing={4}>
                  <Button colorScheme="teal" variant="outline">
                    Contact Support
                  </Button>
                  <Button colorScheme="teal" variant="outline">
                    View Documentation
                  </Button>
                </HStack>
              </VStack>
            </CardBody>
          </Card>
        </VStack>
      </Container>
    </Box>
  );
}
