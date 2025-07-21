import React, { useEffect, useState } from "react";
import { Box, Button, Text, HStack } from "@chakra-ui/react";

const GDPRBanner = () => {
  const [show, setShow] = useState(false);

  useEffect(() => {
    const consent = localStorage.getItem("gdprConsent");
    if (!consent) {
      setShow(true);
    }
  }, []);

  const handleAccept = () => {
    localStorage.setItem("gdprConsent", "accepted");
    setShow(false);
  };

  const handleDecline = () => {
    localStorage.setItem("gdprConsent", "declined");
    setShow(false);
  };

  if (!show) return null;

  return (
    <Box
      position="fixed"
      bottom={0}
      left={0}
      width="100vw"
      bg="gray.800"
      color="white"
      py={4}
      px={6}
      zIndex={1400}
      display="flex"
      justifyContent="center"
      alignItems="center"
      boxShadow="0 -2px 8px rgba(0,0,0,0.08)"
    >
      <HStack spacing={6} maxW="1024px" w="100%" justify="space-between">
        <Text fontSize="sm">
          WE USE COOKIES TO ENSURE YOU GET THE BEST EXPERIENCE. BY USING THIS
          SITE, YOU AGREE TO OUR PRIVACY POLICY.
        </Text>
        <HStack spacing={2}>
          <Button colorScheme="teal" size="sm" onClick={handleAccept}>
            ACCEPT
          </Button>
          <Button colorScheme="gray" size="sm" onClick={handleDecline}>
            DECLINE
          </Button>
        </HStack>
      </HStack>
    </Box>
  );
};

export default GDPRBanner;
