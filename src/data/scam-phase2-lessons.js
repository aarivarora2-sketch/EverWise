// Everwise - Scam Protection track
// Phase 9: The Warning Signs
//
// Phase 8 built four mental habits. This phase names the five warning signs
// that appear across almost every scam, whatever story is wrapped around them:
//   Unexpected contact · Secrecy · Rushing · Strange payments · Refusing verification

export const WARNING_SIGNS = [
  "Unexpected contact",
  "Requests for secrecy",
  "Pressure to hurry",
  "Unusual payment methods",
  "Refusing to let you verify",
];

export const scamPhase2Lessons = [
  // ============================================================
  // LESSON 2.1
  // ============================================================
  {
    id: "scam-unexpected-call",
    track: "scam",
    phase: 9,
    order: 1,
    lessonNumber: "2.1",
    title: "The Unexpected Call",
    pathTitle: "Unexpected Calls",
    badge: "Call Screener",
    xp: 20,
    goals: [
      "Recognize that an unexpected call is never proof of identity.",
      "End the call and contact the organization yourself."
    ],
    blocks: [
      {
        type: "reading",
        heading: "The Unexpected Call",
        question: "They called me, so they must be real… right?",
        objective:
          "Learn that an unexpected phone call should never be trusted simply because it sounds professional or mentions a familiar company.",
        text: "Scammers often pretend to be people you already trust, such as your bank, a government agency, a utility company, or a technology company. They may sound friendly and professional, but remember this: you did not start the conversation — they did. An unexpected phone call is never proof that someone is who they claim to be. Whenever a call involves money, personal information, or your accounts, the safest choice is to end the call and contact the organization yourself using an official phone number."
      },
      {
        type: "tiered",
        title: "Spot the red flag",
        scenario:
          "Your phone rings unexpectedly. The caller says, \"Hello, I'm calling from your bank.\"",
        question: "What is the first reason to be cautious?",
        options: [
          {
            text: "They called you unexpectedly.",
            tier: "best",
            feedback:
              "Anyone can claim to represent a company over the phone. The unexpected call itself is your first reason to slow down."
          },
          {
            text: "They sounded friendly.",
            tier: "unsafe",
            feedback:
              "Friendliness is part of the approach, not a warning sign in itself. The unexpected call is."
          },
          {
            text: "They mentioned your bank.",
            tier: "unsafe",
            feedback:
              "Naming a real bank costs a scammer nothing. Who contacted whom is what matters."
          }
        ]
      },
      {
        type: "tiered",
        title: "Choose the safest response",
        scenario: "An unexpected caller says they need to discuss your account.",
        question: "What should you do?",
        options: [
          {
            text: "Hang up and call the company using an official phone number.",
            tier: "best",
            feedback:
              "Calling the company yourself helps you know you are speaking with the real organization."
          },
          {
            text: "Stay on the phone because they sound professional.",
            tier: "unsafe",
            feedback:
              "Sounding professional is a skill, not proof. Anyone can practice it."
          },
          {
            text: "Give them your account number first.",
            tier: "unsafe",
            feedback:
              "Never hand account details to someone who called you. If they were real, they wouldn't need you to prove yourself."
          }
        ]
      },
      {
        type: "tiered",
        title: "Apply the lesson",
        scenario:
          "Someone unexpectedly calls and says they work for your electric company.",
        question: "What should you remember first?",
        options: [
          {
            text: "Unexpected callers can pretend to be any company.",
            tier: "best",
            feedback:
              "Scammers often pretend to be organizations you recognize, because familiar names make people feel comfortable."
          },
          {
            text: "Utility companies are always trustworthy.",
            tier: "unsafe",
            feedback:
              "The real company may be trustworthy. The person on the phone may not be from the real company."
          },
          {
            text: "If they know your address, they must be real.",
            tier: "unsafe",
            feedback:
              "Addresses are easy to look up. Knowing one proves nothing."
          }
        ]
      },
      {
        type: "tiered",
        title: "Real-life decision",
        scenario:
          "An unexpected caller says there is a problem with one of your accounts and asks you to stay on the phone while they explain.",
        question: "What is the safest first step?",
        options: [
          {
            text: "Hang up and contact the organization yourself.",
            tier: "best",
            feedback:
              "Ending the call doesn't prevent you from getting help. It lets you verify that you're speaking with the right person."
          },
          {
            text: "Answer a few questions before deciding.",
            tier: "unsafe",
            feedback:
              "Every answer gives them more to work with, and makes it harder to step away."
          },
          {
            text: "Stay on the phone until they finish.",
            tier: "unsafe",
            feedback:
              "Being asked to stay on the line is itself a warning sign. It exists to stop you thinking."
          }
        ]
      },
      {
        type: "confidence",
        question: "How confident do you feel about handling unexpected phone calls?",
        practice: [
          {
            scenario: "Someone unexpectedly calls claiming to be from Medicare.",
            question: "What is the safest first step?",
            options: [
              {
                text: "Hang up and call Medicare using an official phone number if needed.",
                tier: "best",
                feedback: "Always verify unexpected callers independently."
              },
              {
                text: "Stay on the phone because healthcare is important.",
                tier: "unsafe",
                feedback:
                  "Importance is exactly why scammers choose healthcare. It's a reason to verify, not to stay."
              },
              {
                text: "Give them your Medicare number.",
                tier: "unsafe",
                feedback:
                  "Your Medicare number is valuable to thieves. Never give it to an unexpected caller."
              }
            ]
          },
          {
            scenario:
              "Someone unexpectedly calls saying they are from your internet provider.",
            question: "What is the safest habit?",
            options: [
              {
                text: "Contact the company yourself using a trusted phone number.",
                tier: "best",
                feedback: "The safest conversations are the ones that you start."
              },
              {
                text: "Continue the conversation because they knew your name.",
                tier: "unsafe",
                feedback: "Your name is not a secret and proves nothing."
              },
              {
                text: "Follow their instructions immediately.",
                tier: "unsafe",
                feedback:
                  "Instructions from an unverified caller should never be followed."
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
            note: "You already know the answer to an unexpected call: hang up and use a number you chose."
          }
        ]
      },
      {
        type: "finalboss",
        title: "The bank security call",
        setup: "Your phone rings.",
        messages: [
          {
            from: "Incoming call · Unknown number",
            body:
              "Hello, this is the security department from your bank. We noticed unusual activity on your account and would like to help you."
          }
        ],
        question: "What should you do first?",
        options: [
          {
            text: "Hang up and call your bank using the phone number on your debit or credit card.",
            tier: "best",
            feedback:
              "It doesn't matter who someone claims to be if they called you unexpectedly. By ending the call and contacting your bank yourself, you stayed in control and verified the situation safely."
          },
          {
            text: "Stay on the phone and hear them out.",
            tier: "unsafe",
            feedback:
              "The longer the call runs, the more convincing it gets — that's how it's designed. Real fraud departments are perfectly happy for you to call them back."
          }
        ],
        spotted: ["Unexpected contact", "Refusing independent verification"]
      }
    ],
    quiz: [],
    complete: {
      title: "Lesson complete!",
      subtitle: "You completed The Unexpected Call.",
      habit: "If they called you, verify before you trust them.",
      warningSign: "Unexpected contact.",
      skills: [
        "Recognized unexpected contact",
        "Ended a call on your own terms",
        "Verified using a number you chose"
      ],
      next: "Keep It a Secret"
    }
  },

  // ============================================================
  // LESSON 2.2
  // ============================================================
  {
    id: "scam-keep-it-secret",
    track: "scam",
    phase: 9,
    order: 2,
    lessonNumber: "2.2",
    title: "Keep It a Secret",
    pathTitle: "Keep It a Secret",
    badge: "Secret Spotter",
    xp: 20,
    goals: [
      "Recognize requests for secrecy as a major warning sign.",
      "Feel comfortable asking someone you trust for advice."
    ],
    blocks: [
      {
        type: "reading",
        heading: "Keep It a Secret",
        question: "Why would someone tell me not to tell anyone else?",
        objective:
          "Learn that anyone asking you to keep a financial or personal situation secret is creating a major warning sign.",
        text: "Honest people understand that you may want to talk with your family or someone you trust before making an important decision. Scammers know that another person may recognize the scam immediately, so they often tell people to keep the conversation secret. If someone asks you not to tell your family, friends, or bank about what is happening, treat that request as a warning sign. Asking for advice is never something you should feel embarrassed about."
      },
      {
        type: "tiered",
        title: "Spot the red flag",
        scenario:
          "A caller says, \"Please don't tell your family about this until we're finished.\"",
        question: "What should make you stop and think?",
        options: [
          {
            text: "They asked you to keep it secret.",
            tier: "best",
            feedback:
              "Scammers often ask people to keep secrets because another person may recognize the scam."
          },
          {
            text: "They spoke quietly.",
            tier: "unsafe",
            feedback: "Tone of voice isn't the issue. The request for secrecy is."
          },
          {
            text: "They knew your name.",
            tier: "unsafe",
            feedback:
              "Names are easy to find. Being told to stay quiet is the real signal."
          }
        ]
      },
      {
        type: "tiered",
        title: "Choose the safest response",
        scenario:
          "Someone says, \"If you tell anyone, they might ruin our investigation.\"",
        question: "What should you do?",
        options: [
          {
            text: "Talk to someone you trust before doing anything.",
            tier: "best",
            feedback:
              "Honest organizations do not expect you to keep important financial matters secret from people you trust."
          },
          {
            text: "Wait until tomorrow before telling anyone.",
            tier: "safe",
            feedback:
              "Waiting is better than acting alone, though there's no reason to delay — talk to someone now."
          },
          {
            text: "Keep it secret as requested.",
            tier: "unsafe",
            feedback:
              "Secrecy is what makes the scam work. Real investigations never depend on you hiding things from your family."
          }
        ]
      },
      {
        type: "tiered",
        title: "Apply the lesson",
        scenario:
          "An email says, \"This offer is only for you. Please don't share it with anyone.\"",
        question: "What should you notice first?",
        options: [
          {
            text: "The request to keep it secret.",
            tier: "best",
            feedback: "Requests for secrecy should always make you pause and think."
          },
          {
            text: "The special offer.",
            tier: "unsafe",
            feedback:
              "The offer is the bait. The secrecy is the tell."
          },
          {
            text: "The professional logo.",
            tier: "unsafe",
            feedback: "Logos can be copied in seconds."
          }
        ]
      },
      {
        type: "tiered",
        title: "Real-life decision",
        scenario:
          "Someone asks you not to tell your bank or your family while they help solve a problem.",
        question: "What is the safest response?",
        options: [
          {
            text: "Speak with someone you trust before continuing.",
            tier: "best",
            feedback:
              "A trustworthy person will never discourage you from asking for advice."
          },
          {
            text: "Follow their instructions until everything is finished.",
            tier: "unsafe",
            feedback:
              "Being cut off from advice is the point of the request. Don't go along with it."
          },
          {
            text: "Keep it secret because they asked politely.",
            tier: "unsafe",
            feedback:
              "Politeness doesn't change what's being asked of you."
          }
        ]
      },
      {
        type: "confidence",
        question:
          "How confident do you feel about recognizing when someone is trying to keep you from asking for help?",
        practice: [
          {
            scenario: "A caller says, \"Don't mention this to anyone until we're done.\"",
            question: "What should you do?",
            options: [
              {
                text: "Talk to someone you trust.",
                tier: "best",
                feedback:
                  "Keeping important financial situations secret helps scammers, not you."
              },
              {
                text: "Keep it private.",
                tier: "unsafe",
                feedback: "Privacy here means isolation, which is what they want."
              },
              {
                text: "Wait until they call back.",
                tier: "unsafe",
                feedback:
                  "Waiting on their schedule keeps you inside their control."
              }
            ]
          },
          {
            scenario: "Someone says, \"Your family won't understand. Just listen to me.\"",
            question: "What is the biggest warning sign?",
            options: [
              {
                text: "They don't want you talking to your family.",
                tier: "best",
                feedback:
                  "Scammers try to isolate people because trusted friends and family can often recognize the scam."
              },
              {
                text: "They sound confident.",
                tier: "unsafe",
                feedback: "Confidence is easy to perform."
              },
              {
                text: "They called in the afternoon.",
                tier: "unsafe",
                feedback: "Timing is irrelevant here."
              }
            ]
          }
        ]
      },
      {
        type: "finalboss",
        title: "The private investigation",
        setup:
          "You receive an unexpected phone call from someone claiming to be investigating suspicious activity on one of your accounts. They ask you not to tell your family or your bank because they don't want to \"interfere with the investigation.\"",
        question: "What should you do first?",
        options: [
          {
            text: "End the call and speak with someone you trust before taking any action.",
            tier: "best",
            feedback:
              "Honest organizations understand that you may want advice before making an important decision. Anyone asking you to keep financial matters secret deserves extra caution."
          },
          {
            text: "Keep the conversation private until they finish.",
            tier: "unsafe",
            feedback:
              "That secrecy request was the loudest warning sign in the call. Real investigators do not ask you to hide things from your own bank."
          }
        ],
        spotted: ["Unexpected contact", "Requests for secrecy", "Refusing independent verification"]
      }
    ],
    quiz: [],
    complete: {
      title: "Lesson complete!",
      subtitle: "You completed Keep It a Secret.",
      habit: "If someone asks you to keep a secret, talk to someone you trust.",
      warningSign: "\"Don't tell anyone.\"",
      skills: [
        "Recognized a request for secrecy",
        "Chose to ask for advice",
        "Refused to be isolated"
      ],
      next: "Rushing Is a Warning"
    }
  },

  // ============================================================
  // LESSON 2.3
  // ============================================================
  {
    id: "scam-rushing-is-a-warning",
    track: "scam",
    phase: 9,
    order: 3,
    lessonNumber: "2.3",
    title: "Rushing Is a Warning",
    pathTitle: "Rushing",
    badge: "Deadline Detector",
    xp: 20,
    goals: [
      "Treat deadlines and pressure as a warning sign.",
      "Know you are never required to decide while someone waits."
    ],
    blocks: [
      {
        type: "reading",
        heading: "Rushing Is a Warning",
        question: "Why are they trying to make me hurry?",
        objective:
          "Learn that when someone tries to make you act quickly, it is a warning sign that you should slow down and think.",
        text: "Honest businesses understand that important decisions take time. Scammers often do the opposite — they create deadlines, pressure, or emergencies to keep you from thinking clearly. Whether someone says \"right now,\" \"today only,\" or \"don't wait,\" remember that rushing is a warning sign, not a reason to act faster. Slowing down gives you time to think, verify the situation, and make a better decision."
      },
      {
        type: "tiered",
        title: "Spot the red flag",
        scenario:
          "A caller says, \"If you don't decide within the next five minutes, you'll lose this opportunity.\"",
        question: "What is the biggest warning sign?",
        options: [
          {
            text: "They are trying to rush you.",
            tier: "best",
            feedback:
              "Creating urgency is one of the most common ways scammers stop people from thinking carefully."
          },
          {
            text: "They offered an opportunity.",
            tier: "unsafe",
            feedback: "Opportunities aren't warning signs. Five-minute deadlines are."
          },
          {
            text: "They spoke clearly.",
            tier: "unsafe",
            feedback: "Clear speech tells you nothing about honesty."
          }
        ]
      },
      {
        type: "tiered",
        title: "Choose the safest response",
        scenario: "An email says, \"This is your final warning. Respond immediately.\"",
        question: "What should you do?",
        options: [
          {
            text: "Slow down and verify the message before responding.",
            tier: "best",
            feedback:
              "Important decisions deserve time. A message demanding immediate action should always be verified first."
          },
          {
            text: "Respond immediately.",
            tier: "unsafe",
            feedback:
              "That's precisely the reaction the wording was chosen to produce."
          },
          {
            text: "Delete every email you receive.",
            tier: "unsafe",
            feedback:
              "You don't need to avoid email. Just verify before acting on urgent demands."
          }
        ]
      },
      {
        type: "tiered",
        title: "Apply the lesson",
        scenario:
          "A text message says, \"Claim your prize before midnight or it will be given to someone else.\"",
        question: "What is the warning sign?",
        options: [
          {
            text: "It creates a deadline to pressure you.",
            tier: "best",
            feedback:
              "Deadlines are often used to encourage quick decisions before people have time to think."
          },
          {
            text: "It mentions a prize.",
            tier: "unsafe",
            feedback: "The prize is bait. The midnight cutoff is the pressure."
          },
          {
            text: "It was sent by text.",
            tier: "unsafe",
            feedback:
              "Plenty of real messages arrive by text. The deadline is what stands out."
          }
        ]
      },
      {
        type: "tiered",
        title: "Real-life decision",
        scenario: "Someone tells you, \"I need your answer before we hang up.\"",
        question: "What is the safest response?",
        options: [
          {
            text: "End the conversation and decide later.",
            tier: "best",
            feedback:
              "You are never required to make an important decision while someone waits on the phone."
          },
          {
            text: "Give an answer before the call ends.",
            tier: "unsafe",
            feedback:
              "An answer given under pressure is exactly what they came for."
          },
          {
            text: "Stay on the phone until they convince you.",
            tier: "unsafe",
            feedback:
              "Being convinced isn't the goal — being informed is. You can do that after hanging up."
          }
        ]
      },
      {
        type: "confidence",
        question: "How confident do you feel recognizing when someone is trying to rush you?",
        practice: [
          {
            scenario: "A website says, \"Only two minutes left to claim this offer.\"",
            question: "What should you notice first?",
            options: [
              {
                text: "The short deadline.",
                tier: "best",
                feedback:
                  "Deadlines are commonly used to pressure people into acting quickly."
              },
              {
                text: "The attractive offer.",
                tier: "unsafe",
                feedback: "The offer draws you in; the countdown pushes you."
              },
              {
                text: "The colorful website.",
                tier: "unsafe",
                feedback: "Design proves nothing about honesty."
              }
            ]
          },
          {
            scenario: "Someone says, \"There's no time to think. Just trust me.\"",
            question: "What is the safest habit?",
            options: [
              {
                text: "Slow down before making a decision.",
                tier: "best",
                feedback:
                  "Anyone discouraging you from thinking carefully deserves extra caution."
              },
              {
                text: "Trust them because they sound confident.",
                tier: "unsafe",
                feedback: "Confidence is not evidence."
              },
              {
                text: "Decide immediately.",
                tier: "unsafe",
                feedback: "\"No time to think\" is the warning, not the instruction."
              }
            ]
          }
        ]
      },
      {
        type: "finalboss",
        title: "The expiring offer",
        setup:
          "You receive a phone call about a \"special investment opportunity.\" The caller says the offer is only available today and asks you to make a decision before hanging up.",
        question: "What should you do first?",
        options: [
          {
            text: "End the call and give yourself time to think.",
            tier: "best",
            feedback:
              "You recognized that the deadline was being used to pressure you. Real opportunities can be verified, and honest people will respect your decision to take time before committing."
          },
          {
            text: "Accept the offer before it expires.",
            tier: "unsafe",
            feedback:
              "An investment that can't survive you thinking about it overnight was never a real investment."
          }
        ],
        spotted: ["Unexpected contact", "Pressure to hurry", "Refusing independent verification"]
      }
    ],
    quiz: [],
    complete: {
      title: "Lesson complete!",
      subtitle: "You completed Rushing Is a Warning.",
      habit: "Rushing is a warning sign, not a reason to hurry.",
      warningSign: "\"Right now.\" \"Today only.\" \"Don't wait.\"",
      skills: [
        "Recognized manufactured deadlines",
        "Declined to decide under pressure",
        "Ended a rushed conversation"
      ],
      next: "Strange Payments Are a Warning"
    }
  },

  // ============================================================
  // LESSON 2.4
  // ============================================================
  {
    id: "scam-strange-payments",
    track: "scam",
    phase: 9,
    order: 4,
    lessonNumber: "2.4",
    title: "Strange Payments Are a Warning",
    pathTitle: "Strange Payments",
    badge: "Payment Guard",
    xp: 20,
    goals: [
      "Recognize gift cards, crypto, and wire transfers as warning signs.",
      "Understand why scammers prefer payments that can't be reversed."
    ],
    blocks: [
      {
        type: "reading",
        heading: "Strange Payments Are a Warning",
        question: "Why are they asking me to pay that way?",
        objective:
          "Learn that unusual payment methods are one of the strongest warning signs of a scam.",
        text: "Most honest businesses let you pay using familiar methods, such as a credit card, debit card, check, or payment through your normal account. Scammers often ask for unusual payment methods because they are difficult to trace or reverse. If someone insists on gift cards, cryptocurrency, wire transfers, or asks you to send money in an unusual way, stop and think. The payment method itself can be a warning sign, even if the story sounds believable."
      },
      {
        type: "tiered",
        title: "Spot the red flag",
        scenario:
          "Someone says, \"To pay your bill, please purchase four gift cards and read me the numbers on the back.\"",
        question: "What is the biggest warning sign?",
        options: [
          {
            text: "They want to be paid with gift cards.",
            tier: "best",
            feedback:
              "Gift cards are almost never used to pay legitimate bills. This is one of the most common scam payment methods."
          },
          {
            text: "They asked for four cards.",
            tier: "unsafe",
            feedback:
              "The number doesn't matter. Any bill paid by gift card is a scam."
          },
          {
            text: "They sounded friendly.",
            tier: "unsafe",
            feedback: "Friendliness is part of the delivery, not the warning."
          }
        ]
      },
      {
        type: "tiered",
        title: "Choose the safest response",
        scenario:
          "A caller says your account has a problem and asks you to send cryptocurrency to fix it.",
        question: "What should you do?",
        options: [
          {
            text: "End the conversation and verify the request yourself.",
            tier: "best",
            feedback:
              "A request for cryptocurrency to solve an unexpected problem is a major warning sign."
          },
          {
            text: "Send a small amount first.",
            tier: "unsafe",
            feedback:
              "A small amount is still gone forever, and it marks you as someone who pays."
          },
          {
            text: "Ask which cryptocurrency they prefer.",
            tier: "unsafe",
            feedback:
              "The question to ask isn't which one — it's why any legitimate bill would be paid this way."
          }
        ]
      },
      {
        type: "tiered",
        title: "Apply the lesson",
        scenario: "Someone asks you to wire money immediately to protect your savings.",
        question: "What should you notice first?",
        options: [
          {
            text: "They want an unusual payment method.",
            tier: "best",
            feedback:
              "When someone asks for a payment method you don't normally use, slow down and verify the situation."
          },
          {
            text: "They mentioned your savings.",
            tier: "unsafe",
            feedback:
              "Mentioning your savings is meant to worry you. The wire transfer is the clue."
          },
          {
            text: "They called in the morning.",
            tier: "unsafe",
            feedback: "Timing is irrelevant."
          }
        ]
      },
      {
        type: "tiered",
        title: "Real-life decision",
        scenario:
          "A caller says paying with a gift card is the fastest way to solve your problem.",
        question: "What is the safest response?",
        options: [
          {
            text: "Hang up and verify the situation yourself.",
            tier: "best",
            feedback:
              "The payment method itself is a warning sign. Honest organizations do not solve problems by asking for gift cards."
          },
          {
            text: "Ask if one gift card is enough.",
            tier: "unsafe",
            feedback:
              "Negotiating the amount accepts the premise. No amount is right here."
          },
          {
            text: "Buy the gift cards.",
            tier: "unsafe",
            feedback:
              "Once the numbers are read out, the money is spent and cannot be recovered."
          }
        ]
      },
      {
        type: "confidence",
        question: "How confident do you feel recognizing unusual payment requests?",
        practice: [
          {
            scenario: "An unexpected caller asks you to send money using a wire transfer.",
            question: "What should you remember first?",
            options: [
              {
                text: "Unusual payment methods are warning signs.",
                tier: "best",
                feedback:
                  "Scammers often choose payment methods that are difficult to recover."
              },
              {
                text: "Wire transfers are always faster.",
                tier: "unsafe",
                feedback:
                  "Speed is the appeal for the scammer, because it beats second thoughts."
              },
              {
                text: "They must know what they're doing.",
                tier: "unsafe",
                feedback: "They do. That's the problem."
              }
            ]
          },
          {
            scenario:
              "A message asks you to pay with cryptocurrency because it is \"more secure.\"",
            question: "What is the safest response?",
            options: [
              {
                text: "Verify the request before sending any money.",
                tier: "best",
                feedback:
                  "Never send money simply because someone tells you a payment method is \"better\" or \"safer.\""
              },
              {
                text: "Follow the instructions immediately.",
                tier: "unsafe",
                feedback: "Crypto payments cannot be reversed once sent."
              },
              {
                text: "Send a small payment first.",
                tier: "unsafe",
                feedback:
                  "Small payments are still unrecoverable, and they invite bigger requests."
              }
            ]
          }
        ]
      },
      {
        type: "finalboss",
        title: "The utility bill",
        setup:
          "You receive an unexpected phone call from someone claiming to be your electric company. They say your service will be disconnected today unless you immediately pay using gift cards purchased from a nearby store.",
        question: "What should you do first?",
        options: [
          {
            text: "Hang up and contact your electric company using the official phone number on your bill.",
            tier: "best",
            feedback:
              "You recognized that the unusual payment request was the warning sign. Legitimate utility companies do not ask customers to pay bills with gift cards."
          },
          {
            text: "Purchase the gift cards.",
            tier: "unsafe",
            feedback:
              "No real utility company accepts gift cards. The threat of disconnection was there to stop you noticing that."
          }
        ],
        spotted: [
          "Unexpected contact",
          "Pressure to hurry",
          "Unusual payment method"
        ]
      }
    ],
    quiz: [],
    complete: {
      title: "Lesson complete!",
      subtitle: "You completed Strange Payments Are a Warning.",
      habit: "Unusual payment methods are warning signs. Always verify before paying.",
      warningSign: "Gift cards. Cryptocurrency. Wire transfers.",
      skills: [
        "Recognized an unusual payment request",
        "Refused an unrecoverable payment",
        "Verified through an official number"
      ],
      next: "Always Verify"
    }
  },

  // ============================================================
  // LESSON 2.5
  // ============================================================
  {
    id: "scam-always-verify",
    track: "scam",
    phase: 9,
    order: 5,
    lessonNumber: "2.5",
    title: "Always Verify",
    pathTitle: "Always Verify",
    badge: "Warning Sign Expert",
    xp: 20,
    goals: [
      "Ask \"how can I verify this?\" instead of \"does this look real?\"",
      "Recall all five universal warning signs."
    ],
    blocks: [
      {
        type: "reading",
        heading: "Always Verify",
        question: "How do I know if it's really them?",
        objective:
          "Learn that the safest way to know if something is real is to verify it yourself using trusted contact information.",
        text: "Scammers can copy company logos, create convincing emails, and pretend to be trusted organizations. Even caller ID, email addresses, and official-looking websites can sometimes be faked. Instead of asking, \"Do they look real?\" ask yourself, \"How can I verify this myself?\" Calling a trusted phone number, visiting an official website, or asking someone you trust are simple ways to make sure you're dealing with the real organization."
      },
      {
        type: "tiered",
        title: "Spot the safe choice",
        scenario: "Someone unexpectedly calls and says they work for your bank.",
        question: "What is the safest first step?",
        options: [
          {
            text: "Hang up and call the number on your bank card.",
            tier: "best",
            feedback:
              "Using a trusted phone number lets you choose who you are speaking with."
          },
          {
            text: "Continue listening because they knew your name.",
            tier: "unsafe",
            feedback: "Knowing your name is not verification."
          },
          {
            text: "Ask them to spell the bank's name.",
            tier: "unsafe",
            feedback:
              "Anyone claiming to be from a bank can spell its name. Tests like this prove nothing."
          }
        ]
      },
      {
        type: "tiered",
        title: "Choose the safest response",
        scenario:
          "You receive an email saying there is a problem with one of your accounts.",
        question: "What should you do?",
        options: [
          {
            text: "Visit the company's official website yourself.",
            tier: "best",
            feedback:
              "Starting from the official website is much safer than following unexpected links."
          },
          {
            text: "Reply and ask if it is real.",
            tier: "unsafe",
            feedback:
              "If it's fake, you're asking the scammer whether the scammer is real."
          },
          {
            text: "Click the link in the email.",
            tier: "unsafe",
            feedback:
              "The link goes wherever the sender decided. Choose your own route."
          }
        ]
      },
      {
        type: "tiered",
        title: "Apply the lesson",
        scenario: "A text message asks you to confirm your account by tapping a link.",
        question: "What is the safest choice?",
        options: [
          {
            text: "Open the company's official app or website yourself.",
            tier: "best",
            feedback:
              "Always begin from a trusted source that you chose — not one chosen for you."
          },
          {
            text: "Tap the link because it looks professional.",
            tier: "unsafe",
            feedback: "Looking professional takes minutes to fake."
          },
          {
            text: "Reply to the message.",
            tier: "unsafe",
            feedback: "A reply only ever reaches the sender."
          }
        ]
      },
      {
        type: "tiered",
        title: "Real-life decision",
        scenario:
          "A caller says, \"Don't worry. You don't need to verify me — you can trust me.\"",
        question: "What should you do?",
        options: [
          {
            text: "Verify the caller yourself before continuing.",
            tier: "best",
            feedback:
              "Trust is earned through verification, not through convincing words. Being told not to verify is itself a warning sign."
          },
          {
            text: "Trust them because they sound confident.",
            tier: "unsafe",
            feedback:
              "Someone telling you not to check is the strongest reason to check."
          },
          {
            text: "Give them a small amount of information first.",
            tier: "unsafe",
            feedback:
              "Small pieces of information are used to make the next request sound informed."
          }
        ]
      },
      {
        type: "confidence",
        question: "How confident do you feel about verifying unexpected requests?",
        practice: [
          {
            scenario:
              "Someone unexpectedly calls claiming to work for your insurance company.",
            question: "What is the safest way to verify them?",
            options: [
              {
                text: "Call the phone number on your insurance card.",
                tier: "best",
                feedback:
                  "The safest verification comes from contact information you already trust."
              },
              {
                text: "Continue asking them questions.",
                tier: "unsafe",
                feedback:
                  "They will have answers ready. Questions are not verification."
              },
              {
                text: "Let them verify themselves.",
                tier: "unsafe",
                feedback: "Nobody can verify their own identity to you."
              }
            ]
          },
          {
            scenario: "An email asks you to click a link to update your password.",
            question: "What should you do first?",
            options: [
              {
                text: "Go to the company's official website yourself.",
                tier: "best",
                feedback:
                  "Never let an unexpected message decide where you go online."
              },
              {
                text: "Click the link in the email.",
                tier: "unsafe",
                feedback:
                  "Password pages are the most commonly faked pages of all."
              },
              {
                text: "Reply asking if the email is real.",
                tier: "unsafe",
                feedback: "The sender will always say yes."
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
            note: "They contacted you, so the burden of proof is theirs."
          },
          {
            lesson: "Lesson 2.3 — Rushing Is a Warning",
            note: "Verifying takes a few minutes. Anyone who won't allow that is telling you something."
          },
          {
            lesson: "Lesson 2.4 — Strange Payments",
            note: "Verify before money moves, not after."
          }
        ]
      },
      {
        type: "finalboss",
        title: "The account alert",
        setup:
          "You receive an email that looks like it came from your bank. It uses the bank's logo and your name.",
        messages: [
          {
            from: "Email · Your Bank",
            body:
              "We've detected unusual activity on your account. Click below to review these transactions and secure your account.",
            fakeButton: "Review activity"
          }
        ],
        question: "What should you do first?",
        options: [
          {
            text: "Open your bank's official app or call the number on your bank card to verify the message.",
            tier: "best",
            feedback:
              "The email may look convincing, but appearances are not proof. By choosing to verify the message through an official source, you protected yourself from a common scam."
          },
          {
            text: "Click the link to learn more.",
            tier: "unsafe",
            feedback:
              "The logo and your name cost the sender nothing. The page behind that button is built to collect your login."
          }
        ],
        spotted: ["Unexpected contact", "Refusing independent verification"]
      }
    ],
    quiz: [],
    complete: {
      title: "Phase 9 complete!",
      subtitle: "You completed Always Verify — and all of Phase 9.",
      habit: "Verify first. Trust second.",
      warningSign: "A request that can't be independently checked.",
      skills: [
        "Verified through a source you chose",
        "Ignored an unexpected link",
        "Recognized all five warning signs"
      ],
      learned: [
        "🚩 Unexpected contact",
        "🚩 Requests for secrecy",
        "🚩 Pressure to hurry",
        "🚩 Unusual payment methods",
        "🚩 Refusing to let you verify",
        "You don't have to remember every scam — only these five warning signs."
      ],
      next: "Phase 10: The Masks Scammers Wear"
    }
  }
];

export default scamPhase2Lessons;
