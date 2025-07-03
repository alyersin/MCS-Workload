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

const Header = () => {
  const { isOpen, onOpen, onClose } = useDisclosure();

  const navLinks = (
    <VStack align="start" spacing={4}>
      <Link href="/" _hover={{ textDecoration: "none" }}>
        Home
      </Link>
      <Menu>
        <MenuButton as={Link} _hover={{ textDecoration: "none" }}>
          Cargo Condition
        </MenuButton>
        <MenuList>
          <MenuGroup title="Transloading">
            <MenuItem as={Link} href="/cargo/transloading/container-to-truck">
              container → truck
            </MenuItem>
            <MenuItem as={Link} href="/cargo/transloading/truck-to-container">
              truck → container
            </MenuItem>
          </MenuGroup>
          <MenuDivider />
          <MenuGroup title="Stuffing">
            <MenuItem as={Link} href="/cargo/stuffing/storage-to-container">
              storage → container
            </MenuItem>
          </MenuGroup>
          <MenuDivider />
          <MenuGroup title="Stripping">
            <MenuItem as={Link} href="/cargo/stripping/container-to-storage">
              container → storage
            </MenuItem>
          </MenuGroup>
          <MenuDivider />
          <MenuItem as={Link} href="/cargo/transshipment-c2c">
            Transshipment (C2C)
          </MenuItem>
          <MenuItem as={Link} href="/cargo/vessel-barge">
            Vessel/Barge
          </MenuItem>
        </MenuList>
      </Menu>
      <Link href="/RaportAmaraj" _hover={{ textDecoration: "none" }}>
        Lashing Report
      </Link>
      <Link href="/contact" _hover={{ textDecoration: "none" }}>
        Contact
      </Link>
    </VStack>
  );

  return (
    <Box
      as="header"
      width="full"
      maxW="1280px"
      mx="auto"
      px={6}
      py={4}
      borderBottom="1px"
      borderColor={useColorModeValue("gray.200", "gray.700")}
      mb={8}
    >
      <Flex align="center" justify="space-between">
        {/* Logo */}
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
          {navLinks.props.children}
        </HStack>

        <IconButton
          aria-label="Open menu"
          icon={<HamburgerIcon />}
          display={{ base: "inline-flex", md: "none" }}
          onClick={onOpen}
          variant="ghost"
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
  );
};

export default Header;
