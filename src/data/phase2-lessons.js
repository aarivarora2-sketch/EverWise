// Everwise - Digital Literacy Track
// Phase 2: Safe Internet Habits
// Biome: Forest | Color: #3F5E45
//
// All lessons exactly as written by the team.
// Append these to the existing lessons array in src/data/lessons.js

export const phase2Lessons = [
  // ============================================================
  // LESSON 2.1
  // ============================================================
  {
    id: "strong-passwords",
    track: "literacy",
    phase: 2,
    order: 10,
    lessonNumber: "2.1",
    title: "Strong Passwords",
    badge: "Password Protector",
    xp: 20,
    goals: [
      "Explain why passwords are important.",
      "Create a strong password.",
      "Recognize weak passwords.",
      "Understand why every important account should have a unique password."
    ],
    blocks: [
      {
        type: "learn",
        heading: "What Is a Password?",
        text: "A password is a secret code that helps protect your online accounts. Think of a password like the key to your front door. If someone has your key, they can enter your house. If someone has your password, they may be able to access your email, bank account, photos, or other personal information. Passwords help keep your information private."
      },
      {
        type: "learn",
        heading: "What Makes a Strong Password?",
        text: "A strong password is long (at least 12 characters), easy for you to remember, and hard for other people to guess.",
        bullets: [
          "Uppercase letters (A-Z)",
          "Lowercase letters (a-z)",
          "Numbers (0-9)",
          "Symbols (!, ?, #, &, *)"
        ],
        footer: "Example: password123 is very simple, making it weak. Linda092611 (a name and birthday) would be extremely easy to guess. Blue!River28Coffee is long, unique, and easier to remember than a random string of characters."
      },
      {
        type: "learn",
        heading: "Common Password Mistakes",
        text: "Avoid passwords like:",
        bullets: [
          "123456",
          "password",
          "qwerty",
          "Your birthday",
          "Your pet's name",
          "Your phone number",
          "Your address"
        ],
        footer: "Scammers often try these first. Scammers find this information from social media and your interactions online."
      },
      {
        type: "multiselect",
        title: "Which Passwords Are Strong?",
        prompt: "Tap every strong password.",
        options: [
          { text: "87654321", correct: false },
          { text: "password1", correct: false },
          { text: "Linda1955", correct: false },
          { text: "Purple!Tree82Sun", correct: true },
          { text: "River&Books91", correct: true },
          { text: "abc123", correct: false }
        ],
        feedback: "Excellent! Strong passwords are long, unique, and difficult to guess.",
        incorrectFeedback: "Not quite! That password doesn't have any complexity. It would work better with symbols, capitalizing different letters, and just more!"
      },
      {
        type: "learn",
        heading: "Think About Your House Keys",
        text: "Would you use the same key for your house, your car, and your office? Probably not. Your online accounts should also have different passwords. If one password is stolen, your other accounts stay protected."
      },
      {
        type: "flashcards",
        title: "Flashcards",
        cards: [
          { front: "Password", back: "A secret code that protects your account." },
          { front: "Strong Password", back: "A long, unique password that is difficult for others to guess." },
          { front: "Unique Password", back: "A password used for only one account." },
          { front: "Symbol", back: "A special character like ! @ # $ % & *" },
          { front: "Account", back: "A personal profile or service you sign in to online." }
        ]
      },
      {
        type: "match",
        title: "Match the Word",
        pairs: [
          { word: "Password", match: "Protects your account" },
          { word: "Strong Password", match: "Long and hard to guess" },
          { word: "Symbol", match: "A special character like ! or #" },
          { word: "Account", match: "Your online profile" },
          { word: "Unique", match: "Used only once" }
        ]
      },
      {
        type: "builder",
        title: "Build a Strong Password",
        prompt: "Pick one item from each column to create a strong password.",
        columns: [
          { label: "Word 1", items: ["Forest", "Sunny", "Bicycle", "Ocean"] },
          { label: "Symbol", items: ["!", "@"] },
          { label: "Number", items: ["42", "87", "15"] },
          { label: "Word 2", items: ["Coffee", "Mountain", "Library", "Garden"] }
        ],
        example: "Forest!42Coffee",
        feedback: "Great! Long passwords made from random words are often easier to remember and harder for others to guess."
      },
      {
        type: "scenario",
        title: "Scenario 1",
        text: "Margaret uses the password: 123456. Is this a good password?",
        options: ["Yes", "No"],
        correctIndex: 1,
        explanation: "It is one of the most commonly guessed passwords."
      },
      {
        type: "scenario",
        title: "Scenario 2",
        text: "Robert uses the same password for his email, bank, and shopping websites. Is this the safest choice?",
        options: ["Yes", "No"],
        correctIndex: 1,
        explanation: "If one account is hacked, the others could also be at risk."
      },
      {
        type: "scenario",
        title: "Scenario 3",
        text: "Linda creates this password: Blue!River28Coffee. Is this a strong password?",
        options: ["Yes", "No"],
        correctIndex: 0,
        explanation: "It is long, unique, and difficult to guess."
      },
      {
        type: "learn",
        heading: "Quick Tip",
        text: "You don't have to memorize dozens of complicated passwords. Next lesson, you'll learn about password managers, which can safely store your passwords for you."
      },
      {
        type: "sort",
        title: "Safe or Unsafe?",
        prompt: "Drag each habit into the correct box.",
        categories: [
          {
            label: "Safe Password Habits",
            items: [
              "Use a different password for each important account",
              "Create long passwords",
              "Keep your passwords private",
              "Change a password if you think someone else knows it"
            ]
          },
          {
            label: "Unsafe Password Habits",
            items: [
              "Use your birthday",
              "Reuse the same password everywhere",
              "Share passwords with friends",
              "Write passwords on a sticky note attached to your computer"
            ]
          }
        ]
      },
      {
        type: "truefalse",
        title: "True or False?",
        questions: [
          { text: "A strong password should be long.", answer: true },
          { text: "It's okay to use the same password for every account.", answer: false },
          { text: "Passwords should be kept private.", answer: true },
          { text: "\"password123\" is a strong password.", answer: false }
        ]
      },
      {
        type: "learn",
        heading: "Remember",
        text: "Strong passwords should be long, unique, hard to guess, and different for each important account. Never share your passwords with someone who contacts you unexpectedly, even if they claim to be from your bank or another company."
      }
    ],
    quiz: [
      { question: "What is a password used for?", options: ["Sending emails", "Connecting to Wi-Fi", "Protecting your account", "Browsing the internet"], correctIndex: 2 },
      { question: "Which password is the strongest?", options: ["123456", "Linda1955", "password", "Forest!42Coffee"], correctIndex: 3 },
      { question: "True or False: You should use the same password for all of your accounts.", options: ["True", "False"], correctIndex: 1 },
      { question: "A ______ helps protect your online account.", options: ["Password", "Browser", "Camera"], correctIndex: 0 },
      { question: "Why is it important to use different passwords for different accounts?", options: ["It makes your phone faster.", "It saves battery life.", "If one password is stolen, your other accounts are better protected.", "It lets you use more apps."], correctIndex: 2 },
      { question: "Which of these should you avoid using in a password?", options: ["A random word", "Your birthday, your name, \"123456\", or \"password\""], correctIndex: 1 },
      { question: "A friend asks for your email password so they can \"check something for you.\" What should you do?", options: ["Share it because they're your friend.", "Text them the password.", "Keep your password private and log in yourself if needed.", "Post it in a group chat."], correctIndex: 2 },
      { question: "What makes a password strong?", options: ["Short and simple", "Long, unique, difficult to guess, and uses a mix of letters, numbers, and symbols"], correctIndex: 1 }
    ],
    complete: {
      title: "Great Job!",
      subtitle: "You completed Lesson 1: Strong Passwords!",
      learned: [
        "Create stronger passwords.",
        "Avoid common password mistakes.",
        "Protect your accounts by using unique passwords.",
        "Understand why strong passwords are one of the most important parts of online safety."
      ],
      next: "What Is a Password Manager?"
    }
  },

  // ============================================================
  // LESSON 2.2
  // ============================================================
  {
    id: "password-managers",
    track: "literacy",
    phase: 2,
    order: 11,
    lessonNumber: "2.2",
    title: "What is a Password Manager?",
    badge: "Password Organizer",
    xp: 20,
    goals: [
      "Explain what a password manager is.",
      "Understand why password managers are useful.",
      "Know how a password manager works.",
      "Recognize that a password manager is safer than reusing passwords or writing them down."
    ],
    blocks: [
      {
        type: "learn",
        heading: "What is a Password Manager?",
        text: "A password manager is a secure app that stores your passwords in one protected place. Instead of remembering dozens of passwords, you only need to remember one strong master password. The password manager securely stores the rest.\n\nThink of it like a locked key cabinet. Your passwords are the keys. The password manager is the locked cabinet. The master password is the only key to open it."
      },
      {
        type: "learn",
        heading: "Why Use a Password Manager?",
        text: "Many people have email, online banking, shopping websites, social media, and medical portals. Each account should have a different password. A password manager helps by:",
        bullets: [
          "Remembering your passwords",
          "Creating strong passwords",
          "Filling in passwords for you",
          "Keeping passwords organized"
        ]
      },
      {
        type: "learn",
        heading: "Common Mistakes",
        text: "Many people:",
        bullets: [
          "Use the same password everywhere",
          "Keep passwords in a notebook",
          "Save passwords on sticky notes",
          "Use easy passwords they won't forget"
        ],
        footer: "A password manager is much safer."
      },
      {
        type: "choice",
        title: "Which Password Storage Method Is Safest?",
        text: "Choose the safest option.",
        options: [
          "Use the same password for every account.",
          "Write all passwords on a sticky note next to your computer.",
          "Save passwords in a text document called \"Passwords.\"",
          "Use a trusted password manager with one strong master password."
        ],
        correctIndex: 3,
        explanation: "Excellent! Password managers securely store your passwords and help create unique passwords for every account."
      },
      {
        type: "flashcards",
        title: "Flashcards",
        cards: [
          { front: "Password Manager", back: "A secure app that stores and protects your passwords." },
          { front: "Master Password", back: "The one password you remember to unlock your password manager." },
          { front: "Vault", back: "The secure place inside a password manager where passwords are stored." },
          { front: "AutoFill", back: "A feature that automatically enters your saved username and password." },
          { front: "Unique Password", back: "A different password for each account." }
        ]
      },
      {
        type: "match",
        title: "Match the Word",
        pairs: [
          { word: "Password Manager", match: "Stores passwords securely" },
          { word: "Master Password", match: "Unlocks the password manager" },
          { word: "Vault", match: "Secure storage area" },
          { word: "AutoFill", match: "Enters saved passwords automatically" },
          { word: "Unique Password", match: "Different password for each account" }
        ]
      },
      {
        type: "truefalse",
        title: "Safe or Unsafe?",
        variant: "safeunsafe",
        questions: [
          { text: "Using the same password for your email and bank account.", answer: false, explanation: "If someone discovers one password, they could access both accounts." },
          { text: "Keeping passwords in a trusted password manager.", answer: true, explanation: "Password managers are designed to securely store your passwords." },
          { text: "Writing passwords on a sticky note attached to your monitor.", answer: false, explanation: "Anyone nearby could easily see your passwords." },
          { text: "Using a different strong password for every account.", answer: true, explanation: "This is one of the best ways to protect your online accounts." }
        ]
      },
      {
        type: "scenario",
        title: "Scenario 1",
        text: "Margaret has 18 online accounts. She can't remember all of her passwords. What should she do?",
        options: [
          "Use \"Password123\" for every account.",
          "Write every password on a sticky note.",
          "Use a trusted password manager to store unique passwords.",
          "Stop using passwords altogether."
        ],
        correctIndex: 2,
        explanation: "Password managers help organize many passwords without needing to memorize each one."
      },
      {
        type: "scenario",
        title: "Scenario 2",
        text: "Robert creates one strong password and uses it for his email, bank, shopping, and Facebook. Is this the safest choice?",
        options: ["Yes", "No"],
        correctIndex: 1,
        explanation: "Even a strong password shouldn't be reused. If one website has a security breach, scammers may try that same password on your other accounts."
      },
      {
        type: "scenario",
        title: "Scenario 3",
        text: "Linda forgets one of her shopping website passwords. Her password manager has it saved. Should she use it?",
        options: ["Yes", "No"],
        correctIndex: 0,
        explanation: "That's one of the main benefits of a password manager."
      },
      {
        type: "learn",
        heading: "Quick Tip",
        text: "You only have to remember one strong master password. Make it long, unique, and memorable. Never share your master password with anyone."
      },
      {
        type: "sort",
        title: "What Belongs in the Password Manager?",
        prompt: "Drag each item into the correct box.",
        categories: [
          {
            label: "Store in Password Manager",
            items: ["Email password", "Banking password", "Shopping website password", "Medical portal password", "Social media password"]
          },
          {
            label: "Do NOT Store Like This",
            items: ["Sticky note on your monitor", "Notebook left on your desk", "Text file named \"Passwords\"", "Shared with a friend"]
          }
        ]
      },
      {
        type: "truefalse",
        title: "True or False?",
        questions: [
          { text: "A password manager helps remember your passwords.", answer: true, explanation: "Remembering your passwords is one of the main reasons people use password managers." },
          { text: "It's safest to use the same password for every account.", answer: false, explanation: "Using different passwords helps protect your accounts if one password is stolen." },
          { text: "You should create one strong master password.", answer: true, explanation: "The master password protects everything inside your password manager, so it should be strong and unique." },
          { text: "Writing passwords on sticky notes is more secure than using a password manager.", answer: false, explanation: "Sticky notes can be easily seen by other people. A trusted password manager encrypts and protects your passwords." }
        ]
      },
      {
        type: "learn",
        heading: "Remember",
        text: "A password manager helps you store passwords securely, create strong passwords, remember many passwords, and use a different password for every account. Protect your master password and never share it with anyone."
      }
    ],
    quiz: [
      { question: "What is a password manager?", options: ["A notebook for passwords", "A search engine", "A secure app that stores your passwords", "A social media account"], correctIndex: 2 },
      { question: "How many passwords do you usually need to remember when using a password manager?", options: ["All of them", "Five", "Ten", "One master password"], correctIndex: 3 },
      { question: "True or False: A password manager can help create strong passwords.", options: ["True", "False"], correctIndex: 0 },
      { question: "The password that unlocks your password manager is called the ______.", options: ["Master Password", "Notebook", "Phone Number"], correctIndex: 0 },
      { question: "Which is the safest way to store passwords?", options: ["Sticky note", "Text file on your computer", "Using the same password everywhere", "Password manager"], correctIndex: 3 },
      { question: "Which of these should have its own unique password?", options: ["Only your email", "Email, online banking, shopping websites, and medical portals"], correctIndex: 1 },
      { question: "Your friend asks for your master password so they can \"help organize your accounts.\" What should you do?", options: ["Share it.", "Write it on a sticky note for them.", "Keep it private.", "Text it to them."], correctIndex: 2 },
      { question: "Why do people use password managers?", options: ["Only to save time", "To remember passwords, create strong ones, stay organized, and avoid reusing passwords"], correctIndex: 1 }
    ],
    complete: {
      title: "Great Job!",
      subtitle: "You completed Lesson 2: What is a Password Manager?",
      learned: [
        "Explain what a password manager is.",
        "Understand why it is safer than reusing passwords.",
        "Use one strong master password to protect many accounts.",
        "Keep your online accounts more secure."
      ],
      next: "What is Two-Factor Authentication (2FA)?"
    }
  },

  // ============================================================
  // LESSON 2.3
  // ============================================================
  {
    id: "two-factor-auth",
    track: "literacy",
    phase: 2,
    order: 12,
    lessonNumber: "2.3",
    title: "What is Two-Factor Authentication (2FA)?",
    badge: "Security Shield",
    xp: 20,
    goals: [
      "Explain what Two-Factor Authentication (2FA) is.",
      "Understand why 2FA adds extra security.",
      "Recognize common types of 2FA.",
      "Know how to use 2FA safely and avoid common scams."
    ],
    blocks: [
      {
        type: "learn",
        heading: "What is Two-Factor Authentication?",
        text: "Two-Factor Authentication (2FA) is an extra layer of security that helps protect your online accounts. Normally you sign in using one thing: your password. With 2FA, you need two things: something you know (your password) and something you have (your phone or another trusted device).\n\nEven if someone steals your password, they usually can't sign in without the second step. Think of it like entering a locked building. First you unlock the front door with a key. Then a security guard asks to see your ID."
      },
      {
        type: "learn",
        heading: "Common Types of 2FA",
        text: "Many websites and apps use one of these methods:",
        bullets: [
          "Text Message Code (SMS) - a 6-digit code is sent to your phone",
          "Email Code - a code is sent to your email",
          "Authenticator App - an app creates a new security code every 30 seconds",
          "Fingerprint or Face ID - some devices use your fingerprint or face as the second step"
        ]
      },
      {
        type: "learn",
        heading: "Why Is 2FA Helpful?",
        text: "Imagine someone learns your password. Without 2FA, they can log in. With 2FA, they still need the security code sent to your phone or trusted device. 2FA makes it much harder for someone else to access your account."
      },
      {
        type: "multiselect",
        title: "Which of These Are Examples of 2FA?",
        prompt: "Tap every example.",
        options: [
          { text: "Receiving a 6-digit text message code", correct: true },
          { text: "Using an authenticator app", correct: true },
          { text: "Approving a sign-in on your phone", correct: true },
          { text: "Using Face ID after entering your password", correct: true },
          { text: "Using only a password", correct: false },
          { text: "Typing your username", correct: false }
        ],
        feedback: "Excellent! All of these add a second step to verify it's really you."
      },
      {
        type: "flashcards",
        title: "Flashcards",
        cards: [
          { front: "Two-Factor Authentication (2FA)", back: "An extra security step after entering your password." },
          { front: "Verification Code", back: "A temporary code used to confirm your identity." },
          { front: "Authenticator App", back: "An app that creates temporary security codes." },
          { front: "Face ID", back: "Uses your face to help verify your identity." },
          { front: "Fingerprint", back: "Use your fingerprint as a security check." }
        ]
      },
      {
        type: "match",
        title: "Match the Word",
        pairs: [
          { word: "2FA", match: "Extra security step" },
          { word: "Verification Code", match: "Temporary number used to sign in" },
          { word: "Authenticator App", match: "Creates security codes" },
          { word: "Face ID", match: "Uses your face to verify identity" },
          { word: "Fingerprint", match: "Uses your fingerprint to verify identity" }
        ]
      },
      {
        type: "fillblank",
        title: "Fill in the Blank",
        wordBank: ["2FA", "Verification Code", "Phone", "Password"],
        questions: [
          { text: "______ adds an extra layer of security to your account.", answer: "2FA" },
          { text: "After entering your password, you may receive a ______ on your phone.", answer: "Verification Code" },
          { text: "A text message with a login code is usually sent to your ______.", answer: "Phone" }
        ]
      },
      {
        type: "scenario",
        title: "Scenario 1",
        text: "Margaret signs into her email. After entering her password, her phone receives a 6-digit code. Should she enter it?",
        options: ["Yes", "No"],
        correctIndex: 0,
        explanation: "If you are signing in, it's normal to enter the code."
      },
      {
        type: "scenario",
        title: "Scenario 2",
        text: "Robert receives a text: \"Your verification code is 483921.\" A few seconds later, someone calls saying: \"I'm from your bank. Please read me the code.\" What should Robert do?",
        options: [
          "Read them the code.",
          "Text them the code.",
          "Hang up and do not share the code.",
          "Give them the code if they sound friendly."
        ],
        correctIndex: 2,
        explanation: "Scammers often pretend to be banks or companies to trick people into sharing verification codes. Real companies will not ask for your code this way."
      },
      {
        type: "scenario",
        title: "Scenario 3",
        text: "Linda accidentally gives someone her password. She has 2FA turned on. Does 2FA help protect her account?",
        options: ["Yes", "No"],
        correctIndex: 0,
        explanation: "The scammer would usually still need the second verification step."
      },
      {
        type: "learn",
        heading: "Quick Tip",
        text: "A verification code is like the key to your front door, but it only works for a short time. Never share verification codes, one-time passwords, or security codes. Even if someone says they're from your bank, Amazon, Apple, or the police. Real organizations generally won't ask you to read a one-time verification code over the phone or by text."
      },
      {
        type: "sort",
        title: "Safe or Unsafe?",
        prompt: "Drag each action into the correct box.",
        categories: [
          {
            label: "Safe",
            items: [
              "Turn on 2FA for important accounts",
              "Keep your phone with you",
              "Enter your code only when you are signing in",
              "Contact a company using its official website if something seems suspicious"
            ]
          },
          {
            label: "Unsafe",
            items: [
              "Read your verification code to a stranger",
              "Text your code to someone who calls you unexpectedly",
              "Ignore suspicious login alerts",
              "Share screenshots showing your verification code"
            ]
          }
        ]
      },
      {
        type: "choice",
        title: "Who Should Receive the Verification Code?",
        text: "You are signing into your email. Who should enter the code?",
        options: ["You", "Your neighbor", "A stranger who calls you", "Someone claiming to be tech support"],
        correctIndex: 0,
        explanation: "Only you should use the verification code when signing into your own account."
      },
      {
        type: "choice",
        title: "Who Should Receive the Verification Code?",
        text: "Someone texts: \"I'm locked out of your account. Please send me the code you just received.\"",
        options: ["Send it.", "Ask if they promise to delete it.", "Do not send it.", "Post it online."],
        correctIndex: 2,
        explanation: "This is a common scam. Never share one-time security codes."
      },
      {
        type: "choice",
        title: "Who Should Receive the Verification Code?",
        text: "You receive a login code, but you weren't trying to sign in. What should you do?",
        options: [
          "Enter the code anyway.",
          "Share it with a friend.",
          "Do not use or share the code. If you're concerned, change your password and check your account activity.",
          "Delete your email account immediately."
        ],
        correctIndex: 2,
        explanation: "An unexpected code may mean someone is trying to access your account."
      },
      {
        type: "learn",
        heading: "Remember",
        text: "2FA helps protect your accounts by requiring your password plus a second security step. Turn on 2FA whenever it's available. Keep your phone secure. Never share verification codes."
      }
    ],
    quiz: [
      { question: "What does 2FA do?", options: ["Makes your phone charge faster.", "Changes your password.", "Adds an extra security step when signing in.", "Blocks all scam emails."], correctIndex: 2 },
      { question: "Which is an example of 2FA?", options: ["Typing your username", "Creating a password", "Entering a 6-digit code sent to your phone", "Opening your web browser"], correctIndex: 2 },
      { question: "True or False: You should share your verification code if someone says they work for your bank.", options: ["True", "False"], correctIndex: 1 },
      { question: "______ adds an extra layer of protection to your account.", options: ["2FA", "Camera", "Browser"], correctIndex: 0 },
      { question: "Why is 2FA helpful?", options: ["It replaces your password.", "It makes your internet faster.", "It helps protect your account even if someone learns your password.", "It prevents every online scam."], correctIndex: 2 },
      { question: "Which accounts should have 2FA enabled if it's available?", options: ["Only social media", "Email, banking, social media, and medical portals"], correctIndex: 1 },
      { question: "You receive a verification code but aren't signing in. What should you do?", options: ["Share it with the caller.", "Enter it anyway.", "Do not share or use the code. Check your account if you're concerned.", "Ignore it and post it online."], correctIndex: 2 },
      { question: "Two-factor authentication uses...", options: ["Only your username", "Your password plus a second security step such as a code or your fingerprint"], correctIndex: 1 }
    ],
    complete: {
      title: "Great Job!",
      subtitle: "You completed Lesson 3: Two-Factor Authentication (2FA)!",
      learned: [
        "Explain what 2FA is.",
        "Use verification codes safely.",
        "Recognize common verification code scams.",
        "Add an extra layer of protection to your important accounts."
      ],
      next: "Software Updates"
    }
  },

  // ============================================================
  // LESSON 2.4
  // ============================================================
  {
    id: "software-updates",
    track: "literacy",
    phase: 2,
    order: 13,
    lessonNumber: "2.4",
    title: "Software Updates",
    badge: "Update Defender",
    xp: 20,
    goals: [
      "Explain what a software update is.",
      "Understand why software updates are important.",
      "Know when and how to install updates safely.",
      "Recognize fake update scams."
    ],
    blocks: [
      {
        type: "learn",
        heading: "What Is a Software Update?",
        text: "A software update is a new version of a program or your device's operating system. Updates can fix security problems, fix bugs, improve performance, and add new features.\n\nThink of a software update like taking your car in for maintenance. Your car still works, but regular maintenance helps keep it safe and running well. Your phone, tablet, and computer need updates for the same reason."
      },
      {
        type: "learn",
        heading: "What Gets Updated?",
        text: "Many things on your device receive updates. Examples include:",
        bullets: [
          "Your phone's operating system (iPhone or Android)",
          "Your web browser",
          "Email apps",
          "Banking apps",
          "Camera apps",
          "Games"
        ],
        footer: "Almost every app you install will occasionally receive updates."
      },
      {
        type: "learn",
        heading: "Why Are Updates Important?",
        text: "Imagine your front door has a broken lock. Until it's repaired, someone could get inside. Software sometimes has security problems that hackers can take advantage of. Updates often repair these problems before they're used against you. Waiting too long to update can leave your device less secure."
      },
      {
        type: "multiselect",
        title: "Why Do Software Updates Matter?",
        prompt: "Tap every correct answer.",
        options: [
          { text: "They fix security problems.", correct: true },
          { text: "They repair bugs.", correct: true },
          { text: "They improve performance.", correct: true },
          { text: "They may add new features.", correct: true },
          { text: "They permanently delete your photos.", correct: false },
          { text: "They let strangers access your phone.", correct: false }
        ],
        feedback: "Excellent! Updates help protect your device and improve how it works."
      },
      {
        type: "learn",
        heading: "How Should You Install Updates?",
        text: "The safest way is to open your device's Settings, or use the official App Store or Google Play Store. Avoid downloading updates from random websites or pop-up advertisements."
      },
      {
        type: "learn",
        heading: "Fake Update Scams",
        text: "Sometimes you'll see a message like: \"YOUR COMPUTER IS INFECTED! CLICK HERE TO UPDATE NOW!\" Many of these pop-ups are scams. Instead: don't click the pop-up, close the browser if possible, and update your device using its built-in settings or official app store."
      },
      {
        type: "flashcards",
        title: "Flashcards",
        cards: [
          { front: "Software Update", back: "A new version of software that fixes problems and improves security." },
          { front: "Bug", back: "A problem or error in software." },
          { front: "Security Update", back: "An update that fixes security weaknesses." },
          { front: "Operating System", back: "The main software that runs your phone, tablet, or computer." },
          { front: "Official App Store", back: "A trusted place to safely download apps and updates." }
        ]
      },
      {
        type: "match",
        title: "Match the Word",
        pairs: [
          { word: "Software Update", match: "Improves software and fixes problems" },
          { word: "Bug", match: "A software problem" },
          { word: "Security Update", match: "Helps protect your device" },
          { word: "Operating System", match: "Main software on your device" },
          { word: "Official App Store", match: "Safe place to update apps" }
        ]
      },
      {
        type: "fillblank",
        title: "Fill in the Blank",
        wordBank: ["Update", "Security", "Settings", "Bug"],
        questions: [
          { text: "A software ______ fixes problems and helps protect your device.", answer: "Update" },
          { text: "Many updates repair ______ problems.", answer: "Security" },
          { text: "The safest place to check for phone updates is your device's ______.", answer: "Settings" }
        ]
      },
      {
        type: "scenario",
        title: "Scenario 1",
        text: "Margaret's iPhone says: \"Software Update Available.\" What should she do?",
        options: [
          "Ignore it forever.",
          "Delete the notification immediately.",
          "Install it when she has time, her battery is charged, and she's connected to a trusted Wi-Fi network.",
          "Wait several years."
        ],
        correctIndex: 2,
        explanation: "Installing updates within a reasonable time helps keep your device secure."
      },
      {
        type: "scenario",
        title: "Scenario 2",
        text: "Robert sees this while browsing: \"YOUR COMPUTER HAS 18 VIRUSES! CLICK HERE TO UPDATE NOW!\" What should he do?",
        options: [
          "Click the message.",
          "Enter his credit card information.",
          "Close the pop-up and update through his computer's official settings if needed.",
          "Download the program immediately."
        ],
        correctIndex: 2,
        explanation: "Many alarming pop-ups are scams designed to trick you into downloading harmful software or paying for fake services."
      },
      {
        type: "scenario",
        title: "Scenario 3",
        text: "Linda opens the App Store and sees that her banking app has an update available. Should she install it?",
        options: ["Yes", "No"],
        correctIndex: 0,
        explanation: "Banking app updates often include important security improvements."
      },
      {
        type: "learn",
        heading: "Quick Tip",
        text: "Before updating: make sure your device has enough battery (or plug it in), use a trusted Wi-Fi connection if the update is large, and consider backing up important data regularly, especially before major operating system updates."
      },
      {
        type: "sort",
        title: "Safe or Unsafe?",
        prompt: "Drag each action into the correct box.",
        categories: [
          {
            label: "Safe",
            items: [
              "Update through Settings",
              "Update apps from the official App Store or Google Play Store",
              "Install security updates when available",
              "Read update notifications from your device"
            ]
          },
          {
            label: "Unsafe",
            items: [
              "Click update pop-ups on random websites",
              "Ignore updates for months",
              "Download \"update tools\" from unknown websites",
              "Enter payment information because a pop-up says your device is infected"
            ]
          }
        ]
      },
      {
        type: "truefalse",
        title: "Which Update Is Safe?",
        variant: "safeunsafe",
        questions: [
          { text: "Your phone says \"iOS Update Available\" inside Settings.", answer: true, explanation: "Updates shown in your device's Settings are the normal way to update your operating system." },
          { text: "A flashing website says \"Click here immediately to update your computer!\"", answer: false, explanation: "Random website pop-ups are often scams. Close the page instead." },
          { text: "Google Play Store says \"Update Available\" for your weather app.", answer: true, explanation: "Updates from the official app store are generally safe." },
          { text: "Someone emails you an attachment called ComputerUpdate.exe", answer: false, explanation: "Never install software updates from unexpected email attachments." }
        ]
      },
      {
        type: "learn",
        heading: "Remember",
        text: "Software updates fix security problems, repair bugs, improve performance, and add useful features. Always update through your device's Settings, the official App Store, or Google Play Store. Never trust random pop-up ads, unknown download websites, or email attachments claiming to be software updates."
      }
    ],
    quiz: [
      { question: "What is a software update?", options: ["A new phone", "A password", "A new version of software that fixes problems and improves security", "A social media account"], correctIndex: 2 },
      { question: "Why are software updates important?", options: ["They only change colors", "They fix security problems, repair bugs, improve performance, and may add new features"], correctIndex: 1 },
      { question: "True or False: You should install updates from random pop-up ads on websites.", options: ["True", "False"], correctIndex: 1 },
      { question: "The safest place to update your phone's operating system is ______.", options: ["Settings", "Camera", "Television"], correctIndex: 0 },
      { question: "Where should you update your apps?", options: ["Random websites", "Email attachments", "Official App Store or Google Play Store", "Social media links"], correctIndex: 2 },
      { question: "A website says, \"Your computer is infected! Click here now!\" What should you do?", options: ["Click the button immediately.", "Enter your payment information.", "Close the pop-up and check for updates using your device's official tools.", "Download the file from the website."], correctIndex: 2 },
      { question: "Which app should you keep updated?", options: ["Only games", "Banking app, email app, web browser, and phone operating system"], correctIndex: 1 },
      { question: "When is a good time to install a large update?", options: ["When your battery is almost empty.", "While using an unknown public computer.", "When your battery is charged (or plugged in) and you're connected to a trusted Wi-Fi network.", "Only after clicking a pop-up ad."], correctIndex: 2 }
    ],
    complete: {
      title: "Great Job!",
      subtitle: "You completed Lesson 4: Software Updates!",
      learned: [
        "Explain what software updates are.",
        "Understand why updates protect your device.",
        "Install updates safely through official sources.",
        "Recognize common fake update scams."
      ],
      next: "Public Wi-Fi Safety"
    }
  },

  // ============================================================
  // LESSON 2.5
  // ============================================================
  {
    id: "public-wifi",
    track: "literacy",
    phase: 2,
    order: 14,
    lessonNumber: "2.5",
    title: "Public Wi-Fi Safety",
    badge: "Safe Connection Explorer",
    xp: 20,
    goals: [
      "Explain what public Wi-Fi is.",
      "Recognize the risks of public Wi-Fi.",
      "Connect to public Wi-Fi safely.",
      "Know what activities to avoid on public Wi-Fi."
    ],
    blocks: [
      {
        type: "learn",
        heading: "What Is Public Wi-Fi?",
        text: "Public Wi-Fi is internet that anyone can use in public places. You can often find it at coffee shops, airports, libraries, hotels, hospitals, and restaurants. Public Wi-Fi is convenient, but because many people use the same network, it may not be as secure as your home Wi-Fi."
      },
      {
        type: "learn",
        heading: "What Are the Risks?",
        text: "When using public Wi-Fi:",
        bullets: [
          "Someone on the same network may try to steal information if the network isn't secure",
          "Scammers sometimes create fake Wi-Fi networks that look real",
          "Your information may be less protected if you're using websites that aren't secure"
        ],
        footer: "This doesn't mean you should never use public Wi-Fi. It means you should use it carefully."
      },
      {
        type: "learn",
        heading: "How Can You Stay Safe?",
        text: "Here are some simple ways to protect yourself:",
        bullets: [
          "Ask an employee for the official Wi-Fi name",
          "Make sure the network name matches exactly",
          "Visit websites that use https:// (look for the lock icon)",
          "Turn on Two-Factor Authentication (2FA) for important accounts",
          "Consider using a VPN, especially when handling sensitive information"
        ]
      },
      {
        type: "learn",
        heading: "What Should You Avoid?",
        text: "It's best to avoid doing these things on public Wi-Fi whenever possible:",
        bullets: [
          "Online banking",
          "Sending money",
          "Making large purchases",
          "Entering your Social Security number",
          "Changing important passwords"
        ],
        footer: "If you need to do these activities, it's generally safer to wait until you're on a trusted network or use your phone's cellular data if available."
      },
      {
        type: "multiselect",
        title: "Which Activities Are Safer on Public Wi-Fi?",
        prompt: "Tap every activity that is generally okay to do on public Wi-Fi.",
        options: [
          { text: "Read the news", correct: true },
          { text: "Check the weather", correct: true },
          { text: "Watch YouTube", correct: true },
          { text: "Read recipes", correct: true },
          { text: "Log into your online bank", correct: false },
          { text: "Enter your credit card number", correct: false },
          { text: "File your taxes", correct: false },
          { text: "Change your banking password", correct: false }
        ],
        feedback: "Excellent! Reading websites and watching videos are usually lower-risk activities than accessing sensitive financial information."
      },
      {
        type: "flashcards",
        title: "Flashcards",
        cards: [
          { front: "Public Wi-Fi", back: "Internet that many people can use in public places." },
          { front: "Secure Website", back: "A website that uses https:// and shows a lock icon." },
          { front: "Fake Wi-Fi Network", back: "A wireless network created by scammers to trick people into connecting." },
          { front: "VPN", back: "A tool that helps create a more private internet connection." },
          { front: "Official Network", back: "The real Wi-Fi network provided by the business or organization." }
        ]
      },
      {
        type: "match",
        title: "Match the Word",
        pairs: [
          { word: "Public Wi-Fi", match: "Internet shared by many people" },
          { word: "VPN", match: "Adds privacy to your connection" },
          { word: "HTTPS", match: "A secure website connection" },
          { word: "Fake Network", match: "Wi-Fi created by scammers" },
          { word: "Official Network", match: "The real Wi-Fi provided by a business" }
        ]
      },
      {
        type: "fillblank",
        title: "Fill in the Blank",
        wordBank: ["Employee", "VPN", "HTTPS", "Public Wi-Fi"],
        questions: [
          { text: "Before connecting to Wi-Fi at a coffee shop, ask an ______ for the official network name.", answer: "Employee" },
          { text: "A ______ can add extra privacy while using public Wi-Fi.", answer: "VPN" },
          { text: "A secure website usually begins with ______.", answer: "HTTPS" }
        ]
      },
      {
        type: "scenario",
        title: "Scenario 1",
        text: "Margaret is at a coffee shop. She sees these Wi-Fi networks: CoffeeHouse Guest, CoffeeHouse_Free_2026, Free Internet, CoffeeHouse Staff. What should she do?",
        options: [
          "Connect to the strongest signal.",
          "Connect to \"Free Internet.\"",
          "Ask an employee which network is the official guest Wi-Fi.",
          "Connect to whichever network has no password."
        ],
        correctIndex: 2,
        explanation: "Scammers sometimes create fake Wi-Fi names that look real. Always verify the official network."
      },
      {
        type: "scenario",
        title: "Scenario 2",
        text: "Robert is waiting for his flight at the airport. He wants to check his bank account. Should he?",
        options: [
          "Yes, airport Wi-Fi is always safe.",
          "Yes, because it has a password.",
          "Wait until he's on a trusted network or use his phone's cellular data if available.",
          "Share his bank password with airport staff."
        ],
        correctIndex: 2,
        explanation: "Even if public Wi-Fi requires a password, it's still shared with many people. Sensitive financial tasks are safer on trusted networks."
      },
      {
        type: "scenario",
        title: "Scenario 3",
        text: "Linda wants to read today's news while using hotel Wi-Fi. Is that generally okay?",
        options: ["Yes", "No"],
        correctIndex: 0,
        explanation: "Reading the news is generally a lower-risk activity than banking or shopping."
      },
      {
        type: "learn",
        heading: "Quick Tip",
        text: "Before entering passwords or payment information online, look for https:// and the lock icon in your browser. These signs indicate that your connection to the website is encrypted, though you should still make sure you're on the correct website."
      },
      {
        type: "sort",
        title: "Safe or Unsafe?",
        prompt: "Drag each choice into the correct box.",
        categories: [
          {
            label: "Safer Choices",
            items: ["Ask for the official Wi-Fi name", "Check for https://", "Use a VPN if available", "Browse news or weather websites"]
          },
          {
            label: "Riskier Choices",
            items: ["Enter your bank password", "Shop on unfamiliar websites", "Connect to random Wi-Fi names", "Ignore browser security warnings"]
          }
        ]
      },
      {
        type: "choice",
        title: "Which Wi-Fi Would You Choose?",
        text: "The cashier says: \"Our Wi-Fi is called CityCafe Guest.\" Which network should you connect to?",
        options: ["CityCafe_Free", "Free Coffee Internet", "CityCafe Guest", "Public Wi-Fi Fast"],
        correctIndex: 2,
        explanation: "Always connect to the exact Wi-Fi name given by the business."
      },
      {
        type: "choice",
        title: "Which Wi-Fi Would You Choose?",
        text: "You want to pay your credit card bill. You're connected to airport Wi-Fi. What should you do?",
        options: [
          "Pay it immediately.",
          "Enter your Social Security number.",
          "Wait until you're on a trusted network or use cellular data if available.",
          "Use the first Wi-Fi network you see."
        ],
        correctIndex: 2
      },
      {
        type: "choice",
        title: "Which Wi-Fi Would You Choose?",
        text: "A website asks for your credit card number. You notice the address starts with http:// and there is no lock icon. What should you do?",
        options: [
          "Enter your information anyway.",
          "Ignore the missing lock.",
          "Do not enter your information until you're sure you're on the correct secure website.",
          "Send your information by email instead."
        ],
        correctIndex: 2
      },
      {
        type: "choice",
        title: "Which Wi-Fi Would You Choose?",
        text: "You receive a pop-up saying: \"Download this security tool before using our Wi-Fi.\"",
        options: [
          "Download it immediately.",
          "Enter your credit card.",
          "Close the pop-up. If you're unsure, ask an employee whether it's legitimate.",
          "Give the app permission to access everything."
        ],
        correctIndex: 2
      },
      {
        type: "learn",
        heading: "Remember",
        text: "Public Wi-Fi is useful, but it requires extra caution. Ask for the official network. Look for https:// and the lock. Consider using a VPN. Turn on 2FA. Avoid banking, entering credit card information, and sharing sensitive personal information whenever possible on public Wi-Fi."
      }
    ],
    quiz: [
      { question: "What is public Wi-Fi?", options: ["Internet only your family can use.", "Internet available for many people in public places.", "A type of phone.", "A password manager."], correctIndex: 1 },
      { question: "Before connecting to a business's Wi-Fi, what should you do?", options: ["Pick the network with the strongest signal.", "Choose the first network you see.", "Ask an employee for the official Wi-Fi name.", "Connect without checking."], correctIndex: 2 },
      { question: "True or False: It's a good idea to log into your online bank whenever you're using public Wi-Fi.", options: ["True", "False"], correctIndex: 1 },
      { question: "Secure websites usually begin with ______.", options: ["HTTPS", "Camera", "Browser"], correctIndex: 0 },
      { question: "Which activity is generally lower risk on public Wi-Fi?", options: ["Online banking", "Entering your Social Security number", "Reading the news", "Changing your banking password"], correctIndex: 2 },
      { question: "What symbol usually appears next to a secure website?", options: ["A camera", "A heart", "A lock", "A music note"], correctIndex: 2 },
      { question: "Which of these help keep you safer on public Wi-Fi?", options: ["Connecting to any open network", "Asking for the official name, using a VPN, looking for https://, and turning on 2FA"], correctIndex: 1 },
      { question: "You connect to hotel Wi-Fi and receive a pop-up asking you to install a \"security app.\" What should you do?", options: ["Install it immediately.", "Enter your credit card to continue.", "Close the pop-up and ask hotel staff if it's legitimate before installing anything.", "Ignore the hotel staff and trust the pop-up."], correctIndex: 2 }
    ],
    complete: {
      title: "Great Job!",
      subtitle: "You completed Lesson 5: Public Wi-Fi Safety!",
      learned: [
        "Use public Wi-Fi more safely.",
        "Avoid fake Wi-Fi networks.",
        "Look for secure websites.",
        "Recognize which activities are better saved for a trusted network."
      ],
      next: "Safe Downloading"
    }
  },

  // ============================================================
  // LESSON 2.6
  // ============================================================
  {
    id: "safe-downloading",
    track: "literacy",
    phase: 2,
    order: 15,
    lessonNumber: "2.6",
    title: "Safe Downloading",
    badge: "Smart Downloader",
    xp: 20,
    goals: [
      "Explain what downloading means.",
      "Know where it is safe to download apps and files.",
      "Recognize warning signs of unsafe downloads.",
      "Avoid malware and fake download buttons."
    ],
    blocks: [
      {
        type: "learn",
        heading: "What Is Downloading?",
        text: "Downloading means copying something from the internet onto your device. People download apps, documents, photos, music, videos, and PDFs. Most downloads are safe, but some can contain harmful software called malware. That's why it's important to download only from trusted sources."
      },
      {
        type: "learn",
        heading: "What Is Malware?",
        text: "Malware is harmful software designed to damage your device or steal your information. Malware can:",
        bullets: [
          "Steal passwords",
          "Slow down your computer",
          "Show unwanted pop-up ads",
          "Lock your files for money (ransomware)",
          "Spy on your activity"
        ],
        footer: "The good news is that you can reduce your risk by downloading carefully."
      },
      {
        type: "learn",
        heading: "Where Is It Safe to Download?",
        text: "The safest places include the Apple App Store, Google Play Store, and official company websites. For example: download Zoom from zoom.us, Adobe Acrobat from adobe.com, Microsoft Word from microsoft.com. Avoid downloading software from random websites you've never heard of."
      },
      {
        type: "learn",
        heading: "Warning Signs of Unsafe Downloads",
        text: "Be careful if you see:",
        bullets: [
          "\"Download Now!\" flashing advertisements",
          "Websites with lots of pop-up windows",
          "Files from unknown email attachments",
          "Downloads that promise something \"FREE\" but seem too good to be true",
          "Websites asking you to install software before you can read an article or watch a video"
        ]
      },
      {
        type: "multiselect",
        title: "Which Downloads Are Safe?",
        prompt: "Tap every option that is generally safe.",
        options: [
          { text: "Downloading an app from the Apple App Store", correct: true },
          { text: "Downloading an app from Google Play Store", correct: true },
          { text: "Downloading software from the company's official website", correct: true },
          { text: "Downloading a program from a random pop-up advertisement", correct: false },
          { text: "Opening an attachment from an unknown sender", correct: false },
          { text: "Downloading \"Free Antivirus\" from a website you've never visited", correct: false }
        ],
        feedback: "Excellent! Official app stores and company websites are the safest places to download software."
      },
      {
        type: "flashcards",
        title: "Flashcards",
        cards: [
          { front: "Download", back: "Copying a file or app from the internet to your device." },
          { front: "Malware", back: "Harmful software that can damage your device or steal information." },
          { front: "Official Website", back: "The company's real website where software can be safely downloaded." },
          { front: "App Store", back: "A trusted place to download apps." },
          { front: "Pop-up Ad", back: "A window that appears unexpectedly and may try to trick you into clicking." }
        ]
      },
      {
        type: "match",
        title: "Match the Word",
        pairs: [
          { word: "Download", match: "Copy a file to your device" },
          { word: "Malware", match: "Harmful software" },
          { word: "Official Website", match: "Company's real website" },
          { word: "App Store", match: "Trusted place for apps" },
          { word: "Pop-up Ad", match: "Unexpected advertisement" }
        ]
      },
      {
        type: "fillblank",
        title: "Fill in the Blank",
        wordBank: ["App Store", "Malware", "Official Website", "Download"],
        questions: [
          { text: "The safest place to get most phone apps is the ______.", answer: "App Store" },
          { text: "______ is harmful software that can damage your device.", answer: "Malware" },
          { text: "You should usually download computer software from the company's ______.", answer: "Official Website" }
        ]
      },
      {
        type: "scenario",
        title: "Scenario 1",
        text: "Margaret wants to install Zoom. She searches online and finds zoom.us and free-zoom-download-now.net. Which should she choose?",
        options: ["free-zoom-download-now.net", "zoom.us"],
        correctIndex: 1,
        explanation: "Downloading directly from the official company website is much safer. Scam websites often use names that look similar to real companies."
      },
      {
        type: "scenario",
        title: "Scenario 2",
        text: "Robert receives an email from someone he doesn't know. It says: \"Open this attachment to claim your prize!\" What should he do?",
        options: [
          "Open it immediately.",
          "Download the attachment to see what it is.",
          "Do not open the attachment. Delete the email or report it as spam.",
          "Forward it to friends."
        ],
        correctIndex: 2,
        explanation: "Unexpected attachments can contain malware."
      },
      {
        type: "scenario",
        title: "Scenario 3",
        text: "Linda visits a news website. A giant flashing button says: \"DOWNLOAD NOW!\" She isn't trying to download anything. What should she do?",
        options: [
          "Click it.",
          "Download the file just to check.",
          "Ignore the button and close the pop-up if possible.",
          "Enter her credit card information."
        ],
        correctIndex: 2,
        explanation: "Some websites use fake download buttons to trick people."
      },
      {
        type: "learn",
        heading: "Quick Tip",
        text: "Many websites have fake download buttons. Look carefully before clicking. Ask yourself: Am I trying to download something? Is this the official website? Does this button match what I wanted? If you're unsure, don't click."
      },
      {
        type: "sort",
        title: "Safe or Unsafe?",
        prompt: "Drag each action into the correct box.",
        categories: [
          {
            label: "Safe",
            items: [
              "Download apps from the Apple App Store",
              "Download apps from Google Play Store",
              "Download software from official company websites",
              "Ask someone you trust if you're unsure"
            ]
          },
          {
            label: "Unsafe",
            items: [
              "Click flashing \"Download Now!\" ads",
              "Download unknown email attachments",
              "Install software from websites you don't recognize",
              "Ignore browser security warnings"
            ]
          }
        ]
      },
      {
        type: "choice",
        title: "Is It Safe to Download?",
        text: "You need a weather app. Where should you get it?",
        options: ["A random website", "A social media advertisement", "Apple App Store or Google Play Store", "An email attachment"],
        correctIndex: 2,
        explanation: "Official app stores are the safest place to download apps."
      },
      {
        type: "choice",
        title: "Is It Safe to Download?",
        text: "A pop-up says: \"Your computer is infected! Download this cleaner now!\"",
        options: ["Download it.", "Enter your payment information.", "Close the pop-up without downloading anything.", "Share the pop-up with friends."],
        correctIndex: 2,
        explanation: "Many of these messages are scams designed to trick people into installing malware."
      },
      {
        type: "choice",
        title: "Is It Safe to Download?",
        text: "You want to install Adobe Acrobat. Which website is safest?",
        options: ["adobe-free-download.net", "adobe-downloads.org", "adobe.com", "freepdfreader247.com"],
        correctIndex: 2,
        explanation: "Downloading directly from the company's official website helps protect you from fake software."
      },
      {
        type: "learn",
        heading: "Remember",
        text: "Before downloading: use official app stores, use official company websites, avoid unknown attachments, ignore fake download buttons. If something seems suspicious, don't click it."
      }
    ],
    quiz: [
      { question: "What does downloading mean?", options: ["Deleting a file", "Restarting your phone", "Copying a file or app from the internet to your device", "Charging your battery"], correctIndex: 2 },
      { question: "Where is the safest place to download phone apps?", options: ["Random websites", "Social media ads", "Apple App Store or Google Play Store", "Unknown email attachments"], correctIndex: 2 },
      { question: "True or False: It's safe to open every email attachment you receive.", options: ["True", "False"], correctIndex: 1 },
      { question: "______ is software designed to harm your device or steal your information.", options: ["Malware", "Camera", "Password"], correctIndex: 0 },
      { question: "What should you do if you see a flashing \"Download Now!\" advertisement on a website?", options: ["Click it immediately.", "Download the file to see what happens.", "Ignore it unless you're sure it's from a trusted source.", "Enter your credit card information."], correctIndex: 2 },
      { question: "Which website is most likely the official one?", options: ["microsoft-free-download.net", "microsoft-updates247.com", "microsoft.com", "freeofficeapps.org"], correctIndex: 2 },
      { question: "You receive an email saying you've won a prize and need to download a file to claim it. What should you do?", options: ["Download it immediately.", "Reply with your bank information.", "Do not download the file. Delete or report the email if it seems suspicious.", "Send it to friends."], correctIndex: 2 },
      { question: "Which are good downloading habits?", options: ["Downloading from anywhere convenient", "Using official app stores and company websites, being cautious of attachments, and ignoring suspicious pop-ups"], correctIndex: 1 }
    ],
    complete: {
      title: "Great Job!",
      subtitle: "You completed Lesson 6: Safe Downloading!",
      learned: [
        "Download apps and files more safely.",
        "Recognize malware and fake download scams.",
        "Choose trusted websites and app stores.",
        "Avoid risky downloads and suspicious attachments."
      ],
      next: "Browser Safety"
    }
  },

  // ============================================================
  // LESSON 2.7
  // ============================================================
  {
    id: "browser-safety",
    track: "literacy",
    phase: 2,
    order: 16,
    lessonNumber: "2.7",
    title: "Browser Safety",
    badge: "Safe Surfer",
    xp: 20,
    goals: [
      "Explain what a web browser is.",
      "Recognize signs of a safe website.",
      "Identify suspicious websites and browser warnings.",
      "Know what to do if a website doesn't seem trustworthy."
    ],
    blocks: [
      {
        type: "learn",
        heading: "What Is a Web Browser?",
        text: "A web browser is an app that lets you visit websites on the internet. Common web browsers include Google Chrome, Safari, Firefox, and Microsoft Edge. Think of a browser like a car. The browser is the car that takes you to websites. The websites are the places you visit."
      },
      {
        type: "learn",
        heading: "How Can You Tell If a Website Is Safe?",
        text: "Before entering personal information, look for these signs: the website address begins with https://, and a lock icon appears next to the website address. Example: https://www.bank.com\n\nThese signs mean your connection to the website is encrypted. However, they do NOT guarantee the website itself is trustworthy. Scammers can also create websites that use HTTPS. Always check that you're on the correct website."
      },
      {
        type: "learn",
        heading: "Watch Out for Fake Websites",
        text: "Scammers often create website addresses that look similar to real ones.",
        bullets: [
          "Real: amazon.com | Fake: amaz0n-login.com",
          "Real: paypal.com | Fake: paypal-secure-login.net",
          "Real: medicare.gov | Fake: medicare-benefits-support.com"
        ],
        footer: "One small change can make a big difference. Always read the entire website address carefully."
      },
      {
        type: "learn",
        heading: "Browser Warnings",
        text: "Sometimes your browser will display warnings like \"Warning: This site may be unsafe\" or \"Your connection is not private.\" These warnings are there to protect you. If you see one: don't ignore it, don't enter personal information, and leave the website unless you're certain it's safe."
      },
      {
        type: "multiselect",
        title: "Which Websites Look Trustworthy?",
        prompt: "Tap every website that appears to be the official website.",
        options: [
          { text: "https://www.amazon.com", correct: true },
          { text: "https://www.paypal.com", correct: true },
          { text: "https://www.medicare.gov", correct: true },
          { text: "https://amazon-login-free.net", correct: false },
          { text: "https://paypal-support-login.org", correct: false },
          { text: "https://medicare-help247.com", correct: false }
        ],
        feedback: "Excellent! Official websites usually use the company's real domain name. Scam websites often include extra words like login, support, secure, or numbers to look convincing."
      },
      {
        type: "flashcards",
        title: "Flashcards",
        cards: [
          { front: "Browser", back: "An app used to visit websites." },
          { front: "HTTPS", back: "A secure connection between your browser and a website." },
          { front: "Lock Icon", back: "Shows your connection is encrypted." },
          { front: "Website Address (URL)", back: "The web address you type or click to visit a website." },
          { front: "Browser Warning", back: "A message that alerts you when a website may not be safe." }
        ]
      },
      {
        type: "match",
        title: "Match the Word",
        pairs: [
          { word: "Browser", match: "Visits websites" },
          { word: "HTTPS", match: "Secure connection" },
          { word: "URL", match: "Website address" },
          { word: "Lock Icon", match: "Encrypted connection" },
          { word: "Browser Warning", match: "Alerts you to possible danger" }
        ]
      },
      {
        type: "fillblank",
        title: "Fill in the Blank",
        wordBank: ["Browser", "HTTPS", "URL", "Warning"],
        questions: [
          { text: "A web ______ lets you visit websites.", answer: "Browser" },
          { text: "Secure websites usually begin with ______.", answer: "HTTPS" },
          { text: "If your browser displays a security ______, stop before continuing.", answer: "Warning" }
        ]
      },
      {
        type: "scenario",
        title: "Scenario 1",
        text: "Margaret wants to log into her bank. She accidentally clicks a link in an email that opens: https://my-bank-login247.net. What should she do?",
        options: [
          "Enter her username and password.",
          "Call the phone number on the website.",
          "Close the page and type her bank's official website address into her browser or use her bank's official app.",
          "Ignore the strange website name."
        ],
        correctIndex: 2,
        explanation: "Scammers often create fake websites that look similar to real ones. Never enter your password unless you're sure you're on the correct website."
      },
      {
        type: "scenario",
        title: "Scenario 2",
        text: "Robert visits a website. His browser says: \"Your connection is not private.\" What should he do?",
        options: [
          "Continue anyway.",
          "Enter his credit card number.",
          "Leave the website unless he knows exactly why the warning appeared.",
          "Ignore the warning."
        ],
        correctIndex: 2,
        explanation: "Browser warnings are designed to help protect your information."
      },
      {
        type: "scenario",
        title: "Scenario 3",
        text: "Linda wants to visit Medicare's website. Which address should she use?",
        options: ["medicare-help.com", "medicare-support.net", "medicare.gov", "medicare-online247.org"],
        correctIndex: 2,
        explanation: "Government websites usually end in .gov."
      },
      {
        type: "learn",
        heading: "Quick Tip",
        text: "Before signing in or entering personal information, ask yourself: Is this the correct website? Does the address look exactly right? Does it begin with https://? Am I here because I typed the address myself or used a trusted bookmark? If you're unsure, stop before entering any information."
      },
      {
        type: "sort",
        title: "Safe or Unsafe?",
        prompt: "Drag each habit into the correct box.",
        categories: [
          {
            label: "Safe",
            items: ["Type the website address yourself", "Use bookmarks for websites you visit often", "Check the website address carefully", "Read browser security warnings"]
          },
          {
            label: "Unsafe",
            items: ["Ignore browser warnings", "Click every link in emails or text messages", "Assume every HTTPS website is trustworthy", "Enter passwords without checking the website address"]
          }
        ]
      },
      {
        type: "choice",
        title: "What Should You Do?",
        text: "You receive an email saying your Netflix account is locked. It includes a link. What should you do?",
        options: [
          "Click the link immediately.",
          "Enter your password.",
          "Open your browser and go directly to the official Netflix website or app instead.",
          "Forward the email to everyone you know."
        ],
        correctIndex: 2,
        explanation: "Typing the official website yourself is much safer than using links from unexpected emails."
      },
      {
        type: "choice",
        title: "What Should You Do?",
        text: "You notice the website address says paypaI.com (the last letter is a capital I, not a lowercase l). What should you do?",
        options: ["Sign in.", "Ignore the spelling.", "Leave the website and type paypal.com yourself.", "Save the website as a bookmark."],
        correctIndex: 2,
        explanation: "Scammers sometimes replace letters with similar-looking characters to trick people."
      },
      {
        type: "choice",
        title: "What Should You Do?",
        text: "You need to visit the IRS website. Which address is most trustworthy?",
        options: ["irs-help.net", "irs-refunds247.org", "irs.gov", "secure-irs-online.com"],
        correctIndex: 2
      },
      {
        type: "learn",
        heading: "Remember",
        text: "Before entering personal information: check the website address, look for https://, read browser warnings, and type important website addresses yourself. HTTPS alone does not guarantee a website is legitimate. Never ignore browser security warnings."
      }
    ],
    quiz: [
      { question: "What is a web browser?", options: ["A password manager", "A Wi-Fi network", "An app used to visit websites", "A search engine"], correctIndex: 2 },
      { question: "What should you check before entering personal information?", options: ["Only the page colors", "The website address, whether it begins with https://, browser warnings, and whether you're on the correct website"], correctIndex: 1 },
      { question: "True or False: Every website with HTTPS is automatically trustworthy.", options: ["True", "False"], correctIndex: 1 },
      { question: "A web ______ lets you visit websites.", options: ["Browser", "Camera", "Television"], correctIndex: 0 },
      { question: "Your browser says, \"Warning: This site may be unsafe.\" What should you do?", options: ["Continue and enter your password.", "Ignore the warning.", "Leave the website unless you're certain it's safe.", "Refresh the page repeatedly."], correctIndex: 2 },
      { question: "Which website is most likely the official PayPal website?", options: ["paypal-secure-login.net", "paypal-help247.com", "paypal.com", "paypal-login-support.org"], correctIndex: 2 },
      { question: "What is the safest way to visit your bank's website?", options: ["Click a link from an unexpected email.", "Search and click the first advertisement.", "Type the official website address yourself or use a trusted bookmark or the bank's official app.", "Use any website with a similar name."], correctIndex: 2 },
      { question: "You accidentally click a suspicious link. What should you do?", options: ["Enter your password to see if it's real.", "Continue browsing.", "Close the page without entering any information.", "Share the link with a friend."], correctIndex: 2 }
    ],
    complete: {
      title: "Great Job!",
      subtitle: "You completed Lesson 7: Browser Safety!",
      learned: [
        "Understand what a browser is.",
        "Recognize signs of a secure connection.",
        "Spot fake websites and suspicious links.",
        "Respond safely to browser security warnings."
      ],
      next: "Privacy Settings"
    }
  },

  // ============================================================
  // LESSON 2.8
  // ============================================================
  {
    id: "privacy-settings",
    track: "literacy",
    phase: 2,
    order: 17,
    lessonNumber: "2.8",
    title: "Privacy Settings",
    badge: "Settings Guardian",
    xp: 20,
    goals: [
      "Explain what privacy settings are.",
      "Know what information should stay private.",
      "Learn how to adjust privacy settings on apps and websites.",
      "Understand why reviewing privacy settings regularly is important."
    ],
    blocks: [
      {
        type: "learn",
        heading: "What Are Privacy Settings?",
        text: "Privacy settings let you choose who can see your information online. Many apps and websites ask for permission to access things like your location, your photos, your microphone, your contacts, and your camera. You are in control. You can decide what information an app is allowed to access.\n\nThink of privacy settings like the curtains in your home. Open curtains means more people can see inside. Closed curtains means more privacy."
      },
      {
        type: "learn",
        heading: "Why Are Privacy Settings Important?",
        text: "Some apps need certain permissions. A maps app needs your location. A camera app needs access to your camera. But some apps ask for information they don't really need. Before tapping \"Allow,\" ask yourself: does this app really need this information? If the answer is no, choose \"Don't Allow\" or \"Allow While Using the App\" when available."
      },
      {
        type: "learn",
        heading: "What Information Should You Protect?",
        text: "Keep these private unless there's a good reason to share them:",
        bullets: [
          "Home address",
          "Phone number",
          "Email address",
          "Live location",
          "Credit card numbers",
          "Bank account information",
          "Social Security number",
          "Date of birth (when possible)"
        ]
      },
      {
        type: "learn",
        heading: "Oversharing Can Be Risky",
        text: "Imagine posting: \"I'm on vacation for two weeks!\" While this may seem harmless, it lets many people know you're away from home. Instead, consider posting vacation photos after you return home. Small choices can make a big difference."
      },
      {
        type: "multiselect",
        title: "Which Information Should Usually Stay Private?",
        prompt: "Tap every item that should generally stay private.",
        options: [
          { text: "Home address", correct: true },
          { text: "Social Security number", correct: true },
          { text: "Bank account information", correct: true },
          { text: "Credit card number", correct: true },
          { text: "Live location", correct: true },
          { text: "Phone number", correct: true },
          { text: "Favorite color", correct: false },
          { text: "Favorite ice cream", correct: false },
          { text: "Favorite movie", correct: false }
        ],
        feedback: "Excellent! Sensitive personal and financial information should be protected."
      },
      {
        type: "flashcards",
        title: "Flashcards",
        cards: [
          { front: "Privacy Settings", back: "Controls who can see your information." },
          { front: "Permission", back: "A request for an app to access information or features on your device." },
          { front: "Location", back: "Shows where your device is." },
          { front: "Contacts", back: "The list of people saved on your phone." },
          { front: "Microphone Access", back: "Allows an app to use your microphone." }
        ]
      },
      {
        type: "match",
        title: "Match the Permission",
        pairs: [
          { word: "Camera", match: "Take pictures or videos" },
          { word: "Microphone", match: "Record sound" },
          { word: "Location", match: "Know where you are" },
          { word: "Photos", match: "View your photo library" },
          { word: "Contacts", match: "Access your saved contacts" }
        ]
      },
      {
        type: "fillblank",
        title: "Fill in the Blank",
        wordBank: ["Privacy", "Permission", "Location", "Contacts"],
        questions: [
          { text: "______ settings let you control who can see your information.", answer: "Privacy" },
          { text: "An app asking to use your camera is requesting ______.", answer: "Permission" },
          { text: "A maps app usually needs your ______ to provide directions.", answer: "Location" }
        ]
      },
      {
        type: "scenario",
        title: "Scenario 1",
        text: "Margaret downloads a flashlight app. It asks for access to her location, her contacts, and her microphone. Does it likely need all of these permissions?",
        options: ["Yes", "No"],
        correctIndex: 1,
        explanation: "A simple flashlight app usually doesn't need access to your location, contacts, or microphone."
      },
      {
        type: "scenario",
        title: "Scenario 2",
        text: "Robert installs a navigation app. It asks to use his location. Should he allow it?",
        options: ["Yes", "No"],
        correctIndex: 0,
        explanation: "A navigation app needs your location to give directions."
      },
      {
        type: "scenario",
        title: "Scenario 3",
        text: "Linda wants to share pictures from her vacation. What is the safer choice?",
        options: [
          "Post that she's leaving for a two-week vacation before she leaves.",
          "Share her hotel room number online.",
          "Share vacation photos after returning home.",
          "Post her home address so friends can visit."
        ],
        correctIndex: 2,
        explanation: "Waiting until you return home helps protect your privacy."
      },
      {
        type: "learn",
        heading: "Quick Tip",
        text: "Every few months, review your privacy settings. Ask yourself: Does this app still need my location? Does this app need my microphone? Do I still use this app? If not, you can remove unnecessary permissions."
      },
      {
        type: "sort",
        title: "Safe or Unsafe?",
        prompt: "Drag each choice into the correct box.",
        categories: [
          {
            label: "Safer Choices",
            items: [
              "Review app permissions occasionally",
              "Only allow permissions an app needs",
              "Keep your home address private",
              "Share your live location only with people you trust"
            ]
          },
          {
            label: "Less Safe Choices",
            items: [
              "Give every app every permission",
              "Post your credit card number online",
              "Share your Social Security number in a social media message",
              "Post your vacation plans before you leave"
            ]
          }
        ]
      },
      {
        type: "choice",
        title: "Should You Allow This Permission?",
        text: "A video calling app wants access to your camera.",
        options: ["Allow", "Don't Allow"],
        correctIndex: 0,
        explanation: "Video calling apps need your camera so other people can see you during calls."
      },
      {
        type: "choice",
        title: "Should You Allow This Permission?",
        text: "A calculator app asks for your contacts.",
        options: ["Allow", "Don't Allow"],
        correctIndex: 1,
        explanation: "A calculator usually doesn't need access to your contacts."
      },
      {
        type: "choice",
        title: "Should You Allow This Permission?",
        text: "A weather app asks for your location.",
        options: ["Never Allow", "Allow While Using the App", "Always Allow without thinking"],
        correctIndex: 1,
        explanation: "Many weather apps use your location to show local forecasts. \"Allow While Using the App\" provides what it needs while limiting access when you're not using it."
      },
      {
        type: "learn",
        heading: "Remember",
        text: "Privacy settings let you decide what information apps can access. Before tapping \"Allow,\" ask: Does this app need this information? Am I comfortable sharing it? Can I choose a more limited option, like \"Allow While Using the App\"? You can always review and change permissions later."
      }
    ],
    quiz: [
      { question: "What do privacy settings do?", options: ["Speed up your internet.", "Charge your phone.", "Control who can see your information and what apps can access.", "Remove viruses."], correctIndex: 2 },
      { question: "Which information should usually stay private?", options: ["Your favorite color", "Home address, Social Security number, bank account information, and credit card number"], correctIndex: 1 },
      { question: "True or False: Every app should receive every permission it asks for.", options: ["True", "False"], correctIndex: 1 },
      { question: "______ settings help control who can see your information.", options: ["Privacy", "Camera", "Music"], correctIndex: 0 },
      { question: "A flashlight app asks for your contacts. What should you do?", options: ["Allow it automatically.", "Don't allow it unless there's a clear reason.", "Give it every permission.", "Share your contact list online."], correctIndex: 1 },
      { question: "Which permission makes sense for a navigation app?", options: ["Contacts", "Microphone", "Location", "Calendar"], correctIndex: 2 },
      { question: "What's a safer way to share vacation photos?", options: ["Before leaving on your trip.", "While you're away, including your exact location.", "After you've returned home.", "Include your hotel room number."], correctIndex: 2 },
      { question: "When should you review your app permissions?", options: ["Never.", "Only when buying a new phone.", "Every few months, or whenever you stop using an app or have privacy concerns.", "Only after someone reminds you."], correctIndex: 2 }
    ],
    complete: {
      title: "Great Job!",
      subtitle: "You completed Lesson 8: Privacy Settings!",
      learned: [
        "Understand what privacy settings do.",
        "Protect sensitive personal information.",
        "Decide when apps should have access to your device.",
        "Review and manage app permissions."
      ],
      next: "Location Sharing"
    }
  },

  // ============================================================
  // LESSON 2.9
  // ============================================================
  {
    id: "location-sharing",
    track: "literacy",
    phase: 2,
    order: 18,
    lessonNumber: "2.9",
    title: "Location Sharing",
    badge: "Location Guardian",
    xp: 20,
    goals: [
      "Explain what location sharing is.",
      "Know when it is safe to share their location.",
      "Decide who should have access to their location.",
      "Turn location sharing on or off when needed."
    ],
    blocks: [
      {
        type: "learn",
        heading: "What Is Location Sharing?",
        text: "Location sharing allows your phone or tablet to tell an app or another person where you are. Some apps use your location to give directions, show traffic, find nearby restaurants, display your local weather, or share your location with trusted family members or friends. You are always in control of who can see your location."
      },
      {
        type: "learn",
        heading: "Different Types of Location Sharing",
        text: "There are three common ways apps use your location.",
        bullets: [
          "While Using the App - the app only knows your location while it is open. This is often the safest choice.",
          "Always - the app can access your location all the time, even when you aren't using it. Only a few apps truly need this.",
          "Never - the app cannot access your location. Some apps may not work properly if location is turned off."
        ]
      },
      {
        type: "learn",
        heading: "Should You Share Your Location?",
        text: "Ask yourself: Do I trust this app? Do I know why it needs my location? Does it make sense?",
        bullets: [
          "Maps app - Yes",
          "Weather app - Yes",
          "Flashlight app - No",
          "Calculator app - No"
        ]
      },
      {
        type: "learn",
        heading: "Sharing With People",
        text: "Many phones let you share your live location with another person. Only share your location with close family, trusted friends, or caregivers if you choose. Never share your live location with someone you don't know, someone you met online, or anyone pressuring you to share it. Remember: you can stop sharing your location at any time."
      },
      {
        type: "multiselect",
        title: "Which Apps Probably Need Your Location?",
        prompt: "Tap every app that may need your location.",
        options: [
          { text: "Maps", correct: true },
          { text: "Weather", correct: true },
          { text: "Ride-sharing app", correct: true },
          { text: "Emergency services app", correct: true },
          { text: "Calculator", correct: false },
          { text: "Flashlight", correct: false },
          { text: "Sudoku game", correct: false },
          { text: "Photo editor", correct: false }
        ],
        feedback: "Excellent! Maps, weather, and ride-sharing apps often need your location to work correctly."
      },
      {
        type: "flashcards",
        title: "Flashcards",
        cards: [
          { front: "Location Sharing", back: "Allowing an app or person to know where you are." },
          { front: "While Using the App", back: "The app only uses your location when it is open." },
          { front: "Always", back: "The app can use your location anytime." },
          { front: "Never", back: "The app cannot use your location." },
          { front: "Trusted Contact", back: "A family member or friend you know personally." }
        ]
      },
      {
        type: "match",
        title: "Match the Permission",
        pairs: [
          { word: "While Using the App", match: "Uses your location only when open" },
          { word: "Always", match: "Can use your location anytime" },
          { word: "Never", match: "Cannot access your location" },
          { word: "Trusted Contact", match: "Someone you know personally" },
          { word: "Live Location", match: "Your current location being shared" }
        ]
      },
      {
        type: "fillblank",
        title: "Fill in the Blank",
        wordBank: ["Maps", "Trusted", "While Using the App", "Location"],
        questions: [
          { text: "Google ______ uses your location to give directions.", answer: "Maps" },
          { text: "Only share your live location with people you ______.", answer: "Trusted" },
          { text: "The safest choice for many apps is ______.", answer: "While Using the App" }
        ]
      },
      {
        type: "scenario",
        title: "Scenario 1",
        text: "Margaret downloads a flashlight app. It asks to use her location. What should she do?",
        options: [
          "Allow all the time.",
          "Allow while using the app.",
          "Don't allow location access.",
          "Share her live location with the app."
        ],
        correctIndex: 2,
        explanation: "A flashlight app doesn't need to know where you are."
      },
      {
        type: "scenario",
        title: "Scenario 2",
        text: "Robert uses a navigation app while driving. The app asks to use his location. Should he allow it?",
        options: ["Yes", "No"],
        correctIndex: 0,
        explanation: "Navigation apps need your location to provide directions."
      },
      {
        type: "scenario",
        title: "Scenario 3",
        text: "Linda meets someone online. After chatting for one day, the person asks her to share her live location. What should she do?",
        options: [
          "Share it to be polite.",
          "Share it just for five minutes.",
          "Do not share your live location with someone you don't know.",
          "Send them her home address instead."
        ],
        correctIndex: 2,
        explanation: "People online may not be who they claim to be. Protect your privacy by only sharing your location with trusted people."
      },
      {
        type: "learn",
        heading: "Quick Tip",
        text: "It's a good habit to review which apps can access your location. Ask yourself: Do I still use this app? Does it really need my location? Can I change it to \"While Using the App\"? You can change location permissions anytime in your device's Settings."
      },
      {
        type: "sort",
        title: "Safe or Unsafe?",
        prompt: "Drag each choice into the correct box.",
        categories: [
          {
            label: "Safer Choices",
            items: [
              "Share your location with trusted family if you choose",
              "Choose \"While Using the App\" when it makes sense",
              "Turn off location sharing when you no longer need it",
              "Review your location permissions every few months"
            ]
          },
          {
            label: "Less Safe Choices",
            items: [
              "Share your live location with strangers",
              "Allow every app to use your location all the time",
              "Ignore which apps have location access",
              "Post your exact live location on social media"
            ]
          }
        ]
      },
      {
        type: "choice",
        title: "What Should You Do?",
        text: "A stranger you met online asks where you live.",
        options: [
          "Tell them your full address.",
          "Share your live location.",
          "Don't share your address or live location.",
          "Send them a picture of your house."
        ],
        correctIndex: 2,
        explanation: "Protect your privacy by not sharing personal location information with people you don't know."
      },
      {
        type: "choice",
        title: "What Should You Do?",
        text: "A photo editing app asks for your location. What should you do?",
        options: [
          "Automatically allow it.",
          "Choose \"Always\" without reading.",
          "Think about whether the app actually needs your location before deciding.",
          "Share your location with everyone."
        ],
        correctIndex: 2,
        explanation: "Not every app needs your location. Consider whether the permission makes sense before allowing it."
      },
      {
        type: "learn",
        heading: "Remember",
        text: "Location sharing can be helpful, but only when you control it. Share only with trusted people. Choose \"While Using the App\" when possible. Review app permissions regularly. Turn off location sharing if you don't need it. Never share your live location with strangers or give every app access automatically."
      }
    ],
    quiz: [
      { question: "What is location sharing?", options: ["Sharing your password.", "Sending a text message.", "Allowing an app or person to know where you are.", "Downloading an app."], correctIndex: 2 },
      { question: "Which apps often need your location?", options: ["Calculator and flashlight", "Maps, weather, ride-sharing apps, and emergency services apps"], correctIndex: 1 },
      { question: "True or False: You should share your live location with anyone who asks politely online.", options: ["True", "False"], correctIndex: 1 },
      { question: "For many apps, ______ is a good location permission because it limits access when you're not using the app.", options: ["While Using the App", "Password", "Camera"], correctIndex: 0 },
      { question: "A calculator app asks for your location. What should you do?", options: ["Allow it automatically.", "Choose \"Always.\"", "Think about whether it actually needs your location before allowing access.", "Share your home address instead."], correctIndex: 2 },
      { question: "Who is usually an appropriate person to share your live location with?", options: ["A stranger from social media.", "Someone who just emailed you.", "A trusted family member or close friend, if you choose.", "Anyone who asks."], correctIndex: 2 },
      { question: "Can you change an app's location permissions later?", options: ["No, once you choose, it's permanent.", "Yes, you can change them in your device's Settings.", "Only if you buy a new phone.", "Only by contacting the app company."], correctIndex: 1 },
      { question: "What should you do before allowing an app to use your location?", options: ["Automatically tap Allow.", "Ask if the app really needs it, decide whether you trust it, and consider \"While Using the App.\""], correctIndex: 1 }
    ],
    complete: {
      title: "Phase 2 Complete!",
      subtitle: "You completed Lesson 9: Location Sharing, and all of Phase 2: Safe Internet Habits!",
      learned: [
        "Understand how location sharing works.",
        "Decide which apps should access your location.",
        "Share your location only with trusted people.",
        "Review and manage location permissions."
      ],
      next: "Phase 3: Communication"
    }
  }
];

export default phase2Lessons;
