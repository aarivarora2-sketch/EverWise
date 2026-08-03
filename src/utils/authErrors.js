// Turn Firebase Auth error codes into plain, friendly messages.
// Everwise signs people in with a username, so these never mention email —
// the address Firebase sees is synthesised and users never type it.
export function authErrorMessage(error) {
  const code = error?.code || "";
  switch (code) {
    case "auth/email-already-in-use":
      return "That username is already taken. Try another one, or log in instead.";
    case "auth/invalid-email":
      return "That username can only use letters, numbers, dots, underscores and hyphens.";
    case "auth/weak-password":
      return "Please choose a longer password (at least 6 characters).";
    case "auth/missing-password":
      return "Please enter your password.";
    case "auth/invalid-credential":
    case "auth/wrong-password":
    case "auth/user-not-found":
      return "That username or password isn't right. Please try again.";
    case "auth/too-many-requests":
      return "Too many attempts. Please wait a moment and try again.";
    case "auth/network-request-failed":
      return "No internet connection. Please check and try again.";
    default:
      return "Something went wrong. Please try again.";
  }
}
