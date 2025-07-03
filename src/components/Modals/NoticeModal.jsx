"use client";
import { useEffect, useState } from "react";
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalCloseButton,
  IconButton,
  useDisclosure,
  Text,
  Tooltip,
} from "@chakra-ui/react";
import { InfoIcon } from "@chakra-ui/icons";

export default function NoticeModal() {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [hasSeen, setHasSeen] = useState(false);

  useEffect(() => {
    const seen = localStorage.getItem("hasSeenNoticeModal");
    if (!seen) {
      onOpen();
      localStorage.setItem("hasSeenNoticeModal", "true");
      setHasSeen(true);
    } else {
      setHasSeen(true); // show the icon if already seen
    }
  }, [onOpen]);

  const today = new Date().toLocaleDateString("en-GB");

  return (
    <>
      {hasSeen && (
        <Tooltip label="View App Info" placement="top">
          <IconButton
            icon={<InfoIcon />}
            colorScheme="teal"
            borderRadius="md"
            position="fixed"
            bottom="1.5rem"
            left="3.5rem"
            zIndex={999}
            size="lg"
            onClick={onOpen}
            aria-label="App Info"
          />
        </Tooltip>
      )}

      <Modal isOpen={isOpen} onClose={onClose} isCentered>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Notice – {today}</ModalHeader>
          <ModalCloseButton />
          <ModalBody pb={6}>
            <Text mb={2}>The portal is still in development.</Text>
            <Text>Some features may not be fully integrated</Text>
          </ModalBody>
        </ModalContent>
      </Modal>
    </>
  );
}
