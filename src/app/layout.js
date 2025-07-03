"use client";

import "./globals.css";
import { Box, ChakraProvider } from "@chakra-ui/react";
import theme from "../theme";
import Header from "@/components/Layout/Header.jsx";
import Footer from "@/components/Layout/Footer.jsx";
import { usePathname } from "next/navigation";
import Script from "next/script";

export default function RootLayout({ children }) {
  const pathname = usePathname();
  const isLoginPage = pathname === "/login";

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

      <body
        suppressHydrationWarning
        style={{
          display: "flex",
          flexDirection: "column",
          minHeight: "100vh",
          margin: 0,
        }}
      >
        <ChakraProvider theme={theme}>
          {!isLoginPage && <Header />}

          <main style={{ flex: 1 }}>{children}</main>

          {!isLoginPage && (
            <>
              <Footer />
            </>
          )}
        </ChakraProvider>
      </body>
    </html>
  );
}
