import { permissionObj } from "./constant/permission"

export const customErrorHandler = (error) => {
  let errorMessage = ''
  if (error?.response?.data?.message) {
    errorMessage = error?.response?.data?.message
  } else if (error?.response?.data?.errMessage) {
    errorMessage = error?.response?.data?.errMessage
  } else {
    errorMessage = "something went wrong"
  }
  return errorMessage
}

export function formatDateForUi(dateString) {
  const options = {
    year: "numeric",
    month: "numeric",
    day: "numeric",
    hour: "numeric",
    minute: "numeric",
    second: "numeric",
  };
  return new Date(dateString).toLocaleDateString("en-US", options);
}



// Helper function to style tickets based on sem value
export const getTicketStyle = (sem) => {
  switch (sem) {
    case 5:
      return {
        backgroundColor: "#f0f8ff", // Light blue
        borderColor: "#b0c4de", // Light steel blue
        icon: "🎫", // Add unique icon
      };
    case 50:
      return {
        backgroundColor: "#e6f7ff", // Light cyan
        borderColor: "#7ec8e3", // Light blue
        icon: "🏆", // Unique icon for this sem
      };
    case 25:
      return {
        backgroundColor: "#fff3e6", // Light orange
        borderColor: "#ffcc99", // Peach
        icon: "✨", // Unique icon
      };
    case 10:
      return {
        backgroundColor: "#f9f9f9", // Light gray
        borderColor: "#d3d3d3", // Light gray border
        icon: "🔖", // Unique icon
      };
    case 100:
      return {
        backgroundColor: "#e1ffe1", // Light green
        borderColor: "#a8d5a1", // Soft green
        icon: "⚡", // Unique icon for 100
      };
    case 200:
      return {
        backgroundColor: "#ffdfdf", // Light red
        borderColor: "#ff9999", // Soft red
        icon: "🔥", // Unique icon for 200
      };
    default:
      return {
        backgroundColor: "#f8f9fa", // Default background
        borderColor: "#dee2e6", // Default border
        icon: "❓", // Default icon
      };
  }
};
export const validatePasswords = (passwords) => {
  let errors = {};

  if (!passwords.adminPassword.trim()) {
    errors.adminPassword = "Admin password is required.";
  }

  if (!passwords.newPassword.trim()) {
    errors.newPassword = "New password is required.";
  } else if (passwords.newPassword.length < 8) {
    errors.newPassword = "Password must be at least 8 characters.";
  }

  if (!passwords.confirmPassword.trim()) {
    errors.confirmPassword = "Confirm password is required.";
  } else if (passwords.newPassword !== passwords.confirmPassword) {
    errors.confirmPassword = "Passwords do not match.";
  }

  return errors;
};


// for bet history for users

// betHistoryHelpers.js
export const initialBetHistoryState = {
  gameList: [],
  SelectedGameId: null,
  dataHistory: [],
  totalPages: 0,
  totalData: 0,
  currentPage: 1,
  itemPerPage: 10,
  endDate: "",
  startDate: "",
  dataSource: "", // Start with empty to force selection
  dataType: "", // Start with empty to force selection
  dropdownOpen: null,
  backupStartDate: null,
  backupEndDate: null,
  initialized: false, // Track if initial setup is done
};

// betHistoryHelpers.js
export const isFormValidForApiCall = (state) => {
  // Basic validation - must have these three selections
  const hasRequiredSelections =
    state.SelectedGameId &&
    state.dataSource &&
    state.dataType;

  // For LIVE data - no date validation needed
  if (state.dataSource === "live") return hasRequiredSelections;

  // For non-LIVE data - must have both dates
  return hasRequiredSelections && state.startDate && state.endDate;
};

export const hasPermission = (permissionKey, store) => {
  if (store?.admin?.status === "suspended") return "disabled";

  const hasPermission =
    Array.isArray(store?.admin?.permission) &&
    store.admin.permission.includes(permissionKey);

  const isSuperAdmin = permissionObj.allAdmin.includes(store?.admin?.role);

  return hasPermission || isSuperAdmin ? "" : "disabled";
};

export function capitalizeEachWord(str) {
  return str
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');
}