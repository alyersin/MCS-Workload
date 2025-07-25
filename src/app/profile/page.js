"use client";

import React, { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
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
  Spinner,
  Center,
} from "@chakra-ui/react";
import { useAuth } from "@/hooks/useAuth";
import ProtectedRoute from "@/components/Auth/ProtectedRoute";
import { db } from "@/utils/firebaseClient";
import { doc, setDoc, getDoc } from "firebase/firestore";
import { onAuthStateChanged, getAuth } from "firebase/auth";
import { signInFirebaseWithCustomToken } from "@/utils/ensureFirebaseAuth";

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
  const [loading, setLoading] = useState(true);
  const searchParams = useSearchParams();
  const tabParam = searchParams.get("tab");
  const initialTab =
    tabParam === "dashboard"
      ? 0
      : tabParam === "profile"
      ? 1
      : tabParam === "settings"
      ? 2
      : 0;
  const [tabIndex, setTabIndex] = useState(initialTab);

  // MASTER UID FOR ORDER DASHBOARD
  const MASTER_UID = "quoewgWQEOYmsYbv7JNsNPhR1rh1";
  const [orders, setOrders] = useState([]);
  const [ordersLoading, setOrdersLoading] = useState(true);
  const [ordersError, setOrdersError] = useState("");

  // FETCH USER PROFILE FROM FIRESTORE ON MOUNT
  useEffect(() => {
    setLoading(true);
    const auth = getAuth();
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        const uid = user.uid;
        const userRef = doc(db, "users", uid);
        const userSnap = await getDoc(userRef);
        if (userSnap.exists()) {
          const data = userSnap.data();
          setProfileData({
            name: data.name || "",
            email: data.email || session?.user?.email || "",
            phone: data.phone || "",
            company: data.company || "",
            position: data.position || "",
          });
        }
        setLoading(false);
      }
    });
    return () => unsubscribe();
  }, [isAuthenticated, session?.user?.email]);
  // NOTE: IF YOU SEE FIREBASE PERMISSION ERRORS, CHECK YOUR FIRESTORE SECURITY RULES

  // FETCH ORDERS FOR DASHBOARD STATS AND RECENT ACTIVITY
  useEffect(() => {
    // USE SESSION USER UID FOR AUTH CHECK
    if (!isAuthenticated || !session?.user?.uid) {
      setOrders([]);
      setOrdersLoading(false);
      setOrdersError("You must be logged in to see your orders.");
      return;
    }
    setOrdersLoading(true);
    const userUid = session.user.uid;
    // IF MASTER, FETCH ALL ORDERS; ELSE, FETCH ONLY USER'S ORDERS
    const endpoint =
      userUid === MASTER_UID
        ? `${process.env.NEXT_PUBLIC_ORDER_API_URL}`
        : `${process.env.NEXT_PUBLIC_ORDER_API_URL}/${userUid}`;
    fetch(endpoint)
      .then((res) => res.json())
      .then((data) => {
        setOrders(data.orders || []);
        setOrdersLoading(false);
      })
      .catch(() => {
        setOrdersError("Failed to fetch orders.");
        setOrdersLoading(false);
      });
  }, [isAuthenticated, session?.user?.uid]);

  // CALCULATE STATS FROM ORDERS
  const totalOrders = orders.length;
  const activeServices = orders.filter(
    (o) => o.status === "In Progress"
  ).length;

  const bgColor = useColorModeValue("gray.50", "gray.900");
  const cardBg = useColorModeValue("white", "gray.800");

  // HANDLE SAVE: UPDATE USER PROFILE IN FIRESTORE
  const handleSave = async () => {
    try {
      const auth = getAuth();
      const currentUser = auth.currentUser;
      if (!currentUser) throw new Error("Not authenticated");
      const uid = currentUser.uid;
      const userRef = doc(db, "users", uid);
      const { name, phone, company, position, email } = profileData;
      await setDoc(
        userRef,
        { name, phone, company, position, email },
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

  if (loading) {
    return (
      <Center minH="100vh">
        <Spinner size="xl" />
      </Center>
    );
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

          <Tabs variant="enclosed" index={tabIndex} onChange={setTabIndex}>
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
                        <StatNumber>
                          {ordersLoading ? <Spinner size="sm" /> : totalOrders}
                        </StatNumber>
                        {/* STAT HELP TEXT CAN BE CUSTOMIZED OR REMOVED */}
                        <StatHelpText>
                          <StatArrow type="increase" />
                          {/* PLACEHOLDER PERCENTAGE */}
                          0%
                        </StatHelpText>
                      </Stat>
                    </CardBody>
                  </Card>

                  <Card bg={cardBg}>
                    <CardBody>
                      <Stat>
                        <StatLabel>Active Services</StatLabel>
                        <StatNumber>
                          {ordersLoading ? (
                            <Spinner size="sm" />
                          ) : (
                            activeServices
                          )}
                        </StatNumber>
                        <StatHelpText>
                          <StatArrow type="increase" />
                          {/* PLACEHOLDER PERCENTAGE */}
                          0%
                        </StatHelpText>
                      </Stat>
                    </CardBody>
                  </Card>
                </Grid>

                <Card bg={cardBg} mt={6}>
                  <CardHeader>
                    <Heading size="md">Recent Activity</Heading>
                  </CardHeader>
                  <CardBody>
                    <RecentOrders
                      orders={orders}
                      loading={ordersLoading}
                      error={ordersError}
                    />
                  </CardBody>
                </Card>
              </TabPanel>

              <TabPanel>
                <Grid
                  templateColumns={{ base: "1fr", lg: "300px 1fr" }}
                  gap={8}
                >
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

// ========== RECENT ORDERS COMPONENT ==========
function RecentOrders({ orders, loading, error }) {
  if (loading) return <div>Loading recent activity...</div>;
  if (error) return <div>{error}</div>;

  return (
    <VStack spacing={4} align="stretch">
      {orders.length === 0 ? (
        <Text>No recent orders found.</Text>
      ) : (
        orders.map((order) => (
          <HStack key={order.order_id} justify="space-between">
            <VStack align="start" spacing={1}>
              <Text fontWeight="medium">{order.order_type}</Text>
              <Text fontSize="sm" color="gray.600">
                Order ID: {order.order_id} | {order.status}
              </Text>
            </VStack>
            <Badge
              colorScheme={
                order.status === "Completed"
                  ? "green"
                  : order.status === "In Progress"
                  ? "blue"
                  : "yellow"
              }
            >
              {order.status}
            </Badge>
          </HStack>
        ))
      )}
    </VStack>
  );
}
