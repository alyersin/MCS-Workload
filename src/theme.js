// THEME CONFIG
"use client";
import { extendTheme } from "@chakra-ui/react";

const theme = extendTheme({
  breakpoints: {
    sm: "30em", // 480px
    md: "62em", // 768px
    lg: "62em", // 992px
    xl: "80em", // 1280px
    "2xl": "96em", // 1536px
  },
  config: {
    initialColorMode: "light",
    useSystemColorMode: true,
  },
});

export default theme;
