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
import { onAuthStateChanged, getAuth } from "firebase/auth";
import { uploadFileWithMeta } from "@/utils/uploadFile";
import { useAuth } from "@/hooks/useAuth";

// SURVEY FORM COMPONENT
export default function SurveyForm({
  title,
  fields,
  dropdownOptions = {},
  dynamicFields = {},
  onSubmit: onSubmitProp,
  secretAccess,
}) {
  // BUILD INITIAL FORM STATE
  const initialForm = {};
  fields.forEach((field) => {
    if (field.type === "dynamicList") {
      initialForm[field.name] = [""];
    } else if (field.type === "dynamicPair") {
      initialForm[field.name] = [{ description: "", weight: "" }];
    } else if (field.type === "dynamicCargoGroup") {
      initialForm[field.name] = [
        {
          description: "",
          packages: "",
          weight: "",
          shipper: "",
          consignee: "",
        },
      ];
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
  // CARGO GROUP BG COLOR
  const cargoGroupBg = useColorModeValue("gray.50", "gray.700");

  const { secretInput, setSecretInput, accessGranted, handleSecretSubmit } =
    useSecretAccess(secretAccess);
  const { isAuthenticated, session } = useAuth();

  // VALIDATION
  const isFormComplete = fields.every((field) => {
    if (field.required) {
      if (field.type === "dynamicList") {
        return form[field.name].some((val) => val.trim() !== "");
      }
      if (field.type === "dynamicPair") {
        return form[field.name].some(
          (pair) =>
            (pair.description && pair.description.trim() !== "") ||
            (pair.weight && pair.weight.trim() !== "")
        );
      }
      if (field.type === "dynamicCargoGroup") {
        return form[field.name].some(
          (group) =>
            (group.description && group.description.trim() !== "") ||
            (group.weight && group.weight.trim() !== "") ||
            (group.shipper && group.shipper.trim() !== "") ||
            (group.consignee && group.consignee.trim() !== "")
        );
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
  // HANDLE DYNAMIC PAIR CHANGE
  const handleDynamicPairChange = (field, idx, key, value) => {
    setForm((prev) => {
      const arr = [...prev[field]];
      arr[idx] = { ...arr[idx], [key]: value };
      return { ...prev, [field]: arr };
    });
  };
  // ADD DYNAMIC PAIR
  const addDynamicPair = (field) => {
    setForm((prev) => ({
      ...prev,
      [field]: [...prev[field], { description: "", weight: "" }],
    }));
  };
  // REMOVE DYNAMIC PAIR
  const removeDynamicPair = (field, idx) => {
    setForm((prev) => {
      const arr = prev[field].filter((_, i) => i !== idx);
      return {
        ...prev,
        [field]: arr.length ? arr : [{ description: "", weight: "" }],
      };
    });
  };
  // HANDLE DYNAMIC CARGO GROUP CHANGE
  const handleDynamicCargoGroupChange = (field, idx, key, value) => {
    setForm((prev) => {
      const arr = [...prev[field]];
      arr[idx] = { ...arr[idx], [key]: value };
      return { ...prev, [field]: arr };
    });
  };
  // ADD DYNAMIC CARGO GROUP
  const addDynamicCargoGroup = (field) => {
    setForm((prev) => ({
      ...prev,
      [field]: [
        ...prev[field],
        {
          description: "",
          packages: "",
          weight: "",
          shipper: "",
          consignee: "",
        },
      ],
    }));
  };
  // REMOVE DYNAMIC CARGO GROUP
  const removeDynamicCargoGroup = (field, idx) => {
    setForm((prev) => {
      const arr = prev[field].filter((_, i) => i !== idx);
      return {
        ...prev,
        [field]: arr.length
          ? arr
          : [
              {
                description: "",
                packages: "",
                weight: "",
                shipper: "",
                consignee: "",
              },
            ],
      };
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isAuthenticated) {
      toast({
        title: "AUTHENTICATION REQUIRED",
        description: "Please log in to submit this form.",
        status: "error",
        duration: 4000,
        isClosable: true,
        position: "top",
      });
      return;
    }
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
    try {
      // UPLOAD FILE IF PRESENT
      if (fileField && form[fileField.name]) {
        // TRY TO FIND A DATE FIELD
        const dateField =
          form.dateOfLoading ||
          form.date ||
          new Date().toISOString().slice(0, 10);
        await uploadFileWithMeta(
          form[fileField.name],
          secretAccess || "unknown-form",
          dateField,
          session?.user?.uid // ONLY UID
        );
      }
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
        title: "Failed to send email or upload file",
        status: "error",
        duration: 3000,
        isClosable: true,
        position: "top",
      });
    }
    if (onSubmitProp) onSubmitProp(form);
    // CLEAR FORM FIELDS AFTER SUBMIT
    setForm(initialForm);
  };

  if (!mounted) return null;

  // BLOCK FORM IF NOT AUTHENTICATED
  if (!isAuthenticated) {
    return (
      <Container maxW="container.md" py={6}>
        <Box
          borderRadius="2xl"
          overflow="hidden"
          boxShadow="lg"
          bg={bg}
          p={8}
          textAlign="center"
        >
          <Heading size="md" color="red.500" mb={4}>
            AUTHENTICATION REQUIRED
          </Heading>
          <Box color="gray.600">Please log in to submit this form.</Box>
        </Box>
      </Container>
    );
  }

  // FIND FILE FIELD DEFINITION (E.G. ATTACHMENTS)
  const fileField = fields.find((f) => f.type === "file");

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
                if (field.type === "dynamicPair") {
                  return (
                    <FormControl key={field.name} isRequired={field.required}>
                      <FormLabel>{field.label}</FormLabel>
                      <VStack align="stretch" spacing={2}>
                        {form[field.name].map((val, idx) => (
                          <HStack key={idx}>
                            <Input
                              name={`${field.name}-desc-${idx}`}
                              value={val.description}
                              onChange={(e) =>
                                handleDynamicPairChange(
                                  field.name,
                                  idx,
                                  "description",
                                  e.target.value
                                )
                              }
                              bg={inputBg}
                              borderRadius="md"
                              focusBorderColor={inputFocusBorder}
                              placeholder={
                                field.descriptionPlaceholder || "Description"
                              }
                            />
                            <Input
                              name={`${field.name}-weight-${idx}`}
                              value={val.weight}
                              onChange={(e) =>
                                handleDynamicPairChange(
                                  field.name,
                                  idx,
                                  "weight",
                                  e.target.value
                                )
                              }
                              bg={inputBg}
                              borderRadius="md"
                              focusBorderColor={inputFocusBorder}
                              placeholder={field.weightPlaceholder || "Weight"}
                            />
                            {form[field.name].length === 1 ? (
                              <IconButton
                                aria-label={`Add ${field.label}`}
                                icon={<AddIcon />}
                                size="sm"
                                onClick={() => addDynamicPair(field.name)}
                              />
                            ) : idx === form[field.name].length - 1 ? (
                              <IconButton
                                aria-label={`Add ${field.label}`}
                                icon={<AddIcon />}
                                size="sm"
                                onClick={() => addDynamicPair(field.name)}
                              />
                            ) : (
                              <IconButton
                                aria-label={`Remove ${field.label}`}
                                icon={<MinusIcon />}
                                size="sm"
                                onClick={() =>
                                  removeDynamicPair(field.name, idx)
                                }
                              />
                            )}
                          </HStack>
                        ))}
                      </VStack>
                    </FormControl>
                  );
                }
                if (field.type === "dynamicCargoGroup") {
                  return (
                    <FormControl key={field.name} isRequired={field.required}>
                      <FormLabel>{field.label}</FormLabel>
                      <VStack align="stretch" spacing={4}>
                        {form[field.name].map((val, idx) => (
                          <HStack
                            key={idx}
                            align="stretch"
                            spacing={2}
                            borderWidth="1px"
                            borderRadius="lg"
                            bg={cargoGroupBg}
                            p={3}
                            mb={1}
                          >
                            <Box flex="1">
                              <HStack spacing={2} mb={2} flexWrap="wrap">
                                <Input
                                  name={`${field.name}-desc-${idx}`}
                                  value={val.description || ""}
                                  onChange={(e) =>
                                    handleDynamicCargoGroupChange(
                                      field.name,
                                      idx,
                                      "description",
                                      e.target.value
                                    )
                                  }
                                  bg={inputBg}
                                  borderRadius="md"
                                  focusBorderColor={inputFocusBorder}
                                  placeholder={
                                    field.descriptionPlaceholder ||
                                    "Description"
                                  }
                                  minW="0"
                                />
                                <Input
                                  name={`${field.name}-packages-${idx}`}
                                  value={val.packages || ""}
                                  onChange={(e) =>
                                    handleDynamicCargoGroupChange(
                                      field.name,
                                      idx,
                                      "packages",
                                      e.target.value
                                    )
                                  }
                                  bg={inputBg}
                                  borderRadius="md"
                                  focusBorderColor={inputFocusBorder}
                                  placeholder={
                                    field.packagesPlaceholder || "Packages"
                                  }
                                  minW="0"
                                />
                                <Input
                                  name={`${field.name}-weight-${idx}`}
                                  value={val.weight || ""}
                                  onChange={(e) =>
                                    handleDynamicCargoGroupChange(
                                      field.name,
                                      idx,
                                      "weight",
                                      e.target.value
                                    )
                                  }
                                  bg={inputBg}
                                  borderRadius="md"
                                  focusBorderColor={inputFocusBorder}
                                  placeholder={
                                    field.weightPlaceholder || "Weight"
                                  }
                                  minW="0"
                                />
                              </HStack>
                              <HStack spacing={2} flexWrap="wrap">
                                <Input
                                  name={`${field.name}-shipper-${idx}`}
                                  value={val.shipper || ""}
                                  onChange={(e) =>
                                    handleDynamicCargoGroupChange(
                                      field.name,
                                      idx,
                                      "shipper",
                                      e.target.value
                                    )
                                  }
                                  bg={inputBg}
                                  borderRadius="md"
                                  focusBorderColor={inputFocusBorder}
                                  placeholder={
                                    field.shipperPlaceholder || "Shipper"
                                  }
                                  minW="0"
                                />
                                <Input
                                  name={`${field.name}-consignee-${idx}`}
                                  value={val.consignee || ""}
                                  onChange={(e) =>
                                    handleDynamicCargoGroupChange(
                                      field.name,
                                      idx,
                                      "consignee",
                                      e.target.value
                                    )
                                  }
                                  bg={inputBg}
                                  borderRadius="md"
                                  focusBorderColor={inputFocusBorder}
                                  placeholder={
                                    field.consigneePlaceholder || "Consignee"
                                  }
                                  minW="0"
                                />
                              </HStack>
                            </Box>
                            <VStack justify="center" spacing={2} minW="40px">
                              {form[field.name].length > 1 && (
                                <IconButton
                                  aria-label={`Remove ${field.label}`}
                                  icon={<MinusIcon />}
                                  size="sm"
                                  alignSelf="center"
                                  onClick={() =>
                                    removeDynamicCargoGroup(field.name, idx)
                                  }
                                />
                              )}
                              {idx === form[field.name].length - 1 && (
                                <IconButton
                                  aria-label={`Add ${field.label}`}
                                  icon={<AddIcon />}
                                  size="sm"
                                  alignSelf="center"
                                  onClick={() =>
                                    addDynamicCargoGroup(field.name)
                                  }
                                />
                              )}
                            </VStack>
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
                if (
                  field.type === "customPortArea" &&
                  form.portArea === "Custom Location"
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
              {/* FILE UPLOAD FIELD RENDERED ONCE BELOW ALL FIELDS */}
              {fileField && (
                <FormControl
                  key={fileField.name}
                  isRequired={fileField.required}
                >
                  <FormLabel>{fileField.label}</FormLabel>
                  <Input
                    type="file"
                    name={fileField.name}
                    accept={fileField.accept}
                    onChange={(e) => {
                      const file = e.target.files && e.target.files[0];
                      setForm((prev) => ({ ...prev, [fileField.name]: file }));
                    }}
                    bg={inputBg}
                    borderRadius="md"
                    focusBorderColor={inputFocusBorder}
                  />
                </FormControl>
              )}
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
