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
} from "@chakra-ui/react";
import { HamburgerIcon } from "@chakra-ui/icons";
import { useAuth } from "@/hooks/useAuth";
import LoginModal from "@/components/Auth/LoginModal";
import { useRouter } from "next/navigation";

// HEADER COMPONENT
export default function Header() {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [isLoginModalOpen, setLoginModalOpen] = React.useState(false);
  const { session, isAuthenticated, logout } = useAuth();
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
          <MenuGroup title="Stuffing">
            <MenuItem as={Link} href="/services/stuffing">
              Stuffing
            </MenuItem>
          </MenuGroup>
          <MenuDivider />
          <MenuGroup title="Stripping">
            <MenuItem as={Link} href="/services/stripping">
              Stripping
            </MenuItem>
          </MenuGroup>
          <MenuDivider />
          <MenuItem as={Link} href="/services/transshipment-C2C">
            Transshipment (C2C)
          </MenuItem>
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
                    Stripping
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
                    Stuffing
                  </MenuItem>
                </MenuGroup>
                <MenuDivider />
                <MenuItem
                  as={Link}
                  href="/services/transshipment-C2C"
                  textDecoration="none"
                  _hover={{ textDecoration: "none" }}
                >
                  Transshipment (C2C)
                </MenuItem>
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

            {isAuthenticated ? (
              <HStack spacing={4}>
                <Text fontSize="sm" color="gray.600">
                  Welcome, {session?.user?.name}
                </Text>
                <Link
                  href="/profile"
                  textDecoration="none"
                  _hover={{ textDecoration: "none" }}
                >
                  <Button
                    colorScheme="blue"
                    size="sm"
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
                  textDecoration="none"
                  _hover={{ textDecoration: "none" }}
                >
                  Logout
                </Button>
              </HStack>
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
