// Turn Firebase Auth error codes into plain, friendly messages.
export function authErrorMessage(error) {
  const code = error?.code || "";
  switch (code) {
    case "auth/email-already-in-use":
      return "That email already has an account. Try logging in instead.";
    case "auth/invalid-email":
      return "That email address doesn't look right. Please check it.";
    case "auth/weak-password":
      return "Please choose a longer password (at least 6 characters).";
    case "auth/missing-password":
      return "Please enter your password.";
    case "auth/invalid-credential":
    case "auth/wrong-password":
    case "auth/user-not-found":
      return "That email or password isn't right. Please try again.";
    case "auth/too-many-requests":
      return "Too many attempts. Please wait a moment and try again.";
    case "auth/network-request-failed":
      return "No internet connection. Please check and try again.";
    default:
      return "Something went wrong. Please try again.";
  }
}

export function accountDeletionErrorMessage(error) {
  const code = error?.code || "";
  switch (code) {
    case "partner/release-preparation-failed":
      return "We could not safely prepare account deletion. Your account and progress are still here. Please try again.";
    case "RECENT_AUTH_REQUIRED":
      return "For your security, please log out and log back in, then try deleting your account again.";
    case "auth/invalid-credential":
    case "auth/wrong-password":
      return "That password isn't right. Please try again.";
    case "auth/too-many-requests":
      return "Too many attempts. Please wait a moment and try again.";
    case "auth/network-request-failed":
      return "No internet connection. Please check and try again.";
    default:
      return "We could not delete your account right now. Please try again.";
  }
}
