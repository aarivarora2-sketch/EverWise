// Everwise - Scam Protection track
// Phase 3: The Masks Scammers Wear
//
// The disguise changes every lesson. The warning signs never do. Each Final
// Boss deliberately uses a different channel — call, text, pop-up, email,
// letter — so learners see the same five signs arrive in different envelopes.

import { WARNING_SIGNS } from "./scam-phase2-lessons";

// Shown at the top of every reading in this phase.
const REMINDER = WARNING_SIGNS;

export const scamPhase3Lessons = [
  // ============================================================
  // LESSON 3.1
  // ============================================================
  {
    id: "scam-anyone-can-pretend",
    track: "scam",
    phase: 103,
    order: 1,
    lessonNumber: "3.1",
    title: "Anyone Can Pretend",
    pathTitle: "Anyone Can Pretend",
    badge: "Mask Spotter",
    xp: 20,
    goals: [
      "Understand that logos, uniforms, and titles can all be copied.",
      "Rely on warning signs rather than appearances."
    ],
    blocks: [
      {
        type: "reading",
        heading: "Anyone Can Pretend",
        question: "How do I know they're really who they say they are?",
        objective:
          "Learn that anyone can pretend to be a trusted person or organization, so you should rely on warning signs instead of appearances.",
        warningSigns: REMINDER,
        text: "Scammers often pretend to be people you already trust, such as bank employees, police officers, utility workers, or computer technicians. Some even use official logos, uniforms, or caller ID to look convincing. A familiar name or professional appearance does not prove someone is real. Instead of focusing on who they claim to be, look for the warning signs you've already learned and always verify their identity yourself."
      },
      {
        type: "tiered",
        title: "Spot the red flag",
        scenario: "Someone unexpectedly calls and says they work for your bank.",
        question: "What should you remember first?",
        options: [
          {
            text: "Anyone can claim to work for a trusted company.",
            tier: "best",
            feedback:
              "Anyone can claim to represent a trusted organization. Their words alone are not proof."
          },
          {
            text: "Banks only call when there is a problem.",
            tier: "unsafe",
            feedback:
              "Whether banks call isn't the point — whether this caller is really your bank is."
          },
          {
            text: "Their job title proves they are real.",
            tier: "unsafe",
            feedback: "A job title is just words. Anyone can say them."
          }
        ]
      },
      {
        type: "tiered",
        title: "Choose the safest response",
        scenario:
          "A person claims to be from your electric company and asks you to confirm your account information.",
        question: "What should you do?",
        options: [
          {
            text: "Verify the request by contacting the electric company yourself.",
            tier: "best",
            feedback:
              "Knowing your address or other basic information does not prove someone's identity."
          },
          {
            text: "Give them the information because they knew your address.",
            tier: "unsafe",
            feedback:
              "Addresses are public. Knowing yours is not a credential."
          },
          {
            text: "Stay on the phone until they finish explaining.",
            tier: "unsafe",
            feedback:
              "A longer explanation isn't better evidence. Verify independently."
          }
        ]
      },
      {
        type: "tiered",
        title: "Apply the lesson",
        scenario:
          "A visitor arrives wearing a company uniform and says they need access to check your equipment.",
        question: "What is the safest first step?",
        options: [
          {
            text: "Verify the visit with the company before allowing access.",
            tier: "best",
            feedback:
              "Uniforms, badges, and logos can all be copied. Verification is the safest choice, and a real worker will wait."
          },
          {
            text: "Let them inside because they are wearing a uniform.",
            tier: "unsafe",
            feedback: "Uniforms can be bought online for very little."
          },
          {
            text: "Assume they are real because they have a badge.",
            tier: "unsafe",
            feedback: "Badges are just as easy to fake as uniforms."
          }
        ]
      },
      {
        type: "tiered",
        title: "Real-life decision",
        scenario: "A text message uses your bank's logo and asks you to click a link.",
        question: "What should you remember?",
        options: [
          {
            text: "A company logo does not prove the message is real.",
            tier: "best",
            feedback:
              "Scammers can copy logos and branding. Always verify through an official source."
          },
          {
            text: "Logos cannot be copied.",
            tier: "unsafe",
            feedback: "A logo is an image. It can be copied in one click."
          },
          {
            text: "Clicking the link is the fastest way to find out.",
            tier: "unsafe",
            feedback:
              "Clicking is how you find out the hard way. Check independently instead."
          }
        ]
      },
      {
        type: "confidence",
        question: "How confident do you feel recognizing that appearances are not proof?",
        practice: [
          {
            scenario: "Someone says they work for the IRS and asks for personal information.",
            question: "What should you remember first?",
            options: [
              {
                text: "Anyone can claim to work for an organization.",
                tier: "best",
                feedback: "A claim is not proof. Always verify independently."
              },
              {
                text: "Government employees never make mistakes.",
                tier: "unsafe",
                feedback:
                  "The issue isn't mistakes — it's whether this person works there at all."
              },
              {
                text: "The caller must be real.",
                tier: "unsafe",
                feedback: "Nothing so far has shown that."
              }
            ]
          },
          {
            scenario: "An email looks exactly like one you've received from your bank before.",
            question: "What should you do?",
            options: [
              {
                text: "Verify it using your bank's official website or app.",
                tier: "best",
                feedback: "Professional-looking messages can still be fake."
              },
              {
                text: "Trust it because it looks familiar.",
                tier: "unsafe",
                feedback:
                  "Looking familiar is the goal of a good forgery."
              },
              {
                text: "Reply to the email.",
                tier: "unsafe",
                feedback: "A reply reaches only the sender."
              }
            ]
          }
        ]
      },
      {
        type: "finalboss",
        title: "The utility worker",
        setup:
          "Someone knocks on your door wearing an electric company uniform. They say they need to inspect your meter and ask to come inside. They have a badge, and a company truck is parked outside.",
        question: "What should you do first?",
        options: [
          {
            text: "Contact the electric company using an official phone number to verify the visit before allowing access.",
            tier: "best",
            feedback:
              "You remembered that appearances are not proof. Verifying protects you while still letting legitimate workers do their job if the visit is real."
          },
          {
            text: "Let them inside because everything looks official.",
            tier: "unsafe",
            feedback:
              "Uniforms, badges, and even vehicle signage can all be arranged. A genuine worker will not mind waiting while you call."
          }
        ],
        spotted: ["Unexpected contact", "Appearances used as proof"]
      }
    ],
    quiz: [],
    complete: {
      title: "Lesson complete!",
      subtitle: "You completed Anyone Can Pretend.",
      habit: "Verify people by what you know — not by what they claim.",
      warningSign: "A trusted name without proof.",
      skills: [
        "Looked past a convincing appearance",
        "Verified before granting access",
        "Recognized a familiar name as a disguise"
      ],
      next: "Government & Law Enforcement"
    }
  },

  // ============================================================
  // LESSON 3.2
  // ============================================================
  {
    id: "scam-government",
    track: "scam",
    phase: 103,
    order: 2,
    lessonNumber: "3.2",
    title: "Government & Law Enforcement",
    pathTitle: "Government Calls",
    badge: "Authority Checker",
    xp: 20,
    goals: [
      "Know that a government title is not proof of identity.",
      "Apply the same warning signs regardless of who is claimed."
    ],
    blocks: [
      {
        type: "reading",
        heading: "Government & Law Enforcement",
        question: "Why would someone claim to be from the government?",
        objective:
          "Learn that someone claiming to be from the government or law enforcement should still be verified before you trust them.",
        warningSigns: REMINDER,
        text: "Government agencies and law enforcement play important roles in our communities, which is why scammers sometimes pretend to represent them. Hearing names like the IRS, Social Security Administration, or local police can make people feel nervous or pressured to cooperate. Remember the warning signs you've already learned: unexpected contact, pressure to act quickly, requests for secrecy, unusual payment methods, and refusing to let you verify who they are. A government title does not change the rules."
      },
      {
        type: "tiered",
        title: "Spot the red flag",
        scenario: "Someone unexpectedly calls and says, \"I'm with the IRS.\"",
        question: "What should you remember first?",
        options: [
          {
            text: "Anyone can claim to work for the government.",
            tier: "best",
            feedback: "A government title is not proof of identity."
          },
          {
            text: "Government callers are always legitimate.",
            tier: "unsafe",
            feedback:
              "The real agency is legitimate. This caller has not shown they are the real agency."
          },
          {
            text: "They sounded official.",
            tier: "unsafe",
            feedback: "Sounding official is the entire performance."
          }
        ]
      },
      {
        type: "tiered",
        title: "Choose the safest response",
        scenario: "The caller asks you to confirm personal information.",
        question: "What should you do?",
        options: [
          {
            text: "End the call and verify the request using an official government phone number.",
            tier: "best",
            feedback:
              "You should always verify independently before sharing personal information."
          },
          {
            text: "Answer their questions first.",
            tier: "unsafe",
            feedback:
              "Answering first means the information is gone before you've checked anything."
          },
          {
            text: "Stay on the phone until they finish.",
            tier: "unsafe",
            feedback: "Staying on the line only increases the pressure."
          }
        ]
      },
      {
        type: "tiered",
        title: "Apply the lesson",
        scenario:
          "The caller says, \"If you don't respond today, you'll face serious consequences.\"",
        question: "Which warning sign do you notice?",
        options: [
          {
            text: "They're trying to rush you.",
            tier: "best",
            feedback:
              "Notice how the warning sign — not the story — is what matters."
          },
          {
            text: "They mentioned the government.",
            tier: "safe",
            feedback:
              "Worth noticing, though plenty of honest messages mention agencies. The threat of same-day consequences is the sharper signal."
          },
          {
            text: "They used formal language.",
            tier: "unsafe",
            feedback: "Formality is easy to imitate."
          }
        ]
      },
      {
        type: "tiered",
        title: "Connect previous lessons",
        scenario:
          "An unexpected caller claims to be from a government agency, asks you not to tell anyone, and wants payment using gift cards.",
        question: "How many warning signs can you identify?",
        options: [
          {
            text: "Four — unexpected contact, secrecy, rushing, and a strange payment method.",
            tier: "best",
            feedback:
              "This lesson isn't about memorizing government scams — it's about recognizing the same warning signs you've already learned."
          },
          {
            text: "Two.",
            tier: "unsafe",
            feedback:
              "Look again: the call was unexpected, secrecy was requested, urgency was applied, and gift cards were demanded."
          },
          {
            text: "One.",
            tier: "unsafe",
            feedback:
              "There are four here. Spotting several together makes the picture unmistakable."
          }
        ]
      },
      {
        type: "confidence",
        question:
          "How confident do you feel handling callers who claim government authority?",
        practice: [
          {
            scenario:
              "A caller says they are from the Social Security Administration and your number has been suspended.",
            question: "What should you do?",
            options: [
              {
                text: "Hang up and contact the agency using an official number.",
                tier: "best",
                feedback:
                  "Social Security numbers are not suspended by phone call. Verify independently."
              },
              {
                text: "Give them your number to check.",
                tier: "unsafe",
                feedback:
                  "That is the exact information the scam exists to collect."
              },
              {
                text: "Stay on the line to sort it out.",
                tier: "unsafe",
                feedback: "Staying on the line is what keeps the pressure on."
              }
            ]
          },
          {
            scenario: "A caller claiming to be police demands payment to avoid arrest.",
            question: "What is the biggest warning sign?",
            options: [
              {
                text: "Police do not take payments over the phone to cancel arrests.",
                tier: "best",
                feedback:
                  "No real law enforcement agency collects money by phone to make a problem go away."
              },
              {
                text: "They sounded serious.",
                tier: "unsafe",
                feedback: "Seriousness is part of the act."
              },
              {
                text: "They called in the evening.",
                tier: "unsafe",
                feedback: "Timing is irrelevant."
              }
            ]
          }
        ]
      },
      {
        type: "finalboss",
        title: "The IRS call",
        setup: "Your phone rings.",
        messages: [
          {
            from: "Incoming call · Unknown number",
            body:
              "This is the IRS. Our records show you owe back taxes. Do not discuss this call with anyone. Payment must be made today, using gift cards, or a warrant will be issued."
          }
        ],
        question: "What should you do first?",
        options: [
          {
            text: "Hang up and verify the claim using the IRS's official contact information.",
            tier: "best",
            feedback:
              "You didn't just recognize one warning sign — you recognized several. The caller contacted you unexpectedly, created urgency, asked for secrecy, and requested an unusual payment method."
          },
          {
            text: "Purchase the gift cards.",
            tier: "unsafe",
            feedback:
              "The IRS contacts people by mail and never accepts gift cards. Every element of that call was a warning sign."
          },
          {
            text: "Stay on the phone until you understand the situation.",
            tier: "unsafe",
            feedback:
              "Understanding won't come from them. Hang up and check with the real agency."
          }
        ],
        spotted: [
          "Unexpected contact",
          "Requests for secrecy",
          "Pressure to hurry",
          "Unusual payment method"
        ]
      }
    ],
    quiz: [],
    complete: {
      title: "Lesson complete!",
      subtitle: "You completed Government & Law Enforcement.",
      habit: "A government title is not proof. Verify first.",
      warningSign: "Authority without verification.",
      skills: [
        "Recognized authority as a disguise",
        "Spotted four warning signs at once",
        "Verified with the real agency"
      ],
      next: "Your Bank"
    }
  },

  // ============================================================
  // LESSON 3.3
  // ============================================================
  {
    id: "scam-your-bank",
    track: "scam",
    phase: 103,
    order: 3,
    lessonNumber: "3.3",
    title: "Your Bank",
    pathTitle: "Your Bank",
    badge: "Bank Guard",
    xp: 20,
    goals: [
      "Verify anyone claiming to be your bank.",
      "Recognize the \"safe account\" transfer scam."
    ],
    blocks: [
      {
        type: "reading",
        heading: "Your Bank",
        question: "Why would someone pretend to be my bank?",
        objective:
          "Learn that someone claiming to be from your bank should still be verified before you trust them.",
        warningSigns: REMINDER,
        text: "Your bank works hard to protect your money, which is why scammers often pretend to represent it. They may say there is suspicious activity on your account or that they need your help to stop fraud. These stories are meant to get your attention, but they do not change the rules you've already learned. If someone contacts you unexpectedly about your money, slow down and verify the situation by contacting your bank yourself using an official phone number or your banking app."
      },
      {
        type: "tiered",
        title: "Spot the red flag",
        scenario:
          "Your phone rings. The caller says, \"Hello, this is the fraud department from your bank.\"",
        question: "What should you remember first?",
        options: [
          {
            text: "Anyone can claim to be from your bank.",
            tier: "best",
            feedback: "A familiar company name is not proof of identity."
          },
          {
            text: "Fraud departments only call when something is wrong.",
            tier: "unsafe",
            feedback:
              "The question is whether this is your bank's fraud department at all."
          },
          {
            text: "Banks always know best.",
            tier: "unsafe",
            feedback: "Your bank might. This caller may not be your bank."
          }
        ]
      },
      {
        type: "tiered",
        title: "Choose the safest response",
        scenario:
          "The caller says they detected suspicious charges and asks you to verify your account information.",
        question: "What should you do?",
        options: [
          {
            text: "Hang up and contact your bank using the number on your card or official app.",
            tier: "best",
            feedback:
              "You are choosing to verify the situation yourself instead of trusting an unexpected caller."
          },
          {
            text: "Give them the information because they called first.",
            tier: "unsafe",
            feedback:
              "Calling first is a reason for caution, never a reason for trust."
          },
          {
            text: "Stay on the phone until they explain everything.",
            tier: "unsafe",
            feedback:
              "A fuller explanation from an unverified caller is still unverified."
          }
        ]
      },
      {
        type: "tiered",
        title: "Apply the lesson",
        scenario:
          "You receive a text message that says, \"Your debit card has been locked. Tap here to unlock it.\"",
        question: "What is the safest first step?",
        options: [
          {
            text: "Open your bank's official app or website yourself.",
            tier: "best",
            feedback:
              "Always start from a trusted source that you chose — not one chosen for you."
          },
          {
            text: "Tap the link immediately.",
            tier: "unsafe",
            feedback:
              "If your card really is locked, your own app will tell you."
          },
          {
            text: "Reply to the text asking if it is real.",
            tier: "unsafe",
            feedback: "The sender will always say yes."
          }
        ]
      },
      {
        type: "tiered",
        title: "Connect previous lessons",
        scenario:
          "An unexpected caller claims to be from your bank. They tell you to keep the call private, insist you must act immediately, and ask you to move your money to a \"safe account.\"",
        question: "How many warning signs do you notice?",
        options: [
          {
            text: "Four — unexpected contact, secrecy, rushing, and no independent verification.",
            tier: "best",
            feedback:
              "The story changed — but the warning signs stayed exactly the same. Also note: your bank will never ask you to move money to a \"safe account.\" That account belongs to the scammer."
          },
          {
            text: "Three.",
            tier: "safe",
            feedback:
              "Close. There are four: unexpected contact, secrecy, rushing, and refusing verification."
          },
          {
            text: "Two.",
            tier: "unsafe",
            feedback:
              "Look again — count the unexpected call, the secrecy, the urgency, and the lack of verification."
          }
        ]
      },
      {
        type: "confidence",
        question: "How confident do you feel recognizing fake bank contacts?",
        practice: [
          {
            scenario:
              "A caller says, \"We need your online banking password to protect your account.\"",
            question: "What should you do?",
            options: [
              {
                text: "End the call and contact your bank yourself.",
                tier: "best",
                feedback:
                  "Unexpected callers should never receive your passwords or account information. Your bank never needs your password."
              },
              {
                text: "Give them your password.",
                tier: "unsafe",
                feedback:
                  "No bank employee will ever ask for your password. Ever."
              },
              {
                text: "Ask why they need it before deciding.",
                tier: "unsafe",
                feedback:
                  "They will have a ready answer. There is no good reason, so don't invite one."
              }
            ]
          },
          {
            scenario:
              "A text message says, \"Your account is frozen. Click here to restore access.\"",
            question: "What is the safest first step?",
            options: [
              {
                text: "Open your bank's official app or website yourself.",
                tier: "best",
                feedback: "Use a trusted source that you already know is real."
              },
              {
                text: "Tap the message link.",
                tier: "unsafe",
                feedback: "That link leads wherever the sender chose."
              },
              {
                text: "Reply asking what happened.",
                tier: "unsafe",
                feedback: "Replies only reach the sender."
              }
            ]
          }
        ]
      },
      {
        type: "finalboss",
        title: "The fraud department",
        setup:
          "Your phone rings. The caller says they work in your bank's fraud department.",
        messages: [
          {
            from: "Incoming call · \"Your Bank\"",
            body:
              "We've detected suspicious activity. Please stay on the line while I help you move your money to a safe account. Don't discuss this with anyone — it could interfere with our investigation."
          }
        ],
        question: "What should you do first?",
        options: [
          {
            text: "Hang up and contact your bank using the number on your bank card or your banking app.",
            tier: "best",
            feedback:
              "You recognized several warning signs at once — unexpected contact, secrecy, rushing, and refusing verification. Most importantly, you remembered that the person changed, but your safety habits didn't."
          },
          {
            text: "Move your money immediately.",
            tier: "unsafe",
            feedback:
              "There is no such thing as a \"safe account\" your bank moves you to over the phone. That account belongs to the scammer, and the transfer cannot be undone."
          },
          {
            text: "Stay on the phone and follow their instructions.",
            tier: "unsafe",
            feedback:
              "Being kept on the line is how they stop you checking with the real bank."
          }
        ],
        spotted: [
          "Unexpected contact",
          "Requests for secrecy",
          "Pressure to hurry",
          "Refusing independent verification"
        ]
      }
    ],
    quiz: [],
    complete: {
      title: "Lesson complete!",
      subtitle: "You completed Your Bank.",
      habit: "Even if someone claims to be your bank, verify before you trust.",
      warningSign: "A \"safe account\" you're told to move money into.",
      skills: [
        "Refused to move money on request",
        "Protected your banking password",
        "Verified through your own app"
      ],
      next: "Computer & Tech Support"
    }
  },

  // ============================================================
  // LESSON 3.4
  // ============================================================
  {
    id: "scam-tech-support",
    track: "scam",
    phase: 103,
    order: 4,
    lessonNumber: "3.4",
    title: "Computer & Tech Support",
    pathTitle: "Tech Support",
    badge: "Tech Support Skeptic",
    xp: 20,
    goals: [
      "Recognize that real tech companies don't call you about viruses.",
      "Never grant remote access to someone who contacted you."
    ],
    blocks: [
      {
        type: "reading",
        heading: "Computer & Tech Support",
        question: "How do I know if my computer really has a problem?",
        objective:
          "Learn that unexpected tech support requests should always be verified before giving someone access to your computer or personal information.",
        warningSigns: REMINDER,
        text: "Your computer may occasionally have real problems, but legitimate companies usually do not contact you unexpectedly to tell you about them. Scammers often pretend to be computer technicians and claim they found a virus or security issue. Their goal is to make you panic so you'll give them remote access, personal information, or money. Before letting anyone help with your computer, take a moment to verify who they are and whether you asked for their help in the first place."
      },
      {
        type: "tiered",
        title: "Spot the warning sign",
        scenario:
          "Your phone rings. \"Hello, this is Microsoft. We've detected a virus on your computer.\"",
        question: "What is the best response?",
        options: [
          {
            text: "Hang up and contact Microsoft or your computer company through official support if you're concerned.",
            tier: "best",
            feedback:
              "Microsoft doesn't monitor personal computers and call people unexpectedly. Ending the call and contacting support yourself is the safest response."
          },
          {
            text: "Tell them you'll think about it and end the call.",
            tier: "safe",
            feedback:
              "Ending the call is good. You don't owe them an explanation — simply hanging up is enough."
          },
          {
            text: "Stay on the phone so they can explain.",
            tier: "unsafe",
            feedback:
              "The explanation is the trap. There is no virus, and no way for them to have seen one."
          }
        ]
      },
      {
        type: "tiered",
        title: "Choose the safest response",
        scenario: "The caller asks you to install a program so they can \"fix\" your computer.",
        question: "What is the best response?",
        options: [
          {
            text: "Decline, end the call, and only seek help from support you contacted yourself.",
            tier: "best",
            feedback:
              "Giving someone remote access allows them to control your computer. Only do this when you've independently contacted a trusted support service."
          },
          {
            text: "Tell them you're not comfortable installing anything.",
            tier: "safe",
            feedback:
              "A clear refusal is good. Ending the call entirely is stronger — they'll only keep working on you."
          },
          {
            text: "Install the program so they can help.",
            tier: "unsafe",
            feedback:
              "That program hands over control of your computer, your files, and any account you're signed into."
          }
        ]
      },
      {
        type: "tiered",
        title: "Apply the lesson",
        scenario:
          "A large message appears on your screen: \"WARNING! Your computer is infected! Call this number immediately!\"",
        question: "What is the best response?",
        options: [
          {
            text: "Close the message if possible and contact a trusted tech support service yourself if you're concerned.",
            tier: "best",
            feedback:
              "Scammers often create alarming pop-up messages to make people react without thinking."
          },
          {
            text: "Restart your computer and ask someone you trust if the message returns.",
            tier: "safe",
            feedback:
              "Restarting usually clears these pop-ups and asking someone you trust is sensible."
          },
          {
            text: "Call the number on the screen.",
            tier: "unsafe",
            feedback:
              "That number belongs to the people who made the pop-up. Real warnings never ask you to phone anyone."
          }
        ]
      },
      {
        type: "tiered",
        title: "Connect previous lessons",
        scenario:
          "An unexpected caller says your computer is infected. They ask you to stay on the phone, tell you not to ask anyone else for help because they'll \"make things worse,\" and want you to buy gift cards to pay for repairs.",
        question: "Which response is safe?",
        options: [
          {
            text: "Hang up and contact a trusted tech support service yourself.",
            tier: "best",
            feedback:
              "Even though the story was different, you spotted several warning signs: unexpected contact, secrecy, rushing, and a strange payment method."
          },
          {
            text: "End the call and ask a trusted family member or friend for advice before doing anything.",
            tier: "safe",
            feedback:
              "Good — and notice that asking someone is exactly what the caller told you not to do."
          },
          {
            text: "Buy the gift cards because your computer might really be infected.",
            tier: "unsafe",
            feedback:
              "No repair service is paid in gift cards. That request alone settles it."
          }
        ]
      },
      {
        type: "confidence",
        question: "How confident do you feel recognizing fake tech support?",
        practice: [
          {
            scenario: "Someone unexpectedly emails you offering to fix your computer.",
            question: "Which response is safe?",
            options: [
              {
                text: "Ignore the email and seek help only if you decide it's needed.",
                tier: "best",
                feedback: "You decide when your computer needs attention."
              },
              {
                text: "Ask someone you trust whether the email looks legitimate.",
                tier: "safe",
                feedback: "A second opinion is always reasonable."
              },
              {
                text: "Reply asking how much they charge.",
                tier: "unsafe",
                feedback:
                  "Replying confirms your address is active and invites more contact."
              }
            ]
          },
          {
            scenario:
              "A website says your computer is infected and starts making loud alarm sounds.",
            question: "Which response is best?",
            options: [
              {
                text: "Close the page and use trusted support if you're concerned.",
                tier: "best",
                feedback:
                  "The noise is there to panic you. Closing the page costs nothing."
              },
              {
                text: "Step away for a moment and come back calmly before deciding what to do.",
                tier: "safe",
                feedback: "Stepping away breaks the panic, which is the point."
              },
              {
                text: "Call the phone number on the screen immediately.",
                tier: "unsafe",
                feedback: "That number is part of the scam."
              }
            ]
          }
        ]
      },
      {
        type: "finalboss",
        title: "The Microsoft call",
        setup:
          "A warning appears on your screen, and moments later your phone rings.",
        messages: [
          {
            from: "Pop-up on your screen",
            body:
              "WARNING: Your computer has been sending out viruses. Call support immediately.",
            fakeButton: "Call support now"
          },
          {
            from: "Incoming call · \"Microsoft Support\"",
            body:
              "We need you to install our repair software so we can fix this. Please stay on the phone, and don't ask anyone else for help — they'll make it worse. The repair fee is $299, payable in gift cards."
          }
        ],
        question: "Which response is the best first step?",
        options: [
          {
            text: "Hang up and, if you're worried, contact Microsoft or your computer manufacturer's official support yourself.",
            tier: "best",
            feedback:
              "You ignored the disguise and focused on the warning signs. The scammer changed masks — but your safety habits stayed the same."
          },
          {
            text: "End the call and ask a trusted friend or family member whether anything seems wrong with your computer.",
            tier: "safe",
            feedback:
              "A good instinct, and it directly defies the \"don't ask anyone\" instruction that gave the scam away."
          },
          {
            text: "Install the software because they sound like experts.",
            tier: "unsafe",
            feedback:
              "That software would give a stranger full control of your computer. Every element here was a warning sign: the pop-up, the unexpected call, the secrecy, the urgency, and the gift cards."
          }
        ],
        spotted: [
          "Unexpected contact",
          "Requests for secrecy",
          "Pressure to hurry",
          "Unusual payment method",
          "Refusing independent verification"
        ]
      }
    ],
    quiz: [],
    complete: {
      title: "Lesson complete!",
      subtitle: "You completed Computer & Tech Support.",
      habit: "If you didn't ask for tech support, verify before accepting help.",
      warningSign: "Unexpected offers to fix your computer.",
      skills: [
        "Refused remote access",
        "Closed an alarming pop-up",
        "Recognized a gift card demand",
        "Asked someone you trust"
      ],
      next: "Someone You Love"
    }
  },

  // ============================================================
  // LESSON 3.5
  // ============================================================
  {
    id: "scam-someone-you-love",
    track: "scam",
    phase: 103,
    order: 5,
    lessonNumber: "3.5",
    title: "Someone You Love",
    pathTitle: "Someone You Love",
    badge: "Family Verifier",
    xp: 20,
    goals: [
      "Verify emergency messages from loved ones before sending money.",
      "Recognize \"don't call me\" as a warning sign."
    ],
    blocks: [
      {
        type: "reading",
        heading: "Someone You Love",
        question: "What if someone pretends to be someone I love?",
        objective:
          "Learn that even messages claiming to be from a loved one should be verified before sending money or personal information.",
        warningSigns: REMINDER,
        text: "Scammers sometimes pretend to be a child, grandchild, friend, or another loved one. They know we naturally want to help the people we care about. A message may say they lost their phone, are stranded, or need money right away. Before helping, remember that love and kindness are strengths — but they should always be paired with verification. A quick phone call to a trusted number can protect both your heart and your wallet."
      },
      {
        type: "tiered",
        title: "Spot the warning sign",
        scenario:
          "You receive a text message saying, \"Hi Grandma, I got a new phone. Can you save this number?\"",
        question: "What is the best response?",
        options: [
          {
            text: "Call or text your grandchild using the phone number you already have saved.",
            tier: "best",
            feedback:
              "Anyone can send a text message pretending to be someone you know. Using a trusted phone number helps you verify it's really them."
          },
          {
            text: "Wait until you can talk with them in person before updating the contact.",
            tier: "safe",
            feedback:
              "Waiting is fine. Calling the number you already have would settle it in a minute."
          },
          {
            text: "Save the new number immediately because they used your nickname.",
            tier: "unsafe",
            feedback:
              "\"Grandma\" is a guess that works often. It isn't identification."
          }
        ]
      },
      {
        type: "tiered",
        title: "Choose the safest response",
        scenario:
          "A message says, \"Please don't tell Mom and Dad. I just need you to send me money.\"",
        question: "Which response is the best?",
        options: [
          {
            text: "Contact your grandchild or another trusted family member before sending anything.",
            tier: "best",
            feedback:
              "Helping family is important, but verifying first helps ensure you're actually helping your loved one."
          },
          {
            text: "Reply that you'll help after you verify who they are.",
            tier: "safe",
            feedback:
              "Reasonable, though verifying through a number you already have is stronger than negotiating in the same thread."
          },
          {
            text: "Send the money because family comes first.",
            tier: "unsafe",
            feedback:
              "The secrecy request is the giveaway. Real family emergencies don't require hiding things from the rest of the family."
          }
        ]
      },
      {
        type: "tiered",
        title: "Apply the lesson",
        scenario:
          "A text says, \"I'm embarrassed and need money today. Please don't call because my phone isn't working.\"",
        question: "Which warning sign stands out the most?",
        options: [
          {
            text: "They don't want you to verify who they are.",
            tier: "best",
            feedback:
              "Several warning signs appear together here. The strongest is that they're trying to stop you verifying the story."
          },
          {
            text: "They're creating urgency by saying they need help today.",
            tier: "safe",
            feedback:
              "True, and worth noticing. The refusal to take a call is the sharper signal."
          },
          {
            text: "They're asking politely.",
            tier: "unsafe",
            feedback: "Politeness is not a warning sign."
          }
        ]
      },
      {
        type: "tiered",
        title: "Connect previous lessons",
        scenario:
          "Someone claiming to be your grandson says they need money immediately, asks you not to tell anyone, and wants payment through a gift card.",
        question: "Which response is safe?",
        options: [
          {
            text: "Call your grandson using the number you already have, or contact another family member first.",
            tier: "best",
            feedback:
              "Even though this story feels personal, all five warning signs are present: unexpected contact, secrecy, rushing, a strange payment method, and refusing verification."
          },
          {
            text: "Wait until you've spoken with a trusted family member before sending money.",
            tier: "safe",
            feedback: "Good instinct — one phone call resolves this."
          },
          {
            text: "Buy the gift cards immediately because it's an emergency.",
            tier: "unsafe",
            feedback:
              "No real emergency is solved with gift card numbers read aloud."
          }
        ]
      },
      {
        type: "confidence",
        question:
          "How confident do you feel handling unexpected messages from someone claiming to be a loved one?",
        practice: [
          {
            scenario:
              "A text says, \"I'm using my friend's phone. Please send money to this account.\"",
            question: "Which response is the best?",
            options: [
              {
                text: "Call your loved one using the phone number you already know.",
                tier: "best",
                feedback: "One call to a known number settles it immediately."
              },
              {
                text: "Ask another family member if they've heard from them.",
                tier: "safe",
                feedback: "Also good — a second source breaks the isolation."
              },
              {
                text: "Send a small amount just in case.",
                tier: "unsafe",
                feedback:
                  "A small payment confirms you'll pay, and larger requests follow."
              }
            ]
          },
          {
            scenario:
              "Someone claiming to be your granddaughter says, \"Don't call me. I'll explain later.\"",
            question: "Which warning sign do you notice?",
            options: [
              {
                text: "They don't want you to verify who they are.",
                tier: "best",
                feedback:
                  "\"Don't call\" exists for one reason: a call would end the scam."
              },
              {
                text: "They're asking you to act without checking first.",
                tier: "safe",
                feedback: "Yes — and the reason is that checking would expose it."
              },
              {
                text: "They sound upset.",
                tier: "unsafe",
                feedback:
                  "Sounding upset is the emotional hook, not the structural warning sign."
              }
            ]
          }
        ]
      },
      {
        type: "memory",
        links: [
          {
            lesson: "Lesson 1.3 — Stay Calm, Think Clearly",
            note: "Fear for someone you love is the strongest emotion a scam can use. Slow down anyway."
          },
          {
            lesson: "Lesson 2.2 — Keep It a Secret",
            note: "\"Don't tell Mom and Dad\" is the same request, wearing a family face."
          }
        ]
      },
      {
        type: "finalboss",
        title: "The grandchild's text",
        setup: "You receive a text message from an unknown number.",
        messages: [
          {
            from: "Text · Unknown number",
            body:
              "Hi Grandma, this is my new phone. I accidentally damaged my old one. I'm in a difficult situation and need $800 today. Please don't tell Mom and Dad because I'm embarrassed. I can't answer calls right now, but you can help by buying gift cards and sending me the numbers."
          }
        ],
        question: "Which response is the best first step?",
        options: [
          {
            text: "Call your grandchild using the phone number you already have, or contact another trusted family member to verify the story.",
            tier: "best",
            feedback:
              "You recognized that caring for your family doesn't mean acting immediately. It means making sure you're helping the right person."
          },
          {
            text: "Wait until you can speak directly with your grandchild before sending any money.",
            tier: "safe",
            feedback:
              "Sound judgment. Reaching out proactively on a known number is even better."
          },
          {
            text: "Buy the gift cards because it sounds like a real emergency.",
            tier: "unsafe",
            feedback:
              "Every warning sign was in that message: a new unknown number, secrecy, urgency, gift cards, and a reason you couldn't call. A single call to your grandchild's real number would have ended it."
          }
        ],
        spotted: [
          "Unexpected contact",
          "Requests for secrecy",
          "Pressure to hurry",
          "Unusual payment method",
          "Refusing independent verification"
        ]
      }
    ],
    quiz: [],
    complete: {
      title: "Lesson complete!",
      subtitle: "You completed Someone You Love.",
      habit: "Love first. Verify second. Help third.",
      warningSign: "A loved one who can't take your call.",
      skills: [
        "Verified through a known number",
        "Recognized emotional pressure",
        "Refused a gift card request",
        "Involved another family member"
      ],
      next: "Your Home Services"
    }
  },

  // ============================================================
  // LESSON 3.6
  // ============================================================
  {
    id: "scam-home-services",
    track: "scam",
    phase: 103,
    order: 6,
    lessonNumber: "3.6",
    title: "Your Home Services",
    pathTitle: "Home Services",
    badge: "Utility Verifier",
    xp: 20,
    goals: [
      "Recognize disconnection threats as pressure tactics.",
      "Check your account yourself before paying anything."
    ],
    blocks: [
      {
        type: "reading",
        heading: "Your Home Services",
        question: "Would my electric, water, gas, or internet company really do this?",
        objective:
          "Learn that companies providing services to your home should never pressure you into making immediate payments or sharing information without giving you time to verify the request.",
        warningSigns: REMINDER,
        text: "Your electric, gas, water, internet, and cable companies all provide important services that you depend on. Because of that, scammers sometimes pretend to represent them. They may claim your service will be disconnected, that your bill wasn't paid, or that there's an emergency with your account. Before reacting, remember that you can always verify the situation yourself. A company that provides your home services should not stop you from checking your account or contacting them through their official customer service number."
      },
      {
        type: "tiered",
        title: "Spot the warning sign",
        scenario:
          "You receive a phone call: \"Your electricity will be shut off today unless you make a payment immediately.\"",
        question: "Which response is the best?",
        options: [
          {
            text: "Hang up and contact your electric company using the phone number on your bill.",
            tier: "best",
            feedback:
              "A sudden deadline is a warning sign. Verifying through your own trusted number keeps you in control."
          },
          {
            text: "Log into your online account yourself to check whether there's actually a problem.",
            tier: "safe",
            feedback:
              "Excellent instinct — your own account is a trusted source and will show any real balance."
          },
          {
            text: "Pay immediately to avoid losing power.",
            tier: "unsafe",
            feedback:
              "Utilities send written notice well before disconnection. Same-day threats by phone are a pressure tactic."
          }
        ]
      },
      {
        type: "tiered",
        title: "Choose the safest response",
        scenario:
          "The caller says, \"To keep your service on, you'll need to pay with gift cards.\"",
        question: "Which response is the best?",
        options: [
          {
            text: "End the call and verify your account with the company yourself.",
            tier: "best",
            feedback:
              "Legitimate home service providers do not ask customers to pay bills with gift cards."
          },
          {
            text: "Refuse to pay until you've checked your bill.",
            tier: "safe",
            feedback: "Correct instinct. Ending the call entirely is cleaner."
          },
          {
            text: "Buy the gift cards because you don't want your power turned off.",
            tier: "unsafe",
            feedback:
              "The gift card request alone proves this isn't your utility company."
          }
        ]
      },
      {
        type: "tiered",
        title: "Apply the lesson",
        scenario:
          "You receive a text message: \"Your water service has been suspended. Click here immediately to restore service.\"",
        question: "Which response is the best?",
        options: [
          {
            text: "Visit your water company's official website or call their customer service number yourself.",
            tier: "best",
            feedback:
              "A text message should never decide where you go online. Always start with a trusted source."
          },
          {
            text: "Ignore the message until you've checked your account.",
            tier: "safe",
            feedback: "Perfectly reasonable — and your tap still works, doesn't it?"
          },
          {
            text: "Tap the link to restore your service.",
            tier: "unsafe",
            feedback:
              "That link leads to a page built to capture your payment details."
          }
        ]
      },
      {
        type: "tiered",
        title: "Connect previous lessons",
        scenario:
          "Someone claiming to work for your gas company says your account has a serious problem. They tell you not to hang up, insist payment must be made today with cryptocurrency, and warn you not to contact customer service because it will \"slow everything down.\"",
        question: "Which response is safe?",
        options: [
          {
            text: "End the call and contact your gas company using the official number on your bill.",
            tier: "best",
            feedback:
              "You recognized unexpected contact, rushing, a strange payment method, and refusing verification. The company changed — but your habits stayed the same."
          },
          {
            text: "Log into your online account yourself before making any decisions.",
            tier: "safe",
            feedback: "Also solid — your own account is a trusted source."
          },
          {
            text: "Follow the caller's payment instructions.",
            tier: "unsafe",
            feedback:
              "Being told not to contact customer service is the loudest signal of all. That's the exact thing they fear."
          }
        ]
      },
      {
        type: "confidence",
        question:
          "How confident do you feel handling unexpected messages from your home service providers?",
        practice: [
          {
            scenario:
              "You receive an email saying your internet service will be disconnected unless you update your payment information today.",
            question: "Which response is the best?",
            options: [
              {
                text: "Visit your internet provider's official website or call them using the number on your bill.",
                tier: "best",
                feedback: "Start from a source you chose."
              },
              {
                text: "Wait until you can review your account later today.",
                tier: "safe",
                feedback: "Fine — nothing is disconnected in the meantime."
              },
              {
                text: "Click the email link immediately.",
                tier: "unsafe",
                feedback: "The link is chosen by the sender."
              }
            ]
          },
          {
            scenario:
              "A caller claims to be from your cable company and asks you to verify your account password.",
            question: "Which response is the best?",
            options: [
              {
                text: "End the call and contact your cable company yourself if you're concerned.",
                tier: "best",
                feedback: "No company needs your password read out to them."
              },
              {
                text: "Decline to provide any information over the phone.",
                tier: "safe",
                feedback: "A clear refusal is a good habit."
              },
              {
                text: "Tell them your password so they can verify your account.",
                tier: "unsafe",
                feedback:
                  "Your password verifies you to the company — never the other way around."
              }
            ]
          }
        ]
      },
      {
        type: "finalboss",
        title: "The disconnection notice",
        setup:
          "An email arrives, and a few minutes later your phone rings.",
        messages: [
          {
            from: "Email · \"Your Electric Company\"",
            body:
              "FINAL NOTICE: Your account is overdue. Power will be disconnected today unless payment is received immediately.",
            fakeButton: "Pay now"
          },
          {
            from: "Incoming call · Unknown number",
            body:
              "I can prevent the shutoff if you stay on the line and complete the payment right now."
          }
        ],
        question: "Which response is the best first step?",
        options: [
          {
            text: "Ignore the email and caller, then contact your electric company using the number on your bill or by logging into your official account.",
            tier: "best",
            feedback:
              "You stayed calm and looked past the story. You recognized that the email and phone call were working together to pressure you into acting before verifying."
          },
          {
            text: "Log into your account yourself to check your balance before deciding what to do.",
            tier: "safe",
            feedback:
              "A strong move — your own account will show immediately whether anything is actually owed."
          },
          {
            text: "Click the \"Pay Now\" button because it looks official.",
            tier: "unsafe",
            feedback:
              "The email and the call arriving together is the tell — that coordination exists to overwhelm you. Real utilities give written notice weeks ahead."
          }
        ],
        spotted: [
          "Unexpected contact",
          "Pressure to hurry",
          "Refusing independent verification"
        ]
      }
    ],
    quiz: [],
    complete: {
      title: "Lesson complete!",
      subtitle: "You completed Your Home Services.",
      habit: "Your home services can wait for verification. Don't let urgency decide.",
      warningSign: "Threats of immediate service disconnection.",
      skills: [
        "Stayed calm under pressure",
        "Checked your own account",
        "Recognized an unusual payment request",
        "Ignored coordinated contact"
      ],
      next: "Deliveries & Packages"
    }
  },

  // ============================================================
  // LESSON 3.7
  // ============================================================
  {
    id: "scam-deliveries",
    track: "scam",
    phase: 103,
    order: 7,
    lessonNumber: "3.7",
    title: "Deliveries & Packages",
    pathTitle: "Deliveries",
    badge: "Package Checker",
    xp: 20,
    goals: [
      "Verify delivery messages through the retailer or carrier.",
      "Understand why scammers ask for very small fees."
    ],
    blocks: [
      {
        type: "reading",
        heading: "Deliveries & Packages",
        question: "Did I really miss a package?",
        objective:
          "Learn that unexpected delivery messages should be verified before clicking links or sharing personal information.",
        warningSigns: REMINDER,
        text: "Many people receive packages throughout the year, making delivery companies an easy disguise for scammers. You might receive a text or email saying a package couldn't be delivered or that you need to pay a small fee before it can arrive. Even if you're expecting a package, don't assume every message is real. Instead, check your order through the official delivery company's website or the store where you placed the order."
      },
      {
        type: "tiered",
        title: "Spot the warning sign",
        scenario:
          "You receive a text message: \"Your package is waiting. Click here to schedule delivery.\"",
        question: "Which response is the best?",
        options: [
          {
            text: "Check your package through the store or delivery company's official website or app.",
            tier: "best",
            feedback:
              "Unexpected links can lead to fake websites. Starting from an official website or app keeps you in control."
          },
          {
            text: "Wait until later to see if another update arrives.",
            tier: "safe",
            feedback:
              "Waiting costs nothing. Checking your order directly answers it faster."
          },
          {
            text: "Tap the link in the text message.",
            tier: "unsafe",
            feedback:
              "Delivery texts are among the most commonly faked messages of all."
          }
        ]
      },
      {
        type: "tiered",
        title: "Choose the safest response",
        scenario:
          "The message says, \"A $2 delivery fee is required before we can deliver your package.\"",
        question: "Which response is the best?",
        options: [
          {
            text: "Verify the package through the official delivery company before paying anything.",
            tier: "best",
            feedback:
              "Scammers often ask for very small payments because they hope people won't question them. The goal isn't the $2 — it's your card details."
          },
          {
            text: "Ignore the message until you confirm you're expecting a package.",
            tier: "safe",
            feedback: "Sensible. Nothing bad happens by waiting."
          },
          {
            text: "Pay the $2 because it's only a small amount.",
            tier: "unsafe",
            feedback:
              "The amount is small so you won't think twice. What they capture is your full card number."
          }
        ]
      },
      {
        type: "tiered",
        title: "Apply the lesson",
        scenario:
          "You ordered something online yesterday. Today you receive a text with a tracking link from an unfamiliar phone number.",
        question: "Which response is the best?",
        options: [
          {
            text: "Check your order using the retailer's website or official tracking page.",
            tier: "best",
            feedback:
              "Expecting a package doesn't mean every message about it is real."
          },
          {
            text: "Compare the tracking number with your order confirmation before clicking anything.",
            tier: "safe",
            feedback:
              "Good thinking — a mismatch would expose it immediately."
          },
          {
            text: "Tap the text message link because you're expecting a package.",
            tier: "unsafe",
            feedback:
              "Scammers send these constantly, knowing many people are expecting something."
          }
        ]
      },
      {
        type: "tiered",
        title: "Connect previous lessons",
        scenario:
          "A text says your package will be returned unless you pay immediately using a payment app. The message warns that the offer expires in one hour.",
        question: "Which response is safe?",
        options: [
          {
            text: "Ignore the text and verify your shipment through the official retailer or delivery company.",
            tier: "best",
            feedback:
              "You spotted multiple warning signs: unexpected contact, rushing, a strange payment request, and refusing independent verification."
          },
          {
            text: "Wait until you can log into your account yourself before taking any action.",
            tier: "safe",
            feedback: "Reasonable — the one-hour deadline is fictional."
          },
          {
            text: "Use the payment link so your package isn't returned.",
            tier: "unsafe",
            feedback:
              "Carriers don't collect redelivery fees by text with a one-hour deadline."
          }
        ]
      },
      {
        type: "confidence",
        question: "How confident do you feel recognizing fake delivery messages?",
        practice: [
          {
            scenario:
              "An email says your package is delayed and asks you to update your address by clicking a link.",
            question: "Which response is the best?",
            options: [
              {
                text: "Visit the retailer's or delivery company's official website yourself.",
                tier: "best",
                feedback: "Start from a source you chose."
              },
              {
                text: "Check your original order confirmation before doing anything.",
                tier: "safe",
                feedback: "Your own records are a trusted source."
              },
              {
                text: "Click the link to update your address.",
                tier: "unsafe",
                feedback: "The page behind it is built to harvest details."
              }
            ]
          },
          {
            scenario: "A text says, \"Final notice! Your package will be destroyed today.\"",
            question: "Which response is the best?",
            options: [
              {
                text: "Verify the shipment yourself before taking any action.",
                tier: "best",
                feedback: "Packages are not destroyed. That threat is invented."
              },
              {
                text: "Ignore the message until you've checked your account.",
                tier: "safe",
                feedback: "Nothing is lost by waiting."
              },
              {
                text: "Click the link because it sounds urgent.",
                tier: "unsafe",
                feedback: "Sounding urgent is precisely the design."
              }
            ]
          }
        ]
      },
      {
        type: "memory",
        links: [
          {
            lesson: "Lesson 2.5 — Always Verify",
            note: "Instead of trusting the text message, use a trusted source that you choose."
          },
          {
            lesson: "Lesson 2.3 — Rushing Is a Warning",
            note: "A 30-minute window on a $2 fee exists only to stop you thinking."
          }
        ]
      },
      {
        type: "finalboss",
        title: "The missed package",
        setup:
          "You ordered a birthday gift for your granddaughter last week. This afternoon, a text arrives.",
        messages: [
          {
            from: "Text · Unknown number",
            body:
              "Delivery Notice: We attempted to deliver your package today, but your address could not be verified. To avoid returning the package, please pay a $2 redelivery fee within the next 30 minutes using the secure link below. Tracking: 1Z884A2199",
            fakeButton: "Pay now"
          }
        ],
        question: "Which response is the best first step?",
        options: [
          {
            text: "Open your original order or visit the official delivery company's website or app to check the package status yourself.",
            tier: "best",
            feedback:
              "You didn't let a small payment or a short deadline rush your decision. You chose to verify using a trusted source that you selected instead of relying on an unexpected text."
          },
          {
            text: "Wait until you can confirm the package through your order history before making any payment.",
            tier: "safe",
            feedback:
              "Good judgment. A genuine carrier will simply attempt delivery again."
          },
          {
            text: "Pay the $2 using the text message link so your package won't be returned.",
            tier: "unsafe",
            feedback:
              "The $2 was never the point — your card details were. The real-looking tracking number and the 30-minute deadline were both there to rush you past that thought."
          }
        ],
        spotted: [
          "Unexpected contact",
          "Pressure to hurry",
          "Unusual payment request",
          "Refusing independent verification"
        ]
      }
    ],
    quiz: [],
    complete: {
      title: "Lesson complete!",
      subtitle: "You completed Deliveries & Packages.",
      habit: "Every package deserves verification before action.",
      warningSign: "Delivery messages with urgent links or small fees.",
      skills: [
        "Verified through the retailer",
        "Ignored an unexpected link",
        "Recognized a suspicious small payment",
        "Stayed calm under a deadline"
      ],
      next: "Medicare & Healthcare"
    }
  },

  // ============================================================
  // LESSON 3.8
  // Merged from the two drafts of 3.8 ("Medicare & Healthcare"
  // and "Your Health"), keeping the strongest material from each.
  // ============================================================
  {
    id: "scam-healthcare",
    track: "scam",
    phase: 103,
    order: 8,
    lessonNumber: "3.8",
    title: "Medicare & Healthcare",
    pathTitle: "Medicare & Health",
    badge: "Master of Disguises",
    xp: 20,
    goals: [
      "Protect your Medicare number as carefully as your bank details.",
      "Verify health-related offers before accepting them."
    ],
    blocks: [
      {
        type: "reading",
        heading: "Medicare & Healthcare",
        question: "Would Medicare or my healthcare provider really ask me to do this?",
        objective:
          "Learn that healthcare organizations and Medicare should never pressure you into sharing personal information, making payments, or accepting unexpected offers without giving you time to verify them.",
        warningSigns: REMINDER,
        text: "Healthcare is personal, so it's natural to pay attention when someone claims to be from Medicare, your doctor's office, or your health insurance company. Scammers know this and may offer free medical equipment, ask you to \"confirm\" your Medicare number, or say your benefits are at risk. Even if the message sounds helpful, remember that you can always verify it by calling your healthcare provider or Medicare using an official phone number before sharing information or accepting offers."
      },
      {
        type: "tiered",
        title: "Spot the warning sign",
        scenario:
          "Someone unexpectedly calls and says, \"We're from Medicare, and we need to confirm your Medicare number.\"",
        question: "Which response is the best?",
        options: [
          {
            text: "End the call and contact Medicare or your healthcare provider using an official phone number.",
            tier: "best",
            feedback:
              "Unexpected requests for personal information should always be verified first. Medicare already has your number — they don't need to call and ask for it."
          },
          {
            text: "Tell them you'll call back after checking your records.",
            tier: "safe",
            feedback:
              "Good — just be sure to use a number from your card, not one they give you."
          },
          {
            text: "Give them your Medicare number so they can verify your account.",
            tier: "unsafe",
            feedback:
              "Your Medicare number can be used to bill fraudulent claims in your name. Treat it like a bank account number."
          }
        ]
      },
      {
        type: "tiered",
        title: "Choose the safest response",
        scenario:
          "A caller says you're eligible for a free medical device if you confirm your information today.",
        question: "Which response is the best?",
        options: [
          {
            text: "Verify the offer directly with your healthcare provider or Medicare before accepting it.",
            tier: "best",
            feedback:
              "A helpful offer can still be a scam if it can't be independently verified."
          },
          {
            text: "Decline the offer until you've had time to research it.",
            tier: "safe",
            feedback: "Declining costs you nothing. A genuine benefit will still be there."
          },
          {
            text: "Accept the offer immediately because it's free.",
            tier: "unsafe",
            feedback:
              "\"Free\" equipment scams bill Medicare in your name, which can affect your real coverage later."
          }
        ]
      },
      {
        type: "tiered",
        title: "Apply the lesson",
        scenario:
          "An email says your Medicare benefits will expire unless you update your information today.",
        question: "Which response is the best?",
        options: [
          {
            text: "Contact Medicare using an official phone number or website to verify the message.",
            tier: "best",
            feedback:
              "Unexpected emails should never decide where you go online. Medicare benefits don't expire overnight."
          },
          {
            text: "Wait until you can log into your official Medicare account yourself.",
            tier: "safe",
            feedback: "Your own account is a trusted source."
          },
          {
            text: "Click the email link immediately.",
            tier: "unsafe",
            feedback: "The deadline exists to get that click."
          }
        ]
      },
      {
        type: "tiered",
        title: "Connect previous lessons",
        scenario:
          "Someone claiming to be from Medicare says your benefits are at risk. They tell you to keep the call private because it's a \"security issue,\" ask for your Medicare number, and say you must act today.",
        question: "Which response is safe?",
        options: [
          {
            text: "Hang up and contact Medicare or your healthcare provider using an official phone number.",
            tier: "best",
            feedback:
              "You recognized unexpected contact, secrecy, rushing, and refusing independent verification — the same four signs, wearing a healthcare mask."
          },
          {
            text: "End the call and discuss it with a trusted family member before taking any action.",
            tier: "safe",
            feedback:
              "Good — and it directly defies the secrecy request that gave the scam away."
          },
          {
            text: "Give them your information to avoid losing your benefits.",
            tier: "unsafe",
            feedback:
              "Losing benefits was the threat used to rush you. Medicare doesn't work this way."
          }
        ]
      },
      {
        type: "confidence",
        question: "How confident do you feel recognizing fake health-related requests?",
        practice: [
          {
            scenario: "Someone unexpectedly offers you free diabetic testing supplies.",
            question: "Which response is the best?",
            options: [
              {
                text: "Verify the offer through your doctor or Medicare.",
                tier: "best",
                feedback: "Your doctor can tell you in a moment whether it's real."
              },
              {
                text: "Research the company before responding.",
                tier: "safe",
                feedback: "A reasonable step before sharing anything."
              },
              {
                text: "Give them your Medicare number.",
                tier: "unsafe",
                feedback: "That number is exactly what the offer exists to collect."
              }
            ]
          },
          {
            scenario:
              "You receive a voicemail saying your insurance coverage will end today.",
            question: "Which response is the best?",
            options: [
              {
                text: "Contact your insurance company using the phone number on your insurance card.",
                tier: "best",
                feedback: "Use the number you already have, not the one in the voicemail."
              },
              {
                text: "Log into your insurance account yourself before doing anything.",
                tier: "safe",
                feedback: "Your own account is trustworthy."
              },
              {
                text: "Call the phone number left in the voicemail immediately.",
                tier: "unsafe",
                feedback:
                  "That number connects you straight back to whoever left the message."
              }
            ]
          }
        ]
      },
      {
        type: "memory",
        links: [
          {
            lesson: "Lesson 2.1 — The Unexpected Call",
            note: "They contacted you. That alone means verification comes first."
          },
          {
            lesson: "Lesson 2.5 — Always Verify",
            note: "Use a phone number or website that you chose, not one you were given."
          },
          {
            lesson: "Lesson 3.1 — Anyone Can Pretend",
            note: "An official-looking letter is still just paper. Anyone can print one."
          }
        ]
      },
      {
        type: "finalboss",
        title: "The new Medicare card",
        setup:
          "A letter arrives in the mail. The next day, your phone rings.",
        messages: [
          {
            from: "Letter · \"Medicare\"",
            body:
              "Medicare is issuing new cards. Please call the number below to confirm your Medicare number and mailing address so your replacement card can be sent."
          },
          {
            from: "Incoming call · Next day",
            body:
              "Hello, I'm following up on the letter we sent. I can finish the process in just a few minutes if you give me your Medicare number now."
          }
        ],
        question: "Which response is the best first step?",
        options: [
          {
            text: "End the call and contact Medicare using the official number on your Medicare card or the official Medicare website.",
            tier: "best",
            feedback:
              "You recognized that official-looking letters and follow-up calls can still be part of a scam. Instead of trusting the appearance, you relied on your habits and verified independently."
          },
          {
            text: "Set the letter aside until you can verify the information through an official source before responding.",
            tier: "safe",
            feedback:
              "Sound judgment. Nothing here needs answering today."
          },
          {
            text: "Complete the process over the phone because the letter looked official.",
            tier: "unsafe",
            feedback:
              "The letter existed to make the call believable — that's what made this convincing. Medicare never charges for a card and never calls asking you to confirm your number."
          }
        ],
        spotted: [
          "Unexpected contact",
          "Pressure to hurry",
          "Appearances used as proof",
          "Refusing independent verification"
        ]
      }
    ],
    quiz: [],
    complete: {
      title: "Phase 3 complete!",
      subtitle: "You completed Medicare & Healthcare — and all of Phase 3.",
      habit: "Protect your health information the same way you protect your money — verify first.",
      warningSign: "Unexpected health requests for personal information.",
      skills: [
        "Protected your Medicare number",
        "Verified an official-looking letter",
        "Recognized authority as a disguise",
        "Stayed calm under pressure"
      ],
      learned: [
        "The disguise changed. The warning signs didn't.",
        "🚩 Unexpected contact",
        "🚩 Requests for secrecy",
        "🚩 Pressure to hurry",
        "🚩 Unusual payment methods",
        "🚩 Refusing to let you verify",
        "You no longer have to memorize every scam — you can recognize ones you've never seen before."
      ],
      next: "More lessons coming soon"
    }
  }
];

export default scamPhase3Lessons;
