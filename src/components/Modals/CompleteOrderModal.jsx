import React, { useState, useRef } from "react";
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  ModalCloseButton,
  Button,
  Input,
  FormControl,
  FormLabel,
  VStack,
  HStack,
  Text,
  useToast,
  IconButton,
  Box,
  Progress,
} from "@chakra-ui/react";
import { AddIcon, MinusIcon } from "@chakra-ui/icons";
import { useSecretAccess } from "@/hooks/useSecretAccess";
import { useAuth } from "@/hooks/useAuth";

// COMPLETE ORDER MODAL COMPONENT
export default function CompleteOrderModal({
  isOpen,
  onClose,
  order,
  onComplete,
}) {
  const { session } = useAuth();
  const toast = useToast();
  const [files, setFiles] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isSecretModalOpen, setIsSecretModalOpen] = useState(false);
  const [pendingComplete, setPendingComplete] = useState(false);

  const { secretInput, setSecretInput, accessGranted, handleSecretSubmit } =
    useSecretAccess("CompleteOrder");

  const fileInputRef = useRef();

  // HANDLE FILE SELECTION
  const handleFileSelect = (e) => {
    const selectedFiles = Array.from(e.target.files);
    setFiles((prev) => [...prev, ...selectedFiles]);
  };

  // REMOVE FILE
  const removeFile = (index) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
  };

  // HANDLE COMPLETE ORDER
  const handleCompleteOrder = () => {
    if (files.length === 0) {
      toast({
        title: "FILES REQUIRED",
        description: "Please upload at least one file to complete the order.",
        status: "warning",
        duration: 3000,
        isClosable: true,
        position: "top",
      });
      return;
    }
    setIsSecretModalOpen(true);
    setPendingComplete(true);
  };

  // HANDLE SECRET KEY SUCCESS
  const handleSecretSuccess = async () => {
    setUploading(true);
    setUploadProgress(0);

    try {
      // UPLOAD FILES TO COMPLETED ORDERS FOLDER
      const formData = new FormData();
      files.forEach((file) => formData.append("file", file));
      formData.append("orderId", order.order_id);
      formData.append("userId", session?.user?.uid || "unknown-user");
      formData.append("orderType", order.order_type);
      formData.append("completionDate", new Date().toISOString());

      // UPLOAD FILES WITH PROGRESS
      await new Promise((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        xhr.open(
          "POST",
          `${process.env.NEXT_PUBLIC_ORDER_API_URL}/complete-order`
        );

        xhr.upload.onprogress = (event) => {
          if (event.lengthComputable) {
            const percent = Math.round((event.loaded / event.total) * 100);
            setUploadProgress(percent);
          }
        };

        xhr.onload = () => {
          if (xhr.status === 200) {
            setUploadProgress(100);
            resolve();
          } else {
            reject(new Error("UPLOAD FAILED"));
          }
        };

        xhr.onerror = () => {
          reject(new Error("UPLOAD FAILED"));
        };

        xhr.send(formData);
      });

      // ORDER STATUS IS ALREADY UPDATED BY THE POST ROUTE - NO NEED FOR SEPARATE PUT REQUEST
      // The POST route above already handles:
      // 1. File upload to completed orders folder
      // 2. Insert into completed_orders table
      // 3. Update order status to 'Completed'

      // SUCCESS - ORDER COMPLETED
      toast({
        title: "ORDER COMPLETED SUCCESSFULLY!",
        description: `Order ${order.order_id} has been marked as completed.`,
        status: "success",
        duration: 4000,
        isClosable: true,
        position: "top",
      });

      // CALL PARENT CALLBACK TO REFRESH ORDERS
      if (onComplete) {
        onComplete();
      }

      // RESET STATE
      setFiles([]);
      setUploading(false);
      setUploadProgress(0);
      setPendingComplete(false);
      onClose();
    } catch (error) {
      console.error("COMPLETE ORDER ERROR:", error);
      toast({
        title: "COMPLETION FAILED",
        description:
          error.message || "Failed to complete order. Please try again.",
        status: "error",
        duration: 4000,
        isClosable: true,
        position: "top",
      });
      setUploading(false);
      setUploadProgress(0);
      setPendingComplete(false);
    }
  };

  // SECRET KEY MODAL HANDLERS
  const handleSecretSubmitClick = async () => {
    await handleSecretSubmit();
    if (localStorage.getItem("access_CompleteOrder")) {
      handleSecretSuccess();
      setIsSecretModalOpen(false);
      setSecretInput("");
    } else {
      toast({
        title: "INVALID SECRET KEY",
        status: "error",
        duration: 3000,
        isClosable: true,
        position: "top",
      });
    }
  };

  const handleSecretCancel = () => {
    setIsSecretModalOpen(false);
    setSecretInput("");
  };

  return (
    <>
      <Modal isOpen={isOpen} onClose={onClose} size="xl" isCentered>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Complete Order: {order?.order_id}</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <VStack spacing={6} align="stretch">
              {/* ORDER INFO */}
              <Box p={4} bg="gray.50" borderRadius="md">
                <Text fontWeight="bold" mb={2}>
                  Order Details:
                </Text>
                <Text>Type: {order?.order_type}</Text>
                <Text>Status: {order?.status}</Text>
                <Text>
                  Created: {new Date(order?.created_at).toLocaleDateString()}
                </Text>
              </Box>

              {/* FILE UPLOAD SECTION */}
              <Box>
                <Text fontWeight="bold" mb={3}>
                  Upload Completion Files:
                </Text>

                {/* FILE INPUT */}
                <Button
                  leftIcon={<AddIcon />}
                  onClick={() => fileInputRef.current?.click()}
                  colorScheme="blue"
                  variant="outline"
                  mb={3}
                >
                  Add Files
                </Button>
                <input
                  ref={fileInputRef}
                  type="file"
                  multiple
                  onChange={handleFileSelect}
                  style={{ display: "none" }}
                />

                {/* UPLOAD PROGRESS */}
                {uploading && (
                  <Box mb={3}>
                    <Text fontSize="sm" mb={1}>
                      Uploading files...
                    </Text>
                    <Progress
                      value={uploadProgress}
                      size="sm"
                      colorScheme="blue"
                    />
                    <Text fontSize="xs" mt={1}>
                      {uploadProgress}%
                    </Text>
                  </Box>
                )}

                {/* FILE LIST */}
                {files.length > 0 && (
                  <VStack spacing={2} align="stretch">
                    <Text fontSize="sm" fontWeight="medium">
                      Selected Files:
                    </Text>
                    {files.map((file, index) => (
                      <HStack
                        key={index}
                        justify="space-between"
                        p={2}
                        bg="gray.50"
                        borderRadius="md"
                      >
                        <Text fontSize="sm" noOfLines={1}>
                          {file.name}
                        </Text>
                        <IconButton
                          icon={<MinusIcon />}
                          size="sm"
                          onClick={() => removeFile(index)}
                          colorScheme="red"
                          variant="ghost"
                        />
                      </HStack>
                    ))}
                  </VStack>
                )}
              </Box>

              {/* WARNING */}
              <Box p={3} bg="orange.50" borderRadius="md">
                <Text fontSize="sm" color="orange.800">
                  <strong>Note:</strong> Completing an order will change its
                  status to "Completed" and move the uploaded files to the
                  completed orders folder. This action cannot be undone.
                </Text>
              </Box>
            </VStack>
          </ModalBody>

          <ModalFooter>
            <Button
              colorScheme="green"
              onClick={handleCompleteOrder}
              isLoading={uploading}
              loadingText="Completing..."
              isDisabled={files.length === 0 || uploading}
            >
              Complete Order
            </Button>
            <Button variant="ghost" onClick={onClose} ml={3}>
              Cancel
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* SECRET KEY MODAL */}
      <Modal
        isOpen={isSecretModalOpen}
        onClose={handleSecretCancel}
        isCentered
      >
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>ENTER SECRET KEY TO COMPLETE ORDER</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <FormControl isRequired>
              <Input
                placeholder="Secret key"
                value={secretInput}
                onChange={(e) => setSecretInput(e.target.value)}
                autoFocus
                autoComplete="off"
              />
            </FormControl>
          </ModalBody>
          <ModalFooter>
            <Button
              colorScheme="teal"
              mr={3}
              onClick={handleSecretSubmitClick}
            >
              COMPLETE ORDER
            </Button>
            <Button
              variant="ghost"
              onClick={handleSecretCancel}
            >
              CANCEL
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
}
