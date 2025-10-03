import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { db } from "@/utils/firebaseAdmin";
import { USER_ROLES, isMasterAdmin } from "@/constants/roles";

// Import the NextAuth options to properly configure getServerSession
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export async function GET() {
  try {
    // Get the session from NextAuth with proper configuration
    const session = await getServerSession(authOptions);

    console.log("API Route - Session:", session);
    console.log("API Route - User UID:", session?.user?.uid);

    if (!session?.user?.uid) {
      console.log("API Route - No session or UID found");
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    // Check if master admin
    if (isMasterAdmin(session.user.uid)) {
      return NextResponse.json({
        role: USER_ROLES.MASTER_ADMIN,
        user: session.user,
      });
    }

    // Fetch user role from Firestore using admin SDK (bypasses client-side rules)
    const userDoc = await db.collection("users").doc(session.user.uid).get();

    if (!userDoc.exists) {
      return NextResponse.json({
        role: USER_ROLES.CUSTOMER, // Default role
        user: session.user,
      });
    }

    const userData = userDoc.data();
    const role =
      userData.role === "pending" ? null : userData.role || USER_ROLES.CUSTOMER;

    return NextResponse.json({
      role,
      user: session.user,
      userData,
    });
  } catch (error) {
    console.error("Error fetching user role:", error);
    return NextResponse.json(
      { error: "Failed to fetch user role" },
      { status: 500 }
    );
  }
}
