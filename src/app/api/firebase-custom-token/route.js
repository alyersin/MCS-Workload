import { getToken } from "next-auth/jwt";
import { adminAuth } from "@/utils/firebaseAdmin";

export async function GET(req) {
  // GET NEXTAUTH SESSION TOKEN
  const token = await getToken({ req });
  if (!token)
    return new Response(JSON.stringify({ error: "Not authenticated" }), {
      status: 401,
    });
  // GENERATE FIREBASE CUSTOM TOKEN
  const firebaseToken = await adminAuth.createCustomToken(token.uid);
  return new Response(JSON.stringify({ token: firebaseToken }), {
    status: 200,
  });
}
