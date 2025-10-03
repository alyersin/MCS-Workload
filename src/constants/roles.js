// USER ROLE CONSTANTS
export const USER_ROLES = {
  CUSTOMER: "customer",
  SURVEYOR: "surveyor",
  MASTER_ADMIN: "master_admin",
};

// ROLE DISPLAY NAMES
export const ROLE_NAMES = {
  [USER_ROLES.CUSTOMER]: "Customer",
  [USER_ROLES.SURVEYOR]: "Surveyor",
  [USER_ROLES.MASTER_ADMIN]: "Master Admin",
};

// ROLE DESCRIPTIONS
export const ROLE_DESCRIPTIONS = {
  [USER_ROLES.CUSTOMER]: "Request surveys and track orders",
  [USER_ROLES.SURVEYOR]: "Create and submit survey reports",
  [USER_ROLES.MASTER_ADMIN]: "Full system access and management",
};

// MASTER ADMIN UID (YOUR ACCOUNT)
export const MASTER_ADMIN_UID = "quoewgWQEOYmsYbv7JNsNPhR1rh1";

// ROLE PERMISSIONS
export const ROLE_PERMISSIONS = {
  [USER_ROLES.CUSTOMER]: {
    canRequestSurvey: true,
    canCreateSurvey: false,
    canViewOwnOrders: true,
    canViewAllOrders: false,
    canCompleteOrders: false,
  },
  [USER_ROLES.SURVEYOR]: {
    canRequestSurvey: false,
    canCreateSurvey: true,
    canViewOwnOrders: true,
    canViewAllOrders: false,
    canCompleteOrders: false,
  },
  [USER_ROLES.MASTER_ADMIN]: {
    canRequestSurvey: true,
    canCreateSurvey: true,
    canViewOwnOrders: true,
    canViewAllOrders: true,
    canCompleteOrders: true,
  },
};

// CHECK IF USER HAS PERMISSION
export const hasPermission = (role, permission) => {
  return ROLE_PERMISSIONS[role]?.[permission] || false;
};

// CHECK IF USER IS MASTER ADMIN
export const isMasterAdmin = (uid) => {
  return uid === MASTER_ADMIN_UID;
};
