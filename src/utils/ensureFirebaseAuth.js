import { signInWithCustomToken } from "firebase/auth";
import { auth } from "./firebaseClient";

// ENSURE FIREBASE AUTH SESSION
export async function ensureFirebaseAuth() {
  if (!auth.currentUser) {
    const res = await fetch("/api/firebase-custom-token");
    const { token } = await res.json();
    await signInWithCustomToken(auth, token);
  }
}

// ALIAS EXPORT FOR CONSISTENCY
export const signInFirebaseWithCustomToken = ensureFirebaseAuth;
