// Everwise - Digital Literacy Track
// Phase 5: Health & Government
// Biome: River | Color: #4E7C8A
//
// All lessons exactly as written by the team.
// Exports: phase5Lessons (array), phase5Exam (object)

export const phase5Lessons = [
  // ============================================================
  // LESSON 5.1
  // ============================================================
  {
    id: "patient-portals",
    track: "literacy",
    phase: 5,
    order: 36,
    lessonNumber: "5.1",
    title: "Patient Portals",
    badge: "Health Portal Pro",
    xp: 20,
    goals: [
      "Explain what a patient portal is.",
      "Log in safely to a patient portal.",
      "View medical information securely.",
      "Send messages to healthcare providers.",
      "Recognize patient portal scams."
    ],
    blocks: [
      {
        type: "learn",
        heading: "What Is a Patient Portal?",
        text: "A patient portal is a secure website or app provided by your doctor's office, clinic, or hospital. It allows you to manage parts of your healthcare online.",
        bullets: [
          "View test results",
          "Schedule appointments",
          "Request prescription refills",
          "Send messages to your doctor",
          "View visit summaries",
          "Pay medical bills"
        ],
        footer: "Patient portals are available 24 hours a day, so you can access your health information whenever you need it."
      },
      {
        type: "learn",
        heading: "Keeping Your Patient Portal Secure",
        text: "Because your portal contains private health information, you should:",
        bullets: [
          "Use a strong password",
          "Turn on two-factor authentication (2FA) if available",
          "Log out when using a shared computer",
          "Only log in through your healthcare provider's official website or app",
          "Never share your username or password"
        ]
      },
      {
        type: "learn",
        heading: "Patient Portal Scams",
        text: "Scammers sometimes send fake emails or texts saying \"Your medical records are locked,\" \"Click here to view your lab results,\" or \"Your account will be deleted today.\"\n\nThese messages may lead to fake websites designed to steal your login information. Instead, go directly to your provider's official website or app."
      },
      {
        type: "multiselect",
        title: "Which Actions Are Safe?",
        prompt: "Tap every safe action.",
        options: [
          { text: "Log in through your healthcare provider's official website or app.", correct: true },
          { text: "Log out when using a public computer.", correct: true },
          { text: "Use a strong password.", correct: true },
          { text: "Enable two-factor authentication if available.", correct: true },
          { text: "Share your portal password with neighbors.", correct: false },
          { text: "Click every medical email link immediately.", correct: false },
          { text: "Save your password on a public computer.", correct: false }
        ],
        feedback: "Excellent! Your patient portal contains sensitive medical information and should be protected like your bank account."
      },
      {
        type: "flashcards",
        title: "Flashcards",
        cards: [
          { front: "Patient Portal", back: "A secure website or app where you can manage your healthcare." },
          { front: "Medical Records", back: "Information about your health, appointments, and treatments." },
          { front: "Test Results", back: "Results from blood work, X-rays, or other medical tests." },
          { front: "Appointment", back: "A scheduled visit with a healthcare provider." },
          { front: "Two-Factor Authentication", back: "An extra layer of security when signing in." }
        ]
      },
      {
        type: "match",
        title: "Match the Feature",
        pairs: [
          { word: "Test Results", match: "View results from medical tests" },
          { word: "Messages", match: "Contact your healthcare provider" },
          { word: "Appointments", match: "Schedule or review visits" },
          { word: "Prescription Refills", match: "Request more medication" },
          { word: "Medical Bills", match: "View or pay healthcare bills" }
        ]
      },
      {
        type: "fillblank",
        title: "Fill in the Blank",
        wordBank: ["Portal", "Official", "Password", "Appointments"],
        questions: [
          { text: "A patient ______ lets you view your healthcare information online.", answer: "Portal" },
          { text: "Always sign in through your provider's ______ website or app.", answer: "Official" },
          { text: "Use a strong ______ to protect your account.", answer: "Password" }
        ]
      },
      {
        type: "scenario",
        title: "Scenario 1",
        text: "Margaret receives an email saying \"Click here immediately to see your lab results.\" She wasn't expecting any test results. What should she do?",
        options: [
          "Click the link.",
          "Reply with her password.",
          "Open her healthcare provider's official website or app directly if she wants to check her account.",
          "Forward the email to friends."
        ],
        correctIndex: 2,
        explanation: "Unexpected medical emails can sometimes be phishing attempts. Never sign in through unexpected links."
      },
      {
        type: "scenario",
        title: "Scenario 2",
        text: "Robert uses a library computer to check his patient portal. When he's finished, what should he do?",
        options: [
          "Leave the website open.",
          "Save his password.",
          "Log out completely and close the browser.",
          "Leave the computer without signing out."
        ],
        correctIndex: 2,
        explanation: "Logging out helps protect your medical information on shared computers."
      },
      {
        type: "learn",
        heading: "Quick Tip",
        text: "Before signing in, ask yourself: Am I using the official website or app? Is my password strong? Am I on my own device or a shared one? If anything seems unusual, stop and verify before signing in."
      },
      {
        type: "sort",
        title: "Safe or Unsafe?",
        prompt: "Drag each choice into the correct box.",
        categories: [
          {
            label: "Safer Choices",
            items: ["Use strong passwords", "Enable 2FA", "Log out of shared computers", "Visit the provider's official website yourself"]
          },
          {
            label: "Less Safe Choices",
            items: ["Share your password", "Click unexpected login links", "Stay signed in on public computers", "Ignore suspicious emails"]
          }
        ]
      }
    ],
    quiz: [
      { question: "What is a patient portal?", options: ["A social media app", "A search engine", "A secure website or app where you manage your healthcare", "A video game"], correctIndex: 2 },
      { question: "Which activities can you do in a patient portal?", options: ["Only pay bills", "View test results, schedule appointments, message your doctor, and request refills"], correctIndex: 1 },
      { question: "True or False: You should always click login links from unexpected medical emails.", options: ["True", "False"], correctIndex: 1 },
      { question: "Always log in through your provider's ______ website or app.", options: ["Official", "Camera", "Speaker"], correctIndex: 0 },
      { question: "Why should you log out of a shared computer?", options: ["To make the computer faster.", "To save electricity.", "To help protect your private medical information.", "To update your account."], correctIndex: 2 }
    ],
    complete: {
      title: "Great Job!",
      subtitle: "You completed Lesson 1: Patient Portals!",
      learned: [
        "Explain what a patient portal is.",
        "Log in safely.",
        "View medical information securely.",
        "Recognize patient portal scams."
      ],
      next: "Telehealth"
    }
  },

  // ============================================================
  // LESSON 5.2
  // ============================================================
  {
    id: "telehealth",
    track: "literacy",
    phase: 5,
    order: 37,
    lessonNumber: "5.2",
    title: "Telehealth",
    badge: "Virtual Visit Expert",
    xp: 20,
    goals: [
      "Explain what telehealth is.",
      "Prepare for a virtual doctor's appointment.",
      "Join a telehealth visit safely.",
      "Protect their privacy during online appointments.",
      "Recognize telehealth scams."
    ],
    blocks: [
      {
        type: "learn",
        heading: "What Is Telehealth?",
        text: "Telehealth allows you to speak with a healthcare provider using a computer, smartphone, or tablet. Instead of traveling to the doctor's office, you can meet through a secure video or phone call.",
        bullets: [
          "Follow-up visits",
          "Medication questions",
          "Minor illnesses",
          "Mental health appointments"
        ]
      },
      {
        type: "learn",
        heading: "Preparing for a Telehealth Visit",
        text: "Before your appointment:",
        bullets: [
          "Charge your device",
          "Test your camera and microphone",
          "Find a quiet, private place",
          "Have your medications nearby",
          "Write down any questions you want to ask",
          "Join a few minutes early"
        ]
      },
      {
        type: "learn",
        heading: "Keeping Your Appointment Private",
        text: "During your visit:",
        bullets: [
          "Use your healthcare provider's official app or link",
          "Avoid public Wi-Fi if discussing sensitive health information",
          "Wear headphones if you're in a shared space",
          "Make sure you know who is on the call"
        ]
      },
      {
        type: "learn",
        heading: "Telehealth Scams",
        text: "Scammers may send fake appointment links or ask you to pay before you even have an appointment, download unknown software, share your Medicare number through email or text, or give your password.\n\nIf something seems suspicious, contact your healthcare provider directly using their official phone number or website."
      },
      {
        type: "multiselect",
        title: "Which Are Good Telehealth Habits?",
        prompt: "Tap every good habit.",
        options: [
          { text: "Test your camera before the appointment.", correct: true },
          { text: "Join from a quiet, private location.", correct: true },
          { text: "Use the official appointment link from your healthcare provider.", correct: true },
          { text: "Write down questions before your visit.", correct: true },
          { text: "Join using a random link from a stranger.", correct: false },
          { text: "Share your portal password during the call.", correct: false },
          { text: "Ignore who's on the video call.", correct: false }
        ],
        feedback: "Excellent! Preparing ahead helps your appointment go smoothly and protects your privacy."
      },
      {
        type: "flashcards",
        title: "Flashcards",
        cards: [
          { front: "Telehealth", back: "Healthcare provided through secure video or phone appointments." },
          { front: "Virtual Appointment", back: "A medical visit that takes place online or by phone." },
          { front: "Microphone", back: "Lets your doctor hear you during the appointment." },
          { front: "Camera", back: "Lets you and your doctor see each other." },
          { front: "Privacy", back: "Keeping your personal health information protected." }
        ]
      },
      {
        type: "match",
        title: "Match the Item",
        pairs: [
          { word: "Camera", match: "Lets your doctor see you" },
          { word: "Microphone", match: "Lets your doctor hear you" },
          { word: "Headphones", match: "Help keep conversations private" },
          { word: "Appointment Link", match: "Opens your telehealth visit" },
          { word: "Quiet Room", match: "Reduces distractions" }
        ]
      },
      {
        type: "fillblank",
        title: "Fill in the Blank",
        wordBank: ["Video", "Private", "Questions", "Official"],
        questions: [
          { text: "Telehealth often uses ______ calls.", answer: "Video" },
          { text: "Choose a ______ place for your appointment.", answer: "Private" },
          { text: "Write down your ______ before meeting your doctor.", answer: "Questions" }
        ]
      },
      {
        type: "scenario",
        title: "Scenario 1",
        text: "Linda receives a text saying \"Click this link to pay $250 before your telehealth visit.\" She wasn't expecting this message. What should she do?",
        options: [
          "Click the link and pay.",
          "Give her credit card information.",
          "Contact her healthcare provider using their official phone number or website to verify the message.",
          "Download the software in the text."
        ],
        correctIndex: 2,
        explanation: "Unexpected payment requests can be scams. Always verify through official contact methods."
      },
      {
        type: "scenario",
        title: "Scenario 2",
        text: "David joins his telehealth appointment from a busy coffee shop using public Wi-Fi. What's a better choice?",
        options: [
          "Continue discussing private medical information loudly.",
          "If possible, move to a private location or wait until he has a secure connection before discussing sensitive information.",
          "Share his medical history with everyone nearby.",
          "Give strangers his appointment link."
        ],
        correctIndex: 1,
        explanation: "A private space helps protect your personal health information."
      },
      {
        type: "learn",
        heading: "Quick Tip",
        text: "Before your appointment, ask yourself: Is your device charged? Do you have the official appointment link? Are you in a quiet place? Do you have your questions ready? If yes, you're ready for your visit!"
      }
    ],
    quiz: [
      { question: "What is telehealth?", options: ["Shopping online", "Banking online", "Meeting with a healthcare provider by secure video or phone", "Sending emails"], correctIndex: 2 },
      { question: "Which should you do before a telehealth appointment?", options: ["Nothing special", "Charge your device, test your camera, prepare your questions, and join a few minutes early"], correctIndex: 1 },
      { question: "True or False: You should give your password to anyone who joins your telehealth call.", options: ["True", "False"], correctIndex: 1 },
      { question: "Choose a ______ place for your appointment.", options: ["Private", "Speaker", "Public"], correctIndex: 0 },
      { question: "You receive an unexpected message asking you to pay before your appointment. What should you do?", options: ["Pay immediately.", "Click every link.", "Contact your healthcare provider using their official contact information to verify the request.", "Share your Medicare number."], correctIndex: 2 }
    ],
    complete: {
      title: "Great Job!",
      subtitle: "You completed Lesson 2: Telehealth!",
      learned: [
        "Explain what telehealth is.",
        "Prepare for a virtual appointment.",
        "Join a telehealth visit safely.",
        "Recognize telehealth scams."
      ],
      next: "Prescription Scams"
    }
  },

  // ============================================================
  // LESSON 5.3
  // ============================================================
  {
    id: "prescription-scams",
    track: "literacy",
    phase: 5,
    order: 38,
    lessonNumber: "5.3",
    title: "Prescription Scams",
    badge: "Medication Safety Hero",
    xp: 20,
    goals: [
      "Explain what a prescription scam is.",
      "Recognize fake pharmacies and medication scams.",
      "Buy medications safely online.",
      "Protect their health and personal information.",
      "Know what to do if they suspect a prescription scam."
    ],
    blocks: [
      {
        type: "learn",
        heading: "What Is a Prescription Scam?",
        text: "A prescription scam is when someone tries to trick you into buying fake medicine, paying for medicine you'll never receive, or giving away your personal information.\n\nScammers may pretend to be an online pharmacy, your doctor's office, a medication delivery company, or your insurance company. Their goal is often to steal your money, identity, or health information."
      },
      {
        type: "learn",
        heading: "Where Should You Get Prescription Medicine?",
        text: "The safest places to get prescription medicine are:",
        bullets: [
          "Your local pharmacy",
          "A pharmacy recommended by your doctor or insurance company",
          "A licensed online pharmacy"
        ],
        footer: "Always make sure the medicine was actually prescribed by your healthcare provider if a prescription is required."
      },
      {
        type: "learn",
        heading: "Warning Signs of a Prescription Scam",
        text: "Be cautious if a website or message:",
        bullets: [
          "Sells prescription medicine without requiring a prescription",
          "Promises a \"miracle cure\"",
          "Offers prices that seem unbelievably low",
          "Pressures you to buy immediately",
          "Only accepts gift cards or cryptocurrency",
          "Has no phone number or customer support",
          "Sends unexpected refill messages"
        ],
        footer: "If you notice several of these warning signs, do not buy the medication."
      },
      {
        type: "multiselect",
        title: "Which Are Safe Ways to Get Medicine?",
        prompt: "Tap every safe choice.",
        options: [
          { text: "Fill prescriptions at your regular pharmacy.", correct: true },
          { text: "Ask your doctor or pharmacist if an online pharmacy is trustworthy.", correct: true },
          { text: "Use a pharmacy recommended by your insurance company or healthcare provider.", correct: true },
          { text: "Buy medicine from a random advertisement on social media.", correct: false },
          { text: "Purchase prescription medicine from a website that doesn't require a prescription.", correct: false },
          { text: "Pay for medicine using gift cards because the seller requested it.", correct: false }
        ],
        feedback: "Excellent! Trusted pharmacies help ensure your medication is safe and legitimate."
      },
      {
        type: "flashcards",
        title: "Flashcards",
        cards: [
          { front: "Prescription", back: "Medicine authorized by a licensed healthcare provider." },
          { front: "Licensed Pharmacy", back: "A pharmacy legally allowed to dispense medications." },
          { front: "Prescription Scam", back: "A scam involving fake medicine or fake pharmacies." },
          { front: "Refill", back: "Getting more of a medicine you already have a prescription for." },
          { front: "Pharmacist", back: "A healthcare professional who prepares and dispenses medications." }
        ]
      },
      {
        type: "match",
        title: "Match the Situation",
        pairs: [
          { word: "Ad selling prescription medicine at 95% off", match: "Don't buy it; use a trusted pharmacy instead" },
          { word: "Unexpected text saying your prescription is ready", match: "Contact your pharmacy directly" },
          { word: "Unsure if an online pharmacy is real", match: "Ask your doctor or pharmacist" },
          { word: "Website asks for gift cards", match: "Leave the website" },
          { word: "Need a prescription refill", match: "Contact your pharmacy or healthcare provider" }
        ]
      },
      {
        type: "fillblank",
        title: "Fill in the Blank",
        wordBank: ["Pharmacy", "Prescription", "Doctor", "Gift Cards"],
        questions: [
          { text: "Buy prescription medicine from a trusted ______.", answer: "Pharmacy" },
          { text: "Many medications require a ______ from a licensed healthcare provider.", answer: "Prescription" },
          { text: "If you're unsure about an online pharmacy, ask your ______.", answer: "Doctor" }
        ]
      },
      {
        type: "scenario",
        title: "Scenario 1",
        text: "Margaret sees this advertisement: \"Blood pressure medicine! 90% OFF! No prescription needed!\" What should she do?",
        options: [
          "Buy it before it sells out.",
          "Enter her credit card number.",
          "Do not buy it. Use a trusted pharmacy and talk to her doctor if she needs medication.",
          "Share the advertisement with her friends."
        ],
        correctIndex: 2,
        explanation: "Medicine from unknown sellers may be fake, unsafe, or never arrive."
      },
      {
        type: "scenario",
        title: "Scenario 2",
        text: "Robert receives this text: \"Click here to refill your prescription now.\" He wasn't expecting a refill reminder. What should he do?",
        options: [
          "Click the link.",
          "Reply with his insurance information.",
          "Contact his pharmacy directly using the phone number or website he already knows.",
          "Send his date of birth."
        ],
        correctIndex: 2,
        explanation: "Unexpected refill messages can be phishing scams."
      },
      {
        type: "scenario",
        title: "Scenario 3",
        text: "Linda finds a website selling prescription medication. It has no phone number, doesn't list an address, only accepts gift cards, and doesn't require a prescription. What should she do?",
        options: [
          "Buy the medicine because it's inexpensive.",
          "Pay with gift cards.",
          "Leave the website and use a trusted pharmacy instead.",
          "Give the website her Medicare number."
        ],
        correctIndex: 2,
        explanation: "Multiple warning signs suggest this could be a prescription scam."
      },
      {
        type: "learn",
        heading: "Quick Tip",
        text: "Before buying medicine online, ask yourself: Is this a trusted pharmacy? Did my healthcare provider prescribe this medicine? Does the website provide contact information? Am I being pressured to buy quickly? If you're unsure, stop and ask your doctor or pharmacist first."
      },
      {
        type: "sort",
        title: "Safe or Unsafe?",
        prompt: "Drag each choice into the correct box.",
        categories: [
          {
            label: "Safer Choices",
            items: ["Fill prescriptions at trusted pharmacies", "Ask questions if something seems unusual", "Verify refill messages directly with your pharmacy", "Follow your healthcare provider's instructions"]
          },
          {
            label: "Less Safe Choices",
            items: ["Buy medicine from random social media ads", "Trust \"miracle cure\" claims", "Pay with gift cards", "Share medical information with unknown websites"]
          }
        ]
      },
      {
        type: "choice",
        title: "What Should You Do?",
        text: "You receive an email: \"Your prescription is waiting. Click here immediately.\" You weren't expecting any medication.",
        options: [
          "Click the link.",
          "Reply with your password.",
          "Contact your pharmacy directly using a phone number or website you already know.",
          "Give your Medicare number."
        ],
        correctIndex: 2,
        explanation: "Unexpected refill emails are often phishing attempts."
      },
      {
        type: "choice",
        title: "What Should You Do?",
        text: "A website says: \"No prescription needed! Buy any medication today!\"",
        options: [
          "Purchase the medication.",
          "Share your insurance information.",
          "Leave the website and talk to your doctor if you need prescription medicine.",
          "Recommend the website to friends."
        ],
        correctIndex: 2
      },
      {
        type: "choice",
        title: "What Should You Do?",
        text: "You're unsure whether an online pharmacy is trustworthy. What should you do?",
        options: [
          "Guess.",
          "Buy one bottle to test it.",
          "Ask your doctor or pharmacist before ordering.",
          "Trust it because it has low prices."
        ],
        correctIndex: 2,
        explanation: "Healthcare professionals can help you determine whether a pharmacy is legitimate."
      },
      {
        type: "learn",
        heading: "Remember",
        text: "Prescription scams can put your money and your health at risk. Use trusted pharmacies, follow your healthcare provider's instructions, verify refill requests, and ask your doctor or pharmacist if you're unsure. Never buy prescription medicine from unknown websites, believe \"miracle cure\" advertisements, pay with gift cards, or click unexpected refill links."
      }
    ],
    quiz: [
      { question: "What is a prescription scam?", options: ["A doctor writing a prescription.", "Picking up medicine at a pharmacy.", "A scam involving fake medicine or fake pharmacies.", "Reading medicine instructions."], correctIndex: 2 },
      { question: "Which are warning signs of a prescription scam?", options: ["A pharmacy asking for your prescription", "Medicine sold without a prescription, unbelievable prices, gift card requests, and no contact information"], correctIndex: 1 },
      { question: "True or False: If you're unsure about an online pharmacy, you should ask your doctor or pharmacist before ordering.", options: ["True", "False"], correctIndex: 0 },
      { question: "Buy prescription medicine from a trusted ______.", options: ["Pharmacy", "Password", "Camera"], correctIndex: 0 },
      { question: "A website advertises prescription medicine without requiring a prescription and only accepts gift cards. What should you do?", options: ["Buy the medicine.", "Enter your payment information.", "Leave the website and use a trusted pharmacy instead.", "Share the website with family members."], correctIndex: 2 },
      { question: "What should you do if you receive an unexpected text asking you to refill your prescription?", options: ["Click the link immediately.", "Reply with your insurance number.", "Contact your pharmacy directly using the phone number or website you already know.", "Give your Medicare number."], correctIndex: 2 },
      { question: "Which statement is TRUE?", options: ["Prescription medicine is always safe if it's the cheapest option.", "Every online pharmacy is trustworthy.", "Legitimate pharmacies usually provide contact information and follow prescription requirements.", "Social media advertisements are the safest place to buy medicine."], correctIndex: 2 },
      { question: "Which payment method is a major warning sign when buying prescription medicine?", options: ["Credit card", "Debit card", "Gift cards", "Paying at your local pharmacy"], correctIndex: 2 }
    ],
    complete: {
      title: "Great Job!",
      subtitle: "You completed Lesson 3: Prescription Scams!",
      learned: [
        "Recognize fake pharmacies.",
        "Buy medications safely.",
        "Spot common prescription scams.",
        "Protect your health and personal information."
      ],
      next: "Using the Medicare Website Safely"
    }
  },

  // ============================================================
  // LESSON 5.4
  // ============================================================
  {
    id: "medicare-website",
    track: "literacy",
    phase: 5,
    order: 39,
    lessonNumber: "5.4",
    title: "Using the Medicare Website Safely",
    badge: "Medicare Safety Expert",
    xp: 20,
    goals: [
      "Explain what Medicare is.",
      "Recognize the official Medicare website.",
      "Use Medicare.gov safely.",
      "Protect their Medicare information.",
      "Recognize common Medicare scams."
    ],
    blocks: [
      {
        type: "learn",
        heading: "What Is Medicare?",
        text: "Medicare is a U.S. government health insurance program for most adults age 65 and older, some younger people with certain disabilities, and people with certain medical conditions.\n\nThe official Medicare website is medicare.gov.",
        bullets: [
          "Learn about your Medicare coverage",
          "Compare health and prescription drug plans",
          "Find doctors and healthcare providers",
          "View important Medicare information",
          "Learn about costs and benefits"
        ]
      },
      {
        type: "learn",
        heading: "Protecting Your Medicare Information",
        text: "Your Medicare number is personal. Treat it like you would a credit card number or your bank account number.\n\nNever share your Medicare number unless you're working with a trusted healthcare provider, insurer, or Medicare representative when appropriate. Keep it private."
      },
      {
        type: "learn",
        heading: "Common Medicare Scams",
        text: "Scammers may pretend to be from Medicare. They might say:",
        bullets: [
          "\"Your Medicare card has expired.\"",
          "\"You must pay today to keep your benefits.\"",
          "\"We need your Medicare number immediately.\"",
          "\"We'll send you free medical equipment.\""
        ],
        footer: "Medicare generally will not unexpectedly call you asking for payment or sensitive personal information."
      },
      {
        type: "multiselect",
        title: "Which Actions Are Safe?",
        prompt: "Tap every safe action.",
        options: [
          { text: "Visit medicare.gov by typing the address into your browser.", correct: true },
          { text: "Keep your Medicare number private.", correct: true },
          { text: "Contact Medicare using official contact information if you're unsure.", correct: true },
          { text: "Ask a trusted family member or caregiver for help navigating the website.", correct: true },
          { text: "Give your Medicare number to an unexpected caller.", correct: false },
          { text: "Pay someone who says you need a \"new Medicare card.\"", correct: false },
          { text: "Click links from unexpected Medicare text messages.", correct: false }
        ],
        feedback: "Excellent! Protecting your Medicare information helps prevent identity theft and healthcare fraud."
      },
      {
        type: "flashcards",
        title: "Flashcards",
        cards: [
          { front: "Medicare", back: "A U.S. government health insurance program for eligible individuals." },
          { front: "Medicare.gov", back: "The official Medicare website." },
          { front: "Medicare Number", back: "Your personal Medicare identification number that should be kept private." },
          { front: "Coverage", back: "The healthcare services your Medicare plan helps pay for." },
          { front: "Medicare Scam", back: "Someone pretending to represent Medicare to steal money or personal information." }
        ]
      },
      {
        type: "match",
        title: "Match the Situation",
        pairs: [
          { word: "Unsure if a Medicare email is real", match: "Visit Medicare.gov yourself instead of clicking the link" },
          { word: "Someone asks for your Medicare number unexpectedly", match: "Do not give it to them" },
          { word: "Need information about your Medicare plan", match: "Use Medicare.gov" },
          { word: "Caller says your Medicare card expired today", match: "Hang up and verify through official contact information" },
          { word: "Need help understanding your coverage", match: "Review Medicare.gov or contact Medicare officially" }
        ]
      },
      {
        type: "fillblank",
        title: "Fill in the Blank",
        wordBank: ["gov", "Private", "Coverage", "Medicare"],
        questions: [
          { text: "The official Medicare website is Medicare.______.", answer: "gov" },
          { text: "Your Medicare number should be kept ______.", answer: "Private" },
          { text: "Medicare helps provide health insurance ______.", answer: "Coverage" }
        ]
      },
      {
        type: "scenario",
        title: "Scenario 1",
        text: "Margaret receives a call: \"Your Medicare card expires today. Pay $99 now or your coverage will end.\" What should she do?",
        options: [
          "Pay immediately.",
          "Give her Medicare number.",
          "Hang up and contact Medicare using the official phone number or Medicare.gov if she's concerned.",
          "Give her credit card number."
        ],
        correctIndex: 2,
        explanation: "Scammers often create fake emergencies to pressure people into acting quickly."
      },
      {
        type: "scenario",
        title: "Scenario 2",
        text: "Robert receives an email saying \"Click here to update your Medicare account.\" The link looks unfamiliar. What should he do?",
        options: [
          "Click the link.",
          "Enter his Medicare number.",
          "Open his browser and type medicare.gov himself if he wants to check his account.",
          "Forward the email to friends."
        ],
        correctIndex: 2,
        explanation: "Typing the official website yourself helps you avoid phishing websites."
      },
      {
        type: "scenario",
        title: "Scenario 3",
        text: "Linda receives a brochure advertising \"Free medical equipment from Medicare.\" It asks her to call and provide her Medicare number first. What should she do?",
        options: [
          "Call immediately and provide her Medicare number.",
          "Give her Medicare number over the phone.",
          "Verify the offer through Medicare.gov or official contact information before sharing any personal information.",
          "Pay a processing fee."
        ],
        correctIndex: 2,
        explanation: "Scammers often use \"free\" offers to collect Medicare numbers and personal information."
      },
      {
        type: "learn",
        heading: "Quick Tip",
        text: "Before sharing your Medicare number, ask yourself: Am I using Medicare.gov? Did I contact Medicare, or did someone contact me unexpectedly? Am I being pressured to act immediately? Does this request seem reasonable? If you're unsure, stop and verify through official Medicare contact information first."
      },
      {
        type: "sort",
        title: "Safe or Unsafe?",
        prompt: "Drag each choice into the correct box.",
        categories: [
          {
            label: "Safer Choices",
            items: ["Type medicare.gov into your browser", "Keep your Medicare number private", "Verify suspicious phone calls", "Contact Medicare using official contact information"]
          },
          {
            label: "Less Safe Choices",
            items: ["Share your Medicare number with unexpected callers", "Pay for a \"replacement Medicare card\"", "Click unexpected text links", "Rush because someone says your benefits will end today"]
          }
        ]
      },
      {
        type: "choice",
        title: "What Should You Do?",
        text: "You receive a text: \"Your Medicare benefits are suspended. Click here now!\"",
        options: [
          "Click the link immediately.",
          "Reply with your Medicare number.",
          "Ignore the link and visit medicare.gov or contact Medicare through official channels if you're concerned.",
          "Send your Social Security number."
        ],
        correctIndex: 2
      },
      {
        type: "choice",
        title: "What Should You Do?",
        text: "Someone calls offering \"free diabetic supplies\" if you provide your Medicare number.",
        options: [
          "Give your Medicare number.",
          "Pay a shipping fee.",
          "Decline the offer and verify it through Medicare if you're interested.",
          "Share your bank account number."
        ],
        correctIndex: 2
      },
      {
        type: "choice",
        title: "What Should You Do?",
        text: "You want to compare Medicare drug plans. Where should you go?",
        options: ["medicare-help.com", "medicare-discounts.net", "medicare.gov", "health-free-online.com"],
        correctIndex: 2
      },
      {
        type: "learn",
        heading: "Remember",
        text: "Medicare information is valuable. Use medicare.gov, keep your Medicare number private, verify unexpected phone calls, texts, or emails, and contact Medicare through official channels when you're unsure. Never share your Medicare number with unexpected callers, pay for a \"new Medicare card,\" click suspicious links, or rush because someone creates a sense of urgency."
      }
    ],
    quiz: [
      { question: "What is the official Medicare website?", options: ["medicare-help.com", "medicare-support.net", "medicare.gov", "usmedicare.com"], correctIndex: 2 },
      { question: "Which information should you protect?", options: ["Your favorite color", "Your Medicare number, Social Security number, bank account information, and credit card number"], correctIndex: 1 },
      { question: "True or False: It's safe to give your Medicare number to anyone who calls claiming to be from Medicare.", options: ["True", "False"], correctIndex: 1 },
      { question: "The official Medicare website ends in .______", options: ["gov", "Phone", "Password"], correctIndex: 0 },
      { question: "Someone unexpectedly calls and says your Medicare card has expired and you must pay immediately. What should you do?", options: ["Pay immediately.", "Give your Medicare number.", "Hang up and verify the information through medicare.gov or Medicare's official contact information.", "Buy gift cards."], correctIndex: 2 },
      { question: "Which is a common Medicare scam?", options: ["A reminder about a scheduled appointment from your doctor's office.", "A pharmacy asking if you want to refill a prescription you requested.", "An unexpected caller demanding payment to keep your Medicare benefits.", "Your doctor discussing your treatment plan."], correctIndex: 2 },
      { question: "If you receive an email with a suspicious Medicare link, what is the safest action?", options: ["Click it to see if it's real.", "Reply with your Medicare number.", "Type medicare.gov into your browser yourself instead of using the link.", "Forward it to friends."], correctIndex: 2 },
      { question: "Why should you keep your Medicare number private?", options: ["It helps your internet work faster.", "It changes your insurance plan automatically.", "It can be used by scammers to commit fraud or steal your identity.", "It improves your doctor's appointment."], correctIndex: 2 }
    ],
    complete: {
      title: "Congratulations!",
      subtitle: "You completed Lesson 4: Using the Medicare Website Safely!",
      learned: [
        "Recognize the official Medicare website.",
        "Use Medicare.gov safely.",
        "Protect your Medicare information.",
        "Recognize common Medicare scams."
      ],
      next: "Using the IRS Website Safely"
    }
  },

  // ============================================================
  // LESSON 5.5
  // ============================================================
  {
    id: "irs-website",
    track: "literacy",
    phase: 5,
    order: 40,
    lessonNumber: "5.5",
    title: "Using the IRS Website Safely",
    badge: "Tax Safety Expert",
    xp: 20,
    goals: [
      "Explain what the IRS is.",
      "Recognize the official IRS website.",
      "Safely use IRS.gov.",
      "Identify common IRS scams.",
      "Know what to do if they receive suspicious tax messages."
    ],
    blocks: [
      {
        type: "learn",
        heading: "What Is the IRS?",
        text: "The Internal Revenue Service (IRS) is the U.S. government agency responsible for collecting federal taxes and administering tax laws. The official IRS website is irs.gov.",
        bullets: [
          "Find tax forms",
          "Learn about tax refunds",
          "Create or manage an IRS online account",
          "Find answers to tax questions",
          "Make certain tax payments"
        ],
        footer: "The IRS website can help you find reliable tax information without relying on emails, phone calls, or social media posts."
      },
      {
        type: "learn",
        heading: "Protecting Your Tax Information",
        text: "Your tax information is private. This includes your Social Security number, tax returns, bank account information, and IRS account login information.\n\nOnly enter this information on IRS.gov or when working with a trusted tax professional."
      },
      {
        type: "learn",
        heading: "Common IRS Scams",
        text: "Scammers often pretend to be the IRS. They may contact you by phone calls, text messages, emails, or fake websites. They might say:",
        bullets: [
          "\"You owe taxes immediately!\"",
          "\"You'll be arrested today!\"",
          "\"Pay with gift cards.\"",
          "\"Click here to claim your tax refund.\""
        ],
        footer: "These are common scam tactics designed to pressure you into acting quickly."
      },
      {
        type: "multiselect",
        title: "Which Actions Are Safe?",
        prompt: "Tap every safe action.",
        options: [
          { text: "Type irs.gov into your browser.", correct: true },
          { text: "Verify suspicious tax messages using IRS.gov.", correct: true },
          { text: "Keep your Social Security number private.", correct: true },
          { text: "Contact the IRS using official contact information if you're unsure.", correct: true },
          { text: "Pay taxes with gift cards because someone called.", correct: false },
          { text: "Click a tax refund link from an unexpected text message.", correct: false },
          { text: "Give your bank account information to an unknown caller claiming to be the IRS.", correct: false }
        ],
        feedback: "Excellent! Official IRS information should come from IRS.gov or verified IRS communications."
      },
      {
        type: "flashcards",
        title: "Flashcards",
        cards: [
          { front: "IRS", back: "The U.S. government agency responsible for federal taxes." },
          { front: "IRS.gov", back: "The official IRS website." },
          { front: "Tax Return", back: "A form filed with the IRS that reports your income and taxes." },
          { front: "Tax Refund", back: "Money returned if you paid more tax than you owed." },
          { front: "Tax Scam", back: "Someone pretending to represent the IRS to steal money or personal information." }
        ]
      },
      {
        type: "match",
        title: "Match the Situation",
        pairs: [
          { word: "Unexpected email about a tax refund", match: "Go directly to IRS.gov instead of clicking the link" },
          { word: "Phone call demanding immediate payment", match: "Hang up and verify through official IRS contact information" },
          { word: "Need a tax form", match: "Download it from IRS.gov" },
          { word: "Unsure if an IRS message is real", match: "Verify it using official IRS resources" },
          { word: "Someone asks for payment with gift cards", match: "Do not pay; it's a major warning sign" }
        ]
      },
      {
        type: "fillblank",
        title: "Fill in the Blank",
        wordBank: ["gov", "Refund", "Private", "Taxes"],
        questions: [
          { text: "The official IRS website is IRS.______.", answer: "gov" },
          { text: "Money returned after paying too much in taxes is called a tax ______.", answer: "Refund" },
          { text: "Your Social Security number should remain ______.", answer: "Private" }
        ]
      },
      {
        type: "scenario",
        title: "Scenario 1",
        text: "Robert receives a phone call: \"You owe taxes. If you don't pay within one hour, you'll be arrested.\" What should he do?",
        options: [
          "Buy gift cards immediately.",
          "Give his credit card number.",
          "Hang up and verify the claim using IRS.gov or official IRS contact information.",
          "Give the caller his Social Security number."
        ],
        correctIndex: 2,
        explanation: "The IRS does not demand immediate payment through threatening phone calls."
      },
      {
        type: "scenario",
        title: "Scenario 2",
        text: "Linda receives this text: \"Congratulations! Claim your IRS refund by clicking here.\" She wasn't expecting a refund. What should she do?",
        options: [
          "Click the link.",
          "Reply with her bank account information.",
          "Ignore the link and visit IRS.gov directly if she wants to check her tax information.",
          "Forward the text to friends."
        ],
        correctIndex: 2,
        explanation: "Unexpected refund messages are often phishing scams."
      },
      {
        type: "scenario",
        title: "Scenario 3",
        text: "Susan needs a tax form for her records. Where should she get it?",
        options: ["A random website.", "A social media post.", "IRS.gov", "An advertisement."],
        correctIndex: 2,
        explanation: "IRS.gov provides official tax forms and publications."
      },
      {
        type: "learn",
        heading: "Quick Tip",
        text: "Before responding to an IRS message, ask yourself: Was I expecting this message? Is the website really IRS.gov? Is someone demanding payment immediately? Are they asking for gift cards or unusual payment methods? If you're unsure, stop and verify through IRS.gov before taking action."
      },
      {
        type: "sort",
        title: "Safe or Unsafe?",
        prompt: "Drag each choice into the correct box.",
        categories: [
          {
            label: "Safer Choices",
            items: ["Type IRS.gov into your browser", "Keep your tax information private", "Verify suspicious messages", "Download forms directly from IRS.gov"]
          },
          {
            label: "Less Safe Choices",
            items: ["Pay taxes with gift cards", "Click refund links in unexpected texts", "Share your Social Security number with unknown callers", "Rush because someone threatens arrest"]
          }
        ]
      },
      {
        type: "choice",
        title: "What Should You Do?",
        text: "You receive an email saying: \"Your tax refund is waiting! Click here now!\"",
        options: [
          "Click the link.",
          "Enter your Social Security number.",
          "Go directly to IRS.gov to check your tax information instead.",
          "Reply with your banking information."
        ],
        correctIndex: 2
      },
      {
        type: "choice",
        title: "What Should You Do?",
        text: "A caller says you must pay your taxes using gift cards.",
        options: [
          "Buy the gift cards.",
          "Give your credit card information instead.",
          "Hang up. Gift cards are a major warning sign of a scam.",
          "Pay through a random payment app."
        ],
        correctIndex: 2
      },
      {
        type: "choice",
        title: "What Should You Do?",
        text: "You're unsure if an IRS email is legitimate. What should you do?",
        options: [
          "Click the link to check.",
          "Reply asking if it's real.",
          "Visit IRS.gov directly or contact the IRS using official contact information.",
          "Ignore the website address completely."
        ],
        correctIndex: 2
      },
      {
        type: "learn",
        heading: "Remember",
        text: "The IRS will never expect you to pay with gift cards, share sensitive information through unexpected emails or texts, or rush because of threats. Always use IRS.gov, verify suspicious messages, protect your personal information, and contact the IRS through official channels if you're unsure."
      }
    ],
    quiz: [
      { question: "What is the official IRS website?", options: ["irs-help.com", "tax-refund.net", "IRS.gov", "us-irs.org"], correctIndex: 2 },
      { question: "Which information should you keep private?", options: ["Your favorite hobby", "Social Security number, bank account information, IRS account password, and tax return information"], correctIndex: 1 },
      { question: "True or False: The IRS may demand payment using gift cards.", options: ["True", "False"], correctIndex: 1 },
      { question: "The official IRS website ends in .______", options: ["gov", "Camera", "Phone"], correctIndex: 0 },
      { question: "A caller threatens to arrest you unless you pay your taxes immediately with gift cards. What should you do?", options: ["Buy the gift cards.", "Give your Social Security number.", "Hang up and verify the information through IRS.gov or official IRS contact information.", "Send money through a payment app."], correctIndex: 2 },
      { question: "You receive an unexpected text saying you have a tax refund waiting. What is the safest action?", options: ["Click the link.", "Reply with your bank information.", "Visit IRS.gov directly to check your tax information.", "Forward the message to family."], correctIndex: 2 },
      { question: "Where should you download official IRS tax forms?", options: ["A random website.", "Social media.", "IRS.gov", "An online advertisement."], correctIndex: 2 },
      { question: "Which of these is a warning sign of an IRS scam?", options: ["A form downloaded from IRS.gov.", "A scheduled appointment with your tax professional.", "Someone demanding immediate payment with gift cards and threatening arrest.", "Reading tax information on the official IRS website."], correctIndex: 2 }
    ],
    complete: {
      title: "Congratulations!",
      subtitle: "You completed Lesson 5: Using the IRS Website Safely!",
      learned: [
        "Recognize the official IRS website.",
        "Safely use IRS.gov.",
        "Identify common IRS scams.",
        "Know what to do with suspicious tax messages."
      ],
      next: "Using DMV Websites Safely"
    }
  },

  // ============================================================
  // LESSON 5.6
  // ============================================================
  {
    id: "dmv-websites",
    track: "literacy",
    phase: 5,
    order: 41,
    lessonNumber: "5.6",
    title: "Using DMV Websites Safely",
    badge: "DMV Safety Navigator",
    xp: 20,
    goals: [
      "Explain what the DMV is.",
      "Recognize the official DMV website for their state.",
      "Complete common DMV tasks safely online.",
      "Recognize DMV scams.",
      "Avoid fake DMV websites and phishing messages."
    ],
    blocks: [
      {
        type: "learn",
        heading: "What Is the DMV?",
        text: "The Department of Motor Vehicles (DMV) is a government agency that handles services related to:",
        bullets: [
          "Driver's licenses",
          "Vehicle registration",
          "ID cards",
          "License plates",
          "Driver's tests and appointments"
        ],
        footer: "Many DMV services can now be completed online using your state's official DMV website. Using the official website can save time and help you avoid scams."
      },
      {
        type: "learn",
        heading: "Finding the Official DMV Website",
        text: "Every state has its own official DMV website. For example: California uses dmv.ca.gov, Texas uses txdmv.gov, and Florida uses flhsmv.gov.\n\nMany official DMV websites end in .gov, while others use an official state government address. If you're unsure, search carefully or visit your state's official government website."
      },
      {
        type: "learn",
        heading: "DMV Scam Warning Signs",
        text: "Scammers create fake DMV websites that may:",
        bullets: [
          "Charge extra \"processing fees\"",
          "Ask for your Social Security number when it isn't needed",
          "Send text messages claiming you have unpaid tickets",
          "Ask you to pay using gift cards or cryptocurrency",
          "Use website addresses that look similar to the real DMV"
        ],
        footer: "Real: dmv.ca.gov | Fake: california-dmv-renew.com or dmv-license-help.net. Always read the website address carefully."
      },
      {
        type: "learn",
        heading: "Staying Safe Online",
        text: "When using a DMV website:",
        bullets: [
          "Type the website address yourself or use a trusted search result",
          "Check that you're on your state's official website",
          "Be cautious of unexpected emails or text messages",
          "Never pay DMV fees with gift cards",
          "Log out if using a shared computer"
        ]
      },
      {
        type: "multiselect",
        title: "Which Are Safe?",
        prompt: "Tap every safe action.",
        options: [
          { text: "Use your state's official DMV website.", correct: true },
          { text: "Read the website address carefully.", correct: true },
          { text: "Type the website address yourself if possible.", correct: true },
          { text: "Log out when using a shared computer.", correct: true },
          { text: "Pay DMV fees with gift cards.", correct: false },
          { text: "Click every DMV text message you receive.", correct: false },
          { text: "Enter personal information on websites with unfamiliar addresses.", correct: false }
        ],
        feedback: "Excellent! Official DMV websites help protect your personal information."
      },
      {
        type: "flashcards",
        title: "Flashcards",
        cards: [
          { front: "DMV", back: "Department of Motor Vehicles, the agency that handles driver's licenses and vehicle registration." },
          { front: "Driver's License", back: "An official document that allows you to drive." },
          { front: "Vehicle Registration", back: "The process of registering your vehicle with your state." },
          { front: "Official Website", back: "The real government website used for DMV services." },
          { front: "Phishing", back: "A scam that tries to trick you into giving personal information through fake emails, texts, or websites." }
        ]
      },
      {
        type: "match",
        title: "Match the Situation",
        pairs: [
          { word: "Need to renew your driver's license", match: "Visit your state's official DMV website" },
          { word: "Receive a text saying you owe DMV fees", match: "Verify through the official DMV website first" },
          { word: "Website asks for gift cards", match: "Leave the website" },
          { word: "Unsure if a DMV website is real", match: "Check the web address carefully" },
          { word: "Using a library computer", match: "Log out when finished" }
        ]
      },
      {
        type: "fillblank",
        title: "Fill in the Blank",
        wordBank: ["License", "Official", "Registration", "Gift Cards"],
        questions: [
          { text: "The DMV helps you renew your driver's ______.", answer: "License" },
          { text: "Always use the ______ DMV website.", answer: "Official" },
          { text: "The DMV also helps with vehicle ______.", answer: "Registration" }
        ]
      },
      {
        type: "scenario",
        title: "Scenario 1",
        text: "Margaret receives this text: \"Your driver's license has been suspended. Pay immediately by clicking this link.\" What should she do?",
        options: [
          "Click the link and pay.",
          "Reply with her driver's license number.",
          "Go directly to her state's official DMV website or call the DMV using official contact information to verify.",
          "Send gift cards."
        ],
        correctIndex: 2,
        explanation: "Unexpected texts like this are commonly used in phishing scams."
      },
      {
        type: "scenario",
        title: "Scenario 2",
        text: "Robert wants to renew his vehicle registration. He finds dmv.ca.gov and california-dmv-renew.com. Which should he use?",
        options: ["california-dmv-renew.com", "dmv.ca.gov"],
        correctIndex: 1,
        explanation: "Always choose the official government website. Fake websites often copy the appearance of official sites."
      },
      {
        type: "scenario",
        title: "Scenario 3",
        text: "Linda is using a public library computer to renew her driver's license. When she's finished, what should she do?",
        options: [
          "Leave the website open.",
          "Save her password.",
          "Log out completely and close the browser.",
          "Leave the computer immediately."
        ],
        correctIndex: 2,
        explanation: "Always sign out when using shared or public computers."
      },
      {
        type: "learn",
        heading: "Quick Tip",
        text: "Before using a DMV website, ask yourself: Is this my state's official DMV website? Did I type the website address myself? Am I being asked for unusual payment methods? Am I being pressured to act immediately? If something seems unusual, stop and verify before entering any information."
      },
      {
        type: "sort",
        title: "Safe or Unsafe?",
        prompt: "Drag each choice into the correct box.",
        categories: [
          {
            label: "Safer Choices",
            items: ["Use your state's official DMV website", "Verify suspicious texts", "Read website addresses carefully", "Log out on shared computers"]
          },
          {
            label: "Less Safe Choices",
            items: ["Click unexpected DMV links", "Pay with gift cards", "Ignore suspicious website addresses", "Save passwords on public computers"]
          }
        ]
      },
      {
        type: "choice",
        title: "What Should You Do?",
        text: "You receive an email saying \"Renew your driver's license today! Click here!\" You weren't expecting it.",
        options: [
          "Click the link.",
          "Enter your personal information.",
          "Visit your state's official DMV website yourself to see if you need to renew.",
          "Forward the email to your friends."
        ],
        correctIndex: 2
      },
      {
        type: "choice",
        title: "What Should You Do?",
        text: "A website asks you to pay DMV fees using gift cards.",
        options: [
          "Buy the gift cards.",
          "Continue because the fee is small.",
          "Leave the website immediately.",
          "Give your bank password instead."
        ],
        correctIndex: 2
      },
      {
        type: "choice",
        title: "What Should You Do?",
        text: "You're unsure if a DMV website is legitimate. What should you do?",
        options: [
          "Enter your information first.",
          "Ignore the website address.",
          "Check the web address carefully and make sure it belongs to your state's official DMV.",
          "Trust it because it looks professional."
        ],
        correctIndex: 2,
        explanation: "Scammers often create websites that look convincing. Always verify the web address."
      },
      {
        type: "learn",
        heading: "Remember",
        text: "The DMV helps with driver's licenses, vehicle registration, and other driving-related services. Use your state's official DMV website, read website addresses carefully, verify unexpected messages, and protect your personal information. Never pay DMV fees with gift cards, click unexpected renewal links, or share personal information on suspicious websites."
      }
    ],
    quiz: [
      { question: "What does the DMV help with?", options: ["Grocery shopping", "Online banking", "Driver's licenses, vehicle registration, and ID cards", "Email accounts"], correctIndex: 2 },
      { question: "Which are safe habits?", options: ["Clicking every DMV text", "Using your state's official website, verifying texts, logging out on shared computers, and reading addresses carefully"], correctIndex: 1 },
      { question: "True or False: It's safe to pay DMV fees with gift cards if a text message tells you to.", options: ["True", "False"], correctIndex: 1 },
      { question: "The DMV helps you renew your driver's ______.", options: ["License", "Taxes", "Medicine"], correctIndex: 0 },
      { question: "You receive a text saying your driver's license is suspended unless you pay immediately through a link. What should you do?", options: ["Click the link and pay.", "Reply with your driver's license number.", "Go directly to your state's official DMV website or contact the DMV using official information.", "Buy gift cards."], correctIndex: 2 },
      { question: "Which website is most likely the official California DMV website?", options: ["california-dmv-renew.com", "dmv-help-now.net", "dmv.ca.gov", "californialicense.org"], correctIndex: 2 },
      { question: "Why should you log out after using a public computer?", options: ["To make the computer run faster.", "To save electricity.", "To help protect your personal information from the next user.", "To update your driver's license."], correctIndex: 2 },
      { question: "Which is a warning sign of a fake DMV website?", options: ["It belongs to your state's official government.", "It lets you schedule an appointment.", "It asks you to pay with gift cards or has a suspicious web address.", "It provides information about renewing your license."], correctIndex: 2 }
    ],
    complete: {
      title: "Congratulations!",
      subtitle: "You completed Lesson 6: Using DMV Websites Safely!",
      learned: [
        "Recognize your state's official DMV website.",
        "Complete DMV tasks safely online.",
        "Recognize DMV scams.",
        "Avoid fake DMV websites."
      ],
      next: "How to Know a Government Website Is Real"
    }
  },

  // ============================================================
  // LESSON 5.7
  // ============================================================
  {
    id: "gov-websites",
    track: "literacy",
    phase: 5,
    order: 42,
    lessonNumber: "5.7",
    title: "How to Know a Government Website Is Real (.gov)",
    badge: "Government Website Detective",
    xp: 20,
    goals: [
      "Recognize official U.S. government websites.",
      "Understand what .gov means.",
      "Tell the difference between real and fake government websites.",
      "Safely access government services online.",
      "Avoid fake websites designed to steal personal information."
    ],
    blocks: [
      {
        type: "learn",
        heading: "What Is a .gov Website?",
        text: "A website ending in .gov is used by U.S. government agencies. Examples include irs.gov, medicare.gov, dmv.ca.gov, and weather.gov.\n\nGovernment websites provide official information and services. Scammers often make websites that look official but use different endings like .com, .net, or .org. Always read the entire web address, not just the beginning."
      },
      {
        type: "learn",
        heading: "Real vs. Fake Websites",
        text: "Sometimes fake websites look almost identical to real ones.",
        bullets: [
          "Real: irs.gov | Fake: irs-help.com, irsrefund.net",
          "Real: medicare.gov | Fake: medicare-support.com, medicarebenefits.net",
          "Real: dmv.ca.gov | Fake: california-dmv-renew.com, dmvhelponline.net"
        ],
        footer: "A small difference in the web address can mean you're on a fake website."
      },
      {
        type: "learn",
        heading: "Why It Matters",
        text: "Fake government websites may try to steal your Social Security number, credit card numbers, bank information, or passwords. They may also charge unnecessary fees for services that are free or cheaper on official government websites."
      },
      {
        type: "multiselect",
        title: "Which Websites Are Official?",
        prompt: "Tap every official government website.",
        options: [
          { text: "irs.gov", correct: true },
          { text: "medicare.gov", correct: true },
          { text: "weather.gov", correct: true },
          { text: "dmv.ca.gov", correct: true },
          { text: "irs-help.com", correct: false },
          { text: "medicare-support.net", correct: false },
          { text: "dmv-renew-online.com", correct: false }
        ],
        feedback: "Excellent! Official government websites often end in .gov."
      },
      {
        type: "flashcards",
        title: "Flashcards",
        cards: [
          { front: ".gov", back: "The official web address ending used by U.S. government agencies." },
          { front: "Official Website", back: "A legitimate website operated by a government agency or trusted organization." },
          { front: "Fake Website", back: "A website designed to look real but used to steal information or money." },
          { front: "URL", back: "The web address you type into your browser." },
          { front: "Phishing", back: "A scam that tricks people into entering personal information on fake websites." }
        ]
      },
      {
        type: "match",
        title: "Match the Website",
        pairs: [
          { word: "irs.gov", match: "Official government website" },
          { word: "medicare-support.com", match: "Fake website" },
          { word: "weather.gov", match: "Official government website" },
          { word: "california-dmv-renew.com", match: "Fake website" },
          { word: "dmv.ca.gov", match: "Official government website" }
        ]
      },
      {
        type: "fillblank",
        title: "Fill in the Blank",
        wordBank: ["gov", "Website", "Information", "Fake"],
        questions: [
          { text: "Official U.S. government websites usually end in .______", answer: "gov" },
          { text: "Always read the full web ______ before entering personal information.", answer: "Website" },
          { text: "Fake government websites may try to steal your personal ______.", answer: "Information" }
        ]
      },
      {
        type: "scenario",
        title: "Scenario 1",
        text: "Margaret wants information about Medicare. She finds medicare.gov and medicare-benefits-online.com. Which should she choose?",
        options: ["medicare-benefits-online.com", "medicare.gov"],
        correctIndex: 1,
        explanation: "The official Medicare website ends in .gov. Scammers often add extra words to make fake websites look real."
      },
      {
        type: "scenario",
        title: "Scenario 2",
        text: "Robert searches online for tax forms. He sees irsrefund.net, irs-help.org, and irs.gov. Which website should he use?",
        options: ["irsrefund.net", "irs-help.org", "irs.gov"],
        correctIndex: 2,
        explanation: "IRS.gov is the official IRS website. Always choose the official government website whenever possible."
      },
      {
        type: "scenario",
        title: "Scenario 3",
        text: "Linda clicks a link in an email claiming to be from the DMV. The website asks for her Social Security number, banking information, and payment with gift cards. What should she do?",
        options: [
          "Continue.",
          "Give her information.",
          "Leave the website immediately and go to her state's official DMV website instead.",
          "Recommend it to friends."
        ],
        correctIndex: 2,
        explanation: "Government agencies do not ask you to pay with gift cards or pressure you to enter sensitive information."
      },
      {
        type: "learn",
        heading: "Quick Tip",
        text: "Before using any government website, ask yourself: Does the web address end in .gov? Am I on the correct government website? Did I type the address myself or use a trusted search result? Am I being asked for unusual payment methods? If you're unsure, stop and verify before entering any personal information."
      },
      {
        type: "sort",
        title: "Safe or Unsafe?",
        prompt: "Drag each choice into the correct box.",
        categories: [
          {
            label: "Safer Choices",
            items: ["Check for .gov", "Read the full web address", "Type the website yourself when possible", "Leave websites asking for gift card payments"]
          },
          {
            label: "Less Safe Choices",
            items: ["Ignore the website address", "Click every government email link", "Give personal information to suspicious websites", "Trust a website just because it looks professional"]
          }
        ]
      },
      {
        type: "choice",
        title: "What Should You Do?",
        text: "You search for the IRS and see irs.gov and irs-help.com. Which should you choose?",
        options: ["irs-help.com", "irs.gov"],
        correctIndex: 1,
        explanation: "Government agencies use official web addresses. Look carefully for .gov."
      },
      {
        type: "choice",
        title: "What Should You Do?",
        text: "A website asks you to pay government fees with gift cards.",
        options: ["Pay immediately.", "Buy the gift cards.", "Leave the website.", "Enter your bank password."],
        correctIndex: 2
      },
      {
        type: "choice",
        title: "What Should You Do?",
        text: "You receive an email with a link to renew your Medicare account. What is the safest action?",
        options: [
          "Click the link.",
          "Reply with your Medicare number.",
          "Open your browser and type medicare.gov yourself instead of clicking the email link.",
          "Forward the email to your friends."
        ],
        correctIndex: 2,
        explanation: "Typing the website address yourself helps avoid phishing websites."
      },
      {
        type: "learn",
        heading: "Remember",
        text: "Official government websites help protect your personal information. Look for .gov, read the full web address, type official websites yourself when possible, and be cautious of unexpected emails and text messages. Never trust a website just because it looks professional, pay government fees with gift cards, or enter personal information on suspicious websites."
      }
    ],
    quiz: [
      { question: "What does .gov usually mean?", options: ["A shopping website", "A social media website", "An official U.S. government website", "A news website"], correctIndex: 2 },
      { question: "Which websites are official government websites?", options: ["irs-help.com and medicare-support.net", "irs.gov, medicare.gov, weather.gov, and dmv.ca.gov"], correctIndex: 1 },
      { question: "True or False: A website ending in .com is always an official government website.", options: ["True", "False"], correctIndex: 1 },
      { question: "Official U.S. government websites usually end in .______", options: ["gov", "com", "org"], correctIndex: 0 },
      { question: "A website asks you to pay government fees with gift cards. What should you do?", options: ["Pay immediately.", "Buy the gift cards.", "Leave the website and find the official government website.", "Give your credit card number."], correctIndex: 2 },
      { question: "You're unsure whether a government website is real. What is the safest action?", options: ["Enter your personal information first.", "Trust it because it looks professional.", "Read the full web address carefully and make sure it belongs to the official government agency.", "Ignore the website address."], correctIndex: 2 }
    ],
    complete: {
      title: "Congratulations!",
      subtitle: "You completed Lesson 7: How to Know a Government Website Is Real (.gov)!",
      learned: [
        "Recognize official U.S. government websites.",
        "Understand what .gov means.",
        "Tell the difference between real and fake government websites.",
        "Avoid fake websites designed to steal personal information."
      ],
      next: "Phase 5 Final Exam"
    }
  }
];

// ============================================================
// PHASE 5 FINAL EXAM
// ============================================================
export const phase5Exam = {
  id: "phase5-exam",
  track: "literacy",
  phase: 5,
  order: 43,
  title: "Phase 5 Final Exam: Health & Government",
  topics: [
    "Patient Portals",
    "Telehealth",
    "Prescription Scams",
    "Medicare Website",
    "IRS Website",
    "DMV Websites",
    "Government Websites (.gov)"
  ],
  passingScore: 8,
  totalQuestions: 10,
  phaseBadge: "Health & Government Safety Master",
  phaseBadgeXp: 100,
  questions: [
    {
      question: "Which website is the official Medicare website?",
      options: ["medicare-help.com", "medicare-support.net", "medicare.gov", "usmedicare.com"],
      correctIndex: 2,
      explanation: "Official U.S. government websites usually end in .gov."
    },
    {
      question: "You're having a video appointment with your doctor. Which is the safest place to join the call?",
      options: [
        "Public coffee shop Wi-Fi",
        "A stranger's phone",
        "Your home or another private location using a secure internet connection",
        "A public computer at the library without logging out afterward"
      ],
      correctIndex: 2,
      explanation: "Private locations and secure internet connections help protect your health information."
    },
    {
      question: "Which of the following is a warning sign of a scam?",
      options: [
        "A pharmacy asking to see your prescription",
        "A website asking you to pay with gift cards, pressuring you to act immediately, or using a suspicious address"
      ],
      correctIndex: 1,
      explanation: "Scammers often create urgency, use fake websites, or request unusual payment methods."
    },
    {
      question: "Official U.S. government websites usually end in .______",
      options: ["gov", "Camera", "Password"],
      correctIndex: 0
    },
    {
      question: "You receive a text saying: \"Your driver's license has been suspended. Click here to pay immediately.\" What should you do?",
      options: [
        "Click the link.",
        "Pay immediately.",
        "Go directly to your state's official DMV website or contact the DMV using official information to verify.",
        "Buy gift cards."
      ],
      correctIndex: 2,
      explanation: "Unexpected messages asking for immediate payment are common phishing scams."
    },
    {
      question: "You receive an email that says: \"Claim your IRS refund now!\" What is the safest action?",
      options: [
        "Click the link.",
        "Reply with your Social Security number.",
        "Visit IRS.gov directly by typing the address into your browser.",
        "Forward the email to your friends."
      ],
      correctIndex: 2,
      explanation: "Typing the website yourself is safer than clicking unexpected links."
    },
    {
      question: "Which information should you keep private?",
      options: [
        "Your favorite restaurant",
        "Medicare number, Social Security number, bank account information, and patient portal password"
      ],
      correctIndex: 1,
      explanation: "These pieces of information can be used by scammers to steal your identity or money."
    },
    {
      question: "You find two websites while searching for Medicare information: medicare.gov and medicare-benefits-online.com. Which should you use?",
      options: ["medicare-benefits-online.com", "medicare.gov"],
      correctIndex: 1,
      explanation: "Official government websites use trusted web addresses. Be cautious of extra words or unusual endings."
    },
    {
      question: "True or False: If you're unsure whether a government website is real, you should carefully check the web address before entering any personal information.",
      options: ["True", "False"],
      correctIndex: 0
    },
    {
      question: "Mary wants to refill a prescription. She receives a text with a link to an unfamiliar pharmacy website offering huge discounts, and no prescription is required. What should she do?",
      options: [
        "Click the link and order the medicine.",
        "Enter her insurance information.",
        "Buy the medicine because it's cheaper.",
        "Ignore the link and use her trusted pharmacy or contact her doctor or pharmacist."
      ],
      correctIndex: 3,
      explanation: "Fake pharmacies often offer unrealistic prices or sell prescription medicine without requiring a prescription."
    }
  ],
  results: [
    { minScore: 10, title: "Digital Health Champion", xp: 100, trophy: true, message: "Amazing work! You know how to safely use online health and government services." },
    { minScore: 8, title: "Safety Pro", xp: 80, trophy: false, message: "Great job! You understand the key skills needed to stay safe online." },
    { minScore: 6, title: "Keep Practicing", xp: 40, trophy: false, message: "You're making good progress. Review the lessons you missed and try again." },
    { minScore: 0, title: "Review Recommended", xp: 0, trophy: false, message: "Go back through the lessons and retake the exam when you're ready." }
  ],
  nextPhase: "Phase 6: Social Media"
};

export default phase5Lessons;
