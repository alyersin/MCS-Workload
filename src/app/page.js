"use client";
import {
  Box,
  Heading,
  Text,
  Button,
  VStack,
  Container,
} from "@chakra-ui/react";
import { useRouter } from "next/navigation";
import NoticeModal from "@/components/Modals/NoticeModal";
import StyledHamburger from "@/components/UI/StyledHamburger";

export default function Home() {
  const router = useRouter();

  return (
    <Box
      flex="1"
      display="flex"
      alignItems="center"
      justifyContent="center"
      px={4}
    >
      <NoticeModal />
      <Container maxW="lg" textAlign="center">
        <VStack spacing={6}>
          {/* <VStack> */}
          <Heading as="h1" size="xl" color="teal.600">
            Welcome to MCS Workload Portal
          </Heading>
          <Text fontSize="lg" color="gray.700">
            A streamlined platform for creating, submitting, and managing
            operational survey reports efficiently and securely.
          </Text>
          {/* </VStack> */}
          <StyledHamburger />
          {/* <Button
            colorScheme="teal"
            size="lg"
            onClick={() => router.push("/RaportAmaraj")}
          >
            Start a New Report
          </Button> */}
        </VStack>
      </Container>
    </Box>
  );
}
