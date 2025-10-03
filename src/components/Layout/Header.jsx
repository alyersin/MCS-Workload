"use client";

import React from "react";
import styled from "styled-components";
import {
  Box,
  Flex,
  Image,
  Link,
  Menu,
  Text,
  MenuButton,
  MenuList,
  MenuItem,
  MenuGroup,
  MenuDivider,
  Button,
  IconButton,
  useDisclosure,
  Drawer,
  DrawerOverlay,
  DrawerContent,
  DrawerCloseButton,
  DrawerHeader,
  DrawerBody,
  VStack,
  HStack,
  useColorModeValue,
  Avatar,
  Menu as ChakraMenu,
  MenuButton as ChakraMenuButton,
  MenuList as ChakraMenuList,
  MenuItem as ChakraMenuItem,
  Spinner,
  useColorMode,
} from "@chakra-ui/react";
import { HamburgerIcon } from "@chakra-ui/icons";
import { useAuth } from "@/hooks/useAuth";
import StyledLoginModal from "@/components/Auth/StyledLoginModal";
import { useRouter } from "next/navigation";
import ColorModeSwitch from "@/components/UI/ColorModeSwitch";
import TestAuthModal from "../Modals/TestAuthModal";
import GDPRBanner from "../Modals/GDPRModal";

// STYLED COMPONENTS FOR HEADER BUTTONS
const StyledButton = styled.button.withConfig({
  shouldForwardProp: (prop) => !["isDark", "fullWidth"].includes(prop),
})`
  --input-focus: #2d8cf0;
  --font-color: ${(props) => (props.isDark ? "#e2e8f0" : "#323232")};
  --bg-color: ${(props) => (props.isDark ? "#4a5568" : "#fff")};
  --main-color: ${(props) => (props.isDark ? "#e2e8f0" : "#323232")};

  display: flex;
  justify-content: center;
  align-items: center;
  gap: 5px;
  padding: 8px 16px;
  width: ${(props) => (props.fullWidth ? "100%" : "auto")};
  height: 32px;
  border-radius: 5px;
  border: 2px solid var(--main-color);
  background-color: var(--bg-color);
  box-shadow: 4px 4px var(--main-color);
  font-size: 14px;
  font-weight: 600;
  color: var(--font-color);
  cursor: pointer;
  transition: all 250ms;
  position: relative;
  overflow: hidden;
  z-index: 1;

  &::before {
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

  &:hover {
    color: #e8e8e8;
  }

  &:hover::before {
    width: 100%;
  }

  &:disabled {
    opacity: 0.7;
    cursor: not-allowed;
  }

  &:disabled:hover::before {
    width: 0;
  }
`;

// HEADER COMPONENT
export default function Header() {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [isLoginModalOpen, setLoginModalOpen] = React.useState(false);
  const [modalMode, setModalMode] = React.useState("login");
  const {
    session,
    isAuthenticated,
    logout,
    isLoading,
    isCustomer,
    isSurveyor,
  } = useAuth();
  const router = useRouter();
  const { colorMode, toggleColorMode } = useColorMode();
  const isDark = useColorModeValue(false, true);

  const handleLoginOpen = () => {
    setModalMode("login");
    setLoginModalOpen(true);
  };
  const handleLoginClose = () => setLoginModalOpen(false);
  const handleRegister = () => {
    setModalMode("register");
    setLoginModalOpen(true);
  };

  const navLinks = (
    <VStack align="start" spacing={4}>
      <Link href="/" textDecoration="none" _hover={{ textDecoration: "none" }}>
        Home
      </Link>

      {/* Services Menu - Only for Surveyors and Admins */}
      {isAuthenticated && !isCustomer && (
        <Menu>
          <MenuButton
            as={Link}
            textDecoration="none"
            _hover={{ textDecoration: "none" }}
          >
            Services
          </MenuButton>
          <MenuList>
            {/* SURVEYOR & ADMIN: SHOW SURVEY FORMS */}
            {(isSurveyor || !isCustomer) && (
              <>
                <MenuGroup title="Transloading">
                  <MenuItem
                    as={Link}
                    href="/services/transloading/container-truck"
                  >
                    Container → Truck
                  </MenuItem>
                  <MenuItem
                    as={Link}
                    href="/services/transloading/truck-container"
                  >
                    Truck → Container
                  </MenuItem>
                </MenuGroup>
                <MenuDivider />
                <MenuGroup title="Stripping">
                  <MenuItem as={Link} href="/services/stripping">
                    Container → Storage
                  </MenuItem>
                </MenuGroup>
                <MenuDivider />
                <MenuGroup title="Stuffing">
                  <MenuItem as={Link} href="/services/stuffing">
                    Storage → Container
                  </MenuItem>
                </MenuGroup>
                <MenuDivider />
                <MenuGroup title="Transfers">
                  <MenuItem as={Link} href="/services/stripping-restuffing">
                    Stripping & Restuffing
                  </MenuItem>
                  <MenuItem as={Link} href="/services/transshipment-C2C">
                    C2C Transfer
                  </MenuItem>
                  <MenuDivider />
                </MenuGroup>
                <MenuItem as={Link} href="/services/vessel-barge">
                  Vessel/Barge
                </MenuItem>
                <MenuItem as={Link} href="/services/lashing">
                  Lashing Report
                </MenuItem>
              </>
            )}
          </MenuList>
        </Menu>
      )}

      {isAuthenticated ? (
        <VStack spacing={2} width="100%">
          <Text fontSize="sm" color="gray.600">
            Welcome, {session?.user?.name}
          </Text>
          <Link
            href="/profile"
            textDecoration="none"
            _hover={{ textDecoration: "none" }}
            width="100%"
          >
            <Button
              colorScheme="blue"
              size="sm"
              width="100%"
              textDecoration="none"
              _hover={{ textDecoration: "none" }}
            >
              Profile
            </Button>
          </Link>
          <Button
            onClick={logout}
            colorScheme="red"
            size="sm"
            width="100%"
            textDecoration="none"
            _hover={{ textDecoration: "none" }}
          >
            Logout
          </Button>
        </VStack>
      ) : (
        <StyledButton
          onClick={handleLoginOpen}
          isDark={isDark}
          fullWidth={true}
        >
          Login
        </StyledButton>
      )}

      {/* Theme Toggle for Mobile */}
      <Box
        pt={4}
        borderTop="1px"
        borderColor={useColorModeValue("gray.200", "gray.700")}
        width="100%"
      >
        <HStack justify="space-between" align="center">
          <Text fontSize="sm" color={useColorModeValue("gray.600", "gray.400")}>
            Theme
          </Text>
          <ColorModeSwitch />
        </HStack>
      </Box>
    </VStack>
  );

  return (
    <>
      <GDPRBanner />
      <Box
        as="header"
        width="full"
        mx="auto"
        px={0}
        py={0}
        borderBottom="none"
        mb={0}
        position="relative"
      >
        {/* Main header content */}
        <Box
          width={{ base: "100%", md: "1024px" }}
          mx="auto"
          px={6}
          py={6}
          borderBottom="1px"
          borderColor={useColorModeValue("gray.200", "gray.700")}
          mb={4}
          position="relative"
        >
          <Flex align="center" justify="space-between" position="relative">
            <Link href="/" _hover={{ textDecoration: "none" }}>
              <Image
                src="/logo/logo1.png"
                alt="Company Logo"
                width={150}
                height={35}
                objectFit="cover"
              />
            </Link>

            <HStack as="nav" spacing={6} display={{ base: "none", md: "flex" }}>
              <Link
                href="/"
                textDecoration="none"
                _hover={{ textDecoration: "none" }}
              >
                Home
              </Link>

              {/* Services Menu - Only for Surveyors and Admins */}
              {isAuthenticated && !isCustomer && (
                <Menu>
                  <MenuButton
                    as={Link}
                    textDecoration="none"
                    _hover={{ textDecoration: "none" }}
                  >
                    Services
                  </MenuButton>
                  <MenuList>
                    {/* SURVEYOR & ADMIN: SHOW SURVEY FORMS */}
                    {(isSurveyor || !isCustomer) && (
                      <>
                        <MenuGroup title="Transloading">
                          <MenuItem
                            as={Link}
                            href="/services/transloading/container-truck"
                            textDecoration="none"
                            _hover={{ textDecoration: "none" }}
                          >
                            Container → Truck
                          </MenuItem>
                          <MenuItem
                            as={Link}
                            href="/services/transloading/truck-container"
                            textDecoration="none"
                            _hover={{ textDecoration: "none" }}
                          >
                            Truck → Container
                          </MenuItem>
                        </MenuGroup>
                        <MenuDivider />
                        <MenuGroup title="Stripping">
                          <MenuItem
                            as={Link}
                            href="/services/stripping"
                            textDecoration="none"
                            _hover={{ textDecoration: "none" }}
                          >
                            Container → Storage
                          </MenuItem>
                        </MenuGroup>
                        <MenuDivider />
                        <MenuGroup title="Stuffing">
                          <MenuItem
                            as={Link}
                            href="/services/stuffing"
                            textDecoration="none"
                            _hover={{ textDecoration: "none" }}
                          >
                            Storage → Container
                          </MenuItem>
                        </MenuGroup>
                        <MenuDivider />
                        <MenuGroup title="Transfers">
                          <MenuItem
                            as={Link}
                            href="/services/stripping-restuffing"
                            textDecoration="none"
                            _hover={{ textDecoration: "none" }}
                          >
                            Stripping & Restuffing
                          </MenuItem>
                          <MenuItem
                            as={Link}
                            href="/services/transshipment-C2C"
                            textDecoration="none"
                            _hover={{ textDecoration: "none" }}
                          >
                            C2C Transfer
                          </MenuItem>
                          <MenuDivider />
                        </MenuGroup>
                        <MenuItem
                          as={Link}
                          href="/services/vessel-barge"
                          textDecoration="none"
                          _hover={{ textDecoration: "none" }}
                        >
                          Vessel/Barge
                        </MenuItem>
                        <MenuItem
                          as={Link}
                          href="/services/lashing"
                          textDecoration="none"
                          _hover={{ textDecoration: "none" }}
                        >
                          Lashing Report
                        </MenuItem>
                      </>
                    )}
                  </MenuList>
                </Menu>
              )}

              {isAuthenticated && (
                <HStack spacing={2} ml={4} mr={2}>
                  <Text fontSize="sm" color="gray.600">
                    {`Welcome, ${session?.user?.name || session?.user?.email}`}
                  </Text>
                </HStack>
              )}
              {isLoading ? (
                <Spinner
                  size="sm"
                  thickness="3px"
                  speed="0.65s"
                  color="teal.500"
                  emptyColor="gray.200"
                  ml={4}
                />
              ) : (
                <>
                  {isAuthenticated ? (
                    <ChakraMenu>
                      <ChakraMenuButton
                        as={Button}
                        rounded="full"
                        variant="link"
                        cursor="pointer"
                        minW={0}
                      >
                        <Avatar
                          size="sm"
                          name={session?.user?.name || session?.user?.email}
                        />
                      </ChakraMenuButton>
                      <ChakraMenuList>
                        <ChakraMenuItem as={Link} href="/profile?tab=dashboard">
                          Dashboard
                        </ChakraMenuItem>
                        <ChakraMenuItem as={Link} href="/profile?tab=profile">
                          Profile
                        </ChakraMenuItem>
                        <ChakraMenuItem as={Link} href="/profile?tab=settings">
                          Settings
                        </ChakraMenuItem>
                        <MenuDivider />
                        <ChakraMenuItem onClick={logout} color="red.500">
                          Logout
                        </ChakraMenuItem>
                      </ChakraMenuList>
                    </ChakraMenu>
                  ) : (
                    <StyledButton onClick={handleLoginOpen} isDark={isDark}>
                      Login
                    </StyledButton>
                  )}
                </>
              )}

              {/* Desktop Theme Toggle - Only visible on desktop */}
              <Box display={{ base: "none", md: "block" }}>
                <ColorModeSwitch />
              </Box>
            </HStack>

            <IconButton
              aria-label="Open menu"
              icon={<HamburgerIcon />}
              display={{ base: "inline-flex", md: "none" }}
              onClick={onOpen}
              variant="ghost"
              zIndex={10}
            />

            <Drawer placement="right" onClose={onClose} isOpen={isOpen}>
              <DrawerOverlay />
              <DrawerContent>
                <DrawerCloseButton />
                <DrawerHeader>Menu</DrawerHeader>
                <DrawerBody>{navLinks}</DrawerBody>
              </DrawerContent>
            </Drawer>
          </Flex>
        </Box>

        {/* NEW STYLED MODAL */}
        <StyledLoginModal
          isOpen={isLoginModalOpen}
          onClose={handleLoginClose}
          initialMode={modalMode}
        />
      </Box>
    </>
  );
}
