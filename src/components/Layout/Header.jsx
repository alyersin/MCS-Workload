"use client";

import React from "react";
import {
  Box,
  Flex,
  Image,
  Link,
  Menu,
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
          Cargo Condition
        </MenuButton>
        <MenuList>
          <MenuGroup title="Transloading">
            <MenuItem
              as={Link}
              href="/services/transloading/container-to-truck"
            >
              Container → Truck
            </MenuItem>
            <MenuItem
              as={Link}
              href="/services/transloading/truck-to-container"
            >
              Truck → Container
            </MenuItem>
          </MenuGroup>
          <MenuDivider />
          <MenuGroup title="Stuffing">
            <MenuItem as={Link} href="/services/stuffing/storage-to-container">
              Storage → Container
            </MenuItem>
          </MenuGroup>
          <MenuDivider />
          <MenuGroup title="Stripping">
            <MenuItem as={Link} href="/services/stripping/container-to-storage">
              Container → Storage
            </MenuItem>
          </MenuGroup>
          <MenuDivider />
          <MenuItem as={Link} href="/services/transshipment-C2C">
            Transshipment (C2C)
          </MenuItem>
          <MenuItem as={Link} href="/services/vessel-barge">
            Vessel/Barge
          </MenuItem>
          <MenuItem as={Link} href="/services/raport-amaraj">
            Lashing
          </MenuItem>
        </MenuList>
      </Menu>

      {isAuthenticated ? (
        <VStack spacing={2} width="100%">
          <Text fontSize="sm" color="gray.600">
            Welcome, {session?.user?.name}
          </Text>
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
                    href="/cargo/transloading/container-to-truck"
                  >
                    Container → Truck
                  </MenuItem>
                  <MenuItem
                    as={Link}
                    href="/cargo/transloading/truck-to-container"
                  >
                    Truck → Container
                  </MenuItem>
                </MenuGroup>
                <MenuDivider />
                <MenuGroup title="Stuffing">
                  <MenuItem
                    as={Link}
                    href="/cargo/stuffing/storage-to-container"
                  >
                    Storage → Container
                  </MenuItem>
                </MenuGroup>
                <MenuDivider />
                <MenuGroup title="Stripping">
                  <MenuItem
                    as={Link}
                    href="/services/stripping/container-to-storage"
                  >
                    Container → Storage
                  </MenuItem>
                </MenuGroup>
                <MenuDivider />
                <MenuItem as={Link} href="/services/transshipment-C2C">
                  Transshipment (C2C)
                </MenuItem>
                <MenuItem as={Link} href="/services/vessel-barge">
                  Vessel/Barge
                </MenuItem>
                <MenuItem as={Link} href="/services/raport-amaraj">
                  Lashing
                </MenuItem>
              </MenuList>
            </Menu>

            {isAuthenticated ? (
              <HStack spacing={4}>
                <Text fontSize="sm" color="gray.600">
                  Welcome, {session?.user?.name}
                </Text>
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
