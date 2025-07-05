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
import { useSecretAccess } from "@/hooks/useSecretAccess";

export default function RaportAmaraj() {
  const [form, setForm] = useState({
    reportNumber: "",
    principal: "",
    oversize: "",
    cargoDescription: "",
    loadingLocation: "",
    storagePrior: "",
    dateOfLoading: "",
    stowagePerformedBy: "",
    lashingPerformedBy: "",
  });

  const { secretInput, setSecretInput, accessGranted, handleSecretSubmit } =
    useSecretAccess("RaportAmaraj");
  const toast = useToast();
  const bg = useColorModeValue("white", "gray.700");
  const headerBg = useColorModeValue("teal.500", "teal.300");
  const inputBg = useColorModeValue("gray.50", "gray.600");
  const inputFocusBorder = "teal.400";

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

  const isFormComplete = Object.entries(form)
    .filter(([key]) => key !== "reportNumber")
    .every(([, val]) => val);

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
      {!accessGranted && (
        <Box
          mb={6}
          as="form"
          onSubmit={(e) => {
            e.preventDefault();
            handleSecretSubmit();
          }}
        >
          <FormControl isRequired>
            <Input
              placeholder="Enter secret key"
              value={secretInput}
              onChange={(e) => setSecretInput(e.target.value)}
              autoComplete="off"
            />
            <Button mt={2} colorScheme="teal" type="submit">
              Submit
            </Button>
          </FormControl>
        </Box>
      )}

      {accessGranted ? (
        <Box borderRadius="2xl" overflow="hidden" boxShadow="lg" bg={bg}>
          <Box bg={headerBg} py={4} px={6} textAlign="center">
            <Heading size="lg" color="white">
              Lashing Report
            </Heading>
          </Box>

          <Box as="form" onSubmit={handleSubmit} p={8} spacing={6}>
            <VStack spacing={5} align="stretch">
              <FormControl>
                <FormLabel>Report Number</FormLabel>
                <Input
                  name="reportNumber"
                  value={form.reportNumber}
                  onChange={(e) => {
                    const value = e.target.value.replace(/\D/g, "");
                    setForm((prev) => ({ ...prev, reportNumber: value }));
                  }}
                  bg={inputBg}
                  borderRadius="md"
                  focusBorderColor={inputFocusBorder}
                  inputMode="numeric"
                  pattern="\\d*"
                />
              </FormControl>
              <FormControl isRequired>
                <FormLabel>Principal's name</FormLabel>
                <Input
                  name="principal"
                  value={form.principal}
                  onChange={handleChange}
                  bg={inputBg}
                  borderRadius="md"
                  focusBorderColor={inputFocusBorder}
                />
              </FormControl>
              <FormControl isRequired>
                <FormLabel>Oversize</FormLabel>
                <Input
                  name="oversize"
                  value={form.oversize}
                  onChange={handleChange}
                  placeholder="e.g. YES, 5 CM LEFT / 4 CM RIGHT"
                  bg={inputBg}
                  borderRadius="md"
                  focusBorderColor={inputFocusBorder}
                />
              </FormControl>
              <FormControl isRequired>
                <FormLabel>Cargo description</FormLabel>
                <Input
                  name="cargoDescription"
                  value={form.cargoDescription}
                  onChange={handleChange}
                  bg={inputBg}
                  borderRadius="md"
                  focusBorderColor={inputFocusBorder}
                />
              </FormControl>

              <Divider />

              <FormControl isRequired>
                <FormLabel>Loading location</FormLabel>
                <Select
                  name="loadingLocation"
                  value={form.loadingLocation}
                  onChange={handleChange}
                  bg={inputBg}
                  borderRadius="md"
                  focusBorderColor={inputFocusBorder}
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
                  bg={inputBg}
                  borderRadius="md"
                  focusBorderColor={inputFocusBorder}
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
                  bg={inputBg}
                  borderRadius="md"
                  focusBorderColor={inputFocusBorder}
                />
              </FormControl>

              <Divider />

              <FormControl isRequired>
                <FormLabel>Stowage performed by</FormLabel>
                <Select
                  name="stowagePerformedBy"
                  value={form.stowagePerformedBy}
                  onChange={handleChange}
                  bg={inputBg}
                  borderRadius="md"
                  focusBorderColor={inputFocusBorder}
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
                  bg={inputBg}
                  borderRadius="md"
                  focusBorderColor={inputFocusBorder}
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
              >
                Submit
              </Button>
            </VStack>
          </Box>
        </Box>
      ) : (
        <Text color="gray.500" textAlign="center">
          Secret key required to unlock the form.
        </Text>
      )}
    </Container>
  );
}
