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
import CompleteOrderModal from "@/components/Modals/CompleteOrderModal";
import CompletedOrderDetailsModal from "@/components/Modals/CompletedOrderDetailsModal";

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

  // COMPLETED ORDERS STATE
  const [completedOrders, setCompletedOrders] = useState([]);
  const [completedOrdersLoading, setCompletedOrdersLoading] = useState(true);
  const [completedOrdersError, setCompletedOrdersError] = useState("");

  // COMPLETE ORDER MODAL STATE
  const [completeOrderModal, setCompleteOrderModal] = useState({
    isOpen: false,
    order: null,
  });

  // COMPLETED ORDER DETAILS MODAL STATE
  const [completedOrderDetailsModal, setCompletedOrderDetailsModal] = useState({
    isOpen: false,
    order: null,
  });

  // REFRESH ORDERS FUNCTION
  const refreshOrders = () => {
    if (!isAuthenticated || !session?.user?.uid) return;

    setOrdersLoading(true);
    const userUid = session.user.uid;
    const endpoint =
      userUid === MASTER_UID
        ? `${process.env.NEXT_PUBLIC_ORDER_API_URL}`
        : `${process.env.NEXT_PUBLIC_ORDER_API_URL}/${userUid}`;

    console.log("REFRESHING ORDERS FROM:", endpoint); // DEBUG LOG

    fetch(endpoint)
      .then((res) => res.json())
      .then((data) => {
        console.log("ORDERS REFRESH RESPONSE:", data); // DEBUG LOG
        console.log("ORDERS COUNT:", data.orders?.length || 0); // DEBUG LOG
        setOrders(data.orders || []);
        setOrdersLoading(false);
      })
      .catch((error) => {
        console.error("ORDERS REFRESH ERROR:", error); // DEBUG LOG
        setOrdersError("Failed to fetch orders.");
        setOrdersLoading(false);
      });
  };

  // REFRESH COMPLETED ORDERS FUNCTION
  const refreshCompletedOrders = () => {
    if (!isAuthenticated || !session?.user?.uid) {
      console.log("REFRESH COMPLETED ORDERS: Not authenticated or no UID"); // DEBUG LOG
      return;
    }

    console.log("REFRESH COMPLETED ORDERS: Starting fetch..."); // DEBUG LOG
    setCompletedOrdersLoading(true);
    const userUid = session.user.uid;
    const endpoint =
      userUid === MASTER_UID
        ? `${process.env.NEXT_PUBLIC_ORDER_API_URL}/completed-orders`
        : `${process.env.NEXT_PUBLIC_ORDER_API_URL}/completed-orders/${userUid}`;

    console.log("FETCHING COMPLETED ORDERS FROM:", endpoint); // DEBUG LOG
    console.log("USER UID:", userUid, "MASTER UID:", MASTER_UID); // DEBUG LOG
    console.log("API URL:", process.env.NEXT_PUBLIC_ORDER_API_URL); // DEBUG LOG

    fetch(endpoint)
      .then((res) => {
        console.log("COMPLETED ORDERS RESPONSE STATUS:", res.status); // DEBUG LOG
        if (!res.ok) {
          throw new Error(`HTTP error! status: ${res.status}`);
        }
        return res.json();
      })
      .then((data) => {
        console.log("COMPLETED ORDERS RESPONSE:", data); // DEBUG LOG
        console.log("COMPLETED ORDERS COUNT:", data.orders?.length || 0); // DEBUG LOG
        console.log("COMPLETED ORDERS SUCCESS:", data.success); // DEBUG LOG
        setCompletedOrders(data.orders || []);
        setCompletedOrdersLoading(false);
      })
      .catch((error) => {
        console.error("COMPLETED ORDERS ERROR:", error); // DEBUG LOG
        setCompletedOrdersError("Failed to fetch completed orders.");
        setCompletedOrdersLoading(false);
      });
  };

  // OPEN COMPLETE ORDER MODAL
  const openCompleteOrderModal = (order) => {
    setCompleteOrderModal({
      isOpen: true,
      order: order,
    });
  };

  // CLOSE COMPLETE ORDER MODAL
  const closeCompleteOrderModal = () => {
    setCompleteOrderModal({
      isOpen: false,
      order: null,
    });
  };

  const openCompletedOrderDetailsModal = (order) => {
    setCompletedOrderDetailsModal({ isOpen: true, order });
  };

  const closeCompletedOrderDetailsModal = () => {
    setCompletedOrderDetailsModal({ isOpen: false, order: null });
  };

  // HANDLE ORDER COMPLETION
  const handleOrderComplete = () => {
    console.log("HANDLE ORDER COMPLETE CALLED"); // DEBUG LOG
    // ADD SMALL DELAY TO ENSURE DATABASE UPDATES ARE REFLECTED
    setTimeout(() => {
      refreshOrders();
      refreshCompletedOrders();
    }, 1000);
  };

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
        // ALWAYS SET LOADING TO FALSE
        setLoading(false);
      } else {
        // ALSO SET LOADING TO FALSE IF NO USER
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
    // DEBUG LOG
    console.log("USER UID:", userUid, "ENDPOINT:", endpoint);
    fetch(endpoint)
      .then((res) => res.json())
      .then((data) => {
        console.log("ORDERS RESPONSE:", data); // DEBUG: LOG RESPONSE DATA
        setOrders(data.orders || []);
        setOrdersLoading(false);
      })
      .catch(() => {
        setOrdersError("Failed to fetch orders.");
        setOrdersLoading(false);
      });
  }, [isAuthenticated, session?.user?.uid]);

  // FETCH COMPLETED ORDERS
  useEffect(() => {
    if (!isAuthenticated || !session?.user?.uid) {
      setCompletedOrders([]);
      setCompletedOrdersLoading(false);
      setCompletedOrdersError(
        "You must be logged in to see your completed orders."
      );
      return;
    }
    console.log("FETCHING COMPLETED ORDERS FOR USER:", session?.user?.uid); // DEBUG LOG
    refreshCompletedOrders();
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

  // DEBUG: LOG RENDER STATE
  console.log("RENDER", {
    ordersLoading,
    orders: orders.length,
    ordersError,
    completedOrdersLoading,
    completedOrders: completedOrders.length,
    completedOrdersError,
    isAuthenticated: !!isAuthenticated,
    userUid: session?.user?.uid,
  });

  if (!isAuthenticated) {
    return <ProtectedRoute />;
  }

  // SHOW SPINNER IF EITHER PROFILE OR ORDERS ARE LOADING
  if (loading || ordersLoading) {
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
              <Tab>Completed Orders</Tab>
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
                      onCompleteOrder={openCompleteOrderModal}
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

              {/* Completed Orders Tab */}
              <TabPanel>
                <Card bg={cardBg}>
                  <CardHeader>
                    <HStack justify="space-between">
                      <Heading size="md">Completed Orders</Heading>
                      <Button
                        size="sm"
                        colorScheme="blue"
                        onClick={refreshCompletedOrders}
                        isLoading={completedOrdersLoading}
                      >
                        Refresh
                      </Button>
                    </HStack>
                  </CardHeader>
                  <CardBody>
                    <CompletedOrdersList
                      orders={completedOrders}
                      loading={completedOrdersLoading}
                      error={completedOrdersError}
                      onOrderClick={openCompletedOrderDetailsModal}
                    />
                  </CardBody>
                </Card>
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
      <CompleteOrderModal
        isOpen={completeOrderModal.isOpen}
        onClose={closeCompleteOrderModal}
        order={completeOrderModal.order}
        onComplete={handleOrderComplete}
      />
      <CompletedOrderDetailsModal
        isOpen={completedOrderDetailsModal.isOpen}
        onClose={closeCompletedOrderDetailsModal}
        order={completedOrderDetailsModal.order}
      />
    </Box>
  );
}

// ========== RECENT ORDERS COMPONENT ==========
function RecentOrders({ orders, loading, error, onCompleteOrder }) {
  const toast = useToast();

  // DOWNLOAD REPORT FUNCTION
  const downloadReport = async (orderId) => {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_ORDER_API_URL}/download-all-completed-files/${orderId}`
      );

      if (response.ok) {
        // CREATE BLOB AND DOWNLOAD
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `${orderId}-report.zip`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);

        toast({
          title: "DOWNLOAD SUCCESSFUL",
          description: "Report downloaded successfully.",
          status: "success",
          duration: 3000,
          isClosable: true,
          position: "top",
        });
      } else {
        throw new Error("DOWNLOAD FAILED");
      }
    } catch (error) {
      console.error("Download report error:", error);
      toast({
        title: "DOWNLOAD FAILED",
        description: "Failed to download report. Please try again.",
        status: "error",
        duration: 3000,
        isClosable: true,
        position: "top",
      });
    }
  };

  if (loading) return <div>Loading recent activity...</div>;
  if (error) return <div>{error}</div>;

  // FILTER OUT COMPLETED ORDERS - ONLY SHOW IN PROGRESS ORDERS IN DASHBOARD
  const inProgressOrders = orders.filter(
    (order) => order.status === "In Progress"
  );

  return (
    <VStack spacing={4} align="stretch">
      {inProgressOrders.length === 0 ? (
        <Text>No active orders found.</Text>
      ) : (
        inProgressOrders.map((order) => (
          <HStack key={order.order_id} justify="space-between">
            <VStack align="start" spacing={1}>
              <Text fontWeight="medium">{order.order_type}</Text>
              <Text fontSize="sm" color="gray.600">
                Order ID: {order.order_id} | {order.status}
              </Text>
            </VStack>
            <HStack spacing={2}>
              <Badge colorScheme="blue">{order.status}</Badge>
              <Button
                size="sm"
                colorScheme="green"
                onClick={() => onCompleteOrder(order)}
              >
                Complete Order
              </Button>
            </HStack>
          </HStack>
        ))
      )}
    </VStack>
  );
}

// ========== COMPLETED ORDERS LIST COMPONENT ==========
function CompletedOrdersList({ orders, loading, error, onOrderClick }) {
  const toast = useToast();

  console.log("COMPLETED ORDERS LIST RENDER:", {
    orders: orders.length,
    loading,
    error,
  }); // DEBUG LOG

  // DOWNLOAD REPORT FUNCTION
  const downloadReport = async (orderId, event) => {
    event.stopPropagation(); // PREVENT MODAL FROM OPENING
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_ORDER_API_URL}/download-all-completed-files/${orderId}`
      );

      if (response.ok) {
        // CREATE BLOB AND DOWNLOAD
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `${orderId}-report.zip`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);

        toast({
          title: "DOWNLOAD SUCCESSFUL",
          description: "Report downloaded successfully.",
          status: "success",
          duration: 3000,
          isClosable: true,
          position: "top",
        });
      } else {
        throw new Error("DOWNLOAD FAILED");
      }
    } catch (error) {
      console.error("Download report error:", error);
      toast({
        title: "DOWNLOAD FAILED",
        description: "Failed to download report. Please try again.",
        status: "error",
        duration: 3000,
        isClosable: true,
        position: "top",
      });
    }
  };

  if (loading) return <div>Loading completed orders...</div>;
  if (error) return <div>{error}</div>;

  return (
    <VStack spacing={4} align="stretch">
      {orders.length === 0 ? (
        <Text>No completed orders found.</Text>
      ) : (
        orders.map((order) => (
          <Box
            key={order.order_id}
            p={4}
            bg="gray.50"
            borderRadius="md"
            cursor="pointer"
            _hover={{ bg: "gray.100" }}
            onClick={() => onOrderClick(order)}
            transition="background-color 0.2s"
          >
            <HStack justify="space-between">
              <VStack align="start" spacing={1}>
                <Text fontWeight="medium">{order.order_type}</Text>
                <Text fontSize="sm" color="gray.600">
                  Order ID: {order.order_id}
                </Text>
                <Text fontSize="sm" color="gray.600">
                  Completed:{" "}
                  {new Date(order.completion_date).toLocaleDateString()}
                </Text>
              </VStack>
              <VStack align="end" spacing={1}>
                <Badge colorScheme="green">COMPLETED</Badge>
                <Button
                  size="sm"
                  colorScheme="blue"
                  onClick={(e) => downloadReport(order.order_id, e)}
                >
                  Download Report
                </Button>
                <Text fontSize="xs" color="blue.600">
                  Click to view details
                </Text>
              </VStack>
            </HStack>
          </Box>
        ))
      )}
    </VStack>
  );
}
