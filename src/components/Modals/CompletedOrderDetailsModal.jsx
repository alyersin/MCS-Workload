import React, { useState, useEffect } from "react";
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  ModalCloseButton,
  Button,
  VStack,
  HStack,
  Text,
  Box,
  Badge,
  Divider,
  useToast,
  IconButton,
  Link,
  Spinner,
  Center,
} from "@chakra-ui/react";
import { DownloadIcon, ExternalLinkIcon } from "@chakra-ui/icons";

// COMPLETED ORDER DETAILS MODAL COMPONENT
export default function CompletedOrderDetailsModal({ isOpen, onClose, order }) {
  const toast = useToast();
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(false);

  // FETCH FILES FOR THIS COMPLETED ORDER
  useEffect(() => {
    if (isOpen && order?.order_id) {
      fetchFiles();
    }
  }, [isOpen, order?.order_id]);

  const fetchFiles = async () => {
    setLoading(true);
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_ORDER_API_URL}/completed-order-files/${order.order_id}`
      );

      if (response.ok) {
        const data = await response.json();
        setFiles(data.files || []);
      } else {
        console.error("Failed to fetch files");
        setFiles([]);
      }
    } catch (error) {
      console.error("Error fetching files:", error);
      setFiles([]);
    } finally {
      setLoading(false);
    }
  };

  // DOWNLOAD FILE
  const downloadFile = async (fileName) => {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_ORDER_API_URL}/download-completed-file/${
          order.order_id
        }/${encodeURIComponent(fileName)}`
      );

      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = fileName;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);

        toast({
          title: "FILE DOWNLOADED",
          description: `${fileName} has been downloaded successfully.`,
          status: "success",
          duration: 3000,
          isClosable: true,
          position: "top",
        });
      } else {
        throw new Error("Download failed");
      }
    } catch (error) {
      console.error("Download error:", error);
      toast({
        title: "DOWNLOAD FAILED",
        description: `Failed to download ${fileName}. Please try again.`,
        status: "error",
        duration: 3000,
        isClosable: true,
        position: "top",
      });
    }
  };

  // DOWNLOAD ALL FILES AS ZIP
  const downloadAllFiles = async () => {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_ORDER_API_URL}/download-all-completed-files/${order.order_id}`
      );

      if (response.ok) {
        const data = await response.json();

        if (data.success && data.files) {
          // FOR NOW, SHOW A MESSAGE INSTEAD OF DOWNLOADING ZIP
          toast({
            title: "ZIP DOWNLOAD NOT YET IMPLEMENTED",
            description:
              "Please download files individually. ZIP download will be available soon.",
            status: "info",
            duration: 4000,
            isClosable: true,
            position: "top",
          });
        } else {
          throw new Error("Download failed");
        }
      } else {
        throw new Error("Download failed");
      }
    } catch (error) {
      console.error("Download all files error:", error);
      toast({
        title: "DOWNLOAD FAILED",
        description: "Failed to download all files. Please try again.",
        status: "error",
        duration: 3000,
        isClosable: true,
        position: "top",
      });
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="xl" isCentered>
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>Completed Order Details</ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <VStack spacing={6} align="stretch">
            {/* ORDER INFO */}
            <Box p={4} bg="gray.50" borderRadius="md">
              <Text fontWeight="bold" mb={2}>
                Order Information:
              </Text>
              <VStack align="start" spacing={2}>
                <Text>
                  <strong>Order ID:</strong> {order?.order_id}
                </Text>
                <Text>
                  <strong>Type:</strong> {order?.order_type}
                </Text>
                <Text>
                  <strong>Completed:</strong>{" "}
                  {new Date(order?.completion_date).toLocaleString()}
                </Text>
                <Text>
                  <strong>User ID:</strong> {order?.user_id}
                </Text>
              </VStack>
            </Box>

            <Divider />

            {/* ORIGINAL ORDER DATA */}
            {order?.original_order_data && (
              <>
                <Box p={4} bg="blue.50" borderRadius="md">
                  <Text fontWeight="bold" mb={2}>
                    Original Order Details:
                  </Text>
                  <Text fontSize="sm" color="gray.700">
                    {JSON.stringify(order.original_order_data, null, 2)}
                  </Text>
                </Box>
                <Divider />
              </>
            )}

            {/* FILES SECTION */}
            <Box>
              <HStack justify="space-between" mb={3}>
                <Text fontWeight="bold">Uploaded Files:</Text>
                {files.length > 0 && (
                  <Button
                    size="sm"
                    colorScheme="blue"
                    leftIcon={<DownloadIcon />}
                    onClick={downloadAllFiles}
                  >
                    Download All
                  </Button>
                )}
              </HStack>

              {loading ? (
                <Center py={4}>
                  <Spinner />
                </Center>
              ) : files.length === 0 ? (
                <Text color="gray.500" fontSize="sm">
                  No files found for this completed order.
                </Text>
              ) : (
                <VStack spacing={2} align="stretch">
                  {files.map((fileName, index) => (
                    <HStack
                      key={index}
                      justify="space-between"
                      p={3}
                      bg="gray.50"
                      borderRadius="md"
                    >
                      <Text fontSize="sm" noOfLines={1} flex={1}>
                        {fileName}
                      </Text>
                      <IconButton
                        icon={<DownloadIcon />}
                        size="sm"
                        colorScheme="green"
                        variant="ghost"
                        onClick={() => downloadFile(fileName)}
                        aria-label={`Download ${fileName}`}
                      />
                    </HStack>
                  ))}
                </VStack>
              )}
            </Box>
          </VStack>
        </ModalBody>

        <ModalFooter>
          <Button variant="ghost" onClick={onClose}>
            Close
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}
