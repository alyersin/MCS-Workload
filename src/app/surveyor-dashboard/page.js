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
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  StatArrow,
  useColorModeValue,
  Badge,
  Divider,
} from "@chakra-ui/react";
import {
  FaPlus,
  FaClipboardList,
  FaClock,
  FaCheckCircle,
  FaEye,
  FaEdit,
  FaFileAlt,
} from "react-icons/fa";
import { useAuth } from "@/hooks/useAuth";
import { useRouter } from "next/navigation";
import { useDisclosure } from "@chakra-ui/react";
import StyledLoginModal from "@/components/Auth/StyledLoginModal";
import styled from "styled-components";

// Professional styled button for surveyor actions
const SurveyorButton = styled.button.withConfig({
  shouldForwardProp: (prop) => !["variant"].includes(prop),
})`
  --primary-color: ${(props) =>
    props.variant === "primary" ? "#2B6CB0" : "#E2E8F0"};
  --primary-hover: ${(props) =>
    props.variant === "primary" ? "#2C5282" : "#CBD5E0"};
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
        ? "linear-gradient(135deg, var(--primary-hover) 0%, #2A4A6B 100%)"
        : "var(--primary-hover)"};
  }

  &:active {
    transform: translateY(-1px);
  }
`;

export default function SurveyorDashboard() {
  const { isAuthenticated, userRole } = useAuth();
  const router = useRouter();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const bg = useColorModeValue("gray.50", "gray.900");
  const cardBg = useColorModeValue("white", "gray.800");

  // Mock data for surveyor dashboard
  const stats = {
    totalProjects: 24,
    activeProjects: 8,
    completedProjects: 16,
    pendingAssignments: 3,
  };

  const availableServices = [
    {
      name: "Container → Truck",
      path: "/services/transloading/container-truck",
      icon: FaFileAlt,
    },
    {
      name: "Truck → Container",
      path: "/services/transloading/truck-container",
      icon: FaFileAlt,
    },
    {
      name: "Container Stripping",
      path: "/services/stripping",
      icon: FaFileAlt,
    },
    { name: "Container Stuffing", path: "/services/stuffing", icon: FaFileAlt },
    {
      name: "Stripping & Restuffing",
      path: "/services/stripping-restuffing",
      icon: FaFileAlt,
    },
    {
      name: "Transshipment C2C",
      path: "/services/transshipment-C2C",
      icon: FaFileAlt,
    },
    {
      name: "Vessel/Barge Survey",
      path: "/services/vessel-barge",
      icon: FaFileAlt,
    },
    { name: "Lashing Report", path: "/services/lashing", icon: FaFileAlt },
  ];

  if (!isAuthenticated) {
    return (
        <Box bg={bg} minH="100vh" py={10}>
          <Container maxW="container.xl">
            <VStack spacing={8} textAlign="center" mt={20}>
            <Heading as="h1" size="xl" color="blue.600">
              Surveyor Dashboard
            </Heading>
            <Text fontSize="lg" color="gray.600">
              Please log in to access your surveyor dashboard
            </Text>
            <Button colorScheme="blue" size="lg" onClick={onOpen}>
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
            <Heading as="h1" size="xl" color="blue.600">
              Surveyor Dashboard
            </Heading>
            <Text fontSize="lg" color="gray.600">
              Create professional survey reports and manage your projects
            </Text>
          </VStack>

          {/* Quick Actions */}
          <Card bg={cardBg} shadow="lg">
            <CardBody p={8}>
              <VStack spacing={6}>
                <Heading as="h2" size="md" color="blue.600">
                  Quick Actions
                </Heading>
                <HStack spacing={6} wrap="wrap" justify="center">
                  <SurveyorButton
                    variant="primary"
                    onClick={() => router.push("/surveyor-projects")}
                  >
                    <FaClipboardList size={18} />
                    View All Projects
                  </SurveyorButton>
                  <SurveyorButton
                    onClick={() => router.push("/surveyor-orders")}
                  >
                    <FaClock size={18} />
                    Pending Orders
                  </SurveyorButton>
                  <SurveyorButton
                    onClick={() => router.push("/surveyor-reports")}
                  >
                    <FaCheckCircle size={18} />
                    Completed Reports
                  </SurveyorButton>
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
                    <StatLabel>Total Projects</StatLabel>
                    <StatNumber color="blue.500">
                      {stats.totalProjects}
                    </StatNumber>
                    <StatHelpText>
                      <StatArrow type="increase" />
                      +5 this month
                    </StatHelpText>
                  </Stat>
                </CardBody>
              </Card>
            </GridItem>
            <GridItem>
              <Card bg={cardBg} shadow="md">
                <CardBody p={6}>
                  <Stat>
                    <StatLabel>Active Projects</StatLabel>
                    <StatNumber color="orange.500">
                      {stats.activeProjects}
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
                      {stats.completedProjects}
                    </StatNumber>
                    <StatHelpText>Ready for delivery</StatHelpText>
                  </Stat>
                </CardBody>
              </Card>
            </GridItem>
            <GridItem>
              <Card bg={cardBg} shadow="md">
                <CardBody p={6}>
                  <Stat>
                    <StatLabel>Pending</StatLabel>
                    <StatNumber color="red.500">
                      {stats.pendingAssignments}
                    </StatNumber>
                    <StatHelpText>Awaiting assignment</StatHelpText>
                  </Stat>
                </CardBody>
              </Card>
            </GridItem>
          </Grid>

          {/* Start New Project */}
          <Card bg={cardBg} shadow="lg">
            <CardBody p={8}>
              <VStack spacing={6}>
                <Heading as="h2" size="md" color="blue.600">
                  Start New Project
                </Heading>
                <Text color="gray.600" textAlign="center">
                  Choose the type of survey report you want to create
                </Text>
                <Grid
                  templateColumns={{
                    base: "1fr",
                    md: "repeat(2, 1fr)",
                    lg: "repeat(4, 1fr)",
                  }}
                  gap={4}
                  w="100%"
                >
                  {availableServices.map((service, index) => (
                    <GridItem key={index}>
                      <SurveyorButton
                        onClick={() => router.push(service.path)}
                        style={{
                          minWidth: "100%",
                          flexDirection: "column",
                          padding: "20px 16px",
                          gap: "12px",
                        }}
                      >
                        <service.icon size={24} />
                        <Text fontSize="sm" textAlign="center">
                          {service.name}
                        </Text>
                      </SurveyorButton>
                    </GridItem>
                  ))}
                </Grid>
              </VStack>
            </CardBody>
          </Card>

          {/* Recent Activity */}
          <Card bg={cardBg} shadow="lg">
            <CardBody p={8}>
              <VStack spacing={6} align="stretch">
                <HStack justify="space-between">
                  <Heading as="h2" size="md" color="blue.600">
                    Recent Activity
                  </Heading>
                  <Button variant="outline" colorScheme="blue" size="sm">
                    View All
                  </Button>
                </HStack>

                <VStack spacing={3} align="stretch">
                  <HStack
                    justify="space-between"
                    p={3}
                    bg="gray.50"
                    borderRadius="lg"
                  >
                    <VStack align="start" spacing={0}>
                      <Text fontWeight="bold" fontSize="sm">
                        Container → Truck Survey
                      </Text>
                      <Text fontSize="xs" color="gray.600">
                        Order ID: SRV-1759492658835-86CP2Q • 2 hours ago
                      </Text>
                    </VStack>
                    <HStack>
                      <Badge colorScheme="orange">In Progress</Badge>
                      <Button size="sm" variant="ghost" leftIcon={<FaEdit />}>
                        Edit
                      </Button>
                    </HStack>
                  </HStack>

                  <HStack
                    justify="space-between"
                    p={3}
                    bg="gray.50"
                    borderRadius="lg"
                  >
                    <VStack align="start" spacing={0}>
                      <Text fontWeight="bold" fontSize="sm">
                        Vessel Inspection Report
                      </Text>
                      <Text fontSize="xs" color="gray.600">
                        Order ID: SRV-1759492658834-ABC123 • 1 day ago
                      </Text>
                    </VStack>
                    <HStack>
                      <Badge colorScheme="green">Completed</Badge>
                      <Button size="sm" variant="ghost" leftIcon={<FaEye />}>
                        View
                      </Button>
                    </HStack>
                  </HStack>
                </VStack>
              </VStack>
            </CardBody>
          </Card>

          {/* Help Section */}
          <Card bg={cardBg} shadow="md">
            <CardBody p={8}>
              <VStack spacing={4} textAlign="center">
                <Heading as="h2" size="md" color="blue.600">
                  Need Support?
                </Heading>
                <Text color="gray.600">
                  Access our documentation and get help with creating
                  professional survey reports.
                </Text>
                <HStack spacing={4}>
                  <Button colorScheme="blue" variant="outline">
                    Documentation
                  </Button>
                  <Button colorScheme="blue" variant="outline">
                    Training Materials
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
