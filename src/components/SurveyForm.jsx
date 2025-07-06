import React, { useState } from "react";
import {
  Box,
  Button,
  FormControl,
  FormLabel,
  Input,
  VStack,
  Select,
  Textarea,
  useToast,
  useColorModeValue,
  Heading,
  IconButton,
  HStack,
  Container,
} from "@chakra-ui/react";
import { AddIcon, MinusIcon } from "@chakra-ui/icons";
import { useSecretAccess } from "@/hooks/useSecretAccess";

// SURVEY FORM COMPONENT
export default function SurveyForm({
  title,
  fields,
  dropdownOptions = {},
  dynamicFields = {},
  onSubmit: onSubmitProp,
  secretAccess,
}) {
  // Build initial form state
  const initialForm = {};
  fields.forEach((field) => {
    if (field.type === "dynamicList") {
      initialForm[field.name] = [""];
    } else {
      initialForm[field.name] = "";
    }
  });
  const [form, setForm] = useState(initialForm);
  const [mounted, setMounted] = React.useState(false);
  React.useEffect(() => setMounted(true), []);
  const toast = useToast();
  const bg = useColorModeValue("white", "gray.700");
  const headerBg = useColorModeValue("teal.500", "teal.300");
  const inputBg = useColorModeValue("gray.50", "gray.600");
  const inputFocusBorder = "teal.400";

  // Secret access logic (use hook instead of local state)
  const { secretInput, setSecretInput, accessGranted, handleSecretSubmit } =
    useSecretAccess(secretAccess);

  // Validation
  const isFormComplete = fields.every((field) => {
    if (field.required) {
      if (field.type === "dynamicList") {
        return form[field.name].some((val) => val.trim() !== "");
      }
      if (field.name === "operator" && form.operator === "Custom") {
        return form.customOperator && form.customOperator.trim() !== "";
      }
      if (field.name === "principalName" && form.principalName === "Custom") {
        return form.customPrincipal && form.customPrincipal.trim() !== "";
      }
      const value = form[field.name];
      if (typeof value === "string") {
        return value.trim() !== "";
      }
      return value !== undefined && value !== null && value !== "";
    }
    return true;
  });

  // Handlers
  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };
  const handleDynamicChange = (field, idx, value) => {
    setForm((prev) => {
      const arr = [...prev[field]];
      arr[idx] = value;
      return { ...prev, [field]: arr };
    });
  };
  const addDynamic = (field) => {
    setForm((prev) => ({ ...prev, [field]: [...prev[field], ""] }));
  };
  const removeDynamic = (field, idx) => {
    setForm((prev) => {
      const arr = prev[field].filter((_, i) => i !== idx);
      return { ...prev, [field]: arr.length ? arr : [""] };
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isFormComplete) {
      toast({
        title: "Required fields are missing!",
        status: "warning",
        duration: 4000,
        isClosable: true,
        position: "top",
      });
      return;
    }
    // Send form data to /api/send-pdf
    try {
      await fetch("/api/send-pdf", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, _serviceName: secretAccess }),
      });
      toast({
        title: "Form submitted and emailed successfully",
        status: "success",
        duration: 3000,
        isClosable: true,
        position: "top",
      });
    } catch (error) {
      toast({
        title: "Failed to send email",
        status: "error",
        duration: 3000,
        isClosable: true,
        position: "top",
      });
    }
    if (onSubmitProp) onSubmitProp(form);
  };

  if (!mounted) return null;

  return (
    <Container maxW="container.md" py={6}>
      {!accessGranted && secretAccess && (
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
              {title}
            </Heading>
          </Box>
          <Box as="form" onSubmit={handleSubmit} p={8} spacing={6}>
            <VStack spacing={5} align="stretch">
              {fields.map((field) => {
                if (field.type === "input") {
                  return (
                    <FormControl key={field.name} isRequired={field.required}>
                      <FormLabel>{field.label}</FormLabel>
                      <Input
                        name={field.name}
                        value={form[field.name]}
                        onChange={handleChange}
                        bg={inputBg}
                        borderRadius="md"
                        focusBorderColor={inputFocusBorder}
                        placeholder={field.placeholder}
                        type={field.inputType || "text"}
                      />
                    </FormControl>
                  );
                }
                if (field.type === "select") {
                  const opts = dropdownOptions[field.name] || [];
                  return (
                    <FormControl key={field.name} isRequired={field.required}>
                      <FormLabel>{field.label}</FormLabel>
                      <Select
                        name={field.name}
                        value={form[field.name]}
                        onChange={handleChange}
                        bg={inputBg}
                        borderRadius="md"
                        focusBorderColor={inputFocusBorder}
                        placeholder={field.placeholder || "Select"}
                      >
                        {opts.map((opt) => (
                          <option key={opt} value={opt}>
                            {opt}
                          </option>
                        ))}
                      </Select>
                    </FormControl>
                  );
                }
                if (field.type === "dynamicList") {
                  return (
                    <FormControl key={field.name} isRequired={field.required}>
                      <FormLabel>{field.label}</FormLabel>
                      <VStack align="stretch" spacing={2}>
                        {form[field.name].map((val, idx) => (
                          <HStack key={idx}>
                            <Input
                              name={`${field.name}-${idx}`}
                              value={val}
                              onChange={(e) =>
                                handleDynamicChange(
                                  field.name,
                                  idx,
                                  e.target.value
                                )
                              }
                              bg={inputBg}
                              borderRadius="md"
                              focusBorderColor={inputFocusBorder}
                              placeholder={field.placeholder}
                            />
                            {form[field.name].length === 1 ? (
                              <IconButton
                                aria-label={`Add ${field.label}`}
                                icon={<AddIcon />}
                                size="sm"
                                onClick={() => addDynamic(field.name)}
                              />
                            ) : idx === form[field.name].length - 1 ? (
                              <IconButton
                                aria-label={`Add ${field.label}`}
                                icon={<AddIcon />}
                                size="sm"
                                onClick={() => addDynamic(field.name)}
                              />
                            ) : (
                              <IconButton
                                aria-label={`Remove ${field.label}`}
                                icon={<MinusIcon />}
                                size="sm"
                                onClick={() => removeDynamic(field.name, idx)}
                              />
                            )}
                          </HStack>
                        ))}
                      </VStack>
                    </FormControl>
                  );
                }
                if (field.type === "textarea") {
                  return (
                    <FormControl key={field.name} isRequired={field.required}>
                      <FormLabel>{field.label}</FormLabel>
                      <Textarea
                        name={field.name}
                        value={form[field.name]}
                        onChange={handleChange}
                        bg={inputBg}
                        borderRadius="md"
                        focusBorderColor={inputFocusBorder}
                        placeholder={field.placeholder}
                        rows={field.rows || 4}
                      />
                    </FormControl>
                  );
                }
                // Custom fields (e.g., custom operator/principal)
                if (
                  field.type === "customOperator" &&
                  form.operator === "Custom"
                ) {
                  return (
                    <FormControl key={field.name} isRequired={field.required}>
                      <FormLabel>{field.label}</FormLabel>
                      <Input
                        name={field.name}
                        value={form[field.name]}
                        onChange={handleChange}
                        bg={inputBg}
                        borderRadius="md"
                        focusBorderColor={inputFocusBorder}
                        placeholder={field.placeholder}
                      />
                    </FormControl>
                  );
                }
                if (
                  field.type === "customPrincipal" &&
                  form.principalName === "Custom"
                ) {
                  return (
                    <FormControl key={field.name} isRequired={field.required}>
                      <FormLabel>{field.label}</FormLabel>
                      <Input
                        name={field.name}
                        value={form[field.name]}
                        onChange={handleChange}
                        bg={inputBg}
                        borderRadius="md"
                        focusBorderColor={inputFocusBorder}
                        placeholder={field.placeholder}
                      />
                    </FormControl>
                  );
                }
                return null;
              })}
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
