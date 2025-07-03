"use client";
import React, { useState } from "react";
import {
  Box,
  Button,
  FormControl,
  FormLabel,
  Input,
  Text,
  Heading,
  VStack,
  Select,
  useToast,
  useColorModeValue,
  Container,
  Divider,
} from "@chakra-ui/react";

export default function RaportAmaraj() {
  const [form, setForm] = useState({
    principal: "",
    oversize: "",
    cargoDescription: "",
    loadingLocation: "",
    storagePrior: "",
    dateOfLoading: "",
    stowagePerformedBy: "",
    lashingPerformedBy: "",
  });
  const [secret, setSecret] = useState("");
  const toast = useToast();
  const bg = useColorModeValue("white", "gray.700");
  const headerBg = useColorModeValue("teal.500", "teal.300");

  const SECRET_KEY = process.env.NEXT_PUBLIC_SECRET_KEY || "";
  const isSecretValid = SECRET_KEY && secret.trim() === SECRET_KEY;

  const options = {
    loadingLocation: [
      "DP World",
      "Life Logistics",
      "Sea Container Services",
      "Port Shipping & Engineering",
      "SOCEP",
      "Fast Freight",
      "DB Schenker",
      "Romalexys",
    ],
    storagePrior: ["Road trailer", "Terminal storage"],
    stowagePerformedBy: [
      "DP World SRL",
      "Life Logistics SRL",
      "Sea Container Services SRL",
      "Port Shipping & Engineering SRL",
      "SOCEP SA",
      "Fast Freight SRL",
      "DB Schenker",
      "Romalexys SRL",
    ],
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const isFormComplete = Object.values(form).every((val) => val);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!isFormComplete) {
      toast({
        title: "All fields are required!",
        status: "warning",
        duration: 4000,
        isClosable: true,
        position: "top",
      });
      return;
    }
    toast({
      title: "Form submitted successfully",
      status: "success",
      duration: 3000,
      isClosable: true,
      position: "top",
    });
  };

  return (
    <Container maxW="container.md" py={6}>
      {/* Secret Key Input */}
      <Box mb={6}>
        <FormControl isRequired>
          <FormLabel>Secret key</FormLabel>
          <Input
            placeholder="Enter secret key"
            value={secret}
            onChange={(e) => setSecret(e.target.value)}
            bg={useColorModeValue("gray.50", "gray.600")}
            borderRadius="md"
            focusBorderColor="teal.400"
          />
        </FormControl>
      </Box>

      {/* Form Section: disabled until secret valid */}
      <Box
        borderRadius="2xl"
        overflow="hidden"
        boxShadow="lg"
        bg={bg}
        opacity={isSecretValid ? 1 : 0.5}
        pointerEvents={isSecretValid ? "auto" : "none"}
      >
        <Box bg={headerBg} py={4} px={6} textAlign="center">
          <Heading size="lg" color="white">
            Lashing Report
          </Heading>
        </Box>
        <Box as="form" onSubmit={handleSubmit} p={8} spacing={6}>
          <VStack spacing={5} align="stretch">
            <FormControl isRequired>
              <FormLabel>Principal's name</FormLabel>
              <Input
                name="principal"
                value={form.principal}
                onChange={handleChange}
                bg={useColorModeValue("gray.50", "gray.600")}
                borderRadius="md"
                focusBorderColor="teal.400"
              />
            </FormControl>
            <FormControl isRequired>
              <FormLabel>Oversize</FormLabel>
              <Input
                name="oversize"
                value={form.oversize}
                onChange={handleChange}
                placeholder="e.g. YES, 5 CM LEFT / 4 CM RIGHT"
                bg={useColorModeValue("gray.50", "gray.600")}
                borderRadius="md"
                focusBorderColor="teal.400"
              />
            </FormControl>
            <FormControl isRequired>
              <FormLabel>Cargo description</FormLabel>
              <Input
                name="cargoDescription"
                value={form.cargoDescription}
                onChange={handleChange}
                bg={useColorModeValue("gray.50", "gray.600")}
                borderRadius="md"
                focusBorderColor="teal.400"
              />
            </FormControl>
            <Divider />
            <FormControl isRequired>
              <FormLabel>Loading location</FormLabel>
              <Select
                name="loadingLocation"
                value={form.loadingLocation}
                onChange={handleChange}
                bg={useColorModeValue("gray.50", "gray.600")}
                borderRadius="md"
                focusBorderColor="teal.400"
                placeholder="Select"
              >
                {options.loadingLocation.map((opt) => (
                  <option key={opt} value={opt}>
                    {opt}
                  </option>
                ))}
              </Select>
            </FormControl>
            <FormControl isRequired>
              <FormLabel>Storage prior to loading</FormLabel>
              <Select
                name="storagePrior"
                value={form.storagePrior}
                onChange={handleChange}
                bg={useColorModeValue("gray.50", "gray.600")}
                borderRadius="md"
                focusBorderColor="teal.400"
                placeholder="Select"
              >
                {options.storagePrior.map((opt) => (
                  <option key={opt} value={opt}>
                    {opt}
                  </option>
                ))}
              </Select>
            </FormControl>
            <FormControl isRequired>
              <FormLabel>Date of loading</FormLabel>
              <Input
                type="date"
                name="dateOfLoading"
                value={form.dateOfLoading}
                onChange={handleChange}
                bg={useColorModeValue("gray.50", "gray.600")}
                borderRadius="md"
                focusBorderColor="teal.400"
              />
            </FormControl>
            <Divider />
            <FormControl isRequired>
              <FormLabel>Stowage performed by</FormLabel>
              <Select
                name="stowagePerformedBy"
                value={form.stowagePerformedBy}
                onChange={handleChange}
                bg={useColorModeValue("gray.50", "gray.600")}
                borderRadius="md"
                focusBorderColor="teal.400"
                placeholder="Select"
              >
                {options.stowagePerformedBy.map((opt) => (
                  <option key={opt} value={opt}>
                    {opt}
                  </option>
                ))}
              </Select>
            </FormControl>
            <FormControl isRequired>
              <FormLabel>Lashing performed by</FormLabel>
              <Input
                name="lashingPerformedBy"
                value={form.lashingPerformedBy}
                onChange={handleChange}
                bg={useColorModeValue("gray.50", "gray.600")}
                borderRadius="md"
                focusBorderColor="teal.400"
              />
            </FormControl>
            <Button
              type="submit"
              size="lg"
              fontWeight="bold"
              borderRadius="lg"
              bgGradient="linear(to-r, teal.400, teal.500)"
              _hover={{ bgGradient: "linear(to-r, teal.500, teal.600)" }}
              color="white"
              isDisabled={!isSecretValid}
            >
              Submit
            </Button>
          </VStack>
        </Box>
      </Box>
    </Container>
  );
}
