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
  IconButton,
  HStack,
} from "@chakra-ui/react";
import { AddIcon, MinusIcon } from "@chakra-ui/icons";
import { useSecretAccess } from "@/hooks/useSecretAccess";

export default function VesselBarge() {
  const [form, setForm] = useState({
    report: "",
    vesselName: "",
    portArea: "",
    operator: "",
    date: "",
    principalName: "",
    cargoDescription: "",
    grossWeight: "",
    shippers: [""],
    consignees: [""],
    surveyFindings: "",
  });

  const { secretInput, setSecretInput, accessGranted, handleSecretSubmit } =
    useSecretAccess("VesselBarge");
  const toast = useToast();
  const bg = useColorModeValue("white", "gray.700");
  const headerBg = useColorModeValue("teal.500", "teal.300");
  const inputBg = useColorModeValue("gray.50", "gray.600");
  const inputFocusBorder = "teal.400";

  const portAreaOptions = ["CONSTANTZA SOUTH PORT", "CONSTANTZA NORTH PORT"];
  const operatorOptions = [
    "DB Schenker",
    "DPS World",
    "Fast Freight",
    "Life Logistics",
    "Port Shipping & Engineering",
    "Romalexys",
    "Sea Container Services",
    "SOCEP",
    "Custom",
  ];

  const requiredFields = [
    "vesselName",
    "portArea",
    "operator",
    "date",
    "principalName",
    "surveyFindings",
  ];
  const isFormComplete = requiredFields.every((field) => {
    if (field === "operator" && form.operator === "Custom") {
      return form.customOperator && form.customOperator.trim() !== "";
    }
    return form[field] && form[field].trim() !== "";
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleShipperChange = (idx, value) => {
    setForm((prev) => {
      const shippers = [...prev.shippers];
      shippers[idx] = value;
      return { ...prev, shippers };
    });
  };
  const addShipper = () => {
    setForm((prev) => ({ ...prev, shippers: [...prev.shippers, ""] }));
  };

  const handleConsigneeChange = (idx, value) => {
    setForm((prev) => {
      const consignees = [...prev.consignees];
      consignees[idx] = value;
      return { ...prev, consignees };
    });
  };
  const addConsignee = () => {
    setForm((prev) => ({ ...prev, consignees: [...prev.consignees, ""] }));
  };

  const removeShipper = (idx) => {
    setForm((prev) => {
      const shippers = prev.shippers.filter((_, i) => i !== idx);
      return { ...prev, shippers: shippers.length ? shippers : [""] };
    });
  };
  const removeConsignee = (idx) => {
    setForm((prev) => {
      const consignees = prev.consignees.filter((_, i) => i !== idx);
      return { ...prev, consignees: consignees.length ? consignees : [""] };
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!isFormComplete) {
      toast({
        title: "Required fields are missing!",
        description:
          "Please fill in all required fields (Vessel Name, Port Area, Operator, Date, Principal's Name, and Survey findings)",
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
              Vessel/Barge Survey
            </Heading>
          </Box>

          <Box as="form" onSubmit={handleSubmit} p={8} spacing={6}>
            <VStack spacing={5} align="stretch">
              <FormControl>
                <FormLabel>Report</FormLabel>
                <Input
                  name="report"
                  value={form.report}
                  onChange={handleChange}
                  bg={inputBg}
                  borderRadius="md"
                  focusBorderColor={inputFocusBorder}
                  placeholder="Enter report number or name"
                />
              </FormControl>
              <FormControl isRequired>
                <FormLabel>Vessel Name</FormLabel>
                <Input
                  name="vesselName"
                  value={form.vesselName}
                  onChange={handleChange}
                  bg={inputBg}
                  borderRadius="md"
                  focusBorderColor={inputFocusBorder}
                  placeholder="Enter vessel name"
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
                <Select
                  name="operator"
                  value={form.operator}
                  onChange={handleChange}
                  bg={inputBg}
                  borderRadius="md"
                  focusBorderColor={inputFocusBorder}
                  placeholder="Select operator"
                >
                  {operatorOptions.map((opt) => (
                    <option key={opt} value={opt}>
                      {opt}
                    </option>
                  ))}
                </Select>
              </FormControl>
              {form.operator === "Custom" && (
                <FormControl isRequired>
                  <FormLabel>Custom Operator Name</FormLabel>
                  <Input
                    name="customOperator"
                    value={form.customOperator || ""}
                    onChange={handleChange}
                    bg={inputBg}
                    borderRadius="md"
                    focusBorderColor={inputFocusBorder}
                    placeholder="Enter custom operator name"
                  />
                </FormControl>
              )}
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
                <Input
                  name="principalName"
                  value={form.principalName}
                  onChange={handleChange}
                  bg={inputBg}
                  borderRadius="md"
                  focusBorderColor={inputFocusBorder}
                  placeholder="Enter principal's name"
                />
              </FormControl>
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
                <VStack align="stretch" spacing={2}>
                  {form.shippers.map((shipper, idx) => (
                    <HStack key={idx}>
                      <Input
                        name={`shipper-${idx}`}
                        value={shipper}
                        onChange={(e) =>
                          handleShipperChange(idx, e.target.value)
                        }
                        bg={inputBg}
                        borderRadius="md"
                        focusBorderColor={inputFocusBorder}
                        placeholder="Enter shipper name"
                      />
                      {form.shippers.length === 1 ? (
                        <IconButton
                          aria-label="Add shipper"
                          icon={<AddIcon />}
                          size="sm"
                          onClick={addShipper}
                        />
                      ) : idx === form.shippers.length - 1 ? (
                        <IconButton
                          aria-label="Add shipper"
                          icon={<AddIcon />}
                          size="sm"
                          onClick={addShipper}
                        />
                      ) : (
                        <IconButton
                          aria-label="Remove shipper"
                          icon={<MinusIcon />}
                          size="sm"
                          onClick={() => removeShipper(idx)}
                        />
                      )}
                    </HStack>
                  ))}
                </VStack>
              </FormControl>
              <FormControl>
                <FormLabel>Consignee</FormLabel>
                <VStack align="stretch" spacing={2}>
                  {form.consignees.map((consignee, idx) => (
                    <HStack key={idx}>
                      <Input
                        name={`consignee-${idx}`}
                        value={consignee}
                        onChange={(e) =>
                          handleConsigneeChange(idx, e.target.value)
                        }
                        bg={inputBg}
                        borderRadius="md"
                        focusBorderColor={inputFocusBorder}
                        placeholder="Enter consignee name"
                      />
                      {form.consignees.length === 1 ? (
                        <IconButton
                          aria-label="Add consignee"
                          icon={<AddIcon />}
                          size="sm"
                          onClick={addConsignee}
                        />
                      ) : idx === form.consignees.length - 1 ? (
                        <IconButton
                          aria-label="Add consignee"
                          icon={<AddIcon />}
                          size="sm"
                          onClick={addConsignee}
                        />
                      ) : (
                        <IconButton
                          aria-label="Remove consignee"
                          icon={<MinusIcon />}
                          size="sm"
                          onClick={() => removeConsignee(idx)}
                        />
                      )}
                    </HStack>
                  ))}
                </VStack>
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
