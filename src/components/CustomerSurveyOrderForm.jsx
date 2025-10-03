"use client";

import React, { useState } from "react";
import {
  Box,
  Button,
  FormControl,
  FormLabel,
  Input,
  Textarea,
  Select,
  VStack,
  HStack,
  useToast,
  useColorModeValue,
  Text,
  Card,
  CardBody,
  Divider,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
  Radio,
  RadioGroup,
  Stack,
  Grid,
  GridItem,
  Badge,
  Icon,
  Heading,
  InputGroup,
  InputRightElement,
  IconButton,
  Progress,
  List,
  ListItem,
  ListIcon,
  useColorMode,
} from "@chakra-ui/react";
import { useAuth } from "@/hooks/useAuth";
import {
  InfoIcon,
  CalendarIcon,
  TimeIcon,
  AddIcon,
  DeleteIcon,
  AttachmentIcon,
} from "@chakra-ui/icons";

// SURVEY TYPES AVAILABLE FOR CUSTOMERS (Based on existing services)
const SURVEY_TYPES = {
  TRANSLOADING_CONTAINER_TRUCK: {
    id: "transloading_container_truck",
    name: "Transloading: Container → Truck",
    description:
      "Transfer cargo from container to road transport with full documentation",
    estimatedDuration: "2-4 hours",
    price: "Contact for quote",
  },
  TRANSLOADING_TRUCK_CONTAINER: {
    id: "transloading_truck_container",
    name: "Transloading: Truck → Container",
    description:
      "Transfer cargo from road transport to container with full documentation",
    estimatedDuration: "2-4 hours",
    price: "Contact for quote",
  },
  STRIPPING: {
    id: "stripping",
    name: "Container Stripping",
    description:
      "Unloading cargo from container to storage with condition assessment",
    estimatedDuration: "2-6 hours",
    price: "Contact for quote",
  },
  STUFFING: {
    id: "stuffing",
    name: "Container Stuffing",
    description: "Loading cargo from storage to container with proper stowage",
    estimatedDuration: "2-6 hours",
    price: "Contact for quote",
  },
  STRIPPING_RESTUFFING: {
    id: "stripping_restuffing",
    name: "Stripping & Restuffing",
    description: "Complete cargo transfer between containers with inspection",
    estimatedDuration: "4-8 hours",
    price: "Contact for quote",
  },
  TRANSSHIPMENT_C2C: {
    id: "transshipment_c2c",
    name: "Transshipment C2C",
    description: "Container to container transfer operations with supervision",
    estimatedDuration: "3-6 hours",
    price: "Contact for quote",
  },
  VESSEL_BARGE: {
    id: "vessel_barge",
    name: "Vessel/Barge Survey",
    description:
      "Comprehensive vessel or barge inspection and condition assessment",
    estimatedDuration: "4-8 hours",
    price: "Contact for quote",
  },
  LASHING: {
    id: "lashing",
    name: "Lashing Report",
    description: "Cargo securing and lashing inspection for safe transport",
    estimatedDuration: "1-3 hours",
    price: "Contact for quote",
  },
};

// URGENCY LEVELS
const URGENCY_LEVELS = {
  STANDARD: {
    id: "standard",
    name: "Standard",
    description: "Normal processing (2-3 business days)",
    color: "green",
  },
  URGENT: {
    id: "urgent",
    name: "Urgent",
    description: "Priority processing (1 business day)",
    color: "orange",
  },
  CRITICAL: {
    id: "critical",
    name: "Critical",
    description: "Same day processing (within 24 hours)",
    color: "red",
  },
};

export default function CustomerSurveyOrderForm() {
  const { session } = useAuth();
  const toast = useToast();
  const inputBg = useColorModeValue("gray.50", "gray.600");
  const cardBg = useColorModeValue("white", "gray.800");

  const [formData, setFormData] = useState({
    // Basic Information
    contactName: session?.user?.name || "",
    email: session?.user?.email || "",
    phone: "",
    company: "",

    // Survey Details
    surveyType: "",
    urgency: "standard",
    preferredDate: "",
    preferredTime: "",
    location: "",

    // Additional Information
    vesselName: "",
    vesselIMO: "",
    cargoDescription: "",
    containerNumbers: "",
    specialRequirements: "",
    additionalNotes: "",
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleFileUpload = async (files) => {
    if (!files || files.length === 0) return;

    setIsUploading(true);
    setUploadProgress(0);

    try {
      // For now, store files locally and upload them when the order is submitted
      // This is a simpler approach that uploads files as part of the order submission
      const uploadedFileData = [];

      for (let i = 0; i < files.length; i++) {
        const file = files[i];

        // Validate file size (max 10MB)
        if (file.size > 10 * 1024 * 1024) {
          toast({
            title: "File too large",
            description: `${file.name} is larger than 10MB`,
            status: "error",
            duration: 3000,
            isClosable: true,
          });
          continue;
        }

        // Validate file type
        const allowedTypes = [
          "application/pdf",
          "image/jpeg",
          "image/png",
          "image/gif",
          "application/msword",
          "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
          "application/vnd.ms-excel",
          "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        ];

        if (!allowedTypes.includes(file.type)) {
          toast({
            title: "File type not supported",
            description: `${file.name} is not a supported file type`,
            status: "error",
            duration: 3000,
            isClosable: true,
          });
          continue;
        }

        // Create file data object
        const fileData = {
          id: Date.now() + i,
          name: file.name,
          size: file.size,
          type: file.type,
          file: file, // Keep the original file for later upload
          uploadedAt: new Date().toISOString(),
        };

        uploadedFileData.push(fileData);
        setUploadProgress(((i + 1) / files.length) * 100);
      }

      setUploadedFiles((prev) => [...prev, ...uploadedFileData]);

      toast({
        title: "Files ready for upload",
        description: `${uploadedFileData.length} file(s) ready for submission`,
        status: "success",
        duration: 3000,
        isClosable: true,
      });
    } catch (error) {
      console.error("File processing error:", error);
      toast({
        title: "File processing failed",
        description: "There was an error processing your files",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
    }
  };

  const removeFile = (fileId) => {
    setUploadedFiles((prev) => prev.filter((file) => file.id !== fileId));
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validation
    if (!formData.surveyType || !formData.location || !formData.preferredDate) {
      toast({
        title: "Missing Required Information",
        description:
          "Please fill in all required fields (Survey Type, Location, Preferred Date)",
        status: "error",
        duration: 4000,
        isClosable: true,
      });
      return;
    }

    setIsSubmitting(true);

    try {
      // First, upload files if any
      let uploadedFilePaths = [];
      if (uploadedFiles.length > 0) {
        const tempOrderId = `temp-${Date.now()}`;
        const fileFormData = new FormData();
        fileFormData.append("orderId", tempOrderId);

        uploadedFiles.forEach((fileObj) => {
          fileFormData.append("files", fileObj.file);
        });

        const uploadResponse = await fetch("/api/upload-files", {
          method: "POST",
          body: fileFormData,
        });

        if (uploadResponse.ok) {
          const uploadResult = await uploadResponse.json();
          uploadedFilePaths = uploadResult.files;
        }
      }

      // Submit survey order request
      const response = await fetch("/api/submit-survey-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          userId: session?.user?.uid,
          orderType: "SurveyRequest",
          createdAt: new Date().toISOString(),
          uploadedFiles: uploadedFilePaths.map((file) => ({
            name: file.originalName,
            size: file.size,
            type: file.type,
            filePath: file.filePath,
            uploadedAt: file.uploadedAt,
          })),
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to submit survey order");
      }

      const result = await response.json();

      toast({
        title: "Survey Order Submitted Successfully!",
        description: `Your survey request has been submitted. Order ID: ${result.orderId}`,
        status: "success",
        duration: 5000,
        isClosable: true,
      });

      // Reset form
      setFormData({
        ...formData,
        surveyType: "",
        urgency: "standard",
        preferredDate: "",
        preferredTime: "",
        location: "",
        vesselName: "",
        vesselIMO: "",
        cargoDescription: "",
        containerNumbers: "",
        specialRequirements: "",
        additionalNotes: "",
      });
      setUploadedFiles([]);
    } catch (error) {
      console.error("Error submitting survey order:", error);
      toast({
        title: "Submission Failed",
        description:
          "There was an error submitting your survey order. Please try again.",
        status: "error",
        duration: 4000,
        isClosable: true,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card bg={cardBg} shadow="lg">
      <CardBody p={8}>
        <form onSubmit={handleSubmit}>
          <VStack spacing={8} align="stretch">
            {/* INFORMATION ALERT */}
            <Alert status="info" borderRadius="md">
              <AlertIcon />
              <Box>
                <AlertTitle>How it works:</AlertTitle>
                <AlertDescription>
                  Fill out this form to request a professional survey. Our team
                  will review your request and assign a certified surveyor to
                  complete the inspection.
                </AlertDescription>
              </Box>
            </Alert>

            {/* BASIC INFORMATION */}
            <Box>
              <Heading size="md" mb={4} color="teal.600">
                <Icon as={InfoIcon} mr={2} />
                Contact Information
              </Heading>
              <Grid templateColumns={{ base: "1fr", md: "1fr 1fr" }} gap={4}>
                <GridItem>
                  <FormControl isRequired>
                    <FormLabel>Contact Name</FormLabel>
                    <Input
                      value={formData.contactName}
                      onChange={(e) =>
                        handleInputChange("contactName", e.target.value)
                      }
                      bg={inputBg}
                      placeholder="Your full name"
                    />
                  </FormControl>
                </GridItem>
                <GridItem>
                  <FormControl isRequired>
                    <FormLabel>Email</FormLabel>
                    <Input
                      type="email"
                      value={formData.email}
                      onChange={(e) =>
                        handleInputChange("email", e.target.value)
                      }
                      bg={inputBg}
                      placeholder="your.email@company.com"
                    />
                  </FormControl>
                </GridItem>
                <GridItem>
                  <FormControl>
                    <FormLabel>Phone Number</FormLabel>
                    <Input
                      value={formData.phone}
                      onChange={(e) =>
                        handleInputChange("phone", e.target.value)
                      }
                      bg={inputBg}
                      placeholder="+1 (555) 123-4567"
                    />
                  </FormControl>
                </GridItem>
                <GridItem>
                  <FormControl>
                    <FormLabel>Company</FormLabel>
                    <Input
                      value={formData.company}
                      onChange={(e) =>
                        handleInputChange("company", e.target.value)
                      }
                      bg={inputBg}
                      placeholder="Your company name"
                    />
                  </FormControl>
                </GridItem>
              </Grid>
            </Box>

            <Divider />

            {/* SURVEY DETAILS */}
            <Box>
              <Heading size="md" mb={4} color="teal.600">
                <Icon as={CalendarIcon} mr={2} />
                Survey Details
              </Heading>

              <VStack spacing={6} align="stretch">
                {/* Survey Type Selection */}
                <FormControl isRequired>
                  <FormLabel>Survey Type</FormLabel>
                  <RadioGroup
                    value={formData.surveyType}
                    onChange={(value) => handleInputChange("surveyType", value)}
                  >
                    <Stack spacing={3}>
                      {Object.values(SURVEY_TYPES).map((type) => (
                        <Box
                          key={type.id}
                          p={4}
                          borderWidth={1}
                          borderRadius="md"
                          borderColor={
                            formData.surveyType === type.id
                              ? "teal.500"
                              : "gray.200"
                          }
                          bg={
                            formData.surveyType === type.id
                              ? "teal.50"
                              : "transparent"
                          }
                          cursor="pointer"
                          onClick={() =>
                            handleInputChange("surveyType", type.id)
                          }
                        >
                          <Radio value={type.id} colorScheme="teal">
                            <VStack align="start" spacing={1}>
                              <HStack>
                                <Text fontWeight="bold">{type.name}</Text>
                                <Badge colorScheme="blue" size="sm">
                                  {type.estimatedDuration}
                                </Badge>
                              </HStack>
                              <Text fontSize="sm" color="gray.600">
                                {type.description}
                              </Text>
                            </VStack>
                          </Radio>
                        </Box>
                      ))}
                    </Stack>
                  </RadioGroup>
                </FormControl>

                {/* Urgency Level */}
                <FormControl>
                  <FormLabel>Urgency Level</FormLabel>
                  <RadioGroup
                    value={formData.urgency}
                    onChange={(value) => handleInputChange("urgency", value)}
                  >
                    <Stack spacing={2}>
                      {Object.values(URGENCY_LEVELS).map((level) => (
                        <Box
                          key={level.id}
                          p={3}
                          borderWidth={1}
                          borderRadius="md"
                          borderColor={
                            formData.urgency === level.id
                              ? "teal.500"
                              : "gray.200"
                          }
                          bg={
                            formData.urgency === level.id
                              ? "teal.50"
                              : "transparent"
                          }
                          cursor="pointer"
                          onClick={() => handleInputChange("urgency", level.id)}
                        >
                          <Radio value={level.id} colorScheme="teal">
                            <HStack>
                              <Badge colorScheme={level.color} size="sm">
                                {level.name}
                              </Badge>
                              <Text fontSize="sm" color="gray.600">
                                {level.description}
                              </Text>
                            </HStack>
                          </Radio>
                        </Box>
                      ))}
                    </Stack>
                  </RadioGroup>
                </FormControl>

                <Grid templateColumns={{ base: "1fr", md: "1fr 1fr" }} gap={4}>
                  <GridItem>
                    <FormControl isRequired>
                      <FormLabel>Preferred Date</FormLabel>
                      <Input
                        type="date"
                        value={formData.preferredDate}
                        onChange={(e) =>
                          handleInputChange("preferredDate", e.target.value)
                        }
                        bg={inputBg}
                      />
                    </FormControl>
                  </GridItem>
                  <GridItem>
                    <FormControl>
                      <FormLabel>Preferred Time</FormLabel>
                      <Input
                        type="time"
                        value={formData.preferredTime}
                        onChange={(e) =>
                          handleInputChange("preferredTime", e.target.value)
                        }
                        bg={inputBg}
                      />
                    </FormControl>
                  </GridItem>
                </Grid>

                <FormControl isRequired>
                  <FormLabel>Location</FormLabel>
                  <Input
                    value={formData.location}
                    onChange={(e) =>
                      handleInputChange("location", e.target.value)
                    }
                    bg={inputBg}
                    placeholder="Port, terminal, or specific location"
                  />
                </FormControl>
              </VStack>
            </Box>

            <Divider />

            {/* VESSEL/CARGO INFORMATION */}
            <Box>
              <Heading size="md" mb={4} color="teal.600">
                Vessel & Cargo Information
              </Heading>
              <Grid templateColumns={{ base: "1fr", md: "1fr 1fr" }} gap={4}>
                <GridItem>
                  <FormControl>
                    <FormLabel>Vessel Name</FormLabel>
                    <Input
                      value={formData.vesselName}
                      onChange={(e) =>
                        handleInputChange("vesselName", e.target.value)
                      }
                      bg={inputBg}
                      placeholder="Name of vessel"
                    />
                  </FormControl>
                </GridItem>
                <GridItem>
                  <FormControl>
                    <FormLabel>Vessel IMO Number</FormLabel>
                    <Input
                      value={formData.vesselIMO}
                      onChange={(e) =>
                        handleInputChange("vesselIMO", e.target.value)
                      }
                      bg={inputBg}
                      placeholder="IMO number"
                    />
                  </FormControl>
                </GridItem>
                <GridItem colSpan={{ base: 1, md: 2 }}>
                  <FormControl>
                    <FormLabel>Cargo Description</FormLabel>
                    <Textarea
                      value={formData.cargoDescription}
                      onChange={(e) =>
                        handleInputChange("cargoDescription", e.target.value)
                      }
                      bg={inputBg}
                      placeholder="Describe the cargo, commodity, quantity, etc."
                      rows={3}
                    />
                  </FormControl>
                </GridItem>
                <GridItem colSpan={{ base: 1, md: 2 }}>
                  <FormControl>
                    <FormLabel>Container Numbers (if applicable)</FormLabel>
                    <Textarea
                      value={formData.containerNumbers}
                      onChange={(e) =>
                        handleInputChange("containerNumbers", e.target.value)
                      }
                      bg={inputBg}
                      placeholder="List container numbers, separated by commas"
                      rows={2}
                    />
                  </FormControl>
                </GridItem>
              </Grid>
            </Box>

            <Divider />

            {/* ADDITIONAL INFORMATION */}
            <Box>
              <Heading size="md" mb={4} color="teal.600">
                Additional Information
              </Heading>
              <VStack spacing={4} align="stretch">
                <FormControl>
                  <FormLabel>Special Requirements</FormLabel>
                  <Textarea
                    value={formData.specialRequirements}
                    onChange={(e) =>
                      handleInputChange("specialRequirements", e.target.value)
                    }
                    bg={inputBg}
                    placeholder="Any special requirements, certifications needed, or specific procedures"
                    rows={3}
                  />
                </FormControl>
                <FormControl>
                  <FormLabel>Additional Notes</FormLabel>
                  <Textarea
                    value={formData.additionalNotes}
                    onChange={(e) =>
                      handleInputChange("additionalNotes", e.target.value)
                    }
                    bg={inputBg}
                    placeholder="Any additional information that might be helpful"
                    rows={3}
                  />
                </FormControl>
              </VStack>
            </Box>

            <Divider />

            {/* FILE UPLOAD SECTION */}
            <Box>
              <Heading size="md" mb={4} color="teal.600">
                <Icon as={AttachmentIcon} mr={2} />
                Supporting Documents
              </Heading>

              <VStack spacing={4} align="stretch">
                <Alert status="info" borderRadius="md">
                  <AlertIcon />
                  <Box>
                    <AlertTitle>Optional File Upload</AlertTitle>
                    <AlertDescription>
                      Upload any supporting documents like cargo manifests,
                      vessel certificates, or other relevant files (PDF, images,
                      Word, Excel - max 10MB each).
                    </AlertDescription>
                  </Box>
                </Alert>

                {/* File Upload Input */}
                <FormControl>
                  <FormLabel>Upload Files</FormLabel>
                  <InputGroup>
                    <Input
                      type="file"
                      multiple
                      accept=".pdf,.jpg,.jpeg,.png,.gif,.doc,.docx,.xls,.xlsx"
                      onChange={(e) => handleFileUpload(e.target.files)}
                      bg={inputBg}
                      p={2}
                      _placeholder={{ opacity: 0.6 }}
                      placeholder="Select files to upload..."
                    />
                    <InputRightElement>
                      <IconButton
                        aria-label="Upload files"
                        icon={<AddIcon />}
                        size="sm"
                        colorScheme="teal"
                        variant="ghost"
                      />
                    </InputRightElement>
                  </InputGroup>
                  <Text fontSize="sm" color="gray.500" mt={2}>
                    Supported formats: PDF, Images (JPG, PNG, GIF), Word, Excel
                    (Max 10MB per file)
                  </Text>
                </FormControl>

                {/* Upload Progress */}
                {isUploading && (
                  <Box>
                    <Text fontSize="sm" mb={2}>
                      Uploading files...
                    </Text>
                    <Progress
                      value={uploadProgress}
                      colorScheme="teal"
                      size="sm"
                    />
                  </Box>
                )}

                {/* Uploaded Files List */}
                {uploadedFiles.length > 0 && (
                  <Box>
                    <Text fontSize="sm" fontWeight="bold" mb={2}>
                      Uploaded Files ({uploadedFiles.length})
                    </Text>
                    <List spacing={2}>
                      {uploadedFiles.map((file) => (
                        <ListItem
                          key={file.id}
                          p={3}
                          bg={inputBg}
                          borderRadius="md"
                          borderWidth={1}
                          borderColor="gray.200"
                        >
                          <HStack justify="space-between">
                            <HStack>
                              <ListIcon as={AttachmentIcon} color="teal.500" />
                              <VStack align="start" spacing={0}>
                                <Text fontSize="sm" fontWeight="medium">
                                  {file.name}
                                </Text>
                                <Text fontSize="xs" color="gray.500">
                                  {formatFileSize(file.size)} • {file.type}
                                </Text>
                              </VStack>
                            </HStack>
                            <IconButton
                              aria-label="Remove file"
                              icon={<DeleteIcon />}
                              size="sm"
                              colorScheme="red"
                              variant="ghost"
                              onClick={() => removeFile(file.id)}
                            />
                          </HStack>
                        </ListItem>
                      ))}
                    </List>
                  </Box>
                )}
              </VStack>
            </Box>

            {/* SUBMIT BUTTON */}
            <Box textAlign="center" pt={4}>
              <Button
                type="submit"
                colorScheme="teal"
                size="lg"
                isLoading={isSubmitting}
                loadingText="Submitting Order..."
                width={{ base: "100%", md: "300px" }}
              >
                Submit Survey Order
              </Button>
            </Box>
          </VStack>
        </form>
      </CardBody>
    </Card>
  );
}
