"use client";

import React, { useState } from "react";
import {
  Box,
  Container,
  Grid,
  GridItem,
  VStack,
  HStack,
  Text,
  Heading,
  Card,
  CardBody,
  CardHeader,
  Button,
  Input,
  FormControl,
  FormLabel,
  Avatar,
  Badge,
  Divider,
  useToast,
  useColorModeValue,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  StatArrow,
} from "@chakra-ui/react";
import { useAuth } from "@/hooks/useAuth";
import ProtectedRoute from "@/components/Auth/ProtectedRoute";
import { db } from "@/utils/firebaseClient";
import { doc, setDoc, getDoc } from "firebase/firestore";
import { getAuth } from "firebase/auth";

// USER PROFILE PAGE
export default function ProfilePage() {
  const { session, isAuthenticated } = useAuth();
  const toast = useToast();
  const [isEditing, setIsEditing] = useState(false);
  const [profileData, setProfileData] = useState({
    name: session?.user?.name || "",
    email: session?.user?.email || "",
    phone: "",
    company: "",
    position: "",
  });

  const bgColor = useColorModeValue("gray.50", "gray.900");
  const cardBg = useColorModeValue("white", "gray.800");

  const handleSave = async () => {
    try {
      const auth = getAuth();
      const currentUser = auth.currentUser;
      if (!currentUser) throw new Error("Not authenticated");
      const uid = currentUser.uid;

      const userRef = doc(db, "users", uid);
      const { name, phone, company, position } = profileData;

      await setDoc(
        userRef,
        { name, phone, company, position },
        { merge: true }
      );

      toast({
        title: "Profile Updated",
        description: "Your profile has been successfully updated.",
        status: "success",
        duration: 3000,
        isClosable: true,
      });

      setIsEditing(false);
    } catch (error) {
      console.error("Error saving profile:", error);
      toast({
        title: "Error updating profile",
        description: error.message,
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    }
  };

  const handleCancel = () => {
    setProfileData({
      name: session?.user?.name || "",
      email: session?.user?.email || "",
      phone: "",
      company: "",
      position: "",
    });
    setIsEditing(false);
  };

  if (!isAuthenticated) {
    return <ProtectedRoute />;
  }

  return (
    <Box bg={bgColor} minH="100vh" py={8}>
      <Container maxW="container.xl">
        <VStack spacing={8} align="stretch">
          {/* Header */}
          <Box>
            <Heading size="lg" mb={2}>
              Profile Dashboard
            </Heading>
            <Text color="gray.600">
              Welcome back, {session?.user?.name}! Manage your account and view
              your activity.
            </Text>
          </Box>

          <Tabs variant="enclosed">
            <TabList>
              <Tab>Dashboard</Tab>
              <Tab>Profile</Tab>
              <Tab>Settings</Tab>
            </TabList>

            <TabPanels>
              {/* Dashboard Tab */}
              <TabPanel>
                <Grid
                  templateColumns={{ base: "1fr", md: "repeat(2, 1fr)" }}
                  gap={6}
                >
                  {/* Quick Stats */}
                  <Card bg={cardBg}>
                    <CardBody>
                      <Stat>
                        <StatLabel>Total Orders</StatLabel>
                        <StatNumber>24</StatNumber>
                        <StatHelpText>
                          <StatArrow type="increase" />
                          12.5%
                        </StatHelpText>
                      </Stat>
                    </CardBody>
                  </Card>

                  <Card bg={cardBg}>
                    <CardBody>
                      <Stat>
                        <StatLabel>Active Services</StatLabel>
                        <StatNumber>3</StatNumber>
                        <StatHelpText>
                          <StatArrow type="increase" />
                          8.2%
                        </StatHelpText>
                      </Stat>
                    </CardBody>
                  </Card>
                </Grid>

                {/* Recent Activity */}
                <Card bg={cardBg} mt={6}>
                  <CardHeader>
                    <Heading size="md">Recent Activity</Heading>
                  </CardHeader>
                  <CardBody>
                    <VStack spacing={4} align="stretch">
                      <HStack justify="space-between">
                        <VStack align="start" spacing={1}>
                          <Text fontWeight="medium">
                            Container → Truck Service
                          </Text>
                          <Text fontSize="sm" color="gray.600">
                            Order #12345 completed
                          </Text>
                        </VStack>
                        <Badge colorScheme="green">Completed</Badge>
                      </HStack>
                      <Divider />
                      <HStack justify="space-between">
                        <VStack align="start" spacing={1}>
                          <Text fontWeight="medium">Storage → Container</Text>
                          <Text fontSize="sm" color="gray.600">
                            Order #12344 in progress
                          </Text>
                        </VStack>
                        <Badge colorScheme="blue">In Progress</Badge>
                      </HStack>
                      <Divider />
                      <HStack justify="space-between">
                        <VStack align="start" spacing={1}>
                          <Text fontWeight="medium">Transshipment (C2C)</Text>
                          <Text fontSize="sm" color="gray.600">
                            Order #12343 scheduled
                          </Text>
                        </VStack>
                        <Badge colorScheme="yellow">Scheduled</Badge>
                      </HStack>
                    </VStack>
                  </CardBody>
                </Card>
              </TabPanel>

              {/* Profile Tab */}
              <TabPanel>
                <Grid
                  templateColumns={{ base: "1fr", lg: "300px 1fr" }}
                  gap={8}
                >
                  {/* Profile Picture */}
                  <Card bg={cardBg}>
                    <CardBody>
                      <VStack spacing={4}>
                        <Avatar size="xl" name={session?.user?.name} />
                        <VStack spacing={2}>
                          <Text fontWeight="bold" fontSize="lg">
                            {session?.user?.name}
                          </Text>
                          <Text fontSize="sm" color="gray.600">
                            {session?.user?.email}
                          </Text>
                          <Badge colorScheme="blue">Active User</Badge>
                        </VStack>
                      </VStack>
                    </CardBody>
                  </Card>

                  {/* Profile Form */}
                  <Card bg={cardBg}>
                    <CardHeader>
                      <HStack justify="space-between">
                        <Heading size="md">Profile Information</Heading>
                        {!isEditing ? (
                          <Button
                            colorScheme="blue"
                            onClick={() => setIsEditing(true)}
                          >
                            Edit Profile
                          </Button>
                        ) : (
                          <HStack>
                            <Button colorScheme="green" onClick={handleSave}>
                              Save
                            </Button>
                            <Button variant="outline" onClick={handleCancel}>
                              Cancel
                            </Button>
                          </HStack>
                        )}
                      </HStack>
                    </CardHeader>
                    <CardBody>
                      <VStack spacing={4}>
                        <FormControl>
                          <FormLabel>Full Name</FormLabel>
                          <Input
                            value={profileData.name}
                            onChange={(e) =>
                              setProfileData({
                                ...profileData,
                                name: e.target.value,
                              })
                            }
                            isDisabled={!isEditing}
                          />
                        </FormControl>

                        <FormControl>
                          <FormLabel>Email</FormLabel>
                          <Input
                            value={profileData.email}
                            onChange={(e) =>
                              setProfileData({
                                ...profileData,
                                email: e.target.value,
                              })
                            }
                            isDisabled={!isEditing}
                          />
                        </FormControl>

                        <FormControl>
                          <FormLabel>Phone Number</FormLabel>
                          <Input
                            value={profileData.phone}
                            onChange={(e) =>
                              setProfileData({
                                ...profileData,
                                phone: e.target.value,
                              })
                            }
                            isDisabled={!isEditing}
                            placeholder="Enter phone number"
                          />
                        </FormControl>

                        <FormControl>
                          <FormLabel>Company</FormLabel>
                          <Input
                            value={profileData.company}
                            onChange={(e) =>
                              setProfileData({
                                ...profileData,
                                company: e.target.value,
                              })
                            }
                            isDisabled={!isEditing}
                            placeholder="Enter company name"
                          />
                        </FormControl>

                        <FormControl>
                          <FormLabel>Position</FormLabel>
                          <Input
                            value={profileData.position}
                            onChange={(e) =>
                              setProfileData({
                                ...profileData,
                                position: e.target.value,
                              })
                            }
                            isDisabled={!isEditing}
                            placeholder="Enter your position"
                          />
                        </FormControl>
                      </VStack>
                    </CardBody>
                  </Card>
                </Grid>
              </TabPanel>

              {/* Settings Tab */}
              <TabPanel>
                <Card bg={cardBg}>
                  <CardHeader>
                    <Heading size="md">Account Settings</Heading>
                  </CardHeader>
                  <CardBody>
                    <VStack spacing={6} align="stretch">
                      <Box>
                        <Heading size="sm" mb={3}>
                          Notifications
                        </Heading>
                        <VStack spacing={3} align="stretch">
                          <HStack justify="space-between">
                            <Text>Email Notifications</Text>
                            <Button size="sm" colorScheme="blue">
                              Configure
                            </Button>
                          </HStack>
                          <HStack justify="space-between">
                            <Text>SMS Notifications</Text>
                            <Button size="sm" colorScheme="blue">
                              Configure
                            </Button>
                          </HStack>
                        </VStack>
                      </Box>

                      <Divider />

                      <Box>
                        <Heading size="sm" mb={3}>
                          Security
                        </Heading>
                        <VStack spacing={3} align="stretch">
                          <HStack justify="space-between">
                            <Text>Change Password</Text>
                            <Button size="sm" colorScheme="blue">
                              Update
                            </Button>
                          </HStack>
                          <HStack justify="space-between">
                            <Text>Two-Factor Authentication</Text>
                            <Button size="sm" colorScheme="blue">
                              Enable
                            </Button>
                          </HStack>
                        </VStack>
                      </Box>

                      <Divider />

                      <Box>
                        <Heading size="sm" mb={3}>
                          Data & Privacy
                        </Heading>
                        <VStack spacing={3} align="stretch">
                          <HStack justify="space-between">
                            <Text>Download My Data</Text>
                            <Button size="sm" colorScheme="blue">
                              Download
                            </Button>
                          </HStack>
                          <HStack justify="space-between">
                            <Text>Delete Account</Text>
                            <Button
                              size="sm"
                              colorScheme="red"
                              variant="outline"
                            >
                              Delete
                            </Button>
                          </HStack>
                        </VStack>
                      </Box>
                    </VStack>
                  </CardBody>
                </Card>
              </TabPanel>
            </TabPanels>
          </Tabs>
        </VStack>
      </Container>
    </Box>
  );
}
