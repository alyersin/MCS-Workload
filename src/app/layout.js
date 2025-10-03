"use client";

import "./globals.css";
import { Box, ChakraProvider } from "@chakra-ui/react";
import theme from "../theme";
import Header from "@/components/Layout/Header.jsx";
import Footer from "@/components/Layout/Footer.jsx";
import { usePathname } from "next/navigation";
import Script from "next/script";
import { useEffect, useState } from "react";
import StyledComponentsRegistry from "@/lib/registry";
import AuthProvider, {
  useAuthLoading,
} from "@/components/Providers/SessionProvider";
import {
  Spinner,
  Center,
  useColorModeValue,
  VStack,
  Text,
  Button,
} from "@chakra-ui/react";

function AppContent({ children, isLoginPage }) {
  const { isLoading, hasError } = useAuthLoading();
  const bg = useColorModeValue("gray.50", "gray.900");

  if (hasError) {
    return (
      <Center minH="100vh" w="100vw" bg={bg}>
        <VStack spacing={4}>
          <Text fontSize="lg" color="red.500" textAlign="center">
            Authentication service is temporarily unavailable
          </Text>
          <Button
            colorScheme="teal"
            onClick={() => window.location.reload()}
            size="md"
          >
            Retry
          </Button>
        </VStack>
      </Center>
    );
  }

  if (isLoading) {
    return (
      <Center minH="100vh" w="100vw" bg={bg}>
        <VStack spacing={4}>
          <Spinner
            size="xl"
            thickness="4px"
            speed="0.65s"
            color="teal.500"
            emptyColor="gray.200"
          />
          <Text fontSize="sm" color="gray.600">
            Loading authentication...
          </Text>
        </VStack>
      </Center>
    );
  }
  return (
    <Box minH="100vh" display="flex" flexDirection="column" bg={bg}>
      {!isLoginPage && (
        <Box position="relative">
          <Header />
        </Box>
      )}
      <Box as="main" flex="1" display="flex" flexDirection="column">
        {children}
      </Box>
      {!isLoginPage && <Footer />}
    </Box>
  );
}

export default function RootLayout({ children }) {
  const pathname = usePathname();
  const isLoginPage = pathname === "/login";

  const [formattedDate, setFormattedDate] = useState("");

  useEffect(() => {
    const now = new Date();
    const day = now.getDate();
    const month = now.getMonth() + 1;
    const year = String(now.getFullYear()).slice(-2);
    setFormattedDate(`${day}.${month}.${year}`);
    document.title = `MCS Portal – dev.build ${day}.${month}.${year}`;
  }, []);

  return (
    <html lang="en" style={{ height: "100%" }}>
      <head>
        <Script
          strategy="afterInteractive"
          src="https://www.googletagmanager.com/gtag/js?id=G-QBBPBNN7H5"
        />
        <Script
          id="google-analytics"
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{
            __html: `
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              gtag('js', new Date());
              gtag('config', 'G-QBBPBNN7H5');
            `,
          }}
        />
      </head>

      <body suppressHydrationWarning style={{ margin: 0 }}>
        <StyledComponentsRegistry>
          <AuthProvider>
            <ChakraProvider theme={theme}>
              <AppContent isLoginPage={isLoginPage}>{children}</AppContent>
            </ChakraProvider>
          </AuthProvider>
        </StyledComponentsRegistry>
      </body>
    </html>
  );
}
