const NEXT_LABELS = {
  1: "Phase 2 — Safe Internet Habits",
  2: "Phase 3 — Communication",
  3: "Phase 3 Final Exam",
  4: "Phase 4 Final Exam",
  5: "Phase 5 Final Exam",
  6: "Phase 6 Final Exam",
  7: "Phase 7 Final Exam",
  8: "Phase 9 — The Warning Signs",
  9: "Phase 10 — The Masks Scammers Wear",
  10: "Phase 11 — When AI Enters the Conversation",
  11: "Phase 12 — Protecting Your Personal Information",
  12: "Phase 13 — Smart Communication",
  13: "Phase 14 — Safe Online Shopping & Money",
  14: "Phase 15 — AI in Everyday Life",
  15: "Phase 16 — Helping Others Stay Safe",
  16: "Phase 17 — Living Confidently Online",
  17: "Course complete",
};

function option(text, correct) {
  return { text, correct };
}

function nextKindForPhase(phase) {
  if (phase === 17) return "course";
  if (phase >= 3 && phase <= 7) return "exam";
  return "phase";
}

function createPhaseChallenge({
  phase,
  quickPrompt,
  quickOptions,
  cards,
  fillText,
  fillAnswer,
  fillWords,
  scenarioText,
  scenarioOptions,
  scenarioExplanation,
  checkText,
  checkAnswer,
  checkExplanation,
}) {
  return {
    id: `phase${phase}-challenge`,
    track: phase <= 7 ? "literacy" : "scam",
    phase,
    order: phase,
    title: `Phase ${phase} Final Challenge`,
    nextKind: nextKindForPhase(phase),
    nextLabel: NEXT_LABELS[phase],
    blocks: [
      {
        type: "multiselect",
        title: "Quick review",
        prompt: quickPrompt,
        options: quickOptions,
        feedback:
          "Good review. These choices help you stay informed and in control.",
        incorrectFeedback:
          "Take another look at the highlighted choices. Safe actions give you time to verify.",
      },
      {
        type: "flashcards",
        title: "Key ideas",
        cards,
      },
      {
        type: "fillblank",
        title: "Recall practice",
        wordBank: fillWords,
        questions: [{ text: fillText, answer: fillAnswer }],
      },
      {
        type: "scenario",
        title: "Real-life decision",
        text: scenarioText,
        options: scenarioOptions,
        correctIndex: 0,
        explanation: scenarioExplanation,
      },
      {
        type: "truefalse",
        title: "Final confidence check",
        questions: [
          {
            text: checkText,
            answer: checkAnswer,
            explanation: checkExplanation,
          },
        ],
      },
    ],
  };
}

export const phaseChallenges = [
  createPhaseChallenge({
    phase: 1,
    quickPrompt: "Which choices help you use technology safely?",
    quickOptions: [
      option("Keep personal information private", true),
      option("Check important AI answers", true),
      option("Use trusted apps and websites", true),
      option("Share passwords when a website asks", false),
    ],
    cards: [
      {
        front: "Internet",
        back: "A worldwide network that connects devices and shares information.",
      },
      {
        front: "Artificial intelligence",
        back: "Technology that finds patterns and produces useful predictions or responses.",
      },
      {
        front: "Personal information",
        back: "Private details such as passwords, account numbers, and identification numbers.",
      },
    ],
    fillText:
      "A ______ connects a device to the internet without a cable.",
    fillAnswer: "Wi-Fi",
    fillWords: ["Wi-Fi", "password", "camera", "search"],
    scenarioText:
      "A website asks for your Social Security number before it will show search results. What should you do?",
    scenarioOptions: [
      "Leave the website without sharing the number",
      "Enter the number so the search will work",
      "Send the number by email instead",
    ],
    scenarioExplanation:
      "A normal search does not need a Social Security number. Leaving protects your personal information.",
    checkText: "ChatGPT can sound confident and still be wrong.",
    checkAnswer: true,
    checkExplanation:
      "AI can make mistakes. Check important answers with a reliable source.",
  }),
  createPhaseChallenge({
    phase: 2,
    quickPrompt: "Which habits protect your accounts?",
    quickOptions: [
      option("Use a different password for every account", true),
      option("Turn on two-factor authentication", true),
      option("Install trusted security updates", true),
      option("Reuse one short password everywhere", false),
    ],
    cards: [
      {
        front: "Strong password",
        back: "A long, unique password that is difficult to guess.",
      },
      {
        front: "Password manager",
        back: "A trusted tool that stores unique passwords securely.",
      },
      {
        front: "Two-factor authentication",
        back: "A second check that helps protect an account after the password.",
      },
    ],
    fillText:
      "A ______ password is different from every other password you use.",
    fillAnswer: "unique",
    fillWords: ["unique", "public", "shared", "short"],
    scenarioText:
      "Public Wi-Fi asks you to install an unknown update before connecting. What should you do?",
    scenarioOptions: [
      "Decline and use a trusted connection instead",
      "Install it because the message appeared first",
      "Give the update your account password",
    ],
    scenarioExplanation:
      "Unknown downloads on public Wi-Fi can be risky. Use your mobile connection or another trusted network.",
    checkText: "Phone and app updates can include security fixes.",
    checkAnswer: true,
    checkExplanation:
      "Trusted updates often repair security problems as well as add features.",
  }),
  createPhaseChallenge({
    phase: 3,
    quickPrompt: "Which communication choices are safer?",
    quickOptions: [
      option("Block repeated unwanted calls", true),
      option("Confirm unexpected requests another way", true),
      option("Limit who can see your location", true),
      option("Accept every unknown video call", false),
    ],
    cards: [
      {
        front: "Spam",
        back: "Unwanted messages or calls, often sent to many people.",
      },
      {
        front: "Block",
        back: "Stop a person or account from contacting you again.",
      },
      {
        front: "Location sharing",
        back: "Allow selected people or apps to see where you are.",
      },
    ],
    fillText:
      "Use ______ to stop an unwanted caller from contacting you again.",
    fillAnswer: "block",
    fillWords: ["block", "reply", "forward", "share"],
    scenarioText:
      "An unknown caller asks you to move a video call to a secret app. What should you do?",
    scenarioOptions: [
      "End the call and verify the person independently",
      "Install the app immediately",
      "Share your location before deciding",
    ],
    scenarioExplanation:
      "An unexpected request for secrecy is a warning sign. Verify through a number or account you already trust.",
    checkText:
      "It is safe to share your live location with every new online contact.",
    checkAnswer: false,
    checkExplanation:
      "Share live location only with people you trust and only when it is useful.",
  }),
  createPhaseChallenge({
    phase: 4,
    quickPrompt: "Which money habits reduce risk?",
    quickOptions: [
      option("Use a secure checkout page", true),
      option("Review the seller before paying", true),
      option("Contact a company through its official site", true),
      option("Pay an urgent fee with gift cards", false),
    ],
    cards: [
      {
        front: "Secure checkout",
        back: "A protected payment page on a trusted seller's website or app.",
      },
      {
        front: "Payment app",
        back: "An app used to send or receive money; payments can be difficult to reverse.",
      },
      {
        front: "Refund scam",
        back: "A false refund offer used to collect money or account access.",
      },
    ],
    fillText:
      "Before paying, check the store address and the ______ symbol.",
    fillAnswer: "lock",
    fillWords: ["lock", "gift", "camera", "coupon"],
    scenarioText:
      "A seller demands gift cards for an urgent refund fee. What should you do?",
    scenarioOptions: [
      "Stop and contact the company through its official site",
      "Buy the cards before the refund expires",
      "Send only half of the requested card numbers",
    ],
    scenarioExplanation:
      "Real companies do not require gift cards to issue a refund. Use a verified contact method.",
    checkText:
      "A bank will never need your one-time verification code by text or phone.",
    checkAnswer: true,
    checkExplanation:
      "One-time codes are for you to enter privately. Do not read them to a caller or send them in a message.",
  }),
  createPhaseChallenge({
    phase: 5,
    quickPrompt:
      "Which signs help identify an official health or government service?",
    quickOptions: [
      option("A government address ending in .gov", true),
      option("A number printed on an official card", true),
      option("A trusted health portal you already use", true),
      option("An urgent demand for gift-card payment", false),
    ],
    cards: [
      {
        front: "Telehealth",
        back: "A health visit completed remotely by phone or video.",
      },
      {
        front: ".gov",
        back: "The ending used by official United States government websites.",
      },
      {
        front: "Medicare",
        back: "A federal health insurance program with official contact channels.",
      },
    ],
    fillText:
      "Most official United States government websites end in ______.",
    fillAnswer: ".gov",
    fillWords: [".gov", ".shop", ".deal", ".gift"],
    scenarioText:
      "A caller says your Medicare benefits end today unless you pay. What should you do?",
    scenarioOptions: [
      "Hang up and call the official number on your Medicare card",
      "Pay now so your benefits stay active",
      "Give the caller your Medicare number first",
    ],
    scenarioExplanation:
      "Urgent payment pressure is suspicious. Calling the official number lets you verify safely.",
    checkText:
      "An urgent payment demand is a reason to slow down and verify.",
    checkAnswer: true,
    checkExplanation:
      "Scammers use urgency to prevent careful thinking. Pause and use an official contact.",
  }),
  createPhaseChallenge({
    phase: 6,
    quickPrompt: "Which social-media actions help you stay safe?",
    quickOptions: [
      option("Check a surprising claim before sharing it", true),
      option("Review unfamiliar friend requests", true),
      option("Report fake or harmful accounts", true),
      option("Pay a fee to claim every giveaway", false),
    ],
    cards: [
      {
        front: "Friend request",
        back: "An invitation to connect; check the person and profile before accepting.",
      },
      {
        front: "Misinformation",
        back: "False or misleading information shared as if it were true.",
      },
      {
        front: "Deepfake",
        back: "AI-altered audio, image, or video that can imitate a real person.",
      },
    ],
    fillText:
      "Before sharing surprising news, check the ______.",
    fillAnswer: "source",
    fillWords: ["source", "likes", "color", "emoji"],
    scenarioText:
      "A celebrity giveaway asks for a fee and your password. What should you do?",
    scenarioOptions: [
      "Do not pay; report and block the account",
      "Pay the fee before the giveaway closes",
      "Send the password but not the fee",
    ],
    scenarioExplanation:
      "Legitimate giveaways do not need your password. Reporting helps protect you and others.",
    checkText: "A realistic video can still be altered or AI-generated.",
    checkAnswer: true,
    checkExplanation:
      "Visual quality is not proof. Check the source and look for independent confirmation.",
  }),
  createPhaseChallenge({
    phase: 7,
    quickPrompt: "What should you do after a scam or account emergency?",
    quickOptions: [
      option("Contact the bank or service quickly", true),
      option("Save messages and receipts", true),
      option("Ask a trusted person for help", true),
      option("Hide the problem and wait", false),
    ],
    cards: [
      {
        front: "Trusted contact",
        back: "A person you can call for calm help and a second opinion.",
      },
      {
        front: "Credit freeze",
        back: "A free restriction that can make new credit harder to open in your name.",
      },
      {
        front: "Account recovery",
        back: "Official steps used to regain control of an account.",
      },
    ],
    fillText:
      "Save ______ such as messages and receipts before reporting a scam.",
    fillAnswer: "evidence",
    fillWords: ["evidence", "passwords", "rumors", "ads"],
    scenarioText:
      "You sent money to someone who now appears to be a scammer. What should you do first?",
    scenarioOptions: [
      "Contact your bank or payment service immediately",
      "Send more money to request a refund",
      "Delete every message before asking for help",
    ],
    scenarioExplanation:
      "Fast contact may improve the chance of stopping a payment. Keep evidence for the bank and reports.",
    checkText: "Asking a trusted person for help is a strong safety step.",
    checkAnswer: true,
    checkExplanation:
      "A calm second opinion can help you act quickly and avoid more harm.",
  }),
  createPhaseChallenge({
    phase: 8,
    quickPrompt: "Which actions help you stay in control?",
    quickOptions: [
      option("Pause before responding", true),
      option("Verify through a separate trusted channel", true),
      option("Choose only after checking", true),
      option("Act immediately because a message says so", false),
    ],
    cards: [
      {
        front: "Pause",
        back: "Stop briefly so emotion and pressure do not control the decision.",
      },
      {
        front: "Verify",
        back: "Check a claim through a source you choose and trust.",
      },
      {
        front: "Decide",
        back: "Choose the next action after you have enough reliable information.",
      },
    ],
    fillText:
      "A short ______ gives you time to think before acting.",
    fillAnswer: "pause",
    fillWords: ["pause", "payment", "secret", "password"],
    scenarioText:
      "A message creates panic and demands that you act now. What should you do?",
    scenarioOptions: [
      "Stop, breathe, and verify the request another way",
      "Follow the instructions before time runs out",
      "Forward the message to everyone without checking",
    ],
    scenarioExplanation:
      "A pause breaks the pressure. Independent verification helps you make your own decision.",
    checkText: "You are allowed to end a suspicious conversation.",
    checkAnswer: true,
    checkExplanation:
      "You never owe an unknown caller or sender continued attention.",
  }),
  createPhaseChallenge({
    phase: 9,
    quickPrompt: "Which are common scam warning signs?",
    quickOptions: [
      option("Pressure to act immediately", true),
      option("A request to keep the situation secret", true),
      option("Payment by gift card or cryptocurrency", true),
      option("Time to verify through an official source", false),
    ],
    cards: [
      {
        front: "Urgency",
        back: "Pressure designed to make you act before checking.",
      },
      {
        front: "Secrecy",
        back: "A demand not to speak with family, a bank, or another trusted person.",
      },
      {
        front: "Unusual payment",
        back: "Gift cards, cryptocurrency, or wire transfers demanded unexpectedly.",
      },
    ],
    fillText:
      "A request to keep a payment ______ is a warning sign.",
    fillAnswer: "secret",
    fillWords: ["secret", "recorded", "small", "printed"],
    scenarioText:
      "A caller demands cryptocurrency within ten minutes. What should you do?",
    scenarioOptions: [
      "Refuse and independently verify the claim",
      "Pay quickly to avoid the threatened penalty",
      "Ask the caller which cryptocurrency is fastest",
    ],
    scenarioExplanation:
      "Urgency plus unusual payment is a strong scam pattern. End the call and verify independently.",
    checkText: "Urgency is proof that a message is genuine.",
    checkAnswer: false,
    checkExplanation:
      "Urgency is not proof. It is often used to stop you from checking.",
  }),
  createPhaseChallenge({
    phase: 10,
    quickPrompt: "Which identities can scammers pretend to be?",
    quickOptions: [
      option("A bank employee", true),
      option("A government worker", true),
      option("A family member", true),
      option("Only a person you have never heard of", false),
    ],
    cards: [
      {
        front: "Bank impersonation",
        back: "A scammer pretends to protect your account while trying to access it.",
      },
      {
        front: "Government impersonation",
        back: "A scammer uses official-sounding threats or promises.",
      },
      {
        front: "Family impersonation",
        back: "A scammer claims a loved one needs urgent, secret help.",
      },
    ],
    fillText:
      "A scammer may use ______ to appear to be someone you trust.",
    fillAnswer: "impersonation",
    fillWords: ["impersonation", "encryption", "shopping", "updating"],
    scenarioText:
      "A relative's new number asks for emergency cash. What should you do?",
    scenarioOptions: [
      "Call the relative's known number or another family member",
      "Send money because the request sounds personal",
      "Reply with your bank details to prove you can help",
    ],
    scenarioExplanation:
      "Use contact information you already trust. A separate call can expose an impersonation scam.",
    checkText: "Caller ID alone proves who is calling.",
    checkAnswer: false,
    checkExplanation:
      "Caller ID can be copied or changed. Verify using a number you already know.",
  }),
  createPhaseChallenge({
    phase: 11,
    quickPrompt: "Which AI-made content can be deceptive?",
    quickOptions: [
      option("A copied voice", true),
      option("An altered image or video", true),
      option("A confident chatbot answer", true),
      option("Only visibly blurry pictures", false),
    ],
    cards: [
      {
        front: "Voice clone",
        back: "AI-generated audio that imitates how a real person sounds.",
      },
      {
        front: "Deepfake",
        back: "AI-made or altered media that can imitate a real event or person.",
      },
      {
        front: "Chatbot",
        back: "Software that responds in conversation and can still make mistakes.",
      },
    ],
    fillText:
      "A copied voice made by AI is called a voice ______.",
    fillAnswer: "clone",
    fillWords: ["clone", "filter", "password", "update"],
    scenarioText:
      "A familiar voice asks for money but refuses to answer a family question. What should you do?",
    scenarioOptions: [
      "End the call and verify through a known number",
      "Send money because the voice sounds accurate",
      "Give the caller more family details",
    ],
    scenarioExplanation:
      "A convincing voice is no longer enough. A separate trusted contact confirms the real person.",
    checkText: "AI answers should be checked when the decision matters.",
    checkAnswer: true,
    checkExplanation:
      "AI can be helpful and still be wrong. Verify health, money, legal, and safety decisions.",
  }),
  createPhaseChallenge({
    phase: 12,
    quickPrompt: "Which actions protect personal information?",
    quickOptions: [
      option("Use a long passphrase", true),
      option("Store unique passwords in a password manager", true),
      option("Keep recovery methods current", true),
      option("Reuse the same password on every account", false),
    ],
    cards: [
      {
        front: "Passphrase",
        back: "A long password made from several memorable words.",
      },
      {
        front: "Password reuse",
        back: "Using one password on several accounts, which spreads the risk.",
      },
      {
        front: "Recovery method",
        back: "A trusted email, number, or code used to regain account access.",
      },
    ],
    fillText:
      "A password ______ stores unique passwords securely.",
    fillAnswer: "manager",
    fillWords: ["manager", "advertisement", "folder", "camera"],
    scenarioText:
      "A login alert links to a page that asks you to reset your password. What should you do?",
    scenarioOptions: [
      "Open the official app or type the known website address",
      "Use the link because the alert looks urgent",
      "Reply to the alert with your current password",
    ],
    scenarioExplanation:
      "Opening the official service yourself avoids a possibly fake link.",
    checkText:
      "Reusing one password makes several accounts easier to steal.",
    checkAnswer: true,
    checkExplanation:
      "If one reused password is exposed, attackers may try it on your other accounts.",
  }),
  createPhaseChallenge({
    phase: 13,
    quickPrompt: "Which communication steps preserve safety?",
    quickOptions: [
      option("Confirm unexpected attachments", true),
      option("Save evidence before reporting", true),
      option("Block repeated unwanted contact", true),
      option("Open every link to see where it goes", false),
    ],
    cards: [
      {
        front: "Attachment",
        back: "A file sent with a message; unexpected files should be verified before opening.",
      },
      {
        front: "Evidence",
        back: "Messages, screenshots, receipts, and details that support a report.",
      },
      {
        front: "Report",
        back: "Tell a platform, company, bank, or authority about suspicious activity.",
      },
    ],
    fillText:
      "Save a suspicious message as ______ before deleting it.",
    fillAnswer: "evidence",
    fillWords: ["evidence", "a password", "a payment", "a secret"],
    scenarioText:
      "An attachment from a known contact is unexpected. What should you do?",
    scenarioOptions: [
      "Confirm with the person through another channel before opening it",
      "Open it because the sender name is familiar",
      "Forward it to other people to test it",
    ],
    scenarioExplanation:
      "Accounts can be compromised. A quick separate confirmation protects you and others.",
    checkText: "Blocking and reporting can both be appropriate.",
    checkAnswer: true,
    checkExplanation:
      "Blocking stops contact; reporting can help the service investigate and protect others.",
  }),
  createPhaseChallenge({
    phase: 14,
    quickPrompt:
      "Which habits make online shopping and payments safer?",
    quickOptions: [
      option("Review the seller and return policy", true),
      option("Use a payment method with dispute protection", true),
      option("Question guaranteed investment returns", true),
      option("Wire money to every unfamiliar shop", false),
    ],
    cards: [
      {
        front: "Seller check",
        back: "Review the address, history, contact details, and independent reputation.",
      },
      {
        front: "Protected payment",
        back: "A payment method that offers a clear dispute process.",
      },
      {
        front: "Investment promise",
        back: "A claim of guaranteed profit or no risk, which is a major warning sign.",
      },
    ],
    fillText:
      "A guaranteed high return is an investment warning ______.",
    fillAnswer: "sign",
    fillWords: ["sign", "reward", "coupon", "receipt"],
    scenarioText:
      "A new online shop accepts only wire transfer. What should you do?",
    scenarioOptions: [
      "Leave and use a reputable seller with protected payment",
      "Send the wire because the price is low",
      "Share your bank login to speed up the transfer",
    ],
    scenarioExplanation:
      "Wire transfers are difficult to reverse. A trustworthy seller offers safer payment choices.",
    checkText:
      "Credit cards usually offer more dispute protection than gift cards.",
    checkAnswer: true,
    checkExplanation:
      "Gift-card payments act like cash. Credit cards generally provide a dispute process.",
  }),
  createPhaseChallenge({
    phase: 15,
    quickPrompt: "Which are useful, responsible ways to use AI?",
    quickOptions: [
      option("Compare several choices", true),
      option("Clarify a difficult explanation", true),
      option("Practice a conversation", true),
      option("Treat every answer as guaranteed truth", false),
    ],
    cards: [
      {
        front: "Compare",
        back: "Ask AI to organize differences, then verify the important details.",
      },
      {
        front: "Clarify",
        back: "Ask for simpler wording, examples, or a step-by-step explanation.",
      },
      {
        front: "Practice",
        back: "Rehearse a question or conversation before speaking with a real person.",
      },
    ],
    fillText:
      "Ask AI to ______ a difficult explanation in simpler words.",
    fillAnswer: "clarify",
    fillWords: ["clarify", "guarantee", "hide", "purchase"],
    scenarioText:
      "AI gives medical advice that conflicts with your doctor. What should you do?",
    scenarioOptions: [
      "Verify with a qualified health professional",
      "Stop prescribed treatment based only on the AI answer",
      "Share the advice as proven fact",
    ],
    scenarioExplanation:
      "AI is not a replacement for qualified medical care. Use it to prepare questions, not make an unverified health decision.",
    checkText:
      "AI can help compare choices, but the user should verify important facts.",
    checkAnswer: true,
    checkExplanation:
      "Verification keeps the convenience of AI without giving it the final word.",
  }),
  createPhaseChallenge({
    phase: 16,
    quickPrompt: "Which actions help another person stay safe?",
    quickOptions: [
      option("Listen without blame", true),
      option("Explain the warning signs calmly", true),
      option("Make a simple safety plan together", true),
      option("Shame the person for being unsure", false),
    ],
    cards: [
      {
        front: "Calm explanation",
        back: "Describe the concern clearly without blaming or embarrassing the person.",
      },
      {
        front: "Safety plan",
        back: "Agree on who to call, how to verify, and what information never to share.",
      },
      {
        front: "More help",
        back: "Involve a bank, platform, trusted family member, or authority when needed.",
      },
    ],
    fillText:
      "Speak ______ so the person can think without feeling judged.",
    fillAnswer: "calmly",
    fillWords: ["calmly", "secretly", "angrily", "quickly"],
    scenarioText:
      "A friend may be in an active financial scam. What should you do?",
    scenarioOptions: [
      "Listen, save evidence, and involve the bank or trusted help",
      "Call the friend foolish and walk away",
      "Send the scammer money to test the request",
    ],
    scenarioExplanation:
      "Respectful support makes action more likely. The bank or another trusted helper can limit further harm.",
    checkText: "Shaming someone makes it easier for them to ask for help.",
    checkAnswer: false,
    checkExplanation:
      "Shame can make people hide problems. Calm, respectful help is more effective.",
  }),
  createPhaseChallenge({
    phase: 17,
    quickPrompt:
      "Which habits support confident online living?",
    quickOptions: [
      option("Use a pause-check-choose routine", true),
      option("Keep accounts and devices updated", true),
      option("Ask for a second opinion when needed", true),
      option("Avoid every useful online service forever", false),
    ],
    cards: [
      {
        front: "Routine",
        back: "A repeatable safety habit that makes careful action easier.",
      },
      {
        front: "Confidence",
        back: "Using technology with practical skills and knowing when to ask for help.",
      },
      {
        front: "Verification",
        back: "Checking important claims through a separate source you trust.",
      },
    ],
    fillText:
      "Confidence means knowing when to pause and ______.",
    fillAnswer: "verify",
    fillWords: ["verify", "rush", "hide", "pay"],
    scenarioText:
      "A new online request feels unusual. What should you do?",
    scenarioOptions: [
      "Use the pause-check-choose routine",
      "Act immediately so the request goes away",
      "Share personal information before asking questions",
    ],
    scenarioExplanation:
      "Pausing, checking independently, and then choosing keeps you in control.",
    checkText: "Safe internet use means never using the internet.",
    checkAnswer: false,
    checkExplanation:
      "Safety is about informed, confident use—not avoiding technology entirely.",
  }),
];

export default phaseChallenges;
