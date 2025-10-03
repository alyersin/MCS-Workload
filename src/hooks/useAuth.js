"use client";

import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { USER_ROLES, hasPermission, isMasterAdmin } from "@/constants/roles";

// AUTH HOOK WITH ROLE SUPPORT
export function useAuth() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [userRole, setUserRole] = useState(null);
  const [roleLoading, setRoleLoading] = useState(true);

  // FETCH USER ROLE FROM SERVER-SIDE API (bypasses client-side Firestore rules)
  useEffect(() => {
    const fetchUserRole = async () => {
      console.log("useAuth - Current session:", session);
      console.log("useAuth - Status:", status);
      console.log("useAuth - User UID:", session?.user?.uid);

      if (session?.user?.uid) {
        try {
          // CHECK IF MASTER ADMIN BY UID
          if (isMasterAdmin(session.user.uid)) {
            setUserRole(USER_ROLES.MASTER_ADMIN);
            setRoleLoading(false);
            return;
          }

          // FETCH ROLE FROM SERVER-SIDE API WITH TIMEOUT
          const timeoutPromise = new Promise((_, reject) =>
            setTimeout(() => reject(new Error("API request timeout")), 10000)
          );

          const apiPromise = fetch("/api/get-user-role", {
            method: "GET",
            headers: { "Content-Type": "application/json" },
          }).then((res) => {
            console.log("API Response Status:", res.status);
            if (!res.ok) {
              console.error("API Response Error:", res.status, res.statusText);
              throw new Error(`API request failed: ${res.status}`);
            }
            return res.json();
          });

          const result = await Promise.race([apiPromise, timeoutPromise]);

          if (result.role === "pending") {
            setUserRole(null); // No access for pending users
          } else {
            setUserRole(result.role || USER_ROLES.CUSTOMER);
          }

          console.log("User role fetched successfully:", result.role);
        } catch (error) {
          console.error("Error fetching user role:", error);

          // Handle different types of errors
          if (error.message === "API request timeout") {
            console.warn("API timeout - defaulting to customer role");
            setUserRole(USER_ROLES.CUSTOMER);
          } else if (error.message.includes("Not authenticated")) {
            console.error("User not authenticated");
            setUserRole(null);
          } else {
            console.error("Unexpected error fetching user role:", error);
            setUserRole(USER_ROLES.CUSTOMER); // DEFAULT TO CUSTOMER ON OTHER ERRORS
          }
        }
      }
      setRoleLoading(false);
    };

    if (status === "authenticated") {
      fetchUserRole();
    } else {
      setRoleLoading(false);
    }
  }, [session, status]);

  const isAuthenticated = status === "authenticated";
  const isLoading = status === "loading" || roleLoading;
  const isCustomer = userRole === USER_ROLES.CUSTOMER;
  const isSurveyor = userRole === USER_ROLES.SURVEYOR;
  const isMasterAdminUser = userRole === USER_ROLES.MASTER_ADMIN;

  const logout = async () => {
    await signOut({ redirect: false });
    setUserRole(null);
    router.push("/");
  };

  const requireAuth = (callback) => {
    if (!isAuthenticated && !isLoading) {
      router.push("/login");
      return false;
    }
    return callback ? callback() : true;
  };

  const requireRole = (requiredRole, callback) => {
    if (!isAuthenticated && !isLoading) {
      router.push("/login");
      return false;
    }

    if (userRole !== requiredRole && userRole !== USER_ROLES.MASTER_ADMIN) {
      router.push("/");
      return false;
    }

    return callback ? callback() : true;
  };

  const checkPermission = (permission) => {
    return hasPermission(userRole, permission);
  };

  return {
    session,
    status,
    isAuthenticated,
    isLoading,
    userRole,
    isCustomer,
    isSurveyor,
    isMasterAdminUser,
    logout,
    requireAuth,
    requireRole,
    checkPermission,
  };
}
