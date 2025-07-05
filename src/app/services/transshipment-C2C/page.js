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
  Textarea,
  useToast,
  useColorModeValue,
  Container,
  Divider,
} from "@chakra-ui/react";
import { useSecretAccess } from "@/hooks/useSecretAccess";

export default function TransshipmentC2C() {
  const [form, setForm] = useState({
    portArea: "",
    operator: "",
    date: "",
    principalName: "",
    customPrincipal: "",
    cargoDescription: "",
    grossWeight: "",
    shipper: "",
    consignee: "",
    surveyFindings: "",
    report: "",
  });

  const { secretInput, setSecretInput, accessGranted, handleSecretSubmit } =
    useSecretAccess("TransshipmentC2C");
  const toast = useToast();
  const bg = useColorModeValue("white", "gray.700");
  const headerBg = useColorModeValue("teal.500", "teal.300");
  const inputBg = useColorModeValue("gray.50", "gray.600");
  const inputFocusBorder = "teal.400";

  const portAreaOptions = ["CONSTANTZA SOUTH PORT", "CONSTANTZA NORTH PORT"];

  const principalOptions = [
    "Eastship Projects & Logistics SRL",
    "Life Logistics SRL",
    "Custom",
  ];

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  // Check if required fields are filled
  const requiredFields = [
    "portArea",
    "operator",
    "date",
    "principalName",
    "surveyFindings",
  ];
  const isFormComplete = requiredFields.every((field) => {
    if (field === "principalName" && form.principalName === "Custom") {
      return form.customPrincipal.trim() !== "";
    }
    return form[field] && form[field].trim() !== "";
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!isFormComplete) {
      toast({
        title: "Required fields are missing!",
        description:
          "Please fill in all required fields (Port Area, Operator, Date, Principal's Name, and Survey findings)",
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

      {accessGranted && (
        <Box borderRadius="2xl" overflow="hidden" boxShadow="lg" bg={bg}>
          <Box bg={headerBg} py={4} px={6} textAlign="center">
            <Heading size="lg" color="white">
              Transshipment C2C Survey
            </Heading>
          </Box>

          <Box as="form" onSubmit={handleSubmit} p={8} spacing={6}>
            <VStack spacing={5} align="stretch">
              <FormControl>
                <FormLabel>Report</FormLabel>
                <Input
                  name="report"
                  value={form.report || ""}
                  onChange={handleChange}
                  bg={inputBg}
                  borderRadius="md"
                  focusBorderColor={inputFocusBorder}
                  placeholder="Enter report number or name"
                />
              </FormControl>
              <FormControl isRequired>
                <FormLabel>Port Area</FormLabel>
                <Select
                  name="portArea"
                  value={form.portArea}
                  onChange={handleChange}
                  bg={inputBg}
                  borderRadius="md"
                  focusBorderColor={inputFocusBorder}
                  placeholder="Select port area"
                >
                  {portAreaOptions.map((opt) => (
                    <option key={opt} value={opt}>
                      {opt}
                    </option>
                  ))}
                </Select>
              </FormControl>

              <FormControl isRequired>
                <FormLabel>Operator</FormLabel>
                <Input
                  name="operator"
                  value={form.operator}
                  onChange={handleChange}
                  bg={inputBg}
                  borderRadius="md"
                  focusBorderColor={inputFocusBorder}
                  placeholder="Enter operator name"
                />
              </FormControl>

              <FormControl isRequired>
                <FormLabel>Date</FormLabel>
                <Input
                  type="date"
                  name="date"
                  value={form.date}
                  onChange={handleChange}
                  bg={inputBg}
                  borderRadius="md"
                  focusBorderColor={inputFocusBorder}
                />
              </FormControl>

              <FormControl isRequired>
                <FormLabel>Principal's Name</FormLabel>
                <Select
                  name="principalName"
                  value={form.principalName}
                  onChange={handleChange}
                  bg={inputBg}
                  borderRadius="md"
                  focusBorderColor={inputFocusBorder}
                  placeholder="Select principal"
                >
                  {principalOptions.map((opt) => (
                    <option key={opt} value={opt}>
                      {opt}
                    </option>
                  ))}
                </Select>
              </FormControl>

              {form.principalName === "Custom" && (
                <FormControl isRequired>
                  <FormLabel>Custom Principal Name</FormLabel>
                  <Input
                    name="customPrincipal"
                    value={form.customPrincipal}
                    onChange={handleChange}
                    bg={inputBg}
                    borderRadius="md"
                    focusBorderColor={inputFocusBorder}
                    placeholder="Enter custom principal name"
                  />
                </FormControl>
              )}

              <FormControl>
                <FormLabel>Cargo Description</FormLabel>
                <Input
                  name="cargoDescription"
                  value={form.cargoDescription}
                  onChange={handleChange}
                  bg={inputBg}
                  borderRadius="md"
                  focusBorderColor={inputFocusBorder}
                  placeholder="Enter cargo description"
                />
              </FormControl>

              <FormControl>
                <FormLabel>Gross Weight</FormLabel>
                <Input
                  name="grossWeight"
                  value={form.grossWeight}
                  onChange={handleChange}
                  bg={inputBg}
                  borderRadius="md"
                  focusBorderColor={inputFocusBorder}
                  placeholder="Enter gross weight"
                />
              </FormControl>

              <FormControl>
                <FormLabel>Shipper</FormLabel>
                <Input
                  name="shipper"
                  value={form.shipper}
                  onChange={handleChange}
                  bg={inputBg}
                  borderRadius="md"
                  focusBorderColor={inputFocusBorder}
                  placeholder="Enter shipper name"
                />
              </FormControl>

              <FormControl>
                <FormLabel>Consignee</FormLabel>
                <Input
                  name="consignee"
                  value={form.consignee}
                  onChange={handleChange}
                  bg={inputBg}
                  borderRadius="md"
                  focusBorderColor={inputFocusBorder}
                  placeholder="Enter consignee name"
                />
              </FormControl>

              <FormControl isRequired>
                <FormLabel>Survey Findings</FormLabel>
                <Textarea
                  name="surveyFindings"
                  value={form.surveyFindings}
                  onChange={handleChange}
                  bg={inputBg}
                  borderRadius="md"
                  focusBorderColor={inputFocusBorder}
                  placeholder="Enter survey findings"
                  rows={4}
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
      )}
    </Container>
  );
}
