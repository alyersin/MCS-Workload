import Image from "next/image";
import { Box } from "@chakra-ui/react";

export default function Home() {
  return (
    <Box
      display="flex"
      justifyContent="center"
      alignItems="center"
      // minH="100vh"
      // bg="gray.50"
    >
      <Image src="/wop.webp" width={900} height={900} alt="WOP logo" priority />
    </Box>
  );
}
