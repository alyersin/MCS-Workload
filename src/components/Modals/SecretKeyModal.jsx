import React from "react";
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
  useToast,
} from "@chakra-ui/react";
import { useSecretAccess } from "@/hooks/useSecretAccess";

// SECRET KEY MODAL COMPONENT
export default function SecretKeyModal({
  isOpen,
  onClose,
  pageName,
  onSuccess,
}) {
  const { secretInput, setSecretInput, accessGranted, handleSecretSubmit } =
    useSecretAccess(pageName);
  const toast = useToast();

  // HANDLE SUBMIT
  const handleSubmit = async (e) => {
    e.preventDefault();
    await handleSecretSubmit();
    if (localStorage.getItem(`access_${pageName}`)) {
      onSuccess();
      onClose();
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

  return (
    <Modal isOpen={isOpen} onClose={onClose} isCentered>
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>ENTER SECRET KEY</ModalHeader>
        <ModalCloseButton />
        <form onSubmit={handleSubmit}>
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
            <Button colorScheme="teal" mr={3} type="submit">
              SUBMIT
            </Button>
            <Button variant="ghost" onClick={onClose}>
              CANCEL
            </Button>
          </ModalFooter>
        </form>
      </ModalContent>
    </Modal>
  );
}
