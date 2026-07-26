// Everwise - Scam Protection track
// Phase 5: Protecting Your Personal Information
//
// The phase is built around one question the learner carries throughout:
//   "Why do they need this information?"
//
// Passwords are taught with a single running metaphor — a key — so 5.2
// through 5.6 feel like one continuous idea rather than six separate topics.

const PRIVACY_HABITS = [
  "Slow down",
  "Think before you share",
  "Ask why someone needs your information",
  "Share only what's necessary",
];

export const scamPhase5Lessons = [
  // ============================================================
  // LESSON 5.1
  // ============================================================
  {
    id: "scam-info-is-valuable",
    track: "scam",
    phase: 105,
    order: 1,
    lessonNumber: "5.1",
    title: "Your Information Is Valuable",
    pathTitle: "Your Information",
    badge: "Privacy Aware",
    xp: 20,
    goals: [
      "Understand why scammers want your personal information.",
      "Ask why information is needed before sharing it."
    ],
    blocks: [
      {
        type: "reading",
        heading: "Your Information Is Valuable",
        question: "Why would someone want my personal information?",
        objective:
          "Learn that personal information has value, and sharing too much can make it easier for scammers to target you.",
        warningSigns: PRIVACY_HABITS,
        text: "Your personal information is valuable because it helps prove who you are. Things like your full name, home address, birthday, phone number, and account numbers can be useful to banks, doctors, and other trusted organizations. Unfortunately, scammers want this information too. The more they know about you, the easier it becomes for them to pretend to be someone you trust. A good habit is to ask yourself, \"Does this person really need this information?\" before sharing it."
      },
      {
        type: "tiered",
        title: "What's personal?",
        scenario: "A website asks you to create an account.",
        question:
          "Which piece of information should you think carefully about before sharing?",
        options: [
          {
            text: "Your home address.",
            tier: "best",
            feedback:
              "Addresses and phone numbers are personal information. Before sharing them, make sure you know why they're being requested."
          },
          {
            text: "Your phone number.",
            tier: "safe",
            feedback:
              "Also worth pausing over — a phone number is often used to reach you later."
          },
          {
            text: "Your favorite color.",
            tier: "unsafe",
            feedback:
              "Harmless on its own — though be careful, because it's sometimes a security question answer."
          }
        ]
      },
      {
        type: "tiered",
        title: "Asking \"why?\"",
        scenario:
          "Someone calls unexpectedly and asks, \"Can you please confirm your date of birth for me?\"",
        question: "Which response is the best?",
        options: [
          {
            text: "Ask who they are and why they need your information before sharing it.",
            tier: "best",
            feedback:
              "Even if someone sounds friendly, you should understand why they're asking before sharing personal information."
          },
          {
            text: "Tell them you'll call the organization back using an official phone number.",
            tier: "safe",
            feedback: "An excellent move — you control who you're speaking to."
          },
          {
            text: "Give your birthday because they asked politely.",
            tier: "unsafe",
            feedback:
              "Your birthday is used to verify your identity at banks and doctors. It's worth protecting."
          }
        ]
      },
      {
        type: "tiered",
        title: "Less is more",
        scenario:
          "You're filling out an online form. One question asks for information that doesn't seem related to what you're doing.",
        question: "Which response is the best?",
        options: [
          {
            text: "Skip the question unless it's clearly required and makes sense.",
            tier: "best",
            feedback:
              "Some forms ask for optional information. If you don't understand why it's needed, it's okay not to provide it."
          },
          {
            text: "Think about whether the information is really necessary.",
            tier: "safe",
            feedback: "That pause is the whole habit."
          },
          {
            text: "Fill in every blank because it's on the form.",
            tier: "unsafe",
            feedback:
              "A blank on a form is not an obligation. Many are optional."
          }
        ]
      },
      {
        type: "tiered",
        title: "Connect previous lessons",
        scenario:
          "You receive an email that appears to be from your bank. It asks you to confirm your phone number, address, and birthday by clicking a link.",
        question: "Which response is safe?",
        options: [
          {
            text: "Contact your bank using its official phone number or website instead of the email link.",
            tier: "best",
            feedback:
              "Even if a message looks convincing, verify it before sharing personal information."
          },
          {
            text: "Verify whether the request is real before sharing any information.",
            tier: "safe",
            feedback: "The right instinct."
          },
          {
            text: "Click the link and provide the information because the email looks official.",
            tier: "unsafe",
            feedback:
              "Your bank already has all three of those details. Being asked to \"confirm\" them is the tell."
          }
        ]
      },
      {
        type: "confidence",
        question: "How confident do you feel deciding when to share personal information?",
        practice: [
          {
            scenario: "A stranger at an event asks where you live.",
            question: "Which response is the best?",
            options: [
              {
                text: "Only share personal information if you're comfortable and there's a good reason.",
                tier: "best",
                feedback: "Your comfort is a perfectly good reason to decline."
              },
              {
                text: "It's okay to politely decline.",
                tier: "safe",
                feedback: "\"Oh, just nearby\" is a complete answer."
              },
              {
                text: "Tell them your full address because they seem friendly.",
                tier: "unsafe",
                feedback: "Friendliness is not a reason to share your address."
              }
            ]
          },
          {
            scenario: "A website asks for your phone number to send security codes.",
            question: "Which response is the best?",
            options: [
              {
                text: "Think about whether the request makes sense before sharing it.",
                tier: "best",
                feedback:
                  "This one often does make sense — security codes are a real protection."
              },
              {
                text: "Read why the website is asking for the information.",
                tier: "safe",
                feedback: "Reading the reason is exactly the habit."
              },
              {
                text: "Share it automatically without reading anything.",
                tier: "unsafe",
                feedback: "Even reasonable requests deserve a glance."
              }
            ]
          }
        ]
      },
      {
        type: "memory",
        links: [
          {
            lesson: "Lesson 1.4 — Stop, Verify, Then Decide",
            note: "Before sharing personal information, verify who is asking and why."
          },
          {
            lesson: "Lesson 2.5 — Always Verify",
            note: "Unexpected requests for personal information should always be confirmed independently."
          }
        ]
      },
      {
        type: "finalboss",
        title: "The new patient form",
        setup:
          "You visit a new medical clinic for your first appointment. While filling out the paperwork, you notice one page asking for your Social Security number, driver's license number, the name of your bank, and your bank account number. You expected to provide contact and insurance details.",
        messages: [
          {
            from: "The receptionist, smiling",
            body: "Just fill out everything on every page."
          }
        ],
        question: "What should you do?",
        options: [
          {
            text: "Ask the receptionist why the banking information is needed, and only provide information that's necessary for your care.",
            tier: "best",
            feedback:
              "This wasn't about refusing to share information — it was about understanding why it was being requested. Trusted organizations sometimes need personal information, but it's always okay to ask questions first."
          },
          {
            text: "Skip the question until someone explains why it's required.",
            tier: "safe",
            feedback:
              "Leaving it blank and asking is completely reasonable."
          },
          {
            text: "Fill out every blank because it came from a medical office.",
            tier: "unsafe",
            feedback:
              "A legitimate clinic may genuinely need some of this — but a bank account number is unusual for medical care, and asking costs nothing."
          }
        ],
        spotted: ["A request that doesn't match the situation"]
      }
    ],
    quiz: [],
    complete: {
      title: "Lesson complete!",
      subtitle: "You completed Your Information Is Valuable.",
      habit: "Before you share, ask: \"Why do they need this information?\"",
      warningSign: "A request for information the situation doesn't call for.",
      skills: [
        "Recognized valuable personal information",
        "Questioned an unnecessary request",
        "Protected your privacy politely"
      ],
      next: "Your Password Is Your House Key"
    }
  },

  // ============================================================
  // LESSON 5.2
  // ============================================================
  {
    id: "scam-password-house-key",
    track: "scam",
    phase: 105,
    order: 2,
    lessonNumber: "5.2",
    title: "Your Password Is Your House Key",
    pathTitle: "Password = Key",
    badge: "Key Keeper",
    xp: 20,
    goals: [
      "Understand what a password protects.",
      "Recognize any request for your password as a warning sign."
    ],
    blocks: [
      {
        type: "reading",
        heading: "Your Password Is Your House Key",
        question: "Why are passwords so important?",
        objective:
          "Learn that your password is like the key to your home — it protects what belongs to you and shouldn't be shared.",
        warningSigns: PRIVACY_HABITS,
        text: "Think of your password like the key to your house. You wouldn't hand your house key to a stranger just because they asked politely. Your password works the same way. It protects things that belong to you, like your email, bank account, and photos. If someone else gets your password, they may be able to enter your account just like someone using your house key. A trusted company will almost never ask you to tell them your password."
      },
      {
        type: "tiered",
        title: "Understanding the key",
        scenario: "Someone says, \"A password is just a word. It isn't very important.\"",
        question: "Which response is the best?",
        options: [
          {
            text: "A password protects access to my accounts, just like a key protects my home.",
            tier: "best",
            feedback: "A password isn't just a word — it's protection for your personal information."
          },
          {
            text: "Losing a password can let someone into my account.",
            tier: "safe",
            feedback: "That's the practical consequence."
          },
          {
            text: "Passwords aren't important because I can always make a new one.",
            tier: "unsafe",
            feedback:
              "By the time you make a new one, someone may already have been inside."
          }
        ]
      },
      {
        type: "tiered",
        title: "Recognizing a red flag",
        scenario:
          "You receive an email that says, \"To keep your account active, reply with your password.\"",
        question: "Which response is the best?",
        options: [
          {
            text: "Never reply with your password.",
            tier: "best",
            feedback:
              "Legitimate companies almost never ask you to send your password by email, text message, or phone."
          },
          {
            text: "Contact the company through its official website or phone number if you're unsure.",
            tier: "safe",
            feedback: "Good — and they'll confirm they never send such emails."
          },
          {
            text: "Reply because the email sounds professional.",
            tier: "unsafe",
            feedback:
              "No professional company asks for passwords by reply. That request alone identifies it."
          }
        ]
      },
      {
        type: "tiered",
        title: "Sharing with others",
        scenario:
          "A neighbor offers to help you order something online and asks, \"What's your password? I'll log in for you.\"",
        question: "Which response is the best?",
        options: [
          {
            text: "Keep your password private and log in yourself if possible.",
            tier: "best",
            feedback:
              "Most neighbors are honest, but passwords should remain private whenever possible."
          },
          {
            text: "If you truly need help, stay with the person and change your password afterward if you shared it.",
            tier: "safe",
            feedback:
              "A practical compromise when you genuinely need assistance."
          },
          {
            text: "Tell them your password because they're your neighbor.",
            tier: "unsafe",
            feedback:
              "Even with people you trust, typing it yourself is simpler and safer."
          }
        ]
      },
      {
        type: "tiered",
        title: "Connect previous lessons",
        scenario:
          "Someone calls claiming to be from your bank. They know your name and address, then ask, \"Can you confirm your online banking password?\"",
        question: "Which response is safe?",
        options: [
          {
            text: "Refuse to share your password and contact your bank using its official phone number.",
            tier: "best",
            feedback:
              "Knowing your name or address doesn't prove someone works for your bank. Your password is still private."
          },
          {
            text: "Hang up and verify the call independently.",
            tier: "safe",
            feedback: "The same move, equally effective."
          },
          {
            text: "Share the password because they already knew your personal information.",
            tier: "unsafe",
            feedback:
              "Knowing some details about you is easy. It's often how the call is made believable in the first place."
          }
        ]
      },
      {
        type: "confidence",
        question: "How confident do you feel keeping your passwords private?",
        practice: [
          {
            scenario:
              "A website asks you to enter your password after you chose to sign in.",
            question: "Which response is the best?",
            options: [
              {
                text: "This is normal if it's the official website you intended to visit.",
                tier: "best",
                feedback:
                  "Entering your password on the official site you chose is normal. The important part is making sure you're on the correct website first."
              },
              {
                text: "Make sure you're on the correct website before typing it.",
                tier: "safe",
                feedback: "Exactly the check that matters."
              },
              {
                text: "Never type your password anywhere.",
                tier: "unsafe",
                feedback:
                  "That would make your accounts unusable. The rule is about who asks, not about typing it at all."
              }
            ]
          },
          {
            scenario:
              "A caller says, \"For security purposes, please tell me your password.\"",
            question: "Which response is the best?",
            options: [
              {
                text: "Legitimate companies do not ask for your password over the phone.",
                tier: "best",
                feedback: "\"For security purposes\" is doing a lot of work in that sentence."
              },
              {
                text: "End the call and contact the company yourself if you're concerned.",
                tier: "safe",
                feedback: "Simple and effective."
              },
              {
                text: "Give them the password because they mentioned security.",
                tier: "unsafe",
                feedback:
                  "Mentioning security is not the same as providing it."
              }
            ]
          }
        ]
      },
      {
        type: "memory",
        links: [
          {
            lesson: "Lesson 2.3 — Rushing Is a Warning",
            note: "Even if someone pressures you, don't rush into sharing private information."
          },
          {
            lesson: "Lesson 5.1 — Your Information Is Valuable",
            note: "A password is one of your most valuable pieces of information, because it unlocks your accounts."
          }
        ]
      },
      {
        type: "finalboss",
        title: "\"We need your password\"",
        setup:
          "You receive a phone call from someone claiming to work for your email provider. They already know your full name, email address, and phone number. They sound calm and professional, and they never ask for money.",
        messages: [
          {
            from: "Incoming call · \"Email Support\"",
            body:
              "We're fixing a security problem on your account. Before we continue, I just need you to confirm your password."
          }
        ],
        question: "What should you do?",
        options: [
          {
            text: "Refuse to share your password, end the call, and contact your email provider using its official website or phone number if you're concerned.",
            tier: "best",
            feedback:
              "This was a test of your most important habit. Even if someone sounds professional — or already knows information about you — you should never hand them the key to your digital life."
          },
          {
            text: "Remember that knowing some of your personal information doesn't prove someone is legitimate.",
            tier: "safe",
            feedback: "Precisely the reasoning that protects you here."
          },
          {
            text: "Tell them your password because they're helping secure your account.",
            tier: "unsafe",
            feedback:
              "Notice there was no money involved and no urgency — that's what made it convincing. But no real support team ever needs your password."
          }
        ],
        spotted: [
          "Unexpected contact",
          "A request for your password",
          "Personal details used to build trust"
        ]
      }
    ],
    quiz: [],
    complete: {
      title: "Lesson complete!",
      subtitle: "You completed Your Password Is Your House Key.",
      habit: "Treat your password like your house key — keep it private.",
      warningSign: "Anyone asking you to tell them your password.",
      skills: [
        "Understood what a password protects",
        "Recognized a password request as a warning sign",
        "Refused politely and verified independently"
      ],
      next: "Don't Make It Easy to Guess"
    }
  },

  // ============================================================
  // LESSON 5.3
  // ============================================================
  {
    id: "scam-hard-to-guess",
    track: "scam",
    phase: 105,
    order: 3,
    lessonNumber: "5.3",
    title: "Don't Make It Easy to Guess",
    pathTitle: "Hard to Guess",
    badge: "Strong Password",
    xp: 20,
    goals: [
      "Avoid personal information in passwords.",
      "Recognize what makes a password harder to guess."
    ],
    blocks: [
      {
        type: "reading",
        heading: "Don't Make It Easy to Guess",
        question: "What makes a password safe?",
        objective:
          "Learn that a good password is difficult for other people to guess, even if they know you well.",
        warningSigns: PRIVACY_HABITS,
        text: "Many people choose passwords using information that's easy to remember, like a birthday, a pet's name, or \"123456.\" The problem is that this information is often easy for someone else to guess, especially if they know you or can find details about you online. A safer password is unique and doesn't include obvious personal information. The harder it is to guess, the better it protects your account."
      },
      {
        type: "tiered",
        title: "Spot the weak password",
        scenario: "Maria was born in 1952 and creates this password: Maria1952",
        question: "What makes this password weak?",
        options: [
          {
            text: "It uses personal information someone might guess.",
            tier: "best",
            feedback: "Birth years and names are often easy to discover or guess."
          },
          {
            text: "It includes her name.",
            tier: "safe",
            feedback: "That's half the problem — the birth year is the other half."
          },
          {
            text: "It has numbers, so it's automatically secure.",
            tier: "unsafe",
            feedback:
              "Numbers help only when they aren't predictable. A birth year is very predictable."
          }
        ]
      },
      {
        type: "tiered",
        title: "Which password is safer?",
        scenario: "Compare these three passwords.",
        question: "Which would usually be harder for someone to guess?",
        options: [
          {
            text: "BlueChair!River29",
            tier: "best",
            feedback:
              "Longer passwords with unrelated words are usually much harder to guess than names or simple number patterns."
          },
          {
            text: "Maple$Train88",
            tier: "safe",
            feedback: "Also good — unrelated words with a symbol and numbers."
          },
          {
            text: "John123",
            tier: "unsafe",
            feedback: "Short, a common name, and a predictable number sequence."
          }
        ]
      },
      {
        type: "tiered",
        title: "Think like a scammer",
        scenario:
          "You regularly post pictures of your dog, Buddy, on social media.",
        question: "Which password should you avoid?",
        options: [
          {
            text: "Buddy2026",
            tier: "best",
            feedback:
              "If someone knows your pet's name, they'll often try it as part of a password."
          },
          {
            text: "Buddy123",
            tier: "safe",
            feedback:
              "Also a poor choice for the same reason — you spotted the pattern."
          },
          {
            text: "GreenLamp!River84",
            tier: "unsafe",
            feedback:
              "This one is actually a good password — nothing about it connects to you."
          }
        ]
      },
      {
        type: "tiered",
        title: "Connect previous lessons",
        scenario:
          "Someone knows your birthday, your hometown, and your favorite sports team.",
        question: "Which password would be the safest?",
        options: [
          {
            text: "Cloud!Pencil74Garden",
            tier: "best",
            feedback:
              "You remembered that personal information shouldn't become part of your password."
          },
          {
            text: "River$Coffee82",
            tier: "safe",
            feedback: "Also unrelated to you, which is what matters."
          },
          {
            text: "Chicago1960",
            tier: "unsafe",
            feedback:
              "Hometown plus a birth year — both things the person already knows."
          }
        ]
      },
      {
        type: "confidence",
        question:
          "How confident do you feel choosing passwords that are difficult to guess?",
        practice: [
          {
            scenario: "Which password should you avoid?",
            question: "Choose the weakest option.",
            options: [
              {
                text: "Lucky123",
                tier: "best",
                feedback:
                  "Short, a common word, and a predictable number sequence."
              },
              {
                text: "Sarah1980",
                tier: "safe",
                feedback: "Also weak — a name plus a year."
              },
              {
                text: "Mountain!Apple92",
                tier: "unsafe",
                feedback: "This one is actually strong. Unrelated words work well."
              }
            ]
          },
          {
            scenario:
              "A friend says, \"I always use my birthday because I'll never forget it.\"",
            question: "Which response is the best?",
            options: [
              {
                text: "Birthdays are easy for other people to guess.",
                tier: "best",
                feedback: "Birthdays appear on social media, forms, and public records."
              },
              {
                text: "A password shouldn't contain obvious personal information.",
                tier: "safe",
                feedback: "The general rule, well stated."
              },
              {
                text: "Birthdays make excellent passwords.",
                tier: "unsafe",
                feedback: "They're among the first things anyone would try."
              }
            ]
          }
        ]
      },
      {
        type: "memory",
        links: [
          {
            lesson: "Lesson 5.1 — Your Information Is Valuable",
            note: "Your personal information has value. Don't use it as your password."
          },
          {
            lesson: "Lesson 5.2 — Your Password Is Your House Key",
            note: "A strong key is harder to copy. A strong password is harder to guess."
          }
        ]
      },
      {
        type: "finalboss",
        title: "\"Let's guess your password\"",
        setup:
          "You're creating a password for a new online account. You think about using Linda1965 because it's easy to remember. Then you realize someone could already know your first name, your birth year, and where you live.",
        question: "What should you do?",
        options: [
          {
            text: "Create a password that doesn't use your personal information and is much harder for someone else to guess.",
            tier: "best",
            feedback:
              "You thought like a scammer for a moment — and that helped you make a safer choice. Instead of only asking \"Will I remember this?\", you also asked \"Could someone else guess this?\""
          },
          {
            text: "Choose a longer password with unrelated words instead.",
            tier: "safe",
            feedback: "That's exactly the practical fix."
          },
          {
            text: "Use your name and birth year because you'll remember them.",
            tier: "unsafe",
            feedback:
              "Memorable to you also means memorable — and guessable — to anyone who knows you."
          }
        ],
        spotted: []
      }
    ],
    quiz: [],
    complete: {
      title: "Lesson complete!",
      subtitle: "You completed Don't Make It Easy to Guess.",
      habit: "Choose passwords that are hard for others to guess — not just easy for you to remember.",
      warningSign: "A password that says something about you.",
      skills: [
        "Identified weak passwords",
        "Avoided personal information",
        "Thought like a scammer to stay ahead"
      ],
      next: "One Password Isn't Enough"
    }
  },

  // ============================================================
  // LESSON 5.4
  // ============================================================
  {
    id: "scam-one-password-not-enough",
    track: "scam",
    phase: 105,
    order: 4,
    lessonNumber: "5.4",
    title: "One Password Isn't Enough",
    pathTitle: "One Key Per Door",
    badge: "Unique Keys",
    xp: 20,
    goals: [
      "Understand why reusing passwords is risky.",
      "Prioritize your email account for a unique password."
    ],
    blocks: [
      {
        type: "reading",
        heading: "One Password Isn't Enough",
        question: "Why can't I just use the same password everywhere?",
        objective:
          "Learn why every important account should have its own unique password.",
        warningSigns: PRIVACY_HABITS,
        text: "Imagine using the same key for your house, car, mailbox, and office. If someone copied that one key, they could unlock everything you own. Passwords work the same way. If you use the same password for several accounts and one website has a security problem, someone could try that same password on your email, bank account, or shopping accounts. Giving your most important accounts their own passwords helps keep one mistake from becoming many."
      },
      {
        type: "tiered",
        title: "The house key",
        scenario:
          "Jim uses the exact same password for his email, bank account, and shopping websites.",
        question: "What is the biggest problem?",
        options: [
          {
            text: "If one account is compromised, the others may also be at risk.",
            tier: "best",
            feedback: "Reusing passwords gives someone one key that can open many doors."
          },
          {
            text: "Someone only needs to learn one password.",
            tier: "safe",
            feedback: "The same point, put simply."
          },
          {
            text: "Using one password makes his accounts faster.",
            tier: "unsafe",
            feedback: "Convenience isn't the concern here — the shared risk is."
          }
        ]
      },
      {
        type: "tiered",
        title: "Which account matters most?",
        scenario:
          "If you could only create one unique password today, which account should be your highest priority?",
        question: "Choose the most important account to protect.",
        options: [
          {
            text: "Your email account.",
            tier: "best",
            feedback:
              "Your email often helps you reset passwords for your other accounts, making it one of your most important accounts to protect."
          },
          {
            text: "Your bank account.",
            tier: "safe",
            feedback:
              "Extremely important too — though whoever controls your email can often reset your bank password."
          },
          {
            text: "A website where you read the news.",
            tier: "unsafe",
            feedback: "Low risk — there's little to lose there."
          }
        ]
      },
      {
        type: "tiered",
        title: "Thinking ahead",
        scenario:
          "A shopping website you use announces that customer passwords were stolen.",
        question: "Which response is the best?",
        options: [
          {
            text: "Change your password there, and change it anywhere else you used the same password.",
            tier: "best",
            feedback:
              "If the same password was used elsewhere, changing only one account isn't enough."
          },
          {
            text: "Review your other important accounts for password reuse.",
            tier: "safe",
            feedback: "Exactly the follow-up step."
          },
          {
            text: "Do nothing because it wasn't your bank.",
            tier: "unsafe",
            feedback:
              "If that password also opens your bank, the shopping site was the doorway."
          }
        ]
      },
      {
        type: "tiered",
        title: "Connect previous lessons",
        scenario:
          "You create a long, difficult password. Now you're thinking about using it for every account.",
        question: "Which response is safe?",
        options: [
          {
            text: "Use different passwords for your important accounts.",
            tier: "best",
            feedback:
              "A strong password is helpful — but it becomes much safer when it protects only one account."
          },
          {
            text: "Give especially important accounts their own unique password.",
            tier: "safe",
            feedback: "A good realistic starting point."
          },
          {
            text: "Reuse the same strong password everywhere.",
            tier: "unsafe",
            feedback:
              "Strength doesn't help if the password is stolen from one site and tried on all the others."
          }
        ]
      },
      {
        type: "confidence",
        question:
          "How confident do you feel using different passwords for important accounts?",
        practice: [
          {
            scenario:
              "A friend says, \"I use the same password everywhere because it's easier.\"",
            question: "Which response is the best?",
            options: [
              {
                text: "One stolen password could unlock many accounts.",
                tier: "best",
                feedback: "The single strongest reason not to reuse."
              },
              {
                text: "Important accounts should have different passwords.",
                tier: "safe",
                feedback: "A realistic middle ground."
              },
              {
                text: "That's the safest approach.",
                tier: "unsafe",
                feedback: "It's the most convenient and the least safe."
              }
            ]
          },
          {
            scenario: "One of your old online accounts has a security problem.",
            question: "Which response is the best?",
            options: [
              {
                text: "Change the password anywhere else you reused it.",
                tier: "best",
                feedback: "The old account matters because of what it shares."
              },
              {
                text: "Review your important accounts.",
                tier: "safe",
                feedback: "A sensible sweep."
              },
              {
                text: "Ignore it because you don't use that website often.",
                tier: "unsafe",
                feedback:
                  "How often you use it doesn't matter — the password does."
              }
            ]
          }
        ]
      },
      {
        type: "memory",
        links: [
          {
            lesson: "Lesson 5.2 — Your Password Is Your House Key",
            note: "Today you learned that every important account deserves its own key."
          },
          {
            lesson: "Lesson 5.3 — Don't Make It Easy to Guess",
            note: "A strong password is even stronger when it's only used once."
          }
        ]
      },
      {
        type: "finalboss",
        title: "The security alert",
        setup:
          "You receive a legitimate email from an online store explaining that customer passwords may have been exposed in a security breach. You remember using the same password for the shopping website, your email, and your photo storage account.",
        messages: [
          {
            from: "Email · Online store",
            body:
              "We recently discovered a security incident that may have exposed customer passwords. We recommend changing your password as soon as possible."
          }
        ],
        question: "What should you do?",
        options: [
          {
            text: "Change the password for the shopping website and every other account where you used that same password, starting with your email.",
            tier: "best",
            feedback:
              "You recognized that the real risk wasn't the shopping website — it was reusing the same password elsewhere. Starting with email is right, because email can reset everything else."
          },
          {
            text: "Create a new, unique password for each important account.",
            tier: "safe",
            feedback: "The thorough fix, and worth the effort."
          },
          {
            text: "Change only the shopping website password because that's where the problem happened.",
            tier: "unsafe",
            feedback:
              "The breach happened there, but the danger travels to every account sharing that password."
          }
        ],
        spotted: []
      }
    ],
    quiz: [],
    complete: {
      title: "Lesson complete!",
      subtitle: "You completed One Password Isn't Enough.",
      habit: "Every important account deserves its own password.",
      warningSign: "One key that opens every door.",
      skills: [
        "Understood password reuse",
        "Prioritized email security",
        "Responded correctly to a breach notice"
      ],
      next: "Your Digital Keychain"
    }
  },

  // ============================================================
  // LESSON 5.5
  // ============================================================
  {
    id: "scam-password-manager",
    track: "scam",
    phase: 105,
    order: 5,
    lessonNumber: "5.5",
    title: "Your Digital Keychain",
    pathTitle: "Password Managers",
    badge: "Keychain Keeper",
    xp: 20,
    goals: [
      "Understand what a password manager does.",
      "Protect one strong master password."
    ],
    blocks: [
      {
        type: "reading",
        heading: "Your Digital Keychain",
        question: "How can I remember lots of different passwords?",
        objective:
          "Learn how a password manager can safely help you remember unique passwords without memorizing each one.",
        warningSigns: PRIVACY_HABITS,
        text: "Remembering a different password for every account can feel impossible. A password manager is a tool that securely stores your passwords in one place, much like a locked keychain holds many keys. Instead of remembering dozens of passwords, you only need to remember one strong master password. The password manager helps you create strong, unique passwords and fills them in when you need them. It's designed to make good security habits easier — not harder."
      },
      {
        type: "tiered",
        title: "Understanding password managers",
        scenario: "A friend says, \"I can't remember twenty different passwords.\"",
        question: "What could help?",
        options: [
          {
            text: "A password manager can securely remember them for you.",
            tier: "best",
            feedback:
              "Password managers make it much easier to use different passwords without memorizing them all."
          },
          {
            text: "Writing every password on sticky notes around the computer.",
            tier: "unsafe",
            feedback:
              "Anyone visiting your home can read them. A written list kept somewhere private is safer than sticky notes on the screen."
          },
          {
            text: "Using one password everywhere.",
            tier: "unsafe",
            feedback: "That's the exact problem you learned about in the last lesson."
          }
        ]
      },
      {
        type: "tiered",
        title: "The master password",
        scenario: "A password manager asks you to create one master password.",
        question: "Why is this password important?",
        options: [
          {
            text: "It protects access to all the passwords stored inside.",
            tier: "best",
            feedback: "Your master password protects your digital keychain."
          },
          {
            text: "It should be strong and memorable.",
            tier: "safe",
            feedback:
              "Both matter — this is the one password you'll actually need to remember."
          },
          {
            text: "It should be the same password you already use everywhere else.",
            tier: "unsafe",
            feedback:
              "That would hand over every account at once. The master password must be unique."
          }
        ]
      },
      {
        type: "tiered",
        title: "Everyday use",
        scenario: "You're creating a new online account.",
        question: "Which response is the best?",
        options: [
          {
            text: "Let the password manager create and save a unique password.",
            tier: "best",
            feedback:
              "Password managers help make strong security habits much easier."
          },
          {
            text: "Save the new password in the password manager.",
            tier: "safe",
            feedback: "The important part — it's stored and you don't have to recall it."
          },
          {
            text: "Reuse your old password because you'll remember it.",
            tier: "unsafe",
            feedback:
              "The manager exists precisely so you don't have to make that trade."
          }
        ]
      },
      {
        type: "tiered",
        title: "Connect previous lessons",
        scenario: "You now have unique passwords for every important account.",
        question: "How can you realistically keep track of them?",
        options: [
          {
            text: "Store them securely in a password manager.",
            tier: "best",
            feedback:
              "You solved the biggest problem with unique passwords: remembering them."
          },
          {
            text: "Remember your master password carefully.",
            tier: "safe",
            feedback: "That's the one to protect."
          },
          {
            text: "Change every password back to the same one.",
            tier: "unsafe",
            feedback: "That undoes everything Lesson 5.4 was about."
          }
        ]
      },
      {
        type: "confidence",
        question: "How confident do you feel using a password manager?",
        practice: [
          {
            scenario: "You create a new online account.",
            question: "Which response is the best?",
            options: [
              {
                text: "Save the password in your password manager.",
                tier: "best",
                feedback: "One step, and it's handled."
              },
              {
                text: "Let it generate a strong password if available.",
                tier: "safe",
                feedback: "Generated passwords are far stronger than invented ones."
              },
              {
                text: "Reuse an old password.",
                tier: "unsafe",
                feedback: "The manager removes the reason to do that."
              }
            ]
          },
          {
            scenario: "Someone asks, \"Why not just memorize everything?\"",
            question: "Which response is the best?",
            options: [
              {
                text: "A password manager helps you safely use different passwords without memorizing them all.",
                tier: "best",
                feedback: "That's the entire purpose of it."
              },
              {
                text: "It reduces the temptation to reuse passwords.",
                tier: "safe",
                feedback: "Which is the real security benefit."
              },
              {
                text: "Everyone can easily remember dozens of strong passwords.",
                tier: "unsafe",
                feedback:
                  "Almost nobody can, which is why people reuse them."
              }
            ]
          }
        ]
      },
      {
        type: "memory",
        links: [
          {
            lesson: "Lesson 5.3 — Don't Make It Easy to Guess",
            note: "Password managers help you create passwords that are difficult to guess."
          },
          {
            lesson: "Lesson 5.4 — One Password Isn't Enough",
            note: "They make it practical to have a different password for every important account."
          }
        ]
      },
      {
        type: "finalboss",
        title: "Setting up a new account",
        setup:
          "You're creating an account for a new online service. The website asks you to create a password. You remember that weak passwords are easy to guess, reusing passwords is risky, and it's hard to remember dozens of unique ones.",
        question: "What should you do?",
        options: [
          {
            text: "Create a new, unique password and save it in your password manager.",
            tier: "best",
            feedback:
              "This brought together everything you've learned about passwords: one that's hard to guess, used for only one account, and safely stored for later."
          },
          {
            text: "Use a strong password that isn't based on personal information.",
            tier: "safe",
            feedback: "Strong and impersonal — two of the three boxes ticked."
          },
          {
            text: "Reuse your email password because you'll remember it.",
            tier: "unsafe",
            feedback:
              "Your email password is the single worst one to reuse, since email can reset your other accounts."
          }
        ],
        spotted: []
      }
    ],
    quiz: [],
    complete: {
      title: "Lesson complete!",
      subtitle: "You completed Your Digital Keychain.",
      habit: "Let your password manager remember your passwords — so you don't have to.",
      warningSign: "Reusing a password because it's easier to recall.",
      skills: [
        "Learned what a password manager is",
        "Protected a master password",
        "Built a practical password system"
      ],
      next: "A Second Lock on Your Account"
    }
  },

  // ============================================================
  // LESSON 5.6
  // ============================================================
  {
    id: "scam-two-step",
    track: "scam",
    phase: 105,
    order: 6,
    lessonNumber: "5.6",
    title: "A Second Lock on Your Account",
    pathTitle: "Two-Step Codes",
    badge: "Double Locked",
    xp: 20,
    goals: [
      "Understand how two-step verification protects you.",
      "Never share a verification code with anyone."
    ],
    blocks: [
      {
        type: "reading",
        heading: "A Second Lock on Your Account",
        question: "Why do some accounts ask for a code after I enter my password?",
        objective:
          "Learn how two-step verification adds another layer of protection to your accounts.",
        warningSigns: PRIVACY_HABITS,
        text: "Imagine locking your front door and then placing a second lock behind it. Even if someone somehow got your house key, they'd still have another lock to get through. Two-step verification works the same way. After you enter your password, the website may send a one-time code to your phone. You enter that code to prove it's really you. If someone steals your password but doesn't have your phone, they usually can't get into your account. Just remember: those codes are only for you. Never share them with anyone."
      },
      {
        type: "tiered",
        title: "Why two locks?",
        scenario:
          "You log into your email account. After entering your password, you're asked to enter a six-digit code sent to your phone.",
        question: "Why is the website asking for the code?",
        options: [
          {
            text: "To make sure it's really you.",
            tier: "best",
            feedback:
              "The extra code helps protect your account, even if someone learns your password."
          },
          {
            text: "To add another layer of security.",
            tier: "safe",
            feedback: "Exactly what it is."
          },
          {
            text: "Because your password stopped working.",
            tier: "unsafe",
            feedback:
              "Your password worked fine — this is the second step, not a problem."
          }
        ]
      },
      {
        type: "tiered",
        title: "The secret code",
        scenario:
          "You receive a text message with a verification code. Seconds later someone calls saying, \"I'm from customer support. Please read me that code.\"",
        question: "Which response is the best?",
        options: [
          {
            text: "Never share the verification code.",
            tier: "best",
            feedback:
              "Verification codes are meant only for you. Legitimate companies won't ask you to read them over the phone."
          },
          {
            text: "End the call if you didn't request help.",
            tier: "safe",
            feedback: "Hanging up ends it immediately."
          },
          {
            text: "Read them the code because they already know your name.",
            tier: "unsafe",
            feedback:
              "That code is the second lock. Reading it aloud opens it for them — and the timing of the call proves they're trying to log in right now."
          }
        ]
      },
      {
        type: "tiered",
        title: "Recognizing a warning sign",
        scenario: "You receive a verification code even though you weren't trying to log in.",
        question: "What should you do?",
        options: [
          {
            text: "Don't share the code and check whether someone may be trying to access your account.",
            tier: "best",
            feedback:
              "An unexpected verification code may mean someone knows your password and is trying to log in."
          },
          {
            text: "Change your password if you're concerned.",
            tier: "safe",
            feedback: "A sensible protective step."
          },
          {
            text: "Send the code to anyone who asks for it.",
            tier: "unsafe",
            feedback: "That completes the login they were attempting."
          }
        ]
      },
      {
        type: "tiered",
        title: "Putting it together",
        scenario:
          "Someone somehow learns your password. Your account uses two-step verification.",
        question: "Why is your account still better protected?",
        options: [
          {
            text: "They would also need your verification code or trusted device.",
            tier: "best",
            feedback:
              "Two-step verification doesn't replace your password — it strengthens it."
          },
          {
            text: "The second step makes it much harder to sign in.",
            tier: "safe",
            feedback: "The practical effect."
          },
          {
            text: "Your password no longer matters.",
            tier: "unsafe",
            feedback:
              "It still matters. The second lock is an addition, not a replacement."
          }
        ]
      },
      {
        type: "confidence",
        question: "How confident do you feel using two-step verification?",
        practice: [
          {
            scenario: "Your bank offers two-step verification.",
            question: "Which response is the best?",
            options: [
              {
                text: "Turn it on if it's available.",
                tier: "best",
                feedback: "It's one of the most effective protections available."
              },
              {
                text: "Learn how it works before using it.",
                tier: "safe",
                feedback: "Understanding it first is perfectly reasonable."
              },
              {
                text: "Ignore it because passwords are enough.",
                tier: "unsafe",
                feedback: "Passwords alone can be stolen. The second lock helps."
              }
            ]
          },
          {
            scenario:
              "A friend asks, \"Can you text me the verification code you just received?\"",
            question: "Which response is the best?",
            options: [
              {
                text: "No. Verification codes should never be shared.",
                tier: "best",
                feedback: "Not with anyone — including people you know."
              },
              {
                text: "Ask why they would need it before responding.",
                tier: "safe",
                feedback:
                  "Worth asking — and note their account may have been taken over."
              },
              {
                text: "Send the code because they're your friend.",
                tier: "unsafe",
                feedback:
                  "A real friend has no use for your code. Someone using their account does."
              }
            ]
          }
        ]
      },
      {
        type: "memory",
        links: [
          {
            lesson: "Lesson 5.2 — Your Password Is Your House Key",
            note: "Two-step verification adds a second lock after your password."
          },
          {
            lesson: "Lesson 5.5 — Your Digital Keychain",
            note: "Even with a password manager, two-step gives important accounts more protection."
          }
        ]
      },
      {
        type: "finalboss",
        title: "\"I just need the code\"",
        setup:
          "You receive a text message with a six-digit verification code. Immediately afterward, your phone rings. The caller sounds calm and already knows your name.",
        messages: [
          {
            from: "Text · Automated",
            body: "Your verification code is 481 293. Do not share this code with anyone."
          },
          {
            from: "Incoming call · \"Support\"",
            body:
              "Don't worry. Our system accidentally sent you a code. Could you please read it to me so I can cancel it?"
          }
        ],
        question: "What should you do?",
        options: [
          {
            text: "Do not share the code. End the call. If you're concerned, contact the company using its official phone number or website.",
            tier: "best",
            feedback:
              "The code was protecting your account. By refusing to share it, you kept the second lock exactly where it belongs."
          },
          {
            text: "Remember that verification codes are only meant for you.",
            tier: "safe",
            feedback: "The message itself said so."
          },
          {
            text: "Read the code because they sounded professional.",
            tier: "unsafe",
            feedback:
              "Notice the timing — the code arrived because someone was already trying to log in with your password. The call existed only to get the second lock opened."
          }
        ],
        spotted: [
          "Unexpected contact",
          "A request for a verification code",
          "Suspicious timing"
        ]
      }
    ],
    quiz: [],
    complete: {
      title: "Lesson complete!",
      subtitle: "You completed A Second Lock on Your Account.",
      habit: "Verification codes are for you — and only you.",
      warningSign: "Anyone asking you to read out a code.",
      skills: [
        "Understood two-step verification",
        "Protected a verification code",
        "Recognized suspicious timing"
      ],
      next: "If Something Goes Wrong"
    }
  },

  // ============================================================
  // LESSON 5.7
  // ============================================================
  {
    id: "scam-if-something-goes-wrong",
    track: "scam",
    phase: 105,
    order: 7,
    lessonNumber: "5.7",
    title: "If Something Goes Wrong",
    pathTitle: "If It Goes Wrong",
    badge: "Calm Responder",
    xp: 20,
    goals: [
      "Know the first steps after a mistake or a compromised account.",
      "Act quickly without panicking."
    ],
    blocks: [
      {
        type: "reading",
        heading: "If Something Goes Wrong",
        question: "What should I do if I think I've made a mistake?",
        objective:
          "Learn what to do if you think one of your accounts has been compromised or you've shared information by mistake.",
        warningSigns: PRIVACY_HABITS,
        text: "Even careful people sometimes click the wrong link, share information by mistake, or discover that an account has been affected by a security problem. The important thing is not to panic. Acting quickly can often reduce the risk. If you think an account has been compromised, change its password, especially if it was reused elsewhere. If the issue involves your bank or another important service, contact them using their official phone number or website — not information from a suspicious message."
      },
      {
        type: "tiered",
        title: "First things first",
        scenario: "You accidentally entered your password on a fake website.",
        question: "What should you do first?",
        options: [
          {
            text: "Change your password as soon as possible.",
            tier: "best",
            feedback: "Acting quickly gives you the best chance to protect your account."
          },
          {
            text: "Stop using that password on any other accounts.",
            tier: "safe",
            feedback: "Important too — anywhere it was reused is now at risk."
          },
          {
            text: "Wait a few weeks to see what happens.",
            tier: "unsafe",
            feedback:
              "Waiting gives whoever has it time to use it."
          }
        ]
      },
      {
        type: "tiered",
        title: "Staying calm",
        scenario: "You realize you clicked a suspicious email link.",
        question: "Which response is the best?",
        options: [
          {
            text: "Stay calm and start securing your accounts.",
            tier: "best",
            feedback: "Quick action is much more helpful than panic."
          },
          {
            text: "Contact the organization directly if needed.",
            tier: "safe",
            feedback: "Using contact details you look up yourself."
          },
          {
            text: "Panic because nothing can be done.",
            tier: "unsafe",
            feedback:
              "A great deal can be done, and clicking a link alone often causes no harm at all."
          }
        ]
      },
      {
        type: "tiered",
        title: "Contacting the right people",
        scenario: "You think someone may have accessed your bank account.",
        question: "Which response is the best?",
        options: [
          {
            text: "Call your bank using the phone number on your bank card or official website.",
            tier: "best",
            feedback:
              "Always contact important organizations yourself using trusted contact information."
          },
          {
            text: "Follow the bank's instructions after contacting them.",
            tier: "safe",
            feedback: "Once you've reached the real bank, they'll guide you."
          },
          {
            text: "Reply to the suspicious message for help.",
            tier: "unsafe",
            feedback:
              "That reaches the people who caused the problem."
          }
        ]
      },
      {
        type: "tiered",
        title: "Bringing it all together",
        scenario:
          "You accidentally shared your password with someone pretending to be customer support.",
        question: "Which response is safe?",
        options: [
          {
            text: "Change your password immediately and check your account for unusual activity.",
            tier: "best",
            feedback:
              "Mistakes happen. The important thing is acting quickly and using the safety habits you've practiced."
          },
          {
            text: "Contact the company through its official website or phone number if needed.",
            tier: "safe",
            feedback: "They can also check for unusual access."
          },
          {
            text: "Assume everything is fine because they sounded trustworthy.",
            tier: "unsafe",
            feedback:
              "Sounding trustworthy was the whole method. Change the password now."
          }
        ]
      },
      {
        type: "confidence",
        question:
          "How confident do you feel responding if one of your accounts is at risk?",
        practice: [
          {
            scenario: "A website tells you your password may have been exposed.",
            question: "Which response is the best?",
            options: [
              {
                text: "Change your password immediately.",
                tier: "best",
                feedback: "Fast action limits the risk."
              },
              {
                text: "Change it anywhere else you reused it.",
                tier: "safe",
                feedback: "The essential follow-up."
              },
              {
                text: "Ignore the message.",
                tier: "unsafe",
                feedback: "Breach notices are worth acting on."
              }
            ]
          },
          {
            scenario: "You notice a login notification from another city.",
            question: "Which response is the best?",
            options: [
              {
                text: "Secure your account and change your password if you don't recognize the login.",
                tier: "best",
                feedback: "An unfamiliar login is worth treating seriously."
              },
              {
                text: "Review recent account activity.",
                tier: "safe",
                feedback: "It will show you what, if anything, happened."
              },
              {
                text: "Assume it's a computer error.",
                tier: "unsafe",
                feedback: "It may be — but checking costs a minute."
              }
            ]
          }
        ]
      },
      {
        type: "memory",
        links: [
          {
            lesson: "Lesson 1.1 — The Pause Button",
            note: "Even after a mistake, slowing down helps you make good decisions."
          },
          {
            lesson: "Lesson 5.6 — A Second Lock on Your Account",
            note: "Two-step verification can protect your account even if your password is exposed."
          }
        ]
      },
      {
        type: "finalboss",
        title: "\"Something doesn't look right\"",
        setup:
          "One morning, you receive an email saying your email account was accessed from a device you don't recognize. You weren't traveling, and you don't recognize the location.",
        messages: [
          {
            from: "Email · Your email provider",
            body:
              "New sign-in detected: Windows device, location approximately 400 miles from your usual sign-in area. If this wasn't you, secure your account."
          }
        ],
        question: "What should you do?",
        options: [
          {
            text: "Sign in using the official website, change your password, review your account activity, and contact the provider if needed.",
            tier: "best",
            feedback:
              "This lesson wasn't about avoiding mistakes — it was about knowing how to respond when something seems wrong. The faster you act, the better you protect your accounts."
          },
          {
            text: "Check that your recovery phone number and email address are still correct.",
            tier: "safe",
            feedback:
              "An excellent detail — attackers often change recovery details to lock you out."
          },
          {
            text: "Ignore the message because it might go away on its own.",
            tier: "unsafe",
            feedback:
              "Note that you should reach your account by typing the address yourself rather than using a link in the email — but ignoring a genuine alert leaves someone inside your account."
          }
        ],
        spotted: ["Unfamiliar account access", "A situation needing quick action"]
      }
    ],
    quiz: [],
    complete: {
      title: "Phase 5 complete!",
      subtitle: "You completed If Something Goes Wrong — and all of Phase 5.",
      habit: "If something doesn't look right, stay calm and act quickly.",
      warningSign: "Account activity you don't recognize.",
      skills: [
        "Responded calmly to a security concern",
        "Secured a compromised account",
        "Contacted organizations safely"
      ],
      learned: [
        "Ask why anyone needs your information.",
        "Your password is your house key — keep it private.",
        "Make passwords hard to guess, and use a different one for each account.",
        "A password manager makes that practical.",
        "Two-step verification adds a second lock.",
        "Mistakes happen. Responding quickly is what protects you."
      ],
      next: "Phase 6: Smart Communication"
    }
  }
];

export default scamPhase5Lessons;
