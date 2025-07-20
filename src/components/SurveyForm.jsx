import React, { useState, useRef } from "react";
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
  Progress,
} from "@chakra-ui/react";
import { AddIcon, MinusIcon } from "@chakra-ui/icons";
import { useSecretAccess } from "@/hooks/useSecretAccess";
import { onAuthStateChanged, getAuth } from "firebase/auth";
import { uploadFileWithMeta, uploadFilesWithMeta } from "@/utils/uploadFile";
import { useAuth } from "@/hooks/useAuth";
import SecretKeyModal from "@/components/Modals/SecretKeyModal";
import UploadProgressModal from "@/components/Modals/UploadProgressModal";

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
  // SUBMISSION FOLDER REF (PERSIST ACROSS FILES IN ONE SUBMISSION)
  const submissionFolderRef = useRef(null);

  const { secretInput, setSecretInput, accessGranted, handleSecretSubmit } =
    useSecretAccess(secretAccess);
  const { isAuthenticated, isLoading, session } = useAuth();
  // MODAL STATE
  const [isSecretModalOpen, setSecretModalOpen] = useState(false);
  const [pendingSubmit, setPendingSubmit] = useState(false);
  // PROGRESS STATE
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploading, setUploading] = useState(false);
  const [showUploadModal, setShowUploadModal] = useState(false);

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

  // HANDLE FORM SUBMIT (SHOW SECRET MODAL)
  const handleSubmit = (e) => {
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
        title: "REQUIRED FIELDS MISSING!",
        status: "warning",
        duration: 4000,
        isClosable: true,
        position: "top",
      });
      return;
    }
    setSecretModalOpen(true);
    setPendingSubmit(true);
  };

  // HANDLE SECRET KEY SUCCESS
  const handleSecretSuccess = async () => {
    // UPLOAD FILES IF PRESENT
    if (fileField && form[fileField.name]) {
      const dateField =
        form.dateOfLoading ||
        form.date ||
        new Date().toISOString().slice(0, 10);
      const files = Array.isArray(form[fileField.name])
        ? form[fileField.name]
        : [form[fileField.name]];
      setUploading(true);
      setUploadProgress(0);
      setShowUploadModal(true); // SHOW MODAL
      // GENERATE UNIQUE FOLDER NAME ONCE PER SUBMISSION
      if (!submissionFolderRef.current) {
        const d = new Date();
        const dateStr = `${String(d.getMonth() + 1).padStart(2, "0")}${String(
          d.getDate()
        ).padStart(2, "0")}${d.getFullYear()}`;
        const unique = Date.now();
        submissionFolderRef.current = `${dateStr}-${unique}`;
      }
      // LOG THE FOLDER NAME USED FOR THIS BATCH
      console.log(
        "Uploading with submissionFolder:",
        submissionFolderRef.current
      );
      try {
        const formData = new FormData();
        files.forEach((file) => formData.append("file", file));
        formData.append("formType", secretAccess || "unknown-form");
        formData.append("date", dateField);
        formData.append("userId", session?.user?.uid || "unknown-user");
        formData.append("submissionFolder", submissionFolderRef.current);
        // Use XMLHttpRequest for progress
        await new Promise((resolve, reject) => {
          const xhr = new XMLHttpRequest();
          xhr.open("POST", "http://5.14.89.59/upload");
          xhr.upload.onprogress = (event) => {
            if (event.lengthComputable) {
              const percent = Math.round((event.loaded / event.total) * 100);
              setUploadProgress(percent);
            }
          };
          xhr.onload = () => {
            setUploadProgress(100);
            setTimeout(() => setShowUploadModal(false), 800); // HIDE MODAL
            resolve();
          };
          xhr.onerror = () => {
            setShowUploadModal(false);
            reject(new Error("UPLOAD FAILED"));
          };
          xhr.send(formData);
        });
      } catch (e) {
        toast({
          title: "UPLOAD FAILED",
          status: "error",
          duration: 3000,
          isClosable: true,
          position: "top",
        });
        setUploading(false);
        setUploadProgress(0);
        setShowUploadModal(false);
        submissionFolderRef.current = null;
        return;
      }
      setUploading(false);
      setUploadProgress(100);
    }
    await fetch("/api/send-pdf", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...form, _serviceName: secretAccess }),
    });
    toast({
      title: "FORM SUBMITTED AND EMAILED SUCCESSFULLY",
      status: "success",
      duration: 3000,
      isClosable: true,
      position: "top",
    });
    if (onSubmitProp) onSubmitProp(form);
    setForm(initialForm);
    setPendingSubmit(false);
    setUploadProgress(0);
    submissionFolderRef.current = null; // RESET FOR NEXT SUBMISSION
  };

  if (!mounted || isLoading) return null; // SHOW NOTHING WHILE AUTH LOADING

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
      {/* UPLOAD PROGRESS MODAL */}
      <UploadProgressModal isOpen={showUploadModal} progress={uploadProgress} />
      {/* SECRET KEY MODAL ON SUBMIT */}
      <SecretKeyModal
        isOpen={isSecretModalOpen}
        onClose={() => setSecretModalOpen(false)}
        pageName={secretAccess}
        onSuccess={handleSecretSuccess}
      />
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
                              onClick={() => removeDynamicPair(field.name, idx)}
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
                                  field.descriptionPlaceholder || "Description"
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
                                onClick={() => addDynamicCargoGroup(field.name)}
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
              <FormControl key={fileField.name} isRequired={fileField.required}>
                <FormLabel>
                  {fileField.label.replace(/\(ZIP files\)/i, "")}
                  <span
                    style={{ color: "red", fontWeight: "bold", marginLeft: 4 }}
                  >
                    (ZIP files)
                  </span>
                </FormLabel>
                <Input
                  type="file"
                  name={fileField.name}
                  accept={fileField.accept}
                  multiple
                  onChange={(e) => {
                    const newFiles = e.target.files
                      ? Array.from(e.target.files)
                      : [];
                    setForm((prev) => {
                      const existing = Array.isArray(prev[fileField.name])
                        ? prev[fileField.name]
                        : [];
                      // APPEND NEW FILES, AVOID DUPLICATES BY NAME + SIZE
                      const allFiles = [...existing];
                      newFiles.forEach((f) => {
                        if (
                          !allFiles.some(
                            (x) => x.name === f.name && x.size === f.size
                          )
                        ) {
                          allFiles.push(f);
                        }
                      });
                      return { ...prev, [fileField.name]: allFiles };
                    });
                    // RESET INPUT VALUE TO ALLOW RE-SELECTING SAME FILE
                    e.target.value = "";
                  }}
                  bg={inputBg}
                  borderRadius="md"
                  focusBorderColor={inputFocusBorder}
                />
                {/* SHOW SELECTED FILES LIST */}
                {Array.isArray(form[fileField.name]) &&
                  form[fileField.name].length > 0 && (
                    <VStack align="start" mt={2} spacing={1}>
                      {form[fileField.name].map((file, idx) => (
                        <HStack key={file.name + file.size} spacing={2}>
                          <Box fontSize="sm">{file.name}</Box>
                          <Button
                            size="xs"
                            colorScheme="red"
                            variant="ghost"
                            onClick={() => {
                              setForm((prev) => {
                                const arr = prev[fileField.name].filter(
                                  (_, i) => i !== idx
                                );
                                return { ...prev, [fileField.name]: arr };
                              });
                            }}
                          >
                            REMOVE
                          </Button>
                        </HStack>
                      ))}
                    </VStack>
                  )}
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
    </Container>
  );
}
