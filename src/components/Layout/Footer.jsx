"use client";
import React from "react";
import {
  Box,
  Flex,
  Text,
  Link,
  Stack,
  useColorModeValue,
} from "@chakra-ui/react";

// FOOTER COMPONENT
export default function Footer() {
  return (
    <Box as="footer" py={8} bg={useColorModeValue("gray.100", "gray.900")}>
      <Flex
        direction="column"
        align="center"
        textAlign="center"
        justifyContent="space-between"
        maxW="7xl"
        mx="auto"
        px={6}
        gap={4}
      >
        <Text fontSize="sm" color={useColorModeValue("gray.600", "gray.400")}>
          &copy; {new Date().getFullYear()} Marine Control Services. All rights
          reserved.
        </Text>
        <Text fontSize="xs" color={useColorModeValue("gray.600", "gray.400")}>
          Platform developed by{" "}
          <Link
            href="https://www.ersin.site/"
            isExternal
            color={useColorModeValue("teal.600", "teal.300")}
            fontWeight="medium"
          >
            Ersin
          </Link>
        </Text>
      </Flex>
    </Box>
  );
}
