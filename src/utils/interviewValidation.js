import { isValidEmail } from "./validation.js";

export function validateInterviewStep(step, answers) {
  if (step === 1) {
    const ageNumber = Number(answers.age);
    if (!answers.name?.trim()) {
      return { targetId: "profile-name", message: "Please enter your name." };
    }
    if (
      !answers.age ||
      !Number.isFinite(ageNumber) ||
      ageNumber < 18 ||
      ageNumber > 120
    ) {
      return {
        targetId: "profile-age",
        message: "Please enter an age between 18 and 120.",
      };
    }
  }

  if (step === 2) {
    if (!answers.internetUse) {
      return {
        targetId: "internet-use",
        message: "Please choose how often you use the internet.",
      };
    }
    if (!answers.primaryDevice) {
      return {
        targetId: "primary-device",
        message: "Please choose the device you use most.",
      };
    }
  }

  if (step === 3 && !answers.confidence) {
    return {
      targetId: "online-confidence",
      message: "Please choose how confident you feel online.",
    };
  }
  if (step === 4 && answers.concerns?.length === 0) {
    return {
      targetId: "safety-concerns",
      message: "Please choose at least one concern, or skip this question.",
    };
  }
  if (step === 5 && !answers.scamScenario) {
    return {
      targetId: "scam-scenario",
      message: "Please choose what you would do.",
    };
  }
  if (step === 7 && !answers.aiExperience) {
    return {
      targetId: "ai-experience",
      message: "Please choose one answer.",
    };
  }
  if (step === 11 && !answers.trustedContact) {
    return {
      targetId: "trusted-contact",
      message: "Please choose whether you may want trusted-person help.",
    };
  }
  if (step === 12) {
    if (!answers.email?.trim()) {
      return { targetId: "profile-email", message: "Please enter your email." };
    }
    if (!isValidEmail(answers.email)) {
      return {
        targetId: "profile-email",
        message: "Please enter a complete email like name@example.com.",
      };
    }
    if ((answers.password || "").length < 6) {
      return {
        targetId: "profile-password",
        message: "Please choose a password with at least 6 characters.",
      };
    }
  }

  return null;
}
