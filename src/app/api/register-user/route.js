import { NextResponse } from "next/server";
import { db } from "@/utils/firebaseAdmin";

export async function POST(request) {
  try {
    const { uid, email, displayName } = await request.json();

    if (!uid || !email || !displayName) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // CREATE USER PROFILE IN FIRESTORE WITH DEFAULT ROLE (TO BE ASSIGNED MANUALLY)
    await db.collection("users").doc(uid).set({
      email: email,
      displayName: displayName,
      role: "pending", // DEFAULT ROLE - TO BE ASSIGNED MANUALLY FROM FIREBASE CONSOLE
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Registration error:", error);
    return NextResponse.json(
      { error: "Failed to create user profile" },
      { status: 500 }
    );
  }
}
