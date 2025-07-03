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

export default function Footer() {
  return (
    <Box as="footer" py={8} bg={useColorModeValue("gray.100", "gray.900")}>
      <Flex
        direction={{ base: "column", md: "row" }}
        align="center"
        textAlign="center"
        justify="center"
        maxW="7xl"
        mx="auto"
        px={6}
      >
        <Text fontSize="sm" color={useColorModeValue("gray.600", "gray.400")}>
          &copy; {new Date().getFullYear()} MCS. All rights reserved.
        </Text>
      </Flex>
    </Box>
  );
}
