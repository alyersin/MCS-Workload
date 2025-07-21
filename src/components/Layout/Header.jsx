"use client";

import React from "react";
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
} from "@chakra-ui/react";
import { HamburgerIcon } from "@chakra-ui/icons";
import { useAuth } from "@/hooks/useAuth";
import LoginModal from "@/components/Auth/LoginModal";
import { useRouter } from "next/navigation";

// HEADER COMPONENT
export default function Header() {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [isLoginModalOpen, setLoginModalOpen] = React.useState(false);
  const { session, isAuthenticated, logout, isLoading } = useAuth();
  const router = useRouter();

  const handleLoginOpen = () => setLoginModalOpen(true);
  const handleLoginClose = () => setLoginModalOpen(false);
  const handleRegister = () => {
    setLoginModalOpen(false);
    router.push("/register");
  };

  const navLinks = (
    <VStack align="start" spacing={4}>
      <Link href="/" textDecoration="none" _hover={{ textDecoration: "none" }}>
        Home
      </Link>

      <Menu>
        <MenuButton
          as={Link}
          textDecoration="none"
          _hover={{ textDecoration: "none" }}
        >
          Services
        </MenuButton>
        <MenuList>
          <MenuGroup title="Transloading">
            <MenuItem as={Link} href="/services/transloading/container-truck">
              Container → Truck
            </MenuItem>
            <MenuItem as={Link} href="/services/transloading/truck-container">
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
        </MenuList>
      </Menu>

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
        <Button
          onClick={handleLoginOpen}
          colorScheme="teal"
          size="sm"
          width="100%"
          textDecoration="none"
          _hover={{ textDecoration: "none" }}
        >
          Login
        </Button>
      )}
    </VStack>
  );

  return (
    <Box
      as="header"
      width="full"
      mx="auto"
      px={6}
      py={4}
      borderBottom="1px"
      borderColor={useColorModeValue("gray.200", "gray.700")}
      mb={8}
    >
      <Box width={{ base: "100%", md: "1024px" }} mx="auto">
        <Flex align="center" justify="space-between" position="relative">
          <Link href="/" _hover={{ textDecoration: "none" }}>
            <Image
              src="/logo/logo.png"
              alt="Company Logo"
              width={100}
              height={20}
              objectFit="contain"
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

            <Menu>
              <MenuButton
                as={Link}
                textDecoration="none"
                _hover={{ textDecoration: "none" }}
              >
                Services
              </MenuButton>
              <MenuList>
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
              </MenuList>
            </Menu>
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
                {isAuthenticated && (
                  <Text fontSize="sm" color="gray.600" ml={4} mr={2}>
                    {`Welcome, ${session?.user?.name || session?.user?.email}`}
                  </Text>
                )}
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
                  <Button
                    onClick={handleLoginOpen}
                    colorScheme="teal"
                    size="sm"
                    textDecoration="none"
                    _hover={{ textDecoration: "none" }}
                  >
                    Login
                  </Button>
                )}
              </>
            )}
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
      <LoginModal
        isOpen={isLoginModalOpen}
        onClose={handleLoginClose}
        onRegister={handleRegister}
      />
    </Box>
  );
}
