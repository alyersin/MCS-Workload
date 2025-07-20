import React from "react";
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  Progress,
  Text,
} from "@chakra-ui/react";

// UPLOAD PROGRESS MODAL COMPONENT
export default function UploadProgressModal({ isOpen, progress }) {
  return (
    <Modal
      isOpen={isOpen}
      onClose={() => {}}
      isCentered
      closeOnOverlayClick={false}
    >
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>UPLOADING FILES...</ModalHeader>
        <ModalBody>
          <Text mb={2} textAlign="center">
            {progress}%
          </Text>
          <Progress value={progress} size="lg" colorScheme="teal" />
        </ModalBody>
      </ModalContent>
    </Modal>
  );
}
