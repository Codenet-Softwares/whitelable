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
  